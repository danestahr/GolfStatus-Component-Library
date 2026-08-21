import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faQrcode } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import NavRow from './NavRow.jsx'
import userRoundImg from '../../assets/user_round.png'
import './TeamOverviewPanel.scss'

// Content of the side panel opened by clicking a registered team row
// (Figma "Team Overview") — team details and roster up top, then the same
// settings-style nav rows pattern as SponsorOverviewPanel/NavRow. Order
// Details and Form Responses open this team's linked order (see the
// SponsorsListPage.jsx comment this mirrors); a player card's own "Form
// Responses" button jumps to that same order's responses pre-filtered to
// just them. The rest (Hole Assignments, Handicaps, Tees, Scorecards,
// Player Notes) don't exist in this prototype yet, so they stay decorative.
export default function TeamOverviewPanel({ team, onViewOrderDetails, onViewFormResponses, onViewPlayerResponses }) {
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
            <img className="tmo-player-avatar" src={player.avatar ?? userRoundImg} alt="" />
            <div className="tmo-player-info">
              <div className="tmo-player-name-line">
                <span className="tmo-player-name">{player.name}</span>
                <span className="tmo-player-handicap">({player.handicap})</span>
              </div>
              <div className="tmo-player-email">{player.email}</div>
            </div>
            <GSButton
              title="Form Responses"
              type="light-grey"
              size="secondary"
              isFocusable
              onClick={() => onViewPlayerResponses(player)}
            />
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
