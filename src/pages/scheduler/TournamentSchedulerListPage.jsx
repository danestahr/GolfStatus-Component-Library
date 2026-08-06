import { useNavigate } from 'react-router-dom'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import { TOURNAMENTS } from '../../data/mockSchedulerTournaments'
import './TournamentSchedulerPage.scss'

export default function TournamentSchedulerListPage() {
  const navigate = useNavigate()

  return (
    <div className="sched-page-bg">
      <GSActionBar type="x-large-pad H3" header="Hole Assignments" />

      <div className="sched-tourney-list">
        {TOURNAMENTS.filter(tournament => !tournament.hidden).map(tournament => {
          const roundNumbers = Object.keys(tournament.rounds).map(Number).sort((a, b) => a - b)
          const firstRound = tournament.rounds[roundNumbers[0]]
          return (
            <div
              key={tournament.id}
              className="sched-tourney-card"
              onClick={() => navigate(`/scheduler/${tournament.id}`)}
            >
              <div className="sched-tourney-card-main">
                <div className="sched-tourney-card-name">{tournament.name}</div>
                <div className="sched-tourney-card-sub">{firstRound ? firstRound.facilityName : tournament.courseName}</div>
                <div className="sched-tourney-card-sub">{firstRound ? firstRound.dateTime : 'No rounds scheduled yet'}</div>
              </div>
              <div className="sched-tourney-card-side">
                <div className="sched-tourney-card-rounds">
                  {roundNumbers.length} {roundNumbers.length === 1 ? 'Round' : 'Rounds'}
                </div>
                {firstRound && <div className="sched-tourney-card-holes">{firstRound.holes} Holes</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
