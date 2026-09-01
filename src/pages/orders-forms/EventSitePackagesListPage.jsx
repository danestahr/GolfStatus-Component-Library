import { Fragment, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

import EntityListPage from '../../components/orders-forms/EntityListPage.jsx'
import NavRow from '../../components/orders-forms/NavRow.jsx'
import EventSitePreviewCard from '../../components/orders-forms/EventSitePreviewCard.jsx'
import PackageCard from '../../components/orders-forms/PackageCard.jsx'
import FormsListContent from '../../components/orders-forms/FormsListContent.jsx'
import AddFormFields from '../../components/orders-forms/AddFormFields.jsx'
import AddQuestionFields, { emptyQuestionDraft } from '../../components/orders-forms/AddQuestionFields.jsx'
import AppSidePanel from '../../components/AppSidePanel.jsx'
import OrderFormOverviewDraft1 from '../../components/orders/OrderFormOverviewDraft1.jsx'
import AllOrderResponsesForFormDraft1 from '../../components/orders/AllOrderResponsesForFormDraft1.jsx'
import { eventSite } from '../../data/mockEventSite.js'
import { eventSitePackages } from '../../data/mockEventSitePackages.js'
import { forms as initialForms } from '../../data/mockForms.js'
import { orders as initialOrders } from '../../data/mockOrders.js'
import { sponsors } from '../../data/mockSponsors.js'
import { registeredTeams } from '../../data/mockTeams.js'
import './EventSitePackagesListPage.scss'

// Order matches the Figma "Event Site + Packages" navigation list — the
// event site preview card hangs off the first row and the package cards
// hang off the "Packages" row, so search filtering below keys off these ids
// to decide whether that inline content should stay visible.
const NAV_ROWS = [
  {
    id: 'event-site-details',
    title: 'Event Site & Registration Details',
    description: 'Manage tournament activation, registration privacy, event site url, registration details, and registration close date.',
  },
  {
    id: 'event-site-homepage',
    title: 'Event Site Homepage',
    description: 'Manage promotional content, imagery, and media.',
  },
  {
    id: 'packages',
    title: 'Packages',
    description: 'Manage registration packages, package items, forms, and more.',
  },
  {
    id: 'forms',
    title: 'Forms',
    description: 'Manage forms to collect additional registrant information.',
  },
  {
    id: 'additional-pages',
    title: 'Additional Event Site Pages',
    description: 'Manage the visibility of sponsorships, hole assignments, course details, leaderboards, and registrants.',
  },
  {
    id: 'auction',
    title: 'Auction',
    description: 'Link to an auction on the event site.',
  },
  {
    id: 'discounts',
    title: 'Discounts',
    description: 'Manage discounts codes.',
  },
  {
    id: 'order-receipt',
    title: 'Order Receipt',
    description: 'Manage text and images on registration order receipts.',
  },
]

function matches(query, ...texts) {
  return !query || texts.some(text => text.toLowerCase().includes(query))
}

const FORMS_PATH = '/orders-forms/event-site-packages/forms'

// One side panel for the whole Forms flow (list → add form → form overview →
// add question), same single-panel-many-screens convention as TeamsListPage/
// SponsorsListPage, rather than each destination opening its own stacked
// panel. Unlike those, though, the "which form"/"viewing its responses"
// screens ARE routes here (see `formId`/`viewingResponses` below) — a
// question tile's Responses button (OrderFormOverviewDraft1.jsx) opens that
// route directly, and it's also reachable by appending /responses to a
// form's own URL by hand. Add Form/Add Question stay plain local-state
// overlays (`addingForm`/`addingQuestion`) on top of whichever route screen
// is showing, same as before.
export default function EventSitePackagesListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { formId: formOverviewId } = useParams()
  const [search, setSearch] = useState('')
  const [addingForm, setAddingForm] = useState(false)
  // True for a beat between clicking Save & Continue on a brand new form and
  // actually landing on its overview — simulates the save/load a real
  // form-builder backend would need, same convention as ScorecardListPage's
  // isInitialLoading. Only the *create* path gets this (see
  // `handleAddFormSave`); renaming an existing form still commits instantly.
  const [creatingForm, setCreatingForm] = useState(false)
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [formsList, setFormsList] = useState(initialForms)
  // Only mutated by AllOrderResponsesForFormDraft1's inline answer editing
  // (see `saveResponseAnswer` below) — this page has no order-details screen
  // of its own (its "View Order" link navigates elsewhere, see `viewOrder`),
  // so nothing else here needs a live order list.
  const [orderList, setOrderList] = useState(initialOrders)
  const [addFormName, setAddFormName] = useState('')
  // null while adding a brand new form; the form's stable id while editing
  // an existing one (opened via OrderFormOverviewDraft1's edit pencil, which
  // is itself currently hidden — see that component) — same convention as
  // `editingQuestionKey` below.
  const [editingFormId, setEditingFormId] = useState(null)
  // `formOverviewId` (above) comes straight from the :formId route param
  // now, not local state — a rename only ever touches its `formsList` entry
  // (see `handleAddFormSave`), so deriving the live display name from
  // `formsList` below means the panel just reflects the rename
  // automatically, with nothing to keep in sync by hand. It's also what
  // lets `orders` responses stay linked across a rename (see `formId` in
  // OrderFormOverviewDraft1.jsx/orderUtils.js) — a form's `formsList` name
  // can drift from what's stored on its `orders` responses, but its id
  // never does.
  const formOverviewName = formOverviewId ? formsList.find(f => f.id === formOverviewId)?.name ?? null : null
  const showingFormsList = location.pathname === FORMS_PATH
  const viewingResponses = location.pathname.endsWith('/responses')
  const panelOpen = location.pathname.startsWith(FORMS_PATH)
  // The Form Name field's draft on OrderFormOverviewDraft1 itself (renaming
  // moved inline there — see `handleSaveFormName`/`handleCancelFormName`
  // below). Reseeded from the form's current name whenever the *route's*
  // formId changes (a fresh visit or switching forms) — not on every
  // `formOverviewName` change, or saving a rename would immediately stomp
  // right back over its own draft.
  const [formNameDraft, setFormNameDraft] = useState('')
  useEffect(() => {
    if (formOverviewName != null) setFormNameDraft(formOverviewName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOverviewId])
  // Add Form/Add Question are plain overlays on top of whichever route is
  // showing (see the comment above this component) — they never push their
  // own history entry, so the browser's own back/forward buttons skip right
  // past them and change the route underneath without ever closing them.
  // Closing both here on every route change (however it happened — the
  // panel's own back chevron, the browser's back/forward buttons, or a
  // question's Responses link) keeps whichever overlay was open from being
  // left stranded over a screen it no longer belongs to.
  useEffect(() => {
    setAddingForm(false)
    setAddingQuestion(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
  const isEditingFormName = formOverviewName != null && formNameDraft !== formOverviewName
  // Which question AllOrderResponsesForFormDraft1 should open on — only
  // ever set by clicking a question's own Responses button (see
  // `openViewResponses`), so a direct/bookmarked visit to a form's
  // /responses URL just leaves this null and that component falls back to
  // its own first question, same as an unrecognized question would.
  const [viewingQuestion, setViewingQuestion] = useState(null)
  const [questionDraft, setQuestionDraft] = useState(emptyQuestionDraft)
  // Snapshot of `questionDraft` as it was when the Add/Edit Question screen
  // opened (see `openAddQuestion`/`openEditQuestion`) — Save stays disabled
  // until the draft actually diverges from this, same "nothing to save yet"
  // reasoning as `isEditingFormName` above.
  const [originalQuestionDraft, setOriginalQuestionDraft] = useState(emptyQuestionDraft)
  // Each question's editable draft (type/required/etc), keyed by question
  // text and then by form id — covers both a question this page created
  // from scratch (no real order data backs it) and an edited override of a
  // real question's metadata (OrderFormOverviewDraft1 merges the override
  // in; the real answers/respondent counts always still come from `orders`).
  const [customQuestionsByForm, setCustomQuestionsByForm] = useState({})
  // null while adding a brand new question; the question's original text
  // while editing an existing one (its own or a real question's override).
  const [editingQuestionKey, setEditingQuestionKey] = useState(null)
  // Question text deleted per form, keyed by form id — the only way to
  // actually remove a *real*, order-derived question from the list (see
  // `handleDeleteQuestion`/OrderFormOverviewDraft1.jsx's `deletedQuestions`
  // prop), since there's no form-builder here to remove it from `orders`
  // itself. A custom question this page created is already fully gone once
  // its `customQuestionsByForm` override is deleted, so this only actually
  // matters for real ones, but filtering by it either way is simplest.
  const [deletedQuestionsByForm, setDeletedQuestionsByForm] = useState({})

  function openFormsPanel() {
    navigate(FORMS_PATH)
  }

  function openAddForm() {
    setEditingFormId(null)
    setAddFormName('')
    setAddingForm(true)
  }

  function openEditForm() {
    setEditingFormId(formOverviewId)
    setAddFormName(formOverviewName)
    setAddingForm(true)
  }

  function openFormOverview(form) {
    navigate(`${FORMS_PATH}/${form.id}`)
  }

  // Inline replacement for the old pencil-opens-AddFormFields rename flow
  // (see OrderFormOverviewDraft1.jsx) — commits the Form Name field's draft
  // straight to the matching `formsList` entry. Trimmed so trailing
  // whitespace can't leave `isEditingFormName` stuck true after a save.
  function handleSaveFormName() {
    const name = formNameDraft.trim()
    if (!name) return
    setFormsList(prev => prev.map(f => (f.id === formOverviewId ? { ...f, name } : f)))
    setFormNameDraft(name)
  }

  function handleCancelFormName() {
    setFormNameDraft(formOverviewName ?? '')
  }

  function openAddQuestion() {
    setEditingQuestionKey(null)
    setQuestionDraft(emptyQuestionDraft)
    setOriginalQuestionDraft(emptyQuestionDraft)
    setAddingQuestion(true)
  }

  function openEditQuestion(draft) {
    setEditingQuestionKey(draft.question)
    setQuestionDraft(draft)
    setOriginalQuestionDraft(draft)
    setAddingQuestion(true)
  }

  // Reachable only via OrderFormOverviewDraft1's own Responses button, which
  // is currently hidden there — kept wired (see that component) so
  // restoring it is just uncommenting the button. Direct navigation to a
  // form's /responses URL gets here too, just without a specific question
  // (see `viewingQuestion` above).
  function openViewResponses(question) {
    setViewingQuestion(question)
    navigate(`${FORMS_PATH}/${formOverviewId}/responses`)
  }

  // AllOrderResponsesForFormDraft1's "View Order"/"View Team"/"View Sponsor"
  // links — this page has no order-details screen of its own, so they
  // navigate to whichever page actually owns that entity, same resolution
  // OrdersDraft1Page/TeamsListPage/SponsorsListPage use.
  function viewOrder(orderId) {
    navigate(`/orders-draft-1/${orderId}`)
  }

  // `packageName` disambiguates the rare order that bundles two separate
  // teams (see the ord-1005 comment in mockTeams.js) or two separate
  // sponsors (see the ord-1006 comment in mockOrders.js) — falls back to
  // matching by orderId alone whenever the order only has the one
  // team/sponsor anyway.
  function viewEntity(orderId, fillLevel, packageName) {
    if (fillLevel === 'sponsor') {
      const sponsor =
        sponsors.find(s => s.orderId === orderId && s.package === packageName) ??
        sponsors.find(s => s.orderId === orderId)
      navigate('/orders-forms/sponsors', sponsor ? { state: { sponsorId: sponsor.id } } : undefined)
      return
    }
    const team =
      registeredTeams.find(t => t.orderId === orderId && t.packageName === packageName) ??
      registeredTeams.find(t => t.orderId === orderId)
    navigate('/orders-forms/teams', team ? { state: { teamId: team.id } } : undefined)
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

  function handlePanelBack() {
    if (addingQuestion) {
      setAddingQuestion(false)
      return
    }
    if (addingForm) {
      if (editingFormId) setAddingForm(false)
      else navigate(FORMS_PATH)
      return
    }
    if (viewingResponses) {
      navigate(`${FORMS_PATH}/${formOverviewId}`)
      return
    }
    navigate(FORMS_PATH)
  }

  // The new form has no responses yet — OrderFormOverviewDraft1 just shows
  // all-zero stats and an empty question list until questions get built out
  // (no form-builder exists in this prototype yet, see that component).
  // Editing an existing form (`editingFormId` set, via the overview's edit
  // pencil) just renames its `formsList` entry in place instead — nothing
  // else needs updating since `formOverviewId`/`customQuestionsByForm` key
  // off the id, which the rename never touches, and the *next* screen's real
  // answers/respondent counts come from `orders`, matched by that same
  // stable id (see `formId` in OrderFormOverviewDraft1.jsx).
  function handleAddFormSave() {
    const name = addFormName.trim()
    if (!name) return

    if (editingFormId) {
      setFormsList(prev => prev.map(f => (f.id === editingFormId ? { ...f, name } : f)))
      setAddingForm(false)
      return
    }

    const id = `form-${formsList.length + 1}`
    setCreatingForm(true)
    setTimeout(() => {
      setFormsList(prev => [
        ...prev,
        { id, name, createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
      ])
      setAddingForm(false)
      setCreatingForm(false)
      navigate(`${FORMS_PATH}/${id}`)
    }, 800)
  }

  function handleAddQuestionSave() {
    const question = questionDraft.question.trim()
    if (!question) return
    setCustomQuestionsByForm(prev => {
      const existing = { ...(prev[formOverviewId] ?? {}) }
      if (editingQuestionKey && editingQuestionKey !== question) delete existing[editingQuestionKey]
      existing[question] = { ...questionDraft, question }
      return { ...prev, [formOverviewId]: existing }
    })
    setAddingQuestion(false)
  }

  // Removes whichever question is currently open — nothing to delete yet
  // while adding a brand new one (`editingQuestionKey` null), so this is a
  // no-op then rather than deleting the wrong (or no) question. Clears any
  // override on it (a custom question is now fully gone) and adds it to
  // `deletedQuestionsByForm` (what actually hides a *real*, order-derived
  // question — see that state's own comment above).
  function handleDeleteQuestion() {
    if (!editingQuestionKey) {
      setAddingQuestion(false)
      return
    }
    setCustomQuestionsByForm(prev => {
      const existing = { ...(prev[formOverviewId] ?? {}) }
      delete existing[editingQuestionKey]
      return { ...prev, [formOverviewId]: existing }
    })
    setDeletedQuestionsByForm(prev => ({
      ...prev,
      [formOverviewId]: [...(prev[formOverviewId] ?? []), editingQuestionKey],
    }))
    setAddingQuestion(false)
  }

  // The form disappears from `formsList` (and can't be navigated back to);
  // its real `orders` responses aren't touched — same "editing here never
  // touches real order data" limitation as everything else on this screen.
  function handleDeleteForm() {
    setFormsList(prev => prev.filter(f => f.id !== formOverviewId))
    navigate(FORMS_PATH)
  }

  const { visibleRowIds, visiblePackages } = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = NAV_ROWS.filter(row => matches(query, row.title, row.description))
    return {
      visibleRowIds: new Set(rows.map(row => row.id)),
      visiblePackages: eventSitePackages.filter(pkg => matches(query, pkg.name, pkg.category)),
    }
  }, [search])

  const showPackages = visibleRowIds.has('packages') || visiblePackages.length > 0
  const isEmpty = visibleRowIds.size === 0 && visiblePackages.length === 0

  const panelTitle =
    addingForm
      ? 'Form Details'
      : addingQuestion
      ? 'Question Details'
      : formOverviewId
      ? viewingResponses
        ? 'Responses'
        // Static, matching 'Add Form' above, now that renaming happens
        // inline on the form-overview screen itself.
        : 'Form Details'
      : 'Forms'

  // Save stays disabled until there's actually something to save — a name
  // that's still blank, or (when editing) hasn't changed from what's
  // already on `formsList`. A brand new form's "original" is just '' so
  // typing anything at all enables it.
  const addFormOriginalName = editingFormId ? formOverviewName ?? '' : ''
  const canSaveForm = addFormName.trim() !== '' && addFormName.trim() !== addFormOriginalName
  // Same reasoning for the question draft — required text present, and the
  // draft has actually diverged from `originalQuestionDraft` (seeded when
  // the screen opened, see `openAddQuestion`/`openEditQuestion`).
  const canSaveQuestion =
    questionDraft.question.trim() !== '' && JSON.stringify(questionDraft) !== JSON.stringify(originalQuestionDraft)

  const panelActions =
    // Buttons hidden during the simulated create — nothing to Save (already
    // saving) or Cancel out of mid-"save".
    creatingForm
      ? []
      : addingForm
      ? [
          {
            name: editingFormId ? 'Save' : 'Save & Continue',
            type: 'black',
            action: handleAddFormSave,
            isDisabled: !canSaveForm,
          },
          { name: 'Cancel', type: 'light-grey', action: () => (editingFormId ? setAddingForm(false) : navigate(FORMS_PATH)) },
        ]
      : addingQuestion
      ? [
          { name: 'Save', type: 'black', action: handleAddQuestionSave, isDisabled: !canSaveQuestion },
          { name: 'Cancel', type: 'light-grey', action: () => setAddingQuestion(false) },
          // Only once there's an actual question to delete — creating a
          // brand new one (`editingQuestionKey` null) has nothing yet.
          ...(editingQuestionKey ? [{ name: 'Delete Question', type: 'transparent red', action: handleDeleteQuestion }] : []),
        ]
      : viewingResponses
      ? []
      : formOverviewId
      // While the Form Name field's draft differs from the saved name,
      // Save/Cancel take over from Delete Form — revert: drop this
      // `isEditingFormName` branch back to just the Delete Form action.
      ? isEditingFormName
        ? [
            { name: 'Save', type: 'black', action: handleSaveFormName },
            { name: 'Cancel', type: 'light-grey', action: handleCancelFormName },
          ]
        : [{ name: 'Delete Form', type: 'transparent red', action: handleDeleteForm }]
      : undefined

  return (
    <>
      <EntityListPage
        header="Event Site & Packages"
        searchPlaceholder="Search..."
        search={search}
        onSearchChange={setSearch}
      >
        {isEmpty ? (
          <div className="efp-empty">No results match your search.</div>
        ) : (
          <>
            {NAV_ROWS.map(row => (
              <Fragment key={row.id}>
                {visibleRowIds.has(row.id) && (
                  <NavRow
                    title={row.title}
                    description={row.description}
                    onClick={row.id === 'forms' ? openFormsPanel : undefined}
                  />
                )}
                {row.id === 'event-site-details' && visibleRowIds.has('event-site-details') && (
                  <EventSitePreviewCard eventSite={eventSite} />
                )}
                {row.id === 'packages' && showPackages && (
                  <div className="efp-pkg-row">
                    {visiblePackages.map(pkg => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                )}
              </Fragment>
            ))}
          </>
        )}
      </EntityListPage>

      <AppSidePanel
        isOpen={panelOpen}
        // Both disabled during the simulated create — nothing to back out
        // of or close mid-"save" (the timer in `handleAddFormSave` would
        // still land on the new form afterward regardless, which would be a
        // confusing jump back if the panel had already navigated away).
        onClose={creatingForm ? undefined : () => navigate('/orders-forms/event-site-packages')}
        onBack={creatingForm || !panelOpen || (showingFormsList && !addingForm && !addingQuestion) ? undefined : handlePanelBack}
        title={panelTitle}
        actions={panelActions}
      >
        {creatingForm ? (
          <div className="efp-loading">
            <FontAwesomeIcon icon={faCircleNotch} className="efp-spinner" />
            <div className="efp-loading-text">
              <div className="efp-loading-title">Loading...</div>
              <div className="efp-loading-detail">This may take a moment.</div>
            </div>
          </div>
        ) : addingQuestion ? (
          <AddQuestionFields
            draft={questionDraft}
            onChange={patch => setQuestionDraft(prev => ({ ...prev, ...patch }))}
            onSubmit={handleAddQuestionSave}
            isEditing={editingQuestionKey != null}
          />
        ) : addingForm ? (
          <AddFormFields
            name={addFormName}
            onChangeName={setAddFormName}
            onSubmit={handleAddFormSave}
            isEditing={editingFormId != null}
          />
        ) : viewingResponses ? (
          formOverviewName && (
            <AllOrderResponsesForFormDraft1
              key={`${formOverviewId}-${viewingQuestion}`}
              orders={orderList}
              formName={formOverviewName}
              formId={formOverviewId}
              initialQuestion={viewingQuestion}
              onViewOrder={viewOrder}
              onViewEntity={viewEntity}
              onSaveAnswer={saveResponseAnswer}
            />
          )
        ) : formOverviewId ? (
          formOverviewName && (
            <OrderFormOverviewDraft1
              orders={orderList}
              formName={formOverviewName}
              formId={formOverviewId}
              onViewQuestion={openViewResponses}
              onAddQuestion={openAddQuestion}
              onEditQuestion={openEditQuestion}
              onEditForm={openEditForm}
              formNameDraft={formNameDraft}
              onChangeFormNameDraft={setFormNameDraft}
              onSubmitFormName={handleSaveFormName}
              extraQuestions={customQuestionsByForm[formOverviewId] ?? {}}
              deletedQuestions={deletedQuestionsByForm[formOverviewId] ?? []}
            />
          )
        ) : showingFormsList ? (
          <FormsListContent forms={formsList} onAddForm={openAddForm} onSelectForm={openFormOverview} />
        ) : null}
      </AppSidePanel>
    </>
  )
}
