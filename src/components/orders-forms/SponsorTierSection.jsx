import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import SponsorRow from './SponsorRow.jsx'
import './SponsorTierSection.scss'

// One tier's header + sponsor rows on the Sponsors list page. Reordering
// (via SponsorRow's drag handle) is only meaningful within a tier that has
// more than one sponsor, so `onReorder` is only wired up — and the handle
// only shown — when `sponsors.length > 1`.
export default function SponsorTierSection({ tierName, sponsors, onReorder, onEditTier, onSelectSponsor }) {
  const reorderable = sponsors.length > 1
  const dragIndex = useRef(null)

  function handleDragStart(index) {
    dragIndex.current = index
  }

  function handleDrop(e, index) {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === index) return
    onReorder(dragIndex.current, index)
    dragIndex.current = null
  }

  return (
    <div className="spn-tier-section">
      <div className="spn-tier-header">
        <div className="spn-tier-name">{tierName} ({sponsors.length})</div>
        <button type="button" className="spn-tier-edit" onClick={onEditTier} aria-label={`Edit ${tierName}`}>
          <FontAwesomeIcon icon={faPen} />
        </button>
      </div>

      <div className="spn-tier-rows">
        {sponsors.map((sponsor, index) => (
          <SponsorRow
            key={sponsor.id}
            sponsor={sponsor}
            draggable={reorderable}
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => reorderable && e.preventDefault()}
            onDrop={e => reorderable && handleDrop(e, index)}
            onClick={() => onSelectSponsor(sponsor)}
          />
        ))}
      </div>
    </div>
  )
}
