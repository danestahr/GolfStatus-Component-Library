import { faCommentAlt } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button.jsx'
import userRoundImg from '../../assets/user_round.png'
import './RegisteredTeamRow.scss'

// One team in the "Registered Teams" list (Figma "List Item") — team
// details and its roster of players. Clicking the row opens the Team
// Overview panel; the note button stops that click from also firing.
export default function RegisteredTeamRow({ team, onSelectTeam, onMessagePlayer }) {
  return (
    <div className="rtm-row" role="button" tabIndex={0} onClick={onSelectTeam} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelectTeam()}>
      <div className="rtm-details">
        <div className="rtm-team-info">
          <div className="rtm-team-line">
            <span className="rtm-team-name">{team.teamName}</span>
            <span className="rtm-team-count">({team.players.length})</span>
          </div>
          <div className="rtm-team-code">{team.code}</div>
        </div>

        <div className="rtm-player-list">
          {team.players.map(player => (
            <div key={player.id} className="rtm-player">
              <img className="rtm-player-avatar" src={player.avatar ?? userRoundImg} alt="" />
              <span className="rtm-player-name">
                {player.name} <span className="rtm-player-handicap">({player.handicap})</span>
              </span>
              {player.note && (
                <GSButton
                  size="secondary"
                  buttonIcon={faCommentAlt}
                  onClick={e => { e.stopPropagation(); onMessagePlayer(player) }}
                  isFocusable
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
