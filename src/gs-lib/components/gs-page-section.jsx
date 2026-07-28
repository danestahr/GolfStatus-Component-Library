import React from "react";
import "./gs-page-section.scss";
import GSActionBar from "./gs-action-bar";
import GSItemList from "./gs-item-list";
import { defaultPadding, defaultTypography } from "../helpers/Theme";

/**
 * View to display a section of a page with a bottom divider
 * 
 * @typedef Action
 * @type {object}
 *
 * @typedef Properties
 * @type {object}
 * 
 * @property {JSX.Element} title the jsx for the title
 * 
 * @property {JSX.Element} description the jsx for the description
 * 
 * @property {Array.<JSX.Element>} body the jsx for the body
 * 
 * @property {Array.<Action>} sectionActions the actions for this section
 * 
 * @property {string} maxBodyWidth the maxWidth for the body (defaults to 180px)
 * 
 * @property {object} style the style for this component
 * 
 * @property {object} bodyStyle the style for the body sections of this component
 *
 * @param {Properties} props title,description,body,sectionActions, maxBodyWidth,style,bodyStyle
 */

const GSPageSection = props => {
  const { title, description, body, sectionActions, maxBodyWidth, style, bodyStyle, contentStyle } = props;


  const defaultBodyWidth = {maxWidth: maxBodyWidth ?? "1080px"}

  const sectionViews = (body ?? [])?.map?.(
    content =>
      (
        <div className="section-body" style={{...defaultBodyWidth, ...defaultPadding.xLargePad, ...bodyStyle}}>
          <div className="section-content" style={{...contentStyle}} >{content}</div>
        </div>
      ) ?? body
  );

  

  return (
    <gs-page-section style={style}>
      {title && <GSActionBar style={{...defaultBodyWidth}} header={title} pageActions={sectionActions} type="H2"/>}
      {description ? <div style={{...defaultBodyWidth, ...defaultTypography.bodyRegular.withOpacity()}} className="description">{description}</div> : null}
      <GSItemList
        style={{...defaultBodyWidth}}
        items={sectionViews}
        listItem={item => item}
        type="vertical large-gap"
      />
    </gs-page-section>
  );
};

export default GSPageSection;
