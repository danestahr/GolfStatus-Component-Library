import { grey500 } from '../gs-lib/helpers/Theme'

// Theme.js's own green500 ("#FFAB22") and green300 ("#FFC54C") are actually
// orange — confirmed against the design team's Figma export, which gives
// green500 as "#59C56F" instead. Using the real Theme.js green500 here
// would make the Secondary scale render orange, so this stands in as the
// default (the confirmed Figma value) until Theme.js itself is fixed.
export const GREEN_500_FALLBACK = '#59C56F'

export const DEFAULT_EVENT_SITE_STYLE = {
  primaryColor: grey500,
  secondaryColor: GREEN_500_FALLBACK,
  // Which scale the Neutral section's white-to-black reference ramp is
  // tinted with — 'neutral' (the app's own fixed grey), 'primary', or
  // 'secondary' (WebsiteDesignStyleFields.jsx's NeutralSection). Read by
  // EventWebsitePage.jsx to decide both whether its own Monochromatic
  // toggle starts on and which scale it substitutes into the Neutral
  // theme roles.
  neutralTint: 'neutral',
  // Per-swatch riffs typed into the GolfStatus (default) theme's Theme
  // Definitions row (WebsiteDesignStyleFields.jsx's wds-swatch-hex-input) —
  // keyed by "mode-monochromatic-role" (e.g. "dark-true-background"), each
  // a { family, step, label } symbolic reference (see monochromatic.js's
  // resolveOverrideHex) rather than a frozen hex, so a "Primary 700"
  // override keeps tracking primaryColor below if it's edited again later.
  // Only the default theme's roles are ever keyed here — any other preset
  // isn't derived from this style, so its own Theme Definitions edits
  // stay local-preview-only, never saved here.
  themeOverrides: {
    'dark-full-onBackground': {family: 'white'},
    'dark-full-onSurface': {family: 'secondary', step: 50},
    'dark-full-outline': {family: 'secondary', step: 800},
    'dark-full-outlineVariant': {family: 'primary', step: 800},
    'dark-full-surfaceContainerHigh': {family: 'secondary', step: 800},
    'dark-golfstatus-surface': {family: 'grey', step: 800},
    'dark-neutral-onBackground': {family: 'white'},
    'dark-neutral-onSurface': {family: 'white'},
    'dark-neutral-onSurfaceVariant': {family: 'white'},
    'dark-neutral-outline': {family: 'grey', step: 800},
    'dark-neutral-surfaceContainerLow': {family: 'grey', step: 800},
    'dark-primary-onBackground': {family: 'white'},
    'dark-primary-outline': {family: 'primary', step: 100},
    'dark-primary-outlineVariant': {family: 'primary', step: 800},
    'light-full-onSurface': {family: 'secondary', step: 800},
    'light-full-outline': {family: 'secondary', step: 100},
    'light-full-surfaceContainerHigh': {family: 'secondary', step: 50},
    'light-full-surfaceContainerLow': {family: 'white'},
    'light-golfstatus-outline': {family: 'grey', step: 200},
    'light-golfstatus-surface': {family: 'grey', step: 50},
    'light-neutral-onBackground': {family: 'grey', step: 800},
    'light-neutral-onSurface': {family: 'grey', step: 800},
    'light-neutral-onSurfaceVariant': {family: 'grey', step: 800},
    'light-neutral-outline': {family: 'grey', step: 200},
    'light-neutral-surface': {family: 'grey', step: 50},
  },
  // Per-element riffs typed into Color Exploration's own Site Colors tab
  // (ColorExplorationFields.jsx's ELEMENT_DEFS) — one specific element (the
  // header logo, a section title, a sponsor tile name, ...) pointed at a
  // different role than the one it reads by default, independent of every
  // other element sharing that same role. Keyed by "mode-elementKey" (e.g.
  // "dark-headerIcon"), each a { family, step } symbolic reference just
  // like themeOverrides above, resolved by EventWebsitePage.jsx's own
  // ELEMENT_TO_CSS_VAR into a `--es-el-*` custom property that wins over
  // that element's normal `--gs-color-*` fallback.
  elementOverrides: {
    'dark-full-additionalPagesSub': {role: 'onSurface'},
    'dark-full-arrowTileArrow': {role: 'onSurface'},
    'dark-full-arrowTileBackground': {role: 'surfaceContainerLow'},
    'dark-full-donationTileBackground': {role: 'surfaceContainerLow'},
    'dark-full-imageFrameBorder': {role: 'outline'},
    'dark-full-sectionBoxBackground': {role: 'surface'},
    'dark-full-tournamentEventName': {role: 'onBackground'},
    'dark-golfstatus-additionalPagesSub': {role: 'onSurface'},
    'dark-golfstatus-arrowTileArrow': {role: 'onSurface'},
    'dark-golfstatus-arrowTileBackground': {role: 'surfaceContainerLow'},
    'dark-golfstatus-donationTileBackground': {role: 'surfaceContainerLow'},
    'dark-golfstatus-imageFrameBorder': {role: 'outline'},
    'dark-golfstatus-sectionBoxBackground': {role: 'surface'},
    'dark-golfstatus-tournamentEventName': {role: 'onBackground'},
    'dark-neutral-additionalPagesSub': {role: 'onSurface'},
    'dark-neutral-arrowTileArrow': {role: 'onSurface'},
    'dark-neutral-arrowTileBackground': {role: 'surfaceContainerLow'},
    'dark-neutral-donationTileBackground': {role: 'surfaceContainerLow'},
    'dark-neutral-imageFrameBorder': {role: 'outline'},
    'dark-neutral-sectionBoxBackground': {role: 'surface'},
    'dark-neutral-tournamentEventName': {role: 'onBackground'},
    'dark-primary-additionalPagesSub': {role: 'onSurface'},
    'dark-primary-arrowTileArrow': {role: 'onSurface'},
    'dark-primary-arrowTileBackground': {role: 'surfaceContainerLow'},
    'dark-primary-donationTileBackground': {role: 'surfaceContainerLow'},
    'dark-primary-imageFrameBorder': {role: 'outline'},
    'dark-primary-sectionBoxBackground': {role: 'surface'},
    'dark-primary-tournamentEventName': {role: 'onBackground'},
    'dark-secondary-additionalPagesSub': {role: 'onSurface'},
    'dark-secondary-arrowTileArrow': {role: 'onSurface'},
    'dark-secondary-arrowTileBackground': {role: 'surfaceContainerLow'},
    'dark-secondary-donationTileBackground': {role: 'surfaceContainerLow'},
    'dark-secondary-imageFrameBorder': {role: 'outline'},
    'dark-secondary-sectionBoxBackground': {role: 'surface'},
    'dark-secondary-tournamentEventName': {role: 'onBackground'},
    'light-full-additionalPagesSub': {role: 'onSurface'},
    'light-full-arrowTileArrow': {role: 'onSurface'},
    'light-full-arrowTileBackground': {role: 'surfaceContainerLow'},
    'light-full-donationTileBackground': {role: 'surfaceContainerLow'},
    'light-full-imageFrameBorder': {role: 'outline'},
    'light-full-sectionBoxBackground': {role: 'surface'},
    'light-full-tournamentEventName': {role: 'onBackground'},
    'light-golfstatus-additionalPagesSub': {role: 'onSurface'},
    'light-golfstatus-arrowTileArrow': {role: 'onSurface'},
    'light-golfstatus-arrowTileBackground': {role: 'surfaceContainerLow'},
    'light-golfstatus-donationTileBackground': {role: 'surfaceContainerLow'},
    'light-golfstatus-imageFrameBorder': {role: 'outline'},
    'light-golfstatus-sectionBoxBackground': {role: 'surface'},
    'light-golfstatus-tournamentEventName': {role: 'onBackground'},
    'light-neutral-additionalPagesSub': {role: 'onSurface'},
    'light-neutral-arrowTileArrow': {role: 'onSurface'},
    'light-neutral-arrowTileBackground': {role: 'surfaceContainerLow'},
    'light-neutral-donationTileBackground': {role: 'surfaceContainerLow'},
    'light-neutral-imageFrameBorder': {role: 'outline'},
    'light-neutral-sectionBoxBackground': {role: 'surface'},
    'light-neutral-tournamentEventName': {role: 'onBackground'},
    'light-primary-additionalPagesSub': {role: 'onSurface'},
    'light-primary-arrowTileArrow': {role: 'onSurface'},
    'light-primary-arrowTileBackground': {role: 'surfaceContainerLow'},
    'light-primary-donationTileBackground': {role: 'surfaceContainerLow'},
    'light-primary-imageFrameBorder': {role: 'outline'},
    'light-primary-sectionBoxBackground': {role: 'surface'},
    'light-primary-tournamentEventName': {role: 'onBackground'},
    'light-secondary-additionalPagesSub': {role: 'onSurface'},
    'light-secondary-arrowTileArrow': {role: 'onSurface'},
    'light-secondary-arrowTileBackground': {role: 'surfaceContainerLow'},
    'light-secondary-donationTileBackground': {role: 'surfaceContainerLow'},
    'light-secondary-imageFrameBorder': {role: 'outline'},
    'light-secondary-sectionBoxBackground': {role: 'surface'},
    'light-secondary-tournamentEventName': {role: 'onBackground'},
  },
  // Per-button riffs typed into Color Exploration's Buttons tab — Fill/
  // Subtle background + text, Outline border + text, per Primary/Secondary,
  // per theme and mode. Keyed and resolved by data/eventSiteButtons.js.
  buttonOverrides: {
    'dark-golfstatus-primary-fill-bg': {family: 'white'},
    'dark-golfstatus-primary-fill-text': {family: 'black'},
    'dark-golfstatus-primary-outline-border': {family: 'white'},
    'dark-golfstatus-primary-outline-text': {family: 'white'},
    'dark-golfstatus-primary-subtle-bg': {family: 'grey', step: 800},
    'dark-golfstatus-primary-subtle-text': {family: 'white'},
    'dark-golfstatus-secondary-fill-bg': {family: 'white'},
    'dark-golfstatus-secondary-fill-text': {family: 'grey', step: 800},
    'dark-golfstatus-secondary-outline-border': {family: 'white'},
    'dark-golfstatus-secondary-outline-text': {family: 'white'},
    'dark-golfstatus-secondary-subtle-bg': {family: 'grey', step: 800},
    'dark-golfstatus-secondary-subtle-text': {family: 'white'},
    'dark-golfstatus-secondary-transparent-text': {family: 'white'},
    'light-golfstatus-primary-fill-bg': {family: 'grey', step: 800},
    'light-golfstatus-primary-fill-text': {family: 'white'},
    'light-golfstatus-primary-outline-border': {family: 'grey', step: 800},
    'light-golfstatus-primary-outline-text': {family: 'grey', step: 800},
    'light-golfstatus-primary-subtle-bg': {family: 'grey', step: 100},
    'light-golfstatus-primary-subtle-text': {family: 'grey', step: 800},
    'light-golfstatus-secondary-fill-bg': {family: 'grey', step: 800},
    'light-golfstatus-secondary-fill-text': {family: 'white'},
    'light-golfstatus-secondary-outline-border': {family: 'grey', step: 800},
    'light-golfstatus-secondary-outline-text': {family: 'grey', step: 800},
    'light-golfstatus-secondary-subtle-bg': {family: 'grey', step: 100},
    'light-golfstatus-secondary-subtle-text': {family: 'grey', step: 800},
    'light-golfstatus-secondary-transparent-text': {family: 'grey', step: 800},
  },
  // Which variant each named Event Website button uses, picked from the
  // right-click menu on /event-site — { [buttonId]: { color, appearance } }
  // (color 'primary-color' | 'secondary-color', appearance 'fill' |
  // 'outline' | 'subtle' | 'transparent'). A button with no entry keeps the
  // variant the page gives it by default. Ids: data/eventSiteButtons.js.
  buttonStyles: {
    'donateNow': {color: 'primary-color', appearance: 'fill'},
    'makeDonation': {color: 'primary-color', appearance: 'outline'},
    'sponsorWebsite': {color: 'primary-color', appearance: 'transparent'},
  },
}

