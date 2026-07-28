import React, { Component } from "react";
import "./gs-input.scss";

import GSButton from "./gs-button";
import GSSelect from "./gs-select";

/**
 * A GS style input component
 * 
 * @typedef Properties
 * @type {object}
 * 
 * 
 * @property {string} textValue :text inside the input box
 * 
 * @property {object} rightIcon :icon to the right of the text
 * 
 * @property {object} leftIcon :icon to the left of the text
 * 
 * @property {function} rightIconClick :action for the right icon
 * 
 * @property {function} leftIconClick :action for the left icon
 * 
 * @property {boolean} isEditable :is the input editable
 * 
 * @property {function} failedValidation :function for failed validation
 * 
 * @property {object} style :styling for the component
 * 
 * @property {object} buttonStyle :styling for the buttons in the component
 * 
 * @property {object} inputStyle :styling for the input
 * 
 * @property {string} type :type of input
 * 
 * @property {string} pattern :pattern for input
 * 
 * @property {string} placeholder :placeholder of input
 * 
 * @property {function} onBlur :function to run on Blur
 * 
 * @property {string} min :min value
 * 
 * @property {string} max :max value
 * 
 * @property {function} onChange :function to run when text changes
 * 
 *
 * @param {Properties} props textValue,
      rightIcon,
      leftIcon,
      rightIconClick,
      leftIconClick,
      isEditable,
      failedValidation,
      style,
      type,
      pattern,
      placeholder,
      onBlur,
      min, 
      max,
      onChange
 */

export default class GSinput extends Component {
  
  constructor(props) {
    super(props);
    this.state = { defaultTextValue: "" };
  }

  keyUp = e => {
    if (e.key === "Enter") {
      if (this.props.onSubmit) {
        this.props.onSubmit(e.target.value);
      } else {
        console.log("no submit action");
      }
    }
  };

  textChanged = e => {
    if (this.props?.onChange) {
      this.props.onChange?.(e);
    } else {
      this.setState({ defaultTextValue: e.target.value });
    }
  };

  handleWheel = e => {
    if (this.props.type === "number") {
      e?.target?.blur?.();
    }
    null;
  };

  getValue = () => {
    const {
      textValue,
      rightIcon,
      leftIcon,
      rightIconClick,
      leftIconClick,
      isEditable,
      failedValidation,
      style,
      inputStyle,
      type,
      pattern,
      placeholder,
      onBlur,
      min, 
      max,
      ...rest
    } = this.props;
    if (type == "text-area") {
      return (
        <textarea
          {...rest}
          placeholder={placeholder}
          value={
            textValue
              ? textValue
              : this.state.defaultTextValue
          }
          onChange={this.textChanged}
          style={inputStyle}
        ></textarea>
      );
    }
    if (type == "select") {
      return <GSSelect {...this.props}></GSSelect>;
    }
    return (
      <input
        type={type}
        pattern={pattern}
        value={
          textValue
            ? textValue
            : this.state.defaultTextValue
        }
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={this.textChanged}
        onKeyUp={this.keyUp}
        min={min || ""}
        max={max || ""}
        onWheel={this.handleWheel}
        style={style}
      />
    );
  };

  render() {
    const { leftIcon, rightIcon, style, buttonStyle, type, leftIconClick, rightIconClick } = this.props;
    return (
      <gs-input class={type} style={style}>
        {leftIcon && (
          <div className="left-icon" onClick={leftIconClick}>
            <GSButton type="secondary" buttonIcon={leftIcon} style={buttonStyle}/>
          </div>
        )}
        {this.getValue()}
        {rightIcon && (
          <div className="right-icon" onClick={rightIconClick}>
            <GSButton type="secondary" buttonIcon={rightIcon} style={buttonStyle}/>
          </div>
        )}
      </gs-input>
    );
  }
}
