import React from "react";
import './score-total.scss';
import { totalScores } from "../../helpers/ScorecardHelper";

export default function ScoreTotal(props) {
  const { scores } = props
  const { score, toParClass, toParDisplay } = totalScores(scores)
  return (
    <score-total>
      <div className="score-overview">
        <div className="score">{score}</div>
        <div className={`to-par + ${toParClass}`}>{toParDisplay}</div>
      </div>
    </score-total>

  )
}