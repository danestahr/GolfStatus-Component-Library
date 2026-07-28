import React, { Component } from "react";
import "./gs-radio-group.scss";

import GSRadioButton from "./gs-radio-button";

/**
 * A component that creates a grouping of radio buttons
 * 
 * @typedef Properties
 * 
 * @type {object}
 * 
 * @property {boolean} isLtr :use horizontal layout for group
 * 
 * @property {Array} options :Array of options to be displayed as radio buttons
 * 
 * @property {function} selectionChanged  :function to run when a button is selected
 * 
 * @property {object} style style for the component
 *
 * @param {Properties} props isLtr, options, selectionChanged, style
 */

class GSRadioGroup extends Component {
  render() {
    const {isLtr, options, selectionChanged, selectedOption, style} = this.props
    return (
      <gs-radio-group class={isLtr ? "is-ltr" : ""} style={style}>
        {options.map((option, index) => (
          <GSRadioButton
            key={index}
            {...option}
            selectedOption={selectedOption}
            onClick={() => {
              selectionChanged?.(option);
            }}
          ></GSRadioButton>
        ))}
      </gs-radio-group>
    );
  }
}

export default GSRadioGroup;
