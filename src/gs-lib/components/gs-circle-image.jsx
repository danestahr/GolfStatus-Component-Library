import React from 'react'
import './gs-circle-image.scss'

/**
 * View to display a circular image.
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {object} style the style for this component
 * 
 * @property {string} size the circle size [small, medium, large, x-large, xx-large]
 * 
 * @property {string} url the url of the image
 *
 * @param {Properties} props style, size, url
 */

export default function GSCircleImage(props) {
  const {style, size, url} = props
  return (
    <gs-circle-image style={style}>
      <div className={`avatar ${props.size? props.size: "medium"}`}>
        <img alt="" src={props.url}></img>
      </div>
    </gs-circle-image>
  )
}