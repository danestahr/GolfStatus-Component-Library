import React from "react";
import GSButton from "./gs-button";
import GSItemList from "./gs-item-list";
import "./gs-page-navigation.scss";
import {
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";

/**
 * A paging component that is currently used in banners to page through banner notifications
 *
 * @param {Properties} props pages, currentIndex, navigationActions, previousPage, nextPage
 */

export default function GSPageNavigation(props) {
  const { pages, currentIndex, navigationActions, previousPage, nextPage } = props;
  function getCurrentPage() {
    if (currentIndex === 0) {
      return 1;
    }
    if (currentIndex) {
      return currentIndex + 1;
    }
    return 0;
  }
  function renderAction(action) {
    return <GSButton {...action}></GSButton>;
  }
  function nextPageClick() {
    if (nextPage) {
      if (currentIndex < pages.length - 1) {
        nextPage();
      }
    } else {
      console.log("no next function is defined");
    }
  }
  function previousPageClick() {
    if (previousPage) {
      if (currentIndex > 0) {
        previousPage();
      }
    } else {
      console.log("no previous function is defined");
    }
  }
  return (
    <gs-page-navigation>
      <div className="paging-info">
        <GSButton buttonIcon={faChevronLeft} size="secondary" onClick={previousPageClick}></GSButton>
        <div className="paging">
          <div className="current-page">{getCurrentPage()}</div>
          <div className="of">of</div>
          <div className="total-pages">{pages.length}</div>
        </div>
        <GSButton buttonIcon={faChevronRight} size="secondary" onClick={nextPageClick}></GSButton>
      </div>

      {navigationActions && (
        <GSItemList
          type="horizontal"
          items={navigationActions}
          listItem={item => renderAction(item)}
        ></GSItemList>
      )}
    </gs-page-navigation>
  );
}
