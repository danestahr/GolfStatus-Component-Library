import GSinput from '../../gs-lib/components/gs-input'
import GSSelect from '../../gs-lib/components/gs-select'
import OrderFormSection from './OrderFormSection.jsx'
import { QUESTION_OPTIONS } from './orderUtils'
import './OrderFormResponseEditFields.scss'

// Rendered as the body of the single Order Details AppSidePanel while editing —
// it replaces the order details view in place rather than opening a second,
// stacked slideout on top of it. A form can carry several questions (shirt
// size, dietary restrictions, ...), so `groups` lists every question being
// edited together — one OrderFormSection per question (title carries the
// question name via ord-form-section-header), one Save for all of them.
export default function OrderFormResponseEditFields({ groups, onChangeAnswer, onSubmit }) {
  return (
    <div className="ofref-body">
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
