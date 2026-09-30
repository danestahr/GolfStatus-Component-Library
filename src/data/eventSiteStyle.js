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
  themeOverrides: {},
  // Per-element riffs typed into Color Exploration's own Site Colors tab
  // (ColorExplorationFields.jsx's ELEMENT_DEFS) — one specific element (the
  // header logo, a section title, a sponsor tile name, ...) pointed at a
  // different role than the one it reads by default, independent of every
  // other element sharing that same role. Keyed by "mode-elementKey" (e.g.
  // "dark-headerIcon"), each a { family, step } symbolic reference just
  // like themeOverrides above, resolved by EventWebsitePage.jsx's own
  // ELEMENT_TO_CSS_VAR into a `--es-el-*` custom property that wins over
  // that element's normal `--gs-color-*` fallback.
  elementOverrides: {},
  // Per-button riffs typed into Color Exploration's Buttons tab — Fill/
  // Subtle background + text, Outline border + text, per Primary/Secondary,
  // per theme and mode. Keyed and resolved by data/eventSiteButtons.js.
  buttonOverrides: {},
  // Which variant each named Event Website button uses, picked from the
  // right-click menu on /event-site — { [buttonId]: { color, appearance } }
  // (color 'primary-color' | 'secondary-color', appearance 'fill' |
  // 'outline' | 'subtle' | 'transparent'). A button with no entry keeps the
  // variant the page gives it by default. Ids: data/eventSiteButtons.js.
  buttonStyles: {},
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
