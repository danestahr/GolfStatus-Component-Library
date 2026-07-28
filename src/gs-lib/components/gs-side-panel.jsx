import React from "react";
import "./gs-side-panel.scss";

/**
 * A Layout container for a side panel
 *
 * @param {Properties} props sidePanelOpen
 */

export default function GSSidePanel(props){
  let stateClass = props.sidePanelOpen ? "open" : "closed"
  if (props.noTransition) stateClass += " no-transition"
  if (props.animateWidth) stateClass += " animate-width"
  return (
    <gs-side-panel class={stateClass} onClick={(e)=> {e.stopPropagation()}}>
      {props.children}
    </gs-side-panel>
  )
}