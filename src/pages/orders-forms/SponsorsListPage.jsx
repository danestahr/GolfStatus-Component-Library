import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { faPlus, faList, faFolderOpen } from '@fortawesome/free-solid-svg-icons'

import AppSidePanel from '../../components/AppSidePanel.jsx'
import EntityListPage from '../../components/orders-forms/EntityListPage.jsx'
import SponsorTierSection from '../../components/orders-forms/SponsorTierSection.jsx'
import SponsorOverviewPanel from '../../components/orders-forms/SponsorOverviewPanel.jsx'
import { orderActionsFor } from '../../components/orders/OrderDetailPanel.jsx'
import OrderDetailPanelDraft1 from '../../components/orders/OrderDetailPanelDraft1.jsx'
import OrderResponsesListDraft1 from '../../components/orders/OrderResponsesListDraft1.jsx'
import OrderFormOverviewDraft1 from '../../components/orders/OrderFormOverviewDraft1.jsx'
import AllOrderResponsesForFormDraft1 from '../../components/orders/AllOrderResponsesForFormDraft1.jsx'
import OrderFormResponseEditFieldsDraft1 from '../../components/orders/OrderFormResponseEditFieldsDraft1.jsx'
import { sponsors as initialSponsors, SPONSOR_TIERS } from '../../data/mockSponsors.js'
import { registeredTeams } from '../../data/mockTeams.js'
import { orders as initialOrders } from '../../data/mockOrders.js'
import './SponsorsListPage.scss'

const UNASSIGNED_TIER = 'Sponsors'
const TIER_KEYS = [...SPONSOR_TIERS, UNASSIGNED_TIER]

function groupByTier(sponsorList) {
  const groups = Object.fromEntries(TIER_KEYS.map(tier => [tier, []]))
  sponsorList.forEach(sponsor => {
    groups[sponsor.tier ?? UNASSIGNED_TIER].push(sponsor.id)
  })
  return groups
}

