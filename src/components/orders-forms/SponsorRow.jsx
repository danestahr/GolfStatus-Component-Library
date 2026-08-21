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
export default function SponsorRow({ sponsor, draggable, onDragStart, onDragOver, onDrop, onDragEnd, onClick }) {
  const status = STATUS_META[sponsor.status]

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', sponsor.id)
    onDragStart(e)
  }

  return (
    <div
      className="spn-row"
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="spn-row-thumb" />

      <div className="spn-row-details">
        <SponsorDetails sponsor={sponsor} />
      </div>

      <div className="spn-row-side">
        {draggable ? (
          <span className="spn-drag-handle" aria-label="Drag to reorder">
            <FontAwesomeIcon icon={faGripLines} />
          </span>
        ) : (
          <span className={`spn-status-pill ${status.className}`}>{status.label}</span>
        )}
      </div>
    </div>
  )
}
