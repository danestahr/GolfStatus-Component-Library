import { useEffect, useState } from 'react'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'
import { generateScale, SCALE_STEPS } from '../../gs-lib/helpers/colorScale'
import { defaultTheme, mergedTheme, golfstatusColors } from '../../gs-lib/helpers/Theme'
import { colorThemes, colorThemeKeys } from '../../gs-lib/helpers/colorThemes'
import { monochromatize, normalizeHex, NEUTRAL_STEP_BY_HEX, OUTLINE_VARIANT_MONO_STEP } from '../../gs-lib/helpers/monochromatic'
import './WebsiteDesignStyleFields.scss'

// White/black bookend every row (not generated — 50/900 already approach
// them, but the actual endpoints are still useful reference stops).
const WHITE = '#FFFFFF'
const BLACK = '#000000'

// Brand-friendly starting points offered next to the native color input, so
// picking a base color doesn't always start from a blank eyedropper.
const PRESET_COLORS = ['#25499B', '#518AA0', '#3A6349', '#E6A054', '#A33E26', '#3B3989']

// Neutral is the app's own fixed greyscale (colors.scss's $grey-50...
// $grey-900, via Theme.js's golfstatusColors) — shown for reference, not
// editable like Primary/Secondary, since a design system's neutral ramp
// isn't something a single event's brand color should be able to drift.
const NEUTRAL_SWATCHES = [
  { key: 'white', label: 'White', hex: WHITE },
  { key: 50, label: 50, hex: golfstatusColors.grey50 },
  { key: 100, label: 100, hex: golfstatusColors.grey100 },
  { key: 200, label: 200, hex: golfstatusColors.grey200 },
  { key: 300, label: 300, hex: golfstatusColors.grey300 },
  { key: 400, label: 400, hex: golfstatusColors.grey400 },
  { key: 500, label: 500, hex: golfstatusColors.grey500 },
  { key: 600, label: 600, hex: golfstatusColors.grey600 },
  { key: 700, label: 700, hex: golfstatusColors.grey700 },
  { key: 800, label: 800, hex: golfstatusColors.grey800 },
  { key: 900, label: 900, hex: golfstatusColors.grey900 },
  { key: 'black', label: 'Black', hex: BLACK, isOutlined: true },
]

// monochromatize() (gs-lib/helpers/monochromatic.js) is the single source
// of truth for "this color is Neutral step N, substitute the same step
// from a Primary scale instead" — shared with EventWebsitePage.jsx so the
// live site's Monochromatic behaves identically to this preview.

// One swatch strip, rendered twice below (light order, then reversed for
// dark) — pulled into its own function so the two rows can't drift apart.
// familyLabel names the scale this swatch belongs to (Primary/Secondary/
// Grey) — shown under the hex as e.g. "Primary 800" so a swatch is
// identifiable on its own once copied out of this screen. Only numeric
// steps get it; White/Black are absolute, not a tint of any one family.
// syncScroll marks a row as one of the 6 Primary/Secondary/Neutral Light+
// Dark rows useSyncedSwatchScroll (below) scrolls together — they're all
// the same White->50->900->Black sequence (mirrored for Dark), just split
// across three fields, so scrolling one scrolls all six to the same offset.
function ScaleSwatches({ swatches, familyLabel, syncScroll }) {
  return (
    <div className={`wds-swatches${syncScroll ? ' wds-swatches--synced' : ''}`}>
      {swatches.map(({ key, label, hex, isBase, isOutlined }) => (
        <div className={`wds-swatch${isBase ? ' wds-swatch--base' : ''}`} key={key}>
          <div className={`wds-swatch-color${isOutlined ? ' wds-swatch-color--outline' : ''}`} style={{ backgroundColor: hex }} />
          <div className="wds-swatch-step">
            {label}
            {isBase && <span className="wds-swatch-base-tag">Base</span>}
          </div>
          <div className="wds-swatch-hex">{hex}</div>
          {familyLabel && typeof key === 'number' && (
            <div className="wds-swatch-family">{familyLabel} {label}</div>
          )}
        </div>
      ))}
    </div>
  )
}

