import React from "react";
import "./gs-split-view.scss";

/**
 * View to display a split panel that will stack vertically on mobile and will be divided in the middle.
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {JSX.Element} left the jsx for the left view
 * 
 * @property {JSX.Element} left the jsx for the right view
 * 
 * @property {object} style the style for this component
 * 
 * @property {object} dividerStyle the style for this component
 *
 * @param {Properties} props left, right, style, dividerStyle
 */

const GSSplitView = (props) => {
  const { left, right, style, dividerStyle } = props;
  return (
    <gs-split-view style={style}>
      <div className="split-view-content">
        {left && <div className="split-view-left">{left}</div>}
        {left && right && <div className="divider" style={dividerStyle} />}
        {right && <div className="split-view-right">{right}</div>}
      </div>
    </gs-split-view>
  );
};

export default GSSplitView;
