
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "./gs-app-navigation-item.scss";

import { faExternalLinkSquareAlt } from "@fortawesome/free-solid-svg-icons";

/**
 * navigation item used inside the navigation bar of the app layout
 * 
 *
 * @param {Properties} props navItem, itemSelected, activeRoute 
 */

export default function GSAppNavigationItem(props) {
  const { navItem, itemSelected, activeRoute } = props;
  function selectItem() {
    if(navItem.itemSelected)
    {
      navItem.itemSelected();
    }
    else if (itemSelected) {
      itemSelected(navItem);
    }
  }
  function isActiveRoute(){
    if(activeRoute === navItem.url)
    {
      return true;
    }
    return false;
  }
  function activeRouteClass(){
    return isActiveRoute() ? "active" : "";
  }
  function selectableClass(){
    return navItem.isSelectable ? "selectable" : "";
  }
  
  return (
    <gs-app-navigation-item>
      <div className={`nav-item ${activeRouteClass()} ${selectableClass()} ${navItem.type}`} onClick={selectItem}>
        <div className="label">{navItem.label}</div>
        {navItem.isExternal && (
          <div className="icon">
            <FontAwesomeIcon icon={faExternalLinkSquareAlt}></FontAwesomeIcon>
          </div>
        )}
      </div>
    </gs-app-navigation-item>
  );
}
