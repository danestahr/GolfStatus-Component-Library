import { winterTheme } from "./winterTheme";
import { lavenderTheme } from "./lavenderTheme";

// Preset color themes users can switch between with a "change theme"
// action. Each preset overrides the same role tokens defaultTheme defines,
// keyed by light/dark mode. This is the single source of truth for
// Winter/Lavender — both "GolfStatus Event Website" (src/hooks/themeHooks.jsx,
// via golfstatus_react_components) and this prototype's EventWebsitePage.jsx
// (via gs-lib/styles/theme.scss's .gs-theme-winter/.gs-theme-lavender
// classes) derive their actual colors from here, so the two can't drift out
// of sync the way they had before 2026-09-16.
//
// winterTheme/lavenderTheme (in their own files alongside this one) are
// full role-by-role palettes — not just an accent-color swap like the
// original version of this file — sourced from
// ~/Downloads/{winter,lavender}Theme.js on 2026-09-16 and dropped in here
// as-is so they can keep being edited/expanded in place.
export const colorThemes = {
  default: {
    name: "GolfStatus",
    overrides: {},
  },
  winter: {
    name: "Winter",
    overrides: winterTheme,
  },
  lavender: {
    name: "Lavender",
    overrides: lavenderTheme,
  },
};

export const colorThemeKeys = Object.keys(colorThemes);
