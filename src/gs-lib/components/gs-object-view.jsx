import React from "react";
import './gs-object-view.scss';
import GSItemList from './gs-item-list';
import GSField from './gs-field';

/**
 * View to display Javascript objects. It will display each property as a field.
 * 
 * @typedef Properties
 * @type {object}
 * @property {object} obj the js object that contain the properties to view
 * @property {object} style the style for this component
 *
 * @param {Properties} props obj, style
 */
export default function GSObjectView(props) {
  const { obj, style } = props
  function IsNumeric(val) {
    return Number(parseFloat(val)) === val;
  }
  function isString(val) {
    return typeof val === 'string' || val instanceof String
  }
  function isArray(val) {
    return Array.isArray(val);
  }
  function displayableProperties() {
    return Object.getOwnPropertyNames(obj)
  }
  function getValueView(value) {
    return value
  }
  function gotoLink(url){
    window.open(url)
  }
  function fieldIsRequired(field){
    let found = false
    if (props.requiredFields)
    {
      found = props.requiredFields.find(f => f.field === field)
    }
    return found;
  }
  function getValidation(field){
    let found = {};

    if (props.validation)
    {
      found = props.validation.find(f => f.field === field)
    }
    
    return found
  }

  return (
    <gs-object-view style={style}>
      <form>
        {obj && (
          <div className="details">
            <GSItemList type="vertical" items={displayableProperties()} listItem={(item) => (
              <GSField isEditable={isString(obj[item]) && props.isEditable} required={fieldIsRequired(item)} validation={getValidation(item)} label={item?.replaceAll("_", " ")} value={isArray(obj[item]) ? <GSItemList items={obj[item]} listItem={(item) => item} type="vertical"></GSItemList> : getValueView(obj[item])}></GSField>
            )}></GSItemList>
          </div>
        )}
      </form>

    </gs-object-view>
  )
}