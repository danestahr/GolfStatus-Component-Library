import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCommentAlt } from '@fortawesome/free-solid-svg-icons'
import './TeamRosterCard.scss'

// A single person's card in the "Unassigned Players" or "Waitlist Entries"
// horizontal strip — everyone here is waiting on a team, so the primary
// action is always assigning them to one (Figma "Info Group Variants").
export default function TeamRosterCard({ person, onAddTeam, onMessage }) {
  return (
    <div className="tmr-card">
      <div className="tmr-card-details">
        <div className="tmr-card-info">
          <div className="tmr-card-name">{person.name}</div>
          <div className="tmr-card-sub">{person.email}</div>
          <div className="tmr-card-sub">{person.phone}</div>
          {person.entryType && <div className="tmr-card-sub">{person.entryType}</div>}
        </div>

        <button type="button" className="tmr-card-add-team" onClick={onAddTeam}>
          <FontAwesomeIcon icon={faPlus} />
          Add Team
        </button>
      </div>

      <button type="button" className="tmr-card-message" onClick={onMessage} aria-label={`Message ${person.name}`}>
        <FontAwesomeIcon icon={faCommentAlt} />
      </button>
    </div>
  )
}
