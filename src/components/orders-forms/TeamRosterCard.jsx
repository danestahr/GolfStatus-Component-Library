import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCommentAlt, faFileLines, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button.jsx'
import './TeamRosterCard.scss'

// A single person's card in the "Unassigned Players" or "Waitlist Entries"
// horizontal strip — everyone here is waiting on a team, so the primary
// action is always assigning them to one (Figma "Info Group Variants").
// The File / file-invoice-dollar icon buttons only show up for a person
// whose own order we can link to (see mockTeams.js's `orderId` on
// unassigned players) — waitlist entries don't carry one yet. Add Team goes
// icon-only on Unassigned Players (see `iconOnlyAddTeam`, set per-section in
// TeamsListPage.jsx) since every unassigned card already competes for space
// with those icons or the message button; Waitlist Entries keeps the full
// text label. Tapping the info block itself (Figma "Player Details") opens
// the Edit Player screen — only wired for Unassigned Players (see
// TeamsListPage.jsx), so `onEditPlayer` is left undefined for Waitlist
// Entries and the block stays a plain, non-clickable div there instead of
// looking interactive with nowhere to go.
export default function TeamRosterCard({ person, onAddTeam, onMessage, onFormResponses, onViewOrder, onEditPlayer, iconOnlyAddTeam }) {
  const info = (
    <>
      <div className="tmr-card-name">{person.name}</div>
      <div className="tmr-card-sub">{person.email}</div>
      <div className="tmr-card-sub">{person.phone}</div>
      {person.entryType && <div className="tmr-card-sub">{person.entryType}</div>}
    </>
  )

  return (
    <div className="tmr-card">
      <div className="tmr-card-details">
        {onEditPlayer ? (
          <button type="button" className="tmr-card-info" onClick={() => onEditPlayer(person)}>
            {info}
          </button>
        ) : (
          <div className="tmr-card-info">{info}</div>
        )}

        <div className="tmr-card-actions">
          <button
            type="button"
            className={`tmr-card-add-team${iconOnlyAddTeam ? ' tmr-card-add-team--icon-only' : ''}`}
            onClick={onAddTeam}
            aria-label={iconOnlyAddTeam ? `Add ${person.name} to a team` : undefined}
          >
            <FontAwesomeIcon icon={faPlus} />
            {!iconOnlyAddTeam && 'Add Team'}
          </button>

          {person.orderId && (
            <>
              <button
                type="button"
                className="tmr-card-icon-btn"
                onClick={onViewOrder}
                aria-label={`View ${person.name}'s order`}
              >
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
              </button>
              <button
                type="button"
                className="tmr-card-icon-btn"
                onClick={onFormResponses}
                aria-label={`View ${person.name}'s form responses`}
              >
                <FontAwesomeIcon icon={faFileLines} />
              </button>
            </>
          )}
        </div>
      </div>

      <GSButton size="secondary" buttonIcon={faCommentAlt} onClick={onMessage} isFocusable />
    </div>
  )
}
