import React from "react";
import "./gs-scorecard.scss";

import GSItemList from "../gs-item-list";
import GSInfoGroup from "../gs-info-group";
import GSCircleImage from "../gs-circle-image";

import {
  getScorecardBackNine,
  getScorecardFrontNine,
  getMappedGridHoles,
  getMatchPlayGridHoles
} from "../../helpers/ScorecardHelper.jsx";

export default function GSScorecard(props) {
  const {
    user,
    holes,
    totalScore,
    splitNines,
    editable,
    showPoints,
    scorecardChanged,
    scorecardFocused,
    scorecardKeyUp,
    startingHole,
    playerScores,
    match,
    showTotalColumn,
    style,
    nineStyle
  } = props;

  const getUserInforGroup = () => {
    let userGroup = [
      {
        fit: "stretch",
        sections: [
          {
            title: "user-info",
            sectionItems: [{ type: "primary", value: user?.name }]
          }
        ]
      },
      { title: totalScore }
    ];

    if (user?.avatar) {
      userGroup.unshift({
        title: <GSCircleImage size="large" url={user?.avatar}></GSCircleImage>
      });
    }

    return userGroup;
  };
  const getScorecardLayout = (holes, extraScores, showHeaders) => {
    let holeViews = [];
    let props = {
      holes,
      startingHole,
      editable,
      showPoints,
      scorecardChanged,
      scorecardFocused,
      scorecardKeyUp,
      playerScores: extraScores,
      match,
      showHeaders
    };

    if (match) {
      holeViews = getMatchPlayGridHoles(props)?.filter?.(hole => hole.view);
    } else {
      holeViews = getMappedGridHoles(props)?.filter?.(hole => hole.view);
    }

    return (
      <GSItemList
        style={nineStyle}
        items={holeViews}
        listItem={item => item?.view}
        type="inline-grid item-flex-center"
        gridColumns={holes?.length}
      ></GSItemList>
    );
  };

  const getScorecard = () => {
    let scorecardScores = playerScores ? [...playerScores] : [];
    if (match) {
      scorecardScores = [...match?.matchScores?.map?.(ms => ms?.roundScore)];
    }
    const front = getFrontNineScorecardLayout(scorecardScores);
    const back = getBackNineScorecardLayout(scorecardScores);
    return (
      <div className={`scorecard ${splitNines ? "split" : ""}`}>
        {front}
        {back && back}
      </div>
    );
  };

  const getFrontNineScorecardLayout = extraScores => {
    const frontNineScores = getScorecardFrontNine(
      holes,
      showTotalColumn,
      showPoints
    );

    const frontNineTeamScores = extraScores?.map?.(s => ({
      ...s,
      scores: getScorecardFrontNine(s.scores, showTotalColumn, showPoints)
    }));

    const frontNineLayout = getScorecardLayout(
      frontNineScores,
      frontNineTeamScores,
      true
    );

    return frontNineLayout;
  };

  const getBackNineScorecardLayout = extraScores => {
    if (holes?.length > 9) {
      const backNineScores = getScorecardBackNine(
        holes,
        showTotalColumn,
        showPoints
      );

      const backNineTeamScores = extraScores?.map?.(s => ({
        ...s,
        scores: getScorecardBackNine(s.scores, showTotalColumn, showPoints)
      }));

      const backNineLayout = getScorecardLayout(
        backNineScores,
        backNineTeamScores,
        splitNines
      );

      return backNineLayout;
    }
  };

  return (
    <gs-scorecard style={style}>
      {props.user && (
        <GSInfoGroup dataGroups={getUserInforGroup()}></GSInfoGroup>
      )}
      {getScorecard()}
    </gs-scorecard>
  );
}
