import { useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { faEye } from '@fortawesome/free-solid-svg-icons'

import AppSidePanel from '../../components/AppSidePanel'
import GStoggle from '../../gs-lib/components/gs-toggle'
import GSScorecard from '../../gs-lib/components/scorecard/gs-scorecard'
import { mockHoleAssignments, saveScorecard } from '../../data/mockScorecards'
import './ScorecardDetailPage.scss'

const COURSE_PARS = [4,4,3,5,4,5,3,4,4, 4,4,3,5,4,5,3,4,4]
const PAR_TOTAL   = COURSE_PARS.reduce((a, b) => a + b, 0)

function toParStr(score, par) {
  const d = score - par
  return d === 0 ? 'E' : d > 0 ? `+${d}` : `${d}`
}

function initHoles(scorecard) {
  return COURSE_PARS.map((par, i) => ({
    position: i + 1,
    number:   i + 1,
    par,
    score: scorecard?.holeScores?.[i] ?? par,
  }))
}

export default function ScorecardDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const fromStat        = location.state?.fromStat ?? null
  const isFinalized     = location.state?.isFinalized ?? false
  const liveScoringEnded = location.state?.liveScoringEnded ?? false

  const scorecardId = parseInt(id)
  const holeGroup = mockHoleAssignments.find(g =>
    g.scorecards.some(s => s.id === scorecardId)
  )
  const scorecards = holeGroup?.scorecards.filter(s => s.id === scorecardId) ?? []

  const [allHoles, setAllHoles] = useState(() => {
    const state = {}
    scorecards.forEach(sc => { state[sc.id] = initHoles(sc) })
    return state
  })

  const [overrideTotals, setOverrideTotals] = useState(() => {
    const state = {}
    scorecards.forEach(sc => { state[sc.id] = false })
    return state
  })

  const handleScoreChange = (scorecardId) => (e, holeProps) => {
    const newVal = parseInt(e.target.value) || 0
    const pos    = holeProps.hole.position
    setAllHoles(prev => ({
      ...prev,
      [scorecardId]: prev[scorecardId].map(h =>
        h.position === pos ? { ...h, score: newVal } : h
      ),
    }))
  }

  const goBack = () => navigate('/scorecards', {
    state: { fromScorecardId: scorecardId, fromStat, isFinalized, liveScoringEnded },
  })

  const handleSave = () => {
    scorecards.forEach(sc => {
      saveScorecard(sc.id, allHoles[sc.id].map(h => h.score))
    })
    goBack()
  }

  if (!holeGroup) {
    return <div className="light scorecard-detail-page"><p>Scorecard not found.</p></div>
  }

  return (
    <div className="scorecard-detail-page">
      <AppSidePanel
        isOpen
        onClose={goBack}
        title={`Hole ${holeGroup.hole} — ${holeGroup.startTime}`}
        rightIcon={faEye}
        onRightAction={() => {}}
        actions={[
          { name: 'Save', type: 'black', action: handleSave },
          { name: 'Cancel', type: 'black-border', action: goBack },
        ]}
      >
        <div className="detail-content">
          {scorecards.map(sc => {
            const holes      = allHoles[sc.id] ?? []
            const totalScore = holes.reduce((s, h) => s + h.score, 0)
            const firstName  = sc.players?.split(',')?.[0]?.trim() ?? 'Player'

            return (
              <div key={sc.id} className="team-section">
                <div className="team-row">
                  <span className="team-name">{sc.teamName}</span>
                  <div className="override-total">
                    <span className="toggle-label">Override Total</span>
                    <GStoggle
                      value={overrideTotals[sc.id]}
                      onClick={() => setOverrideTotals(prev => ({
                        ...prev,
                        [sc.id]: !prev[sc.id],
                      }))}
                    />
                  </div>
                </div>

                <div className="player-row">
                  <span className="player-name">{firstName}</span>
                  <span className="player-score">
                    {totalScore} {toParStr(totalScore, PAR_TOTAL)}
                  </span>
                </div>

                <div className="scorecard-wrap">
                  <GSScorecard
                    holes={holes}
                    showTotalColumn
                    editable="score"
                    startingHole={1}
                    scorecardChanged={handleScoreChange(sc.id)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </AppSidePanel>
    </div>
  )
}
