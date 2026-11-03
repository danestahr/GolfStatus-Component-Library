import { canonicalRoleKey, CUSTOMIZABLE_STORAGE_KEYS } from './eventSiteThemeRoles.js'


// Theme.js's own green500 ("#FFAB22") and green300 ("#FFC54C") are actually
// orange — confirmed against the design team's Figma export, which gives
// green500 as "#59C56F" instead. Using the real Theme.js green500 here
// would make the Secondary scale render orange, so this stands in as the
// default (the confirmed Figma value) until Theme.js itself is fixed.
export const GREEN_500_FALLBACK = '#59C56F'

export const DEFAULT_EVENT_SITE_STYLE = {
  primaryColor: '#C0392B',
  secondaryColor: '#2A9BA3',
  // Which scale the Neutral section's white-to-black reference ramp is
  // tinted with — 'neutral' (the app's own fixed grey), 'primary', or
  // 'secondary' (WebsiteDesignStyleFields.jsx's NeutralSection). Read by
  // EventWebsitePage.jsx to decide both whether its own Monochromatic
  // toggle starts on and which scale it substitutes into the Neutral
  // theme roles.
  neutralTint: 'golfstatus',
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
    'dark-full-menuContainer': {family: 'primary', step: 600},
    'dark-full-onBackground': {family: 'secondary', step: 50},
    'dark-full-onMenuContainer': {family: 'white'},
    'dark-full-onPrimaryContainer': {family: 'primary', step: 900},
    'dark-full-onPrimaryContainerHigh': {family: 'primary', step: 100},
    'dark-full-onSecondaryContainer': {family: 'secondary', step: 800},
    'dark-full-onSecondaryContainerHigh': {family: 'secondary', step: 100},
    'dark-full-onSurface': {family: 'secondary', step: 50},
    'dark-full-onSurfaceContainerHigh': {family: 'secondary', step: 50},
    'dark-full-onSurfaceVariant': {family: 'white'},
    'dark-full-outline': {family: 'secondary', step: 700},
    'dark-full-outlineVariant': {family: 'secondary', step: 200},
    'dark-full-primaryContainer': {family: 'primary', step: 200},
    'dark-full-primaryContainerHigh': {family: 'primary', step: 800},
    'dark-full-secondaryContainer': {family: 'secondary', step: 200},
    'dark-full-secondaryContainerHigh': {family: 'secondary', step: 700},
    'dark-full-surfaceContainerHigh': {family: 'secondary', step: 800},
    'dark-golfstatus-background': {family: 'grey', step: 900},
    'dark-golfstatus-menuContainer': {family: 'black'},
    'dark-golfstatus-outline': {family: 'grey', step: 700},
    'dark-golfstatus-outlineVariant': {family: 'grey', step: 200},
    'dark-neutral-onBackground': {family: 'white'},
    'dark-neutral-onSurface': {family: 'white'},
    'dark-neutral-onSurfaceVariant': {family: 'white'},
    'dark-neutral-outline': {family: 'grey', step: 800},
    'dark-neutral-outlineVariant': {family: 'grey', step: 200},
    'dark-neutral-surface': {family: 'grey', step: 800},
    'dark-neutral-two-tone-background': {family: 'grey', step: 900},
    'dark-neutral-two-tone-menuContainer': {family: 'primary', step: 600},
    'dark-neutral-two-tone-onBackground': {family: 'secondary', step: 50},
    'dark-neutral-two-tone-onMenuContainer': {family: 'white'},
    'dark-neutral-two-tone-onPrimaryContainer': {family: 'grey', step: 800},
    'dark-neutral-two-tone-onPrimaryContainerHigh': {family: 'primary', step: 100},
    'dark-neutral-two-tone-onSecondaryContainer': {family: 'secondary', step: 800},
    'dark-neutral-two-tone-onSecondaryContainerHigh': {family: 'secondary', step: 100},
    'dark-neutral-two-tone-onSurface': {family: 'secondary', step: 50},
    'dark-neutral-two-tone-onSurfaceContainerHigh': {family: 'secondary', step: 50},
    'dark-neutral-two-tone-outline': {family: 'grey', step: 700},
    'dark-neutral-two-tone-outlineVariant': {family: 'grey', step: 200},
    'dark-neutral-two-tone-primaryContainer': {family: 'primary', step: 200},
    'dark-neutral-two-tone-primaryContainerHigh': {family: 'primary', step: 800},
    'dark-neutral-two-tone-secondaryContainer': {family: 'secondary', step: 200},
    'dark-neutral-two-tone-secondaryContainerHigh': {family: 'secondary', step: 700},
    'dark-primary-onBackground': {family: 'white'},
    'dark-primary-onSurfaceVariant': {family: 'white'},
    'dark-primary-outline': {family: 'primary', step: 700},
    'dark-primary-outlineVariant': {family: 'primary', step: 200},
    'dark-primary-surface': {family: 'primary', step: 800},
    'dark-primary-surfaceContainerHigh': {family: 'primary', step: 800},
    'light-full-menuContainer': {family: 'primary', step: 600},
    'light-full-onBackground': {family: 'secondary', step: 800},
    'light-full-onPrimaryContainer': {family: 'white'},
    'light-full-onPrimaryContainerHigh': {family: 'primary', step: 800},
    'light-full-onSecondaryContainer': {family: 'white'},
    'light-full-onSecondaryContainerHigh': {family: 'secondary', step: 800},
    'light-full-onSurface': {family: 'secondary', step: 800},
    'light-full-onSurfaceContainerHigh': {family: 'secondary', step: 800},
    'light-full-onSurfaceVariant': {family: 'secondary', step: 800},
    'light-full-outline': {family: 'secondary', step: 200},
    'light-full-outlineVariant': {family: 'secondary', step: 700},
    'light-full-primaryContainer': {family: 'primary', step: 500},
    'light-full-primaryContainerHigh': {family: 'primary', step: 100},
    'light-full-secondaryContainer': {family: 'secondary', step: 500},
    'light-full-secondaryContainerHigh': {family: 'secondary', step: 200},
    'light-full-surface': {family: 'white'},
    'light-full-surfaceContainerHigh': {family: 'secondary', step: 50},
    'light-full-surfaceVariant': {family: 'secondary', step: 100},
    'light-golfstatus-menuContainer': {family: 'black'},
    'light-golfstatus-outline': {family: 'grey', step: 200},
    'light-golfstatus-outlineVariant': {family: 'grey', step: 700},
    'light-neutral-onBackground': {family: 'grey', step: 800},
    'light-neutral-onSurface': {family: 'grey', step: 800},
    'light-neutral-onSurfaceVariant': {family: 'grey', step: 800},
    'light-neutral-outline': {family: 'grey', step: 200},
    'light-neutral-outlineVariant': {family: 'grey', step: 700},
    'light-neutral-surface': {family: 'grey', step: 50},
    'light-neutral-two-tone-menuContainer': {family: 'primary', step: 600},
    'light-neutral-two-tone-onBackground': {family: 'secondary', step: 800},
    'light-neutral-two-tone-onPrimaryContainer': {family: 'white'},
    'light-neutral-two-tone-onPrimaryContainerHigh': {family: 'primary', step: 800},
    'light-neutral-two-tone-onSecondaryContainer': {family: 'white'},
    'light-neutral-two-tone-onSecondaryContainerHigh': {family: 'secondary', step: 800},
    'light-neutral-two-tone-onSurface': {family: 'secondary', step: 800},
    'light-neutral-two-tone-onSurfaceContainerHigh': {family: 'secondary', step: 800},
    'light-neutral-two-tone-outline': {family: 'grey', step: 200},
    'light-neutral-two-tone-outlineVariant': {family: 'grey', step: 700},
    'light-neutral-two-tone-primaryContainer': {family: 'primary', step: 500},
    'light-neutral-two-tone-primaryContainerHigh': {family: 'primary', step: 100},
    'light-neutral-two-tone-secondaryContainer': {family: 'secondary', step: 500},
    'light-neutral-two-tone-secondaryContainerHigh': {family: 'secondary', step: 100},
    'light-primary-outline': {family: 'primary', step: 200},
    'light-primary-outlineVariant': {family: 'primary', step: 700},
    'light-primary-surface': {family: 'primary', step: 100},
    'light-primary-surfaceContainerHigh': {family: 'primary', step: 50},
    'light-primary-surfaceVariant': {family: 'primary', step: 700},
  },
  elementOverrides: {
    'light-neutral-donationProgressBorder': {role: 'outline'},
    'light-neutral-two-tone-donationProgressBorder': {role: 'outline'},
    'light-primary-donationProgressBorder': {role: 'outline'},
    'light-secondary-donationProgressBorder': {role: 'outline'},
    'light-full-donationProgressBorder': {role: 'outline'},
    'light-golfstatus-donationProgressBorder': {role: 'outline'},
    'dark-neutral-donationProgressBorder': {role: 'outline'},
    'dark-neutral-two-tone-donationProgressBorder': {role: 'outline'},
    'dark-primary-donationProgressBorder': {role: 'outline'},
    'dark-secondary-donationProgressBorder': {role: 'outline'},
    'dark-full-donationProgressBorder': {role: 'outline'},
    'dark-golfstatus-donationProgressBorder': {role: 'outline'},
    'light-neutral-donationProgressTrack': {role: 'surface'},
    'light-neutral-two-tone-donationProgressTrack': {role: 'surface'},
    'light-primary-donationProgressTrack': {role: 'surface'},
    'light-secondary-donationProgressTrack': {role: 'surface'},
    'light-full-donationProgressTrack': {role: 'surface'},
    'light-golfstatus-donationProgressTrack': {role: 'surface'},
    'dark-neutral-donationProgressTrack': {role: 'surface'},
    'dark-neutral-two-tone-donationProgressTrack': {role: 'surface'},
    'dark-primary-donationProgressTrack': {role: 'surface'},
    'dark-secondary-donationProgressTrack': {role: 'surface'},
    'dark-full-donationProgressTrack': {role: 'surface'},
    'dark-golfstatus-donationProgressTrack': {role: 'surface'},
    'light-neutral-sectionBottomBorder': {role: 'outline'},
    'light-neutral-two-tone-sectionBottomBorder': {role: 'outline'},
    'light-primary-sectionBottomBorder': {role: 'outline'},
    'light-secondary-sectionBottomBorder': {role: 'outline'},
    'light-full-sectionBottomBorder': {role: 'outline'},
    'light-golfstatus-sectionBottomBorder': {role: 'outline'},
    'dark-neutral-sectionBottomBorder': {role: 'outline'},
    'dark-neutral-two-tone-sectionBottomBorder': {role: 'outline'},
    'dark-primary-sectionBottomBorder': {role: 'outline'},
    'dark-secondary-sectionBottomBorder': {role: 'outline'},
    'dark-full-sectionBottomBorder': {role: 'outline'},
    'dark-golfstatus-sectionBottomBorder': {role: 'outline'},
    'light-neutral-sidebarBorder': {role: 'outline'},
    'light-neutral-two-tone-sidebarBorder': {role: 'outline'},
    'light-primary-sidebarBorder': {role: 'outline'},
    'light-secondary-sidebarBorder': {role: 'outline'},
    'light-full-sidebarBorder': {role: 'outline'},
    'light-golfstatus-sidebarBorder': {role: 'outline'},
    'dark-neutral-sidebarBorder': {role: 'outline'},
    'dark-neutral-two-tone-sidebarBorder': {role: 'outline'},
    'dark-primary-sidebarBorder': {role: 'outline'},
    'dark-secondary-sidebarBorder': {role: 'outline'},
    'dark-full-sidebarBorder': {role: 'outline'},
    'dark-golfstatus-sidebarBorder': {role: 'outline'},
    'light-neutral-imageFrameBorder': {role: 'outline'},
    'light-neutral-two-tone-imageFrameBorder': {role: 'outline'},
    'light-primary-imageFrameBorder': {role: 'outline'},
    'light-secondary-imageFrameBorder': {role: 'outline'},
    'light-full-imageFrameBorder': {role: 'outline'},
    'light-golfstatus-imageFrameBorder': {role: 'outline'},
    'dark-neutral-imageFrameBorder': {role: 'outline'},
    'dark-neutral-two-tone-imageFrameBorder': {role: 'outline'},
    'dark-primary-imageFrameBorder': {role: 'outline'},
    'dark-secondary-imageFrameBorder': {role: 'outline'},
    'dark-full-imageFrameBorder': {role: 'outline'},
    'dark-golfstatus-imageFrameBorder': {role: 'outline'},
  },
  buttonOverrides: {
  },
  buttonStyles: {
    'neutral-makeDonation': {color: 'primary-color', appearance: 'outline'},
    'neutral-two-tone-makeDonation': {color: 'primary-color', appearance: 'outline'},
    'primary-makeDonation': {color: 'primary-color', appearance: 'outline'},
    'secondary-makeDonation': {color: 'primary-color', appearance: 'outline'},
    'full-makeDonation': {color: 'primary-color', appearance: 'outline'},
    'golfstatus-makeDonation': {color: 'primary-color', appearance: 'outline'},
    'neutral-donateNow': {color: 'primary-color', appearance: 'fill'},
    'neutral-two-tone-donateNow': {color: 'primary-color', appearance: 'fill'},
    'primary-donateNow': {color: 'primary-color', appearance: 'fill'},
    'secondary-donateNow': {color: 'primary-color', appearance: 'fill'},
    'full-donateNow': {color: 'primary-color', appearance: 'fill'},
    'golfstatus-donateNow': {color: 'primary-color', appearance: 'fill'},
  },
}

