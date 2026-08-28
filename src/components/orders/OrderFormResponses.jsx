import { useEffect, useRef, useState } from 'react'
import { faCheck, faPen, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import GSField from '../../gs-lib/components/gs-field'
import GSButton from '../../gs-lib/components/gs-button'
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

  if (!responses || responses.length === 0) return null

  const formCount = new Set(responses.map(r => r.formName)).size
  const packages = groupResponses(responses)

  function cancelAnswerEdit() {
    if (isSaving) return
    setEditingAnswer(null)
  }

  function saveAnswerEdit() {
    const { entryIndex, answerIndex, draft } = editingAnswer
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(entryIndex, answerIndex, draft)
      setEditingAnswer(null)
      setIsSaving(false)
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

              <div className="ordr1-answer-meta">
                {!isEditing && answer.editedAt && (
                  <span className="ord-form-response-answer-edited">{formatEditedAt(answer.editedAt)}</span>
                )}
                {isEditing ? (
                  <GSButton buttonIcon={faTimesCircle} size="primary" isFocusable onClick={cancelAnswerEdit} />
                ) : (
                  <GSButton
                    type="white icon ord-form-response-answer-edit-btn"
                    size="primary"
                    buttonIcon={faPen}
                    isFocusable
                    onClick={() =>
                      !isSaving &&
                      setEditingAnswer({ entryIndex, answerIndex: j, draft: answer.value, original: answer.value })
                    }
                  />
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
