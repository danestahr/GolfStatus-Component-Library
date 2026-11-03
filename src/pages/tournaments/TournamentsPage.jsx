import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { faPlus, faClone } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import FullListPage, { FullListRow, FullListRowText } from '../../components/full-list/FullListPage.jsx'
import { TOURNAMENTS, TOURNAMENT_STATUSES, statusMeta } from '../../data/mockTournaments'
import { getCreatedTournaments } from '../../data/createdTournaments'
import QuickStartPanel from './quick-start/QuickStartPanel.jsx'
import { QUICK_START_PROSPECTS, scenarioFromPath } from '../../data/mockQuickStart'
import eventHero from '../../assets/event-hero.png'

function TournamentRow({ tournament, onOpen }) {
  const status = statusMeta(tournament.status)
  // Completed tournaments count teams, everything else counts players.
  const secondCount = tournament.teams != null ? `${tournament.teams} Teams` : `${tournament.players} Players`

  return (
    <FullListRow
      onClick={onOpen}
      image={tournament.hasBanner && <img src={tournament.image ?? eventHero} alt="" />}
      info={
        <>
          <FullListRowText title={tournament.name} lines={[tournament.organization]} />
          <FullListRowText lines={[tournament.dates, tournament.course]} />
          <GSButton type={status.buttonType} title={status.label} isPill hoverType="none" style={{ cursor: 'default' }} />
        </>
      }
      counts={
        <>
          <div>{tournament.rounds} Rounds</div>
          <div>{secondCount}</div>
        </>
      }
      action={<GSButton buttonIcon={faClone} type="light-grey" onClick={e => e?.stopPropagation?.()} isFocusable />}
    />
  )
}

export default function TournamentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState([])
  const navigate = useNavigate()
  // Quick Start lives at /tournaments/quick-start, over this same list (the list stays
  // mounted behind the slide-out); /tournaments is the list on its own.
  const { pathname } = useLocation()
  const quickStartOpen = pathname.startsWith('/tournaments/quick-start')
  // Which prospect it opens for comes from the URL (see data/mockQuickStart.js).
  const prospect = QUICK_START_PROSPECTS[scenarioFromPath(pathname)]

  const query = search.trim().toLowerCase()
  const visible = [...getCreatedTournaments(), ...TOURNAMENTS].filter(t =>
    (!query || `${t.name} ${t.organization} ${t.course}`.toLowerCase().includes(query)) &&
    (statusFilter.length === 0 || statusFilter.includes(t.status))
  )

  return (
    <>
    <FullListPage
      header="My Tournaments"
      pageActions={[
        { buttonTitle: 'Create Tournament', actionIcon: faPlus, type: 'black', actionClick: () => navigate('/tournaments/quick-start') },
      ]}
      searchPlaceholder="Search by Tournament Name"
      search={search}
      onSearchChange={setSearch}
      filterTitle="Status"
      filterOptions={TOURNAMENT_STATUSES}
      activeFilters={statusFilter}
      onActiveFiltersChange={setStatusFilter}
      isEmpty={visible.length === 0}
      emptyMessage="No tournaments match your search."
    >
      {visible.map(t => <TournamentRow key={t.id} tournament={t} onOpen={() => navigate(`/tournaments/${t.id}`)} />)}
    </FullListPage>
    <QuickStartPanel isOpen={quickStartOpen} onClose={() => navigate('/tournaments')} prospect={prospect} />
    </>
  )
}
