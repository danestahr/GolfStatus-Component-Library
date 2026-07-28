import React from "react";
import './gs-info-card.scss';

/**
 * Card that contains given jsx.
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {JSX.Element} layout :the html string to display
 * 
 * @property {string} size :the size of the card [large, medium, small]
 * 
 * @property {boolean} selectable :allow card to be clicked
 * 
 * @property {object} style :the style for this component
 *
 * @param {Properties} props :layout, size, selectable, style
 */

const GSInfoCard = (props) => {
  const {layout, size, selectable, style} = props
  return (
    <gs-info-card class={`${size} ${selectable? 'selectable' : ''}`} style={style}>
      <div className={`layout ${size}`}>
      {layout}
      {props.children}
      </div>
    </gs-info-card>
  )
}

export default GSInfoCard