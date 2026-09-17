import React from "react";
import "./gs-side-panel.scss";

/**
 * A Layout container for a side panel
 *
 * @param {Properties} props sidePanelOpen
 */

export default function GSSidePanel(props){
  const stateClass = props.sidePanelOpen ? "open" : "closed"
  return (
    <gs-side-panel style={props.style} class={stateClass} onClick={(e)=> {e.stopPropagation()}}>
      {props.children}
    </gs-side-panel>
  )
}