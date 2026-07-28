import React from "react";
import "./gs-loading-spinner-overlay.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

/**
 * A component that has spefific fonts and spacing set up to display content in a consistent layout
 *
 * @param {Properties} props isLtr, spinnerSize, mainText, subText
 */

export default function GSLoadingSpinnerOverlay(props) {

  const {isLtr, spinnerSize, mainText, subText, style} = props

  return (
    <gs-loading-spinner-overlay style={style}>
      <div className={`loading-section ${isLtr ? 'is-ltr' : ''}`}>
        <div className={`loading-spinner ${(spinnerSize ?? "large")}`}>
          <FontAwesomeIcon icon={faCircleNotch} spin></FontAwesomeIcon>
        </div>
        <div className="text-section">
          {mainText ? 
            <div className="main-loading-text">
                {mainText}
            </div> : ''}
          {subText ? 
            <div className="sub-loading-text">
              {subText}
            </div> : ''}
        </div>
      </div>
    </gs-loading-spinner-overlay>
  )
}