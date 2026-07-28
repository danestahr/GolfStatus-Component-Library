import React from 'react'
import './gs-side-panel-navigation.scss'
import GSButton from "./gs-button";

/**
 * Navigation bar that typically is on top of a slide out to provide the title and navigation
 *
 * @param {Properties} props leftIcon, leftButtonClick, title, rightButtonClick, rightIcon, style
 */

export default function GSSidePanelNavigation(props){
  const {leftIcon, leftButtonClick, title, rightButtonClick, rightIcon, style} = props
  return(
    <gs-side-panel-navigation style={style}>
      <div className="left-button">
        {leftIcon && <GSButton buttonIcon={leftIcon} onClick={leftButtonClick}></GSButton>}
        
      </div>
      <div className="header-title">{title}</div>
      <div className="right-button">
        {rightIcon && <GSButton buttonIcon={rightIcon} onClick={rightButtonClick}></GSButton>}
        
      </div>
    </gs-side-panel-navigation>
  )
}