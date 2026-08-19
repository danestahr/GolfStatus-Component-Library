import { faArrowRight, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import OrderFormSection from './OrderFormSection.jsx'
import { responsesForFormAcrossOrders, isAnswerMissing, responseTypeFor, isQuestionRequired } from './orderUtils'
import './OrderResponsesListDraft1.scss'
import './OrderFormOverviewDraft1.scss'

// Tallies unique respondents and answered/missing counts across every
// question in the form — same "answer, not question" counting rule as
// orderUtils.countAnswerStats, plus a respondent headcount (deduped by
// order+name, since the same name could show up on two different orders).
function computeFormStats(questions) {
  const respondents = new Set()
  let answered = 0
  let missing = 0
  questions.forEach(q => {
    q.answers.forEach(a => {
      respondents.add(`${a.orderId}-${a.respondent}`)
      if (isAnswerMissing(a)) missing += 1
      else answered += 1
    })
  })
  return { respondentCount: respondents.size, answered, missing }
}

// Draft 1 riff — a per-form dashboard opened from the "View Form" button on
// OrderResponsesListDraft1 (see OrdersDraft1Page.jsx's `viewingFormName`),
// sitting between that per-order list and the per-question, cross-order
// browse view (AllOrderResponsesForFormDraft1, reached from this page's
// "View Responses" button). Stats tiles mirror RoundHero's scorecard-
// completion tiles on the Scorecards page — same grey-card-with-a-stat-grid
// shape, just answer/respondent counts instead of scoring status. Each
// question is just a title/subtitle/actions row here — no answer breakdown
// or chart lives on this page; that's AllOrderResponsesForFormDraft1's job
// once a specific question is being viewed. "Edit Form"/"Edit Question" are
// stubbed (no form-builder exists yet in this prototype), same convention as
// the other not-yet-built buttons already in this codebase (Resend Receipt,
// Upload/Download, etc).
export default function OrderFormOverviewDraft1({ orders, formName, onViewQuestion }) {
  const questions = responsesForFormAcrossOrders(orders, formName)
  const stats = computeFormStats(questions)

  return (
    <div className="ordr1-list fov-list">
      <GSActionBar
        type="x-large-pad H3"
        header={formName}
        pageActions={[{ actionIcon: faPen, type: 'light-grey', actionClick: () => {} }]}
      />

      <div className="fov-hero">
        <div className="fov-hero-card">
          <div className="fov-hero-stats">
            <div className="fov-stat-box">
              <span className="fov-stat-value">{stats.respondentCount}</span>
              <span className="fov-stat-label">Respondents</span>
            </div>
            <div className="fov-stat-box">
              <span className="fov-stat-value">{stats.answered}</span>
              <span className="fov-stat-label">Answered</span>
            </div>
            <div className="fov-stat-box">
              <span className="fov-stat-value">{stats.missing}</span>
              <span className="fov-stat-label">Missing</span>
            </div>
            <div className="fov-stat-box">
              <span className="fov-stat-value">{questions.length}</span>
              <span className="fov-stat-label">Questions</span>
            </div>
          </div>
        </div>
      </div>

      <OrderFormSection
        title="Questions"
        action={<GSButton title="Add Question" type="black" buttonIcon={faPlus} isFocusable onClick={() => {}} />}
      >
        <div className="fov-questions">
          {questions.map(q => (
            <div className="ordr1-question-tile fov-question-card" key={q.question}>
              <div className="fov-question-header">
                <div className="fov-question-text">
                  <div className="fov-question-title">{q.question}</div>
                  <div className="fov-question-subtitle">
                    {responseTypeFor(q.question)} ({isQuestionRequired(q.question) ? 'Required' : 'Optional'})
                  </div>
                </div>

                <div className="fov-question-actions">
                  <GSButton type="light-grey icon" size="primary" buttonIcon={faPen} onClick={() => {}} />
                  <GSButton
                    type="light-grey"
                    size="primary"
                    title="View Responses"
                    rightIcon={faArrowRight}
                    onClick={() => onViewQuestion(q.question)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </OrderFormSection>
    </div>
  )
}