// A single color-input + generated-scale row — used for the Primary
// (grey) and Secondary (green) colors below. Only the 400 step is
// editable; every other step is derived live via generateScale (see
// colorScale.js), same "plug in one color, get 50-900 back" tool discussed
// for the actual Theme.js palettes. The 400 swatch itself is highlighted
// since it's the one value driving the rest of the row.
//
// Dark Mode below it isn't a second generated scale — it's the same 12
// swatches (White, 50-900, Black) in reverse, same "mirror the light scale"
// convention gs-lib/styles/theme.scss's own light/dark role pairs use
// elsewhere (e.g. .gs-theme-default's surface white <-> .dark's surface
// grey-900 sit at the same *position* in their own light/dark scales).
function ColorScaleRow({ color, onChangeColor, colorName }) {
  const scale = generateScale(color)
  const swatches = [
    { key: 'white', label: 'White', hex: WHITE },
    ...SCALE_STEPS.map(step => ({ key: step, label: step, hex: scale[step], isBase: step === 400 })),
    { key: 'black', label: 'Black', hex: BLACK, isOutlined: true },
  ]
  return (
    <div className="wds-scale-row">
      <div className="wds-picker-row">
        <GSinput type="color" textValue={color} onChange={e => onChangeColor(e.target.value)} />
        <div className="wds-presets">
          {PRESET_COLORS.map(hex => (
            <button
              key={hex}
              type="button"
              className="wds-preset"
              style={{ backgroundColor: hex }}
              onClick={() => onChangeColor(hex)}
              title={hex}
              aria-label={`Use ${hex}`}
            />
          ))}
        </div>
      </div>
      <div className="wds-mode-label">Light Mode</div>
      <ScaleSwatches swatches={swatches} familyLabel={colorName} syncScroll />
      <div className="wds-mode-label">Dark Mode</div>
      <ScaleSwatches swatches={[...swatches].reverse()} familyLabel={colorName} syncScroll />
    </div>
  )
}

// Attaches a scroll listener to each of the 6 syncScroll rows (Primary/
// Secondary/Neutral x Light/Dark) so dragging any one of them scrolls the
// rest to match. Queried by class rather than threaded through refs since
// the 6 rows live under three separate GSFormSections, not one shared
// parent short of the whole page.
function useSyncedSwatchScroll() {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll('.wds-swatches--synced'))
    if (rows.length < 2) return
    let syncing = false
    const cleanups = rows.map(row => {
      const onScroll = () => {
        if (syncing) return
        syncing = true
        rows.forEach(other => {
          if (other !== row) other.scrollLeft = row.scrollLeft
        })
        syncing = false
      }
      row.addEventListener('scroll', onScroll)
      return () => row.removeEventListener('scroll', onScroll)
    })
    return () => cleanups.forEach(cleanup => cleanup())
  }, [])
}

// The 6 Fill/Outline/Subtle x Primary/Secondary GSButton variants (see
// gs-button.jsx's color/appearance props) — same variants EventWebsitePage
// uses, previewed here so a Primary/Secondary edit above shows what its
// buttons will actually look like before saving.
const BUTTON_VARIANTS = [
  { color: 'primary-color', appearance: 'fill', label: 'Primary Fill' },
  { color: 'primary-color', appearance: 'outline', label: 'Primary Outline' },
  { color: 'primary-color', appearance: 'subtle', label: 'Primary Subtle' },
  { color: 'secondary-color', appearance: 'fill', label: 'Secondary Fill' },
  { color: 'secondary-color', appearance: 'outline', label: 'Secondary Outline' },
  { color: 'secondary-color', appearance: 'subtle', label: 'Secondary Subtle' },
]

