import React from "react";
import "./gs-info-group.scss";

import GSItemList from "./gs-item-list";
import { defaultTypography } from "../helpers/Theme";

/**
 * A component that has spefific fonts and spacing set up to display content in a consistent layout
 * 
 * 
 * @typedef Properties
 * @type {object}
 * 
 * 
 * @property {string} dataGroups :array of columns that form the info group
 * 
 * @property {string} type : type of info-group
 * 
 * @property {string} itemGap : gap for items
 * 
 * @property {string} listType : type for list of [vertial, horizontal, mobile-vertical]
 * 
 *  @property {object} style style for the component
 * 
 * @property {object} listStyle style for the list
 *
 * @param {Properties} props dataGroups, type, itemGap, listType, style
 */


const GSInfoGroup = props => {
  const { dataGroups, type, itemGap, listType, style, listStyle } = props;

  const getTag = sectionItem => {
    const type = sectionItem?.type ?? ""
    const sectionItemStyle = sectionItem?.sectionItemStyle ?? {}
    
    if (type.includes("headline-1")) {
      return (
        <h1 style={{...defaultTypography.headline1, ...sectionItemStyle}} className={sectionItem.type}>
          {sectionItem.value}
        </h1>
      );
    }
    if (type.includes("headline-2")) {
      return (
        <h2 style={{...defaultTypography.headline2, ...sectionItemStyle}}className={sectionItem.type}>
          {sectionItem.value}
        </h2>
      );
    }
    if (type.includes("headline-3")) {
      return (
        <h3 style={{...defaultTypography.headline3, ...sectionItemStyle}} className={sectionItem.type}>
          {sectionItem.value}
        </h3>
      );
    }
    if (type.includes("headline-4")) {
      return (
        <h4 style={{...defaultTypography.headline4, ...sectionItemStyle}} className={sectionItem.type}>
          {sectionItem.value}
        </h4>
      );
    }
    if (type.includes("headline-5")) {
      return (
        <h5 style={{...defaultTypography.headline5, ...sectionItemStyle}} className={sectionItem.type}>
          {sectionItem.value}
        </h5>
      );
    }
    return (
      <div style={{...sectionItemStyle}} className={sectionItem.type}>
        {sectionItem.value}
      </div>
    );
  };

  const hasGroupSections = () => {
    return group?.sections?.length > 0;
  };

  const getGroup = group => {
    const { title, type, style } = group ?? {};
    return (
      <div style={style ?? {}} className={`groups ${type ?? ""}`}>
        {title && <div className="title">{title}</div>}
        {getSections(group)}
      </div>
    );
  };

  const getSections = group => {
    if (group?.sections?.length > 0) {
      return (
        <GSItemList
          type={`vertical ${group?.gap ?? "medium-large-gap"} ${group?.type ??
            ""}`}
          items={group.sections}
          listItem={section => getSection(section)}
        />
      );
    }
  };

  const getSection = section => {
    const { sectionItems, gap, style } = section ?? {};
    return (
      <GSItemList
      listStyle={style}
        type={`vertical ${ gap ?? itemGap ?? ""} info-section ${section.type ?? ""}`}
        items={sectionItems}
        listItem={sectionItem => (
          getTag(sectionItem)
        )}
      />
    );
  };

  return (
    <gs-info-group class={type} style={style}>
      <GSItemList
        type={`horizontal x-large-gap ${listType}`}
        listStyle={listStyle}
        items={dataGroups}
        listItem={group => getGroup(group)}
      ></GSItemList>
    </gs-info-group>
  );
};

export default GSInfoGroup;
