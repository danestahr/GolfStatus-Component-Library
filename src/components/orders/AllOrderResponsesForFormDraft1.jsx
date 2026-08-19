import { useEffect, useState } from 'react'
import { faChevronLeft, faChevronRight, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import GSButton from '../../gs-lib/components/gs-button'
import {
  responsesForFormAcrossOrders,
  isAnswerMissing,
  responseTypeFor,
  occurrenceLabelFor,
  viewLinkLabelFor,
  isQuestionRequired,
  QUESTION_OPTIONS,
  optionBreakdown,
  MISSING_OPTION_FILTER,
} from './orderUtils'
import './OrderFormResponses.scss'
import './OrderResponsesListDraft1.scss'
import './AllOrderResponsesForFormDraft1.scss'

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
// long list mixing every order together.
function groupAnswersByOrder(answers) {
  const groups = []
  answers.forEach(answer => {
    let group = groups.find(g => g.orderId === answer.orderId)
    if (!group) {
      group = { orderId: answer.orderId, buyerName: answer.buyerName, businessName: answer.businessName, answers: [] }
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
export default function AllOrderResponsesForFormDraft1({ orders, formName, initialQuestion, onViewOrder }) {
  const [search, setSearch] = useState('')
  const [answeredFilter, setAnsweredFilter] = useState('all')
  const [optionFilter, setOptionFilter] = useState('all')

  const allQuestions = responsesForFormAcrossOrders(orders, formName)
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

  const isRequired = currentQuestion ? isQuestionRequired(currentQuestion.question) : false
  const questionOptions = currentQuestion ? QUESTION_OPTIONS[currentQuestion.question] : null
  const isMultipleChoice = !!questionOptions
  // A fixed-choice question is better sliced by which option was picked than
  // by answered/unanswered, so the option-value tabs take over for it
  // entirely — a required question is expected to end up fully answered
  // anyway, so that filter is skipped there too regardless of question type.
  const effectiveAnsweredFilter = isMultipleChoice || isRequired ? 'all' : answeredFilter

  // The "No Response" bar filters to just the missing answers via a sentinel
  // value (MISSING_OPTION_FILTER) that can't collide with a real option
  // value — everything else matches the answer's value directly.
  function matchesOptionFilter(answer) {
    if (optionFilter === 'all') return true
    if (optionFilter === MISSING_OPTION_FILTER) return isAnswerMissing(answer)
    return answer.value === optionFilter
  }

  const answeredCount = currentQuestion ? currentQuestion.answers.filter(a => !isAnswerMissing(a)).length : 0
  const unansweredCount = currentQuestion ? currentQuestion.answers.filter(isAnswerMissing).length : 0
  const filteredCount = isMultipleChoice
    ? currentQuestion.answers.filter(matchesOptionFilter).length
    : effectiveAnsweredFilter === 'answered'
    ? answeredCount
    : effectiveAnsweredFilter === 'unanswered'
    ? unansweredCount
    : answeredCount + unansweredCount

  const visibleAnswers = currentQuestion
    ? currentQuestion.answers
        .filter(answer => matchesQuery(answer, query))
        .filter(answer => {
          if (isMultipleChoice) return matchesOptionFilter(answer)
          if (effectiveAnsweredFilter === 'answered') return !isAnswerMissing(answer)
          if (effectiveAnsweredFilter === 'unanswered') return isAnswerMissing(answer)
          return true
        })
    : []
  const orderGroups = groupAnswersByOrder(visibleAnswers)

  // Left side: the name/business (plus the sponsor contact underneath, for
  // a sponsor-level group) with the occurrence-type label underneath that —
  // a team-level group reads as "{captain}'s Team", a sponsor-level group
  // leads with the business name, and anything else (player-level) keeps
  // the plain "{buyer}'s Order" label used everywhere else in this view.
  function renderGroupName(group, fillLevel) {
    if (fillLevel === 'sponsor') {
      return (
        <>
          <span className="aof-order-group-name">{group.businessName ?? group.buyerName}</span>
          <div className="aof-order-group-contact">{group.buyerName}</div>
        </>
      )
    }

    return <span className="aof-order-group-name">{group.buyerName}'s {fillLevel === 'team' ? 'Team' : 'Order'}</span>
  }

  function renderAnswerTile(answer, key) {
    return (
      <div className={`ord-form-response-answer${isAnswerMissing(answer) ? ' ordr1-answer-missing' : ''}`} key={key}>
        <div className="ord-form-response-answer-name">{answer.respondent}</div>
        <div className="ord-form-response-answer-row">
          {isAnswerMissing(answer) ? (
            <div className="ordr1-answer-placeholder">No response yet</div>
          ) : (
            answer.value !== answer.respondent && <div className="ord-form-response-answer-value">{answer.value}</div>
          )}
        </div>
      </div>
    )
  }

  function goToPrevQuestion() {
    setQuestionIndex(i => Math.max(0, i - 1))
  }

  function goToNextQuestion() {
    setQuestionIndex(i => Math.min(allQuestions.length - 1, i + 1))
  }

  const breakdown = currentQuestion ? optionBreakdown(currentQuestion.question, currentQuestion.answers) : null

  return (
    <div className="ordr1-list aof-list">
      <GSActionBar
        type="x-large-pad H3"
        header={
          <>
            {`${formName} Responses`}
            {currentQuestion && (
              <div className="aof-answer-summary">
                {filteredCount} {filteredCount === 1 ? 'Response' : 'Responses'}
              </div>
            )}
          </>
        }
      />

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

      <div className="ordr1-list-body">
        <div className="ordr1-list-groups">
          <div className="ordr1-package">
            <GSActionBar
              type="aof-question-nav"
              header={
                currentQuestion && (
                  <>
                    {currentQuestion.question}
                    <div className="aof-question-type">
                      {responseTypeFor(currentQuestion.question)} ({isRequired ? 'Required' : 'Optional'})
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

            {breakdown && (
              <div className="ordr1-question-tile aof-option-bars-tile">
                <div className="aof-option-bars">
                  {breakdown.bars.map(bar => {
                    const isActive = optionFilter === bar.value
                    return (
                      <button
                        type="button"
                        className={`aof-option-bar-row${bar.isMissing ? ' is-missing' : ''}${isActive ? ' is-active' : ''}`}
                        key={bar.label}
                        onClick={() => setOptionFilter(isActive ? 'all' : bar.value)}
                      >
                        <div className="aof-option-bar-label">{bar.label}</div>
                        <div className="aof-option-bar-track">
                          <div
                            className="aof-option-bar-fill"
                            style={{ width: `${breakdown.total ? (bar.count / breakdown.total) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="aof-option-bar-count">{bar.count}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {currentQuestion && (
              <div className="ordr1-forms">
                <div className="ordr1-form-section">
                  {!isMultipleChoice && !isRequired && (
                    <div className="aof-answer-meta">
                      <div className="aof-answer-filter-tabs">
                        <GSButton
                          type={answeredFilter === 'all' ? 'black' : 'light-grey'}
                          isFocusable
                          title="All"
                          onClick={() => setAnsweredFilter('all')}
                        />
                        <GSButton
                          type={answeredFilter === 'answered' ? 'black' : 'light-grey'}
                          isFocusable
                          title="Answered"
                          onClick={() => setAnsweredFilter('answered')}
                        />
                        <GSButton
                          type={answeredFilter === 'unanswered' ? 'black' : 'light-grey'}
                          isFocusable
                          title="Unanswered"
                          onClick={() => setAnsweredFilter('unanswered')}
                        />
                      </div>
                    </div>
                  )}

                  {orderGroups.length === 0 ? (
                    <div className="ordr1-question-tile">
                      <div className="ordr1-list-empty">{search ? `No results for "${search}"` : 'No responses match this filter.'}</div>
                    </div>
                  ) : (
                    <div className="aof-order-groups">
                      {orderGroups.map(group => (
                        <div className="ordr1-question-tile aof-order-group" key={group.orderId}>
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
                              <button type="button" className="aof-order-group-link" onClick={() => onViewOrder(group.orderId)}>
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
