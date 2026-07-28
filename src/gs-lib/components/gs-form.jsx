import React, { useMemo, useState } from "react";
import "./gs-form.scss";

import GSActionBar from "./gs-action-bar";
import GSItemList from "./gs-item-list";
import GSFormSection from "./gs-form-section";

/**
 * a form that allows you to add an array of form sections that includes fields that will be displayed as GSFields by default
 * @typedef Properties
 * @type {object}
 *
 * @property {string} formTitle title of the form that is displayed as an actionbar at the top of the form
 *
 * @property {Array} formActions list of actions for the action bar at the top of the form
 *
 * @property {Array} formSections sections of the form
 *
 * @property {object} style style for the form
 *
 * @param {Properties} props formTitle, formActions, formSections, style
 */

export default function GSForm(props) {
  const { formTitle, formActions, formSections, style } = props;
  return (
    <gs-form style={style}>
      {formTitle && (
        <div className="gs-form-header">
          <GSActionBar
            header={formTitle}
            pageActions={formActions}
          ></GSActionBar>
        </div>
      )}

      <GSItemList
        items={formSections?.filter?.(fs => !fs.isHidden)}
        listItem={item => <GSFormSection {...item}></GSFormSection>}
        type="vertical"
      ></GSItemList>
    </gs-form>
  );
}

/**
 * a hook that provides a default context to the form and has basic validation to determine whether the form is valid or not
 *
 *
 * @param {Boolean} initialValid determines what valid state the form should start in
 */

export const useFormValidation = initialValid => {
  const [isValid, setIsValid] = useState(initialValid);
  const [warnings, setWarnings] = useState([]);
  let context = useMemo(() => ({}), []);
  context.validationFailed = e => {
    if (isValid) {
      setIsValid(false);
      setWarnings([...warnings, e]);
    }
  };
  return [context, isValid, setIsValid];
};

/**
 * a hook that provides a more complex context to the form with the ability to set and read data for the form. Also has basic validation to determine whether the form is valid or not
 *
 * @typedef Properties
 * @type {object}
 * @property {Boolean} initialValid determines what valid state the form should start in
 * @property {function} setData the function can set the data in the context
 * @property {object} data the data that the form will be based on
 *
 * @param {Properties} settings initialValid, setData, data
 */
export const useFormDataValidation = settings => {
  const [isValid, setIsValid] = useState(settings?.initialValid);
  const [warnings, setWarnings] = useState([]);
  let context = useMemo(() => ({}), []);
  context.validationFailed = e => {
    if (isValid) {
      setIsValid(false);
      setWarnings([...warnings, e]);
    }
  };
  context.updateData = (value, property) => {
    if (settings.data && settings.setData) {
      setIsValid(true);
      let update = { ...settings.data };
      update[property] = value;
      settings.setData(update);
    }
  };
  context.getData = () => {
    return settings?.data;
  };
  context.setBinding = property => {
    return {
      value: context?.getData?.()?.[property] ?? "",
      onChange: e => {
        context?.updateData?.(e?.target?.value, property);
      },
      failedValidation: context.validationFailed
    };
  };
  context.setToggleBinding = property => {
    return {
      value: context?.getData?.()?.[property] ?? "",
      onClick: () => {
        const current = !!context?.getData?.()?.[property]
        context?.updateData?.(!current, property);
      },
      failedValidation: context.validationFailed
    };
  };
  return [context, isValid, setIsValid];
};
