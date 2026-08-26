import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faQrcode, faFileLines } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import NavRow from './NavRow.jsx'
import userRoundImg from '../../assets/user_round.png'
import './TeamOverviewPanel.scss'

// Content of the side panel opened by clicking a registered team row
// (Figma "Team Overview") — team details and roster up top, then the same
// settings-style nav rows pattern as SponsorOverviewPanel/NavRow. Order
// Details and Form Responses open this team's linked order (see the
// SponsorsListPage.jsx comment this mirrors) — a player carrying their own
// separate `orderId` (added in from Unassigned Players rather than
// registered as part of this team's own bulk order — see the Fairway
// Fanatics comment in mockTeams.js) is only reachable through that team-
// level Order Details row's picker (see TeamOrderPicker.jsx), not from the
// player card itself. A player card's own Form Responses button matches
// TeamRosterCard's Unassigned Players text-button style (`.tmr-card-add-
// team`) and always jumps to that player's own answers. Tapping the rest of
// the card (Figma "Player Details") opens that player in the Edit Player
// screen. The rest (Hole Assignments, Handicaps, Tees, Scorecards, Player
// Notes nav row) don't exist in this prototype yet, so they stay decorative.
export default function TeamOverviewPanel({ team, onViewOrderDetails, onViewFormResponses, onViewPlayerResponses, onEditPlayer }) {
  return (
    <div className="tmo-overview">
      <div className="tmo-hero">
        <div className="tmo-hero-info">
          <div className="tmo-name-line">
            <span className="tmo-name">{team.teamName}</span>
            <span className="tmo-name-count">({team.players.length})</span>
          </div>

          <span className="tmo-code-badge">
            <FontAwesomeIcon icon={faQrcode} />
            {team.code}
          </span>

          <div className="tmo-contact">
            <div>{team.contactName}</div>
            <div>{team.email}</div>
            <div>{team.phone}</div>
          </div>
        </div>

        <GSButton buttonIcon={faPen} type="light-grey icon" isFocusable onClick={() => {}} />
      </div>

      <div className="tmo-player-strip">
        {team.players.map(player => (
          <div key={player.id} className="tmo-player-card">
            <button type="button" className="tmo-player-main" onClick={() => onEditPlayer(player)}>
              <img className="tmo-player-avatar" src={player.avatar ?? userRoundImg} alt="" />
              <div className="tmo-player-info">
                <div className="tmo-player-name-line">
                  <span className="tmo-player-name">{player.name}</span>
                  <span className="tmo-player-handicap">({player.handicap})</span>
                </div>
                <div className="tmo-player-email">{player.email}</div>
              </div>
            </button>
            <div className="tmo-player-actions">
              <button type="button" className="tmo-player-btn" onClick={() => onViewPlayerResponses(player)}>
                <FontAwesomeIcon icon={faFileLines} />
                Form Responses
              </button>
            </div>
          </div>
        ))}
      </div>

      <NavRow title="Hole Assignments & Check In" />
      <NavRow title="Handicaps" />
      <NavRow title="Tees" />
      <NavRow title="Scorecards" />
      <NavRow title="Player Notes" description="View player registration notes." />
      <NavRow title="Order Details" description="View team payment and order details." onClick={onViewOrderDetails} />
      <NavRow title="Form Responses" description="View this team's form responses." onClick={onViewFormResponses} />
    </div>
  )
}