// No backend for this prototype, so "Save" on the Website Design and Style
// screen (EventSitePackagesListPage.jsx) persists here instead — this is
// what lets a saved style survive navigating away to /event-site
// (EventWebsitePage.jsx), which reads it back on mount, and survive a
// page reload too.
const STORAGE_KEY = 'gs-event-site-style'

// Designations were cut down to exactly Theme.js's `defaultTheme` (see
// eventSiteThemeRoles.js). Styles saved before that still carry the old On X /
// *Variant roles, so they're brought forward on load:
//   - Theme overrides saved under the old text keys (onPrimary/onSecondary)
//     move to the text rows of the designations that own them; overrides for
//     designations that no longer exist (the *Variant containers, Placeholder)
//     are dropped.
//   - Element/button designations like `onSurfaceVariant` become the
//     designation they're the text of (`surfaceVariant`) — the element reads
//     that designation's text color. Any that have no equivalent are left as
//     they are and render pink until a new designation is picked.
const THEME_OVERRIDE_RENAMES = { onPrimary: 'onPrimaryContainer', onSecondary: 'onSecondaryContainer' }
const REMOVED_THEME_ROLES = new Set([
  'primaryContainerVariant', 'onPrimaryContainerVariant', 'secondaryContainerVariant', 'onSecondaryContainerVariant', 'placeholder',
])

