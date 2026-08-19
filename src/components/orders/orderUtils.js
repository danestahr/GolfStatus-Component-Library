export function formatMoney(amount) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const STATUS_META = {
  paid:      { label: 'Paid',      className: 'active' },
  pending:   { label: 'Pending',   className: 'pending' },
  refunded:  { label: 'Refunded',  className: 'warning' },
  void:      { label: 'Void',      className: 'inactive' },
}

// Dropdown options for form-response questions that answer from a fixed set
// of choices — keyed by question so both the single-answer tile edit
// (OrderFormResponses.jsx) and the bulk "Edit Responses" panel
// (OrderFormResponseEditFields.jsx) render the same select for a given
// question instead of a free-text input.
export const COURSE_OPTIONS = [
  { value: 'Course 1', label: 'Course 1' },
  { value: 'Course 2', label: 'Course 2' },
  { value: 'Course 3', label: 'Course 3' },
]

export const SHIRT_SIZE_OPTIONS = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
]

export const DIETARY_RESTRICTION_OPTIONS = [
  { value: 'None', label: 'None' },
  { value: 'Vegetarian', label: 'Vegetarian' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Gluten-Free', label: 'Gluten-Free' },
]

export const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
]

export const QUESTION_OPTIONS = {
  'Which course do you want to play?': COURSE_OPTIONS,
  'What is your shirt size?': SHIRT_SIZE_OPTIONS,
  'Do you have any dietary restrictions?': DIETARY_RESTRICTION_OPTIONS,
  'Are you planning on coming to the Sponsor Happy Hour?': YES_NO_OPTIONS,
}

export function isAnswerMissing(answer) {
  return !answer.value || answer.value.trim() === ''
}

// "Team Response(s)" / "Player Response(s)" / "Sponsor Response(s)" — which
// occurrence type a form entry's `fillLevel` represents, pluralized against
// however many respondents are actually being labeled. Shared by
// OrderResponsesListDraft1.jsx (per-order responses) and
// AllOrderResponsesForFormDraft1.jsx (cross-order, per-question responses)
// so both label a form section/group the same way.
const FILL_LEVEL_NOUNS = { team: 'Team', player: 'Player', sponsor: 'Sponsor' }

export function occurrenceLabelFor(fillLevel, count = 1) {
  const noun = FILL_LEVEL_NOUNS[fillLevel] ?? 'Order'
  return `${noun} ${count === 1 ? 'Response' : 'Responses'}`
}

// "View Team" / "View Sponsor" — a player rolls up under their team the same
// way a team-level question does, so both read as "View Team"; there's
// nothing more specific than the order itself for a plain fillLevel-less
// response. Shared by the same two pages as occurrenceLabelFor above.
const VIEW_LINK_LABELS = { team: 'View Team', player: 'View Team', sponsor: 'View Sponsor' }

export function viewLinkLabelFor(fillLevel) {
  return VIEW_LINK_LABELS[fillLevel] ?? 'View Order'
}

// Label shown under a question's text wherever it's displayed on its own
// (see the question-nav bar in AllOrderResponsesForFormDraft1.jsx) — a
// question with a fixed answer set (QUESTION_OPTIONS) renders as a select
// everywhere it's edited, so it reads as "Multiple Choice"; anything else is
// free text, i.e. "Text Response". Numeric-only questions would read as
// "Number Response" the same way once one exists in the data.
export function responseTypeFor(question) {
  return QUESTION_OPTIONS[question] ? 'Multiple Choice' : 'Text Response'
}

// Which questions a respondent must answer before their registration/order
// is considered complete — logistics questions (course, shirt size) block
// completion, preference/RSVP questions (dietary, happy hour) don't. Powers
// the "(Required)"/"(Optional)" label and hides the pointless Unanswered
// filter on a required question in AllOrderResponsesForFormDraft1.jsx, since
// a required question is expected to end up fully answered anyway.
const REQUIRED_QUESTIONS = new Set(['Which course do you want to play?', 'What is your shirt size?'])

export function isQuestionRequired(question) {
  return REQUIRED_QUESTIONS.has(question)
}

// Every response recorded for a given form name, gathered across every
// order rather than just one — powers the "view all orders' responses to
// this form" panel opened from a form section's arrow button (see
// OrderResponsesListDraft1.jsx / AllOrderResponsesForFormDraft1.jsx). Groups
// by question (a form can carry more than one) and tags each answer with
// the order it came from so the cross-order list can still show whose
// response it is.
export function responsesForFormAcrossOrders(orders, formName) {
  const questions = []
  orders.forEach(order => {
    order.formResponses
      .filter(entry => entry.formName === formName)
      .forEach(entry => {
        let question = questions.find(q => q.question === entry.question)
        if (!question) {
          question = { question: entry.question, fillLevel: entry.fillLevel, answers: [] }
          questions.push(question)
        }
        entry.answers.forEach(answer => {
          question.answers.push({
            ...answer,
            orderId: order.id,
            buyerName: order.buyerName,
            businessName: order.businessName,
            packageName: entry.packageName,
          })
        })
      })
  })
  return questions
}

// Tallies individual respondent answers (not questions) across a form
// response list — a single question can carry several once a form has
// multiple respondents, so counting at the answer level is the more
// accurate read of how much is actually still missing.
export function countAnswerStats(responses) {
  let total = 0
  let missing = 0
  responses.forEach(entry => {
    entry.answers.forEach(answer => {
      total += 1
      if (isAnswerMissing(answer)) missing += 1
    })
  })
  return { total, missing }
}

// A fixed-choice question breaks down into one bar per option (plus a "No
// Response" bar when someone hasn't answered yet) — there's no equivalent
// breakdown for free text/number questions since they don't share a value
// set to tally against. Powers the option-bar chart on
// AllOrderResponsesForFormDraft1.jsx's currently-viewed question.
// Sentinel `value` for the "No Response" bar — no real option value could
// ever collide with it, so it doubles as the filter key AllOrderResponsesForFormDraft1.jsx
// passes back in to select "just the missing answers" when that bar is clicked.
export const MISSING_OPTION_FILTER = '__no_response__'

export function optionBreakdown(question, answers) {
  const options = QUESTION_OPTIONS[question]
  if (!options) return null

  const bars = options.map(option => ({
    label: option.label,
    value: option.value,
    count: answers.filter(a => a.value === option.value).length,
  }))
  const missingCount = answers.filter(isAnswerMissing).length
  if (missingCount > 0) bars.push({ label: 'No Response', value: MISSING_OPTION_FILTER, count: missingCount, isMissing: true })

  return { bars, total: answers.length }
}
