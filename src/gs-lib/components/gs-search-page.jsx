import React from "react";
import "./gs-search-page.scss";

import GSInfiniteList from "./gs-infinite-list";
import GSActionBar from "./gs-action-bar";
import GSItemList from "./gs-item-list";
import GSButton from "./gs-button";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import GSPageLayout from "./gs-page-layout";

/**
 * A Layout component for a search page that includes a title bar, default search bar, filter buttons, and infinite list
 *
 * @param {Properties} props title,
    toggleMenu,
    pageActions,
    sidePanelClass,
    defaultSearch,
    searchActions,
    loadMore,
    filter,
    clearFilterItem,
    filterButtons,
    itemsList,
    alignment,
    style,
    headerStyle,
    scrollUpdated,
    contentStyle
 */

export default function GSSearchPage(props) {
  const hasFilterButtons =
    props.filterButtons && props.filterButtons.length > 0;
  const {
    title,
    toggleMenu,
    pageActions,
    sidePanelClass,
    defaultSearch,
    searchActions,
    loadMore,
    filter,
    clearFilterItem,
    filterButtons,
    itemsList,
    alignment,
    style,
    headerStyle,
    scrollUpdated,
    contentStyle
  } = props;

  const getInfiniteList = () => {
    if (itemsList) {
      return (
        <GSInfiniteList
          loadMore={loadMore}
          filter={filter}
          scrollUpdated={scrollUpdated}
        >
          {hasFilterButtons && (
            <div className="filter-buttons">
              <GSItemList
                itemSelected={clearFilterItem}
                type="horizontal medium-gap"
                items={filterButtons}
                listItem={button => (
                  <GSButton
                    title={button.name}
                    type="black pill secondary"
                    rightIcon={faTimesCircle}
                  ></GSButton>
                )}
              ></GSItemList>
            </div>
          )}
          {itemsList}
        </GSInfiniteList>
      );
    }
  };
  return (
    <gs-search-page
      class={` ${defaultSearch ? "search" : "no-search"}`}
      style={style}
    >
      <GSPageLayout
        title={title}
        toggleMenu={toggleMenu}
        pageActions={pageActions}
        headerStyle={headerStyle}
      >
        <page-content  style={contentStyle} class={`${sidePanelClass} align-${alignment ?? "left"}`}>
          {defaultSearch && (
            <GSActionBar
              header={<div className="search">{defaultSearch}</div>}
              pageActions={searchActions}
            ></GSActionBar>
          )}
          {getInfiniteList()}
          {props.children}
        </page-content>
      </GSPageLayout>
    </gs-search-page>
  );
}