// The `--gs-color-*` tokens GSButton's Fill/Outline/Subtle variants read
// (gs-lib/styles/theme.scss's role names) — computed here from this
// screen's own Primary/Secondary scales exactly the way EventWebsitePage.jsx
// computes them for the live site, so this preview and that site can't
// drift apart. Set as inline style on a wrapping div (same "inject as CSS
// custom properties" approach EventWebsitePage.jsx uses on its root div).
function buttonPreviewStyle(primaryScale, secondaryScale, mode) {
  // Fill/Outline's base color sits two steps lighter in dark mode (400 ->
  // 200) so it doesn't read as a flat, oversaturated block against a dark
  // background — same convention EventWebsitePage.jsx's own
  // --gs-color-primary/-secondary follow, so the two can't drift apart.
  const primaryBase = primaryScale[mode === 'dark' ? 200 : 400]
  const secondaryBase = secondaryScale[mode === 'dark' ? 200 : 400]
  const primarySubtleBg = primaryScale[mode === 'dark' ? 700 : 100]
  const secondarySubtleBg = secondaryScale[mode === 'dark' ? 700 : 100]
  // Subtle text is pinned opposite its background's mode — 900 in light
  // mode, 50 in dark mode — not AA-picked, same convention EventWebsitePage
  // uses for its own Subtle buttons.
  const subtleTextStep = mode === 'dark' ? 50 : 900
  // Dark mode's Fill background is a light tint (primaryBase/secondaryBase
  // above, step 200), so its text needs to be dark (900), not light (50)
  // the way light mode's step-400 background needs.
  const fillTextStep = mode === 'dark' ? 900 : 50
  return {
    '--gs-color-primary': primaryBase,
    '--gs-color-on-primary-fill': primaryScale[fillTextStep],
    '--gs-color-primary-subtle': primarySubtleBg,
    '--gs-color-on-primary-subtle': primaryScale[subtleTextStep],
    '--gs-color-secondary': secondaryBase,
    '--gs-color-on-secondary-fill': secondaryScale[fillTextStep],
    '--gs-color-secondary-subtle': secondarySubtleBg,
    '--gs-color-on-secondary-subtle': secondaryScale[subtleTextStep],
  }
}

function ButtonPreviewRow({ primaryScale, secondaryScale, mode }) {
  return (
    <div className="wds-button-row" style={buttonPreviewStyle(primaryScale, secondaryScale, mode)}>
      {BUTTON_VARIANTS.map(({ color, appearance, label }) => (
        <GSButton key={`${color}-${appearance}`} color={color} appearance={appearance} title={label} isFocusable />
      ))}
    </div>
  )
}

// Every role defaultTheme (Theme.js) defines, previewed in a Theme
// Definitions row. Primary/Secondary/Tertiary/Error show their *Container
// pairing (the filled/background form, more informative as a swatch than
// the text-only `primary`/`secondary`/`tertiary`/`error` roles) — Secondary
// High is the one exception, an already-a-container "higher emphasis"
// sibling of Secondary. Background through Outline Variant are the
// neutral-based roles Monochromatic can re-tint.
const THEME_ROLES = [
  { key: 'primaryContainer', label: 'Primary' },
  { key: 'secondaryContainer', label: 'Secondary' },
  { key: 'secondaryContainerHigh', label: 'Secondary High' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'surfaceDim', label: 'Surface Dim' },
  { key: 'surfaceBright', label: 'Surface Bright' },
  { key: 'surfaceContainerLowest', label: 'Surface Container Lowest' },
  { key: 'surfaceContainerLow', label: 'Surface Container Low' },
  { key: 'surfaceContainerHigh', label: 'Surface Container High' },
  { key: 'surfaceContainerHigest', label: 'Surface Container Highest' },
  { key: 'surfaceVariant', label: 'Surface Variant' },
  { key: 'outline', label: 'Outline' },
  { key: 'outlineVariant', label: 'Outline Variant' },
  { key: 'tertiaryContainer', label: 'Tertiary' },
  { key: 'errorContainer', label: 'Error' },
  { key: 'scrim', label: 'Scrim' },
]

