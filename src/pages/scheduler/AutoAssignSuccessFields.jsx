import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import './AutoAssignSuccessFields.scss'

// Shown after Auto Assign fills just the active round, only when that round
// has other rounds linked to it — offers to run the same settings against
// them too. Each card reuses the exact same round-detail markup/classes as
// RoundListCard and FilterRoundCard (.sched-filter-round-details etc., from
// TournamentSchedulerPage.scss) so a linked round reads identically here as
// it does everywhere else in the app, including the real Draft/Ready status
// pill rather than a one-off status just for this screen.
export default function AutoAssignSuccessFields({ roundName, assignedCount, remainingCount, linkedRounds }) {
  return (
    <>
      <div className="aasf-header">
        <FontAwesomeIcon icon={faCircleCheck} className="aasf-header-icon" />
        <h1 className="aasf-header-title">{roundName} Assigned</h1>
      </div>
      <div className="aasf-body">
        <div className="aasf-desc">
          {assignedCount} teams have been assigned to {roundName}. Would you like to use the same settings and assign the remaining {remainingCount} teams to the following rounds:
        </div>
        <div className="aasf-round-list">
          {linkedRounds.map(r => (
            <div className="aasf-round-card" key={r.name}>
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
