import { useEffect, useRef, useState } from 'react'
import { faCheck, faMagnifyingGlass, faPen, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import GSField from '../../gs-lib/components/gs-field'
import GSButton from '../../gs-lib/components/gs-button'
import { QUESTION_OPTIONS, isAnswerMissing } from './orderUtils'
import './OrderFormResponses.scss'
import './OrderResponsesListDraft1.scss'

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

// Which of a question's answer tiles to actually show for the current
// search — keeps every answer if the question itself matched (nothing to
// narrow down there), otherwise drops the respondents that don't match so
// only the relevant tiles show. Answers keep their original index (needed
// for editing/saving/flashing) even once the non-matching ones are filtered
// out.
function visibleAnswerEntries(entry, query) {
  const indexed = entry.answers.map((answer, originalIndex) => ({ answer, originalIndex }))
  if (!query || entry.question.toLowerCase().includes(query)) return indexed
  return indexed.filter(
    ({ answer }) => answer.respondent.toLowerCase().includes(query) || String(answer.value).toLowerCase().includes(query)
  )
}

const FILL_LEVEL_LABELS = { team: 'By Team', player: 'By Player', sponsor: 'By Sponsor' }

function occurrenceLabelFor(fillLevel) {
  return FILL_LEVEL_LABELS[fillLevel] ?? 'By Order'
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
export default function OrderResponsesListDraft1({ order, onEditResponses, onSaveAnswer }) {
  const [search, setSearch] = useState('')
  const [editingAnswer, setEditingAnswer] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [flashedAnswers, setFlashedAnswers] = useState(new Set())
  const editingTileRef = useRef(null)

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
  const filteredResponses = fullResponses.filter(entry => matchesQuery(entry, query))
  const packages = groupResponses(filteredResponses)

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
        {visibleAnswerEntries(entry, query).map(({ answer, originalIndex: j }) => {
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
                  {answer.editedAt && (
                    <div className="ord-form-response-answer-edited">{formatEditedAt(answer.editedAt)}</div>
                  )}
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
      <GSActionBar type="x-large-pad H3" header="All Responses" />

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
        {packages.length === 0 ? (
          <div className="ordr1-list-empty">No results for "{search}"</div>
        ) : (
          <div className="ordr1-list-groups">
            {packages.map(pkg => (
              <div className="ordr1-package" key={pkg.packageName}>
                <div className="ordr1-package-label">{pkg.packageName}</div>

                <div className="ordr1-forms">
                  {pkg.forms.map(form => {
                    const entries = form.questions.map(entry => ({ entry, entryIndex: fullResponses.indexOf(entry) }))

                    return (
                      <div className="ordr1-form-section" key={form.formName}>
                        <div className="ordr1-form-section-header">
                          <div className="ordr1-form-section-text">
                            <div className="ordr1-form-section-title">{form.formName}</div>
                            <div className="ordr1-form-section-subtitle">{occurrenceLabelFor(form.questions[0]?.fillLevel)}</div>
                          </div>

                          <GSButton
                            type="light-grey icon"
                            size="primary"
                            buttonIcon={faPen}
                            onClick={() => onEditResponses(entries)}
                          />
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
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
