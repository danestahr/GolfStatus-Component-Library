import React, { Component } from "react";
import "./gs-button.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * GolfStatus styled button 
 * 
 * @typedef Properties
 * 
 * @type {object}
 * 
 * @property {object} buttonIcon the fontawesome icon on the left side of the button
 * 
 * @property {object} rightIcon the font awesome icon on the right side of the button
 * 
 * @property {string} title  text for the button
 * 
 * @property {string} type type of button
 * 
 * @property {function} onClick click function
 * 
 * @property {Boolean} isPill add the pill border radius to the buton
 * 
 * @property {string} size size of the button [primary, secondary]
 *
 * @property {Boolean} isDisabled button is disabled
 *
 * @property {Boolean} isFocusable button is focusable
 *
 * @property {object} style style for the component
 *
 * @property {string} color which brand color the button reads from [primary-color, secondary-color] —
 *  combines with appearance for the Event Website's Primary/Secondary Fill/Outline/Subtle variants
 *
 * @property {string} appearance how color is applied [fill, outline, subtle]. Not named
 *  "buttonStyle" — that name is already taken elsewhere (GSInput, GSActionBar, GSEmptyList)
 *  to mean "a CSS style object for this button", a different thing entirely.
 *
 *
 * @param {Properties} props buttonIcon,
      rightIcon,
      title,
      type,
      onClick,
      isPill,
      size,
      isDisabled,
      isFocusable,
      style,
      color,
      appearance
 */

export default class GSButton extends Component {
  enterKeyPressed = e => {
    if (this.props.isDisabled) return;
    if (e.key === "Enter") {
      this.props?.onClick?.();
    }
  };
  render() {
    const {
      buttonIcon,
      rightIcon,
      title,
      type,
      onClick,
      isPill,
      size,
      isDisabled,
      isFocusable,
      iconStyle,
      style,
      titleStyle,
      hoverType,
      color,
      appearance
    } = this.props;

    const buttonSize = size === "secondary" || isPill ? "secondary" : "primary";
    const pillCss = isPill ? "pill" : "";
    const disabled = isDisabled ? "disabled" : "enabled";
    // Prefixed so "outline" here can never collide with hoverType's own
    // "outline" class (the default hover box-shadow ring), which every
    // button already carries regardless of appearance.
    const colorCss = color ? `color-${color}` : "";
    const appearanceCss = appearance ? `style-${appearance}` : "";

    return (
      <gs-button
        style={style}
        tabIndex={isFocusable ? (isDisabled ? -1 : 0) : -1}
        onKeyDown={this.enterKeyPressed}
        onClick={
          isDisabled
            ? e => {
                e.stopPropagation();
                return null;
              }
            : onClick
        }
        class={`${type} ${disabled} ${pillCss} ${buttonSize} ${hoverType ?? 'outline'} ${colorCss} ${appearanceCss}`}
      >
        {buttonIcon && (
          <div className={`button-icon left`}>
            <FontAwesomeIcon icon={buttonIcon} style={iconStyle}></FontAwesomeIcon>
          </div>
        )}
        {title && <div style={{...titleStyle}} className={`button-title`}>{title}</div>}
        {rightIcon && (
          <div className={`button-icon right`}>
            <FontAwesomeIcon icon={rightIcon} style={iconStyle}></FontAwesomeIcon>
          </div>
        )}
      </gs-button>
    );
  }
}
