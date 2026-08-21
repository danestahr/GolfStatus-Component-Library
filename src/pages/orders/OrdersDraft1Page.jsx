import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faFolderOpen, faHandHoldingDollar, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import AppSidePanel from '../../components/AppSidePanel.jsx'
import OrderFundsCard from '../../components/orders/OrderFundsCard.jsx'
import OrderListItem from '../../components/orders/OrderListItem.jsx'
import OrderFilterPanel from '../../components/orders/OrderFilterPanel.jsx'
import { orderActionsFor } from '../../components/orders/OrderDetailPanel.jsx'
import OrderDetailPanelDraft1 from '../../components/orders/OrderDetailPanelDraft1.jsx'
import OrderResponsesListDraft1 from '../../components/orders/OrderResponsesListDraft1.jsx'
import OrderFormOverviewDraft1 from '../../components/orders/OrderFormOverviewDraft1.jsx'
import AllOrderResponsesForFormDraft1 from '../../components/orders/AllOrderResponsesForFormDraft1.jsx'
import OrderFormResponseEditFieldsDraft1 from '../../components/orders/OrderFormResponseEditFieldsDraft1.jsx'
import SponsorOverviewPanel from '../../components/orders-forms/SponsorOverviewPanel.jsx'
import TeamOverviewPanel from '../../components/orders-forms/TeamOverviewPanel.jsx'
import { availableFunds, orderStats, orders as initialOrders } from '../../data/mockOrders.js'
import { sponsors } from '../../data/mockSponsors.js'
import { registeredTeams } from '../../data/mockTeams.js'
import './OrdersDraft1Page.scss'

const EMPTY_FILTERS = { status: null, activatedOn: '', deactivatedOn: '' }

