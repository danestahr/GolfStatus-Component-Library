import { faArrowCircleUp, faExternalLinkSquare } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSFileSelect from '../../gs-lib/components/gs-file-select'
import GSTextEditor from '../../gs-lib/components/gs-text-editor'
import GSinput from '../../gs-lib/components/gs-input'
import { DEFAULT_SECTION_HEADERS } from '../../data/eventSiteHomepageSections.js'

// The Section Header field every section below with a live-site title gets,
// first in its own fields list — a blank value is a real, savable choice
// (see DEFAULT_SECTION_HEADERS' own comment): the live site hides that
// section's title entirely rather than falling back to its default text, so
// the placeholder says so explicitly instead of showing the default title,
// which would wrongly imply clearing the field just reverts to it. There's no
// separate on/off switch for this any more — blank vs filled in IS the
// show/hide choice, for every section (see EventWebsitePage.jsx, which now
// reads every section's title straight off `sectionHeaders`, Packages/
// Sponsors/Donation included).
//
// `locked` is `isPremium` (EventSitePackagesListPage's own hub-level Premium
// toggle), inverted — a non-premium tournament can't edit a section's header
// text at all, so the field doesn't render (rather than rendering read-only):
// `sectionFields` below drops a `null` return here from the fields list it
// hands GSFormSection. `toggleIsPremium` (EventSitePackagesListPage.jsx)
// resets every header back to DEFAULT_SECTION_HEADERS the moment Premium
// turns off, so there's nothing stale left showing once this field is gone.
function sectionHeaderField(header, onChangeHeader, id, locked) {
  if (locked) return null
  return {
    label: 'Section Header',
    isEditable: true,
    customView: true,
    value: (
      <GSinput
        placeholder={`Leave blank to hide this section's header (default: "${DEFAULT_SECTION_HEADERS[id]}")`}
        textValue={header}
        onChange={e => onChangeHeader(e.target.value)}
      />
    ),
  }
}

// One field per customizable button (DEFAULT_SECTION_BUTTONS) — unlike
// sectionHeaderField, a blank value isn't a savable "hide it" choice (a
// button with no label wouldn't make sense on the live site), so this is
// just a plain controlled text input. Every button field now shares the
// same generic "Button Label" header (Tournament Details is the only
// section with editable button text left — see EventSiteHomepageFields'
// own tournamentDetails block below) — `description` is what actually says
// which button this is/where it leads, shown under that header (GSField's
// own `description` slot) instead of baked into the label itself.
function buttonTextField(value, onChange, description) {
  return {
    label: 'Button Label',
    description,
    isEditable: true,
    customView: true,
    value: <GSinput textValue={value} onChange={e => onChange(e.target.value)} />,
  }
}

// Drops any `null` a section's own header field returned while locked (see
// sectionHeaderField above) — GSFormSection/GSItemList expect a real field
// object per item, not a hole in the array.
function sectionFields(headerFields, alwaysFields = []) {
  return [...headerFields, ...alwaysFields].filter(Boolean)
}

// Matches the Figma "Upload" button on each file field (Banner Image,
// Photo, Video) — an actual GSButton with the arrow-circle-up icon, not
// just an icon+label pair, so it gets the same hover/focus states as every
// other button in gs-lib.
const uploadButtonTitle = <GSButton type="transparent" buttonIcon={faArrowCircleUp} title="Upload" />

