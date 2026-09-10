import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSFileSelect from '../../gs-lib/components/gs-file-select'
import GSTextEditor from '../../gs-lib/components/gs-text-editor'
import './EventSiteHomepageFields.scss'

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
                title={
                  <div className="esh-upload-label">
                    <FontAwesomeIcon icon={faUpload} />
                    <span>Upload</span>
                  </div>
                }
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
        ]}
      />
    </div>
  )
}
