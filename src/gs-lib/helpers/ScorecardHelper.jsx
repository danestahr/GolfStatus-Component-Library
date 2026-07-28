import ScorecardHoleValue from "../components/scorecard/scorecard-hole-value";
import React from "react";

export const getScoreStyle = hole => {
  const score = hole?.handicapStrokes ? hole?.score - hole?.handicapStrokes : hole?.score
  const toPar = score - hole.par;
  if (hole.position === "in" || hole.position === "out") {
    return "";
  }
  if (toPar < -1) {
    return "eagle";
  }
  if (toPar === -1) {
    return "birdie";
  }
  if (toPar === 1) {
    return "bogey";
  }
  if (toPar > 1) {
    return "double";
  }
  return "par";
};

export const getMappedGridHoles = props => {
  const {
    holes,
    startingHole,
    editable,
    showPoints,
    scorecardChanged,
    scorecardFocused,
    scorecardKeyUp,
    playerScores,
    showHeaders
  } = props;
  // Holes and par

  if (holes === undefined) {
    return;
  }

  let holesRow = holes.map((hole, index) => getHole(hole, startingHole, index));
  let rows = [...holesRow];

  if(holes[0]?.par !== undefined){
    let parRow = holes.map((hole, index) =>
    getPar({
      hole,
      editable,
      scorecardChanged,
      scorecardFocused,
      scorecardKeyUp,
      index
    })
  );

  const parHeader = {
    style: { gridColumn: `1 / span ${holes.length}` },
    view: <div className={`small-header ${showHeaders ? "show" : "hide"}`}> Par </div>
  };

  rows.push(parHeader)
  rows.push(...parRow)
  }

  

  if ((holes?.[0]?.handicap ?? 0) !== 0) {
    const handicapHeader = {
      style: { gridColumn: `1 / span ${holes.length}` },
      view: <div className={`small-header ${showHeaders ? "show" : "hide"}`}> Handicap </div>
    };
    rows.push(handicapHeader);
    let handicapRow = holes.map((hole, index) =>
      getHandicap({
        hole,
        editable,
        scorecardChanged,
        scorecardFocused,
        scorecardKeyUp,
        index
      })
    );
    rows.push(...handicapRow);
  }

  //scores for players on a single scorecard
  if (playerScores && playerScores?.length > 0) {
    let scoreRow = getPlayerScores(props);
    if (scoreRow.length > 0) {
      rows.push(...scoreRow);
      const totalHeader = {
        style: { gridColumn: `1 / span ${holes.length}` },
        view: <div className="header border-bottom"> Team </div>
      };
      rows.push(totalHeader);
    }
  }

  if (holes?.[0]?.score !== undefined) {
    const scoreHeader = {
      style: { gridColumn: `1 / span ${holes.length}` },
      view: <div className={`small-header par-header ${showHeaders ? "show" : "hide"}`}> Score </div>
    };
    if(!playerScores || playerScores?.length === 0){
      rows.push(scoreHeader);
    }
    
    let scoresRow = holes.map((hole, index) =>
      getScore({
        hole,
        editable,
        scorecardChanged,
        scorecardFocused,
        scorecardKeyUp,
        index
      })
    );
    rows.push(...scoresRow);
  }

  if (holes?.[0]?.yardage !== undefined) {
    const handicapHeader = {
      style: { gridColumn: `1 / span ${holes.length}` },
      view: <div className={`small-header par-header ${showHeaders ? "show" : "hide"}`}> Yardage </div>
    };
    rows.push(handicapHeader);
    let scoresRow = holes.map((hole, index) =>
      getYardage({
        hole,
        editable,
        scorecardChanged,
        scorecardFocused,
        scorecardKeyUp,
        index
      })
    );
    rows.push(...scoresRow);
  }

  if (showPoints) {
    const pointsHeader = {
      style: { gridColumn: `1 / span ${holes.length}` },
      view: <div className={`small-header par-header ${showHeaders ? "show" : "hide"}`}> Points </div>
    };
    rows.push(pointsHeader);
    let pointsRow = holes.map((hole, index) => getPoints(hole, index));
    rows.push(...pointsRow);
  }

  return rows;
};

export const getMatchPlayGridHoles = props => {
  const { holes, startingHole, match } = props;
  // Holes and par

  let holesRow = holes.map((hole, index) => getHole(hole, startingHole, index));
  let parRow = holes.map((hole, index) =>
    getPar({
      hole,
      index
    })
  );

  let rows = [...holesRow, ...parRow];

  //scores for players on a single scorecard
  if (match) {
    rows.push(...getMatchScores(props));
  }

  return rows;
};

