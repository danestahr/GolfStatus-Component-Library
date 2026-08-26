import GSinput from '../../gs-lib/components/gs-input'
import GSSelect from '../../gs-lib/components/gs-select'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import OrderFormSection from './OrderFormSection.jsx'
import { QUESTION_OPTIONS, isNumberQuestion } from './orderUtils'
import './OrderFormResponseEditFields.scss'

// Draft 1 fork of OrderFormResponseEditFields.jsx — adds a page header
// action bar above the question sections, matching the one now used on
// OrderResponsesListDraft1's "All Responses" page.
export default function OrderFormResponseEditFieldsDraft1({ groups, onChangeAnswer, onSubmit }) {
  return (
    <div className="ofref-body">
      <GSActionBar type="form-header H3" header={`Edit ${groups[0]?.formName ?? ''}`} />

      {groups.map((group, groupIndex) => {
        const options = QUESTION_OPTIONS[group.question]

        return (
          <OrderFormSection title={group.question ?? ''} headerBordered key={groupIndex}>
            <div className="ofref-rows">
              {group.answers.map((answer, answerIndex) => (
                <div className="ofref-row" key={answerIndex}>
                  <label className="ofref-label">{answer.respondent}</label>
                  {options ? (
                    <GSSelect
                      options={options}
                      selectedOption={options.find(o => o.value === answer.value) ?? null}
                      onChange={option => onChangeAnswer(groupIndex, answerIndex, option?.value ?? '')}
                      isSearchable={false}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  ) : (
                    <GSinput
                      type={isNumberQuestion(group.question) ? 'number' : undefined}
                      textValue={answer.value}
                      onChange={e => onChangeAnswer(groupIndex, answerIndex, e.target.value)}
                      onSubmit={onSubmit}
                    />
                  )}
                </div>
              ))}
            </div>
          </OrderFormSection>
        )
      })}
    </div>
  )
}
