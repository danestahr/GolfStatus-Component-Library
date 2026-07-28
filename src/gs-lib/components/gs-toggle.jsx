import React, { Component } from "react";
import "./gs-toggle.scss";
import { handleEnterKey } from "../helpers/Utilities";


/**
 * A toggle component 
 * 
 * @typedef Properties
 * 
 * @type {object}
 * 
 * @property {JSX.Element} label label on top of the toggle
 * 
 * @property {boolean} value value of the toggle
 * 
 * @property {function} onClick  function to run when toggle is clicked
 * 
 * @property {string} trueDescription description to show when toggle is on (true)
 * 
 * @property {string} falseDescription description to show when toggle is off (false)
 * 
 * @property {Boolean} disabled disable toggle
 * 
 * @property {boolean} rowReverse reverse the layout so the label is left of the toggl
 * 
 * @property {object} style styling fo rthe component

 * 
 * @param {Properties} props label,
      value,
      onClick,
      trueDescription,
      falseDescription,
      disabled,
      rowReverse,
      style
 */

export default class GStoggle extends Component {
  constructor(props) {
    super(props);
    this.state = { value: false };
  }
  keyPressed = e => {
    handleEnterKey(e, () => {this.props.onClick?.()})
  };
  render() {
    const {
      label,
      value,
      onClick,
      trueDescription,
      falseDescription,
      disabled,
      rowReverse,
      style,
      descriptionStyle
    } = this.props;
    return (
      <gs-toggle
        tabindex={0}
        onClick={disabled ? null : onClick}
        onKeyPress={e => {
          if(!disabled) {
            this.keyPressed(e);
          }
        }}
        style={style}
        onBlur={() => {this.props?.inputTouched?.()}}
      >
        {label && <div className=" toggle-label">{label}</div>}
        <div className={`toggle-action ${disabled ? "disabled" : ""} ${rowReverse ? "rowReverse" : ""}` }>
          <div className={`toggle-container ${value}`}>
            <div className={`toggle-track ${value}`}>
              <div className="toggle-indicator"></div>
            </div>
          </div>
          <div className="toggle-detail">
            <div className="toggle-value" style={descriptionStyle}>
              {value ? trueDescription : falseDescription}
            </div>
          </div>
        </div>
      </gs-toggle>
    );
  }
}
