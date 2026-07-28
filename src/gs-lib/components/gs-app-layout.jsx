import React, { useState } from "react";
import "./gs-app-layout.scss";

import GSAppNavigation from "./gs-app-navigation";
import GSActionBar from "./gs-action-bar";
import GSItemInfo from "./gs-item-info";

import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

/**
 * Main layout for a golfstatus application
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {Array} routes :routes for the application
 * 
 * @property {JSX.Element} notification :banner that controls app wide notifications
 * 
 * @property {function} navigationItemSelected :functin to run when a navigation item is selected
 * 
 * @property {object} headerClicked :action to take when the header on the side navigation bar is clicked
 *
 * @property {object} navigation :layout of the navigation [top, left, none]
 * 
 * @property {object} style
 * 
 *
 * @param {Properties} props nav,
    routes,
    notification,
    navigationItemSelected,
    headerClicked,
    navigation,
    mobileActions,
    style
 */

export default function GSAppLayout(props) {
  const {
    nav,
    routes,
    notification,
    navigationItemSelected,
    headerClicked,
    navigation,
    mobileActions,
    style
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const noRouter = () => {
    return (
      <div className="no-router">
        Could not find any routes for this app! Please add a router
      </div>
    );
  };
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const mobileHeaderActions = () => {
    let actions = mobileActions ?? [];
    if(nav?.navItems?.length == 0){
      return actions
    }
    return [...actions, {
      actionIcon: isOpen ? faTimes : faBars,
      actionClick: toggleMenu
    }];
  };
  const navigate = item => {
    if (navigationItemSelected) {
      navigationItemSelected(item);
    }
    closeMenu();
  };
  const hasNotifications = () => {
    return notification;
  };
  const onHeaderClick = () => {
    if (headerClicked) {
      headerClicked();
    }
  };
  const getNavTitle = () => {
    return (
      <div className="title" onClick={onHeaderClick}>
        <GSItemInfo header={nav.title}></GSItemInfo>
      </div>
    );
  };
  return (
    <gs-app-layout class={`layout ${navigation ?? "left"}`} style={style}>
      <div className={`app-navigation ${isOpen ? "open" : ""}`}>
        <GSAppNavigation
          {...nav}
          headerClicked={headerClicked}
          itemSelected={navigate}
        ></GSAppNavigation>
      </div>
      <div className="mobile-header" style={nav?.style}>
        <GSActionBar
          header={getNavTitle()}
          pageActions={mobileHeaderActions()}
        ></GSActionBar>
      </div>

      {notification && <div className="notifications">{notification}</div>}

      <div className="app-content">{routes ? routes : noRouter()}</div>
    </gs-app-layout>
  );
}
