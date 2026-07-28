import React from "react";
import './gs-image.scss';

/**
 * A component displays an image with defined borders and sizes
 * 
 * @typedef Properties
 * @type {object}
 * 
 * 
 * @property {string} alt :alt source of the image
 * 
 * @property {string} src :source url for the image
 * 
 * @property {string} size :defines the size of the image [small, medium, large, x-large-xx-large]
 * 
 * @property {string} ratio :ratio of the image [square, wide, ultra-wide, natural]
 * 
 * @property {JSX.Element} noImageView :view when there is no image
 * 
 * @property {function} onClick :height of cropped image
 * 
 * @property {object} style :style object for component styling
 *
 * @param {Properties} props :alt, src, size, ratio, noImageView, style, onClick
 */

const GSImage = (props) => {
  const {alt, src, size, ratio, noImageView, style, onClick} = props
  const hasImage = () => {
    return src && !src.endsWith?.("missing.png")
  }
  return(
    <gs-image class={`${size ?? "natural"} ${ratio}`} style={style} onClick={onClick}>
      {hasImage() ? 
      <img alt={alt? alt:""} src={src}></img>
      :
      <div className="no-image">{noImageView}</div>
    } 
    </gs-image>
  )
}

export default GSImage