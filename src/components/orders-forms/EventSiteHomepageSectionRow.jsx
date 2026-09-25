import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSButton from '../../gs-lib/components/gs-button'
import { faCircleCheck, faGripLines, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import './EventSiteHomepageSectionRow.scss'

// A single tile on EventSiteHomepageSectionsList. Two siblings, not one box:
// `.ehs-row-card` (the padded, bordered, colored part) and the grip handle,
// sitting outside it in `.ehs-row`'s own flex row — same divided-sections-
// with-a-gutter structure the live event site itself uses (GSPageSection's
// own border-bottom, no card/shadow), rather than a drag handle living
// inside a card meant to preview that site's content.
//
// `.ehs-row-card` itself splits into two columns, `.ehs-row-main` (icon/
// label/pen) and `.ehs-row-preview` (the SVG thumbnail), with a vertical
// divider line between them (`.ehs-row-divider`, its own div rather than a
// border on either column) — skipped for a non-editable tile, since there's
// nothing on the other side of it to edit.
//
// The grip always drags to reorder, regardless of whether the section is
// directly editable — every section still has a place in the homepage's
// rendered order. The pencil only shows, and the tile itself is only a tap
// target, for a section this prototype can actually edit; an uneditable
// section (see HOMEPAGE_SECTIONS' `editable` flag) has no pen and no
// `onClick` at all, rather than a decorative pen on an inert tile.
// `showGrabber` is EventSiteHomepageSectionsList's own `isPremium` — a
// non-premium tournament can't reorder sections either, so the grip just
// doesn't render then (same "no handler means no handle" convention as
// PackageRow's own `showGrabber`), rather than rendering disabled.
//
// Tapping an editable tile (its label, its pen/plus — both live inside the
// same `.ehs-row-header` — or anywhere else on the card) navigates the
// single AppSidePanel to that section's own edit screen
// (EventSitePackagesListPage.jsx's `handleEditHomepageSection`,
// EventSiteHomepageFields rendered there) instead of expanding anything in
// place — same "one panel swaps screens" convention as the Packages list's
// own category pencil (PackageCategorySection -> EditPackageCategoryFields).
// The pen/plus GSButton itself takes no `onClick` of its own: its click
// still bubbles up to the header's own onClick below (its only job here is
// to look like a real button, same convention as PackageCategorySection's
// pencil and PackageRow's grip). The grip handle stops propagation on click,
// so a drag's trailing click can't also navigate the tile it lands on.
//
// `description` is optional, muted (70% opacity, regular weight) caption
// text under the label — for a tile whose content actually lives on
// another screen (Packages/Sponsors/Donation), explaining why it reads
// "Not Added" and where to go add the data that would light it up.
//
// A cyan check sits above the title/description (stacked, not side by
// side — both live in `.ehs-row-text`, which is a column) whenever the
// section is actually rendering on the live site right now (`!hidden`) —
// skipped for a disabled tile too (`!disabled`), even though those are
// already `hidden` in practice (nothing to check off there either).
//
// `preview` is an optional element (EventSiteHomepageSectionPreview, one
// per HOMEPAGE_SECTIONS id) sitting in its own `.ehs-row-preview` column, to
// the right of the vertical divider (editable tiles only, see
// `.ehs-row-divider` above) — a quick visual reminder of what that section
// actually looks like on the live site, for a tile whose fields alone
// (button text only, no Section Header) don't otherwise say much.
export default function EventSiteHomepageSectionRow({
  label,
  description,
  preview,
  editable,
  hidden,
  isDragging,
  offsetY,
  onGrabberPointerDown,
  onRowRef,
  onClick,
  showGrabber = true,
}) {
  const style = {
    transform: offsetY ? `translateY(${offsetY}px)` : undefined,
    zIndex: isDragging ? 2 : undefined,
  }

  // A non-editable tile with nothing in it (HOMEPAGE_SECTIONS' own
  // `editable: false` — Make a Donation while DONATIONS_ENABLED is off — or
  // a Premium-only section on a non-Premium tournament, see
  // isHomepageSectionEditable) reads as disabled, not "Not Added": flat grey
  // fill, no dashed border, no hover — there's nothing to add or edit here,
  // so none of the affordances that imply there is should show either. A
  // non-editable tile that already HAS content (that Premium-only section's
  // data managed elsewhere, e.g. Packages/Sponsors on a non-Premium
  // tournament) still reads as successfully added instead — same look as
  // any other live section, cyan check included — just without the
  // clickable/hover affordance `editable` below already gates, since there's
  // still nothing here for this tile itself to edit. Still draggable either
  // way (see the grip handle below), just never `--hidden`'s "you could fix
  // this" treatment.
  const disabled = !editable && hidden

  return (
    <div className={`ehs-row${isDragging ? ' ehs-row--dragging' : ''}`} ref={onRowRef} style={style}>
      <div
        className={`ehs-row-card${
          disabled ? ' ehs-row-card--disabled' : hidden ? ' ehs-row-card--hidden' : ''
        }${editable ? ' ehs-row-card--clickable' : ''}`}
      >
        <div className="ehs-row-main">
          <div
            className={`ehs-row-header${editable ? ' ehs-row-header--clickable' : ''}${
              disabled ? ' ehs-row-header--disabled' : hidden ? ' ehs-row-header--hidden' : ''
            }`}
            role={editable ? 'button' : undefined}
            tabIndex={editable ? 0 : undefined}
            onClick={editable ? onClick : undefined}
            onKeyDown={editable ? e => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
          >
            <div className="ehs-row-text">
              {!hidden && !disabled && <FontAwesomeIcon icon={faCircleCheck} className="ehs-row-added-icon" />}
              <div className="ehs-row-labels">
                <span className="ehs-row-label">{label}</span>
                {description && <span className="ehs-row-description">{description}</span>}
              </div>
            </div>

            {editable &&
              (hidden ? (
                // A "Not Added" tile has nothing to edit yet — a solid black
                // plus reads as "add" instead of the pencil's "edit".
                <GSButton buttonIcon={faPlus} type="black" style={{ flexShrink: 0 }} />
              ) : (
                <GSButton buttonIcon={faPen} style={{ flexShrink: 0 }} />
              ))}
          </div>
        </div>

        {preview && (
          <>
            {editable && <div className="ehs-row-divider" />}
            <div className="ehs-row-preview">{preview}</div>
          </>
        )}
      </div>

      {showGrabber && (
        <span
          className="ehs-drag-handle"
          aria-label="Drag to reorder"
          onPointerDown={onGrabberPointerDown}
          onClick={e => e.stopPropagation()}
        >
          <GSButton buttonIcon={faGripLines} />
        </span>
      )}
    </div>
  )
}
