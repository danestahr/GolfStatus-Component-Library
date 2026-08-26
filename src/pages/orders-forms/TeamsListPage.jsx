import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { faPlus, faCircleArrowUp, faFolderOpen, faBan } from '@fortawesome/free-solid-svg-icons'

import AppSidePanel from '../../components/AppSidePanel.jsx'
import EntityListPage from '../../components/orders-forms/EntityListPage.jsx'
import TeamRosterSection from '../../components/orders-forms/TeamRosterSection.jsx'
import RegisteredTeamsSection from '../../components/orders-forms/RegisteredTeamsSection.jsx'
import TeamOverviewPanel from '../../components/orders-forms/TeamOverviewPanel.jsx'
import TeamOrderPicker from '../../components/orders-forms/TeamOrderPicker.jsx'
import { orderActionsFor } from '../../components/orders/OrderDetailPanel.jsx'
import OrderDetailPanelDraft1 from '../../components/orders/OrderDetailPanelDraft1.jsx'
import OrderResponsesListDraft1 from '../../components/orders/OrderResponsesListDraft1.jsx'
import OrderFormOverviewDraft1 from '../../components/orders/OrderFormOverviewDraft1.jsx'
import AddQuestionFields, { emptyQuestionDraft } from '../../components/orders-forms/AddQuestionFields.jsx'
import EditPlayerFields from '../../components/orders-forms/EditPlayerFields.jsx'
import AllOrderResponsesForFormDraft1 from '../../components/orders/AllOrderResponsesForFormDraft1.jsx'
import OrderFormResponseEditFieldsDraft1 from '../../components/orders/OrderFormResponseEditFieldsDraft1.jsx'
import {
  unassignedPlayers as initialUnassignedPlayers,
  waitlistEntries,
  registeredTeams as initialRegisteredTeams,
} from '../../data/mockTeams.js'
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
    return teamId ? initialRegisteredTeams.find(t => t.id === teamId) ?? null : null
  })
  const [orderList, setOrderList] = useState(initialOrders)
  // Lifted into state (rather than read straight off the mockTeams.js
  // imports, like waitlistEntries still is) so an Edit Player save is
  // actually visible afterward — the roster row's mini player list, the
  // player tile's own name/handicap, etc.
  const [teamsData, setTeamsData] = useState(initialRegisteredTeams)
  const [unassignedList, setUnassignedList] = useState(initialUnassignedPlayers)
  const [viewingOrderId, setViewingOrderId] = useState(null)
  const [viewingOrderResponses, setViewingOrderResponses] = useState(false)
  const [responsesOpenedDirectly, setResponsesOpenedDirectly] = useState(false)
  const [responsesPlayerFilter, setResponsesPlayerFilter] = useState(null)
  const [responsesCategory, setResponsesCategory] = useState(null)
  const [editingResponse, setEditingResponse] = useState(null)
  const [viewingFormName, setViewingFormName] = useState(null)
  const [viewingFormQuestion, setViewingFormQuestion] = useState(null)
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [questionDraft, setQuestionDraft] = useState(emptyQuestionDraft)
  // Each question's editable draft (type/required/etc), keyed by question
  // text and then by form name — covers both a question this page created
  // from scratch (no real order data backs it) and an edited override of a
  // real question's metadata (OrderFormOverviewDraft1 merges the override
  // in; the real answers/respondent counts always still come from `orders`).
  const [customQuestionsByForm, setCustomQuestionsByForm] = useState({})
  // null while adding a brand new question; the question's original text
  // while editing an existing one (its own or a real question's override).
  const [editingQuestionKey, setEditingQuestionKey] = useState(null)
  const [showTeamOverview, setShowTeamOverview] = useState(false)
  // Set to a team (rather than just a boolean) whenever that team's own
  // "Order Details" row can't jump straight to a single order — it has its
  // own bulk Team Registration order plus at least one player's separate
  // order (see the Fairway Fanatics comment in mockTeams.js) — so the user
  // needs to pick which one they mean first (see TeamOrderPicker.jsx).
  const [pickingOrderForTeam, setPickingOrderForTeam] = useState(null)
  // The Edit Player screen (Figma "Player Details"), opened from an
  // unassigned player's card or a Team Overview player tile — an overlay
  // on top of whichever of those is currently showing, same "opened
  // directly" convention as viewPlayerResponses below. `teamId` is null
  // for an unassigned player, so saveEditingPlayer knows which list to
  // write the edit back into.
  const [editingPlayer, setEditingPlayer] = useState(null)

  // Scroll position of the AppSidePanel body, kept per "screen" so a forward
  // navigation always opens at the top, while stepping back with the panel's
  // chevron restores wherever that screen was scrolled to before — the body
  // div itself never unmounts across these content swaps, so its scrollTop
  // otherwise just carries over untouched from whatever screen came before
  // it (see OrdersDraft1Page.jsx, where this same pattern originates).
  const panelBodyRef = useRef(null)
  const scrollPositions = useRef({})
  const pendingScrollAction = useRef(null)

  // Every order actually tied to this team — its own, plus any distinct
  // order each individual player carries (see the Fairway Fanatics comment
  // in mockTeams.js) — deduped since a player's own orderId can happen to
  // equal the team's (the common case: registered as part of it).
  function associatedOrdersFor(team) {
    const ids = new Set([team.orderId, ...team.players.map(p => p.orderId).filter(Boolean)])
    return orderList.filter(o => ids.has(o.id))
  }

  function currentScreenKey() {
    if (pickingOrderForTeam) return `pickOrder:${pickingOrderForTeam.id}`
    if (editingPlayer) return `editPlayer:${editingPlayer.personId}`
    if (showTeamOverview) return `team-overlay:${selectedTeam?.id}`
    if (editingResponse) return `edit:${editingResponse.orderId}`
    if (addingQuestion) return `addQuestion:${viewingFormName}`
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
    () => unassignedList.filter(matchesPerson),
    [query, unassignedList]
  )
  const visibleWaitlist = useMemo(
    () => waitlistEntries.filter(matchesPerson),
    [query]
  )
  const visibleTeams = useMemo(
    () => teamsData.filter(matchesTeam),
    [query, teamsData]
  )

  const checkedInCount = teamsData.filter(team => team.checkedIn).length
  const disqualifiedCount = teamsData.filter(team => team.disqualified).length

  const noResults = visibleUnassigned.length === 0 && visibleWaitlist.length === 0 && visibleTeams.length === 0

  function resetOrderView() {
    setViewingOrderId(null)
    setViewingOrderResponses(false)
    setResponsesOpenedDirectly(false)
    setResponsesPlayerFilter(null)
    setEditingResponse(null)
    setViewingFormName(null)
    setViewingFormQuestion(null)
    setAddingQuestion(false)
    setShowTeamOverview(false)
    setPickingOrderForTeam(null)
    setEditingPlayer(null)
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
  // comment in mockTeams.js) or two separate sponsors (see the ord-1006
  // comment in mockOrders.js) — falls back to matching by orderId alone
  // whenever a caller doesn't have a packageName to pass, or the order only
  // has the one team/sponsor anyway.
  function viewEntityAcrossOrders(orderId, fillLevel, packageName) {
    if (fillLevel === 'sponsor') {
      const sponsor =
        sponsors.find(s => s.orderId === orderId && s.package === packageName) ??
        sponsors.find(s => s.orderId === orderId)
      navigate('/orders-forms/sponsors', sponsor ? { state: { sponsorId: sponsor.id } } : undefined)
      return
    }
    const team =
      teamsData.find(t => t.orderId === orderId && t.packageName === packageName) ??
      teamsData.find(t => t.orderId === orderId)
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
    setAddingQuestion(false)
    setShowTeamOverview(false)
    setPickingOrderForTeam(null)
    setEditingPlayer(null)
    setViewingOrderId(orderId)
    setViewingOrderResponses(false)
    setResponsesPlayerFilter(null)
    setResponsesCategory(null)
  }

  // The Team Overview's own "Order Details" row — most teams have exactly
  // one associated order, so this jumps straight there same as always; a
  // team with more than one (see associatedOrdersFor above) opens the
  // picker instead so the user can say which order they actually mean.
  function viewTeamOrderDetails() {
    if (!selectedTeam) return
    const orders = associatedOrdersFor(selectedTeam)
    if (orders.length > 1) {
      saveCurrentScroll()
      setPickingOrderForTeam(selectedTeam)
    } else {
      openOrderDetails(selectedTeam.orderId)
    }
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
    setAddingQuestion(false)
    setShowTeamOverview(false)
    setPickingOrderForTeam(null)
    setEditingPlayer(null)
    setViewingOrderId(orderId)
    setViewingOrderResponses(true)
    setResponsesOpenedDirectly(direct)
    setResponsesPlayerFilter(playerName)
    setResponsesCategory(category)
  }

  // The Team Overview's own "Form Responses" row — pre-filtered to this
  // team's category AND, when the order bundles more than one team (see the
  // ord-1005 comment in mockTeams.js), to this specific team's own contact
  // so the other team's answers don't show up mixed in.
  function viewTeamFormResponses() {
    openOrderResponses(selectedTeam.orderId, { direct: true, category: 'team', playerName: selectedTeam.contactName })
  }

  // The Team Overview player card's "Form Responses" button — jumps
  // straight to that player's own Form Responses, same "opened directly"
  // back-chevron behavior as the overview's "Order Details" row above. Most
  // players' answers live under the team's own order, but a player carrying
  // their own separate `orderId` (added in from Unassigned Players — see the
  // Fairway Fanatics comment in mockTeams.js) answered under that order
  // instead, so that's the one to open for them.
  function viewPlayerResponses(player) {
    openOrderResponses(player.orderId ?? selectedTeam.orderId, { direct: true, playerName: player.name })
  }

  // Splits a "First Last" name into best-effort parts for Edit Player's
  // separate First/Last Name fields — every mock record only stores one
  // combined name.
  function splitPlayerName(name) {
    const trimmed = (name ?? '').trim()
    const spaceIndex = trimmed.indexOf(' ')
    if (spaceIndex === -1) return { firstName: trimmed, lastName: '' }
    return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) }
  }

  // Opens the Edit Player screen (Figma "Player Details") as an overlay on
  // top of wherever the user currently is — an unassigned player's own card
  // (no `team`), or a player tile inside the currently open Team Overview.
  function openEditPlayer(person, team) {
    saveCurrentScroll()
    const { firstName, lastName } = splitPlayerName(person.name)
    setEditingPlayer({
      personId: person.id,
      teamId: team?.id ?? null,
      firstName,
      lastName,
      email: person.email ?? '',
      phone: person.phone ?? '',
      handicap: person.handicap != null ? String(person.handicap) : '',
      ghin: person.ghin ?? '',
      notes: person.note ?? '',
    })
  }

  function updateEditingPlayer(patch) {
    setEditingPlayer(prev => ({ ...prev, ...patch }))
  }

  function cancelEditingPlayer() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    setEditingPlayer(null)
  }

  // Saves the draft back into whichever list this player actually came
  // from, so the edit is visible once the panel steps back — the roster
  // row's mini player list, the player tile's own name/handicap, etc.
  // `selectedTeam` is kept in sync too since TeamOverviewPanel is handed
  // that object directly rather than looking itself up in `teamsData`.
  function saveEditingPlayer() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    const { personId, teamId, firstName, lastName, email, phone, handicap, ghin, notes } = editingPlayer
    const patch = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      handicap: handicap === '' ? 0 : Number(handicap),
      ghin,
      note: notes,
    }

    if (teamId) {
      setTeamsData(prev =>
        prev.map(team =>
          team.id !== teamId
            ? team
            : { ...team, players: team.players.map(p => (p.id === personId ? { ...p, ...patch } : p)) }
        )
      )
      setSelectedTeam(prev =>
        prev && prev.id === teamId
          ? { ...prev, players: prev.players.map(p => (p.id === personId ? { ...p, ...patch } : p)) }
          : prev
      )
    } else {
      setUnassignedList(prev => prev.map(p => (p.id === personId ? { ...p, ...patch } : p)))
    }

    setEditingPlayer(null)
  }

  // The Form Overview's "Add Question" button — opens as another screen in
  // this same panel rather than a panel of its own (see AddQuestionFields).
  function openAddQuestion() {
    saveCurrentScroll()
    setEditingQuestionKey(null)
    setQuestionDraft(emptyQuestionDraft)
    setAddingQuestion(true)
  }

  function openEditQuestion(draft) {
    saveCurrentScroll()
    setEditingQuestionKey(draft.question)
    setQuestionDraft(draft)
    setAddingQuestion(true)
  }

  function saveQuestion() {
    const question = questionDraft.question.trim()
    if (!question) return
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    setCustomQuestionsByForm(prev => {
      const existing = { ...(prev[viewingFormName] ?? {}) }
      if (editingQuestionKey && editingQuestionKey !== question) delete existing[editingQuestionKey]
      existing[question] = { ...questionDraft, question }
      return { ...prev, [viewingFormName]: existing }
    })
    setAddingQuestion(false)
  }

  function deleteQuestion() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    setCustomQuestionsByForm(prev => {
      const existing = { ...(prev[viewingFormName] ?? {}) }
      delete existing[editingQuestionKey]
      return { ...prev, [viewingFormName]: existing }
    })
    setAddingQuestion(false)
  }

  function handlePanelBack() {
    saveCurrentScroll()
    pendingScrollAction.current = 'restore'
    if (pickingOrderForTeam) {
      setPickingOrderForTeam(null)
    } else if (editingPlayer) {
      setEditingPlayer(null)
    } else if (showTeamOverview) {
      setShowTeamOverview(false)
    } else if (editingResponse) {
      setEditingResponse(null)
    } else if (addingQuestion) {
      setAddingQuestion(false)
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

  const screenTitle = pickingOrderForTeam
    ? 'Order Details'
    : editingPlayer
    ? 'Player Details'
    : showTeamOverview
    ? 'Team Overview'
    : editingResponse
    ? `Edit ${editingResponse.groups[0]?.formName ?? ''}`
    : addingQuestion
    ? 'Question Details'
    : viewingFormQuestion
    ? viewingFormQuestion.question
    : viewingFormName
    ? viewingFormName
    : viewingOrderResponses
    ? 'Form Responses'
    : viewingOrder
    ? 'Order Details'
    : 'Team Overview'

  const screenActions = pickingOrderForTeam
    ? []
    : editingPlayer
    ? [
        { name: 'Save', type: 'black', action: saveEditingPlayer },
        { name: 'Cancel', type: 'light-grey', action: cancelEditingPlayer },
        { name: 'Remove Player', type: 'transparent red', action: () => {} },
      ]
    : showTeamOverview
    ? [
        { name: 'Disqualify Team', type: 'light-grey', buttonIcon: faBan, action: () => {} },
        { name: 'Delete Team', type: 'transparent red', action: () => {} },
      ]
    : editingResponse
    ? [
        { name: 'Save', type: 'black', action: saveEditingResponse },
        { name: 'Cancel', type: 'light-grey', action: cancelEditingResponse },
      ]
    : addingQuestion
    ? [
        { name: 'Save', type: 'black', action: saveQuestion },
        { name: 'Cancel', type: 'light-grey', action: () => setAddingQuestion(false) },
        { name: 'Delete Question', type: 'transparent red', action: deleteQuestion },
      ]
    : viewingFormName
    ? [{ name: 'Delete Form', type: 'transparent red', action: () => {} }]
    : viewingFormQuestion || viewingOrderResponses
    ? []
    : viewingOrder
    ? orderActionsFor(viewingOrder, {
        onMarkPaid: () => setOrderStatus(viewingOrder.id, 'paid'),
        onVoid: () => setOrderStatus(viewingOrder.id, 'void'),
        onRefund: () => setOrderStatus(viewingOrder.id, 'refunded'),
      })
    : [
        { name: 'Disqualify Team', type: 'light-grey', buttonIcon: faBan, action: () => {} },
        { name: 'Delete Team', type: 'transparent red', action: () => {} },
      ]

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
                onFormResponses={person => openOrderResponses(person.orderId, { direct: true })}
                onViewOrder={person => openOrderDetails(person.orderId)}
                onEditPlayer={person => openEditPlayer(person)}
                iconOnlyAddTeam
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
                totalCount={teamsData.length}
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
        isOpen={!!selectedTeam || !!viewingOrderId || !!editingPlayer}
        onClose={closeTeamPanel}
        onBack={
          pickingOrderForTeam || editingPlayer || showTeamOverview || viewingOrderId || editingResponse || addingQuestion || viewingFormQuestion || viewingFormName
            ? handlePanelBack
            : undefined
        }
        bodyRef={panelBodyRef}
        title={screenTitle}
        actions={screenActions}
      >
        {pickingOrderForTeam ? (
          <TeamOrderPicker orders={associatedOrdersFor(pickingOrderForTeam)} onSelect={openOrderDetails} />
        ) : editingPlayer ? (
          <EditPlayerFields draft={editingPlayer} onChange={updateEditingPlayer} onSubmit={saveEditingPlayer} />
        ) : showTeamOverview ? (
          selectedTeam && (
            <TeamOverviewPanel
              team={selectedTeam}
              onViewOrderDetails={viewTeamOrderDetails}
              onViewFormResponses={viewTeamFormResponses}
              onViewPlayerResponses={viewPlayerResponses}
              onEditPlayer={player => openEditPlayer(player, selectedTeam)}
            />
          )
        ) : editingResponse ? (
          <OrderFormResponseEditFieldsDraft1
            groups={editingResponse.groups}
            onChangeAnswer={updateEditingAnswer}
            onSubmit={saveEditingResponse}
          />
        ) : addingQuestion ? (
          <AddQuestionFields
            draft={questionDraft}
            onChange={patch => setQuestionDraft(prev => ({ ...prev, ...patch }))}
            onSubmit={saveQuestion}
            isEditing={editingQuestionKey != null}
          />
        ) : viewingFormQuestion ? (
          <AllOrderResponsesForFormDraft1
            key={`${viewingFormQuestion.formName}-${viewingFormQuestion.question}`}
            orders={orderList}
            formName={viewingFormQuestion.formName}
            initialQuestion={viewingFormQuestion.question}
            onViewOrder={openOrderDetails}
            onViewEntity={viewEntityAcrossOrders}
            onSaveAnswer={saveResponseAnswer}
          />
        ) : viewingFormName ? (
          <OrderFormOverviewDraft1
            orders={orderList}
            formName={viewingFormName}
            onViewQuestion={question => {
              saveCurrentScroll()
              setViewingFormQuestion({ formName: viewingFormName, question })
            }}
            onAddQuestion={openAddQuestion}
            onEditQuestion={openEditQuestion}
            extraQuestions={customQuestionsByForm[viewingFormName] ?? {}}
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
              onViewOrderDetails={viewTeamOrderDetails}
              onViewFormResponses={viewTeamFormResponses}
              onViewPlayerResponses={viewPlayerResponses}
              onEditPlayer={player => openEditPlayer(player, selectedTeam)}
            />
          )
        )}
      </AppSidePanel>
    </>
  )
}
