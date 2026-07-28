import React from "react";
import "./gs-item-info.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * A component that has spefific fonts and spacing set up to display content in a consistent layout
 *
 * @param {Properties} props dataGroups, type, itemGap, listType, style
 */


export default function GSItemInfo(props) {
  const { icon, header, value, description } = props;
  return (
    <gs-item-info>
      {icon && (
        <div className="icon">
          <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
        </div>
      )}
      <div className="item-info">
        {header && <div className="item-header">{header}</div>}
        {value && <div className="item-value">{value}</div>}
        <div className="item-description">{description}</div>
      </div>
    </gs-item-info>
  );
}
