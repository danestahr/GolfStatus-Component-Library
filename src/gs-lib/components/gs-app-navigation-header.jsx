import React from "react";
import "./gs-app-navigation-header.scss";

/**
 * Header layout that is used in the app layouts
 * 
 *
 * @param {Properties} props logo, title, filter 
 */

export default function GSAppNavigationHeader(props) {
  const { logo, title, filter, onLogoClick, onTitleClick } = props;
  return (
    <gs-app-navigation-header>
      <div className="app-title">
        {logo && (
          <div className="title-logo" onClick={onLogoClick}>
            <img src={logo} alt="Logo" style={{filter: filter}}></img>
          </div>
        )}
        <div className="nav-header-title" onClick={onTitleClick}>{title}</div>
      </div>
    </gs-app-navigation-header>
  );
}
