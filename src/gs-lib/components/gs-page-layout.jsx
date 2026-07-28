import "./gs-page-layout.scss";
import React from "react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import GSButton from "./gs-button";
import GSActionBar from "./gs-action-bar";

/**
 * A component that has spefific fonts and spacing set up to display content in a consistent layout
 *
 * @param {Properties} props title, toggleMenu, closeMenu, style, headerStyle, pageActions
 */


export default function GSPageLayout(props) {
  const { title, toggleMenu, closeMenu, style, headerStyle, pageActions } = props;
  function toggleMenuAction() {
    if (toggleMenu) {
      toggleMenu();
    }
  }
  return (
    <gs-page-layout
      onClick={e => {
        closeMenu;
      }}
      style={style}
    >
      <div className="header" style={headerStyle}>
        {toggleMenu && (
          <div className="menu-button">
            <GSButton
              buttonIcon={faBars}
              type="light-grey"
              onClick={toggleMenuAction}
            ></GSButton>
          </div>
        )}

        <GSActionBar
          pageActions={pageActions}
          header={<div className="title">{title}</div>}
        ></GSActionBar>
      </div>
      {props.children}
    </gs-page-layout>
  );
}
