import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import TeamRosterCard from './TeamRosterCard.jsx'
import './TeamRosterSection.scss'

// "Unassigned Players" and "Waitlist Entries" share the same sticky
// header-plus-horizontal-strip shape in the Figma file, just with different
// header copy and card content (Info Group Variants) — one component
// covers both.
export default function TeamRosterSection({ title, addLabel, onAdd, onRemoveSelected, people, onAddTeam, onMessage }) {
  return (
    <div className="tmr-section">
      <div className="tmr-section-header">
        <div className="tmr-section-title">{title} ({people.length})</div>
        <div className="tmr-section-actions">
          <button type="button" className="tmr-header-btn" onClick={onAdd}>
            <FontAwesomeIcon icon={faPlus} />
            {addLabel}
          </button>
          <button type="button" className="tmr-header-icon-btn" onClick={onRemoveSelected} aria-label="Remove selected">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      <div className="tmr-section-strip">
        {people.map(person => (
          <TeamRosterCard
            key={person.id}
            person={person}
            onAddTeam={() => onAddTeam(person)}
            onMessage={() => onMessage(person)}
          />
        ))}
      </div>
    </div>
  )
}
