import React, { Component } from "react";
import "./gs-page-banner.scss";
import GSActionBar from "./gs-action-bar";
import GSPageNavigation from "./gs-page-navigation";

/**
 * A Banner that will typically reside at the top of a page to notify users, typically on a side panel or app
 *
 * @typedef Properties
 *
 * @type {object}
 *
 * @property {object} bannerStyle style for the banner element
 *
 * @property {object} contentStyle style for the content of the banner
 *
 * @property {object} actionBarStyle style for the action bar in the banner content
 *
 * @property {object} navigationStyle style for the notification navigation in the banner content
 *
 * @property {string} progressColor color of the timer that counts the banner timeout down
 *
 * the four styles above are what defaultBannerStyles definitions are made up of, so a banner
 * style can be spread onto the banner ({...defaultBannerStyles.primary.withTheme(theme, mode)})
 *
 * @param {Properties} props timeout, notifications, timeoutAction, bannerStyle, contentStyle,
 * actionBarStyle, navigationStyle, progressColor
 */

export default class GSPageBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counting: "off",
      localState: "open",
      currentNotificationIndex: 0,
      timeoutID: undefined
    };
  }
  componentDidMount() {
    if (this.props.timeout && this.props.timeout > 0) {
      const to = setTimeout(this.timeoutAction, this.props.timeout);
      this.setState({ counting: "count", timeoutID: to });
    }
  }
  componentWillUnmount() {
    clearTimeout(this.state.timeoutID);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.timeout !== this.props.timeout && this.props.timeout > 0) {
      clearTimeout(this.state.timeoutID);
      const to = setTimeout(this.timeoutAction, this.props.timeout);
      this.setState({ counting: "count", timeoutID: to });
    }
  }
  timeoutAction = () => {
    if (this.props.timeoutAction) {
      this.setState({ counting: "off" });
      this.props.timeoutAction();
    }
  };
  getNextBanner = () => {
    const {
      title,
      bannerActions,
      notifications,
      state,
      type,
      bannerStyle,
      contentStyle,
      actionBarStyle,
      navigationStyle,
      progressColor
    } = this.props;
    const { currentNotificationIndex } = this.state;
    if (title) {
      return {
        header: title,
        pageActions: bannerActions,
        state,
        type,
        bannerStyle,
        contentStyle,
        actionBarStyle,
        navigationStyle,
        progressColor
      };
    } else if (
      notifications &&
      notifications?.length > currentNotificationIndex
    ) {
      return notifications[currentNotificationIndex];
    } else if (notifications?.length > 0) {
      return notifications[0];
    }
    return { header: "", state: "" };
  };
  showBannerNavigation = () => {
    const { notifications } = this.props;
    return notifications && notifications.length > 1;
  };
  nextPage = () => {
    const { currentNotificationIndex } = this.state;
    this.setState({ currentNotificationIndex: currentNotificationIndex + 1 });
  };
  previousPage = () => {
    const { currentNotificationIndex } = this.state;
    this.setState({ currentNotificationIndex: currentNotificationIndex - 1 });
  };
  getNavigationActions = () => {
    const { navigationActions } = this.props;
    if (navigationActions) {
      return navigationActions;
    }
  };

  getStyles = banner => {
    const bannerStyle = banner.bannerStyle ?? this.props.bannerStyle ?? {};
    const contentStyle = banner.contentStyle ?? this.props.contentStyle ?? {};
    const actionBarStyle =
      banner.actionBarStyle ?? this.props.actionBarStyle ?? {};
    const navigationStyle =
      banner.navigationStyle ?? this.props.navigationStyle ?? {};
    const progressColor =
      banner.progressColor ?? this.props.progressColor ?? {};

    return {
      bannerStyle,
      contentStyle,
      actionBarStyle,
      navigationStyle,
      progressColor
    };
  };

  render() {
    const { timeout, notifications } = this.props;

    const banner = this.getNextBanner() ? this.getNextBanner() : {};

    const {
      bannerStyle,
      contentStyle,
      actionBarStyle,
      navigationStyle,
      progressColor
    } = this.getStyles(banner);

    const progressStyle = timeout
      ? {
          animationDuration: `${timeout / 1000}s`,
          backgroundColor: progressColor
        }
      : {};

    return (
      <gs-page-banner
        style={bannerStyle}
        class={`banner ${banner.state} ${banner.type} ${this.state.localState}`}
      >
        {progressColor ? (
          <div
            style={{ display: "none", height: 0, width: 0, position: "fixed" }}
            dangerouslySetInnerHTML={{
              __html: `<style>.icon{color:${progressColor}!important}</style>`
            }}
          ></div>
        ) : null}
        <div style={contentStyle} className="gs-banner-content">
          <GSActionBar style={actionBarStyle} {...banner}></GSActionBar>
          {this.showBannerNavigation() && (
            <GSPageNavigation
              style={navigationStyle}
              navigationActions={this.getNavigationActions()}
              nextPage={this.nextPage}
              previousPage={this.previousPage}
              pages={notifications}
              currentIndex={this.state.currentNotificationIndex}
            />
          )}
        </div>

        <div
          className={`banner-timer ${this.state.counting}`}
          style={this.state.counting === "count" ? progressStyle : {}}
        ></div>
      </gs-page-banner>
    );
  }
}
