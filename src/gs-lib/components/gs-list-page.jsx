import React, { Component } from "react";
import "./gs-list-page.scss";
import GSSidePanel from "./gs-side-panel";
import GSPageBanner from "./gs-page-banner";
import GSSearchPage from "./gs-search-page";
import GSLoadingSpinnerOverlay from "./gs-loading-spinner-overlay";
import { defaultLayouts, defaultPadding } from "../helpers/Theme";

/**
 * A component displays a default list/details page with side panel page attached for detail views
 *
 * @param {Properties} props getChildRoutes,
    getRouter,
    isSidePanelOpen,
    filter,
    itemList,
    clearFilterItem,
    filterButtons,
    loadMore,
    title,
    getBanner,
    getItemList,
    getDefaultSearch,
    getPageActions,
    getSearchActions,
    toggleMenu,
    alignment,
    style,
    headerStyle
 */


export default function GSListPage(props) {
  const {
    getChildRoutes,
    getRouter,
    isSidePanelOpen,
    filter,
    itemList,
    clearFilterItem,
    filterButtons,
    loadMore,
    title,
    getBanner,
    getItemList,
    getDefaultSearch,
    getPageActions,
    getSearchActions,
    toggleMenu,
    alignment,
    style,
    headerStyle,
    scrollUpdated,
    loading,
    loadingMainText, 
    loadingSubText,
    searchPage
  } = props;
  function getRoutes() {
    if (getChildRoutes) {
      return getChildRoutes();
    }
  }
  function closeBanner() {
    if (props.closeBanner) {
      closeBanner();
    }
  }
  function getFilter() {
    return filter ? filter : { search: "" };
  }
  function getList() {
    if (getItemList) {
      return getItemList();
    }
  }
  function getSearch() {
    if (getDefaultSearch) {
      return getDefaultSearch();
    }
  }
  function pageActions() {
    if (getPageActions) {
      return getPageActions();
    }
  }
  function searchActions() {
    if (getSearchActions) {
      return getSearchActions();
    }
  }
  function checkSidePanelOpen() {
    if (isSidePanelOpen) {
      return isSidePanelOpen();
    }
    return false;
  }
  function getSidePanelClass() {
    return checkSidePanelOpen() ? "open" : "";
  }
  if(loading){
    return <gs-list-page>
      <div className="main" style={{...defaultLayouts.vStack.align("center", "center"), ...defaultPadding.emptyListPad, ...defaultLayouts.fill}}>
        <GSLoadingSpinnerOverlay mainText={loadingMainText ?? "Loading..."} subText={loadingSubText ?? "This may take a moment."}/>
      </div>
    </gs-list-page>
  }
  return (
    <gs-list-page style={style}>
      <div className="main">
        {getBanner && <GSPageBanner {...getBanner()}></GSPageBanner>}

        <GSSearchPage
          sidePanelClass={getSidePanelClass()}
          title={title}
          pageActions={pageActions()}
          searchActions={searchActions()}
          loadMore={loadMore}
          filter={getFilter()}
          filterButtons={filterButtons}
          clearFilterItem={clearFilterItem}
          itemsList={getList()}
          defaultSearch={getSearch()}
          toggleMenu={toggleMenu}
          alignment={alignment}
          headerStyle={headerStyle}
          scrollUpdated={scrollUpdated}
          contentStyle={searchPage?.contentStyle}
          style={searchPage?.style}
        >
          {props.children}
        </GSSearchPage>
      </div>

      {getRouter && (
        <GSSidePanel sidePanelOpen={checkSidePanelOpen()}>
          {getRouter && 
          getRouter()}
        </GSSidePanel>
      )}
    </gs-list-page>
  );
}
