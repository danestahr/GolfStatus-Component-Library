import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TournamentSidebar from './TournamentSidebar.jsx'
import { findTournament, TOURNAMENTS } from '../../../data/mockTournaments'
import { findCreatedTournament } from '../../../data/createdTournaments'
import logo from '../../../assets/GS_Logo.svg'
import './TournamentOverviewPage.scss'

// Shell for a management area mounted under a tournament
// (/tournaments/:tournamentId/<area>): the tournament-management sidebar
// beside the area's own page. The Overview page renders the same sidebar.
export default function TournamentSection({ activeId, children }) {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const tournament = findCreatedTournament(tournamentId) ?? findTournament(tournamentId) ?? TOURNAMENTS[0]

  const go = to => {
    setMenuOpen(false)
    navigate(to)
  }

  return (
    <div className="to-page">
      <TournamentSidebar
        tournamentId={tournament.id}
        tournamentName={tournament.name}
        activeId={activeId}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={go}
        onBack={() => go('/tournaments')}
      />

      <div className="to-main">
        <header className="to-topbar">
          <img src={logo} alt="" />
          <span>Tournament Management</span>
          <button type="button" aria-label="Menu" onClick={() => setMenuOpen(true)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
