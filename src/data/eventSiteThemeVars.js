import { generateScale } from '../gs-lib/helpers/colorScale'
import { monochromatize, OUTLINE_VARIANT_MONO_STEP, resolveOverrideHex } from '../gs-lib/helpers/monochromatic'
import { pickAccessibleTextColor, contrastRatio } from '../gs-lib/helpers/contrast'
import { ELEMENT_DEFS, ELEMENT_DEFS_BY_KEY, elementCssVar } from './eventSiteElements.js'
import { THEME_ROLES, THEME_ROLE_BY_KEY, themePartValue, roleCssVar, canonicalRoleKey, MISSING_ROLE_COLOR } from './eventSiteThemeRoles.js'
import { buttonOverrideVars } from './eventSiteButtons.js'

// Every `--gs-color-*` / `--es-el-*` / `--gs-btn-*` custom property the event
// site sets from a saved style — one place, shared by the live page
// (EventWebsitePage.jsx) and every preview of it (the device mockups and
// section thumbnails), so a designation change shows up identically in all of
// them. Pure: same style + tint + mode in, same variables out.

// The designations Primary/Secondary Tint re-tints — only the customizable
// Neutral fills and borders (see CUSTOMIZABLE_ROLE_KEYS). Primary/Secondary
// (the brand colors), the containers, error/tertiary, Scrim and every other
// neutral stay at Theme.js's default unless overridden.
const TINTABLE_ROLE_KEYS = [
  'background', 'surface', 'surfaceVariant', 'surfaceContainerHigh', 'menuContainer',
  'outline', 'outlineVariant',
]

// `defaultTheme`'s own value for each of those, by mode — the starting point
// Monochromatic (below) substitutes away from. Read straight from Theme.js
// (via eventSiteThemeRoles.js), so there's no hand-kept copy of theme.scss
// to drift out of sync.
const DEFAULT_NEUTRAL_TOKENS = Object.fromEntries(['light', 'dark'].map(mode => [
  mode,
  Object.fromEntries(TINTABLE_ROLE_KEYS.map(key => {
    const part = THEME_ROLE_BY_KEY[key].parts.find(p => p.part === 'background' || p.part === 'border')
    return [part.cssVar, themePartValue(key, part.part, mode).hex]
  })),
]))

// Every text color Theme.js pairs with a fill (`color` on a role that also
// has a backgroundColor) — On Surface and friends. Always read from the
// tint's own text scale rather than the fixed Neutral grey.
const TEXT_TOKEN_PARTS = THEME_ROLES
  .filter(role => role.parts.some(p => p.part === 'background'))
  .map(role => ({ role, part: role.parts.find(p => p.part === 'text') }))
  .filter(({ part }) => part)
const NEUTRAL_TEXT_ROLE_KEYS = new Set(['background', 'surface', 'surfaceVariant', 'surfaceContainerHigh', 'menuContainer'])

// Which `--gs-color-*` a Theme Definitions / Theme-tab override
// (`${mode}-${tint}-${storageKey}`) is written to. The brand Primary/
// Secondary colors themselves aren't overridable here — they come from the
// color pickers.
const ROLE_TO_CSS_VAR = Object.fromEntries(
  THEME_ROLES
    .filter(role => role.key !== 'primary' && role.key !== 'secondary')
    .flatMap(role => role.parts.map(p => [p.storageKey, p.cssVar]))
)

// Color Exploration's Site Colors tab (ELEMENT_DEFS) lets a single named
// element — the header logo, a section title, one sponsor tile's name, ... —
// point at a different designation than the one it reads by default,
// independent of every other element sharing it. Each element's own
// `--es-el-*` custom property is read (with a fallback to that element's
// normal `--gs-color-*` value) by the selector(s) in EventWebsitePage.scss
// actually styling it. An element takes whichever of the designation's
// colors matches its kind — a fill, its text, or a border.
const ELEMENT_TO_CSS_VAR = Object.fromEntries(ELEMENT_DEFS.map(def => [def.key, elementCssVar(def.key)]))


