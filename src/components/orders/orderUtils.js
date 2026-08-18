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
