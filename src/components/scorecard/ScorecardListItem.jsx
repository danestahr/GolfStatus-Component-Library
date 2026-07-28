import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faCircleCheck, faCircleDot, faUserXmark, faCircleExclamation, faArrowsRotate, faCircleInfo, faMobileScreen } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import './ScorecardListItem.scss'

const COMPLETE_STATUSES = ['complete', 'submitted', 'confirmed']

const STATUS_BADGE_TYPE = {
  'no-activity':     'disabled',
  'in-progress':     'cyan',
  'complete':        'green',
  'submitted':       'green',
  'confirmed':       'green',
  'not-generated':   'orange',
}

const STATUS_ICON = {
  'no-activity':     faUserXmark,
  'in-progress':     faMobileScreen,
  'complete':        faCircleCheck,
  'submitted':       faCircleCheck,
  'confirmed':       faCircleCheck,
  'not-generated':   faCircleExclamation,
}

function toPar(score, par = 72) {
  const d = score - par
  return d === 0 ? 'E' : d > 0 ? `+${d}` : `${d}`
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function Highlight({ text, query }) {
  if (!query || !text) return text ?? null
  const parts = String(text).split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="search-highlight">{part}</mark>
      : <span key={i}>{part}</span>
  )
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0][0] || '').toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function buildPlayerTiles(playersStr, totalScore) {
  if (!playersStr || totalScore == null) return []
  return playersStr.split(',').map((raw, i) => {
    const name      = raw.trim()
    const parts     = name.split(/\s+/)
    const firstName = parts[0] ?? ''
    const lastName  = parts.slice(1).join(' ')
    const score     = totalScore + i
    return { name, firstName, lastName, initials: getInitials(name), score, toPar: toPar(score) }
  })
}

function PlayerTile({ firstName, lastName, score, toPar, hasMissing, searchQuery }) {
  return (
    <div className={`player-tile${hasMissing ? ' has-missing' : ''}`}>
      <div className="player-tile-score">
        <span className="score-number">{score}</span>
        <span className="score-par">{toPar}</span>
      </div>
      <div className="player-tile-name">
        <Highlight text={`${firstName}${lastName ? ` ${lastName}` : ''}`} query={searchQuery} />
      </div>
    </div>
  )
}

function ScoreGroup({ label, score, toPar }) {
  return (
    <div className="score-group">
      <div className="score-label">{label}</div>
      <div className="score-value">
        <span className="score-number">{score}</span>
        <span className="score-par">{toPar}</span>
      </div>
    </div>
  )
}