// The Sponsor Overview panel's Order Details / Form Responses rows open the
// sponsor's linked order (see mockSponsors.js's `orderId`) right in this same
// panel, reusing the exact same order side-panel screens as Orders & Payouts
// (OrdersDraft1Page.jsx) — order details, form responses, editing, and the
// cross-order "view this form's other responses" drill-down all work the
// same way here, just without changing the page behind the panel.
export default function SponsorsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [tierOrder, setTierOrder] = useState(() => groupByTier(initialSponsors))
  // Arriving from the Orders & Payouts "View Sponsor" link (see
  // OrdersDraft1Page.jsx's viewFormAcrossOrders) opens straight to that
  // sponsor's overview panel instead of the bare list.
  const [selectedSponsor, setSelectedSponsor] = useState(() => {
    const sponsorId = location.state?.sponsorId
    return sponsorId ? initialSponsors.find(s => s.id === sponsorId) ?? null : null
  })
  const [orderList, setOrderList] = useState(initialOrders)
  const [viewingOrderId, setViewingOrderId] = useState(null)
  const [viewingOrderResponses, setViewingOrderResponses] = useState(false)
  const [responsesOpenedDirectly, setResponsesOpenedDirectly] = useState(false)
  const [responsesCategory, setResponsesCategory] = useState(null)
  const [editingResponse, setEditingResponse] = useState(null)
  const [viewingFormName, setViewingFormName] = useState(null)
  const [viewingFormQuestion, setViewingFormQuestion] = useState(null)
  const [showSponsorOverview, setShowSponsorOverview] = useState(false)

  // Scroll position of the AppSidePanel body, kept per "screen" so a forward
  // navigation always opens at the top, while stepping back with the panel's
  // chevron restores wherever that screen was scrolled to before — the body
  // div itself never unmounts across these content swaps, so its scrollTop
  // otherwise just carries over untouched from whatever screen came before
  // it (see OrdersDraft1Page.jsx, where this same pattern originates).
  const panelBodyRef = useRef(null)
  const scrollPositions = useRef({})
  const pendingScrollAction = useRef(null)

  function currentScreenKey() {
    if (showSponsorOverview) return `sponsor-overlay:${selectedSponsor?.id}`
    if (editingResponse) return `edit:${editingResponse.orderId}`
    if (viewingFormQuestion) return `formQuestion:${viewingFormQuestion.formName}:${viewingFormQuestion.question}`
    if (viewingFormName) return `form:${viewingFormName}`
    if (viewingOrderResponses) return `responses:${viewingOrderId}`
    if (viewingOrderId) return `details:${viewingOrderId}`
    return `sponsor:${selectedSponsor?.id}`
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

  const sponsorsById = useMemo(
    () => Object.fromEntries(initialSponsors.map(sponsor => [sponsor.id, sponsor])),
    []
  )

  const viewingOrder = orderList.find(o => o.id === viewingOrderId) ?? null

  const query = search.trim().toLowerCase()
  const matchesSearch = sponsor =>
    !query ||
    sponsor.sponsorName.toLowerCase().includes(query) ||
    sponsor.contactName.toLowerCase().includes(query) ||
    sponsor.email.toLowerCase().includes(query)

  const visibleTiers = TIER_KEYS.map(tier => ({
    tier,
    sponsors: tierOrder[tier].map(id => sponsorsById[id]).filter(matchesSearch),
  })).filter(group => group.sponsors.length > 0)

  function reorderWithinTier(tier, fromIndex, toIndex) {
    setTierOrder(prev => {
      const ids = [...prev[tier]]
      const [movedId] = ids.splice(fromIndex, 1)
      ids.splice(toIndex, 0, movedId)
      return { ...prev, [tier]: ids }
    })
  }

  function resetOrderView() {
    setViewingOrderId(null)
    setViewingOrderResponses(false)
    setResponsesOpenedDirectly(false)
    setResponsesCategory(null)
    setEditingResponse(null)
    setViewingFormName(null)
    setViewingFormQuestion(null)
    setShowSponsorOverview(false)
  }

  function closeSponsorPanel() {
    setSelectedSponsor(null)
    resetOrderView()
  }

  // The "View Sponsor" / "View Team" link on a Sponsor Details / Player
  // Details form section — whether reached from a single order's response
  // list (see VIEW_LINK_LABEL in OrderResponsesListDraft1.jsx) or from the
  // cross-order "view every order's answer to this question" breakdown (see
  // AllOrderResponsesForFormDraft1.jsx) — always resolves to the SPECIFIC
  // sponsor that order belongs to (matched by that sponsor's own `orderId`),
  // never just whichever sponsor panel happens to already be open: a
  // cross-order group can belong to a different sponsor entirely. It opens
  // as an overlay ON TOP of wherever the user currently is (Order Details,
  // Form Responses, or the cross-order breakdown), without touching that
  // screen's own state, so the back chevron un-covers it again afterward
  // instead of resetting to a screen the user never asked to leave. A
  // team/player-fillLevel form instead belongs to whichever registered team
  // shares this same order (see that team's own `orderId` in mockTeams.js) —
  // navigating there passes teamId through location.state so the Teams page
  // opens straight to that team's overview, mirroring how arriving here via
  // a sponsor's own orderId opens straight to this panel. `packageName`
  // disambiguates the rare order that bundles two separate teams (see the
  // ord-1005 comment in mockTeams.js) — falls back to matching by orderId
  // alone whenever a caller doesn't have a packageName to pass, or the
  // order only has the one team anyway.
  function viewEntityAcrossOrders(orderId, fillLevel, packageName) {
    if (fillLevel === 'team' || fillLevel === 'player') {
      const team =
        registeredTeams.find(t => t.orderId === orderId && t.packageName === packageName) ??
        registeredTeams.find(t => t.orderId === orderId)
      navigate('/orders-forms/teams', team ? { state: { teamId: team.id } } : undefined)
      return
    }
    const sponsor = initialSponsors.find(s => s.orderId === orderId)
    if (!sponsor) {
      openOrderDetails(orderId)
      return
    }
    saveCurrentScroll()
    setSelectedSponsor(sponsor)
    setShowSponsorOverview(true)
  }

  function viewFormEntity(formName, packageName) {
    const fillLevel = viewingOrder?.formResponses.find(
      entry => entry.formName === formName && entry.packageName === packageName
    )?.fillLevel
    if (fillLevel === 'sponsor' || fillLevel === 'team' || fillLevel === 'player') {
      viewEntityAcrossOrders(viewingOrder.id, fillLevel, packageName)
    } else {
      saveCurrentScroll()
      setViewingFormName(formName)
    }
  }

  function openOrderDetails(orderId) {
    saveCurrentScroll()
    setEditingResponse(null)
    setViewingFormName(null)
    setViewingFormQuestion(null)
    setShowSponsorOverview(false)
    setViewingOrderId(orderId)
    setViewingOrderResponses(false)
    setResponsesCategory(null)
  }

  // `direct` — reached straight from the Sponsor Overview's "Form Responses"
  // row rather than drilling in through Order Details — so the back chevron
  // should return straight to the overview instead of stopping at a details
  // screen the user never actually saw. `category` pre-filters Form
  // Responses to just this sponsor so an order that also bundles a team
  // registration doesn't show that team's forms mixed in too (see
  // OrderResponsesFilterNav.jsx's Team/Sponsor/Players tabs).
  function openOrderResponses(orderId, { direct = false, category = null } = {}) {
    saveCurrentScroll()
    setEditingResponse(null)
    setViewingFormName(null)
    setViewingFormQuestion(null)
    setShowSponsorOverview(false)
    setViewingOrderId(orderId)
    setViewingOrderResponses(true)
    setResponsesOpenedDirectly(direct)
    setResponsesCategory(category)
  }

  function handlePanelBack() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    if (showSponsorOverview) {
      setShowSponsorOverview(false)
    } else if (editingResponse) {
      setEditingResponse(null)
    } else if (viewingFormQuestion) {
      setViewingFormQuestion(null)
    } else if (viewingFormName) {
      setViewingFormName(null)
    } else if (viewingOrderResponses) {
      setViewingOrderResponses(false)
      if (responsesOpenedDirectly) setViewingOrderId(null)
    } else if (viewingOrderId) {
      setViewingOrderId(null)
    }
  }

  function setOrderStatus(orderId, status) {
    setOrderList(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)))
    setViewingOrderId(null)
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

  const screenTitle = showSponsorOverview
    ? 'Sponsor Overview'
    : editingResponse
    ? `Edit ${editingResponse.groups[0]?.formName ?? ''}`
    : viewingFormQuestion
    ? viewingFormQuestion.question
    : viewingFormName
    ? viewingFormName
    : viewingOrderResponses
    ? 'Form Responses'
    : viewingOrder
    ? 'Order Details'
    : 'Sponsor Overview'

  const screenActions = showSponsorOverview
    ? [{ name: 'Delete', type: 'red', action: () => {} }]
    : editingResponse
    ? [
        { name: 'Save', type: 'black', action: saveEditingResponse },
        { name: 'Cancel', type: 'light-grey', action: cancelEditingResponse },
      ]
    : viewingFormQuestion || viewingFormName || viewingOrderResponses
    ? []
    : viewingOrder
    ? orderActionsFor(viewingOrder, {
        onMarkPaid: () => setOrderStatus(viewingOrder.id, 'paid'),
        onVoid: () => setOrderStatus(viewingOrder.id, 'void'),
        onRefund: () => setOrderStatus(viewingOrder.id, 'refunded'),
      })
    : [{ name: 'Delete', type: 'red', action: () => {} }]

  return (
    <>
      <EntityListPage
        className="spn-page"
        header="Sponsors"
        pageActions={[
          { buttonTitle: 'Add Sponsor', actionIcon: faPlus, type: 'black', actionClick: () => {} },
          { buttonTitle: 'Sponsor Tiers', actionIcon: faList, type: 'light-grey', actionClick: () => {} },
          { buttonTitle: 'Documents', actionIcon: faFolderOpen, type: 'light-grey', actionClick: () => {} },
        ]}
        searchPlaceholder="Search Sponsors..."
        search={search}
        onSearchChange={setSearch}
        emptyMessage="No sponsors match your search."
      >
        {visibleTiers.length === 0 ? (
          <div className="efp-empty">No sponsors match your search.</div>
        ) : (
          visibleTiers.map(({ tier, sponsors }) => (
            <SponsorTierSection
              key={tier}
              tierName={tier}
              sponsors={sponsors}
              onReorder={(fromIndex, toIndex) => reorderWithinTier(tier, fromIndex, toIndex)}
              onEditTier={() => {}}
              onSelectSponsor={setSelectedSponsor}
            />
          ))
        )}
      </EntityListPage>

      <AppSidePanel
        className={showSponsorOverview || !viewingOrder ? 'spn-overview-panel' : undefined}
        isOpen={!!selectedSponsor}
        onClose={closeSponsorPanel}
        onBack={
          showSponsorOverview || viewingOrderId || editingResponse || viewingFormQuestion || viewingFormName
            ? handlePanelBack
            : undefined
        }
        bodyRef={panelBodyRef}
        title={screenTitle}
        actions={screenActions}
      >
        {showSponsorOverview ? (
          selectedSponsor && (
            <SponsorOverviewPanel
              sponsor={selectedSponsor}
              onViewOrderDetails={() => openOrderDetails(selectedSponsor.orderId)}
              onViewFormResponses={() => openOrderResponses(selectedSponsor.orderId, { direct: true, category: 'sponsor' })}
            />
          )
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
            onViewOrder={openOrderDetails}
            onViewEntity={viewEntityAcrossOrders}
          />
        ) : viewingFormName ? (
          <OrderFormOverviewDraft1
            orders={orderList}
            formName={viewingFormName}
            onViewQuestion={question => {
              saveCurrentScroll()
              setViewingFormQuestion({ formName: viewingFormName, question })
            }}
          />
        ) : viewingOrderResponses ? (
          viewingOrder && (
            <OrderResponsesListDraft1
              order={viewingOrder}
              onEditResponses={entries => startEditingResponse(viewingOrder.id, entries)}
              onSaveAnswer={(responseIndex, answerIndex, value) =>
                saveResponseAnswer(viewingOrder.id, responseIndex, answerIndex, value)
              }
              onViewFormAcrossOrders={viewFormEntity}
              initialCategory={responsesCategory}
            />
          )
        ) : viewingOrder ? (
          <OrderDetailPanelDraft1 order={viewingOrder} onViewAllResponses={() => openOrderResponses(viewingOrder.id)} />
        ) : (
          selectedSponsor && (
            <SponsorOverviewPanel
              sponsor={selectedSponsor}
              onViewOrderDetails={() => openOrderDetails(selectedSponsor.orderId)}
              onViewFormResponses={() => openOrderResponses(selectedSponsor.orderId, { direct: true, category: 'sponsor' })}
            />
          )
        )}
      </AppSidePanel>
    </>
  )
}
