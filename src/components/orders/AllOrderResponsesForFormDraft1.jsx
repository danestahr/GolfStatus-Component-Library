import { useEffect, useRef, useState } from 'react'
import { faCheck, faChevronLeft, faChevronRight, faMagnifyingGlass, faPen, faXmark } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSinput from '../../gs-lib/components/gs-input'
import GSField from '../../gs-lib/components/gs-field'
import {
  responsesForFormAcrossOrders,
  isAnswerMissing,
  isNumberQuestion,
  occurrenceLabelFor,
  viewLinkLabelFor,
  QUESTION_OPTIONS,
  optionBreakdown,
  MISSING_OPTION_FILTER,
} from './orderUtils'
import './OrderFormResponses.scss'
import './OrderResponsesListDraft1.scss'
import './AllOrderResponsesForFormDraft1.scss'

const SAVE_DELAY_MS = 1000

function saveButtonStyle(canSave) {
  return {
    background: '#232323',
    color: '#fff',
    opacity: canSave ? 1 : 0.4,
    cursor: canSave ? 'pointer' : 'not-allowed',
  }
}

function matchesQuery(answer, query) {
  if (!query) return true
  return (
    answer.respondent.toLowerCase().includes(query) ||
    answer.buyerName.toLowerCase().includes(query) ||
    String(answer.value).toLowerCase().includes(query)
  )
}

// Every order reads as its own unit regardless of fill level — a team's/
// order's players belong together the same way a single team or sponsor
// contact does — so once a question's answers are rolled up across orders
// they're grouped back into that per-order unit rather than left as one
// long list mixing every order together. Grouped by packageName too, not
// just orderId — an order can bundle two separate teams (one per package,
// e.g. a Team Registration plus a Premium Hole Sponsor's included team), and
// each needs its own group/"View Team" link rather than getting merged into
// one combined roster (see the ord-1005 comment in mockTeams.js).
function groupAnswersByOrder(answers) {
  const groups = []
  answers.forEach(answer => {
    let group = groups.find(g => g.orderId === answer.orderId && g.packageName === answer.packageName)
    if (!group) {
      group = {
        orderId: answer.orderId,
        packageName: answer.packageName,
        buyerName: answer.buyerName,
        businessName: answer.businessName,
        answers: [],
      }
      groups.push(group)
    }
    group.answers.push(answer)
  })
  return groups
}

