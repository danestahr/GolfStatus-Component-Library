import React from "react";
import { grey100, grey700 } from "../helpers/Theme";


/**
 * View to display a section of a page with a bottom divider
 * 
 * @typedef Action
 * @type {object}
 *
 * @typedef Properties
 * @type {object}
 * 
 * @property {object} style the jsx for the title
 * 
 * @property {string} thickness the jsx for the description
 * 
 * @property {string} color the jsx for the body
 * 
 *
 * @param {Properties} props style, thickness, color
 */

const GSDivider = (props) => {

  const {style, thickness, mode, color} = props

  const themeColor = (mode ?? "light") === "light" ? grey100 : grey700

  const defaultStyle = {height: "1px", backgroundColor: themeColor, minWidth: "1px"}

  return <gs-divider style={{...defaultStyle, ...style}} />

}

export default GSDivider