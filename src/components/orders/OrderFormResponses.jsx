import { useEffect, useRef, useState } from 'react'
import { faCheck, faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSField from '../../gs-lib/components/gs-field'
import GSButton from '../../gs-lib/components/gs-button'
import UnsavedAnswerBanner from './UnsavedAnswerBanner.jsx'
import { QUESTION_OPTIONS } from './orderUtils'
import './OrderFormResponses.scss'

const SAVE_DELAY_MS = 1000

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

export default function OrderFormResponses({ responses, onEditResponses, onSaveAnswer }) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedBanner, setShowUnsavedBanner] = useState(false)
  const editingTileRef = useRef(null)

  useEffect(() => {
    if (!editingAnswer) return

    // A dirty text/number draft doesn't get silently thrown away by
    // clicking elsewhere anymore — it surfaces the unsaved-changes banner
    // instead (see `showUnsavedBanner`). Skipped mid-save (a multiple-
    // choice pick auto-saves right after setting `draft`) and reset if the
    // click lands back inside the tile being edited.
    function handleClickOutside(e) {
      if (!editingTileRef.current || isSaving) return
      if (editingTileRef.current.contains(e.target)) {
        setShowUnsavedBanner(false)
        return
      }
      // A mousedown on a DIFFERENT answer tile is left alone here — that
      // tile's own onClick (via openAnswerTile) already handles it
      // completely once `click` fires. Cancelling here first would race
      // it: this runs on mousedown, before `click` is dispatched, so
      // closing the current tile now shrinks it and reflows the list
      // right before the browser hit-tests `click` — shifting whatever
      // tile is below the one just closed out from under an unmoved
      // pointer, so the click lands on the wrong tile (or nothing).
      // Skipping tiles here and letting `click` do the work sidesteps
      // that reflow entirely; only a genuinely-outside click (header,
      // blank space) is handled below.
      if (e.target.closest?.('.ord-form-response-answer')) return
      if (editingAnswer.draft !== editingAnswer.original) {
        setShowUnsavedBanner(true)
      } else {
        cancelAnswerEdit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  if (!responses || responses.length === 0) return null

  const formCount = new Set(responses.map(r => r.formName)).size
  const packages = groupResponses(responses)

  function cancelAnswerEdit() {
    if (isSaving) return
    setEditingAnswer(null)
    setShowUnsavedBanner(false)
  }

  // Tapping a tile while a different one is sitting on a dirty draft
  // shouldn't just abandon that draft and jump straight to the new tile —
  // same unsaved-changes banner as clicking outside entirely.
  function openAnswerTile(entryIndex, answerIndex, answer) {
    if (isSaving) return
    if (editingAnswer && editingAnswer.draft !== editingAnswer.original) {
      setShowUnsavedBanner(true)
      return
    }
    setEditingAnswer({ entryIndex, answerIndex, draft: answer.value, original: answer.value })
  }

  function saveAnswerEdit() {
    const { entryIndex, answerIndex, draft } = editingAnswer
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(entryIndex, answerIndex, draft)
      setEditingAnswer(null)
      setIsSaving(false)
      setShowUnsavedBanner(false)
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
    }, SAVE_DELAY_MS)
  }

  function renderAnswers(entry, entryIndex) {
    return (
      <div className="ord-form-response-answers">
        {entry.answers.map((answer, j) => {
          const isEditing = editingAnswer?.entryIndex === entryIndex && editingAnswer?.answerIndex === j
          const canSave = isEditing && !isSaving && editingAnswer.draft !== editingAnswer.original

          return (
            <div
              className={`ord-form-response-answer${isEditing ? ' is-editing' : ''}${isSaving && isEditing ? ' is-saving' : ''}`}
              key={j}
              ref={isEditing ? editingTileRef : null}
              onClick={() => !isEditing && openAnswerTile(entryIndex, j, answer)}
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
                  {answer.value !== answer.respondent && (
                    <div className="ord-form-response-answer-value">{answer.value}</div>
                  )}
                </div>
              )}

              {!isEditing && (
                <div className="ordr1-answer-meta">
                  {answer.editedAt && (
                    <span className="ord-form-response-answer-edited">{formatEditedAt(answer.editedAt)}</span>
                  )}
                  <FontAwesomeIcon icon={faPen} className="ord-form-response-answer-edit-icon" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="ord-form-responses">
      <div className="ord-form-responses-header">
        <div>
          <div className="ord-form-responses-title">Form Responses</div>
          <div className="ord-form-responses-subtitle">{formCount} {formCount === 1 ? 'Form' : 'Forms'}</div>
        </div>
        <button
          type="button"
          className="ord-form-responses-toggle"
          onClick={() => setCollapsed(prev => !prev)}
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      {showUnsavedBanner && editingAnswer && (
        <UnsavedAnswerBanner onSave={saveAnswerEdit} onDiscard={cancelAnswerEdit} isSaving={isSaving} />
      )}

      {!collapsed && (
        <div className="ord-form-responses-list">
          {packages.map(pkg => (
            <div className="ord-form-response-package" key={pkg.packageName}>
              <div className="ord-form-response-package-label">{pkg.packageName}</div>

              <div className="ord-form-response-occurrences">
                {pkg.forms.map(form => {
                  const entries = form.questions.map(entry => ({ entry, entryIndex: responses.indexOf(entry) }))
                  const isSingleQuestion = entries.length === 1

                  return (
                    <div className="ord-form-response-group" key={form.formName}>
                      {isSingleQuestion ? (
                        <>
                          <div className="ord-form-response-group-header">
                            <div className="ord-form-response-group-text">
                              <div className="ord-form-response-group-title">{entries[0].entry.question}</div>
                              <div className="ord-form-response-group-subtitle">{form.formName}</div>
                            </div>

                            <GSButton
                              type="light-grey icon"
                              size="primary"
                              buttonIcon={faPen}
                              onClick={() => onEditResponses(entries)}
                            />
                          </div>

                          {renderAnswers(entries[0].entry, entries[0].entryIndex)}
                        </>
                      ) : (
                        <>
                          <div className="ord-form-response-group-header">
                            <div className="ord-form-response-group-text">
                              <div className="ord-form-response-group-title">{form.formName}</div>
                              <div className="ord-form-response-group-subtitle">{entries.length} Questions</div>
                            </div>

                            <GSButton
                              type="light-grey icon"
                              size="primary"
                              buttonIcon={faPen}
                              onClick={() => onEditResponses(entries)}
                            />
                          </div>

                          <div className="ord-form-response-questions">
                            {entries.map(({ entry, entryIndex }, i) => (
                              <div className="ord-form-response-question-block" key={i}>
                                <div className="ord-form-response-question">{entry.question}</div>
                                {renderAnswers(entry, entryIndex)}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
