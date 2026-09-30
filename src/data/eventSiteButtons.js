import { resolveOverrideHex } from '../gs-lib/helpers/monochromatic'

// Per-button color riffs typed into Color Exploration's Buttons tab
// (ColorExplorationFields.jsx) — one Fill/Subtle background + text, one
// Outline border + text, or just a text color for Transparent, per Primary/Secondary color, per theme, per mode.
// Stored in the saved event site style as `buttonOverrides`, keyed
// "mode-theme-color-appearance-part" (e.g. "dark-full-secondary-fill-bg"),
// each a { hex } or a { family, step } scale reference (same shape as
// themeOverrides — resolved by resolveOverrideHex). EventWebsitePage.jsx
// turns each into a `--gs-btn-*` custom property that gs-button.scss reads
// ahead of the shared `--gs-color-*` role tokens, so a button edit never
// bleeds into the header or anything else reading those roles.
export const BUTTON_COLORS = [
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

export const buttonOverrideKey = (mode, theme, color, appearance, part) =>
  `${mode}-${theme}-${color}-${appearance}-${part}`

// Named-button style picks are stored per theme so one theme's right-click
// edit never leaks into another's.
export const buttonStyleKey = (theme, id) => `${theme}-${id}`

export const buttonVarName = (color, appearance, part) => `--gs-btn-${color}-${appearance}-${part}`

export function resolveButtonOverride(override, scales) {
  if (!override) return null
  return override.hex ?? resolveOverrideHex(override, scales)
}

// Every saved override for one mode + theme as { '--gs-btn-*': hex }, ready
// to spread into an inline style.
export function buttonOverrideVars(overrides, mode, theme, scales) {
  const vars = {}
  BUTTON_COLORS.forEach(({ key: color }) => {
    BUTTON_APPEARANCES.forEach(({ key: appearance, parts }) => {
      parts.forEach(([part]) => {
        const hex = resolveButtonOverride(overrides?.[buttonOverrideKey(mode, theme, color, appearance, part)], scales)
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
  sponsorWebsite: 'Sponsor Website',
  donateNow: 'Donate Now',
  getAccess: 'Get Access',
  addToCart: 'Add To Cart',
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
  sponsorWebsite: ['primary', 'subtle'],
  donateNow: ['secondary', 'fill'],
  getAccess: ['primary', 'fill'],
  addToCart: ['primary', 'outline'],
  subnavSelected: ['primary', 'subtle'],
  subnavUnselected: ['primary', 'transparent'],
}
