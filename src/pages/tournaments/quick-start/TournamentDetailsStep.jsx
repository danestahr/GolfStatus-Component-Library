import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import GSFormSection from '../../../gs-lib/components/gs-form-section'
import GSinput from '../../../gs-lib/components/gs-input'
import ImageUpload from '../../../components/file-upload/ImageUpload.jsx'
import './TournamentDetailsStep.scss'

// "[Current Year] [Organization Name] Golf Tournament" — the name every new
// tournament starts with, until the prospect edits it.
export const defaultTournamentName = organization =>
  `${new Date().getFullYear()} ${organization} Golf Tournament`

// Quick Start step 1: name the tournament (prefilled) and add an optional
// image. Footer actions (Save & continue / Cancel) live in QuickStartPanel.
export default function TournamentDetailsStep({ quickStart, onChange }) {
  const { tournament_name, tournament_image } = quickStart

  return (
    <GSFormSection
      type="vertical xx-large-gap"
      fields={[
        {
          label: 'Tournament Name',
          required: true,
          isEditable: true,
          customView: true,
          externalValue: tournament_name,
          value: (
            <GSinput
              placeholder="Tournament Name"
              textValue={tournament_name}
              onChange={e => onChange({ tournament_name: e.target.value })}
              rightIcon={faCircleXmark}
              rightIconClick={() => onChange({ tournament_name: '' })}
              rightButtonProps={{
                type: 'secondary transparent',
                style: tournament_name ? undefined : { visibility: 'hidden' },
              }}
            />
          ),
        },
        {
          label: 'Tournament image',
          isEditable: true,
          customView: true,
          value: <ImageUpload image={tournament_image} onChange={file => onChange({ tournament_image: file })} />,
        },
      ]}
    />
  )
}
