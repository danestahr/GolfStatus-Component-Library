import { faCommentAlt, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import GSField from '../../gs-lib/components/gs-field'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'
import OrderFormSection from './OrderFormSection.jsx'
import { emptyQuestionDraft, findResponseTypeOption } from '../orders-forms/AddQuestionFields.jsx'
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
// once a specific question is being viewed. Renaming is inline now (the
// Form Name field + header/stats swap below) rather than the pencil
// reopening AddFormFields elsewhere — `onEditForm` and that pencil are still
// wired in from the caller (EventSitePackagesListPage) but currently hidden;
// see the comments around the header/stats JSX for how to bring the old
// pencil-opens-a-separate-screen flow back. A caller that only reaches this
// page via "View Form" on someone else's order (Teams/SponsorsListPage) has
// no form registry to rename against in the first place, so it just leaves
// `onEditForm`/`formNameDraft` unset — same as the other not-yet-built
// buttons already in this codebase (Resend Receipt, Upload/Download, etc).
// `formId`, when the caller has one, is what actually keeps this page linked
// to the right `orders` responses across a rename — `formName` alone would
// go stale the moment it no longer matches what's stored on those orders
// (see `responsesForFormAcrossOrders` in orderUtils.js); `formName` still
// does all the on-screen labeling (header, stat tiles' implicit subject)
// regardless. "Edit Question" opens every question — real or added here —
// back into AddQuestionFields; `extraQuestions` (keyed by question text)
// holds each question's editable draft, whether it's a brand new question
// this page created or just an edited override of a real one's metadata
// (type/required — the real answers/respondent counts always keep coming
// from `orders`, editing never touches those).
export default function OrderFormOverviewDraft1({
  orders,
  formName,
  formId,
  onViewQuestion,
  onAddQuestion,
  onEditQuestion,
  onEditForm,
  formNameDraft,
  onChangeFormNameDraft,
  onSubmitFormName,
  extraQuestions = {},
  deletedQuestions = [],
}) {
  const orderQuestions = responsesForFormAcrossOrders(orders, formName, formId).map(q => {
    const override = extraQuestions[q.question]
    return {
      question: q.question,
      answers: q.answers,
      responseTypeLabel: override ? override.responseType?.label ?? 'Text' : responseTypeFor(q.question),
      requiredLabel: (override ? override.required : isQuestionRequired(q.question)) ? 'Required' : 'Not Required',
    }
  })
  const orderQuestionTexts = new Set(orderQuestions.map(q => q.question))
  // Only overrides for a question that isn't already real get their own new
  // tile — an override of a real question merges into it above instead, so
  // it doesn't show up twice.
  const customQuestions = Object.entries(extraQuestions)
    .filter(([question]) => !orderQuestionTexts.has(question))
    .map(([question, draft]) => ({
      question,
      answers: [],
      responseTypeLabel: draft.responseType?.label ?? 'Text',
      requiredLabel: draft.required ? 'Required' : 'Not Required',
    }))
  // `handleDeleteQuestion` (EventSitePackagesListPage.jsx) is what actually
  // populates this — there's no form-builder here to remove a question from
  // `orders` itself, so a deleted real question just gets filtered out of
  // the list instead (a custom question is already fully gone once its
  // `extraQuestions` override is deleted, so this only does anything for a
  // real one, but filtering both the same way is simplest).
  const questions = [...orderQuestions, ...customQuestions].filter(q => !deletedQuestions.includes(q.question))
  const stats = computeFormStats(questions)

  // The edit pencil always has something to open: an existing draft if this
  // question already has one (real question edited before, or one this page
  // created), otherwise a fresh draft seeded from the real question's own
  // labels (best-effort reverse of responseTypeFor/isQuestionRequired).
  function draftForQuestion(q) {
    return (
      extraQuestions[q.question] ?? {
        ...emptyQuestionDraft,
        question: q.question,
        responseType: findResponseTypeOption(q.responseTypeLabel),
        required: q.requiredLabel === 'Required',
      }
    )
  }

  // Only EventSitePackagesListPage's Forms flow currently passes a
  // `formNameDraft` handler — that's the "form page" this inline-rename
  // treatment (hidden pencil/stats, Form Name field, static "Edit Form"
  // header) applies to. Teams/SponsorsListPage/OrdersDraft1Page reach this
  // same component via "View Form" on someone else's order and don't wire
  // any of these props (they have no form registry to rename against), so
  // gating on this keeps them on the original dashboard layout untouched —
  // revert: delete this flag and the branch below, keeping just the
  // `isInlineRenameMode` branch's JSX.
  const isInlineRenameMode = typeof onChangeFormNameDraft === 'function'

  return (
    <div className="ordr1-list fov-list">
      {isInlineRenameMode ? (
        <>
          <GSActionBar
            type="x-large-pad H3"
            // Static instead of `formName` — renaming moved inline (the
            // Form Name field below), so this reads as a dedicated
            // "Edit Form" screen rather than a per-form dashboard.
            header="Edit Form"
            // The rename pencil is hidden while renaming happens inline
            // below instead — `onEditForm` is left wired in from the
            // caller so restoring it later is just uncommenting this line.
            // pageActions={[{ actionIcon: faPen, type: 'light-grey', actionClick: onEditForm }]}
          />

          <GSFormSection
            type="vertical xx-large-gap"
            fields={[
              {
                label: 'Form Name',
                required: true,
                isEditable: true,
                customView: true,
                value: (
                  <GSinput
                    placeholder="Form Name"
                    textValue={formNameDraft}
                    onChange={e => onChangeFormNameDraft(e.target.value)}
                    onSubmit={onSubmitFormName}
                  />
                ),
              },
            ]}
          />

          {/* Stat tiles (Respondents/Answered/Missing/Questions) hidden
              here — `stats` above is still computed so this block can come
              back as-is. Revert: restore the fov-hero block below. */}
        </>
      ) : (
        <>
          <GSActionBar
            type="x-large-pad H3"
            header={formName}
            pageActions={[{ actionIcon: faPen, type: 'light-grey', actionClick: onEditForm }]}
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
        </>
      )}

      <OrderFormSection
        title="Form Questions"
        action={<GSButton title="Add Question" type="black" buttonIcon={faPlus} isFocusable onClick={onAddQuestion} />}
      >
        <GSField
          label="Form Questions"
          // gs-field's own container (and its .field div, which reuses this
          // same `style`) default to inline-flex — shrink-to-fit — so
          // without an explicit width they'd narrow to their widest child
          // instead of stretching like OrderFormSection's own (non-inline)
          // flex children did. This is what lets that stretch reach
          // .fov-questions' own width: 100% below.
          style={{ width: '100%' }}
          // Not required — just the small field-style label below the
          // action bar above, no asterisk. The tiles (or the empty state)
          // are this field's value.
          isEditable
          customView
          value={
            questions.length === 0 ? (
              <div className="fov-questions-empty">
                <GSEmptyList
                  title="Form Questions"
                  detail="This form does not have any questions."
                  actions={[{ title: 'Add Question', buttonIcon: faPlus, type: 'black', isFocusable: true, onClick: onAddQuestion }]}
                />
              </div>
            ) : (
              <div className="fov-questions">
                {questions.map(q => (
                  <div className="ordr1-question-tile fov-question-card" key={q.question}>
                    <div className="fov-question-header">
                      <div className="fov-question-text">
                        <div className="fov-question-title">{q.question}</div>
                        <div className="fov-question-subtitle">{q.responseTypeLabel}</div>
                        <div className="fov-question-subtitle">{q.requiredLabel}</div>
                      </div>

                      <div className="fov-question-actions">
                        <GSButton
                          type="light-grey icon"
                          size="primary"
                          buttonIcon={faPen}
                          onClick={() => onEditQuestion(draftForQuestion(q))}
                        />
                        {/* Hidden — responses still work, just reached by
                            appending /responses to a form's own URL instead
                            (see EventSitePackagesListPage's `openViewResponses`)
                            while that screen's still being worked on.
                            `onViewQuestion` is left wired in from the caller,
                            so restoring this is just uncommenting it. */}
                        {/* <GSButton
                          type="light-grey"
                          size="primary"
                          title={`Responses (${q.answers.length})`}
                          buttonIcon={faCommentAlt}
                          onClick={() => onViewQuestion(q.question)}
                        /> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        />
      </OrderFormSection>
    </div>
  )
}
