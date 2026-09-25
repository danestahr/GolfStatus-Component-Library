// Preset color themes users can switch between with a "change theme"
// action. Each preset overrides the same role tokens defaultTheme defines,
// keyed by light/dark mode.
export const colorThemes = {
  default: {
    name: "GolfStatus",
    overrides: {},
  },
};

export const colorThemeKeys = Object.keys(colorThemes);
