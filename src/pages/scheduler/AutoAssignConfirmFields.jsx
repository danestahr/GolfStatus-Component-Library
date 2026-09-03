import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt } from '@fortawesome/free-solid-svg-icons'
import './AutoAssignConfirmFields.scss'

// Confirmation step shown between the Auto Assign form and actually running
// it, only when the active round has other rounds linked to it. Each card
// reuses the exact same round-detail markup/classes as RoundListCard and
// FilterRoundCard (.sched-filter-round-details etc., from
// TournamentSchedulerPage.scss) so a linked round reads identically here as
// it does everywhere else in the app, including the real Draft/Ready status
// pill rather than a one-off status just for this screen.
export default function AutoAssignConfirmFields({ roundNumberLabel, linkedRounds }) {
  return (
    <>
      <div className="aacf-header">
        <FontAwesomeIcon icon={faBolt} className="aacf-header-icon" />
        <h1 className="aacf-header-title">Assign All Rounds</h1>
      </div>
      <div className="aacf-body">
        <div className="aacf-desc">
          Do you want to assign the other rounds associated with {roundNumberLabel}?
        </div>
        <div className="aacf-round-list">
          {linkedRounds.map(r => (
            <div className="aacf-round-card" key={r.name}>
              <div className="sched-filter-round-details">
                <div className="sched-filter-round-group">
                  <div className="sched-filter-round-name">{r.name}</div>
                  <div className="sched-filter-round-sub">{r.groupLabel}</div>
                </div>
                <div className="sched-filter-round-sub">{r.meta.format}</div>
                <div className="sched-filter-round-group">
                  <div className="sched-filter-round-sub">{r.meta.dateTime}</div>
                  <div className="sched-filter-round-sub">{r.meta.startType}</div>
                </div>
                <div className="sched-filter-round-sub">{r.meta.facilityName}</div>
                <div className="sched-filter-round-group">
                  <div className="sched-filter-round-sub">{r.courseName}</div>
                  <div className="sched-filter-round-sub">{r.meta.holes} Holes</div>
                </div>
                <span className={`sched-round-status sched-round-status--${r.status.toLowerCase()}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
