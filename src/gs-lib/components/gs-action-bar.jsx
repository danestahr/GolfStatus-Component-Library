import React, { Component } from "react";
import "./gs-action-bar.scss";
import GSButton from "./gs-button";
import GSToggle from "./gs-toggle";
import GSItemList from "./gs-item-list";
import { defaultTypography } from "../helpers/Theme";

/**
 * A title bar that contains actions on the right hand side.
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {object} style the style for this component
 * 
 * @property {string} type the type of action bar header [grey-header, medium-pad, large-pad, x-large-pad, form-header]
 * 
 * @property {JSX.Element} header the JSX of the header
 * 
 * @property {Array} pageActions array of actions on the right hand side
 *
 * @param {Properties} props style, type, header, pageActions
 */

export default class GSActionBar extends Component {
  renderAction(action) {
    if (action.actionType === "toggle") {
      return <GSToggle {...action?.pageActionProps} />;
    } else {
      return (
        <GSButton
          title={action.buttonTitle}
          buttonIcon={action.actionIcon}
          onClick={action.actionClick}
          style={action.buttonStyle}
          {...action}
        ></GSButton>
      );
    }
  }

  renderHeader(type, header){
    if(type?.includes?.("H1")){
      return <h1 style={{...defaultTypography.headline1}} className="head">{header}</h1>
    }
    if(type?.includes?.("H2")){
      return <h2 style={{...defaultTypography.headline2}} className="head">{header}</h2>
    }
    if(type?.includes?.("H3")){
      return <h3 style={{...defaultTypography.headline3}} className="head">{header}</h3>
    }
    if(type?.includes?.("H4")){
      return <h4 style={{...defaultTypography.body}} className="head">{header}</h4>
    }
    if(type?.includes?.("H5")){
      return <h5 style={{...defaultTypography.bodyRegular}} className="head">{header}</h5>
    }

    return <div className="head">{header}</div>
  }

  render() {
    const {style, type, header, pageActions} = this.props
    return (
      <gs-action-bar style={style} class={type ?? ""}>
        {this.renderHeader(type, header)}
        {pageActions?.length > 0 && (
          <div className="actions">
            <GSItemList
              type="horizontal medium-gap"
              items={pageActions}
              listItem={item => this.renderAction(item)}
            ></GSItemList>
          </div>
        )}
      </gs-action-bar>
    );
  }
}
