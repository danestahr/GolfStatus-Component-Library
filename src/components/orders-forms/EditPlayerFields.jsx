import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'

// The "Edit Player" screen (Figma "Player Details") opened by tapping an
// unassigned player's card or a player tile in Team Overview — same fully
// controlled draft convention as AddQuestionFields: the page that owns the
// single AppSidePanel holds the draft state and renders this in place of
// whatever screen was showing before. Handicap/GHIN/Notes apply the same
// way to a roster player as to an unassigned one; whichever of those the
// source record didn't already carry just starts out blank.
export default function EditPlayerFields({ draft, onChange, onSubmit }) {
  return (
    <div className="ordr1-list">
      <GSActionBar type="form-header H3" header="Edit Player" />

      <GSFormSection
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'First Name',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                placeholder="First"
                textValue={draft.firstName}
                onChange={e => onChange({ firstName: e.target.value })}
                onSubmit={onSubmit}
              />
            ),
          },
          {
            label: 'Last Name',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                placeholder="Last"
                textValue={draft.lastName}
                onChange={e => onChange({ lastName: e.target.value })}
                onSubmit={onSubmit}
              />
            ),
          },
          {
            label: 'Email Address',
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                placeholder="email@emailaddress.com"
                textValue={draft.email}
                onChange={e => onChange({ email: e.target.value })}
                onSubmit={onSubmit}
              />
            ),
          },
          {
            label: 'Phone Number',
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                placeholder="0000000000"
                textValue={draft.phone}
                onChange={e => onChange({ phone: e.target.value })}
                onSubmit={onSubmit}
              />
            ),
          },
        ]}
      />

      <GSFormSection
        title="Additional Information"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Handicap',
            isEditable: true,
            customView: true,
            hintText: 'For plus handicaps, enter as a negative number.',
            value: (
              <GSinput
                type="number"
                placeholder="15"
                textValue={draft.handicap}
                onChange={e => onChange({ handicap: e.target.value })}
                onSubmit={onSubmit}
              />
            ),
          },
          {
            label: 'GHIN Number',
            isEditable: true,
            customView: true,
            hintText: 'Enter GHIN number without dashes.',
            value: (
              <GSinput
                placeholder="01234567"
                textValue={draft.ghin}
                onChange={e => onChange({ ghin: e.target.value })}
                onSubmit={onSubmit}
              />
            ),
          },
          {
            label: 'Player Notes',
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                type="text-area"
                placeholder="Player Notes"
                textValue={draft.notes}
                onChange={e => onChange({ notes: e.target.value })}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
