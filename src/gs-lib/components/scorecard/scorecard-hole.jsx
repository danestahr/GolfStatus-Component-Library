import React from 'react';
import './scorecard-hole.scss';
import GSItemList from '../gs-item-list';

export default function ScorecardHole(props)
{
  return(
    <scorecard-hole>
      <GSItemList items={props.hole} listItem={(item) => (item.view)} type="vertical"></GSItemList>
    </scorecard-hole>
  )
}