// Roles whose color actually comes from the Neutral scale in defaultTheme
// (Theme.js) — only these are eligible for the Monochromatic swap, and are
// the ones forced to defaultTheme's own values below regardless of theme.
// primaryContainer/secondaryContainer(High) are Primary/Secondary, and
// Tertiary/Error/Scrim are each theme's own fixed brand colors — neither is
// Neutral, so both are left alone either way.
const NEUTRAL_ROLE_KEYS = [
  'background',
  'surface',
  'surfaceDim',
  'surfaceBright',
  'surfaceContainerLowest',
  'surfaceContainerLow',
  'surfaceContainerHigh',
  'surfaceContainerHigest',
  'surfaceVariant',
  'outline',
  'outlineVariant',
]

// Plain-neutral (non-monochromatic) reference for every hex defaultTheme's
// 5 neutral roles can hold — same White/Black/Grey-N naming NEUTRAL_SWATCHES
// above uses, keyed by normalized hex so it can look up roleColor's output.
const GREY_LABEL_BY_HEX = {
  [normalizeHex(WHITE)]: 'White',
  [normalizeHex(BLACK)]: 'Black',
  [normalizeHex(golfstatusColors.grey50)]: 'Grey 50',
  [normalizeHex(golfstatusColors.grey100)]: 'Grey 100',
  [normalizeHex(golfstatusColors.grey200)]: 'Grey 200',
  [normalizeHex(golfstatusColors.grey300)]: 'Grey 300',
  [normalizeHex(golfstatusColors.grey400)]: 'Grey 400',
  [normalizeHex(golfstatusColors.grey500)]: 'Grey 500',
  [normalizeHex(golfstatusColors.grey600)]: 'Grey 600',
  [normalizeHex(golfstatusColors.grey700)]: 'Grey 700',
  [normalizeHex(golfstatusColors.grey800)]: 'Grey 800',
  [normalizeHex(golfstatusColors.grey900)]: 'Grey 900',
}

function roleColor(mergedRoles, roleKey, mode) {
  const role = mergedRoles[roleKey]?.[mode]
  return role?.backgroundColor ?? role?.borderColor ?? role?.color
}

// What a role swatch's color actually *is*, named instead of hex-dumped —
// primaryContainer/secondaryContainer are always the 400 step of their
// scale, Secondary High the 600 step (see containerFromScale/
// containerHighFromScale above — default theme only, since Winter/Lavender
// give it a fixed hex of its own with no scale to name a step from); a
// neutral role is either plain Grey/White/Black, or — under Monochromatic —
// whatever step of the Primary scale monochromatize() substituted in for
// it. Tertiary/Error/Scrim are each theme's own fixed brand color, with no
// scale to name a step from either, so they fall back to their raw hex.
function roleColorLabel(key, roleHex, monochromatic, isDefaultTheme) {
  if (key === 'primaryContainer') return 'Primary 400'
  if (key === 'secondaryContainer') return 'Secondary 400'
  if (key === 'secondaryContainerHigh') return isDefaultTheme ? 'Secondary 600' : roleHex
  if (NEUTRAL_ROLE_KEYS.includes(key)) {
    if (monochromatic) {
      if (key === 'outlineVariant') return `Primary ${OUTLINE_VARIANT_MONO_STEP}`
      const step = NEUTRAL_STEP_BY_HEX[normalizeHex(roleHex)]
      return step ? `Primary ${step}` : roleHex
    }
    return GREY_LABEL_BY_HEX[normalizeHex(roleHex)] ?? roleHex
  }
  return roleHex
}

