import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  faBars, faBolt, faChevronRight, faClone, faGear, faListCheck, faMessage, faPen, faSquareUpRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSButton from '../../../gs-lib/components/gs-button'
import TournamentSidebar from './TournamentSidebar.jsx'
import { findTournament, statusMeta, TOURNAMENTS } from '../../../data/mockTournaments'
import { findCreatedTournament } from '../../../data/createdTournaments'
import { roundsFor } from '../../../data/mockTournamentRounds'
import logo from '../../../assets/GS_Logo.svg'
import eventHero from '../../../assets/event-hero.png'
import './TournamentOverviewPage.scss'

// Each section below the header is a row that leads to its own area of
// tournament management; Messages and Revenue Enhancements open elsewhere.
const SECTIONS = [
  { id: 'rounds', title: 'Rounds & Scorecards', description: 'Manage hole assignments, scorecards, leaderboards, rules, tees, and more.', to: '/scheduler' },
  { id: 'event-site', title: 'Event Site & Packages', description: 'Manage event website, tournament registration, packages, forms, event details, and more.', to: '/orders-forms/event-site-packages' },
  { id: 'players', title: 'Players & Teams', description: 'Add and manage players & teams, unassigned players, and waitlists.', to: '/teams' },
  { id: 'sponsors', title: 'Sponsors', description: 'Manage sponsors and mobile scorecard assignments.', to: '/sponsors' },
  { id: 'flights', title: 'Flights', description: 'Add and manage tournament flights.' },
  { id: 'leaderboards', title: 'Leaderboards & Skins', description: 'Manage tournament leaderboards & skins games.' },
  { id: 'documents', title: 'Documents', description: 'Download tournament printouts, reports, and exports, and more.' },
  { id: 'orders', title: 'Orders & Payouts', description: 'Manage registration orders, payouts, reporting documents, and more.', to: '/orders' },
  { id: 'messages', title: 'Messages', description: 'Send emails and in-app notifications to players and teams.', to: '/messaging', external: true },
  { id: 'revenue', title: 'Revenue Enhancements', description: 'Leverage exclusive packages and sponsorships to raise more money.', external: true },
  { id: 'settings', title: 'Settings & Preferences', description: 'Manage tournament details, users and permissions, donations, invoices, and more.' },
]

// What a round card offers at each stage: a status pill and two actions.
// `primary` is the green call-to-action.
const ROUND_STATUS = {
  draft: { label: 'Draft', buttonType: 'status inactive' },
  ready: { label: 'Ready', buttonType: 'black' },
  live: { label: 'Live', buttonType: 'status active' },
  final: { label: 'Final', buttonType: 'black' },
}

const ROUND_ACTIONS = {
  draft: [{ label: 'Edit Round', icon: faPen }, { label: 'Hole Assignments', icon: faBolt, to: '/scheduler' }],
  ready: [{ label: 'Hole Assignments', icon: faBolt, to: '/scheduler' }, { label: 'Start Round', primary: true }],
  live: [{ label: 'Team Check In', icon: faListCheck }, { label: 'Scorecards', icon: faPen }],
  final: [{ label: 'Scorecards', icon: faPen }, { label: 'Leaderboards & Skins' }],
}

const daysUntil = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((start - today) / 86400000)
}

const startsIn = iso => {
  const days = daysUntil(iso)
  if (days > 1) return `Starts in ${days} Days`
  if (days === 1) return 'Starts Tomorrow'
  if (days === 0) return 'Starts Today'
  return 'Tournament Started'
}

// "2026-11-05T08:00" -> "8:00 AM on Thu, Nov 5, 2026"
const roundTime = startsAt => {
  const date = new Date(startsAt)
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  return `${time} on ${day}`
}

