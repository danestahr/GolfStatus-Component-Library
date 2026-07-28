import React from "react";
import "./scorecard-hole-value.scss";
import GSItemList from "../gs-item-list";

export default function ScorecardHoleValue(props) {
  const pops = Array.apply({}, Array(props.handicapStrokes));
  const getPops = () => {
    if (props.handicapStrokes && !props.editable) {
      return (
        <div className="pops">
          {pops?.map?.(pop => 
             <div className="pop"></div>
          )}
        </div>
      );
    }
    return null;
  };
  return (
    <scorecard-hole-value class={props.type}>
      {getPops()}
      <div className="values">
        {props.values && (
          <GSItemList
            items={props.values}
            type="vertical"
            listItem={item => <abbr title={props.title}>{item}</abbr>}
          ></GSItemList>
        )}
      </div>
    </scorecard-hole-value>
  );
}
