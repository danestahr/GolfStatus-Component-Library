import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListCheck, faUsersSlash, faSync } from '@fortawesome/free-solid-svg-icons'
import RegisteredTeamRow from './RegisteredTeamRow.jsx'
import './RegisteredTeamsSection.scss'

// "Registered Teams" — the sticky header carries the tournament-wide
// actions (Team Check In, Disqualified Teams, Update Handicaps), the list
// below is every fully-registered team (Figma "Registered Teams").
export default function RegisteredTeamsSection({ teams, totalCount, checkedInCount, disqualifiedCount, onTeamCheckIn, onDisqualifiedTeams, onUpdateHandicaps, onSelectTeam, onMessagePlayer }) {
  return (
    <div className="rtm-section">
      <div className="rtm-section-header">
        <div className="rtm-section-title-group">
          <div className="rtm-section-title">Registered Teams ({checkedInCount}/{totalCount})</div>
          <div className="rtm-section-subtitle">Disqualified ({disqualifiedCount})</div>
        </div>
        <div className="rtm-section-actions">
          <button type="button" className="rtm-header-btn" onClick={onTeamCheckIn}>
            <FontAwesomeIcon icon={faListCheck} />
            Team Check In
          </button>
          <button type="button" className="rtm-header-btn" onClick={onDisqualifiedTeams}>
            <FontAwesomeIcon icon={faUsersSlash} />
            Disqualified Teams
          </button>
          <button type="button" className="rtm-header-btn" onClick={onUpdateHandicaps}>
            <FontAwesomeIcon icon={faSync} />
            Update Handicaps
          </button>
        </div>
      </div>

      <div className="rtm-section-rows">
        {teams.map(team => (
          <RegisteredTeamRow
            key={team.id}
            team={team}
            onSelectTeam={() => onSelectTeam(team)}
            onMessagePlayer={onMessagePlayer}
          />
        ))}
      </div>
    </div>
  )
}
