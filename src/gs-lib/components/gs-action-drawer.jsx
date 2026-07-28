import React from "react";
import "./gs-action-drawer.scss";

import GSButton from "./gs-button";
import GSItemList from "./gs-item-list";

/**
 * A drawer that holds actions primarily used for slideouts
 *
 * @typedef Properties
 * @type {object}
 * 
 * @property {object} style the style for this component
 * 
 * @property {Array} actions drawer actions that will be displayed with buttons
 *
 * @param {Properties} props style, actions
 */

export default function GSActionDrawer(props) {
  const { style, actions } = props;
  return (
    <gs-action-drawer style={style}>
      <GSItemList
        items={actions}
        listItem={item => (
          <GSButton
            {...item}
            title={item.name}
            type={item.type}
            onClick={item.action}
            isFocusable
          ></GSButton>
        )}
        type="grid"
      ></GSItemList>
    </gs-action-drawer>
  );
}
