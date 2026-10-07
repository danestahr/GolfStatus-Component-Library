import { resolveOverrideHex } from '../gs-lib/helpers/monochromatic'
import { ELEMENT_ROLES } from './eventSiteElements'

const ROLE_CSS_VARS = Object.fromEntries(ELEMENT_ROLES.map(r => [r.key, r.cssVar]))

// Per-button color riffs typed into Color Exploration's Buttons tab
// (ColorExplorationFields.jsx) — one Fill/Subtle background + text, one
// Outline border + text, or just a text color for Transparent, per Neutral/Primary/Secondary color, per mode (shared by every theme).
// Stored in the saved event site style as `buttonOverrides`, keyed
// "mode-color-appearance-part" (e.g. "dark-secondary-fill-bg"),
// each a { hex } or a { family, step } scale reference (same shape as
// themeOverrides — resolved by resolveOverrideHex). EventWebsitePage.jsx
// turns each into a `--gs-btn-*` custom property that gs-button.scss reads
// ahead of the shared `--gs-color-*` role tokens, so a button edit never
// bleeds into the header or anything else reading those roles.
export const BUTTON_COLORS = [
  { key: 'neutral', label: 'Grey' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
]

// `parts` are [key, label] pairs — Outline's border and text are separate
// colors, Fill/Subtle's are background and text.
export const BUTTON_APPEARANCES = [
  { key: 'fill', label: 'Fill', parts: [['bg', 'Background'], ['text', 'Text']] },
  { key: 'outline', label: 'Outline', parts: [['border', 'Outline'], ['text', 'Text']] },
  { key: 'subtle', label: 'Subtle', parts: [['bg', 'Background'], ['text', 'Text']] },
  // No background at all — the one text color drives both label and icon.
  { key: 'transparent', label: 'Transparent', parts: [['text', 'Text']] },
]

export const buttonOverrideKey = (mode, color, appearance, part) => `${mode}-${color}-${appearance}-${part}`

// Named-button style picks are stored per theme so one theme's right-click
// edit never leaks into another's.
export const buttonStyleKey = (theme, id) => `${theme}-${id}`

export const buttonVarName = (color, appearance, part) => `--gs-btn-${color}-${appearance}-${part}`

// A button part can point at a theme role ({ role: 'surface' }) instead of a
// color; `scales.roleHexes[mode]` (Color Exploration's preview) resolves it
// to a hex, while the live site references the role's CSS variable directly.
export function resolveButtonOverride(override, scales, mode) {
  if (!override) return null
  if (override.role) return scales?.roleHexes?.[mode]?.[override.role] ?? null
  return override.hex ?? resolveOverrideHex(override, scales)
}

// Every saved override for one mode as { '--gs-btn-*': hex }, ready
// to spread into an inline style.
export function buttonOverrideVars(overrides, mode, scales) {
  const vars = {}
  BUTTON_COLORS.forEach(({ key: color }) => {
    BUTTON_APPEARANCES.forEach(({ key: appearance, parts }) => {
      parts.forEach(([part]) => {
        const override = overrides?.[buttonOverrideKey(mode, color, appearance, part)]
        const hex = override?.role ? (ROLE_CSS_VARS[override.role] ? `var(${ROLE_CSS_VARS[override.role]})` : null) : resolveButtonOverride(override, scales, mode)
        if (hex) vars[buttonVarName(color, appearance, part)] = hex
      })
    })
  })
  return vars
}

// Every Event Website button the right-click menu can restyle, by the
// `buttonId` the page gives it (GSButton's data-button-id) — the label is
// what the menu calls it.
export const BUTTON_IDS = {
  registerNow: 'Register Now',
  makeDonation: 'Make A Donation',
  viewPackages: 'View Packages',
  viewSponsors: 'View Sponsors',
  viewPackage: 'View (Sponsorship)',
  changeRound: 'Change Round',
  teeNav: 'Tee Navigation',
  changeLeaderboard: 'Change Leaderboard',
  leaderboardDisplay: 'Leaderboard Full Screen',
  sponsorWebsite: 'Sponsor Website',
  donateNow: 'Donate Now',
  getAccess: 'Get Access',
  addToCart: 'Add To Cart',
  continue: 'Continue',
  restartOrder: 'Restart Order',
  signIn: 'Sign In',
  addDetails: 'Add Details',
  saveContinue: 'Save & Continue',
  cancelSlideOut: 'Cancel (Slide Out)',
  addSuggested: 'Add Suggested Package',
  removePackage: 'Remove Package',
  qtyStepper: 'Quantity Stepper',
  subnavSelected: 'Sub Nav (Selected)',
  subnavUnselected: 'Sub Nav (Not Selected)',
}

// The [color, appearance] each of those buttons has when nothing's been
// picked for it (the page's own default — Register Now et al. follow the
// tint's CTA color, Primary unless Secondary Tint).
export const BUTTON_DEFAULTS = {
  registerNow: ['primary', 'fill'],
  makeDonation: ['secondary', 'outline'],
  viewPackages: ['primary', 'fill'],
  viewSponsors: ['primary', 'fill'],
  viewPackage: ['primary', 'subtle'],
  changeRound: ['primary', 'fill'],
  teeNav: ['primary', 'subtle'],
  changeLeaderboard: ['primary', 'fill'],
  leaderboardDisplay: ['primary', 'subtle'],
  sponsorWebsite: ['primary', 'subtle'],
  donateNow: ['secondary', 'fill'],
  getAccess: ['primary', 'fill'],
  addToCart: ['primary', 'outline'],
  continue: ['primary', 'fill'],
  restartOrder: ['primary', 'transparent'],
  signIn: ['primary', 'subtle'],
  addDetails: ['primary', 'fill'],
  saveContinue: ['primary', 'fill'],
  cancelSlideOut: ['primary', 'subtle'],
  addSuggested: ['primary', 'subtle'],
  removePackage: ['primary', 'subtle'],
  qtyStepper: ['primary', 'subtle'],
  subnavSelected: ['primary', 'subtle'],
  subnavUnselected: ['primary', 'transparent'],
}
