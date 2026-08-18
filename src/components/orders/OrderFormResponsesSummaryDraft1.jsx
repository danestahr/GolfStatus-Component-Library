import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { countAnswerStats } from './orderUtils.js'
import './OrderFormResponsesSummaryDraft1.scss'

// Draft 1 riff: replaces the inline Hide/Show toggle (which expanded the
// package/form/question cards in place — see OrderFormResponses.jsx) with a
// link out to a dedicated, searchable "All Responses" list page instead
// (see OrderResponsesListDraft1.jsx). The whole tile is the click target —
// no separate "View All" button.
export default function OrderFormResponsesSummaryDraft1({ responses, onViewAll }) {
  if (!responses || responses.length === 0) return null

  const formCount = new Set(responses.map(r => r.formName)).size
  const questionCount = responses.length
  const { missing } = countAnswerStats(responses)

  return (
    <div
      className="ordr1-summary"
      role="button"
      tabIndex={0}
      onClick={onViewAll}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onViewAll()}
    >
      <div className="ordr1-summary-main">
        <div className="ordr1-summary-text">
          <div className="ordr1-summary-title">Form Responses</div>
          <div className="ordr1-summary-subtitle">
            {formCount} {formCount === 1 ? 'Form' : 'Forms'} · {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
          </div>
        </div>

        {missing > 0 && (
          <div className="ordr1-summary-notice">
            <FontAwesomeIcon icon={faCircleInfo} />
            <span>{missing} {missing === 1 ? 'question' : 'questions'} not yet answered</span>
          </div>
        )}
      </div>
    </div>
  )
}