function RoundCard({ round, onAction }) {
  const status = ROUND_STATUS[round.status]
  return (
    <div className="to-round">
      <div className="to-round-info">
        <div className="to-round-number">Round {round.number}</div>
        <div className="to-round-meta">
          <div>{round.format}</div>
          <div>{roundTime(round.startsAt)}</div>
          <div>{round.course}</div>
        </div>
        <GSButton type={status.buttonType} title={status.label} isPill hoverType="none" style={{ cursor: 'default' }} />
      </div>
      <div className="to-round-actions">
        {ROUND_ACTIONS[round.status].map(action => (
          <GSButton
            key={action.label}
            title={action.label}
            buttonIcon={action.icon}
            type={action.primary ? 'status active' : 'light-grey'}
            onClick={() => onAction(action)}
            isFocusable
          />
        ))}
      </div>
    </div>
  )
}

// Full-page tournament overview (its own route, not a slide-out): the
// tournament-management sidebar, a dark header with the tournament card and
// its main actions, then a row per area of management. Tournaments created in
// Quick Start are looked up first, then the seeded list; anything unknown
// falls back to the first seeded tournament so the page is never empty.
export default function TournamentOverviewPage() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  useLocation() // re-renders when navigating between tournaments
  const [menuOpen, setMenuOpen] = useState(false)

  const tournament = findCreatedTournament(tournamentId) ?? findTournament(tournamentId) ?? TOURNAMENTS[0]
  const status = statusMeta(tournament.status)
  const rounds = roundsFor(tournament)
  const image = tournament.image ?? (tournament.hasBanner ? eventHero : null)

  const go = to => {
    setMenuOpen(false)
    navigate(to)
  }

  return (
    <div className="to-page">
      <TournamentSidebar
        tournamentName={tournament.name}
        activeId="overview"
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={go}
        onBack={() => go('/tournaments')}
      />

      <div className="to-main">
        {/* Below 1100px the sidebar becomes a drawer opened from this bar. */}
        <header className="to-topbar">
          <img src={logo} alt="" />
          <span>Tournament Management</span>
          <button type="button" aria-label="Menu" onClick={() => setMenuOpen(true)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </header>

        <div className="to-hero">
          <div className="to-hero-bar">
            <h1>Overview</h1>
            <GSButton buttonIcon={faGear} title="Settings & Preferences" type="transparent" isFocusable />
          </div>

          <h2 className="to-starts">{startsIn(tournament.startISO)}</h2>

          <div className="to-card">
            <div className="to-card-info">
              <div className="to-card-top">
                <div className="to-card-image">{image && <img src={image} alt="" />}</div>
                <GSButton type={status.buttonType} title={status.label} isPill hoverType="none" style={{ cursor: 'default' }} />
                <GSButton buttonIcon={faClone} type="transparent" size="secondary" isFocusable />
              </div>
              <div className="to-card-text">
                <div className="to-card-name">{tournament.name}</div>
                <div>{tournament.organization}</div>
              </div>
              <div className="to-card-text">
                <div>{tournament.dates}</div>
                <div>{tournament.course}</div>
              </div>
            </div>

            <div className="to-card-actions">
              <GSButton title="Add Players" type="status active" onClick={() => go('/teams')} isFocusable />
              <GSButton title="Message Players" type="black" onClick={() => go('/messaging')} isFocusable />
              <GSButton title="View Website" type="black" onClick={() => window.open('/event-site', '_blank')} isFocusable />
            </div>
          </div>
        </div>

        <div className="to-sections">
          {SECTIONS.map(section => (
            <div key={section.id}>
              <div className="to-section" onClick={() => section.to && go(section.to)}>
                <div>
                  <div className="to-section-title">{section.title}</div>
                  <div className="to-section-description">{section.description}</div>
                </div>
                <FontAwesomeIcon icon={section.external ? faSquareUpRight : faChevronRight} />
              </div>

              {section.id === 'rounds' && rounds.length > 0 && (
                <div className="to-rounds">
                  {rounds.map(round => (
                    <RoundCard key={round.number} round={round} onAction={action => action.to && go(action.to)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="to-chat" aria-label="Support chat">
          <FontAwesomeIcon icon={faMessage} />
        </button>
      </div>
    </div>
  )
}
