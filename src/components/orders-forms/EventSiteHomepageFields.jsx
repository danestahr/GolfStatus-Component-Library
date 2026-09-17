import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSFileSelect from '../../gs-lib/components/gs-file-select'
import GSTextEditor from '../../gs-lib/components/gs-text-editor'

// Matches the Figma "Upload" button on each file field (Banner Image,
// Promotional Image, Promotional Video) — an actual GSButton with the
// arrow-circle-up icon, not just an icon+label pair, so it gets the same
// hover/focus states as every other button in gs-lib.
const uploadButtonTitle = <GSButton type="transparent" buttonIcon={faArrowCircleUp} title="Upload" />

// The Event Site Homepage screen (Figma "Event Site Homepage") — opened
// directly off the Event Site & Packages hub's own "Event Site Homepage"
// row, same fully-controlled fields-only convention as AddFormFields/
// AddQuestionFields: the page that owns the single AppSidePanel holds this
// draft state and the Save/Cancel actions, rather than this component
// opening a second panel of its own.
export default function EventSiteHomepageFields({
  bannerFiles,
  onChangeBannerFiles,
  description,
  onChangeDescription,
  additionalDescription,
  onChangeAdditionalDescription,
  registrationDetails,
  onChangeRegistrationDetails,
  promotionalImageFiles,
  onChangePromotionalImageFiles,
  promotionalVideoFiles,
  onChangePromotionalVideoFiles,
}) {
  return (
    <div className="ordr1-list">
      <GSActionBar type="form-header H3" header="Event Site Homepage" />

      <GSFormSection
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Banner Image',
            isEditable: true,
            customView: true,
            value: (
              <GSFileSelect
                id="event-site-banner-image"
                accept=".jpg,.jpeg,.png,.gif"
                title={uploadButtonTitle}
                description="Tap or drag a file to upload. Accepted file types: .JPG, .PNG, .GIF"
                sourceList={bannerFiles}
                setSelectedFiles={onChangeBannerFiles}
                removeSourceItem={() => onChangeBannerFiles([])}
              />
            ),
          },
          {
            label: 'Event Description',
            isEditable: true,
            customView: true,
            value: (
              <GSTextEditor
                value={description}
                onChange={onChangeDescription}
                placeholder="Event Description"
              />
            ),
          },
          {
            label: 'Additional Event Description',
            isEditable: true,
            customView: true,
            value: (
              <GSTextEditor
                value={additionalDescription}
                onChange={onChangeAdditionalDescription}
                placeholder="Additional Event Description"
              />
            ),
          },
          {
            label: 'Registration Details',
            isEditable: true,
            customView: true,
            value: (
              <GSTextEditor
                value={registrationDetails}
                onChange={onChangeRegistrationDetails}
                placeholder="Registration Details"
              />
            ),
          },
        ]}
      />

      <GSFormSection
        title="Promotional Media"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Promotional Image',
            isEditable: true,
            customView: true,
            value: (
              <GSFileSelect
                id="event-site-promotional-image"
                accept=".jpg,.jpeg,.png,.gif"
                title={uploadButtonTitle}
                description="Tap or drag a file to upload. Accepted file types: .JPG, .PNG, .GIF"
                sourceList={promotionalImageFiles}
                setSelectedFiles={onChangePromotionalImageFiles}
                removeSourceItem={() => onChangePromotionalImageFiles([])}
              />
            ),
          },
          {
            label: 'Promotional Video',
            isEditable: true,
            customView: true,
            value: (
              <GSFileSelect
                id="event-site-promotional-video"
                accept=".mp4,.mov"
                title={uploadButtonTitle}
                description="Tap or drag a file to upload. Accepted file types: .MP4, .MOV"
                sourceList={promotionalVideoFiles}
                setSelectedFiles={onChangePromotionalVideoFiles}
                removeSourceItem={() => onChangePromotionalVideoFiles([])}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
