import React, { useState, useEffect } from "react";
import "./gs-field.scss";

import GSInput from "../components/gs-input";
import { isLink } from "../helpers/RegexHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

/**
 * a field that has an input, description, label, warnings, and validation built in, primarily used in forms.
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {object} label top label
 * 
 * @property {string} value value for the input if it is editable and div when it is not
 * 
 * @property {JSX.Element} description description of field under lable
 * 
 * @property {object} validation validation object {isValid, invalidLabel}
 * 
 * @property {Boolean} isEditable true will display value as input 
 * 
 * @property {string} hintText hint under input
 * 
 * @property {function} failedValidation function to run when validation fails
 * 
 * @property {Boolean} customView true if field value should not be an input when field is editable
 * 
 * @property {string} type type of field [row, column]
 * 
 * @property {number} charCount count of characters for label on lower right
 * 
 * @property {number} maxLength number to show as maxlength for character count
 * 
 * @property {string} align [align-start]
 * 
 * @property {boolean} required validate field as a required field
 * 
 * @property {object} style style object for component styling
 * 
 * @property {object} descriptionStyle style for description
 *
 * @param {Properties} props label,
    value,
    description,
    validation,
    isEditable,
    hintText,
    failedValidation,
    customView,
    type,
    charCount,
    maxLength,
    align,
    required,
    style,
descriptionStyle
 */

export default function GSField(props) {
  
  const {
    label,
    value,
    description,
    validation,
    isEditable,
    hintText,
    failedValidation,
    customView,
    type,
    charCount,
    maxLength,
    align,
    required,
    style,
    descriptionStyle,
    showInitialError,
    onBlur
  } = props;

  const [showError, setShowError] = useState(showInitialError ?? false);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    runValidation();
  });

  const runValidation = () => {
    let valid = true;
    let warn = false;
    if (
      !required &&
      (value === "" || value === undefined || value === null)
    ) {
      setWarning(false)
      return false;
    }
    if (valid) {
      valid = requiredCheck();
      warn = valid ? false : "This field is required";
    }
    if (valid) {
      valid = characterCheck();
      warn = valid ? false : "Invalid count";
    }
    if (valid) {
      valid =
        validation && validation.isValid
          ? validation.isValid(value)
          : true;
      warn = valid ? false : validation.invalidLabel;
    }
    if (warn) {
      failedValidation?.(warn);
    }
    setWarning(warn);
    return warn;
  };

  const characterCheck = () => {
    if (maxLength && charCount) {
      return maxLength - charCount >= 0;
    }
    return true;
  };

  const requiredCheck = () => {
    if (required) {
      return value !== "";
    }
    return true;
  };

  const valueClicked = e => {
    if (isLink(value) && !isEditable) {
      gotoLink(value);
    }
  };

  const gotoLink = url => {
    window.open(url);
  };

  const showInvalidLabel = () => {
    if (warning && showError) {
      return true;
    }
    return false;
  };

  const isCustomField = () => {
    return typeof value !== "string";
  };

  const inputTouched = () => {
    setShowError(true);
    onBlur?.()
  };

  const isRequired = () => {
    return required && isEditable;
  };

  const getEditableField = () => {
    if (customView) {
      if (React.isValidElement(value)) {
        return React.cloneElement(value, { inputTouched });
      }
      return value;
    } else {
      return (
        <GSInput
          {...props}
          textValue={value}
          onBlur={inputTouched}
          style={style}
        ></GSInput>
      );
    }
  };

  const hasValueInfo = () => {
    return isEditable && (warning || hintText || charCount || maxLength)
  }

  return (
    <gs-field style={style} >
      <div className={`field ${type ?? "column"} ${(align ?? '')}`} style={style} >
        {(props?.label ?? "") !== "" ? (
          <div className="field-header">
            <div className="label">{label}</div>
            {isRequired() && <div className="required">*</div>}
          </div>
        ) : null}
        <div
          className={`field-value ${isLink(value) ? "link" : ""}  ${(align ?? '')} ${showInvalidLabel() ? "invalid-input" : ""}`}
          onClick={valueClicked}
        >
          {description && (
            <div className="description" style={descriptionStyle}>{description}</div>
          )}
          {isEditable ? getEditableField() : value}
          {hasValueInfo() && (
            <div className="value-info">
              {showInvalidLabel() ? (
                <div className="label invalid"><span className="warning"><FontAwesomeIcon icon={faExclamationCircle}/> </span>{warning}</div>
              ) : (
                <div className="label">{hintText}</div>
              )}
              {charCount && (
                <div
                  className={`character-count ${
                    characterCheck() ? "valid" : "invalid"
                  }`}
                >
                  {charCount}
                  {maxLength ? `/${maxLength}` : ""}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </gs-field>
  );
}