function migrateRoleRefs(overrides) {
  if (!overrides) return overrides
  return Object.fromEntries(Object.entries(overrides).map(([key, value]) => {
    const canonical = value?.role ? canonicalRoleKey(value.role) : null
    return [key, canonical && canonical !== value.role ? { ...value, role: canonical } : value]
  }))
}

export function migrateEventSiteStyle(style) {
  const themeOverrides = Object.fromEntries(
    Object.entries(style.themeOverrides ?? {}).flatMap(([key, value]) => {
      // "mode-tint-role" — the tint itself can contain hyphens, the role can't.
      const cut = key.lastIndexOf('-')
      const role = key.slice(cut + 1)
      if (REMOVED_THEME_ROLES.has(role)) return []
      return [[THEME_OVERRIDE_RENAMES[role] ? `${key.slice(0, cut + 1)}${THEME_OVERRIDE_RENAMES[role]}` : key, value]]
    })
  )
  return {
    ...style,
    themeOverrides,
    elementOverrides: migrateRoleRefs(style.elementOverrides),
    buttonOverrides: migrateRoleRefs(style.buttonOverrides),
  }
}

const MIGRATED_DEFAULT_STYLE = migrateEventSiteStyle(DEFAULT_EVENT_SITE_STYLE)

// One-time reset: only the customizable designations keep a saved override
// (see CUSTOMIZABLE_ROLE_KEYS); every other one goes back to the default.
// Runs once per browser, so overrides made afterwards stick.
const RESET_KEY = 'gs-event-site-style-defaults-reset-v1'
function resetNonCustomizableOverrides(saved) {
  try {
    if (localStorage.getItem(RESET_KEY)) return saved
    const themeOverrides = Object.fromEntries(
      Object.entries(saved.themeOverrides ?? {}).filter(([key]) => CUSTOMIZABLE_STORAGE_KEYS.has(key.slice(key.lastIndexOf('-') + 1)))
    )
    const next = { ...saved, themeOverrides }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    localStorage.setItem(RESET_KEY, '1')
    return next
  } catch {
    return saved
  }
}

export function loadEventSiteStyle() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? migrateEventSiteStyle({ ...DEFAULT_EVENT_SITE_STYLE, ...resetNonCustomizableOverrides(JSON.parse(raw)) }) : MIGRATED_DEFAULT_STYLE
  } catch {
    return MIGRATED_DEFAULT_STYLE
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

// 'neutral-two-tone' (Subtle Two-Tone) is currently a straight duplicate of
// 'neutral' (Subtle); consumers that switch on the tint read it through this
// so the two can diverge later in one place.
export const normalizeNeutralTint = tint => (tint === 'neutral-two-tone' ? 'neutral' : tint)