// Parses a typed reference like "Primary 900", "grey 50", or "White" back
// into { hex, label } — the inverse of roleColorLabel/GREY_LABEL_BY_HEX
// above, so a Theme Definitions swatch's own text can be edited in place
// (see wds-swatch-hex-input below) instead of only ever being read from.
// Returns null for anything that doesn't match a real family+step.
function parseColorRef(text, { primaryScale, secondaryScale }) {
  const trimmed = text.trim()
  if (/^white$/i.test(trimmed)) return { hex: WHITE, label: 'White' }
  if (/^black$/i.test(trimmed)) return { hex: BLACK, label: 'Black' }
  const match = trimmed.match(/^(primary|secondary|grey)\s*(\d{2,3})$/i)
  if (!match) return null
  const step = Number(match[2])
  if (!SCALE_STEPS.includes(step)) return null
  const family = match[1].toLowerCase()
  const label = `${family[0].toUpperCase()}${family.slice(1)} ${step}`
  if (family === 'primary') return { hex: primaryScale[step], label }
  if (family === 'secondary') return { hex: secondaryScale[step], label }
  return { hex: golfstatusColors[`grey${step}`], label }
}

// Primary/Secondary are represented by the 400 step in both modes here —
// the same step Base Color (400) above actually is, rather than a derived
// shade — so the Theme Definitions preview shows the color you picked, not
// a contrast-driven variant of it.
function accentFromScale(scale) {
  return { light: { color: scale[400] }, dark: { color: scale[400] } }
}
// On-container text: 900 (near-black tint of the hue) reads on a light
// container in light mode, 50 (near-white tint) reads on it in dark mode —
// same convention Winter/Lavender's own fixed on-container inks already
// follow, just computed instead of hand-picked.
function containerFromScale(scale) {
  return {
    light: { backgroundColor: scale[400], color: scale[900] },
    dark: { backgroundColor: scale[400], color: scale[50] },
  }
}
// Secondary High's own "higher emphasis than the base container" shade —
// same 600 step Winter/Lavender's own fixed secondaryContainerHigh sits
// noticeably darker than their secondaryContainer at.
function containerHighFromScale(scale) {
  return {
    light: { backgroundColor: scale[600], color: scale[900] },
    dark: { backgroundColor: scale[600], color: scale[50] },
  }
}