// White or Theme.js's grey800, whichever reads better on `fillHex`.
export const readableTextOn = fillHex => pickAccessibleTextColor(fillHex, '#FFFFFF', '#232323')

// The text to show on `fillHex`: the text it already has (Primary 800, a
// designation's own pair, ...) as long as it still reads (AA, 4.5:1) — only
// when it doesn't is a replacement picked.
export const keepOrReadableText = (currentTextHex, fillHex) =>
  currentTextHex && contrastRatio(currentTextHex, fillHex) >= 4.5 ? currentTextHex : readableTextOn(fillHex)

// `enabled` is whether the saved style applies at all (a premium tournament
// that's actually saved one) — otherwise the fixed GolfStatus preset shows.
// Returns { customThemeStyle, extraStyle }: the tint's own tokens (undefined
// for the fixed GolfStatus theme, which the `.gs-theme-default` class
// supplies) and the saved role/element/button overrides layered on top.
// Spread both onto an element that also carries `.gs-theme-default` (and
// `.light`/`.dark`) to render it exactly as the page does.
export function eventSiteThemeVars({ siteStyle, tint, themeMode, normalizeNeutralTint, enabled = true }) {
  const monochromatic = normalizeNeutralTint(tint) !== 'neutral' && tint !== 'golfstatus'
  const themeName = tint === 'golfstatus' ? 'golfstatus' : 'default'
  const primaryScale = generateScale(siteStyle.primaryColor)
  const secondaryScale = generateScale(siteStyle.secondaryColor)
  const monoScale = tint === 'secondary' || tint === 'full' ? secondaryScale : primaryScale
  const textScale = tint === 'full' ? primaryScale : monoScale
  // Subtle buttons sit a step lighter than the base color in light mode, a
  // step darker in dark mode (100/700); their text is pinned opposite —
  // 900 in light mode, 50 in dark mode — same "fixed step, not AA-picked"
  // convention as Fill's on-*-fill (step 50) below.
  const primarySubtleBg = primaryScale[themeMode === 'dark' ? 700 : 100]
  const secondarySubtleBg = secondaryScale[themeMode === 'dark' ? 700 : 100]

  // Fill/Outline's base color sits noticeably lighter in dark mode (600 ->
  // 200) so it doesn't read as a flat, oversaturated block against a dark
  // background — same convention WebsiteDesignStyleFields.jsx's Button
  // Styles preview follows, so the two can't drift apart. This is also
  // --gs-color-primary/-secondary itself (see customThemeStyle below), so
  // the header/active-tab accent moves with this same step too — the real
  // theme system has no separate "just the buttons" token.
  // Primary/Secondary are the chosen colors themselves (step 400), the same
  // in light and dark mode.
  const primaryBase = primaryScale[400]
  const secondaryBase = secondaryScale[400]

  const customThemeStyle = themeName !== 'default' || !enabled ? undefined : {
    // Primary/Secondary are the brand colors; Primary/Secondary Container are
    // the same colors as a fill, with their text (Theme.js `color`)
    // AA-picked — the header bar (EventWebsitePage.scss's .es-header-bar)
    // reads that pair, so it can't be pinned to a fixed step. Fill buttons
    // read the dedicated -fill tokens below instead.
    '--gs-color-primary': primaryBase,
    '--gs-color-primary-container': primaryBase,
    '--gs-color-on-primary-container': pickAccessibleTextColor(primaryBase, primaryScale[100], primaryScale[800]),
    // Primary Container High: the same pair as Primary Container in light, a
    // light tint with dark text in dark.
    '--gs-color-primary-container-high': themeMode === 'dark' ? primaryScale[200] : primaryBase,
    '--gs-color-on-primary-container-high': themeMode === 'dark' ? primaryScale[900] : pickAccessibleTextColor(primaryBase, primaryScale[100], primaryScale[800]),
    '--gs-color-secondary': secondaryBase,
    '--gs-color-secondary-container': secondaryBase,
    '--gs-color-on-secondary-container': pickAccessibleTextColor(secondaryBase, secondaryScale[100], secondaryScale[800]),
    // Theme.js's Secondary Container High: the same pair as Secondary
    // Container in light, a light tint with dark text in dark.
    '--gs-color-secondary-container-high': themeMode === 'dark' ? secondaryScale[200] : secondaryBase,
    '--gs-color-on-secondary-container-high': themeMode === 'dark' ? secondaryScale[900] : pickAccessibleTextColor(secondaryBase, secondaryScale[100], secondaryScale[800]),
    // Dark mode's Fill background is a light tint (see primaryBase/
    // secondaryBase above, step 200) so its text needs to be dark (900),
    // not light (50) the way light mode's step-400 background needs.
    '--gs-color-on-primary-fill': pickAccessibleTextColor(primaryBase, primaryScale[50], primaryScale[900]),
    '--gs-color-on-secondary-fill': pickAccessibleTextColor(secondaryBase, secondaryScale[50], secondaryScale[900]),
    '--gs-color-primary-subtle': primarySubtleBg,
    '--gs-color-on-primary-subtle': primaryScale[themeMode === 'dark' ? 50 : 900],
    '--gs-color-secondary-subtle': secondarySubtleBg,
    '--gs-color-on-secondary-subtle': secondaryScale[themeMode === 'dark' ? 50 : 900],
    // All page text/icons read the text half (Theme.js `color`) of a Neutral
    // designation — On Background, On Surface, On Surface Variant, ... Each
    // is Theme.js's own text value for that designation mapped onto
    // `textScale` (Primary for Neutral/Primary Tint, Secondary for Secondary
    // Tint — the same scale the fills below tint with), so the whole page
    // follows the saved Site Style radio instead of always reading the fixed
    // grey. Every "lighter" text treatment layers its own opacity on top of
    // whichever color these tokens resolve to (see EventWebsitePage.scss's
    // .es-arrow-tile-sub/-arrow, .es-sponsor-feature-description, and
    // GSPageSection's own description div). Flips light (near-800) to dark
    // (near-50/100) with themeMode, same split as Theme.js's own light/dark.
    ...Object.fromEntries(
      TEXT_TOKEN_PARTS
        .filter(({ role }) => NEUTRAL_TEXT_ROLE_KEYS.has(role.key))
        .map(({ role, part }) => [part.cssVar, monochromatize(themePartValue(role.key, 'text', themeMode).hex, textScale)])
    ),
    ...(monochromatic &&
      Object.fromEntries(
        Object.entries(DEFAULT_NEUTRAL_TOKENS[themeMode]).map(([token, hex]) => [
          token,
          // Pinned to a fixed step instead of monochromatize()'s usual
          // hex-based lookup — see OUTLINE_VARIANT_MONO_STEP's own comment
          // (monochromatic.js) for why Outline Variant needs a fixed step.
          // Surface Container High gets the same treatment so every
          // section body (EventWebsitePage.scss's .section-body reads this
          // token) tints to the same 100 step under Primary/Secondary Tint,
          // in both light and dark mode, instead of following
          // monochromatize()'s light/dark-dependent grey-50/grey-800 lookup.
          token === '--gs-color-outline-variant'
            ? textScale[OUTLINE_VARIANT_MONO_STEP]
            : token === '--gs-color-surface-container-high'
              ? monoScale[OUTLINE_VARIANT_MONO_STEP] // surface scale, matching the preview's card bodies
              : monochromatize(hex, monoScale),
        ])
      )),
  }

  // Role riffs saved from Color Exploration/Website Design and Style. Applied
  // under every theme (GolfStatus included) — each is keyed by tint, so the
  // 'golfstatus' slot holds its own edits.
  const roleStyle = !enabled ? {} : {
  // Per-swatch riffs saved from the Website Design and Style screen's
  // Theme Definitions row (see ROLE_TO_CSS_VAR above) — applied last so a
  // saved override always wins over both the plain and Monochromatic
  // values above, exactly like it does in that screen's own preview.
  ...Object.fromEntries(
    Object.entries(ROLE_TO_CSS_VAR)
      .map(([roleKey, cssVar]) => {
        const override = siteStyle.themeOverrides?.[`${themeMode}-${tint}-${roleKey}`]
        const hex = resolveOverrideHex(override, { primaryScale, secondaryScale })
        return hex ? [cssVar, hex] : null
      })
      .filter(Boolean)
  ),
  // A fill's text is its designation's PAIRED color — made for the original
  // fill. When only the fill is overridden (say Primary Container High's
  // background turned cyan), that text may no longer read on it, so unless the
  // text is overridden too it's re-picked for contrast against the new fill.
  ...Object.fromEntries(
    THEME_ROLES.flatMap(role => {
      const fill = role.parts.find(p => p.part === 'background')
      const text = role.parts.find(p => p.part === 'text')
      if (!fill || !text) return []
      const fillHex = resolveOverrideHex(siteStyle.themeOverrides?.[`${themeMode}-${tint}-${fill.storageKey}`], { primaryScale, secondaryScale })
      const textOverridden = siteStyle.themeOverrides?.[`${themeMode}-${tint}-${text.storageKey}`]
      if (!fillHex || textOverridden) return []
      const current = customThemeStyle?.[text.cssVar] ?? themePartValue(role.key, 'text', themeMode).hex
      const next = keepOrReadableText(current, fillHex)
      return next === current ? [] : [[text.cssVar, next]]
    })
  ),
  }

  // Applies under every theme (GolfStatus included), unlike customThemeStyle
  // — overrides are already keyed by tint, so 'golfstatus' has its own set.
  const elementStyle = !enabled ? {} : {
  // Per-element riffs saved from Color Exploration's own Site Colors tab
  // (see ELEMENT_TO_CSS_VAR above) — applied last of all so a saved
  // element override always wins over its role's own value, including a
  // themeOverrides riff to that same role above (an element override is
  // more specific — it names one element, not the whole role).
  ...Object.fromEntries(
    Object.entries(ELEMENT_TO_CSS_VAR)
      .map(([elementKey, cssVar]) => {
        const override = siteStyle.elementOverrides?.[`${themeMode}-${tint}-${elementKey}`]
        if (!override) return null
        // A designation reference points this element's own variable straight
        // at that designation's live variable — var(...) can nest — instead
        // of computing a hex, so the element keeps tracking whatever the
        // designation itself resolves to. Which of its colors (fill, text,
        // border) depends on the element's kind, so a component with a
        // background and text gets a matching pair from one designation.
        // A designation that isn't in Theme.js any more renders pink.
        if (override.role) {
          const role = canonicalRoleKey(override.role)
          const live = role && roleCssVar(role, ELEMENT_DEFS_BY_KEY[elementKey]?.kind)
          return [cssVar, live ? `var(${live})` : MISSING_ROLE_COLOR]
        }
        const hex = resolveOverrideHex(override, { primaryScale, secondaryScale })
        return hex ? [cssVar, hex] : null
      })
      .filter(Boolean)
  ),
  }

  // Button color riffs saved from Color Exploration's Buttons tab
  // (data/eventSiteButtons.js) apply under every theme, GolfStatus included —
  // that theme has no customThemeStyle of its own (it stays the fixed brand
  // preset), so these `--gs-btn-*` variables are layered on separately.
  const buttonStyle = enabled
    ? buttonOverrideVars(siteStyle.buttonOverrides, themeMode, { primaryScale, secondaryScale }, tint)
    : {}

  return { customThemeStyle, extraStyle: { ...roleStyle, ...elementStyle, ...buttonStyle } }
}
