import { defaultTheme, golfstatusColors } from '../gs-lib/helpers/Theme'
import { normalizeHex } from '../gs-lib/helpers/monochromatic'

// The event site's color designations — exactly the keys of Theme.js's
// `defaultTheme`, nothing else. That file is the source of truth: a
// designation that isn't in it (On Primary, Primary Container Variant,
// Placeholder, ...) doesn't exist here, and anything still pointing at one
// renders PINK (see MISSING_ROLE_COLOR) so it's easy to spot on the site.

export const MISSING_ROLE_COLOR = '#FF69B4'

// The only designations Subtle/Bold actually customize (the devs' own
// Subtle.json / Bold.json override exactly these, plus the Outline pair and
// the two Container Highs). Every other designation stays at Theme.js's
// default unless it's explicitly overridden. In display order.
export const CUSTOMIZABLE_ROLE_KEYS = [
  'primaryContainer', 'primaryContainerHigh',
  'secondaryContainer', 'secondaryContainerHigh',
  'menuContainer',
  'background', 'surface', 'surfaceVariant', 'surfaceContainerHigh',
  'outline', 'outlineVariant',
]
export const CUSTOMIZABLE_ROLES = new Set(CUSTOMIZABLE_ROLE_KEYS)

const ROLE_LABELS = {
  primary: 'Primary',
  secondary: 'Secondary',
  primaryContainer: 'Primary Container',
  primaryContainerHigh: 'Primary Container High',
  secondaryContainer: 'Secondary Container',
  secondaryContainerHigh: 'Secondary Container High',
  background: 'Background',
  surface: 'Surface',
  surfaceDim: 'Surface Dim',
  surfaceBright: 'Surface Bright',
  surfaceContainerLow: 'Surface Container Low',
  surfaceContainerLowest: 'Surface Container Lowest',
  surfaceContainerHigh: 'Surface Container High',
  // Theme.js spells this token "Higest" (single h) — the key stays that way
  // so it matches the library; only the label is spelled correctly.
  surfaceContainerHigest: 'Surface Container Highest',
  menuContainer: 'Menu Container',
  surfaceVariant: 'Surface Variant',
  outline: 'Outline',
  outlineVariant: 'Outline Variant',
  scrim: 'Scrim',
  error: 'Error',
  errorContainer: 'Error Container',
  tertiary: 'Tertiary',
  tertiaryContainer: 'Tertiary Container',
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
const kebab = s => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const cssName = key => kebab(key).replace('higest', 'highest')

// A designation can carry up to three colors in Theme.js: `backgroundColor`,
// `color` (the text/icon color that sits on that background) and
// `borderColor`. Picking one designation on an element applies whichever of
// those the element has — a component with a background and text gets both.
//   background — fills (Theme.js backgroundColor)
//   text       — text/icons on that fill (Theme.js `color`, on a role that has a fill)
//   color      — a role that is ONLY a color (Primary, Secondary, Error, Tertiary)
//   border     — a role that is ONLY a border (Outline, Outline Variant)
// `storageKey` is the key a Theme-tab override for that part is saved under
// (`${mode}-${tint}-${storageKey}`); `cssVar` is the live `--gs-color-*`
// custom property the page sets for it.
function buildRole(key) {
  const sample = defaultTheme[key].light
  const hasBg = 'backgroundColor' in sample
  const hasText = 'color' in sample
  const hasBorder = 'borderColor' in sample
  const parts = []
  if (hasBg) parts.push({ part: 'background', prop: 'backgroundColor', storageKey: key, cssVar: `--gs-color-${cssName(key)}` })
  if (hasText) {
    parts.push(hasBg
      ? { part: 'text', prop: 'color', storageKey: `on${cap(key)}`, cssVar: `--gs-color-on-${cssName(key)}` }
      : { part: 'color', prop: 'color', storageKey: key, cssVar: `--gs-color-${cssName(key)}` })
  }
  if (hasBorder) parts.push({ part: 'border', prop: 'borderColor', storageKey: key, cssVar: `--gs-color-${cssName(key)}` })
  return { key, label: ROLE_LABELS[key] ?? cap(key), parts }
}

export const THEME_ROLES = Object.keys(defaultTheme).map(buildRole)
export const THEME_ROLE_BY_KEY = Object.fromEntries(THEME_ROLES.map(role => [role.key, role]))

// Display / export order: the brand colors, then the designations in the
// devs' Subtle/Bold file order (with the two Container Highs slotted beside
// their containers, the Outline pair after the customized surfaces), then
// the remaining surfaces and scrim, then tertiary and error. Anything not
// listed (a designation added to Theme.js later) goes last, in Theme.js's
// own order.
const DISPLAY_ORDER = [
  'primary', 'secondary',
  'primaryContainer', 'primaryContainerHigh',
  'secondaryContainer', 'secondaryContainerHigh',
  'menuContainer', 'background', 'surfaceVariant', 'surface', 'surfaceContainerHigh',
  'outline', 'outlineVariant',
  'surfaceDim', 'surfaceBright', 'surfaceContainerLow', 'surfaceContainerLowest', 'surfaceContainerHigest',
  'scrim',
  'tertiary', 'tertiaryContainer',
  'error', 'errorContainer',
]
const displayRank = key => { const i = DISPLAY_ORDER.indexOf(key); return i === -1 ? DISPLAY_ORDER.length : i }
export const THEME_ROLES_IN_DISPLAY_ORDER = [...THEME_ROLES].sort((x, y) => displayRank(x.key) - displayRank(y.key))

// `${mode}-${tint}-${storageKey}` suffixes of the customizable designations'
// colors (their fill, text and border rows) — every other saved override is
// reset to default (see data/eventSiteStyle.js).
export const CUSTOMIZABLE_STORAGE_KEYS = new Set(
  CUSTOMIZABLE_ROLE_KEYS.flatMap(key => THEME_ROLE_BY_KEY[key].parts.map(part => part.storageKey))
)
export const THEME_ROLE_LABELS = THEME_ROLES.map(role => role.label)
export const THEME_ROLE_KEY_BY_LABEL = Object.fromEntries(THEME_ROLES.map(role => [role.label.toLowerCase(), role.key]))

// What an element needs from a designation: 'background' for a fill, 'text'
// for text/icons, 'border' for a border/divider. Falls through to whichever
// color the role actually has (a color-only role like Primary is used as the
// fill of a toggle track, an outline as a track, ...).
const KIND_PREFERENCE = {
  background: ['background', 'color', 'border', 'text'],
  text: ['text', 'color', 'border', 'background'],
  border: ['border', 'background', 'color', 'text'],
}

export function rolePart(roleKey, kind) {
  const role = THEME_ROLE_BY_KEY[roleKey]
  if (!role) return null
  const wanted = KIND_PREFERENCE[kind] ?? KIND_PREFERENCE.background
  for (const part of wanted) {
    const found = role.parts.find(p => p.part === part)
    if (found) return found
  }
  return null
}

// The `--gs-color-*` custom property an element of `kind` reads when it's
// assigned `roleKey`.
export const roleCssVar = (roleKey, kind) => rolePart(roleKey, kind)?.cssVar ?? null

// Roles saved before the On X designations were removed. "On Surface" is
// just the text color of Surface — the same designation seen from the text
// side — so those carry straight over to the role that owns them. Anything
// else that no longer exists (the *Variant containers, Placeholder, ...)
// has no entry and resolves to null -> pink.
const LEGACY_ROLE_ALIASES = {
  onPrimary: 'primaryContainer',
  onSecondary: 'secondaryContainer',
  onBackground: 'background',
  onSurface: 'surface',
  onSurfaceVariant: 'surfaceVariant',
}

export function canonicalRoleKey(key) {
  if (THEME_ROLE_BY_KEY[key]) return key
  return LEGACY_ROLE_ALIASES[key] ?? null
}

// Theme.js stores each color as a hex; the editor works in { family, step }
// references (white / black / grey 800 / cyan 700 ...). Built from the
// palette itself so Theme.js stays the only place a value is written down.
// Where two palette names share a hex, the later (lower-numbered) one wins,
// which is the name Theme.js uses (orange400, not orange500).
const REF_BY_HEX = {}
Object.entries(golfstatusColors).forEach(([name, hex]) => {
  if (typeof hex !== 'string') return
  const match = name.match(/^(grey|cyan|green|orange|red)(\d+)$/)
  if (match) REF_BY_HEX[normalizeHex(hex)] = { family: match[1], step: Number(match[2]) }
  else if (name === 'white' || name === 'black') REF_BY_HEX[normalizeHex(hex)] = { family: name }
})

export const hexToRef = hex => REF_BY_HEX[normalizeHex(hex)] ?? null

// One role part's Theme.js value for a mode, as { hex, ref }.
export function themePartValue(roleKey, part, mode) {
  const role = THEME_ROLE_BY_KEY[roleKey]
  const prop = role?.parts.find(p => p.part === part)?.prop
  const hex = prop ? defaultTheme[roleKey][mode][prop] : null
  return { hex, ref: hex ? hexToRef(hex) : null }
}