// One theme's Light/Dark role swatches, Neutral and Monochromatic stacked
// on top of each other for each mode (no toggle — both are always visible
// so the two can be compared directly). For "default" specifically, Primary/
// Secondary are regenerated live from this screen's own color pickers
// instead of reading the (empty) colorThemes.default.overrides — this is
// the "update the theme[] with the new colors" behavior. Background/
// Surface/Surface Variant/Outline/Outline Variant are forced to
// defaultTheme's own Neutral values for every theme (see the merge below),
// regardless of what that theme's own file defines for them, so Winter/
// Lavender read as plain neutral here too until Monochromatic re-tints
// them with that theme's own primary hue.
// `overrides`/`onChangeOverrides` make a row's edits persist-and-reflect on
// the live site instead of staying local-preview-only — only ever passed
// for the "default" (GolfStatus) theme (see WebsiteDesignStyleFields below),
// since Winter/Lavender aren't derived from this screen's own style at all.
function ThemeDefinitionRow({ themeKey, primaryScale, secondaryScale, overrides: savedOverrides, onChangeOverrides }) {
  // Per-swatch overrides typed into wds-swatch-hex-input (keyed by
  // "mode-monochromatic-role", since the same role key appears once per
  // mode x Neutral/Monochromatic variant below) — lets a swatch be riffed
  // on directly ("type Primary 900, see it become Primary 900") without
  // touching the Primary/Secondary pickers above. `draft` holds the raw
  // in-progress text for a focused input; it's committed into `overrides`
  // (parsed to a real hex) on blur/Enter, or discarded if unparseable.
  const isSaved = onChangeOverrides != null
  const [localOverrides, setLocalOverrides] = useState({})
  const overrides = isSaved ? savedOverrides ?? {} : localOverrides
  const setOverrides = isSaved ? onChangeOverrides : setLocalOverrides
  const [draft, setDraft] = useState({})
  const commitEdit = (cellKey, text) => {
    setDraft(d => {
      if (!(cellKey in d)) return d
      const next = { ...d }
      delete next[cellKey]
      return next
    })
    const trimmed = text.trim()
    if (!trimmed) {
      setOverrides(o => {
        if (!(cellKey in o)) return o
        const next = { ...o }
        delete next[cellKey]
        return next
      })
      return
    }
    const parsed = parseColorRef(trimmed, { primaryScale, secondaryScale })
    if (parsed) setOverrides(o => ({ ...o, [cellKey]: parsed }))
    // Unparseable text is simply discarded (draft above already cleared),
    // reverting the input back to whatever it showed before the edit.
  }
  const preset = colorThemes[themeKey]
  const accentOverrides = themeKey === 'default'
    ? {
        primary: accentFromScale(primaryScale),
        secondary: accentFromScale(secondaryScale),
        primaryContainer: containerFromScale(primaryScale),
        secondaryContainer: containerFromScale(secondaryScale),
        secondaryContainerHigh: containerHighFromScale(secondaryScale),
      }
    : preset.overrides
  // The Neutral-scale roles always read defaultTheme's own values here —
  // even for Winter/Lavender, whose own theme files give these roles their
  // own tint (e.g. Winter's outline is blue, not grey) — so every theme
  // looks identical on these roles until Monochromatic (below) deliberately
  // moves them off Neutral. Tertiary/Error/Scrim are left alone (read from
  // accentOverrides/defaultTheme above) since those are each theme's own
  // fixed brand color, not a Neutral role.
  const merged = mergedTheme({
    ...accentOverrides,
    ...Object.fromEntries(NEUTRAL_ROLE_KEYS.map(key => [key, defaultTheme[key]])),
  })
  // Each theme substitutes with its *own* primary hue, not this screen's
  // picker — Winter/Lavender have their own accent color already.
  const monoScale = themeKey === 'default' ? primaryScale : generateScale(preset.overrides.primary.light.color)

  return (
    <div className="wds-theme-def">
      <div className="wds-theme-def-name">{preset.name}</div>
      {['light', 'dark'].map(mode => (
        <div key={mode}>
          <div className="wds-mode-label">{mode === 'light' ? 'Light Mode' : 'Dark Mode'}</div>
          {[false, true].map(monochromatic => (
            <div key={String(monochromatic)}>
              <div className="wds-variant-label">{monochromatic ? 'Monochromatic' : 'Neutral'}</div>
              <div className="wds-swatches wds-swatches--synced">
                {THEME_ROLES.map(({ key, label }) => {
                  const roleHex = roleColor(merged, key, mode)
                  // Surface Bright stays plain white in light mode regardless
                  // of Monochromatic — every other Neutral role is fair game
                  // for the Primary re-tint, but this one role is pinned so
                  // there's always at least one guaranteed-white surface.
                  const forceWhite = key === 'surfaceBright' && mode === 'light'
                  const computedLabel = forceWhite ? 'White' : roleColorLabel(key, roleHex, monochromatic, themeKey === 'default')
                  const computedHex = forceWhite
                    ? WHITE
                    : monochromatic && NEUTRAL_ROLE_KEYS.includes(key)
                      ? key === 'outlineVariant' ? monoScale[OUTLINE_VARIANT_MONO_STEP] : monochromatize(roleHex, monoScale)
                      : roleHex
                  const cellKey = `${mode}-${monochromatic}-${key}`
                  const override = overrides[cellKey]
                  const hex = override?.hex ?? computedHex
                  const displayLabel = draft[cellKey] ?? override?.label ?? computedLabel
                  return (
                    <div className="wds-swatch" key={key}>
                      <div className="wds-swatch-color" style={{ backgroundColor: hex }} />
                      <div className="wds-swatch-step">{label}</div>
                      <input
                        className="wds-swatch-hex wds-swatch-hex-input"
                        value={displayLabel}
                        onChange={e => setDraft(d => ({ ...d, [cellKey]: e.target.value }))}
                        onFocus={e => e.target.select()}
                        onBlur={e => commitEdit(cellKey, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') e.currentTarget.blur()
                        }}
                        aria-label={`${label} color reference — type e.g. "Primary 900" to change it`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// The Website Design and Style screen — opened directly off the Event Site &
// Packages hub's own "Website Design and Style" row, same fully-controlled
// fields-only convention as EventSiteHomepageFields: the page that owns the
// single AppSidePanel holds this draft state and the Save/Cancel actions.
// Primary/Secondary mirrors Material's own naming; Neutral is fixed (see
// NEUTRAL_SWATCHES above); Theme Definitions previews how the three compose
// into Default/Winter/Lavender (see gs-lib/helpers/colorThemes.js), with an
// optional Monochromatic re-tint of the neutral roles.
export default function WebsiteDesignStyleFields({
  primaryColor,
  onChangePrimaryColor,
  secondaryColor,
  onChangeSecondaryColor,
  themeOverrides,
  onChangeThemeOverrides,
}) {
  const primaryScale = generateScale(primaryColor)
  const secondaryScale = generateScale(secondaryColor)
  useSyncedSwatchScroll()

  return (
    <div className="ordr1-list">
      <GSActionBar type="form-header H3" header="Website Design and Style" />

      <GSFormSection
        title="Primary Color"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Base Color (400)',
            isEditable: true,
            customView: true,
            value: <ColorScaleRow color={primaryColor} onChangeColor={onChangePrimaryColor} colorName="Primary" />,
          },
        ]}
      />

      <GSFormSection
        title="Secondary Color"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Base Color (400)',
            isEditable: true,
            customView: true,
            value: <ColorScaleRow color={secondaryColor} onChangeColor={onChangeSecondaryColor} colorName="Secondary" />,
          },
        ]}
      />

      <GSFormSection
        title="Button Styles"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Fill / Outline / Subtle for Primary and Secondary',
            isEditable: true,
            customView: true,
            value: (
              <div className="wds-scale-row">
                <div className="wds-mode-label">Light Mode</div>
                <ButtonPreviewRow primaryScale={primaryScale} secondaryScale={secondaryScale} mode="light" />
                <div className="wds-mode-label">Dark Mode</div>
                <ButtonPreviewRow primaryScale={primaryScale} secondaryScale={secondaryScale} mode="dark" />
              </div>
            ),
          },
        ]}
      />

      <GSFormSection
        title="Neutral"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Fixed palette — not editable',
            isEditable: false,
            value: (
              <div className="wds-scale-row">
                <div className="wds-mode-label">Light Mode</div>
                <ScaleSwatches swatches={NEUTRAL_SWATCHES} familyLabel="Grey" syncScroll />
                <div className="wds-mode-label">Dark Mode</div>
                <ScaleSwatches swatches={[...NEUTRAL_SWATCHES].reverse()} familyLabel="Grey" syncScroll />
              </div>
            ),
          },
        ]}
      />

      <GSFormSection
        title="Theme Definitions"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'How Primary/Secondary/Neutral compose into each theme',
            isEditable: true,
            customView: true,
            value: (
              <div className="wds-theme-defs">
                {colorThemeKeys.map(key => (
                  <ThemeDefinitionRow
                    key={key}
                    themeKey={key}
                    primaryScale={primaryScale}
                    secondaryScale={secondaryScale}
                    {...(key === 'default' ? { overrides: themeOverrides, onChangeOverrides: onChangeThemeOverrides } : {})}
                  />
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
