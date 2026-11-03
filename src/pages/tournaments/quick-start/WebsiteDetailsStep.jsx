import { faPen } from '@fortawesome/free-solid-svg-icons'
import GSFormSection from '../../../gs-lib/components/gs-form-section'
import GSTextEditor from '../../../gs-lib/components/gs-text-editor'
import ImageUpload from '../../../components/file-upload/ImageUpload.jsx'

// Quick Start step 3: the event website's banner image and description. The
// banner is either uploaded here or picked from the preset gallery (step 3a,
// opened by the Gallery button). Footer actions live in QuickStartPanel.
export default function WebsiteDetailsStep({ quickStart, onChange, onGallery, onCropImage }) {
  const { banner_image, event_description } = quickStart

  return (
    <GSFormSection
      type="vertical xx-large-gap"
      fields={[
        {
          label: 'Banner Image',
          description: 'An image with a centered subject is recommended to best adapt to screen size. Avoid using images with text or key information.',
          isEditable: true,
          customView: true,
          value: (
            <ImageUpload
              image={banner_image}
              onChange={image => onChange({ banner_image: image })}
              enforceRatio={false}
              actions={banner_image instanceof File ? [{ icon: faPen, onClick: file => onCropImage('banner_image', file, null) }] : []}
              onGallery={onGallery}
              hint="Tap or drag a file to upload. Accepted file types are .JPG, .PNG, .GIF under 25MB. Minimum suggested size: 2000 px wide, 500-1000 px high. Suggested ratios: 2:1, 3:1, 4:1."
            />
          ),
        },
        {
          label: 'Event Description',
          description: 'Help golfers and donors understand more about your cause.',
          isEditable: true,
          customView: true,
          value: (
            <GSTextEditor
              value={event_description}
              onChange={html => onChange({ event_description: html })}
              placeholder="Event Description"
            />
          ),
        },
      ]}
    />
  )
}
