import { golfstatusColors } from "./Theme";

// Maps the app's Neutral scale (colors.scss's $grey-50...$grey-900, plus
// White/Black) to the step of a Primary scale (see colorScale.js's
// generateScale) that should stand in for it under "Monochromatic" —
// background/surface/outline become a shade of the brand color instead of
// plain grey. Shared between WebsiteDesignStyleFields.jsx (the editor) and
// EventWebsitePage.jsx (the live site) so the substitution can't drift
// between the two the way it already once did (Theme.js writes white as
// the 3-char "#fff", which silently failed to match a plain "#FFFFFF" key
// — normalizeHex below exists specifically so that can't happen again).
const WHITE = "#FFFFFF";
const BLACK = "#000000";

export function normalizeHex(hex) {
  if (!hex) return hex;
  const upper = hex.toUpperCase();
  return upper.length === 4
    ? "#" + [...upper.slice(1)].map(c => c + c).join("")
    : upper;
}

// Exported so callers (WebsiteDesignStyleFields.jsx's Theme Definitions
// swatches) can label a monochromatic swatch by the step it was substituted
// with (e.g. "Primary 800"), not just look it up internally here.
export const NEUTRAL_STEP_BY_HEX = {
  [normalizeHex(golfstatusColors.grey50)]: 50,
  [normalizeHex(golfstatusColors.grey100)]: 100,
  [normalizeHex(golfstatusColors.grey200)]: 200,
  [normalizeHex(golfstatusColors.grey300)]: 300,
  [normalizeHex(golfstatusColors.grey400)]: 400,
  [normalizeHex(golfstatusColors.grey500)]: 500,
  [normalizeHex(golfstatusColors.grey600)]: 600,
  [normalizeHex(golfstatusColors.grey700)]: 700,
  [normalizeHex(golfstatusColors.grey800)]: 800,
  [normalizeHex(golfstatusColors.grey900)]: 900,
  [normalizeHex(WHITE)]: 50,
  [normalizeHex(BLACK)]: 900,
};

// Looks up which Neutral step `hex` is, and returns that step of `scale`
// instead — or `hex` unchanged if it isn't a recognized Neutral value.
export function monochromatize(hex, scale) {
  const step = NEUTRAL_STEP_BY_HEX[normalizeHex(hex)];
  return step ? scale[step] : hex;
}

// Resolves a Theme Definitions swatch override — { family, step, label }
// as WebsiteDesignStyleFields.jsx's parseColorRef produces it from typed
// text like "Primary 700" — into a live hex against the CURRENT primary/
// secondary scales, never a hex frozen at the moment it was typed. That's
// the whole point: if the Primary/Secondary color picker changes later,
// every "Primary N"/"Secondary N" override keeps tracking it instead of
// going stale. Shared between the editor (WebsiteDesignStyleFields.jsx)
// and the live site (EventWebsitePage.jsx) so the two can't drift apart.
export function resolveOverrideHex(override, { primaryScale, secondaryScale }) {
  if (!override) return null;
  switch (override.family) {
    case "white":
      return WHITE;
    case "black":
      return BLACK;
    case "primary":
      return primaryScale[override.step];
    case "secondary":
      return secondaryScale[override.step];
    case "grey":
      return golfstatusColors[`grey${override.step}`];
    default:
      return null;
  }
}

// Outline Variant is pinned to this step under Monochromatic instead of
// going through monochromatize() above — its own Neutral hex differs by
// mode (grey-100 light -> would resolve to 100, grey-800 dark -> 800),
// which read as barely-there in light and too strong in dark; a fixed step
// keeps it a consistent, subtle divider color in both modes. Exported so
// WebsiteDesignStyleFields.jsx (editor) and EventWebsitePage.jsx (live
// site) apply the same override and can't drift apart.
export const OUTLINE_VARIANT_MONO_STEP = 100;
