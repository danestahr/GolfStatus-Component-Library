import React from "react";
import "./gs-radio-button.scss";
import { handleEnterKey } from "../helpers/Utilities";

/**
 * An individual radio button athat can be used in radio groups
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {function} onClick :function to select
 * 
 * @property {string} label :label for button
 * 
 * @property {object} style :style of the overall component
 * 
 * @property {object} selectedOption :option that is currently selected to check if it is this button
 * 
 * @property {object} value :value of option object for this button 
 *
 * @param {Properties} props onClick, label, style, selectedOption, value
 */


export default function GSRadioButton(props)
{
  const {onClick, label, style, selectedOption, value} = props

  const indicatorClass = selectedOption && selectedOption.value === value ? "button-indicator selected": "button-indicator";
  const keyPress = (e) => {
    handleEnterKey(e, (e) => {props?.onClick?.()})
  }
  return(
    
    <gs-radio-button onClick={onClick} style={style}>
      <div className="button" tabIndex={0} onKeyPress={keyPress}>
        <div className={indicatorClass}></div>
      </div>
      <div className="label">{label}</div>
    </gs-radio-button>
  )
}