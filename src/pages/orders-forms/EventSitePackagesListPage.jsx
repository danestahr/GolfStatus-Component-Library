import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

// One side panel for the whole Forms flow (list → add form → form overview →
// add question) — `panelScreen` picks which content it shows, same single-
// panel-many-screens convention as TeamsListPage/SponsorsListPage, rather
// than each destination opening its own stacked panel. Side panels replace
// each other here; they aren't routes.
export default function EventSitePackagesListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [panelScreen, setPanelScreen] = useState(null) // null | 'forms' | 'add-form' | 'form-overview' | 'add-question' | 'view-responses'
  const [formsList, setFormsList] = useState(initialForms)
  // Only mutated by AllOrderResponsesForFormDraft1's inline answer editing
  // (see `saveResponseAnswer` below) — this page has no order-details screen
  // of its own (its "View Order" link navigates elsewhere, see `viewOrder`),
  // so nothing else here needs a live order list.
  const [orderList, setOrderList] = useState(initialOrders)
  const [addFormName, setAddFormName] = useState('')
  // null while adding a brand new form; the form's stable id while editing
  // an existing one (opened via OrderFormOverviewDraft1's edit pencil) —
  // same convention as `editingQuestionKey` below.
  const [editingFormId, setEditingFormId] = useState(null)
  // The id, not the name — a rename only ever touches its `formsList` entry
  // (see `handleAddFormSave`), so keying the "currently open" form by id and
  // deriving its live display name from `formsList` below means the panel
  // just reflects the rename automatically, with nothing to keep in sync by
  // hand. It's also what lets `orders` responses stay linked across a rename
  // (see `formId` in OrderFormOverviewDraft1.jsx/orderUtils.js) — a form's
  // `formsList` name can drift from what's stored on its `orders` responses,
  // but its id never does.
  const [formOverviewId, setFormOverviewId] = useState(null)
  const formOverviewName = formsList.find(f => f.id === formOverviewId)?.name ?? null
  // The Form Name field's draft on OrderFormOverviewDraft1 itself (renaming
  // moved inline there — see `handleSaveFormName`/`handleCancelFormName`
  // below). Seeded from the form's current name wherever `formOverviewId`
  // gets set (`openFormOverview`, and the new-form branch of
  // `handleAddFormSave`) rather than synced via effect.
  const [formNameDraft, setFormNameDraft] = useState('')
  const isEditingFormName = formOverviewName != null && formNameDraft !== formOverviewName
  const [viewingQuestion, setViewingQuestion] = useState(null)
  const [questionDraft, setQuestionDraft] = useState(emptyQuestionDraft)
  // Each question's editable draft (type/required/etc), keyed by question
  // text and then by form id — covers both a question this page created
  // from scratch (no real order data backs it) and an edited override of a
  // real question's metadata (OrderFormOverviewDraft1 merges the override
  // in; the real answers/respondent counts always still come from `orders`).
  const [customQuestionsByForm, setCustomQuestionsByForm] = useState({})
  // null while adding a brand new question; the question's original text
  // while editing an existing one (its own or a real question's override).
  const [editingQuestionKey, setEditingQuestionKey] = useState(null)

  function openFormsPanel() {
    setPanelScreen('forms')
  }

  function openAddForm() {
    setEditingFormId(null)
    setAddFormName('')
    setPanelScreen('add-form')
  }

  function openEditForm() {
    setEditingFormId(formOverviewId)
    setAddFormName(formOverviewName)
    setPanelScreen('add-form')
  }

  function openFormOverview(form) {
    setFormOverviewId(form.id)
    setFormNameDraft(form.name)
    setPanelScreen('form-overview')
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
    setPanelScreen('add-question')
  }

  function openEditQuestion(draft) {
    setEditingQuestionKey(draft.question)
    setQuestionDraft(draft)
    setPanelScreen('add-question')
  }

  function openViewResponses(question) {
    setViewingQuestion(question)
    setPanelScreen('view-responses')
  }

  // AllOrderResponsesForFormDraft1's "View Order"/"View Team"/"View Sponsor"
  // links — this page has no order-details screen of its own, so they
  // navigate to whichever page actually owns that entity, same resolution
  // OrdersDraft1Page/TeamsListPage/SponsorsListPage use.
  function viewOrder(orderId) {
    navigate(`/orders-draft-1/${orderId}`)
  }

  function viewEntity(orderId, fillLevel, packageName) {
    if (fillLevel === 'sponsor') {
      const sponsor = sponsors.find(s => s.orderId === orderId)
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
    if (panelScreen === 'view-responses') setPanelScreen('form-overview')
    else if (panelScreen === 'add-question') setPanelScreen('form-overview')
    else if (panelScreen === 'add-form' && editingFormId) setPanelScreen('form-overview')
    else setPanelScreen('forms')
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
      setPanelScreen('form-overview')
      return
    }

    const id = `form-${formsList.length + 1}`
    setFormsList(prev => [
      ...prev,
      { id, name, createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    ])
    setFormOverviewId(id)
    setFormNameDraft(name)
    setPanelScreen('form-overview')
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
    setPanelScreen('form-overview')
  }

  function handleDeleteQuestion() {
    setCustomQuestionsByForm(prev => {
      const existing = { ...(prev[formOverviewId] ?? {}) }
      delete existing[editingQuestionKey]
      return { ...prev, [formOverviewId]: existing }
    })
    setPanelScreen('form-overview')
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
    panelScreen === 'add-form'
      ? 'Form Details'
      : panelScreen === 'form-overview'
      // Static, matching 'add-form' above, now that renaming happens inline
      // on this same screen — revert: `formOverviewName ?? ''`.
      ? 'Form Details'
      : panelScreen === 'add-question'
      ? 'Question Details'
      : panelScreen === 'view-responses'
      ? viewingQuestion ?? ''
      : 'Forms'

  const panelActions =
    panelScreen === 'add-form'
      ? [
          { name: editingFormId ? 'Save' : 'Save & Continue', type: 'black', action: handleAddFormSave },
          { name: 'Cancel', type: 'light-grey', action: () => setPanelScreen(editingFormId ? 'form-overview' : 'forms') },
        ]
      : panelScreen === 'add-question'
      ? [
          { name: 'Save', type: 'black', action: handleAddQuestionSave },
          { name: 'Cancel', type: 'light-grey', action: () => setPanelScreen('form-overview') },
          { name: 'Delete Question', type: 'transparent red', action: handleDeleteQuestion },
        ]
      : panelScreen === 'view-responses'
      ? []
      : panelScreen === 'form-overview'
      // While the Form Name field's draft differs from the saved name,
      // Save/Cancel take over from Delete Form — revert: drop this
      // `isEditingFormName` branch back to just the Delete Form action.
      ? isEditingFormName
        ? [
            { name: 'Save', type: 'black', action: handleSaveFormName },
            { name: 'Cancel', type: 'light-grey', action: handleCancelFormName },
          ]
        : [{ name: 'Delete Form', type: 'transparent red', action: () => {} }]
      : undefined

  return (
    <>
      <EntityListPage
        header="Event Site & Packages"
        searchPlaceholder="Search Event Site and Packages..."
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
        isOpen={!!panelScreen}
        onClose={() => setPanelScreen(null)}
        onBack={panelScreen === 'forms' || !panelScreen ? undefined : handlePanelBack}
        title={panelTitle}
        actions={panelActions}
      >
        {panelScreen === 'forms' ? (
          <FormsListContent forms={formsList} onAddForm={openAddForm} onSelectForm={openFormOverview} />
        ) : panelScreen === 'add-form' ? (
          <AddFormFields
            name={addFormName}
            onChangeName={setAddFormName}
            onSubmit={handleAddFormSave}
            isEditing={editingFormId != null}
          />
        ) : panelScreen === 'form-overview' ? (
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
            />
          )
        ) : panelScreen === 'add-question' ? (
          <AddQuestionFields
            draft={questionDraft}
            onChange={patch => setQuestionDraft(prev => ({ ...prev, ...patch }))}
            onSubmit={handleAddQuestionSave}
            isEditing={editingQuestionKey != null}
          />
        ) : panelScreen === 'view-responses' ? (
          formOverviewName &&
          viewingQuestion && (
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
        ) : null}
      </AppSidePanel>
    </>
  )
}
