import { resolveOverrideHex } from '../gs-lib/helpers/monochromatic'
import { roleCssVar, canonicalRoleKey, MISSING_ROLE_COLOR } from './eventSiteThemeRoles'

// Which of a designation's colors a button part takes — the same fill/text/
// border split elements use (eventSiteThemeRoles.js's rolePart).
const PART_KIND = { bg: 'background', text: 'text', border: 'border' }

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
  { key: 'neutral', label: 'Generic' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'error', label: 'Error' },
]

// Primary and Secondary look different in every theme (Grayscale, Subtle,
// Bold), so their overrides are saved per theme; Generic and Error are the
// same in all of them.
export const THEMED_BUTTON_COLORS = ['primary', 'secondary']

export const BUTTON_PICK_COLORS = BUTTON_COLORS

// `parts` are [key, label] pairs — Fill/Subtle are background and text;
// Outline is text only (its border inherits it).
export const BUTTON_APPEARANCES = [
  { key: 'fill', label: 'Fill', parts: [['bg', 'Background'], ['text', 'Text']] },
  // The border is currentColor (gs-button.scss), so the text color drives both.
  { key: 'outline', label: 'Outline', parts: [['text', 'Text']] },
  { key: 'subtle', label: 'Subtle', parts: [['bg', 'Background'], ['text', 'Text']] },
  // No background at all — the one text color drives both label and icon.
  { key: 'transparent', label: 'Transparent', parts: [['text', 'Text']] },
  // Generic only — the greyed-out look of a button that can't be pressed.
  { key: 'disabled', label: 'Disabled', parts: [['bg', 'Background'], ['text', 'Text']] },
]

// Generic needs just Subtle and Disabled; every other color has the four
// regular styles.
export const buttonAppearancesFor = color =>
  BUTTON_APPEARANCES.filter(a => (color === 'neutral' ? ['subtle', 'disabled'] : ['fill', 'outline', 'subtle', 'transparent']).includes(a.key))

// `theme` only matters for Primary/Secondary — an override saved before they
// went per-theme (no theme prefix) still applies as the fallback.
export const buttonOverrideKey = (mode, color, appearance, part, theme) =>
  theme && THEMED_BUTTON_COLORS.includes(color) ? `${theme}-${mode}-${color}-${appearance}-${part}` : `${mode}-${color}-${appearance}-${part}`

// Named-button style picks are stored per theme so one theme's right-click
// edit never leaks into another's.
export const buttonStyleKey = (theme, id) => `${theme}-${id}`

export const buttonVarName = (color, appearance, part) => `--gs-btn-${color}-${appearance}-${part}`

// A button part can point at a theme designation ({ role: 'surface' })
// instead of a color; `scales.roleHexes[mode]` (Color Exploration's preview,
// keyed "role:kind") resolves it to a hex, while the live site references
// the designation's CSS variable directly. A designation that no longer
// exists in Theme.js resolves to pink.
export function resolveButtonOverride(override, scales, mode, part) {
  if (!override) return null
  if (override.role) {
    const role = canonicalRoleKey(override.role)
    return (role && scales?.roleHexes?.[mode]?.[`${role}:${override.kind ?? PART_KIND[part] ?? 'background'}`]) || MISSING_ROLE_COLOR
  }
  return override.hex ?? resolveOverrideHex(override, scales)
}

// Every saved override for one mode as { '--gs-btn-*': hex }, ready
// to spread into an inline style.
export function buttonOverrideVars(overrides, mode, scales, theme) {
  const vars = {}
  BUTTON_COLORS.forEach(({ key: color }) => {
    buttonAppearancesFor(color).forEach(({ key: appearance, parts }) => {
      parts.forEach(([part]) => {
        const override = overrides?.[buttonOverrideKey(mode, color, appearance, part, theme)] ?? overrides?.[buttonOverrideKey(mode, color, appearance, part)]
        let hex
        if (override?.role) {
          const role = canonicalRoleKey(override.role)
          // `kind` lets a part read a different color of the designation than
          // its slot usually would (see ButtonDesignationSelect's readability rules).
          const cssVar = role && roleCssVar(role, override.kind ?? PART_KIND[part])
          hex = cssVar ? `var(${cssVar})` : MISSING_ROLE_COLOR
        } else hex = resolveButtonOverride(override, scales, mode, part)
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
  packagesNav: 'Packages Nav',
  favorite: 'Favorite (Starred)',
  favoriteOff: 'Favorite (Not Starred)',
  uploadImage: 'Upload Image',
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
  packagesNav: ['primary', 'fill'],
  favorite: ['secondary', 'fill'],
  favoriteOff: ['neutral', 'subtle'],
  uploadImage: ['primary', 'subtle'],
}