export const getPlayerScores = props => {
  const {
    holes,
    editable,
    scorecardChanged,
    scorecardFocused,
    scorecardKeyUp,
    playerScores
  } = props;

  let rows = [];
  playerScores?.forEach?.((s, pi) => {
    let scoreRow = s?.scores?.map((hole, index) =>
      getScore({
        hole,
        editable,
        scorecardChanged,
        scorecardFocused,
        scorecardKeyUp,
        index,
        s
      })
    );

    let nameHeader = {
      style: { gridColumn: `1 / span ${holes.length}` },
      view: <div className="header border-bottom"> {s.name} </div>
    };

    if (scoreRow) {
      rows.push(nameHeader, ...scoreRow);
    }
  });

  return rows;
};

export const getMatchScores = props => {
  const {
    holes,
    startingHole,
    editable,
    scorecardChanged,
    scorecardFocused,
    scorecardKeyUp,
    playerScores,
    match
  } = props;

  let scorecardScores = [...match?.matchScores?.map?.(ms => ms?.roundScore)];
  let orderedScores = [
    ...scorecardScores?.[0]?.scores?.slice(startingHole - 1),
    ...scorecardScores?.[0]?.scores?.slice(0, startingHole - 1)
  ];
  let orderedScoresOpponent = [
    ...scorecardScores?.[1]?.scores?.slice(startingHole - 1),
    ...scorecardScores?.[1]?.scores?.slice(0, startingHole - 1)
  ];
  if (orderedScores?.length === orderedScoresOpponent?.length) {
    orderedScores = orderedScores.map(os => ({ ...os }));
    let result = 0;
    orderedScores.forEach((s, index) => {
      let pointsEarned = s.points - orderedScoresOpponent?.[index].points;
      result += pointsEarned;
      s.matchStatus = result;
      s.scorecardChanged = pointsEarned !== 0 || index === 0;
    });
  }

  let rows = [];
  playerScores?.forEach((s, index) => {
    let scoreRow = s.scores?.map((hole, index) =>
      getScore({
        hole,
        editable,
        scorecardChanged,
        scorecardFocused,
        scorecardKeyUp,
        index,
        s
      })
    );

    let pointsRow = s.scores?.map((hole, si) =>
      getMatchPoint(hole, index === 0 ? "team-1" : "team-2", si)
    );

    if (index == 0) {
      let statusRow = s.scores?.map((hole, si) =>
        getMatchStatus(hole, orderedScores, si)
      );

      let filteredRow = statusRow.filter(sr => sr.view);
      filteredRow.forEach(
        (col, index) =>
          {
            if(index === filteredRow.length - 1){
              col.style.gridColumn = `${col.style.gridColumn} / 10`
            }
            else{
              col.style.gridColumn = `${col.style.gridColumn} / ${filteredRow?.[
                index + 1
              ]?.index + 1}`
            }
            
          }
      );

      let nameHeader = {
        style: { gridColumn: `1 / span ${holes.length - 1}` },
        view: <div className="header border-left-team-1"> {s.name} </div>
      };
      rows.push(nameHeader);
      rows.push(...scoreRow);
      rows.push(...pointsRow);
      rows.push(...statusRow);
    }

    if (index == 1) {
      let nameHeader = {
        style: { gridColumn: `1 / span ${holes.length - 1}` },
        view: <div className="header border-left-team-2"> {s.name} </div>
      };
      rows.push(...pointsRow);
      rows.push(...scoreRow);
      rows.push(nameHeader);
    }
  });

  return rows;
};

export const getHole = (hole, startingHole, index) => {
  const holeVal = hole?.number ? hole?.number : hole?.position
  return {
    style: { gridColumn: `${index + 1}` },
    view: (
      <ScorecardHoleValue
        values={[holeVal]}
        title={`Hole ${holeVal}`}
        type={`${startingHole === hole.position ? "white" : hole?.total ? "" : "black"} bold`}
      ></ScorecardHoleValue>
    )
  };
};

export const getPar = props => {
  const {
    hole,
    editable,
    scorecardChanged,
    scorecardFocused,
    scorecardKeyUp,
    index
  } = props;
  const isEditable = editable?.includes?.("par") && !hole?.total;
  return {
    index: index,
    style: { gridColumn: `${index + 1}` },
    view: (
      <ScorecardHoleValue
        values={
          isEditable
            ? [
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id={`${hole?.id ?? index}`}
                  value={hole?.par}
                  onChange={e => {
                    scorecardChanged?.(e, props, "par");
                  }}
                  onFocus={e => {
                    scorecardFocused?.(e, props, "par");
                  }}
                  onKeyUp={e => {
                    scorecardKeyUp?.(e, props, "par");
                  }}
                />
              ]
            : [ hole?.par]
        }
        editable={isEditable}
        title={`Hole ${hole?.position} Par: ${hole?.par}`}
        type={isEditable ? "outline" : hole?.total ? 'total' : `light-grey`}
      ></ScorecardHoleValue>
    )
  };
};

