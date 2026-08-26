import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGripLines } from '@fortawesome/free-solid-svg-icons'
import SponsorDetails from './SponsorDetails.jsx'
import './SponsorRow.scss'

const STATUS_META = {
  active:   { label: 'Active',   className: 'active' },
  inactive: { label: 'Inactive', className: 'inactive' },
}

// A tier section only gets drag-to-reorder once it has more than one
// sponsor in it — with a single sponsor there's nothing to reorder against,
// so that row shows its status pill instead (matches the Figma "Sponsors"
// file, where the single-sponsor Technology Sponsor tier shows a status
// pill while the multi-sponsor tiers show a grip handle).
//
// Reordering itself is driven entirely by the parent (see
// SponsorTierSection's pointer-based drag) — this component just renders
// whatever offsetY/isDragging it's given and forwards the grabber's
// pointerdown upward, same split as AddQuestionFields' DropdownOptionRow.
export default function SponsorRow({ sponsor, showGrabber, isDragging, offsetY, onGrabberPointerDown, onRowRef, onClick }) {
  const status = STATUS_META[sponsor.status]

  const style = {
    transform: offsetY ? `translateY(${offsetY}px)` : undefined,
    zIndex: isDragging ? 2 : undefined,
  }

  return (
    <div
      className={`spn-row${isDragging ? ' spn-row--dragging' : ''}`}
      role="button"
      tabIndex={0}
      ref={onRowRef}
      style={style}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="spn-row-thumb" />

      <div className="spn-row-details">
        <SponsorDetails sponsor={sponsor} />
      </div>

      <div className="spn-row-side">
        {showGrabber ? (
          <span
            className="spn-drag-handle"
            aria-label="Drag to reorder"
            onPointerDown={onGrabberPointerDown}
            onClick={e => e.stopPropagation()}
          >
            <FontAwesomeIcon icon={faGripLines} />
          </span>
        ) : (
          <span className={`spn-status-pill ${status.className}`}>{status.label}</span>
        )}
      </div>
    </div>
  )
}
