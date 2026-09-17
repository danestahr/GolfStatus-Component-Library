export const winterTheme = {
  primary: {
    light: {
      color: "#5DADE2", // icy blue
    },
    dark: {
      color: "#AED6F1", // frosty light blue
    },
  },
  secondary: {
    light: {
      color: "#20699A", // deep winter blue; matches secondaryContainer, clears AA as text
    },
    dark: {
      color: "#85C1E9",
    },
  },
  primaryContainer: {
    light: {
      backgroundColor: "#5DADE2",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#AED6F1",
      color: "#1B2631",
    },
  },
  secondaryContainer: {
    light: {
      backgroundColor: "#20699A", // deepened for AA text contrast
      color: "#FFFFFF",
    },
    dark: {
      backgroundColor: "#85C1E9",
      color: "#1B2631",
    },
  },
  secondaryContainerHigh: {
    light: {
      backgroundColor: "#1D5E8C", // deeper than secondaryContainer = higher emphasis
      color: "#FFFFFF",
    },
    dark: {
      backgroundColor: "#AED6F1",
      color: "#1B2631",
    },
  },
  background: {
    light: {
      backgroundColor: "#EBF5FB",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#17202A",
      color: "#AED6F1",
    },
  },
  surface: {
    light: {
      backgroundColor: "#FFFFFF",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#1C2833",
      color: "#AED6F1",
    },
  },
  surfaceDim: {
    light: {
      backgroundColor: "#D6EAF8",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#1C2833",
      color: "#D6EAF8",
    },
  },
  surfaceBright: {
    light: {
      backgroundColor: "#F0F8FF",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#2E4053",
      color: "#AED6F1",
    },
  },
  surfaceVariant: {
    light: {
      backgroundColor: "#D4E6F1",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#34495E",
      color: "#D4E6F1",
    },
  },
   // nav panel styles from this token; dark value sits at/below `background`
   // so the panel never reads lighter than the page
   surfaceContainer: {
    light: {
      backgroundColor: "#FFFFFF",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#10171F",
      color: "#AED6F1",
    },
  },
  // container elevation ramp: Lowest -> Low -> (surface) -> High -> Higest
  surfaceContainerLowest: {
    light: {
      backgroundColor: "#FFFFFF",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#10171F",
      color: "#AED6F1",
    },
  },
  surfaceContainerLow: {
    light: {
      backgroundColor: "#F7FBFE",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#17202A",
      color: "#AED6F1",
    },
  },
  surfaceContainerHigh: {
    light: {
      backgroundColor: "#E3F0FA",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#22303D",
      color: "#AED6F1",
    },
  },
  // note: library spells this token "Higest" (single h) - must match to override
  surfaceContainerHigest: {
    light: {
      backgroundColor: "#D6EAF8",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#2E4053",
      color: "#AED6F1",
    },
  },
  outline: {
    light: {
      borderColor: "#2980B9",
    },
    dark: {
      borderColor: "#AED6F1",
    },
  },
  outlineVariant: {
    light: {
      borderColor: "#BBD9EC", // subtle divider, intentionally low contrast
    },
    dark: {
      borderColor: "#34495E",
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
      color: "#E74C3C",
    },
    dark: {
      color: "#FADBD8",
    },
  },
  errorContainer: {
    light: {
      backgroundColor: "#FADBD8",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#C0392B",
      color: "#EBF5FB",
    },
  },
  tertiary: {
    light: {
      color: "#7FB3D5", // soft steel blue
    },
    dark: {
      color: "#D6EAF8",
    },
  },
  tertiaryContainer: {
    light: {
      backgroundColor: "#D6EAF8",
      color: "#1B2631",
    },
    dark: {
      backgroundColor: "#7FB3D5",
      color: "#1B2631",
    },
  },
};
