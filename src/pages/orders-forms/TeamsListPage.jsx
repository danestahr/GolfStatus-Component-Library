import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { faPlus, faCircleArrowUp, faFolderOpen } from '@fortawesome/free-solid-svg-icons'

import AppSidePanel from '../../components/AppSidePanel.jsx'
import EntityListPage from '../../components/orders-forms/EntityListPage.jsx'
import TeamRosterSection from '../../components/orders-forms/TeamRosterSection.jsx'
import RegisteredTeamsSection from '../../components/orders-forms/RegisteredTeamsSection.jsx'
import TeamOverviewPanel from '../../components/orders-forms/TeamOverviewPanel.jsx'
import { orderActionsFor } from '../../components/orders/OrderDetailPanel.jsx'
import OrderDetailPanelDraft1 from '../../components/orders/OrderDetailPanelDraft1.jsx'
import OrderResponsesListDraft1 from '../../components/orders/OrderResponsesListDraft1.jsx'
import OrderFormOverviewDraft1 from '../../components/orders/OrderFormOverviewDraft1.jsx'
import AllOrderResponsesForFormDraft1 from '../../components/orders/AllOrderResponsesForFormDraft1.jsx'
import OrderFormResponseEditFieldsDraft1 from '../../components/orders/OrderFormResponseEditFieldsDraft1.jsx'
import { unassignedPlayers, waitlistEntries, registeredTeams } from '../../data/mockTeams.js'
import { sponsors } from '../../data/mockSponsors.js'
import { orders as initialOrders } from '../../data/mockOrders.js'
import './TeamsListPage.scss'

