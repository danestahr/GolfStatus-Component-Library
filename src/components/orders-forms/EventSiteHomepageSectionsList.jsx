import GSActionBar from '../../gs-lib/components/gs-action-bar'
import { useDragToReorder } from '../../gs-lib/hooks/useDragToReorder.js'
import EventSiteHomepageSectionRow from './EventSiteHomepageSectionRow.jsx'
import EventSiteHomepageSectionPreview from './EventSiteHomepageSectionPreview.jsx'
import { golfstatusColors } from '../../gs-lib/helpers/Theme'
import { loadEventSiteStyle, hasEventSiteStyle } from '../../data/eventSiteStyle.js'
import {
  DONATIONS_ENABLED,
  HOMEPAGE_SECTION_BY_ID,
  hasHomepageSectionContent,
  isHomepageSectionEditable,
} from '../../data/eventSiteHomepageSections.js'
import './EventSiteHomepageSectionsList.scss'

// A section with nothing in it wouldn't actually render on the public event
// site, so its tile shows a muted "Not Added" pill instead — editable ones
// still link to their own edit screen (that's how you'd add the content
// that clears it), but the three data-driven uneditable ones just reflect
// whatever's really there. Tournament Details/Additional Pages/Live Scoring
// have no such underlying list in this prototype (they're fixed marketing/
// nav blocks in EventWebsitePage.jsx), so they're never considered empty.
const hasContent = hasHomepageSectionContent

// Every "Not Added" tile gets a muted caption, instead of leaving the
// admin to guess why it reads that way — see EventSiteHomepageSectionRow's
// own `description` prop. Packages/Sponsors/Donation (content driven by
// data this list itself can't edit) get a specific one pointing at where
// to actually add that data; everything else this list DOES control
// directly (banner/photo/video — its own edit screen's fields are right
// there) just falls back to a plain "Empty." Nothing for sections that are never
// empty (tournamentDetails/additionalPages/liveScoring — see hasContent's
// own default case above), since `hidden` never fires for them. Donation
// gets a fixed caption whenever DONATIONS_ENABLED is off instead — not
// gated on `hidden` like the rest of this function, since a disabled tile
// isn't just "currently empty", it's non-editable (see HOMEPAGE_SECTIONS)
// and never going anywhere.
function sectionDescription(id, hidden) {
  if (id === 'donation' && !DONATIONS_ENABLED) return 'Donations are not enabled for this tournament.'
  if (!hidden) return undefined
  switch (id) {
    case 'packages':
      return 'Add packages from the Packages screen to show this section on the live site.'
    case 'sponsors':
      return 'Add sponsors from the Sponsors screen to show this section on the live site.'
    case 'donation':
      return 'Set a donation goal to show this section on the live site.'
    default:
      return 'Empty'
  }
}

// A premium tournament's own custom Section Header (EventSiteHomepageFields.jsx's
// sectionHeaderField) replaces the tile's fixed admin-facing label once it's
// actually been edited — so renaming a section's live-site title also
// renames its own tile (and, while its own edit screen is open, that
// screen's in-panel header and the side panel's own top title bar too —
// see EventSitePackagesListPage.jsx's `panelTitle`), instead of the tile
// forever reading its original HOMEPAGE_SECTIONS label regardless of what's
// now showing on the live site. Non-premium never shows this (isPremium
// itself gates whether Section Header can even be typed into — see
// EventSiteHomepageFields.jsx's `locked` comment), and a blank header (a
// deliberate "hide this section's title on the live site" choice) still
// falls back to the fixed label here — the tile/screen title always needs
// some name to read by, that choice is about the live site's title, not
// this one.
export function sectionTileLabel(id, fixedLabel, headers, isPremium) {
  if (!isPremium) return fixedLabel
  const header = (headers[id] ?? '').trim()
  return header !== '' ? header : fixedLabel
}

// The Event Site Homepage screen's own tile list (Figma "Event Site
// Homepage") — one tile per section of the public event site, labeled to
// match that page's own section text (see data/eventSiteHomepageSections.js),
// in the same top-to-bottom order they render there. No panel-level Save
// here — reordering persists immediately on drop (`onReorder`, the parent
// page's own immediate-write handler), and a tile's own fields are edited
// (and saved/canceled) on their own screen instead of inline in this list —
// see `onEditSection`, which navigates the single AppSidePanel there
// (EventSitePackagesListPage.jsx's `handleEditHomepageSection` /
// `editingHomepageSectionId`), same one-panel-swaps-screens convention as
// the Packages list's own category pencil.
//
// Pointer-based drag-to-reorder (useDragToReorder), same shared convention
// as SponsorTierSection's sponsor rows / AddQuestionFields' dropdown options
// / WavesPanel's waves.
export default function EventSiteHomepageSectionsList({
  order,
  onReorder,
  bannerFiles,
  description,
  additionalDescription,
  registrationDetails,
  photoFiles,
  videoFiles,
  headers,
  visibility,
  onEditSection,
  isPremium,
}) {
  const draft = {
    bannerFiles,
    description,
    additionalDescription,
    registrationDetails,
    photoFiles,
    videoFiles,
  }

  // Non-premium can't reorder sections at all (see EventSiteHomepageSectionRow's
  // own `showGrabber` below) — no `onReorder` handed to the hook means a drag
  // can never actually happen (nothing renders the grip to start one), same
  // "no handler means no handle" convention PackageCategorySection/PackageRow
  // already use for packages.
  const {
    draggingId,
    dragOffsetY,
    flashOffsets,
    displayOrder,
    dragMovedRef,
    rowsBoxRef,
    setRowRef,
    handleGrabberPointerDown,
  } = useDragToReorder(order, isPremium ? onReorder : undefined)

  // Same "has this tournament actually saved a style" gate
  // EventSitePreviewCard uses — non-premium (or never-styled) falls back to
  // GolfStatus's fixed grey. Read fresh each render so the tiles flip the
  // moment a style is saved.
  const savedStyle = isPremium && hasEventSiteStyle() ? loadEventSiteStyle() : null
  const primaryColor = savedStyle ? savedStyle.primaryColor : golfstatusColors.grey800
  const secondaryColor = savedStyle ? savedStyle.secondaryColor : golfstatusColors.grey800
  const neutralTint = savedStyle ? savedStyle.neutralTint : 'golfstatus'

  return (
    <div className="ordr1-list">
      <GSActionBar type="form-header H3" header="Event Site Homepage" />

      <div className={`ehs-rows${draggingId != null ? ' ehs-rows--reordering' : ''}`} ref={rowsBoxRef}>
        {displayOrder.map(id => {
          const fixed = HOMEPAGE_SECTION_BY_ID[id]
          if (!fixed) return null

          const hidden = !hasContent(id, draft)

          return (
            <EventSiteHomepageSectionRow
              key={id}
              label={sectionTileLabel(id, fixed.label, headers, isPremium)}
              description={sectionDescription(id, hidden)}
              preview={
                <EventSiteHomepageSectionPreview
                  sectionId={id}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  neutralTint={neutralTint}
                  buttonStyles={savedStyle?.buttonStyles}
                  bordered
                />
              }
              editable={isHomepageSectionEditable(id, isPremium)}
              hidden={hidden}
              visible={!hidden && visibility?.[id] !== false}
              isDragging={id === draggingId}
              offsetY={id === draggingId ? dragOffsetY : (flashOffsets[id] ?? 0)}
              onGrabberPointerDown={e => handleGrabberPointerDown(e, id)}
              onRowRef={el => setRowRef(id, el)}
              showGrabber={isPremium}
              onClick={() => {
                if (dragMovedRef.current) return
                onEditSection(id)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