export const getScore = props => {
  const {
    hole,
    editable,
    scorecardChanged,
    scorecardFocused,
    scorecardKeyUp,
    index
  } = props;
  const isEditable = editable?.includes?.("score") && !hole?.total;
  return {
    index: index,
    style: { gridColumn: `${index + 1}` },
    view: (
      <ScorecardHoleValue
        values={[
          isEditable ? (
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              id={`${hole?.id ?? index}`}
              value={hole.score}
              onChange={e => {
                scorecardChanged?.(e, props, "score");
              }}
              onFocus={e => {
                scorecardFocused?.(e, props, "score");
              }}
              onKeyUp={e => {
                scorecardKeyUp?.(e, props, "score");
              }}
            />
          ) : (
            hole?.handicapStrokes ? hole?.score - hole?.handicapStrokes : hole?.score
          )
        ]}
        {...hole}
        editable={isEditable}
        title={`Hole ${hole.position} Score: ${hole.score}`}
        type={isEditable ? "outline" : `score ${getScoreStyle(hole)}`}
      ></ScorecardHoleValue>
    )
  };
};

export const getYardage = props => {
  const {
    hole,
    editable,
    scorecardChanged,
    scorecardFocused,
    scorecardKeyUp,
    index
  } = props;
  const isEditable = editable?.includes?.("yardage") && !hole?.total;
  return {
    index: index,
    style: { gridColumn: `${index + 1}` },
    view: (
      <ScorecardHoleValue
        values={[
          isEditable ? (
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              id={`${hole?.id ?? index}`}
              value={hole.yardage}
              onChange={e => {
                scorecardChanged?.(e, props, "yardage");
              }}
              onFocus={e => {
                scorecardFocused?.(e, props, "yardage");
              }}
              onKeyUp={e => {
                scorecardKeyUp?.(e, props, "yardage");
              }}
            />
          ) : (
            `${hole.yardage}`
          )
        ]}
        editable={isEditable}
        title={`Hole ${hole.position} Yardage: ${hole.yardage}`}
        type={isEditable ? "outline" : `yardage ${hole?.total ? "" : "light-grey"}`}
      ></ScorecardHoleValue>
    )
  };
};

export const getHandicap = props => {
  const {
    hole,
    editable,
    scorecardChanged,
    scorecardFocused,
    scorecardKeyUp,
    index
  } = props;
  const isEditable = editable?.includes?.("handicap") && !hole?.total;
  return {
    index: index,
    style: { gridColumn: `${index + 1}` },
    view: (
      <ScorecardHoleValue
        values={[
          isEditable ? (
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              id={`${hole?.id ?? index}`}
              value={hole.handicap}
              onChange={e => {
                scorecardChanged?.(e, props, "handicap");
              }}
              onFocus={e => {
                scorecardFocused?.(e, props, "handicap");
              }}
              onKeyUp={e => {
                scorecardKeyUp?.(e, props, "handicap");
              }}
            />
          ) : (
            `${hole.handicap}`
          )
        ]}
        editable={isEditable}
        title={`Hole ${hole.position} Handicap: ${hole.handicap}`}
        type={isEditable ? "outline" : `handicap ${hole?.total ? "" : "light-grey"}`}
      ></ScorecardHoleValue>
    )
  };
};

export const getPoints = (hole, index) => {
  return {
    style: { gridColumn: `${index + 1}` },
    view: (
      <ScorecardHoleValue
        values={[`${hole.points}`]}
        title={`Points Earned`}
        type={hole?.total ? "" : "light-grey"}
      ></ScorecardHoleValue>
    )
  };
};

export const getMatchPoint = (hole, color, index) => {
  return {
    style: { gridColumn: `${index + 1}` },
    view: (
      <ScorecardHoleValue
        values={[``]}
        title={`Points Earned`}
        type={hole.points === 1 ? color : hole?.total ? "" : "light-grey"}
      ></ScorecardHoleValue>
    )
  };
};

export const getMatchStatus = (hole, orderedScores, index) => {
  let match = orderedScores?.find(s => s.position === hole.position);
  let matchStatus = match?.matchStatus;
  let scorecardChanged = match?.scorecardChanged;
  if (scorecardChanged || index === 0) {
    return {
      index: index,
      style: { gridColumn: `${index + 1}` },
      view: (
        <ScorecardHoleValue
          values={[matchStatus !== 0 ? `${Math.abs(matchStatus)}up` : "AS"]}
          type={
            matchStatus > 0
              ? "team-1-border"
              : matchStatus < 0
              ? "team-2-border"
              : "light-grey"
          }
        ></ScorecardHoleValue>
      )
    };
  }
  return {};
};

