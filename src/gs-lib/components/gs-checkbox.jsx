import React from "react";
import "./gs-checkbox.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { handleEnterKey } from "../helpers/Utilities";

/**
 * A single checkbox that can be used standalone or in a list
 *
 * @typedef Properties
 * @type {object}
 *
 * @property {function} onClick :function to toggle checked state
 *
 * @property {string} label :label for the checkbox
 *
 * @property {object} style :style of the overall component
 *
 * @property {boolean} checked :whether the checkbox is checked
 *
 * @param {Properties} props onClick, label, style, checked
 */

export default function GSCheckbox(props)
{
  const {onClick, label, style, checked} = props

  const boxClass = checked ? "box checked" : "box";
  const keyPress = (e) => {
    handleEnterKey(e, (e) => {props?.onClick?.()})
  }
  return(
    <gs-checkbox onClick={onClick} style={style}>
      <div className={boxClass} tabIndex={0} onKeyPress={keyPress}>
        {checked && <FontAwesomeIcon icon={faCheck} className="box-icon" />}
      </div>
      {label && <div className="label">{label}</div>}
    </gs-checkbox>
  )
}