export default function ScorecardListItem({ scorecard, onEdit, format = 'team-single', isFinalized = false, searchQuery = '' }) {
  const {
    teamName,
    playerCount,
    players,
    total,
    in: inScore,
    out,
    status,
    statusLabel,
    statusMessage,
    statusIcon,
    editStatus,
    holeScores,
  } = scorecard

  const hasInternalGap = holeScores?.some((s, i) => {
    if (s !== 0) return false
    const hasBefore = holeScores.slice(0, i).some(v => v !== 0)
    const hasAfter  = holeScores.slice(i + 1).some(v => v !== 0)
    return hasBefore && hasAfter
  })
  const submittedWithGap = COMPLETE_STATUSES.includes(status) && holeScores?.some(s => s === 0)
  const isMissingNotGen = status === 'not-generated'
  const finalizedHasZero = isFinalized && (holeScores ? holeScores.some(s => s === 0) : true)
  const hasIncompleteScores = hasInternalGap || submittedWithGap || finalizedHasZero

  const displayStatus = isFinalized && !isMissingNotGen ? 'complete' : status
  const pillType  = isFinalized ? (hasIncompleteScores ? 'orange' : 'green') : STATUS_BADGE_TYPE[status]
  const pillIcon  = isFinalized ? (hasIncompleteScores ? faCircleExclamation : faCircleCheck) : STATUS_ICON[status]
  const pillLabel = isFinalized ? (hasIncompleteScores ? 'Incomplete' : 'Complete') : statusLabel

  const isIndividual = format === 'individual'
  const showsPlayerTiles = format === 'team-multi' && status !== 'not-generated'
  const playerTiles = showsPlayerTiles ? buildPlayerTiles(players, total?.score) : []
  const primaryPlayer = players?.split(',')[0]?.trim() ?? ''
  const [primaryFirst, ...primaryRest] = primaryPlayer.split(/\s+/)
  const primaryLast = primaryRest.join(' ')
  const handicap = ((scorecard.id ?? 0) % 20) + 2
  const missingHoleIdx = hasIncompleteScores ? holeScores?.findIndex(s => s === 0) : -1
  const missingPlayerIdx = (missingHoleIdx ?? -1) >= 0 && playerCount > 0
    ? missingHoleIdx % playerCount
    : -1

  return (
    <div
      className={`scorecard-list-item format-${format} ${displayStatus}${hasIncompleteScores ? ' incomplete' : ''}`}
      data-scorecard-id={scorecard.id}
      onClick={() => onEdit?.(scorecard.id)}
    >
      <div className="card-body">
        <div className="status-bar" />
        <div className="card-content">
        <div className="team-header">
          <div className="team-details">
            {isIndividual ? (
              <div className="team-name">
                <span><Highlight text={`${primaryFirst}${primaryLast ? ` ${primaryLast}` : ''}`} query={searchQuery} /></span>
                <span className="handicap">({handicap})</span>
              </div>
            ) : (
              <>
                <div className="team-name">
                  <span><Highlight text={teamName} query={searchQuery} /></span>
                  <span className="player-count">({playerCount})</span>
                </div>
                <div className="player-names"><Highlight text={players} query={searchQuery} /></div>
              </>
            )}
          </div>
        </div>

      <div className="score-status-box">
        {status === 'not-generated' ? (
          <>
            <div className="scores-row">
              <span className="not-generated-message">This scorecard has not yet been generated.</span>
              <div className="score-actions">
                <GSButton
                  isPill
                  buttonIcon={pillIcon ?? faCircleExclamation}
                  title={pillLabel}
                  type={pillType}
                />
              </div>
            </div>

            <div className="status-footer">
              <GSButton
                buttonIcon={faArrowsRotate}
                title="Generate Scorecard"
                type="black"
                isFocusable
                onClick={() => {}}
              />
            </div>
          </>
        ) : (
          <>
            <div className="scores-row">
              <div className="score-groups">
                <ScoreGroup label="Total" score={total.score} toPar={total.toPar} />
                <div className="in-out-scores">
                  <div className="score-divider" />
                  <ScoreGroup label="In" score={inScore.score} toPar={inScore.toPar} />
                  <ScoreGroup label="Out" score={out.score} toPar={out.toPar} />
                </div>
              </div>
              <div className="score-actions">
                <GSButton
                  isPill
                  buttonIcon={pillIcon}
                  title={pillLabel}
                  type={pillType}
                />
              </div>
            </div>

            {hasIncompleteScores && (
              <div className="incomplete-disclaimer">
                <FontAwesomeIcon icon={faCircleInfo} />
                <span>Missing Scores</span>
              </div>
            )}

            <div className="status-footer">
              <span className="status-message">
                {statusIcon && <FontAwesomeIcon icon={statusIcon} />}
                {statusMessage}
              </span>
              {editStatus && <span className="edit-status">{editStatus}</span>}
            </div>
          </>
        )}
      </div>

      {playerTiles.length > 0 && (
        <div className="player-tiles">
          {playerTiles.map((t, i) => (
            <PlayerTile key={i} firstName={t.firstName} lastName={t.lastName} score={t.score} toPar={t.toPar} hasMissing={i === missingPlayerIdx} searchQuery={searchQuery} />
          ))}
        </div>
      )}
      </div>
      </div>

    </div>
  )
}
