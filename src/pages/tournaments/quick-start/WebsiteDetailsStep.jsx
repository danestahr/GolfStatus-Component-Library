import GSFormSection from '../../../gs-lib/components/gs-form-section'
import GSTextEditor from '../../../gs-lib/components/gs-text-editor'
import ImageUpload from '../../../components/file-upload/ImageUpload.jsx'

// Quick Start step 3: the event website's banner image and description. The
// banner is either uploaded here or picked from the preset gallery (step 3a,
// opened by the Gallery button). Footer actions live in QuickStartPanel.
export default function WebsiteDetailsStep({ quickStart, onChange, onGallery }) {
  const { banner_image, event_description } = quickStart

  return (
    <GSFormSection
      type="vertical xx-large-gap"
      fields={[
        {
          label: 'Banner Image',
          isEditable: true,
          customView: true,
          value: (
            <ImageUpload
              image={banner_image}
              onChange={image => onChange({ banner_image: image })}
              onGallery={onGallery}
              hint="Tap or drag a file to upload. The image ratio is 2:1. Accepted file types are .JPG, .PNG, .GIF under 25MB."
            />
          ),
        },
        {
          label: 'Event Description',
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
