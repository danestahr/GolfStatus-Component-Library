import React from "react";

import "./gs-progress-bar.scss";


/**
 * A Linear progress bar that can be style as neccessary 
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {number} value :value of the current progress
 * 
 * @property {number} max :max value to reach 100%
 * 
 * @property {object} style :style of the overall component
 * 
 * @property {object} trackStyle :style for the progress track
 * 
 * @property {object} progressBarStyle :style for the bar inside the track
 *
 *
 * @param {Properties} props value, max, style, trackStyle, progressBarStyle
 */

const GSProgressBar = props => {
  const { value, max, style, trackStyle, progressBarStyle } = props;
  const percentage = (value / max) * 100;
  const barStyle = { ...trackStyle, width: `${percentage}%` };
  return (
    <gs-progress-bar style={style}>
      <div className="percentage-bar" style={barStyle}></div>
      <div className="percentage-value" style={progressBarStyle}>
        {`${Math.round(percentage)}%`}
      </div>
    </gs-progress-bar>
  );
};

export default GSProgressBar;
