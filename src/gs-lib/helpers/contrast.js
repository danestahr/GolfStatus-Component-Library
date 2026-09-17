// WCAG 2.1 contrast utilities — lets a component pick whichever of two
// candidate text colors (e.g. a scale's 100 vs 800 step) actually reads
// accessibly against a given background, instead of a hardcoded light/dark
// text choice. Needed once a background can be any user-picked brand color
// (see colorScale.js's generateScale) rather than a fixed palette value.

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const [R, G, B] = [r, g, b].map(srgbToLinear);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(hexA, hexB) {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AA minimum contrast ratio for normal-size text.
export const AA_TEXT_CONTRAST = 4.5;

/**
 * picks whichever of two candidate text colors contrasts better against a
 * background — e.g. pickAccessibleTextColor(scale[400], scale[100], scale[800])
 * chooses the scale's light or dark step, whichever is AA-readable on that
 * background.
 *
 * @param {string} backgroundHex the background the text sits on
 * @param {string} lightOption the lighter candidate text color
 * @param {string} darkOption the darker candidate text color
 * @return {string} whichever candidate has the higher contrast ratio
 */
export function pickAccessibleTextColor(backgroundHex, lightOption, darkOption) {
  const lightContrast = contrastRatio(backgroundHex, lightOption);
  const darkContrast = contrastRatio(backgroundHex, darkOption);
  return darkContrast >= lightContrast ? darkOption : lightOption;
}
