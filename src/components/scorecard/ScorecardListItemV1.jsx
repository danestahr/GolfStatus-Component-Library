import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleDot, faUserXmark, faCircleExclamation, faArrowsRotate, faCircleInfo, faPen } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import './ScorecardListItemV1.scss'

const STATUS_BADGE_TYPE = {
  'no-activity':   'disabled',
  'in-progress':   'cyan',
  'complete':      'green',
  'submitted':     'green',
  'confirmed':     'green',
  'not-generated': 'orange',
}

const STATUS_ICON = {
  'no-activity':   faUserXmark,
  'in-progress':   faCircleDot,
  'complete':      faCircleCheck,
  'submitted':     faCircleCheck,
  'confirmed':     faCircleCheck,
  'not-generated': faCircleExclamation,
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

export default function ScorecardListItemV1({ scorecard, onEdit }) {
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

  const hasIncompleteScores = holeScores?.some(s => s === 0)

  return (
    <div className={`scorecard-list-item-v1 ${status}`}>
      <div className="team-details">
        <div className="team-name">
          <span>{teamName}</span>
          <span className="player-count">({playerCount})</span>
        </div>
        <div className="player-names">{players}</div>
      </div>

      <div className="score-status-box">
        {status === 'not-generated' ? (
          <>
            <div className="scores-row">
              <span className="not-generated-message">This scorecard has not yet been generated.</span>
              <div className="score-actions">
                <GSButton
                  isPill
                  buttonIcon={faCircleExclamation}
                  title={statusLabel}
                  type={STATUS_BADGE_TYPE[status]}
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
                  buttonIcon={STATUS_ICON[status]}
                  title={statusLabel}
                  type={STATUS_BADGE_TYPE[status]}
                />
                <GSButton
                  buttonIcon={faPen}
                  isFocusable
                  onClick={() => onEdit?.(scorecard.id)}
                />
              </div>
            </div>

            {hasIncompleteScores && (
              <div className="incomplete-disclaimer">
                <FontAwesomeIcon icon={faCircleInfo} />
                <span>Incomplete Scorecard</span>
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
    </div>
  )
}
