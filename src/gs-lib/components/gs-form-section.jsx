import React from "react";
import GSActionBar from "./gs-action-bar";
import GSField from "./gs-field";
import "./gs-form-section.scss";
import GSItemList from "./gs-item-list";

/**
 * a section inside of a GSForm
 * 
 *
 * @param {Properties} props title,
    sectionActions,
    fields,
    extras
 */

export default function GSFormSection(props) {
  const {
    title,
    sectionActions,
    fields,
    extras
  } = props ?? {}
  return (
    <gs-form-section>
      {title && (
        <GSActionBar
          header={title}
          pageActions={sectionActions}
        ></GSActionBar>
      )}
      {fields && (
        <GSItemList
          {...props}
          items={fields}
          listItem={item => <GSField {...item}></GSField>}
        ></GSItemList>
      )}
      {extras}
    </gs-form-section>
  );
}
