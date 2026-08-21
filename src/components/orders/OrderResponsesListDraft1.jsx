import { useEffect, useRef, useState } from 'react'
import { faCheck, faMagnifyingGlass, faPen, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import GSField from '../../gs-lib/components/gs-field'
import GSButton from '../../gs-lib/components/gs-button'
import OrderResponsesFilterNav, { RESPONSE_CATEGORIES, CATEGORY_DESCRIPTIONS } from './OrderResponsesFilterNav.jsx'
import { QUESTION_OPTIONS, isAnswerMissing, occurrenceLabelFor } from './orderUtils'
import './OrderFormResponses.scss'
import './OrderResponsesListDraft1.scss'

// Label for the "| View ___" link next to a form section's response-type
// subtitle — players roll up under their team the same way a team-level
// question does, so both read as "View Team"; there's nothing to view for a
// plain "Order Response" (no fillLevel), so it's left out of this map.
const VIEW_LINK_LABEL = {
  team: 'View Team',
  player: 'View Team',
  sponsor: 'View Sponsor',
}

const SAVE_DELAY_MS = 1000
// Matches the confirmation flash duration used for an assigned slot in the
// Hole Assignments feature (see TournamentSchedulerPage.jsx's FLASH_MS).
const FLASH_MS = 3000

function saveButtonStyle(canSave) {
  return {
    background: '#232323',
    color: '#fff',
    opacity: canSave ? 1 : 0.4,
    cursor: canSave ? 'pointer' : 'not-allowed',
  }
}

// Two-level grouping: a package (form occurrence label) can carry more than
// one form fill-out, and each of those can carry more than one question —
// the rendering below adapts to however many of each actually show up.
function groupResponses(responses) {
  const packages = []
  responses.forEach(entry => {
    let pkg = packages.find(p => p.packageName === entry.packageName)
    if (!pkg) {
      pkg = { packageName: entry.packageName, forms: [] }
      packages.push(pkg)
    }
    let form = pkg.forms.find(f => f.formName === entry.formName)
    if (!form) {
      form = { formName: entry.formName, questions: [] }
      pkg.forms.push(form)
    }
    form.questions.push(entry)
  })
  return packages
}

function formatEditedAt(iso) {
  const date = new Date(iso)
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const day = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return `Edited ${time} on ${day}`
}

function matchesQuery(entry, query) {
  if (!query) return true
  if (entry.question.toLowerCase().includes(query)) return true
  return entry.answers.some(
    a => a.respondent.toLowerCase().includes(query) || String(a.value).toLowerCase().includes(query)
  )
}

// 'all' shows every fillLevel — Team/Sponsor/Players narrow to their
// own occurrence type (see OrderResponsesFilterNav.jsx).
function matchesCategory(entry, category) {
  return category === 'all' || entry.fillLevel === category
}

// Which of a question's answer tiles to actually show for the current
// search and name filter — keeps every answer if the question itself
// matched the search (nothing to narrow down there), otherwise drops the
// respondents that don't match so only the relevant tiles show. Answers keep
// their original index (needed for editing/saving/flashing) even once the
// non-matching ones are filtered out.
function visibleAnswerEntries(entry, query, selectedName) {
  const indexed = entry.answers.map((answer, originalIndex) => ({ answer, originalIndex }))
  const forName = selectedName ? indexed.filter(({ answer }) => answer.respondent === selectedName) : indexed
  if (!query || entry.question.toLowerCase().includes(query)) return forName
  return forName.filter(
    ({ answer }) => answer.respondent.toLowerCase().includes(query) || String(answer.value).toLowerCase().includes(query)
  )
}

// Draft 1 riff — the "uncollapsed" package/form/question/answer view from
// OrderFormResponses.jsx, moved to its own searchable list page (reached via
// OrderFormResponsesSummaryDraft1's "View All") instead of an inline
// Hide/Show toggle. Search matches on question text, answer value, or
// respondent name; inline single-answer edit and per-form "Edit All" both
// still work exactly as they do in the order details view. Visually this
// page uses its own layout — a grey section per form occurrence, with each
// question inside it as its own white tile — rather than the nested-card
// style used in the order details view.
export default function OrderResponsesListDraft1({
  order,
  onEditResponses,
  onSaveAnswer,
  onViewFormAcrossOrders,
  initialSelectedName = null,
  initialCategory = null,
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialSelectedName ? 'player' : initialCategory ?? 'all')
  const [selectedName, setSelectedName] = useState(initialSelectedName)
  const [filterNavOpen, setFilterNavOpen] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [flashedAnswers, setFlashedAnswers] = useState(new Set())
  const editingTileRef = useRef(null)

  function selectCategory(value) {
    setCategory(value)
    setSelectedName(null)
    // A category with only one respondent (or none) has nothing left to
    // narrow down, so it applies directly and the nav collapses — same as a
    // one-round wave jumping straight to its round in Hole Assignments.
    setFilterNavOpen((namesByCategory[value]?.length ?? 0) > 1)
  }

  function selectName(name) {
    setSelectedName(name)
    setFilterNavOpen(false)
  }

  useEffect(() => {
    if (!editingAnswer) return

    function handleClickOutside(e) {
      if (editingTileRef.current && !editingTileRef.current.contains(e.target)) {
        cancelAnswerEdit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  const fullResponses = order.formResponses
  const query = search.trim().toLowerCase()
  const filteredResponses = fullResponses.filter(entry => matchesQuery(entry, query) && matchesCategory(entry, category))
  const packages = groupResponses(filteredResponses)

  // A name filter can leave a form with no visible answers at all (e.g.
  // picking a player from one team hides the other team's Player Details
  // entirely) — drop those empty forms, and the whole package if every one
  // of its forms comes up empty.
  const visiblePackages = packages
    .map(pkg => ({
      packageName: pkg.packageName,
      forms: pkg.forms
        .map(form => ({
          form,
          entries: form.questions
            .map(entry => ({ entry, entryIndex: fullResponses.indexOf(entry) }))
            .filter(({ entry }) => visibleAnswerEntries(entry, query, selectedName).length > 0),
        }))
        .filter(({ entries }) => entries.length > 0),
    }))
    .filter(pkg => pkg.forms.length > 0)

  // Every respondent seen at each occurrence type, so the filter nav can
  // offer a second, "similar to players" pick whenever a Team or Sponsor
  // category actually has more than one to choose from (multiple teams or
  // multiple sponsors in the same order).
  const namesByCategory = { team: [], sponsor: [], player: [] }
  fullResponses.forEach(entry => {
    const names = namesByCategory[entry.fillLevel]
    if (!names) return
    entry.answers.forEach(a => {
      if (!names.includes(a.respondent)) names.push(a.respondent)
    })
  })

  // Only offer categories this order actually has occurrences of — e.g. no
  // Sponsor tab on an order with no sponsor forms at all — and skip the
  // whole filter when there's nothing to narrow down (a single occurrence
  // type makes "All" and that type identical).
  const presentFillLevels = new Set(fullResponses.map(entry => entry.fillLevel))
  const availableCategories = RESPONSE_CATEGORIES.filter(c => c.value === 'all' || presentFillLevels.has(c.value))
  const showFilter = presentFillLevels.size > 1

  const filterDescription = selectedName ? `${selectedName}'s Responses` : CATEGORY_DESCRIPTIONS[category]

  function cancelAnswerEdit() {
    if (isSaving) return
    setEditingAnswer(null)
  }

  // Confirmation flash for an answer that was just saved — same treatment as
  // an assigned slot in Hole Assignments: holds the "just saved" cyan-800 for
  // a beat, then fades back to the resting cyan-700 (see .is-flash below).
  function flashAnswer(entryIndex, answerIndex) {
    const key = `${entryIndex}-${answerIndex}`
    setFlashedAnswers(prev => new Set(prev).add(key))
    window.setTimeout(() => {
      setFlashedAnswers(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, FLASH_MS)
  }

  function saveAnswerEdit() {
    const { entryIndex, answerIndex, draft } = editingAnswer
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(entryIndex, answerIndex, draft)
      setEditingAnswer(null)
      setIsSaving(false)
      if (draft) flashAnswer(entryIndex, answerIndex)
    }, SAVE_DELAY_MS)
  }

  // Selecting a dropdown option is already a complete, deliberate choice —
  // unlike free text there's no "still typing" state to wait out — so it
  // saves immediately instead of waiting on a separate confirm button.
  function selectAnswerOption(entryIndex, answerIndex, value) {
    setEditingAnswer(prev => ({ ...prev, draft: value }))
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(entryIndex, answerIndex, value)
      setEditingAnswer(null)
      setIsSaving(false)
      if (value) flashAnswer(entryIndex, answerIndex)
    }, SAVE_DELAY_MS)
  }

  function renderAnswers(entry, entryIndex) {
    return (
      <div className="ord-form-response-answers">
        {visibleAnswerEntries(entry, query, selectedName).map(({ answer, originalIndex: j }) => {
          const isEditing = editingAnswer?.entryIndex === entryIndex && editingAnswer?.answerIndex === j
          const canSave = isEditing && !isSaving && editingAnswer.draft !== editingAnswer.original
          const isFlashing = flashedAnswers.has(`${entryIndex}-${j}`)
          const isMissing = !isEditing && isAnswerMissing(answer)

          return (
            <div
              className={`ord-form-response-answer${isEditing ? ' is-editing' : ''}${isSaving && isEditing ? ' is-saving' : ''}${isFlashing ? ' is-flash' : ''}${isMissing ? ' ordr1-answer-missing' : ''}`}
              key={j}
              ref={isEditing ? editingTileRef : null}
              onClick={() =>
                !isEditing &&
                !isSaving &&
                setEditingAnswer({ entryIndex, answerIndex: j, draft: answer.value, original: answer.value })
              }
            >
              <div className="ord-form-response-answer-name">{answer.respondent}</div>
              {isEditing && QUESTION_OPTIONS[entry.question] ? (
                <GSField
                  label={entry.question}
                  isEditable
                  type="select"
                  options={QUESTION_OPTIONS[entry.question]}
                  selectedOption={QUESTION_OPTIONS[entry.question].find(o => o.value === editingAnswer.draft) ?? null}
                  onChange={option => selectAnswerOption(entryIndex, j, option?.value ?? '')}
                  isSearchable={false}
                  isDisabled={isSaving}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  disabled={isSaving}
                />
              ) : isEditing ? (
                <GSField
                  label={entry.question}
                  isEditable
                  value={editingAnswer.draft}
                  onChange={e => setEditingAnswer(prev => ({ ...prev, draft: e.target.value }))}
                  onSubmit={canSave ? saveAnswerEdit : undefined}
                  onKeyDown={e => e.key === 'Escape' && cancelAnswerEdit()}
                  rightIcon={faCheck}
                  rightIconClick={canSave ? saveAnswerEdit : undefined}
                  buttonStyle={saveButtonStyle(canSave)}
                  disabled={isSaving}
                  autoFocus
                />
              ) : (
                <div className="ord-form-response-answer-row">
                  {isMissing ? (
                    <div className="ordr1-answer-placeholder">No response yet</div>
                  ) : (
                    answer.value !== answer.respondent && (
                      <div className="ord-form-response-answer-value">{answer.value}</div>
                    )
                  )}
                </div>
              )}
              {!isEditing && (
                <div className="ordr1-answer-meta">
                  {answer.editedAt && (
                    <span className="ord-form-response-answer-edited">{formatEditedAt(answer.editedAt)}</span>
                  )}
                  <FontAwesomeIcon icon={faPen} className="ordr1-answer-edit-icon" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="ordr1-list">
      <GSActionBar
        type="x-large-pad H3"
        header={
          showFilter ? (
            <>
              Form Responses
              <div className="ordr1-filter-switch">
                <span className="ordr1-filter-switch-name">{filterDescription}</span>
                <span className="ordr1-filter-switch-sep">|</span>
                <button
                  type="button"
                  className="ordr1-filter-switch-link"
                  onClick={() => setFilterNavOpen(v => !v)}
                >
                  {filterNavOpen ? 'Close' : 'Change'}
                </button>
              </div>
            </>
          ) : (
            'Form Responses'
          )
        }
      />

      {showFilter && (
        <OrderResponsesFilterNav
          isOpen={filterNavOpen}
          categories={availableCategories}
          category={category}
          onSelectCategory={selectCategory}
          namesByCategory={namesByCategory}
          selectedName={selectedName}
          onSelectName={selectName}
        />
      )}

      <div className="ordr1-list-search">
        <GSinput
          leftIcon={faMagnifyingGlass}
          rightIcon={search ? faXmark : null}
          rightIconClick={() => setSearch('')}
          placeholder="Search by question, response, or respondent..."
          textValue={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="ordr1-list-body">
        {visiblePackages.length === 0 ? (
          <div className="ordr1-list-empty">{search ? `No results for "${search}"` : 'No responses match this filter.'}</div>
        ) : (
          <div className="ordr1-list-groups">
            {visiblePackages.map(pkg => (
              <div className="ordr1-package" key={pkg.packageName}>
                <div className="ordr1-package-label">{pkg.packageName}</div>

                <div className="ordr1-forms">
                  {pkg.forms.map(({ form, entries }) => (
                    <div className="ordr1-form-section" key={form.formName}>
                      <div className="ordr1-form-section-header">
                        <div className="ordr1-form-section-text">
                          <div className="ordr1-form-section-title">{form.formName}</div>
                          <div className="ordr1-form-section-subtitle">
                            <span className="ordr1-form-section-subtitle-text">
                              {occurrenceLabelFor(form.questions[0]?.fillLevel, entries[0]?.entry.answers.length ?? 1)}
                            </span>
                            {VIEW_LINK_LABEL[form.questions[0]?.fillLevel] && (
                              <>
                                <span className="ordr1-filter-switch-sep">|</span>
                                <button
                                  type="button"
                                  className="ordr1-filter-switch-link"
                                  onClick={() => onViewFormAcrossOrders(form.formName)}
                                >
                                  {VIEW_LINK_LABEL[form.questions[0]?.fillLevel]}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ordr1-question-tiles">
                        {entries.map(({ entry, entryIndex }, i) => (
                          <div className="ordr1-question-tile" key={i}>
                            <div className="ordr1-question-title">{entry.question}</div>
                            {renderAnswers(entry, entryIndex)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
