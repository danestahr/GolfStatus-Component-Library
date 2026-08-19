import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isAnswerMissing } from './orderUtils'
import './OrderFormResponsesSummaryDraft1.scss'

// Draft 1 riff: replaces the inline Hide/Show toggle (which expanded the
// package/form/question cards in place — see OrderFormResponses.jsx) with a
// link out to a dedicated, searchable "All Responses" list page instead
// (see OrderResponsesListDraft1.jsx). The whole tile is the click target —
// no separate "View All" button.

// Groups the flat responses list back into one entry per form (a form can
// carry more than one question) so the summary can list each form's actual
// question text instead of a bare "N Forms · M Questions" tally. Also rolls
// up whether every answer, across every question in the form, has been
// filled in — powers the inline complete/incomplete icon next to the form
// name below.
function groupByForm(responses) {
  const forms = []
  responses.forEach(entry => {
    let form = forms.find(f => f.formName === entry.formName)
    if (!form) {
      form = { formName: entry.formName, questions: [], isComplete: true }
      forms.push(form)
    }
    form.questions.push(entry.question)
    if (entry.answers.some(isAnswerMissing)) form.isComplete = false
  })
  return forms
}

export default function OrderFormResponsesSummaryDraft1({ responses, onViewAll }) {
  if (!responses || responses.length === 0) return null

  const forms = groupByForm(responses)

  return (
    <div
      className="ordr1-summary"
      role="button"
      tabIndex={0}
      onClick={onViewAll}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onViewAll()}
    >
      <div className="ordr1-summary-content">
        <div className="ordr1-summary-main">
          <div className="ordr1-summary-text">
            <div className="ordr1-summary-forms">
              {forms.map(form => (
                <div className="ordr1-summary-form" key={form.formName}>
                  <span className="ordr1-summary-form-status-wrap">
                    <FontAwesomeIcon
                      icon={form.isComplete ? faCircleCheck : faCircleExclamation}
                      className={`ordr1-summary-form-status${form.isComplete ? ' is-complete' : ' is-incomplete'}`}
                    />
                  </span>
                  <div className="ordr1-summary-form-text">
                    <div className="ordr1-summary-form-name">{form.formName}</div>
                    {form.questions.map((question, i) => (
                      <div className="ordr1-summary-form-question" key={i}>
                        {question}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
