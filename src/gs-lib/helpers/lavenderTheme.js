export const lavenderTheme = {
  primary: {
    light: {
      color: "#B57EDC", // soft lavender
    },
    dark: {
      color: "#E8DAEF", // light pastel lavender
    },
  },
  secondary: {
    light: {
      color: "#8E44AD", // deeper lavender; matches secondaryContainer, clears AA as text
    },
    dark: {
      color: "#D2B4DE",
    },
  },
  primaryContainer: {
    light: {
      backgroundColor: "#B57EDC",
      color: "#331C3B", // deep plum ink - #512E5F only reaches 3.66 on this bg
    },
    dark: {
      backgroundColor: "#E8DAEF",
      color: "#512E5F",
    },
  },
  secondaryContainer: {
    light: {
      backgroundColor: "#8E44AD", // deepened for AA text contrast
      color: "#FFFFFF",
    },
    dark: {
      backgroundColor: "#D2B4DE", // pale in dark, matching primaryContainer's flip
      color: "#512E5F",
    },
  },
  secondaryContainerHigh: {
    light: {
      backgroundColor: "#7D3C98", // deeper than secondaryContainer = higher emphasis
      color: "#FFFFFF",
    },
    dark: {
      backgroundColor: "#E8DAEF",
      color: "#512E5F",
    },
  },
  background: {
    light: {
      backgroundColor: "#F5EEF8",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#1F1026",
      color: "#E8DAEF",
    },
  },
  surface: {
    light: {
      backgroundColor: "#FFFFFF",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#341C3E",
      color: "#E8DAEF",
    },
  },
  surfaceDim: {
    light: {
      backgroundColor: "#EAD1F5",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#291631", // genuinely dimmer than surface
      color: "#EAD1F5",
    },
  },
  surfaceBright: {
    light: {
      backgroundColor: "#FDF2FF",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#462654",
      color: "#E8DAEF",
    },
  },
  surfaceVariant: {
    light: {
      backgroundColor: "#E8DAEF",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#532F63",
      color: "#E8DAEF",
    },
  },
  // not a defaultTheme token, but the app nav styles from it (golfstatus-apis.jsx).
  // dark value sits at/below `background` so the panel never reads lighter than the page
  surfaceContainer: {
    light: {
      backgroundColor: "#FFFFFF",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#160B1B",
      color: "#E8DAEF",
    },
  },
  // container elevation ramp: Lowest -> Low -> (surface) -> High -> Higest
  surfaceContainerLowest: {
    light: {
      backgroundColor: "#FFFFFF",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#160B1B",
      color: "#E8DAEF",
    },
  },
  surfaceContainerLow: {
    light: {
      backgroundColor: "#FBF6FD",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#1F1026",
      color: "#E8DAEF",
    },
  },
  surfaceContainerHigh: {
    light: {
      backgroundColor: "#F0E4F6",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#3D2249",
      color: "#E8DAEF",
    },
  },
  // note: library spells this token "Higest" (single h) - must match to override
  surfaceContainerHigest: {
    light: {
      backgroundColor: "#EAD1F5",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#462654",
      color: "#E8DAEF",
    },
  },
  outline: {
    light: {
      borderColor: "#8E44AD", // deepened to clear 3:1 on the tinted surfaces
    },
    dark: {
      borderColor: "#D2B4DE",
    },
  },
  outlineVariant: {
    light: {
      borderColor: "#DCC8E8", // subtle divider, intentionally low contrast
    },
    dark: {
      borderColor: "#532F63",
    },
  },
  scrim: {
    light: {
      backgroundColor: "#000000", // neutral by design - tinting a scrim skews content behind it
      color: "#FFFFFF",
    },
    dark: {
      backgroundColor: "#000000",
      color: "#FFFFFF",
    },
  },
  error: {
    light: {
      color: "#C0392B",
    },
    dark: {
      color: "#F5B7B1",
    },
  },
  errorContainer: {
    light: {
      backgroundColor: "#F5B7B1",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#C0392B",
      color: "#FDF2FF",
    },
  },
  tertiary: {
    light: {
      color: "#D7BDE2", // soft plum
    },
    dark: {
      color: "#F5EEF8",
    },
  },
  tertiaryContainer: {
    light: {
      backgroundColor: "#F5EEF8",
      color: "#512E5F",
    },
    dark: {
      backgroundColor: "#D7BDE2",
      color: "#512E5F",
    },
  },
};