export const getFrontNine = userRound => {
  return userRound && userRound.scores ? userRound.scores.slice(0, 9) : [];
};

export const getBackNine = userRound => {
  return userRound && userRound.scores && userRound.scores.length > 9
    ? userRound.scores.slice(9)
    : [];
};

export function getScorecardFrontNine(holes, addTotal, showPoints) {
  let nine = holes?.length && holes?.length > 0 ? holes?.slice(0, 9) : [];
  if (nine.length > 0 && addTotal) {
    nine = addTotals(nine, showPoints, "out");
  }
  return nine;
}

export function addTotals(scores, showPoints, title) {
  const totals = totalScores(scores, showPoints);
  return [...scores, { position: title, ...totals }];
}

export function getScorecardBackNine(holes, addTotal, showPoints) {
  let nine = holes?.length && holes?.length > 9 ? holes.slice(9) : [];
  if (nine.length > 0 && addTotal) {
    nine = addTotals(nine, showPoints, "in");
  }
  return nine;
}

export function getFrontTee(facilityCourseTee) {
  if (facilityCourseTee) {
    return {
      name: "Front",
      active: true,
      par: facilityCourseTee.frontPar,
      yards: facilityCourseTee.frontLength,
      slope: facilityCourseTee.frontSlope,
      rating: facilityCourseTee.frontRating
    };
  }
  return {};
}

export function getBackTee(facilityCourseTee) {
  if (facilityCourseTee) {
    return {
      name: "Back",
      active: true,
      par: facilityCourseTee.backPar,
      yards: facilityCourseTee.backLength,
      slope: facilityCourseTee.backSlope,
      rating: facilityCourseTee.backRating
    };
  }
  return {};
}

export function getTotalTee(facilityCourseTee) {
  if (facilityCourseTee) {
    return {
      name: "Total",
      active: true,
      par: facilityCourseTee.par,
      yards: facilityCourseTee.yards,
      slope: facilityCourseTee.backSlope,
      rating: facilityCourseTee.rating
    };
  }
  return {};
}

export function totalScores(scores, showPoints) {
  const score = scores
    ? scores.reduce((total, score) => (total += score.score - (score?.handicapStrokes ?? 0)), 0)
    : "0";
    const yardage = scores
    ? scores.reduce((total, score) => (total += score.yardage), 0)
    : "0";
  const par = scores
    ? scores.reduce((total, score) => (total += score.par), 0)
    : "0";
  const toPar = score !== 0 ? score - par : "E";
  const toParDisplay = toPar > 0 ? `+${toPar}` : toPar === 0 ? "E" : toPar;
  const toParClass = toPar > 0 ? `over` : toPar === 0 ? "" : "under";
  const points =
    showPoints && scores?.[0]?.points !== undefined
      ? scores
        ? scores.reduce((total, score) => (total += score.points), 0)
        : "0"
      : undefined;
  return { score, par, toPar, toParDisplay, toParClass, points, yardage , handicap: "", total: true };
}

export function getTotalYards(teeHoles) {
  const holes = [...teeHoles];
  let yardage = { front: 0, back: 0, total: 0 };

  if (holes.length >= 9) {
    yardage.front = holes
      .slice(0, 9)
      .filter(h => h.yardage)
      .reduce((yds, hole) => yds + parseInt(hole.yardage), 0);
  }

  if (holes.length === 18) {
    yardage.back = holes
      .slice(9)
      .filter(h => h.yardage)
      .reduce((yds, hole) => yds + parseInt(hole.yardage), 0);
  }

  yardage.total = yardage.front + yardage.back;

  return yardage;
}

export function getTotalPar(holes) {
  let par = { front: 0, back: 0, total: 0 };

  if (holes.length >= 9) {
    par.front = holes
      .slice(0, 9)
      .filter(h => h.par)
      .reduce((p, hole) => p + parseInt(hole.par), 0);
  }

  if (holes.length === 18) {
    par.back = holes
      .slice(9)
      .filter(h => h.par)
      .reduce((p, hole) => p + parseInt(hole.par), 0);
  }

  par.total = par.front + par.back;

  return par;
}

export const scorecardHelpers = {
  getScoreStyle,
  getScorecardBackNine,
  getScorecardFrontNine,
  getBackNine,
  getFrontNine,
  getFrontTee,
  getBackTee,
  getTotalTee,
  getTotalPar,
  getTotalYards,
  totalScores
};