// The Orders & Payouts page, reached from the "Orders & Payouts" tile on
// the Orders and Forms hub.
export default function OrdersDraft1Page() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const [orderList, setOrderList] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [editingResponse, setEditingResponse] = useState(null)
  const [viewingFormName, setViewingFormName] = useState(null)
  const [viewingFormQuestion, setViewingFormQuestion] = useState(null)
  const [viewingSponsor, setViewingSponsor] = useState(null)
  const [viewingTeam, setViewingTeam] = useState(null)
  const [responsesPlayerFilter, setResponsesPlayerFilter] = useState(null)
  const [responsesCategory, setResponsesCategory] = useState(null)

  const selectedOrder = orderList.find(o => o.id === id) ?? null
  const viewingAllResponses = location.pathname.endsWith('/responses')

  // Scroll position of the AppSidePanel body, kept per "screen" so a forward
  // navigation (Details -> Responses -> Form Responses -> Edit) always opens
  // at the top, while stepping back with the panel's chevron restores
  // wherever that screen was scrolled to before — the body div itself never
  // unmounts across these content swaps, so its scrollTop otherwise just
  // carries over untouched from whatever screen came before it.
  const panelBodyRef = useRef(null)
  const scrollPositions = useRef({})
  const pendingScrollAction = useRef(null)

  function currentScreenKey() {
    if (viewingSponsor) return `sponsor:${viewingSponsor.id}`
    if (viewingTeam) return `team:${viewingTeam.id}`
    if (editingResponse) return `edit:${editingResponse.orderId}`
    if (viewingFormQuestion) return `formQuestion:${viewingFormQuestion.formName}:${viewingFormQuestion.question}`
    if (viewingFormName) return `form:${viewingFormName}`
    if (viewingAllResponses) return `responses:${id}`
    if (selectedOrder) return `details:${id}`
    return 'none'
  }

  function saveCurrentScroll() {
    if (panelBodyRef.current) {
      scrollPositions.current[currentScreenKey()] = panelBodyRef.current.scrollTop
    }
  }

  const screenKey = currentScreenKey()
  useEffect(() => {
    const body = panelBodyRef.current
    if (!body) return
    if (pendingScrollAction.current === 'restore') {
      body.scrollTop = scrollPositions.current[screenKey] ?? 0
    } else {
      body.scrollTop = 0
    }
    pendingScrollAction.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orderList.filter(order => {
      if (query) {
        const matches =
          order.buyerName.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query) ||
          order.phone.toLowerCase().includes(query)
        if (!matches) return false
      }
      if (filters.status && order.status !== filters.status) return false
      if (filters.activatedOn && order.date < filters.activatedOn) return false
      if (filters.deactivatedOn && order.date > filters.deactivatedOn) return false
      return true
    })
  }, [orderList, search, filters])

  const activeFilterCount = (filters.status ? 1 : 0) + (filters.activatedOn ? 1 : 0) + (filters.deactivatedOn ? 1 : 0)

  function closeDetailPanel() {
    setEditingResponse(null)
    setViewingFormName(null)
    setViewingFormQuestion(null)
    setViewingSponsor(null)
    setViewingTeam(null)
    setResponsesPlayerFilter(null)
    setResponsesCategory(null)
    navigate('/orders-draft-1')
  }

  function openAllResponses() {
    saveCurrentScroll()
    setResponsesPlayerFilter(null)
    setResponsesCategory(null)
    navigate(`/orders-draft-1/${id}/responses`)
  }

  function closeAllResponses() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    navigate(`/orders-draft-1/${id}`)
  }

  // The "| View ___" link on a form section — whether reached from a single
  // order's response list (see VIEW_LINK_LABEL in OrderResponsesListDraft1.jsx)
  // or from the cross-order "view every order's answer to this question"
  // breakdown (see AllOrderResponsesForFormDraft1.jsx) — a team/player-
  // fillLevel form belongs to a registered team and a sponsor-fillLevel form
  // belongs to a sponsor (matched by their `orderId`, which may be a
  // DIFFERENT order than whichever one is currently selected here — a
  // cross-order group can belong to any order). Rather than navigating away
  // to the Teams & Players / Sponsors pages, that overview opens as an
  // overlay ON TOP of wherever the user currently is (Order Details, Form
  // Responses, or the cross-order breakdown) — same pattern as
  // SponsorOverviewPanel / TeamOverviewPanel opening on top of an order
  // there — so the back chevron un-covers this same screen again instead of
  // leaving the page. If somehow no matching entity exists, it falls back to
  // that page's bare list; any other fillLevel still falls back to the
  // cross-order breakdown. `packageName` disambiguates the rare order that
  // bundles two separate teams (see the ord-1005 comment in mockTeams.js) —
  // falls back to matching by orderId alone whenever a caller doesn't have
  // a packageName to pass, or the order only has the one team anyway.
  function viewEntityAcrossOrders(orderId, fillLevel, packageName) {
    if (fillLevel === 'sponsor') {
      const sponsor = sponsors.find(s => s.orderId === orderId)
      if (sponsor) {
        saveCurrentScroll()
        setViewingSponsor(sponsor)
      } else {
        navigate('/orders-forms/sponsors')
      }
    } else if (fillLevel === 'team' || fillLevel === 'player') {
      const team =
        registeredTeams.find(t => t.orderId === orderId && t.packageName === packageName) ??
        registeredTeams.find(t => t.orderId === orderId)
      if (team) {
        saveCurrentScroll()
        setViewingTeam(team)
      } else {
        navigate('/orders-forms/teams')
      }
    }
  }

  function viewFormAcrossOrders(formName, packageName) {
    const fillLevel = selectedOrder?.formResponses.find(
      entry => entry.formName === formName && entry.packageName === packageName
    )?.fillLevel
    if (fillLevel === 'sponsor' || fillLevel === 'team' || fillLevel === 'player') {
      viewEntityAcrossOrders(selectedOrder.id, fillLevel, packageName)
    } else {
      saveCurrentScroll()
      setViewingFormName(formName)
    }
  }

  function viewFormQuestion(formName, question) {
    saveCurrentScroll()
    setViewingFormQuestion({ formName, question })
  }

  function viewOrderDetails(orderId) {
    saveCurrentScroll()
    setEditingResponse(null)
    setViewingFormName(null)
    setViewingFormQuestion(null)
    setViewingSponsor(null)
    setViewingTeam(null)
    setResponsesPlayerFilter(null)
    setResponsesCategory(null)
    navigate(`/orders-draft-1/${orderId}`)
  }

  // Nav rows on the overlaid Sponsor/Team Overview panel — both link back
  // into this same order's own Order Details / Form Responses screens
  // rather than anywhere else, since the sponsor/team is always the one
  // attached to the order already open underneath. The "Form Responses"
  // rows land pre-filtered to that entity's own category (see
  // OrderResponsesFilterNav.jsx's Team/Sponsor/Players tabs) so an order
  // that bundles more than one occurrence type doesn't show, say, a
  // sponsor's answers mixed in when you got here from the team.
  function viewSponsorOrderDetails() {
    saveCurrentScroll()
    setViewingSponsor(null)
    if (viewingAllResponses) navigate(`/orders-draft-1/${id}`)
  }

  function viewSponsorFormResponses() {
    saveCurrentScroll()
    setViewingSponsor(null)
    setResponsesPlayerFilter(null)
    setResponsesCategory('sponsor')
    if (!viewingAllResponses) navigate(`/orders-draft-1/${id}/responses`)
  }

  function viewTeamOrderDetails() {
    saveCurrentScroll()
    setViewingTeam(null)
    if (viewingAllResponses) navigate(`/orders-draft-1/${id}`)
  }

  function viewTeamFormResponses() {
    saveCurrentScroll()
    setViewingTeam(null)
    setResponsesPlayerFilter(null)
    setResponsesCategory('team')
    if (!viewingAllResponses) navigate(`/orders-draft-1/${id}/responses`)
  }

  // The Team Overview player card's "Form Responses" button — same
  // overlay-closing pattern as viewTeamOrderDetails/viewSponsorFormResponses
  // above, but lands on Form Responses pre-filtered to just this player.
  function viewTeamPlayerResponses(player) {
    saveCurrentScroll()
    setViewingTeam(null)
    setResponsesPlayerFilter(player.name)
    setResponsesCategory(null)
    if (!viewingAllResponses) navigate(`/orders-draft-1/${id}/responses`)
  }

  function handlePanelBack() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    if (viewingSponsor) {
      setViewingSponsor(null)
    } else if (viewingTeam) {
      setViewingTeam(null)
    } else if (editingResponse) {
      setEditingResponse(null)
    } else if (viewingFormQuestion) {
      setViewingFormQuestion(null)
    } else if (viewingFormName) {
      setViewingFormName(null)
    } else if (viewingAllResponses) {
      closeAllResponses()
    }
  }

  function setOrderStatus(orderId, status) {
    setOrderList(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)))
    closeDetailPanel()
  }

  function saveResponseAnswer(orderId, responseIndex, answerIndex, value) {
    setOrderList(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              formResponses: o.formResponses.map((entry, i) =>
                i === responseIndex
                  ? {
                      ...entry,
                      answers: entry.answers.map((a, j) =>
                        j === answerIndex ? { ...a, value, editedAt: new Date().toISOString() } : a
                      ),
                    }
                  : entry
              ),
            }
          : o
      )
    )
  }

  // `entries` is every question in the form occurrence being edited together
  // (see OrderFormResponses.jsx's single "Edit All" per form card) — each
  // becomes its own group here so they can all be saved as one unit.
  function startEditingResponse(orderId, entries) {
    saveCurrentScroll()
    setEditingResponse({
      orderId,
      groups: entries.map(({ entry, entryIndex }) => ({
        responseIndex: entryIndex,
        formName: entry.formName,
        question: entry.question,
        answers: entry.answers,
        originalAnswers: entry.answers,
      })),
    })
  }

  function updateEditingAnswer(groupIndex, answerIndex, value) {
    setEditingResponse(prev => ({
      ...prev,
      groups: prev.groups.map((group, gi) =>
        gi === groupIndex
          ? { ...group, answers: group.answers.map((a, ai) => (ai === answerIndex ? { ...a, value } : a)) }
          : group
      ),
    }))
  }

  function cancelEditingResponse() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    setEditingResponse(null)
  }

  function saveEditingResponse() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    const { orderId, groups } = editingResponse
    setOrderList(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o
        return {
          ...o,
          formResponses: o.formResponses.map((entry, i) => {
            const group = groups.find(g => g.responseIndex === i)
            if (!group) return entry
            const stampedAnswers = group.answers.map((answer, ai) =>
              answer.value !== group.originalAnswers[ai].value ? { ...answer, editedAt: new Date().toISOString() } : answer
            )
            return { ...entry, answers: stampedAnswers }
          }),
        }
      })
    )
    setEditingResponse(null)
  }

  return (
    <div className="ord-d1-page-bg">
      <GSActionBar
        type="x-large-pad H3"
        header="Orders & Payouts — Draft 1"
        pageActions={[
          { buttonTitle: 'Payouts', actionIcon: faHandHoldingDollar, type: 'black', actionClick: () => {} },
          { buttonTitle: 'Documents', actionIcon: faFolderOpen, type: 'light-grey', actionClick: () => {} },
        ]}
      />

      <div className="ord-d1-page-list">
        <div className="ord-d1-col-scroll">
          <div className="ord-d1-funds-wrap">
            <OrderFundsCard funds={availableFunds} stats={orderStats} />
          </div>

          <div className="ord-d1-list-sticky">
            <div className="ord-d1-search-row">
              <GSinput
                leftIcon={faMagnifyingGlass}
                rightIcon={search ? faXmark : null}
                rightIconClick={() => setSearch('')}
                placeholder="Search Orders..."
                textValue={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button
                type="button"
                className={`ord-d1-filter-toggle${activeFilterCount ? ' has-filters' : ''}`}
                onClick={() => setFilterOpen(true)}
                aria-label="Filter orders"
              >
                <FontAwesomeIcon icon={faBars} />
                {activeFilterCount > 0 && <span className="ord-d1-filter-badge">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          <div className="ord-d1-list-body">
            {filteredOrders.length === 0 ? (
              <div className="ord-d1-empty">No orders match your search.</div>
            ) : (
              filteredOrders.map(order => (
                <OrderListItem
                  key={order.id}
                  order={order}
                  onClick={() => navigate(`/orders-draft-1/${order.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <OrderFilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      <AppSidePanel
        isOpen={!!selectedOrder}
        onClose={closeDetailPanel}
        onBack={
          viewingSponsor || viewingTeam || editingResponse || viewingFormQuestion || viewingFormName || viewingAllResponses
            ? handlePanelBack
            : undefined
        }
        bodyRef={panelBodyRef}
        title={
          viewingSponsor
            ? 'Sponsor Overview'
            : viewingTeam
            ? 'Team Overview'
            : editingResponse
            ? `Edit ${editingResponse.groups[0]?.formName ?? ''}`
            : viewingFormQuestion
            ? viewingFormQuestion.question
            : viewingFormName
            ? viewingFormName
            : viewingAllResponses
            ? 'Form Responses'
            : 'Order Details'
        }
        actions={
          viewingSponsor || viewingTeam
            ? [{ name: 'Delete', type: 'red', action: () => {} }]
            : editingResponse
            ? [
                { name: 'Save', type: 'black', action: saveEditingResponse },
                { name: 'Cancel', type: 'light-grey', action: cancelEditingResponse },
              ]
            : viewingFormQuestion
            ? []
            : viewingFormName
            ? []
            : viewingAllResponses
            ? []
            : selectedOrder
            ? orderActionsFor(selectedOrder, {
                onMarkPaid: () => setOrderStatus(selectedOrder.id, 'paid'),
                onVoid: () => setOrderStatus(selectedOrder.id, 'void'),
                onRefund: () => setOrderStatus(selectedOrder.id, 'refunded'),
              })
            : []
        }
      >
        {viewingSponsor ? (
          <SponsorOverviewPanel
            sponsor={viewingSponsor}
            onViewOrderDetails={viewSponsorOrderDetails}
            onViewFormResponses={viewSponsorFormResponses}
          />
        ) : viewingTeam ? (
          <TeamOverviewPanel
            team={viewingTeam}
            onViewOrderDetails={viewTeamOrderDetails}
            onViewFormResponses={viewTeamFormResponses}
            onViewPlayerResponses={viewTeamPlayerResponses}
          />
        ) : editingResponse ? (
          <OrderFormResponseEditFieldsDraft1
            groups={editingResponse.groups}
            onChangeAnswer={updateEditingAnswer}
            onSubmit={saveEditingResponse}
          />
        ) : viewingFormQuestion ? (
          <AllOrderResponsesForFormDraft1
            key={`${viewingFormQuestion.formName}-${viewingFormQuestion.question}`}
            orders={orderList}
            formName={viewingFormQuestion.formName}
            initialQuestion={viewingFormQuestion.question}
            onViewOrder={viewOrderDetails}
            onViewEntity={viewEntityAcrossOrders}
          />
        ) : viewingFormName ? (
          <OrderFormOverviewDraft1
            orders={orderList}
            formName={viewingFormName}
            onViewQuestion={question => viewFormQuestion(viewingFormName, question)}
          />
        ) : viewingAllResponses ? (
          selectedOrder && (
            <OrderResponsesListDraft1
              order={selectedOrder}
              onEditResponses={entries => startEditingResponse(selectedOrder.id, entries)}
              onSaveAnswer={(responseIndex, answerIndex, value) =>
                saveResponseAnswer(selectedOrder.id, responseIndex, answerIndex, value)
              }
              onViewFormAcrossOrders={viewFormAcrossOrders}
              initialSelectedName={responsesPlayerFilter}
              initialCategory={responsesCategory}
            />
          )
        ) : (
          selectedOrder && (
            <OrderDetailPanelDraft1 order={selectedOrder} onViewAllResponses={openAllResponses} />
          )
        )}
      </AppSidePanel>
    </div>
  )
}