// The Team Overview panel's Order Details row opens that team's linked
// order (see mockTeams.js's `orderId`) right in this same panel, reusing
// the exact same order side-panel screens as Orders & Payouts and the
// Sponsors page — order details, form responses, editing, and the
// cross-order "view this form's other responses" drill-down all work the
// same way here, just without changing the page behind the panel.
export default function TeamsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  // Arriving from a sponsor's order (see SponsorsListPage.jsx's
  // viewFormEntity) via a shared order's "View Team" link opens straight to
  // that team's overview panel instead of the bare list.
  const [selectedTeam, setSelectedTeam] = useState(() => {
    const teamId = location.state?.teamId
    return teamId ? registeredTeams.find(t => t.id === teamId) ?? null : null
  })
  const [orderList, setOrderList] = useState(initialOrders)
  const [viewingOrderId, setViewingOrderId] = useState(null)
  const [viewingOrderResponses, setViewingOrderResponses] = useState(false)
  const [responsesOpenedDirectly, setResponsesOpenedDirectly] = useState(false)
  const [responsesPlayerFilter, setResponsesPlayerFilter] = useState(null)
  const [responsesCategory, setResponsesCategory] = useState(null)
  const [editingResponse, setEditingResponse] = useState(null)
  const [viewingFormName, setViewingFormName] = useState(null)
  const [viewingFormQuestion, setViewingFormQuestion] = useState(null)
  const [showTeamOverview, setShowTeamOverview] = useState(false)

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
    if (showTeamOverview) return `team-overlay:${selectedTeam?.id}`
    if (editingResponse) return `edit:${editingResponse.orderId}`
    if (viewingFormQuestion) return `formQuestion:${viewingFormQuestion.formName}:${viewingFormQuestion.question}`
    if (viewingFormName) return `form:${viewingFormName}`
    if (viewingOrderResponses) return `responses:${viewingOrderId}`
    if (viewingOrderId) return `details:${viewingOrderId}`
    return `team:${selectedTeam?.id}`
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

  const viewingOrder = orderList.find(o => o.id === viewingOrderId) ?? null

  const query = search.trim().toLowerCase()
  const matchesPerson = person =>
    !query ||
    person.name.toLowerCase().includes(query) ||
    person.email.toLowerCase().includes(query) ||
    person.phone.toLowerCase().includes(query)
  const matchesTeam = team =>
    !query ||
    team.teamName.toLowerCase().includes(query) ||
    team.code.toLowerCase().includes(query) ||
    team.players.some(player => player.name.toLowerCase().includes(query))

  const visibleUnassigned = useMemo(
    () => unassignedPlayers.filter(matchesPerson),
    [query]
  )
  const visibleWaitlist = useMemo(
    () => waitlistEntries.filter(matchesPerson),
    [query]
  )
  const visibleTeams = useMemo(
    () => registeredTeams.filter(matchesTeam),
    [query]
  )

  const checkedInCount = registeredTeams.filter(team => team.checkedIn).length
  const disqualifiedCount = registeredTeams.filter(team => team.disqualified).length

  const noResults = visibleUnassigned.length === 0 && visibleWaitlist.length === 0 && visibleTeams.length === 0

  function resetOrderView() {
    setViewingOrderId(null)
    setViewingOrderResponses(false)
    setResponsesOpenedDirectly(false)
    setResponsesPlayerFilter(null)
    setEditingResponse(null)
    setViewingFormName(null)
    setViewingFormQuestion(null)
    setShowTeamOverview(false)
  }

  function closeTeamPanel() {
    setSelectedTeam(null)
    resetOrderView()
  }

  // The "View Team" / "View Sponsor" link on a Player Details / Sponsor
  // Details form section — whether reached from a single order's response
  // list (see VIEW_LINK_LABEL in OrderResponsesListDraft1.jsx) or from the
  // cross-order "view every order's answer to this question" breakdown (see
  // AllOrderResponsesForFormDraft1.jsx) — always resolves to the SPECIFIC
  // team that order belongs to (matched by that team's own `orderId` in
  // mockTeams.js), never just whichever team panel happens to already be
  // open: a cross-order group can belong to a different team entirely. It
  // opens as an overlay ON TOP of wherever the user currently is (Order
  // Details, Form Responses, or the cross-order breakdown), without
  // touching that screen's own state, so the back chevron un-covers it
  // again afterward instead of resetting to a screen the user never asked
  // to leave. A sponsor-fillLevel form instead navigates to the Sponsors
  // page, passing sponsorId through location.state so it opens straight to
  // that sponsor's overview, mirroring how arriving here via a sponsor's
  // own orderId opens straight to this panel. `packageName` disambiguates
  // the rare order that bundles two separate teams (see the ord-1005
  // comment in mockTeams.js) — falls back to matching by orderId alone
  // whenever a caller doesn't have a packageName to pass, or the order only
  // has the one team anyway.
  function viewEntityAcrossOrders(orderId, fillLevel, packageName) {
    if (fillLevel === 'sponsor') {
      const sponsor = sponsors.find(s => s.orderId === orderId)
      navigate('/orders-forms/sponsors', sponsor ? { state: { sponsorId: sponsor.id } } : undefined)
      return
    }
    const team =
      registeredTeams.find(t => t.orderId === orderId && t.packageName === packageName) ??
      registeredTeams.find(t => t.orderId === orderId)
    if (!team) {
      openOrderDetails(orderId)
      return
    }
    saveCurrentScroll()
    setSelectedTeam(team)
    setShowTeamOverview(true)
  }

  function viewFormEntity(formName, packageName) {
    const fillLevel = viewingOrder?.formResponses.find(
      entry => entry.formName === formName && entry.packageName === packageName
    )?.fillLevel
    if (fillLevel === 'team' || fillLevel === 'player' || fillLevel === 'sponsor') {
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
    setShowTeamOverview(false)
    setViewingOrderId(orderId)
    setViewingOrderResponses(false)
    setResponsesPlayerFilter(null)
    setResponsesCategory(null)
  }

  // `direct` — reached straight from the Team Overview's "Order Details"
  // row rather than drilling in through Order Details — so the back chevron
  // should return straight to the overview instead of stopping at a details
  // screen the user never actually saw. `category`/`playerName` pre-filter
  // Form Responses to just this team, or just one of its players, so an
  // order that also bundles a sponsor form doesn't show that mixed in too
  // (see OrderResponsesFilterNav.jsx's Team/Sponsor/Players tabs).
  function openOrderResponses(orderId, { direct = false, playerName = null, category = null } = {}) {
    saveCurrentScroll()
    setEditingResponse(null)
    setViewingFormName(null)
    setViewingFormQuestion(null)
    setShowTeamOverview(false)
    setViewingOrderId(orderId)
    setViewingOrderResponses(true)
    setResponsesOpenedDirectly(direct)
    setResponsesPlayerFilter(playerName)
    setResponsesCategory(category)
  }

  // The Team Overview's own "Form Responses" row — pre-filtered to this
  // team's category (not a specific player).
  function viewTeamFormResponses() {
    openOrderResponses(selectedTeam.orderId, { direct: true, category: 'team' })
  }

  // The Team Overview player card's "Form Responses" button — jumps
  // straight to that team's order's Form Responses, pre-filtered to just
  // this player, same "opened directly" back-chevron behavior as the
  // overview's "Order Details" row above.
  function viewPlayerResponses(player) {
    openOrderResponses(selectedTeam.orderId, { direct: true, playerName: player.name })
  }

  function handlePanelBack() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    if (showTeamOverview) {
      setShowTeamOverview(false)
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

  const screenTitle = showTeamOverview
    ? 'Team Overview'
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
    : 'Team Overview'

  const screenActions = showTeamOverview
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
        className="tm-page"
        header="Players & Teams"
        pageActions={[
          { buttonTitle: 'Add Team', actionIcon: faPlus, type: 'black', actionClick: () => {} },
          { buttonTitle: 'Upload Teams', actionIcon: faCircleArrowUp, type: 'light-grey', actionClick: () => {} },
          { buttonTitle: 'Documents', actionIcon: faFolderOpen, type: 'light-grey', actionClick: () => {} },
        ]}
        searchPlaceholder="Search Players & Teams..."
        search={search}
        onSearchChange={setSearch}
        emptyMessage="No players or teams match your search."
      >
        {noResults ? (
          <div className="efp-empty">No players or teams match your search.</div>
        ) : (
          <>
            {visibleUnassigned.length > 0 && (
              <TeamRosterSection
                title="Unassigned Players"
                addLabel="Add Unassigned Player"
                people={visibleUnassigned}
                onAdd={() => {}}
                onRemoveSelected={() => {}}
                onAddTeam={() => {}}
                onMessage={() => {}}
              />
            )}

            {visibleWaitlist.length > 0 && (
              <TeamRosterSection
                title="Waitlist Entries"
                addLabel="Add to Waitlist"
                people={visibleWaitlist}
                onAdd={() => {}}
                onRemoveSelected={() => {}}
                onAddTeam={() => {}}
                onMessage={() => {}}
              />
            )}

            {visibleTeams.length > 0 && (
              <RegisteredTeamsSection
                teams={visibleTeams}
                totalCount={registeredTeams.length}
                checkedInCount={checkedInCount}
                disqualifiedCount={disqualifiedCount}
                onTeamCheckIn={() => {}}
                onDisqualifiedTeams={() => {}}
                onUpdateHandicaps={() => {}}
                onSelectTeam={setSelectedTeam}
                onMessagePlayer={() => {}}
              />
            )}
          </>
        )}
      </EntityListPage>

      <AppSidePanel
        isOpen={!!selectedTeam}
        onClose={closeTeamPanel}
        onBack={
          showTeamOverview || viewingOrderId || editingResponse || viewingFormQuestion || viewingFormName
            ? handlePanelBack
            : undefined
        }
        bodyRef={panelBodyRef}
        title={screenTitle}
        actions={screenActions}
      >
        {showTeamOverview ? (
          selectedTeam && (
            <TeamOverviewPanel
              team={selectedTeam}
              onViewOrderDetails={() => openOrderDetails(selectedTeam.orderId)}
              onViewFormResponses={viewTeamFormResponses}
              onViewPlayerResponses={viewPlayerResponses}
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
              initialSelectedName={responsesPlayerFilter}
              initialCategory={responsesCategory}
            />
          )
        ) : viewingOrder ? (
          <OrderDetailPanelDraft1 order={viewingOrder} onViewAllResponses={() => openOrderResponses(viewingOrder.id)} />
        ) : (
          selectedTeam && (
            <TeamOverviewPanel
              team={selectedTeam}
              onViewOrderDetails={() => openOrderDetails(selectedTeam.orderId)}
              onViewFormResponses={viewTeamFormResponses}
              onViewPlayerResponses={viewPlayerResponses}
            />
          )
        )}
      </AppSidePanel>
    </>
  )
}
