import React, { Component } from "react";
import "./gs-page-banner.scss";
import GSActionBar from "./gs-action-bar";
import GSPageNavigation from "./gs-page-navigation";

/**
 * A Banner that will typically reside at the top of a page to notify users, typically on a side panel or app
 *
 * @param {Properties} props timeout, notifications, timeoutAction
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
    const { title, bannerActions, notifications, state, type } = this.props;
    const { currentNotificationIndex } = this.state;
    if (title) {
      return {
        header: title,
        pageActions: bannerActions,
        state: state,
        type: type
      };
    }else if (
      notifications &&
      notifications?.length > currentNotificationIndex
    ) {
      return notifications[currentNotificationIndex];
    }
    else if(
      notifications?.length > 0
    ){
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

  render() {
    const { timeout, notifications } = this.props;
    const progressStyle = timeout
      ? { animationDuration: `${timeout / 1000}s` }
      : {};
    const banner = this.getNextBanner() ? this.getNextBanner() : {};
    return (
      <gs-page-banner
        class={`banner ${banner.state} ${banner.type} ${this.state.localState}`}
      >
        <div className="gs-banner-content">
          <GSActionBar {...banner}></GSActionBar>
          {this.showBannerNavigation() && (
            <GSPageNavigation
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