// No backend for this prototype, so "Save" on the Website Design and Style
// screen (EventSitePackagesListPage.jsx) persists here instead — this is
// what lets a saved style survive navigating away to /event-site
// (EventWebsitePage.jsx), which reads it back on mount, and survive a
// page reload too.
const STORAGE_KEY = 'gs-event-site-style'

export function loadEventSiteStyle() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_EVENT_SITE_STYLE, ...JSON.parse(raw) } : DEFAULT_EVENT_SITE_STYLE
  } catch {
    return DEFAULT_EVENT_SITE_STYLE
  }
}

// Whether an admin has ever actually hit "Save" on the Website Design and
// Style screen — distinct from loadEventSiteStyle() above, which always
// hands back a usable style object (DEFAULT_EVENT_SITE_STYLE's own grey/
// green placeholder values when nothing's saved yet). EventWebsitePage.jsx
// reads this to decide whether /event-site should build its theme from
// that style at all: a tournament that's never been customized has no
// saved style to reflect, so it renders GolfStatus's own fixed brand
// colors (theme.scss's `.gs-theme-default`) instead of this placeholder
// starting point, exactly like a non-premium tournament already does (see
// `customThemeStyle`).
export function hasEventSiteStyle() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

// Fires whenever ANOTHER tab saves the style (the browser's `storage` event
// never fires in the tab that wrote it) — how /event-site's right-click menu
// and Color Exploration stay in sync when they're open side by side. The
// callback gets the freshly loaded style.
export function subscribeEventSiteStyle(callback) {
  const onStorage = e => {
    if (e.key === STORAGE_KEY) callback(loadEventSiteStyle())
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export function saveEventSiteStyle(style) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(style))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the style won't survive this session, not a real failure.
  }
}
