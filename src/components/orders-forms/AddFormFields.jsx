import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'

// The Add/Edit Form screen (Figma "Form Details") — opened from
// FormsListContent to create a new form, or from OrderFormOverviewDraft1's
// edit pencil to rename an existing one (`isEditing` just swaps the header
// text; it's the same fields-only form either way). A fully controlled
// component, same convention as AddQuestionFields: the page that owns the
// single AppSidePanel holds the name state and the Save & Continue / Cancel
// actions, and renders this in place of the Forms list rather than opening
// a second panel on top of it.
export default function AddFormFields({ name, onChangeName, onSubmit, isEditing }) {
  return (
    <div className="ordr1-list">
      <GSActionBar type="form-header H3" header={isEditing ? 'Edit Form' : 'Add Form'} />

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
                textValue={name}
                onChange={e => onChangeName(e.target.value)}
                onSubmit={onSubmit}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
