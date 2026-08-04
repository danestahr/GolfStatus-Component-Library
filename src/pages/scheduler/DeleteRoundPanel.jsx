import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation, faWater } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import AppSidePanel from '../../components/AppSidePanel'
import './DeleteRoundPanel.scss'

// Confirmation panel for permanently removing a round. Its round-summary
// card reuses the same info-block markup as RoundListCard/FilterRoundCard
// (classes defined in TournamentSchedulerPage.scss, always loaded alongside
// this panel) so the round being deleted is shown exactly as it appears in
// the round list, just with its Start Round action shown disabled — this is
// a read-out, not something to act on from here.
export default function DeleteRoundPanel({
  isOpen, onClose, onDelete,
  name, roundMeta, courseName, waveName,
}) {
  const meta = roundMeta ?? {}
  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Round"
      actions={[
        { name: 'Delete', type: 'red', action: onDelete },
        { name: 'Cancel', type: 'light-grey', action: onClose },
      ]}
    >
      <div className="drp-header">
        <FontAwesomeIcon icon={faCircleExclamation} className="drp-header-icon" />
        <h1 className="drp-header-title">Delete Round</h1>
      </div>

      <div className="drp-body">
        <div className="drp-desc">
          Are you sure you want to delete <strong>{name}</strong>? This cannot be undone.
        </div>

        <div className="drp-round-card">
          <div className="sched-filter-round-details">
            <div className="sched-filter-round-group">
              <div className="sched-filter-round-name">{name}</div>
              <div className="sched-filter-round-sub">{meta.format}</div>
            </div>
            <div className="sched-filter-round-group">
              <div className="sched-filter-round-sub">{meta.dateTime}</div>
              <div className="sched-filter-round-sub">{meta.startType}</div>
            </div>
            <div className="sched-filter-round-sub">{meta.facilityName}</div>
            <div className="sched-filter-round-group">
              <div className="sched-filter-round-sub">{courseName}</div>
              <div className="sched-filter-round-sub">{meta.holes} Holes</div>
            </div>
            {waveName && (
              <span className="sched-wave-badge">
                <FontAwesomeIcon icon={faWater} /> {waveName}
              </span>
            )}
            <span className={`sched-round-status sched-round-status--${meta.status?.toLowerCase()}`}>{meta.status}</span>
          </div>
          <GSButton type="green" isDisabled title="Start Round" />
        </div>
      </div>
    </AppSidePanel>
  )
}
