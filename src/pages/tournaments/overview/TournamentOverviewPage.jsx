import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  faArrowRight, faBars, faBolt, faClone, faGear, faListCheck, faMessage, faPen,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSButton from '../../../gs-lib/components/gs-button'
import TournamentSidebar from './TournamentSidebar.jsx'
import ChecklistWidget from './ChecklistWidget.jsx'
import ChecklistPanel from './ChecklistPanel.jsx'
import EventSiteBanner from './EventSiteBanner.jsx'
import { getChecklist } from '../../../data/mockChecklist'
import { findTournament, statusMeta, TOURNAMENTS } from '../../../data/mockTournaments'
import { findCreatedTournament } from '../../../data/createdTournaments'
import { roundsFor } from '../../../data/mockTournamentRounds'
import logo from '../../../assets/GS_Logo.svg'
import eventHero from '../../../assets/event-hero.png'
import './TournamentOverviewPage.scss'

// Each section below the header is a row that leads to its own area of
// tournament management; Messages and Revenue Enhancements open elsewhere.
const SECTIONS = [
  { id: 'rounds', span: 4, title: 'Rounds & Scorecards', description: 'Manage hole assignments, scorecards, leaderboards, rules, tees, and more.', to: '/scheduler' },
  { id: 'event-site', span: 2, title: 'Event Site & Packages', description: 'Manage event website, tournament registration, packages, forms, event details, and more.', to: '/tournaments/:id/event-site-packages' },
  { id: 'players', span: 1, title: 'Players & Teams', description: 'Add and manage players & teams, unassigned players, and waitlists.', to: '/teams' },
  { id: 'sponsors', span: 1, title: 'Sponsors', description: 'Manage sponsors and mobile scorecard assignments.', to: '/sponsors' },
  { id: 'flights', span: 1, title: 'Flights', description: 'Add and manage tournament flights.' },
  { id: 'leaderboards', span: 1, title: 'Leaderboards & Skins', description: 'Manage tournament leaderboards & skins games.' },
  { id: 'documents', span: 2, title: 'Documents', description: 'Download tournament printouts, reports, and exports, and more.' },
  { id: 'orders', span: 2, title: 'Orders & Payouts', description: 'Manage registration orders, payouts, reporting documents, and more.', to: '/orders' },
  { id: 'messages', span: 1, title: 'Messages', description: 'Send emails and in-app notifications to players and teams.', to: '/messaging', external: true },
  { id: 'revenue', span: 1, title: 'Revenue Enhancements', description: 'Leverage exclusive packages and sponsorships to raise more money.', external: true },
  { id: 'settings', span: 1, title: 'Settings & Preferences', description: 'Manage tournament details, users and permissions, donations, invoices, and more.' },
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

  // Checklist items are held here so the widget and the slide-out stay in sync.
  const [items, setItems] = useState(() => getChecklist(tournament))
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    setItems(getChecklist(tournament))
    setPanelOpen(false)
  }, [tournament.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const go = to => {
    setMenuOpen(false)
    navigate(to.replace(':id', tournament.id))
  }

  return (
    <div className="to-page">
      <TournamentSidebar
        tournamentId={tournament.id}
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
          <div className="to-header">
            <div className="to-header-info">
              <div className="to-header-image">{image && <img src={image} alt="" />}</div>
              <div className="to-header-text">
                <div className="to-header-name">{tournament.name}</div>
                <div className="to-header-org">{tournament.organization}</div>
              </div>
              <GSButton type={status.buttonType} title={status.label} isPill hoverType="none" style={{ cursor: 'default' }} />
            </div>
            <div className="to-header-actions">
              <GSButton buttonIcon={faPen} type="black" isFocusable />
              <GSButton buttonIcon={faGear} type="black" isFocusable />
              <GSButton buttonIcon={faClone} type="black" isFocusable />
            </div>
          </div>

          <div className="to-bento">
            <EventSiteBanner
              tournament={tournament}
              onView={() => window.open('/event-site', '_blank')}
              onEdit={() => go(`/tournaments/${tournament.id}/event-site-packages`)}
            />
            <ChecklistWidget items={items} tournament={tournament} onOpen={() => setPanelOpen(true)} />
          </div>
        </div>

        {/* Bento grid: each area of management is a card with a header, a
            description and an action button, plus a body that can hold its own
            grid or flex content. `span` is its width in grid columns. */}
        <div className="to-sections">
          {SECTIONS.map(section => (
            <section key={section.id} className={`to-section to-section--span-${section.span}`}>
              <div className="to-section-header">
                <div className="to-section-text">
                  <div className="to-section-title">{section.title}</div>
                  <div className="to-section-description">{section.description}</div>
                </div>
                <GSButton
                  buttonIcon={faArrowRight}
                  type="light-grey"
                  onClick={() => section.to && go(section.to)}
                  isFocusable
                />
              </div>

              {section.id === 'rounds' && rounds.length > 0 && (
                <div className="to-section-body to-rounds">
                  {rounds.map(round => (
                    <RoundCard key={round.number} round={round} onAction={action => action.to && go(action.to)} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <ChecklistPanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          tournament={tournament}
          items={items}
          onItemsChange={setItems}
        />

        <button type="button" className="to-chat" aria-label="Support chat">
          <FontAwesomeIcon icon={faMessage} />
        </button>
      </div>
    </div>
  )
}
