import { useEffect, useRef, useState } from 'react'
import { faCheck, faChevronLeft, faChevronRight, faMagnifyingGlass, faPen, faTimesCircle, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSinput from '../../gs-lib/components/gs-input'
import GSField from '../../gs-lib/components/gs-field'
import UnsavedAnswerBanner from './UnsavedAnswerBanner.jsx'
import {
  responsesForFormAcrossOrders,
  isAnswerMissing,
  isNumberQuestion,
  occurrenceLabelFor,
  QUESTION_OPTIONS,
  optionBreakdown,
  MISSING_OPTION_FILTER,
} from './orderUtils'
import './OrderFormResponses.scss'
import './OrderResponsesListDraft1.scss'
import './AllOrderResponsesForFormDraft1.scss'

// What each quick-filter card's caption counts by — a player-level
// question's cards count players, a team-level one counts whole teams, etc.;
// a plain order-level question (no fillLevel) falls back to counting orders.
const FILL_LEVEL_COUNT_NOUNS = { team: 'Teams', player: 'Players', sponsor: 'Sponsors' }

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
export default function AllOrderResponsesForFormDraft1({ orders, formName, formId, initialQuestion, onSaveAnswer }) {
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
      // that reflow entirely; only a genuinely-outside click (search bar,
      // header, blank space) is handled below.
      if (e.target.closest?.('.ord-form-response-answer')) return
      if (editingAnswer.draft !== editingAnswer.original) {
        setShowUnsavedBanner(true)
      } else {
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
    setShowUnsavedBanner(false)
  }

  // Tapping a tile while a different one is sitting on a dirty draft
  // shouldn't just abandon that draft and jump straight to the new tile —
  // same unsaved-changes banner as clicking outside entirely.
  function openAnswerTile(answer) {
    if (isSaving) return
    if (editingAnswer && editingAnswer.draft !== editingAnswer.original) {
      setShowUnsavedBanner(true)
      return
    }
    setEditingAnswer({
      orderId: answer.orderId,
      responseIndex: answer.responseIndex,
      answerIndex: answer.answerIndex,
      draft: answer.value,
      original: answer.value,
    })
  }

  function saveAnswerEdit() {
    const { orderId, responseIndex, answerIndex, draft } = editingAnswer
    setIsSaving(true)
    setTimeout(() => {
      onSaveAnswer(orderId, responseIndex, answerIndex, draft)
      setEditingAnswer(null)
      setIsSaving(false)
      setShowUnsavedBanner(false)
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

  // Flat, A-Z-by-respondent list — no more per-order/team grouping, so a
  // form with the same question answered across many orders just reads as
  // one plain list of editable tiles instead of a stack of order sections.
  const visibleAnswers = currentQuestion
    ? currentQuestion.answers
        .filter(answer => matchesQuery(answer, query))
        .filter(answer => !isMultipleChoice || matchesOptionFilter(answer))
        .slice()
        .sort((a, b) => a.respondent.localeCompare(b.respondent))
    : []

  function renderAnswerTile(answer, key) {
    const isEditing = isEditingAnswer(answer)
    const canSave = isEditing && !isSaving && editingAnswer.draft !== editingAnswer.original

    return (
      <div
        className={`ord-form-response-answer${isAnswerMissing(answer) && !isEditing ? ' ordr1-answer-missing' : ''}${isEditing ? ' is-editing' : ''}${isSaving && isEditing ? ' is-saving' : ''}`}
        key={key}
        ref={isEditing ? editingTileRef : null}
        onClick={() => !isEditing && openAnswerTile(answer)}
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
            <FontAwesomeIcon icon={faPen} className="ord-form-response-answer-edit-icon" />
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

  return (
    <div className="ordr1-list aof-list">
      <GSActionBar
        type="x-large-pad H3"
        header={
          currentQuestion && (
            <>
              {currentQuestion.question}
              <div className="aof-answer-summary">
                {/* Every respondent who had this question in front of them at
                    all — a real answer or not (the "No Response" bucket in
                    the quick filter below counts the gap) — not just the
                    ones who actually filled it in, so this reads as "how
                    many X could've answered" rather than a live response
                    tally. */}
                {currentQuestion.answers.length} {occurrenceLabelFor(currentQuestion.fillLevel, currentQuestion.answers.length)} | {formName}
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
        <div className="aof-quick-filter-wrap">
          <div className="aof-quick-filter-list">
            {breakdown.bars
              .filter(bar => optionFilter === 'all' || bar.value === optionFilter)
              .map(bar => {
                const isActive = optionFilter === bar.value
                const itemContent = (
                  <>
                    <div className="aof-quick-filter-item-text">
                      <div className="aof-quick-filter-item-label">{bar.label}</div>
                      <div className="aof-quick-filter-item-count">
                        {bar.count} {FILL_LEVEL_COUNT_NOUNS[currentQuestion.fillLevel] ?? 'Orders'}
                      </div>
                    </div>
                    {isActive && (
                      <GSButton
                        buttonIcon={faTimesCircle}
                        size="primary"
                        isFocusable
                        onClick={() => setOptionFilter('all')}
                      />
                    )}
                  </>
                )
                const itemClassName = `aof-quick-filter-item${isActive ? ' is-active' : ''}`

                // Active item closes via its own X button rather than
                // staying a giant click-anywhere-to-clear target — plain div
                // instead of a button so that GSButton isn't nested inside
                // one.
                return isActive ? (
                  <div className={itemClassName} key={bar.label}>
                    {itemContent}
                  </div>
                ) : (
                  <button type="button" className={itemClassName} key={bar.label} onClick={() => setOptionFilter(bar.value)}>
                    {itemContent}
                  </button>
                )
              })}
          </div>
        </div>
      )}

      <div className="ordr1-list-sticky">
        {showUnsavedBanner && editingAnswer && (
          <UnsavedAnswerBanner onSave={saveAnswerEdit} onDiscard={cancelAnswerEdit} isSaving={isSaving} />
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
      </div>

      {currentQuestion && (
        <div className="aof-response-list-wrap">
          {visibleAnswers.length === 0 ? (
            <div className="ordr1-list-empty">{search ? `No results for "${search}"` : 'No responses match this filter.'}</div>
          ) : (
            <div className="ord-form-response-answers">
              {visibleAnswers.map((answer, i) => renderAnswerTile(answer, i))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
