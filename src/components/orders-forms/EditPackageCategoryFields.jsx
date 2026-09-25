import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'

// The Edit Package Category screen (Figma "Package Category") — reached via
// a category's own edit pencil on the Packages list (PackageCategorySection)
// — same fields-only screen/Save-Cancel convention as AddFormFields, just
// renaming that category's display label instead of a form's name.
export default function EditPackageCategoryFields({ value, onChange, onSubmit }) {
  return (
    <div className="ordr1-list">
      <GSActionBar type="form-header H3" header="Edit Package Category" />

      <GSFormSection
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Package Category',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                placeholder="Package Category"
                textValue={value}
                onChange={e => onChange(e.target.value)}
                onSubmit={onSubmit}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
