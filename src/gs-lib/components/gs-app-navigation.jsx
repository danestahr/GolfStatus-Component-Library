import React from "react";
import GSAppNavigationItem from "./gs-app-navigation-item";

import "./gs-app-navigation.scss";
import GSButton from "./gs-button";
import GSItemList from "./gs-item-list";

import GSPageBanner from './gs-page-banner';
import GSItemInfo from './gs-item-info';

import { faChevronLeft, faGlobeAmericas, faGolfBall } from "@fortawesome/free-solid-svg-icons";

/**
 * Main navigation column for application.
 * 
 *
 * @param {Properties} props showEnv,
    environment,
    environmentDescription,
    environmentActions,
    environmentType,
    navItems,
    footerItems,
    itemSelected,
    title,
    history,
    headerClicked,
    activeRoute,
    style
 */

export default function GSAppNavigation(props) {
  const {
    showEnv,
    environment,
    environmentDescription,
    environmentActions,
    environmentType,
    navItems,
    footerItems,
    itemSelected,
    title,
    history,
    headerClicked,
    activeRoute,
    style
  } = props;
  
  function backButtonClicked(item) {
    itemSelected?.(item);
  }
  const onHeaderClick = () => {
    headerClicked?.()
  }
  return (
    <gs-app-navigation style={style}>
      {showEnv ? <GSPageBanner type={environmentType}  title={<GSItemInfo header={environment} description={environmentDescription}  icon={faGlobeAmericas}></GSItemInfo>} bannerActions={environmentActions} ></GSPageBanner>: ""}
      <div className="nav-header" onClick={onHeaderClick}>
        <div className="nav-header-title">
          <div>{title}</div>
        </div>
      </div>
      {history && (
        <div className="nav-back">
          <GSItemList
            items={history}
            listItem={historyItem => (
              <GSButton
                buttonIcon={faChevronLeft}
                title={historyItem.label}
                size="secondary"
                onClick={() => backButtonClicked(historyItem)}
              ></GSButton>
            )}
            type="horizontal"
          ></GSItemList>
        </div>
      )}

      <div className="main">
        <GSItemList
          items={navItems}
          listItem={navItem => (
            <GSAppNavigationItem
              itemSelected={itemSelected}
              navItem={navItem}
              activeRoute={activeRoute}
            ></GSAppNavigationItem>
          )}
          type="vertical"
        ></GSItemList>
      </div>
      <div className="nav-footer">
        <GSItemList
          items={footerItems}
          listItem={navItem => (
            <GSAppNavigationItem
              itemSelected={itemSelected}
              navItem={navItem}
            ></GSAppNavigationItem>
          )}
          type="vertical"
        ></GSItemList>
      </div>
    </gs-app-navigation>
  );
}
