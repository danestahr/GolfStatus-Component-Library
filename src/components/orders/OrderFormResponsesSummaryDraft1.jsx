import { faFileCircleCheck, faFileCircleExclamation } from '@fortawesome/free-solid-svg-icons'
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
// question text instead of a bare "N Forms · M Questions" tally. Keyed by
// packageName + formName, not formName alone — an order that bundles more
// than one package (see the ord-1005/ord-1006/ord-1023 comments in
// mockOrders.js/mockTeams.js) can carry the same form twice, once per
// package, and those need to stay their own rows rather than merging into
// one with doubled-up questions and a rolled-up complete/incomplete icon
// that no longer means anything specific. Also rolls up whether every
// answer, across every question in the form, has been filled in — powers
// the inline complete/incomplete icon next to the form name below.
function groupByForm(responses) {
  const forms = []
  responses.forEach(entry => {
    let form = forms.find(f => f.formName === entry.formName && f.packageName === entry.packageName)
    if (!form) {
      form = { formName: entry.formName, packageName: entry.packageName, questions: [], isComplete: true }
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
  // A form name shared by more than one package (two teams' "Player
  // Details", two sponsors' "Sponsor Details", etc.) needs its package
  // shown so the rows read as distinct instead of looking like an
  // accidental duplicate — a form that only appears on one package here
  // stays exactly as plain as before.
  const formNameCounts = forms.reduce((counts, form) => {
    counts[form.formName] = (counts[form.formName] ?? 0) + 1
    return counts
  }, {})

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
                <div className="ordr1-summary-form" key={`${form.packageName}-${form.formName}`}>
                  <span className="ordr1-summary-form-status-wrap">
                    <FontAwesomeIcon
                      icon={form.isComplete ? faFileCircleCheck : faFileCircleExclamation}
                      className={`ordr1-summary-form-status${form.isComplete ? ' is-complete' : ' is-incomplete'}`}
                    />
                  </span>
                  <div className="ordr1-summary-form-text">
                    <div className="ordr1-summary-form-name">
                      {form.formName}
                      {formNameCounts[form.formName] > 1 && (
                        <span className="ordr1-summary-form-package"> · {form.packageName}</span>
                      )}
                    </div>
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
