import { faChevronLeft, faSquareUpRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import logo from '../../../assets/GS_Logo.svg'
import avatar from '../../../assets/avatar-sample.png'
import './TournamentSidebar.scss'

// The tournament-management nav. `to` is where an item goes inside this
// prototype (items without one aren't built yet); `external` items open in
// their own tab in the real product and carry the little arrow.
export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'rounds', label: 'Rounds & Scorecards', to: '/scheduler' },
  { id: 'event-site', label: 'Event Site & Packages', to: '/orders-forms/event-site-packages' },
  { id: 'players', label: 'Players & Teams', to: '/teams' },
  { id: 'sponsors', label: 'Sponsors', to: '/sponsors' },
  { id: 'flights', label: 'Flights' },
  { id: 'leaderboards', label: 'Leaderboards & Skins' },
  { id: 'documents', label: 'Documents' },
  { id: 'orders', label: 'Orders & Payouts', to: '/orders' },
  { id: 'messages', label: 'Messages', to: '/messaging', external: true },
  { id: 'revenue', label: 'Revenue Enhancements', external: true },
]

// Dark left rail on desktop; below 1100px it becomes a drawer the top bar's
// menu button opens (see TournamentOverviewPage.scss for the breakpoint).
// Where an item goes for a given tournament: Overview and Event Site live
// under /tournaments/:id; everything else keeps its prototype route for now.
export const navTarget = (item, tournamentId) => {
  if (!tournamentId) return item.to
  if (item.id === 'overview') return `/tournaments/${tournamentId}`
  if (item.id === 'event-site') return `/tournaments/${tournamentId}/event-site-packages`
  return item.to
}

export default function TournamentSidebar({ tournamentId, tournamentName, activeId, isOpen, onClose, onNavigate, onBack }) {
  return (
    <>
      {isOpen && <div className="ts-overlay" onClick={onClose} />}
      <nav className={`ts${isOpen ? ' ts--open' : ''}`}>
        <div className="ts-brand">
          <img src={logo} alt="" />
          <span>Tournament<br />Management</span>
        </div>

        <button type="button" className="ts-back" onClick={onBack}>
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>Back</span>
        </button>

        <div className="ts-tournament">{tournamentName}</div>

        <div className="ts-items">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`ts-item${item.id === activeId ? ' ts-item--active' : ''}`}
              onClick={() => navTarget(item, tournamentId) && onNavigate(navTarget(item, tournamentId))}
            >
              <span>{item.label}</span>
              {item.external && <FontAwesomeIcon icon={faSquareUpRight} />}
            </button>
          ))}
        </div>

        <div className="ts-user">
          <img src={avatar} alt="" />
          <FontAwesomeIcon icon={faSquareUpRight} />
        </div>
      </nav>
    </>
  )
}