// One section's own edit screen (Figma "Event Site Homepage") — opened via
// its tile's pencil/plus on EventSiteHomepageSectionsList, which navigates
// the single AppSidePanel to this screen instead of expanding the tile in
// place (see EventSitePackagesListPage.jsx's `editingHomepageSectionId`) —
// same one-panel-swaps-screens convention as AddFormFields/
// EditPackageCategoryFields. `title` is that tile's own current label
// (EventSiteHomepageSectionsList's `sectionTileLabel`, re-derived live off
// whatever's typed into this screen's own Section Header field below) —
// shown both as this screen's in-panel header (Figma "Form Header") and, via
// EventSitePackagesListPage's `panelTitle`, in the side panel's own top nav
// bar, so renaming the header updates both at once as you type. The page
// that owns the single AppSidePanel still holds all of this screen's actual
// draft state (`section` is one of HOMEPAGE_SECTIONS' editable ids — the
// tile list never links to an uneditable one, so there's nothing to render
// for those here).
export default function EventSiteHomepageFields({
  section,
  title,
  bannerFiles,
  onChangeBannerFiles,
  description,
  onChangeDescription,
  additionalDescription,
  onChangeAdditionalDescription,
  registrationDetails,
  onChangeRegistrationDetails,
  photoFiles,
  onChangePhotoFiles,
  videoFiles,
  onChangeVideoFiles,
  header,
  onChangeHeader,
  buttons = {},
  onChangeButton,
  isPremium = true,
}) {
  // Gates sectionHeaderField's Section Header field — everything else on a
  // tile (its actual content, Tournament Details' own button text) stays
  // editable regardless.
  const locked = !isPremium

  const body = (() => {
    if (section === 'banner') {
      return (
        <GSFormSection
          type="vertical xx-large-gap"
          // Banner Image has no Section Header of its own to show/hide, so
          // there's nothing here for `locked` to gate. Always just the file
          // field.
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
          ]}
        />
      )
    }

    if (section === 'description') {
      return (
        <GSFormSection
          type="vertical xx-large-gap"
          fields={sectionFields(
            [sectionHeaderField(header, onChangeHeader, section, locked)],
            [
              {
                label: 'Event Description',
                isEditable: true,
                customView: true,
                value: <GSTextEditor value={description} onChange={onChangeDescription} placeholder="Event Description" />,
              },
            ]
          )}
        />
      )
    }

    if (section === 'additionalDescription') {
      return (
        <GSFormSection
          type="vertical xx-large-gap"
          fields={sectionFields(
            [sectionHeaderField(header, onChangeHeader, section, locked)],
            [
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
            ]
          )}
        />
      )
    }

    if (section === 'registrationDetails') {
      return (
        <GSFormSection
          type="vertical xx-large-gap"
          fields={sectionFields(
            [sectionHeaderField(header, onChangeHeader, section, locked)],
            [
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
            ]
          )}
        />
      )
    }

    // Photo and Video used to be one combined "Photos & Video" section/tile
    // (one Section Header, one file each) — now two fully independent
    // sections, each with its own Section Header, own tile, and own place
    // in the reorderable section order, so either can be shown/hidden/
    // reordered on the live site without the other.
    if (section === 'photo') {
      return (
        <GSFormSection
          type="vertical xx-large-gap"
          fields={sectionFields(
            [sectionHeaderField(header, onChangeHeader, section, locked)],
            [
              {
                label: 'Photo',
                isEditable: true,
                customView: true,
                value: (
                  <GSFileSelect
                    id="event-site-photo"
                    accept=".jpg,.jpeg,.png,.gif"
                    title={uploadButtonTitle}
                    description="Tap or drag a file to upload. Accepted file types: .JPG, .PNG, .GIF"
                    sourceList={photoFiles}
                    setSelectedFiles={onChangePhotoFiles}
                    removeSourceItem={() => onChangePhotoFiles([])}
                  />
                ),
              },
            ]
          )}
        />
      )
    }

    if (section === 'video') {
      return (
        <GSFormSection
          type="vertical xx-large-gap"
          fields={sectionFields(
            [sectionHeaderField(header, onChangeHeader, section, locked)],
            [
              {
                label: 'Video',
                isEditable: true,
                customView: true,
                value: (
                  <GSFileSelect
                    id="event-site-video"
                    accept=".mp4,.mov"
                    title={uploadButtonTitle}
                    description="Tap or drag a file to upload. Accepted file types: .MP4, .MOV"
                    sourceList={videoFiles}
                    setSelectedFiles={onChangeVideoFiles}
                    removeSourceItem={() => onChangeVideoFiles([])}
                  />
                ),
              },
            ]
          )}
        />
      )
    }

    if (section === 'tournamentDetails') {
      return (
        <GSFormSection
          type="vertical xx-large-gap"
          // Tournament Details has no Section Header of its own to show/hide
          // (see DEFAULT_SECTION_HEADERS' comment), so there's nothing here for
          // `locked` to gate either — always both button fields. The only
          // section that still has editable button text at all (see
          // headerAndButtonsRow's own removal above — Packages/Sponsors/
          // Donation's buttons are fixed default copy now), so each field's
          // `description` is what says where it actually leads instead of a
          // per-button field label.
          fields={[
            buttonTextField(buttons.registerNow, value => onChangeButton('registerNow', value), 'Links to Packages'),
            buttonTextField(buttons.makeDonation, value => onChangeButton('makeDonation', value), 'Links to Donation'),
          ]}
        />
      )
    }

    // Packages/Sponsors/Donation/Additional Pages/Live Scoring all just get
    // their own Section Header field now (same as description/
    // additionalDescription/registrationDetails/photo/video above) —
    // Tournament Details is the only section left with its own editable button text
    // (see the tournamentDetails block above); Packages'/Sponsors'/Donation's
    // own "View Packages"/"View Sponsors"/"Donate Now" buttons render fixed
    // default copy (DEFAULT_SECTION_BUTTONS) on the live site instead.
    if (
      section === 'packages' ||
      section === 'sponsors' ||
      section === 'donation' ||
      section === 'additionalPages' ||
      section === 'liveScoring'
    ) {
      return (
        <GSFormSection
          type="vertical xx-large-gap"
          fields={sectionFields([sectionHeaderField(header, onChangeHeader, section, locked)])}
        />
      )
    }

    return null
  })()

  if (!body) return null

  return (
    <div className="ordr1-list">
      <GSActionBar
        type="form-header H3"
        header={title}
        // Same "open the live site in a new tab" convention as the tile
        // list's own "View Homepage" button (EventSiteHomepageSectionsList's
        // `.ehs-details-banner`) — repeated here so a change can be checked
        // against the live site without first backing out to that list.
        pageActions={[
          {
            buttonTitle: 'View Event Site',
            rightIcon: faExternalLinkSquare,
            type: 'light-grey',
            isFocusable: true,
            actionClick: () => window.open('/event-site', '_blank', 'noopener,noreferrer'),
          },
        ]}
      />
      {body}
    </div>
  )
}
