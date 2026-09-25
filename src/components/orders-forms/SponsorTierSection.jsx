import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { useDragToReorder } from '../../gs-lib/hooks/useDragToReorder.js'
import SponsorRow from './SponsorRow.jsx'
import './SponsorTierSection.scss'

// One tier's header + sponsor rows on the Sponsors list page. Reordering
// (via SponsorRow's drag handle) is only meaningful within a tier that has
// more than one sponsor, so `onReorder` is only wired up — and the handle
// only shown — when `sponsors.length > 1`.
//
// Pointer-based drag-to-reorder (useDragToReorder), same shared convention
// as AddQuestionFields' dropdown options / WavesPanel's waves.
export default function SponsorTierSection({ tierName, sponsors, onReorder, onEditTier, onSelectSponsor }) {
  const reorderable = sponsors.length > 1

  const {
    draggingId,
    dragOffsetY,
    flashOffsets,
    displayOrder: displayIds,
    dragMovedRef,
    rowsBoxRef,
    setRowRef,
    handleGrabberPointerDown,
  } = useDragToReorder(sponsors.map(s => s.id), onReorder)

  const displaySponsors = displayIds.map(id => sponsors.find(s => s.id === id)).filter(Boolean)

  return (
    <div className="spn-tier-section">
      <div className="spn-tier-header">
        <div className="spn-tier-name">{tierName} ({sponsors.length})</div>
        <button type="button" className="spn-tier-edit" onClick={onEditTier} aria-label={`Edit ${tierName}`}>
          <FontAwesomeIcon icon={faPen} />
        </button>
      </div>

      <div className={`spn-tier-rows${draggingId != null ? ' spn-tier-rows--reordering' : ''}`} ref={rowsBoxRef}>
        {displaySponsors.map(sponsor => (
          <SponsorRow
            key={sponsor.id}
            sponsor={sponsor}
            showGrabber={reorderable}
            isDragging={sponsor.id === draggingId}
            offsetY={sponsor.id === draggingId ? dragOffsetY : (flashOffsets[sponsor.id] ?? 0)}
            onGrabberPointerDown={e => handleGrabberPointerDown(e, sponsor.id)}
            onRowRef={el => setRowRef(sponsor.id, el)}
            onClick={() => { if (!dragMovedRef.current) onSelectSponsor(sponsor) }}
          />
        ))}
      </div>
    </div>
  )
}