// Opened from the arrow button on a form section in OrderResponsesListDraft1
// (see the `ordr1-form-section-actions` group there) — same tile/list
// visuals as that per-order responses page (its scss is reused as-is), but
// scoped to a single form and rolled up across every order instead of one.
// Rather than a tab per question, a form with more than one question is
// paged through one at a time via the left/right arrows on the question nav
// bar — there's nothing to gain from seeing every question's answers at
// once when the whole point of this view is to focus on a single one (the
// "all questions as tiles" overview lives one level up, on
// OrderFormOverviewDraft1, not here).
// `initialQuestion` opens straight to a specific question (by text) instead
// of always starting at index 0 — used when this page is reached via a
// question's own "View Responses" button on OrderFormOverviewDraft1, so the
// respondent picked jumps right to the question they clicked rather than
// making them page over to it. The caller keys this component by
// formName+initialQuestion (see OrdersDraft1Page.jsx) so a new question pick
// remounts it instead of leaving a stale questionIndex from the last visit.
// `formId`, when the caller has one, is what it actually queries `orders`
// by instead of `formName` — same "stays linked across a rename" reasoning
// as OrderFormOverviewDraft1.jsx; `formName` still does the on-screen
// labeling either way (see the page header below).
export default function AllOrderResponsesForFormDraft1({ orders, formName, formId, initialQuestion, onViewOrder, onViewEntity, onSaveAnswer }) {
  const [search, setSearch] = useState('')
  const [optionFilter, setOptionFilter] = useState('all')
  // Identifies the answer being edited by its home order/entry/answer
  // indices (see `responsesForFormAcrossOrders` in orderUtils.js) rather
  // than its position in this rolled-up, filtered list — same tile-click-
  // to-edit convention as OrderFormResponses.jsx (click to turn a tile into
  // an input, Enter/the checkmark commits after a simulated save delay,
  // Escape/a click outside cancels), just keyed for a cross-order list
  // instead of a single order's own response array.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  function isEditingAnswer(answer) {
    return (
      editingAnswer?.orderId === answer.orderId &&
      editingAnswer?.responseIndex === answer.responseIndex &&
      editingAnswer?.answerIndex === answer.answerIndex
    )
  }

  function cancelAnswerEdit() {
    if (isSaving) return
    setEditingAnswer(null)
  }

  function saveAnswerEdit() {
    const { orderId, responseIndex, answerIndex, draft } = editingAnswer
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(orderId, responseIndex, answerIndex, draft)
      setEditingAnswer(null)
      setIsSaving(false)
    }, SAVE_DELAY_MS)
  }

  // Selecting a dropdown option is already a complete, deliberate choice —
  // unlike free text there's no "still typing" state to wait out — so it
  // saves immediately instead of waiting on a separate confirm button.
  function selectAnswerOption(answer, value) {
    setEditingAnswer(prev => ({ ...prev, draft: value }))
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(answer.orderId, answer.responseIndex, answer.answerIndex, value)
      setEditingAnswer(null)
      setIsSaving(false)
    }, SAVE_DELAY_MS)
  }

  const allQuestions = responsesForFormAcrossOrders(orders, formName, formId)
  const [questionIndex, setQuestionIndex] = useState(() => {
    const idx = initialQuestion ? allQuestions.findIndex(q => q.question === initialQuestion) : 0
    return idx === -1 ? 0 : idx
  })
  const hasMultipleQuestions = allQuestions.length > 1
  const currentQuestion = allQuestions[questionIndex] ?? null
  const query = search.trim().toLowerCase()

  // A different question can reuse the same option values (e.g. two
  // "Yes"/"No" questions) by coincidence — reset back to "All" on every
  // question change rather than risk a stale filter silently carrying over
  // and hiding responses that never matched anything on this question.
  useEffect(() => {
    setOptionFilter('all')
  }, [questionIndex])

  const questionOptions = currentQuestion ? QUESTION_OPTIONS[currentQuestion.question] : null
  const isMultipleChoice = !!questionOptions

  // The "No Response" bar filters to just the missing answers via a sentinel
  // value (MISSING_OPTION_FILTER) that can't collide with a real option
  // value — everything else matches the answer's value directly.
  function matchesOptionFilter(answer) {
    if (optionFilter === 'all') return true
    if (optionFilter === MISSING_OPTION_FILTER) return isAnswerMissing(answer)
    return answer.value === optionFilter
  }

  const visibleAnswers = currentQuestion
    ? currentQuestion.answers
        .filter(answer => matchesQuery(answer, query))
        .filter(answer => !isMultipleChoice || matchesOptionFilter(answer))
    : []
  const orderGroups = groupAnswersByOrder(visibleAnswers)

  // Left side: the name/business (plus the sponsor contact underneath, for
  // a sponsor-level group) with the occurrence-type label underneath that —
  // a team-level group reads as "{captain}'s Team", a sponsor-level group
  // leads with the business name, and anything else (player-level) keeps
  // the plain "{buyer}'s Order" label used everywhere else in this view.
  // The name used is the group's OWN respondent (its first answer), not the
  // order's `buyerName` — `buyerName` is one value per order, so two teams
  // or two sponsors sharing an order (see the ord-1005/ord-1006 comments in
  // mockTeams.js/mockOrders.js) would otherwise render identical, unlabeled
  // headers back to back. The first respondent is always that group's own
  // captain/contact (every mock roster lists them first).
  function renderGroupName(group, fillLevel) {
    const contactName = group.answers[0]?.respondent ?? group.buyerName

    if (fillLevel === 'sponsor') {
      return (
        <>
          <span className="aof-order-group-name">{group.businessName ?? group.buyerName}</span>
          <div className="aof-order-group-contact">{contactName}</div>
        </>
      )
    }

    return <span className="aof-order-group-name">{contactName}'s {fillLevel === 'team' ? 'Team' : 'Order'}</span>
  }

  function renderAnswerTile(answer, key) {
    const isEditing = isEditingAnswer(answer)
    const canSave = isEditing && !isSaving && editingAnswer.draft !== editingAnswer.original

    return (
      <div
        className={`ord-form-response-answer${isAnswerMissing(answer) && !isEditing ? ' ordr1-answer-missing' : ''}${isEditing ? ' is-editing' : ''}${isSaving && isEditing ? ' is-saving' : ''}`}
        key={key}
        ref={isEditing ? editingTileRef : null}
      >
        <div className="ord-form-response-answer-name">{answer.respondent}</div>
        {isEditing && isMultipleChoice ? (
          <GSField
            label={currentQuestion.question}
            isEditable
            type="select"
            options={questionOptions}
            selectedOption={questionOptions.find(o => o.value === editingAnswer.draft) ?? null}
            onChange={option => selectAnswerOption(answer, option?.value ?? '')}
            isSearchable={false}
            isDisabled={isSaving}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            disabled={isSaving}
          />
        ) : isEditing ? (
          <GSField
            label={currentQuestion.question}
            isEditable
            type={isNumberQuestion(currentQuestion.question) ? 'number' : undefined}
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
            {isAnswerMissing(answer) ? (
              <div className="ordr1-answer-placeholder">No response yet</div>
            ) : (
              answer.value !== answer.respondent && <div className="ord-form-response-answer-value">{answer.value}</div>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="ordr1-answer-meta">
            <GSButton
              type="white icon ord-form-response-answer-edit-btn"
              size="primary"
              buttonIcon={faPen}
              isFocusable
              onClick={() =>
                !isSaving &&
                setEditingAnswer({
                  orderId: answer.orderId,
                  responseIndex: answer.responseIndex,
                  answerIndex: answer.answerIndex,
                  draft: answer.value,
                  original: answer.value,
                })
              }
            />
          </div>
        )}
      </div>
    )
  }

  function goToPrevQuestion() {
    setQuestionIndex(i => Math.max(0, i - 1))
  }

  function goToNextQuestion() {
    setQuestionIndex(i => Math.min(allQuestions.length - 1, i + 1))
  }

  // The filter tile only ever shows for a multiple-choice question — a free-
  // text/number question has no fixed value set to break down this way, so
  // it skips straight to the search bar and response list with nothing to
  // filter by.
  const breakdown = currentQuestion ? optionBreakdown(currentQuestion.question, currentQuestion.answers) : null

  // Each bar's fill sits at its own slice of the whole 0-100% range, one
  // after another in bar order, rather than every fill starting back at the
  // track's left edge — so the run of bars reads as one distribution added
  // up across rows (Figma "Answer Breakdown" component,
  // node 2450:51922) instead of a set of independent 0-N gauges.
  let cumulativePct = 0
  const barsWithOffset = breakdown
    ? breakdown.bars.map(bar => {
        const pct = breakdown.total ? (bar.count / breakdown.total) * 100 : 0
        const offsetPct = cumulativePct
        cumulativePct += pct
        return { ...bar, pct, offsetPct }
      })
    : []

  return (
    <div className="ordr1-list aof-list">
      <GSActionBar
        type="x-large-pad H3"
        header={
          currentQuestion && (
            <>
              {currentQuestion.question}
              <div className="aof-answer-summary">
                {hasMultipleQuestions ? `${questionIndex + 1} of ${allQuestions.length} Questions | ${formName}` : formName}
              </div>
            </>
          )
        }
        pageActions={
          hasMultipleQuestions
            ? [
                {
                  actionIcon: faChevronLeft,
                  actionClick: goToPrevQuestion,
                  type: 'light-grey icon',
                  isDisabled: questionIndex === 0,
                },
                {
                  actionIcon: faChevronRight,
                  actionClick: goToNextQuestion,
                  type: 'light-grey icon',
                  isDisabled: questionIndex === allQuestions.length - 1,
                },
              ]
            : []
        }
      />

      <div className="ordr1-list-body">
        <div className="ordr1-list-groups">
          <div className="ordr1-package">
            {breakdown && (
              <div className="ordr1-question-tile aof-option-bars-tile">
                <div className="aof-option-bars">
                  {barsWithOffset.map(bar => {
                    const isActive = optionFilter === bar.value
                    return (
                      <button
                        type="button"
                        className={`aof-option-bar-row${bar.isMissing ? ' is-missing' : ''}${isActive ? ' is-active' : ''}`}
                        key={bar.label}
                        onClick={() => setOptionFilter(isActive ? 'all' : bar.value)}
                      >
                        <div className="aof-option-bar-header">
                          <div className="aof-option-bar-label">{bar.label}</div>
                          <div className="aof-option-bar-count">{bar.count}</div>
                        </div>
                        <div className="aof-option-bar-track">
                          <div
                            className="aof-option-bar-fill"
                            style={{ left: `${bar.offsetPct}%`, width: `${bar.pct}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="ordr1-list-search">
              <GSinput
                leftIcon={faMagnifyingGlass}
                rightIcon={search ? faXmark : null}
                rightIconClick={() => setSearch('')}
                placeholder="Search by respondent, buyer, or response..."
                textValue={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {currentQuestion && (
              <div className="ordr1-forms">
                <div className="ordr1-form-section">
                  {orderGroups.length === 0 ? (
                    <div className="ordr1-question-tile">
                      <div className="ordr1-list-empty">{search ? `No results for "${search}"` : 'No responses match this filter.'}</div>
                    </div>
                  ) : (
                    <div className="aof-order-groups">
                      {orderGroups.map(group => (
                        <div className="ordr1-question-tile aof-order-group" key={`${group.orderId}-${group.packageName}`}>
                          <div className="aof-order-group-header">
                            <div className="aof-order-group-name-col">
                              {renderGroupName(group, currentQuestion.fillLevel)}
                              <div className="aof-order-group-type">
                                {occurrenceLabelFor(currentQuestion.fillLevel, group.answers.length)}
                              </div>
                            </div>

                            <div className="aof-order-group-links">
                              <button type="button" className="aof-order-group-link" onClick={() => onViewOrder(group.orderId)}>
                                View Order
                              </button>
                              <span className="aof-order-group-sep">|</span>
                              {/* Unlike "View Order", this group's order can belong to a
                                  different team/sponsor than whichever one the caller's
                                  panel currently has open — onViewEntity re-resolves the
                                  specific team/sponsor for THIS order rather than assuming
                                  it's the one already on screen. Passing this group's own
                                  packageName along disambiguates which of an order's teams
                                  it is, for the rare order that bundles more than one. */}
                              <button
                                type="button"
                                className="aof-order-group-link"
                                onClick={() => onViewEntity(group.orderId, currentQuestion.fillLevel, group.packageName)}
                              >
                                {viewLinkLabelFor(currentQuestion.fillLevel)}
                              </button>
                            </div>
                          </div>

                          <div className="ord-form-response-answers">
                            {group.answers.map((answer, i) => renderAnswerTile(answer, i))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
