/**
 * use the theming engine
 *
 * @typedef style
 * @type {object}
 * @property {object} light
 * @property {object} dark
 *
 * @typedef theme
 * @type {object}
 * @property {style} primary
 * @property {style} secondary
 * @property {style} primaryContainer
 * @property {style} secondaryContainer
 * @property {style} background
 * @property {style} surface
 * @property {style} surfaceDim
 * @property {style} surfaceLight
 * @property {style} surfaceContainer
 * @property {style} surfaceContainerLow
 * @property {style} surfaceContainerLowest
 * @property {style} surfaceContainerHigh
 * @property {style} surfaceContainerHighest
 * @property {style} surfaceVariant
 * @property {style} outline
 * @property {style} outlineVariant
 * @property {style} scrim
 * @property {style} error
 * @property {style} errorContainer
 * @property {style} tertiary
 * @property {style} tertiaryContainer
 *
 * @return {[theme, theme, getThemeStyle: object]}
 */

import { addAlphaChannel, defaultTheme, invertSyle, mergedTheme } from "../helpers/Theme";

export const useTheme = (customTheme = {}, currentMode = {}) => {
  const getThemeStyle = (style, invert, foregroundAlpha, backgroundAlpha) => {
    if (invert) {
      return addTransparency(
        invertSyle(style?.[currentMode]),
        foregroundAlpha,
        backgroundAlpha,
      );
    }
    return addTransparency(
      style?.[currentMode],
      foregroundAlpha,
      backgroundAlpha,
    );
  };
  return [defaultTheme, mergedTheme(customTheme), getThemeStyle, currentMode];
};


/**
 * adds alpha channel to background and foreground
 *
 * @param {object} style the style definition that you want to invert
 * @param {object} foregroundAlpha value of color alpha channel
 * @param {object} backgroundAlpha value of background color alpha channel
 * @return {object} a style definition with that gradient as a background
 */
export const addTransparency = (style, foregroundAlpha, backgroundAlpha) => {
  if (foregroundAlpha && backgroundAlpha) {
    return {
      color: addAlphaChannel(style?.color, foregroundAlpha),
      backgroundColor: addAlphaChannel(style?.backgroundColor, backgroundAlpha),
    };
  }
  return style;
};