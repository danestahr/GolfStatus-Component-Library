import React from "react";
import "./gs-empty-list.scss";

import GSButton from "./gs-button";
import GSItemList from "./gs-item-list";

/**
 * component to be displayed in empty lists, should be use inside the emptyMessage of a GSItemList
 * 
 *
 * @param {Properties} props title, detail, actions, style
 */

const GSEmptyList = props => {
  const { title, detail, actions, style, titleStyle, detailStyle } = props;
  return (
    <gs-empty-list style={style}>
      <div className="messaging">
        <div className="empty-title" style={{titleStyle}}>{title}</div>
        <div className="empty-detail" style={{detailStyle}}>{detail}</div>
      </div>
      {actions?.length > 0 ? (
        <GSItemList
          type="horizontal medium-large-gap mobile-vertical action-buttons"
          items={actions}
          listItem={action => <GSButton {...action} style={action.buttonStyle} />}
        ></GSItemList>
      ) : null}
    </gs-empty-list>
  );
};

export default GSEmptyList;
