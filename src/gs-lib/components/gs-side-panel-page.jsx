import React from "react";
import GSActionDrawer from "./gs-action-drawer";
import GSButton from "./gs-button";
import GSItemList from "./gs-item-list";
import GSPageBanner from "./gs-page-banner";
import GSSidePanelNavigation from "./gs-side-panel-navigation";
import "./gs-side-panel-page.scss";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import GSLoadingSpinnerOverlay from "./gs-loading-spinner-overlay";

/**
 * A Layout component for a side panel paget that typically pops out from the right side of a list detail page
 *
 * @param {Properties} props header, banner, drawer, breadCrumbs, loading, loadingText, loadingSubtext, content, style
 */

const GSSidePanelPage = props => {
  const {
    header,
    banner,
    drawer,
    breadCrumbs,
    loading,
    loadingText,
    loadingSubtext,
    content,
    style
  } = props;
  return (
    <gs-side-panel-page style={style} class={loading ? "loading" : ""}>
      <GSSidePanelNavigation {...header}></GSSidePanelNavigation>
      {banner && <GSPageBanner {...banner}></GSPageBanner>}
      {breadCrumbs && (
        <GSItemList
          type="horizontal x-large-pad medium-large-gap breadcrumbs scrollable"
          items={breadCrumbs}
          listItem={item => (
            <GSButton
              type="secondary light-grey no-wrap"
              onClick={() => {
                item.onClick(item);
              }}
              buttonIcon={faChevronLeft}
              title={item.title}
            />
          )}
        />
      )}
      {content}
      {drawer && <GSActionDrawer {...drawer}></GSActionDrawer>}
      {loading ? (
        <GSLoadingSpinnerOverlay
          spinnerSize="x-large"
          mainText={loadingText ? loadingText : "Loading..."}
          subText={loadingSubtext ? loadingSubtext : "This may take a moment."}
        />
      ) : null}
    </gs-side-panel-page>
  );
};

export default GSSidePanelPage;
