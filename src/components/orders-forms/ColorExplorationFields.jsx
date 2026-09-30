import { useEffect, useRef, useState } from 'react'
import { faPalette } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSinput from '../../gs-lib/components/gs-input'
import { generateScale, buttonThemeVars, SCALE_STEPS } from '../../gs-lib/helpers/colorScale'
import { golfstatusColors } from '../../gs-lib/helpers/Theme'
import { pickAccessibleTextColor, contrastRatio } from '../../gs-lib/helpers/contrast'
import { resolveOverrideHex, OUTLINE_VARIANT_MONO_STEP } from '../../gs-lib/helpers/monochromatic'
import {
  BUTTON_COLORS,
  BUTTON_APPEARANCES,
  BUTTON_IDS,
  BUTTON_DEFAULTS,
  buttonOverrideKey,
  buttonVarName,
  resolveButtonOverride,
} from '../../data/eventSiteButtons.js'
import './WebsiteDesignStyleFields.scss'
import './ColorExplorationFields.scss'

// White/black stand in for a handful of roles below (theme.scss's
// .gs-theme-default/.dark aren't tied to any generated scale, so there's no
// `scale[step]` to read them from) and as parseDesignation/refToText's own
// "white"/"black" family.
const WHITE = '#FFFFFF'
const BLACK = '#000000'

// Neutral is the app's own fixed greyscale (colors.scss's $grey-50...
// $grey-900, via Theme.js's golfstatusColors) — shown for reference, unlike
// Primary/Secondary it never comes from Website Design and Style at all,
// since a design system's neutral ramp isn't something a single event's
// brand color should be able to drift. Keyed by step, same shape as
// generateScale()'s return, so it can feed a RampGroup below the same way
// primaryScale/secondaryScale do.
const NEUTRAL_SCALE = Object.fromEntries(SCALE_STEPS.map(step => [step, golfstatusColors[`grey${step}`]]))

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

// <input type="color"> only accepts a full 6-digit #rrggbb — expands a
// shorthand 3-digit hex (valid everywhere else) so the native picker
// doesn't just silently fall back to black on one. Same helper
// WebsiteDesignStyleFields.jsx's own HexColorField uses.
function toFullHex(hex) {
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  return hex
}

// A hex-code text field for Primary/Secondary's base color (400) — Neutral
// has none, its ramp is fixed. Same convention as
// WebsiteDesignStyleFields.jsx's own HexColorField (reused via its
// wds-hex-field/wds-hex-native-picker classes, already available here
// through the shared WebsiteDesignStyleFields.scss import): its own
// draft/commit cycle so a half-typed hex like "#1" never gets pushed into
// generateScale mid-keystroke, only a valid 3- or 6-digit hex commits on
// blur/Enter; the palette icon (GSinput's leftIcon) reopens the real
// <input type="color">, kept off-screen rather than display:none, which
// some browsers refuse to open a picker from. Lives in its own small row
// above the ramp comparison grid below (RampGroup's `picker`) instead of
// repeated per-ramp, so editing the base color doesn't compete with the
// grid itself for space. This is the same primaryColor/secondaryColor
// Website Design and Style edits (both read/write the same styleDraft via
// EventSitePackagesListPage.jsx), so a change from either screen shows up
// on the other and on /event-site alike.
function BaseColorPicker({ color, onChangeColor }) {
  const [draft, setDraft] = useState(color)
  useEffect(() => setDraft(color), [color])
  const colorPickerRef = useRef(null)
  const commit = () => {
    const trimmed = draft.trim()
    if (HEX_RE.test(trimmed)) onChangeColor(trimmed)
    else setDraft(color)
  }
  const openColorPicker = () => {
    const picker = colorPickerRef.current
    if (picker?.showPicker) picker.showPicker()
    else picker?.click()
  }
  return (
    <div className="wds-hex-field">
      <GSinput
        textValue={draft}
        placeholder="#RRGGBB"
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onSubmit={commit}
        leftIcon={faPalette}
        leftIconClick={openColorPicker}
      />
      <input
        ref={colorPickerRef}
        type="color"
        className="wds-hex-native-picker"
        tabIndex={-1}
        aria-hidden="true"
        value={toFullHex(color)}
        onChange={e => onChangeColor(e.target.value)}
      />
    </div>
  )
}

// Parses a typed designation like "Primary 900", "Secondary 200", "Neutral
// 50" (alias "Grey 50"), "White", or "Black" back into { family, step } —
// the exact shape monochromatic.js's resolveOverrideHex expects (family:
// white/black/primary/secondary/grey), so a reference saved here resolves
// identically on the live site (EventWebsitePage.jsx) as it does in this
// preview. `impliedFamily`, when given, also accepts a bare step ("600")
// for contexts where the family is already obvious (a Primary/Secondary
// group's own On X/Subtle roles) rather than needing "Primary 600" spelled
// out redundantly under a "PRIMARY" heading. Returns null for anything
// that doesn't match.
function parseDesignation(text, impliedFamily) {
  const trimmed = text.trim()
  if (/^white$/i.test(trimmed)) return { family: 'white' }
  if (/^black$/i.test(trimmed)) return { family: 'black' }
  const withFamily = trimmed.match(/^(primary|secondary|neutral|grey)\s*(\d{2,3})$/i)
  if (withFamily) {
    const step = Number(withFamily[2])
    if (!SCALE_STEPS.includes(step)) return null
    const family = withFamily[1].toLowerCase()
    return { family: family === 'neutral' ? 'grey' : family, step }
  }
  if (impliedFamily && /^\d{2,3}$/.test(trimmed)) {
    const step = Number(trimmed)
    if (!SCALE_STEPS.includes(step)) return null
    return { family: impliedFamily, step }
  }
  return null
}

// The inverse of parseDesignation — how a { family, step } reference reads
// back as text. `grey` displays as "Neutral" (this screen's own naming for
// that scale, see NEUTRAL_SCALE above) rather than monochromatic.js's
// internal "grey" family name.
function refToText(ref) {
  if (!ref) return ''
  if (ref.family === 'white') return 'White'
  if (ref.family === 'black') return 'Black'
  if (ref.family === 'grey') return `Neutral ${ref.step}`
  if (ref.family === 'primary') return `Primary ${ref.step}`
  if (ref.family === 'secondary') return `Secondary ${ref.step}`
  return ''
}

// A designation's compact form — just the bare step ("600") when the
// family is implied by context (a Primary/Secondary group's own roles, see
// parseDesignation's impliedFamily) and there is one, else the same full
// "Family N" text refToText gives everywhere else (White/Black have no
// step to bare down to either way).
function compactRefText(ref) {
  return ref?.step != null ? String(ref.step) : refToText(ref)
}

// EVENT_SITE_USED_KEYS' 11 roles, keyed by their own lowercase label — how
// Site Colors' per-element designation inputs (ELEMENT_DEFS,
// resolveElementDesignable) resolve typed text like "On Primary" back to a
// role key. An element points at a ROLE by name there, not a literal scale
// step like "Primary 100" — that stays the Theme tab's own vocabulary
// (RoleCompareTable/resolveDesignable above), since aliasing a role keeps
// an element tracking whatever that role itself currently resolves to
// (tint, its own themeOverrides riff, ...) instead of freezing one scale
// step forever.
const ROLE_LABEL_TO_KEY = {
  'primary': 'primary',
  'on primary': 'onPrimary',
  'secondary': 'secondary',
  'on secondary': 'onSecondary',
  'background': 'background',
  'on background': 'onBackground',
  'surface': 'surface',
  'on surface': 'onSurface',
  'surface variant': 'surfaceVariant',
  'on surface variant': 'onSurfaceVariant',
  'surface container low': 'surfaceContainerLow',
  'surface container high': 'surfaceContainerHigh',
  'surface container highest': 'surfaceContainerHigest',
  'surface bright': 'surfaceBright',
  'outline': 'outline',
  'outline variant': 'outlineVariant',
  'tertiary': 'tertiaryContainer',
}

function parseRoleReference(text) {
  return ROLE_LABEL_TO_KEY[text.trim().toLowerCase()] ?? null
}

// The small editable text spot for a role's designation (RampChip, below
// the role name) — its own draft/commit cycle, same convention as
// BaseColorPicker's hex field above: an unparseable or half-typed value
// never commits, it just reverts to the last real designation on
// blur/Enter (see parseDesignation). Clearing it entirely resets that role
// back to its own computed default (see ColorExplorationFields' own
// resolveDesignable).
const SCALE_DESIGNATIONS = [
  'White',
  'Black',
  ...['Primary', 'Secondary', 'Neutral'].flatMap(family => SCALE_STEPS.map(step => `${family} ${step}`)),
]
// Theme roles only — an element points at a role, never a raw scale step.
const ROLE_DESIGNATIONS = ['Primary', 'On Primary', 'On Primary Fill', 'Primary Subtle', 'On Primary Subtle', 'Secondary', 'On Secondary', 'On Secondary Fill', 'Secondary Subtle', 'On Secondary Subtle', 'Background', 'On Background', 'Surface', 'On Surface', 'Surface Variant', 'On Surface Variant', 'Surface Container Low', 'Surface Container High', 'Surface Container Highest', 'Surface Bright', 'Outline', 'Outline Variant', 'Placeholder', 'Tertiary', 'On Tertiary']

function DesignationInput({ value, onCommit, hint, placeholder, options = SCALE_DESIGNATIONS }) {
  // A dropdown, not free text: `value` is the assigned designation, else the
  // inherited one (`placeholder`, see resolveElementDesignable) so the list
  // always shows what the element is actually reading right now. Choosing
  // "—" clears the assignment.
  const current = value || placeholder || ''
  const choices = current && !options.includes(current) ? [current, ...options] : options
  return (
    <select
      className="wds-ramp-chip-designation"
      value={current}
      onChange={e => onCommit(e.target.value)}
      aria-label={hint ?? 'Which scale step this reads from'}
    >
      <option value="">—</option>
      {choices.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  )
}

// 900 (darkest) at top down to 50 (lightest) at bottom — the Color Ramps
// tab's RampRowLabels shared column and every RampPill below share this
// exact order, so a given row means the same step everywhere without
// needing to reverse anything per column.
const RAMP_STEPS = [...SCALE_STEPS].reverse()

// One row's swatch inside a RampPill — the color itself is the same real
// value regardless of which pill (Light/Dark) it's in; only the pill's own
// background changes, previewing how the same value reads against a light
// vs a dark backdrop. `label` renders above the hex (the Theme/Event Site
// tabs' own role name, e.g. "Background") — the Color Ramps tab leaves it
// unset since its rows are already labeled once, externally, by
// RampRowLabels. `designation`/`onChangeDesignation` (also Theme/Event
// Site only) render as an editable DesignationInput in the same spot a
// read-only role would otherwise have nothing — left unset entirely for a
// role this screen doesn't allow reassigning (the Default/GolfStatus
// theme's own base Primary/Secondary swatch; see liveThemeRoleDefs/
// golfStatusRoleDefs below), which then shows just the label and hex.
// `isBase` marks the Color Ramps tab's own 400 step — a 4px border around
// just that swatch shows which one the Base Color hex field above (and
// Website Design and Style's own Colors section) is currently set to.
// Dark-on-light / white-on-dark (via the wds-ramp-pill--light/--dark
// ancestor selectors below) so the border reads against either backdrop
// instead of picking one that vanishes on the other.
function RampChip({ caption, label, hex, isBase, designation, onChangeDesignation, designationHint, designationPlaceholder, designationOptions }) {
  // Auto height whenever there's a label and/or a designation slot (more
  // than just a color + hex) — not just when there's a label, since the
  // Theme tab's own role-compare table below passes chips with a
  // designation but no repeated label (the row's own left-hand label
  // column already names the role).
  const expanded = Boolean(label) || Boolean(onChangeDesignation)
  return (
    <div className={`wds-ramp-chip${expanded ? ' wds-ramp-chip--labeled' : ''}`}>
      <div className={`wds-ramp-chip-color${isBase ? ' wds-ramp-chip-color--base' : ''}`} style={{ backgroundColor: hex }} />
      {label && <div className="wds-ramp-chip-label">{label}</div>}
      {onChangeDesignation && (
        <DesignationInput value={designation} onCommit={onChangeDesignation} hint={designationHint} placeholder={designationPlaceholder} options={designationOptions} />
      )}
      <div className="wds-ramp-chip-hex">{caption ?? hex}</div>
    </div>
  )
}

// `items` is `[{ key, label?, hex, isBase?, designation?, onChangeDesignation? }]`
// — RAMP_STEPS-derived for the Color Ramps tab (no label/designation, see
// RampChip above) or a resolveDesignable()-built list for the Theme/Event
// Site tabs (each row already carries its own role name and, where this
// screen allows it, an editable designation).
function RampPill({ mode, items }) {
  return (
    <div className={`wds-ramp-pill wds-ramp-pill--${mode}`}>
      {items.map(({ key, label, hex, isBase, designation, onChangeDesignation }) => (
        <RampChip key={key} label={label} hex={hex} isBase={isBase} designation={designation} onChangeDesignation={onChangeDesignation} />
      ))}
    </div>
  )
}

// The far-left step labels (900...50) for the Color Ramps tab, on their own
// so they aren't repeated per group — wds-ramp-head-spacer
// (ColorExplorationFields.scss) reserves the same height as a RampGroup's
// own header+picker block below so the labels line up with every group's
// chip rows regardless of whether that group has a picker under its title
// or not. The Theme/Event Site tabs have no equivalent: their groups don't
// share a row domain (Neutral/GolfStatus have far more roles than Primary/
// Secondary), so their RampGroups instead label each chip individually
// (see RampChip above).
function RampRowLabels() {
  return (
    <div className="wds-ramp-row-labels">
      <div className="wds-ramp-head-spacer" />
      {RAMP_STEPS.map(step => (
        <div className="wds-ramp-row-label" key={step}>{step}</div>
      ))}
    </div>
  )
}

// One Neutral/Primary/Secondary/GolfStatus column pair — a title, an
// optional note/control under it, and its Light/Dark RampPill columns.
// Only the Color Ramps tab passes a `picker` (Neutral's is a fixed note;
// Primary/Secondary get the actual BaseColorPicker) — when one's present,
// the head block gets a fixed height matching RampRowLabels' own spacer so
// chip rows still line up with the shared step-label column; the Theme/
// Event Site tabs' groups (no picker) don't need that since they've got no
// shared row labels to align with.
function RampGroup({ label, picker, light, dark }) {
  return (
    <div className="wds-ramp-group">
      <div className={`wds-ramp-group-head${picker ? ' wds-ramp-group-head--fixed' : ''}`}>
        <div className="wds-ramp-group-title">{label}</div>
        {picker}
      </div>
      <div className="wds-ramp-group-pills">
        <RampPill mode="light" items={light} />
        <RampPill mode="dark" items={dark} />
      </div>
    </div>
  )
}

// The Neutral/Primary/Secondary groups (see resolveGroup), Primary and
// Secondary and Neutral run down as row-group sections rather than each
// theme getting its own block — so scrolling down through Background, On
// Background, Surface, ... lets you scan left-to-right across Neutral/
// Primary/Secondary Tint and compare them directly, instead of scrolling
// all the way past one whole theme's own Neutral/Primary/Secondary to
// reach the next theme's Background again.
const THEME_TABLE_GROUPS = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'neutral', label: 'Neutral' },
]

// One role's Light+Dark chip pair for one tint theme — a small light/dark
// backdrop each (wds-role-chip-slot--light/--dark), same idea as
// wds-ramp-pill's own backdrop, just sized to one chip instead of a whole
// column of them.
function RoleCompareCell({ light, dark, designationHint, designationOptions }) {
  return (
    <div className="wds-role-row-theme">
      <div className="wds-role-chip-slot wds-role-chip-slot--light">
        <RampChip
          caption={light.caption}
          hex={light.hex}
          designation={light.designation}
          onChangeDesignation={light.onChangeDesignation}
          designationHint={designationHint}
          designationPlaceholder={light.placeholder}
          designationOptions={designationOptions}
        />
      </div>
      <div className="wds-role-chip-slot wds-role-chip-slot--dark">
        <RampChip
          caption={dark.caption}
          hex={dark.hex}
          designation={dark.designation}
          onChangeDesignation={dark.onChangeDesignation}
          designationHint={designationHint}
          designationPlaceholder={dark.placeholder}
          designationOptions={designationOptions}
        />
      </div>
    </div>
  )
}

// One Site Colors per-element row (ELEMENT_DEFS) — a label plus one
// light/dark RoleCompareCell per tint theme (`columns`, one column per
// flattenedTintThemes entry, same grid shape wds-role-row's own 3-tint-
// theme rows use), so a role reference an element points at shows how it
// actually renders under Neutral/Primary/Secondary Tint at once — the
// override itself is the same across all three (see resolveElementDesignable),
// only what it currently resolves to differs. `cssVar` (SITE_ELEMENT_CSS_VAR)
// names the real `--es-el-*` custom property this element's designation
// actually writes to on the live /event-site page — shown so an edit here
// reads as a concrete site change, not just a local preview value.
// GolfStatus is the master theme: its slot is what every tile reads.
const CANONICAL_THEME = 'golfstatus'
const ELEMENT_DESIGNATION_HINT = 'Which role this reads from — type e.g. "On Primary" or "Secondary"'

// Shared by the Theme and Site Colors tabs: the row's name (and, for
// Site Colors, its --es-el-* var) sits above, then one RoleCompareCell per
// theme spans the full width beneath it.
function CompareRow({ label, cssVar, columns, designationHint, designationOptions, control }) {
  return (
    <div className="wds-compare-row">
      <div className="wds-compare-row-head">
        <div className="wds-compare-row-label">
          {label}
          {cssVar && <div className="wds-site-color-var">{cssVar}</div>}
        </div>
        {control}
      </div>
      <div className="wds-compare-row-cells">
        {columns.map(column => (
          <RoleCompareCell key={column.key} light={column.light} dark={column.dark} designationHint={designationHint} designationOptions={designationOptions} />
        ))}
      </div>
    </div>
  )
}

function CompareHeader({ themes }) {
  return (
    <div className="wds-compare-header">
      {themes.map(theme => (
        <div className="wds-role-row-theme-header" key={theme.key}>{theme.label}</div>
      ))}
    </div>
  )
}

// The Theme tab's own table — tintThemes (see ColorExplorationFields'
// own tintThemes) as columns, every Primary/Secondary/Neutral role as its
// own row, so a role's value across all three tint themes sits in one
// horizontal scan instead of three separate scrolls. Each tintThemes
// entry's own light/dark role arrays share one fixed order (all built from
// the same liveThemeRoleDefs), so zipping them by index (not by key
// lookup) is enough to line a role up across themes correctly.
const BLANK_ROLE = { hex: 'transparent' }

// golfStatusRoleDefs is one flat list — split it into the same
// Primary/Secondary/Neutral groups liveThemeRoleDefs uses so it can sit
// beside the tint themes as one more column.
function groupGolfStatusRoles(roles) {
  const isSecondary = key => /secondary/i.test(key)
  const isPrimary = key => /^(primary|onPrimary)/.test(key)
  return {
    primary: roles.filter(r => isPrimary(r.key)),
    secondary: roles.filter(r => isSecondary(r.key)),
    neutral: roles.filter(r => !isPrimary(r.key) && !isSecondary(r.key)),
  }
}

function RoleCompareTable({ tintThemes }) {
  return (
    <div className="wds-role-table" style={{ '--wds-theme-cols': tintThemes.length }}>
      <CompareHeader themes={tintThemes} />
      {THEME_TABLE_GROUPS.map(group => (
        <div key={group.key} className="wds-role-group">
          <div className="wds-role-group-title">{group.label}</div>
          {tintThemes[0].light[group.key].map(roleDef => (
            <CompareRow
              key={roleDef.key}
              label={roleDef.label}
              columns={tintThemes.map(theme => ({
                key: theme.key,
                light: theme.light[group.key].find(r => r.key === roleDef.key) ?? BLANK_ROLE,
                dark: theme.dark[group.key].find(r => r.key === roleDef.key) ?? BLANK_ROLE,
              }))}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Every `--gs-color-*` role gs-lib/styles/theme.scss's .gs-theme-default/
// .dark blocks actually define — i.e. the roles the live Event Website
// (EventWebsitePage.jsx) reads — grouped Primary/Secondary/Neutral instead
// of dumped in theme.scss's declaration order. `fallbackHex` is exactly
// what EventWebsitePage.jsx's own customThemeStyle computes for that role
// in its default state (Monochromatic off, Neutral tint), so this preview
// can't drift from what saving here actually renders on the site.
// `naturalRef` is that same value expressed as a { family, step } — what a
// role's designation defaults to before any override — `null` for a role
// with no single clean step to point to (an absolute White/Black end, or
// Tertiary's fixed brand green). `editable: false` marks the one role per
// color this screen won't let you reassign — the base Primary/Secondary
// swatch itself, since "what step is Primary?" is circular (see RampChip).
// `sitePersisted` marks the roles EventWebsitePage.jsx's own ROLE_TO_CSS_VAR
// (that file) actually applies a saved override to — only those write into
// the shared themeOverrides prop (and so show up on the live site); every
// other editable role here is a local-only "what if" preview (see
// ColorExplorationFields' own resolveDesignable/SITE_PERSISTED_KEYS).
function liveThemeRoleDefs(primaryScale, secondaryScale) {
  const forMode = mode => {
    const isDark = mode === 'dark'
    const primaryBase = primaryScale[isDark ? 200 : 600]
    const secondaryBase = secondaryScale[isDark ? 200 : 600]
    // pickAccessibleTextColor (contrast.js) picks whichever of these two
    // steps actually wins — recomputed here (via the same exported
    // contrastRatio) just to know *which* step it picked, for naturalRef.
    const onPrimaryStep = contrastRatio(primaryBase, primaryScale[800]) >= contrastRatio(primaryBase, primaryScale[100]) ? 800 : 100
    const onSecondaryStep = contrastRatio(secondaryBase, secondaryScale[800]) >= contrastRatio(secondaryBase, secondaryScale[100]) ? 800 : 100
    return {
      primary: [
        { key: 'primary', label: 'Primary', fallbackHex: primaryBase, naturalRef: null, editable: false },
        { key: 'onPrimary', label: 'On Primary', fallbackHex: pickAccessibleTextColor(primaryBase, primaryScale[100], primaryScale[800]), naturalRef: { family: 'primary', step: onPrimaryStep }, editable: true, compact: true, impliedFamily: 'primary' },
      ],
      secondary: [
        { key: 'secondary', label: 'Secondary', fallbackHex: secondaryBase, naturalRef: null, editable: false },
        { key: 'onSecondary', label: 'On Secondary', fallbackHex: pickAccessibleTextColor(secondaryBase, secondaryScale[100], secondaryScale[800]), naturalRef: { family: 'secondary', step: onSecondaryStep }, editable: true, compact: true, impliedFamily: 'secondary' },
      ],
      neutral: [
        { key: 'background', label: 'Background', fallbackHex: isDark ? BLACK : WHITE, naturalRef: isDark ? { family: 'black' } : { family: 'white' }, editable: true, sitePersisted: true },
        { key: 'onBackground', label: 'On Background', fallbackHex: primaryScale[isDark ? 50 : 800], naturalRef: { family: 'primary', step: isDark ? 50 : 800 }, editable: true, sitePersisted: true },
        { key: 'surface', label: 'Surface', fallbackHex: isDark ? golfstatusColors.grey900 : WHITE, naturalRef: isDark ? { family: 'grey', step: 900 } : { family: 'white' }, editable: true, sitePersisted: true },
        { key: 'onSurface', label: 'On Surface', fallbackHex: primaryScale[isDark ? 50 : 800], naturalRef: { family: 'primary', step: isDark ? 50 : 800 }, editable: true, sitePersisted: true },
        { key: 'surfaceVariant', label: 'Surface Variant', fallbackHex: isDark ? golfstatusColors.grey800 : golfstatusColors.grey50, naturalRef: { family: 'grey', step: isDark ? 800 : 50 }, editable: true, sitePersisted: true },
        { key: 'onSurfaceVariant', label: 'On Surface Variant', fallbackHex: primaryScale[isDark ? 100 : 800], naturalRef: { family: 'primary', step: isDark ? 100 : 800 }, editable: true, sitePersisted: true },
        { key: 'surfaceContainerLow', label: 'Surface Container Low', fallbackHex: isDark ? golfstatusColors.grey900 : WHITE, naturalRef: isDark ? { family: 'grey', step: 900 } : { family: 'white' }, editable: true, sitePersisted: true },
        { key: 'surfaceContainerHigh', label: 'Surface Container High', fallbackHex: isDark ? golfstatusColors.grey800 : golfstatusColors.grey50, naturalRef: { family: 'grey', step: isDark ? 800 : 50 }, editable: true, sitePersisted: true },
        // Site key is "surfaceContainerHigest" (missing an 'h') — an
        // existing typo in EventWebsitePage.jsx's ROLE_TO_CSS_VAR — matched
        // here exactly so a saved override actually lands on that role
        // instead of silently landing on a key the site never reads.
        { key: 'surfaceContainerHigest', label: 'Surface Container Highest', fallbackHex: isDark ? golfstatusColors.grey700 : golfstatusColors.grey100, naturalRef: { family: 'grey', step: isDark ? 700 : 100 }, editable: true, sitePersisted: true },
        { key: 'surfaceBright', label: 'Surface Bright', fallbackHex: isDark ? golfstatusColors.grey700 : WHITE, naturalRef: isDark ? { family: 'grey', step: 700 } : { family: 'white' }, editable: true, sitePersisted: true },
        { key: 'outline', label: 'Outline', fallbackHex: isDark ? WHITE : golfstatusColors.grey700, naturalRef: isDark ? { family: 'white' } : { family: 'grey', step: 700 }, editable: true, sitePersisted: true },
        { key: 'outlineVariant', label: 'Outline Variant', fallbackHex: isDark ? golfstatusColors.grey700 : golfstatusColors.grey100, naturalRef: { family: 'grey', step: isDark ? 700 : 100 }, editable: true, sitePersisted: true },
        { key: 'tertiaryContainer', label: 'Tertiary', fallbackHex: isDark ? golfstatusColors.green400 : golfstatusColors.green200, naturalRef: null, editable: true, sitePersisted: true },
      ],
    }
  }
  return { light: forMode('light'), dark: forMode('dark') }
}

// Which Neutral-group roles the live site actually re-tints under a
// Primary/Secondary Tint theme — exactly EventWebsitePage.jsx's own
// DEFAULT_NEUTRAL_TOKENS keys. Every other Neutral role stays identical
// across every tint theme: onBackground/onSurface/onSurfaceVariant always
// read the Primary (or Secondary, for a Secondary Tint theme) scale
// directly regardless of tint, and Tertiary/On Tertiary are fixed brand
// colors the site never tints at all.
const TINTABLE_NEUTRAL_KEYS = new Set([
  'background', 'surface', 'surfaceVariant', 'surfaceContainerLow',
  'surfaceContainerHigh', 'surfaceContainerHigest', 'surfaceBright',
  'outline', 'outlineVariant',
])

// Outline Variant and Surface Container High are pinned to this fixed step
// under a tint theme instead of the usual "same step, new family" swap
// below — the same exception EventWebsitePage.jsx's own monochromatic
// substitution makes (see OUTLINE_VARIANT_MONO_STEP's own comment in
// monochromatic.js) so every section body tints to one consistent step
// instead of drifting between light/dark's own different natural steps.
const PINNED_TINT_KEYS = new Set(['outlineVariant', 'surfaceContainerHigh'])

// A Neutral Tint role's own White/Black/Neutral-N reference, re-pointed at
// `family` (a tint theme's own scale) instead — White becomes that
// family's 50, Black becomes its 900, "Neutral N" keeps the same step —
// mirroring monochromatic.js's own monochromatize()/NEUTRAL_STEP_BY_HEX
// substitution exactly, so this preview can't drift from what the live
// site actually renders under that Tint.
function retint(ref, family, key) {
  if (PINNED_TINT_KEYS.has(key)) return { family, step: OUTLINE_VARIANT_MONO_STEP }
  if (!ref) return null
  if (ref.family === 'white') return { family, step: 50 }
  if (ref.family === 'black') return { family, step: 900 }
  if (ref.family === 'grey') return { family, step: ref.step }
  return ref
}

// On Background/On Surface/On Surface Variant always read this tint
// theme's own `monoScale` on the live site — primaryScale for every tint
// except Secondary Tint, where it's secondaryScale (EventWebsitePage.jsx:
// `siteStyle.neutralTint === 'secondary' ? secondaryScale : primaryScale`)
// — regardless of whether Monochromatic (the other 10 roles' own on/off
// switch) is even on. So these three don't go through retint()'s White/
// Black/Neutral-N swap below; they just get re-pointed at whichever family
// this theme's `monoFamily` is, same step as always.
const ALWAYS_MONO_KEYS = new Set(['onBackground', 'onSurface', 'onSurfaceVariant'])

// Re-tints a Neutral Tint mode's role defs (see liveThemeRoleDefs above)
// into a Primary/Secondary Tint theme's own — TINTABLE_NEUTRAL_KEYS get the
// usual White/Black/Neutral-N swap, ALWAYS_MONO_KEYS just get re-pointed at
// `monoFamily` directly, every other role (Tertiary/On Tertiary) is left
// alone. fallbackHex is recomputed from each re-pointed naturalRef so an
// untouched (no override typed) role still shows the right color.
function retintNeutralDefs(neutralDefs, monoFamily, primaryScale, secondaryScale, textFamily = monoFamily) {
  return neutralDefs.map(def => {
    if (ALWAYS_MONO_KEYS.has(def.key)) {
      const naturalRef = { family: textFamily, step: def.naturalRef.step }
      const fallbackHex = resolveOverrideHex(naturalRef, { primaryScale, secondaryScale }) ?? def.fallbackHex
      return { ...def, naturalRef, fallbackHex }
    }
    if (!TINTABLE_NEUTRAL_KEYS.has(def.key)) return def
    const naturalRef = retint(def.naturalRef, def.key === 'outlineVariant' ? textFamily : monoFamily, def.key)
    const fallbackHex = resolveOverrideHex(naturalRef, { primaryScale, secondaryScale }) ?? def.fallbackHex
    return { ...def, naturalRef, fallbackHex }
  })
}

// The Theme tab's own three themes — Neutral Tint (this screen's original
// Theme tab, Monochromatic off), Primary Tint, and Secondary Tint
// (Monochromatic on, tinted with the Primary or Secondary scale
// respectively) — mirroring Website Design and Style's own Site Style
// radio (Neutral/Primary/Secondary Tint) and EventWebsitePage.jsx's
// Monochromatic toggle. `monochromatic` is baked into a site-persisted
// role's own storage key (see resolveDesignable's own comment) so a
// designation typed under one tint theme lands in that tint's own slot on
// the live site instead of colliding with the others'.
const TINT_THEMES = [
  { key: 'neutral', label: 'Neutral Tint', monochromatic: false, retintFamily: null },
  { key: 'primary', label: 'Primary Tint', monochromatic: true, retintFamily: 'primary' },
  // Full Tint (EventWebsitePage.jsx's textScale): surfaces/backgrounds tint
  // with Secondary, text and Outline Variant with Primary.
  { key: 'full', label: 'Full Tint', monochromatic: true, retintFamily: 'secondary', textFamily: 'primary' },
]

// GolfStatus's own fixed roles, transcribed straight from
// gs-lib/styles/theme.scss's .gs-theme-default/.dark (EventWebsitePage.jsx
// reuses that class as-is for its "golfstatus" theme option, with none of
// customThemeStyle's overrides — see THEME_NAMES/THEME_CLASS_NAMES there) —
// never moves with the Primary/Secondary pickers above, unlike Default.
// Every role here is local-preview-only (see ColorExplorationFields'
// resolveDesignable) even where a naturalRef exists: EventWebsitePage.jsx
// never applies a themeOverrides entry to this theme, by design (it's
// meant to stay the fixed, un-customized fallback), so an edit here can
// only ever preview, not persist. Same base-swatch exception as
// liveThemeRoleDefs above (Primary/Secondary aren't reassignable) — its
// Secondary/Tertiary families are cyan/green, outside this screen's own
// White/Black/Neutral/Primary/Secondary vocabulary, so naturalRef is null
// for any role that's plainly one of those (still editable — "spots for
// all possible designations" — just starting blank instead of prefilled).
// theme.scss's own `.dark` block never actually redefines
// --gs-color-on-secondary, an existing gap in that file — light's white is
// reused here rather than leaving this one swatch blank.
const SITE_ROLE_KEYS = new Set([
  'background', 'onBackground', 'surface', 'onSurface', 'onSurfaceVariant', 'surfaceBright',
  'surfaceContainerLow', 'surfaceContainerHigh', 'surfaceContainerHigest', 'surfaceVariant',
  'outline', 'outlineVariant', 'tertiaryContainer',
])

function golfStatusRoleDefs() {
  const forMode = mode => {
    const isDark = mode === 'dark'
    const roles = [
      { key: 'primary', label: 'Primary', fallbackHex: isDark ? WHITE : golfstatusColors.grey800, naturalRef: null, editable: false },
      { key: 'onPrimary', label: 'On Primary', fallbackHex: isDark ? golfstatusColors.grey800 : WHITE, naturalRef: isDark ? { family: 'grey', step: 800 } : { family: 'white' }, editable: true },
      { key: 'secondary', label: 'Secondary', fallbackHex: isDark ? golfstatusColors.cyan200 : golfstatusColors.cyan700, naturalRef: null, editable: false },
      { key: 'onSecondary', label: 'On Secondary', fallbackHex: WHITE, naturalRef: { family: 'white' }, editable: true },
      { key: 'background', label: 'Background', fallbackHex: isDark ? BLACK : WHITE, naturalRef: isDark ? { family: 'black' } : { family: 'white' }, editable: true },
      { key: 'onBackground', label: 'On Background', fallbackHex: isDark ? WHITE : golfstatusColors.grey800, naturalRef: isDark ? { family: 'white' } : { family: 'grey', step: 800 }, editable: true },
      { key: 'surface', label: 'Surface', fallbackHex: isDark ? golfstatusColors.grey900 : WHITE, naturalRef: isDark ? { family: 'grey', step: 900 } : { family: 'white' }, editable: true },
      { key: 'onSurface', label: 'On Surface', fallbackHex: isDark ? WHITE : golfstatusColors.grey800, naturalRef: isDark ? { family: 'white' } : { family: 'grey', step: 800 }, editable: true },
      { key: 'surfaceVariant', label: 'Surface Variant', fallbackHex: isDark ? golfstatusColors.grey800 : golfstatusColors.grey50, naturalRef: { family: 'grey', step: isDark ? 800 : 50 }, editable: true },
      { key: 'onSurfaceVariant', label: 'On Surface Variant', fallbackHex: isDark ? golfstatusColors.grey100 : golfstatusColors.grey800, naturalRef: { family: 'grey', step: isDark ? 100 : 800 }, editable: true },
      { key: 'surfaceContainerLow', label: 'Surface Container Low', fallbackHex: isDark ? golfstatusColors.grey900 : WHITE, naturalRef: isDark ? { family: 'grey', step: 900 } : { family: 'white' }, editable: true },
      { key: 'surfaceContainerHigh', label: 'Surface Container High', fallbackHex: isDark ? golfstatusColors.grey800 : golfstatusColors.grey50, naturalRef: { family: 'grey', step: isDark ? 800 : 50 }, editable: true },
      { key: 'surfaceContainerHigest', label: 'Surface Container Highest', fallbackHex: isDark ? golfstatusColors.grey700 : golfstatusColors.grey100, naturalRef: { family: 'grey', step: isDark ? 700 : 100 }, editable: true },
      { key: 'surfaceBright', label: 'Surface Bright', fallbackHex: isDark ? golfstatusColors.grey700 : WHITE, naturalRef: isDark ? { family: 'grey', step: 700 } : { family: 'white' }, editable: true },
      { key: 'outline', label: 'Outline', fallbackHex: isDark ? WHITE : golfstatusColors.grey700, naturalRef: isDark ? { family: 'white' } : { family: 'grey', step: 700 }, editable: true },
      { key: 'outlineVariant', label: 'Outline Variant', fallbackHex: isDark ? golfstatusColors.grey700 : golfstatusColors.grey100, naturalRef: { family: 'grey', step: isDark ? 700 : 100 }, editable: true },
      { key: 'tertiaryContainer', label: 'Tertiary', fallbackHex: isDark ? golfstatusColors.green400 : golfstatusColors.green200, naturalRef: null, editable: true },
    ]
    // Roles the live site reads (EventWebsitePage.jsx's ROLE_TO_CSS_VAR) save
    // to themeOverrides under the 'golfstatus' tint slot and apply there.
    return roles.map(r => (r.editable && SITE_ROLE_KEYS.has(r.key) ? { ...r, sitePersisted: true } : r))
  }
  return { light: forMode('light'), dark: forMode('dark') }
}

// Which of liveThemeRoleDefs/golfStatusRoleDefs' roles a non-button, visible
// element on the live Event Website actually reads, via a
// `var(--gs-color-*)` in EventWebsitePage.scss/.jsx — every other role here
// is a real CSS variable theme.scss still sets, but either nothing on the
// page consumes it at all. Fill/Subtle button text and backgrounds and the
// Donation progress bar's start color are no longer roles — they're derived
// from the Primary/Secondary scales (or edited per-button on the Buttons
// tab). So the Event Site tab (unlike Color Ramps/Theme, which show the
// full role list for exploring the whole system) only shows these.
const EVENT_SITE_USED_KEYS = new Set([
  'primary', 'onPrimary',
  'secondary',
  'background', 'onBackground', 'onSurface', 'onSurfaceVariant',
  'surfaceContainerHigh', 'surfaceBright', 'outlineVariant',
])

const onlyUsedOnEventSite = items => items.filter(item => EVENT_SITE_USED_KEYS.has(item.key))

// Site Colors' own per-element list — every named, non-button element the
// live Event Website actually renders (see EventWebsitePage.jsx's own
// per-section comment breakdown this mirrors), each pointed at one of
// defaultSiteTheme's used roles (`baseRoleKey`) by default. `key` matches
// EventWebsitePage.jsx's ELEMENT_TO_CSS_VAR exactly — that's the join
// between an edit made here and the `--es-el-*` custom property the site's
// own stylesheet actually reads for that element, with the role's own
// value as its fallback when nothing's been assigned. Two elements sharing
// a `baseRoleKey` (e.g. every section's own title) start out looking
// identical but are still independently assignable, since each gets its
// own storage key (`${mode}-${key}`, see resolveElementDesignable).
export const ELEMENT_DEFS = [
  // The page-wide defaults every other element either reads directly
  // (nothing below overrides it) or falls back to once its own element
  // override is cleared — same 4 roles the old Navigation/Accent/Structure
  // swatch grid's own "Structure" bucket showed, just reframed as the
  // actual sitewide surfaces they apply to (.es-page's own background/
  // color, every section's .section-body, every gs-page-section's own
  // border-bottom — see EventWebsitePage.scss).
  { key: 'pageBackground', label: 'Page Background', section: 'Sitewide', baseRoleKey: 'background' },
  { key: 'sectionBoxText', label: 'Section Content Box Text (default)', section: 'Sitewide', baseRoleKey: 'onSurface' },
  { key: 'pageTextDefault', label: 'Page Text Default', section: 'Sitewide', baseRoleKey: 'onBackground' },
  { key: 'sectionBoxBackground', label: 'Section Content Box Background', section: 'Sitewide', baseRoleKey: 'surfaceContainerHigh' },
  { key: 'sectionBottomBorder', label: 'Section Bottom Border', section: 'Sitewide', baseRoleKey: 'outlineVariant' },

  { key: 'headerIcon', label: 'Icon (Logo)', section: 'Header', baseRoleKey: 'onPrimary' },
  { key: 'headerEventName', label: 'Event Name', section: 'Header', baseRoleKey: 'onPrimary' },
  { key: 'headerActionIcons', label: 'Action Icons (cart, theme toggle)', section: 'Header', baseRoleKey: 'onPrimary' },
  { key: 'mobileMenuIcon', label: 'Mobile Menu Icon', section: 'Header', baseRoleKey: 'primary' },
  { key: 'avatarBackground', label: 'Avatar Placeholder Fill', section: 'Header', baseRoleKey: 'outlineVariant' },
  { key: 'headerBackground', label: 'Header Background', section: 'Header', baseRoleKey: 'primary' },
  { key: 'avatarBorder', label: 'Avatar Border', section: 'Header', baseRoleKey: 'outlineVariant' },
  { key: 'subnavBackground', label: 'Sub-nav Background', section: 'Header', baseRoleKey: 'background' },
  { key: 'subnavBorder', label: 'Sub-nav Border', section: 'Header', baseRoleKey: 'outlineVariant' },

  { key: 'tournamentEventName', label: 'Event Name', section: 'Tournament Details', baseRoleKey: 'onSurface' },
  { key: 'tournamentDate', label: 'Date Range', section: 'Tournament Details', baseRoleKey: 'onSurface' },
  { key: 'tournamentLocation', label: 'Facility / Location', section: 'Tournament Details', baseRoleKey: 'onSurface' },
  { key: 'sidebarBorder', label: 'Sidebar Card Border', section: 'Tournament Details', baseRoleKey: 'outlineVariant' },

  { key: 'sectionTitle', label: 'Section Title', section: 'Sections (all)', baseRoleKey: 'onBackground' },
  { key: 'sectionDescription', label: 'Section Description / Body Copy', section: 'Sections (all)', baseRoleKey: 'onBackground' },

  { key: 'arrowTileBackground', label: 'Tile Background', section: 'Packages & Additional Pages', baseRoleKey: 'surfaceBright' },
  { key: 'packageTileIcon', label: 'Package Tile Icon', section: 'Packages & Additional Pages', baseRoleKey: 'onSurface' },
  { key: 'arrowTileLabel', label: 'Tile Label', section: 'Packages & Additional Pages', baseRoleKey: 'onSurface' },
  { key: 'additionalPagesSub', label: 'Additional Pages Sub-label', section: 'Packages & Additional Pages', baseRoleKey: 'onSurfaceVariant' },
  { key: 'arrowTileArrow', label: 'Tile Arrow Icon', section: 'Packages & Additional Pages', baseRoleKey: 'onSurfaceVariant' },

  { key: 'packageTileBorder', label: 'Tile Border (Packages page)', section: 'Packages & Additional Pages', baseRoleKey: 'outlineVariant' },
  { key: 'packagesCardText', label: 'Package Card Text (Packages page)', section: 'Packages & Additional Pages', baseRoleKey: 'onSurface' },

  { key: 'soldOutBadgeBackground', label: 'Sold Out Badge Background', section: 'Packages & Additional Pages', baseRoleKey: 'primary' },
  { key: 'soldOutBadgeText', label: 'Sold Out Badge Text', section: 'Packages & Additional Pages', baseRoleKey: 'onPrimary' },

  { key: 'sponsorTierHeader', label: 'Tier Header', section: 'Sponsors', baseRoleKey: 'onSurface' },
  { key: 'sponsorTileName', label: 'Sponsor Tile Name', section: 'Sponsors', baseRoleKey: 'onSurface' },
  { key: 'sponsorFeatureName', label: 'Feature Sponsor Name', section: 'Sponsors', baseRoleKey: 'onSurface' },
  { key: 'sponsorFeatureDescription', label: 'Feature Sponsor Description', section: 'Sponsors', baseRoleKey: 'onSurface' },

  { key: 'videoFrameBorder', label: 'Video Frame Border', section: 'Media', baseRoleKey: 'outlineVariant' },
  { key: 'imageFrameBorder', label: 'Image Frame Border (photos, sponsor logos)', section: 'Media', baseRoleKey: 'outlineVariant' },

  { key: 'donationGoalLabel', label: 'Goal Label', section: 'Donation', baseRoleKey: 'onSurface' },
  { key: 'donationProgressTrack', label: 'Progress Bar Track', section: 'Donation', baseRoleKey: 'surfaceContainerHighest' },
  { key: 'donationProgressText', label: 'Progress Bar Percentage', section: 'Donation', baseRoleKey: 'onSurface' },
  { key: 'donationTileBackground', label: 'Amount Tile Background', section: 'Donation', baseRoleKey: 'surfaceBright' },
  { key: 'donationTileText', label: 'Amount Tile Text', section: 'Donation', baseRoleKey: 'onSurface' },
  { key: 'donationProgressEnd', label: 'Progress Bar (End)', section: 'Donation', baseRoleKey: 'primary' },

  { key: 'liveScoringBodyText', label: 'Body Text', section: 'Live Scoring', baseRoleKey: 'onSurface' },
]

// ELEMENT_DEFS grouped by its own `section`, in first-seen order — this
// tab's own display order (Header, Tournament Details, ...), not
// alphabetical.
const ELEMENT_GROUPS = ELEMENT_DEFS.reduce((groups, def) => {
  const group = groups.find(g => g.section === def.section)
  if (group) group.defs.push(def)
  else groups.push({ section: def.section, defs: [def] })
  return groups
}, [])

// Derives each ELEMENT_DEFS entry's real `--es-el-*` custom property from
// its own `key` — mechanical camelCase-to-kebab-case, since `key` is
// already written to match EventWebsitePage.jsx's own ELEMENT_TO_CSS_VAR
// exactly (see ELEMENT_DEFS' own comment above); deriving it here instead
// of a second hand-kept list is what keeps that guarantee from silently
// drifting if a key ever gets renamed on one side and not the other.
const camelToKebab = str => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const SITE_ELEMENT_CSS_VAR = Object.fromEntries(ELEMENT_DEFS.map(def => [def.key, `--es-el-${camelToKebab(def.key)}`]))

// The five tabs — Color Ramps (Neutral/Primary/Secondary scales), Theme
// (the live `--gs-color-*` roles those scales feed, editable), Event Site
// (the two actual themes the live site's picker cycles through — Default
// reuses Theme's own resolved roles; GolfStatus previews locally), Site
// Colors (every named, non-button element the live site actually renders,
// individually assignable — see ELEMENT_DEFS/ELEMENT_GROUPS above), and SVG
// Preview (the static, flat-default Tournament Details mockup).
// Prototype-only persistence (same convention as data/eventSitePremium.js) —
// designations typed on roles with no site override slot (`sitePersisted`
// false) and the open tab survive a refresh. Site-persisted roles already
// survive via themeOverrides + Save.
// Designations for roles the live site can't persist (see `sitePersisted`),
// seeded from the designed defaults; anything stored locally wins over these.
const DEFAULT_LOCAL_DESIGNATIONS = {
  'golfstatus-dark-outline': { family: 'grey', step: 800 },
  'golfstatus-dark-outlineVariant': { family: 'grey', step: 800 },
  'golfstatus-dark-surfaceContainerLow': { family: 'black' },
  'golfstatus-light-outline': { family: 'grey', step: 100 },
  'golfstatus-light-surface': { family: 'grey', step: 50 },
  'neutral-full-dark-onSurface': { family: 'secondary', step: 100 },
  'neutral-full-dark-onSurfaceVariant': { family: 'secondary', step: 100 },
  'neutral-full-light-onSurface': { family: 'secondary', step: 800 },
  'neutral-full-light-onSurfaceVariant': { family: 'secondary', step: 800 },
  'primary-full-dark-onPrimary': { family: 'primary', step: 900 },
  'primary-full-light-onPrimary': { family: 'white' },
  'primary-neutral-dark-onPrimary': { family: 'primary', step: 900 },
  'primary-neutral-light-onPrimary': { family: 'white' },
  'primary-primary-dark-onPrimary': { family: 'primary', step: 900 },
  'primary-primary-light-onPrimary': { family: 'white' },
  'secondary-full-dark-onSecondary': { family: 'secondary', step: 100 },
  'secondary-neutral-dark-onSecondary': { family: 'secondary', step: 100 },
  'secondary-primary-dark-onSecondary': { family: 'secondary', step: 100 },
}

const DESIGNATIONS_STORAGE_KEY = 'color-exploration-local-designations'
const TAB_STORAGE_KEY = 'color-exploration-active-tab'

function readStored(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Full/unavailable localStorage just means no persistence.
  }
}

const COLOR_TABS = [
  { key: 'ramps', label: 'Color Ramps' },
  { key: 'theme', label: 'Theme' },
  { key: 'site-colors', label: 'Site Colors' },
  { key: 'buttons', label: 'Buttons' },
]

// The Buttons tab's four themes — same tint keys the live site stores its
// other overrides under (EventWebsitePage.jsx's `tint`), so an edit made
// under one theme only shows up when the site is on that theme.
const BUTTON_THEMES = [
  { key: 'neutral', label: 'Neutral Tint' },
  { key: 'primary', label: 'Primary Tint' },
  { key: 'full', label: 'Full Tint' },
  { key: 'golfstatus', label: 'GolfStatus' },
]

// What a button part renders as when nothing's been overridden: the tint
// themes read buttonThemeVars (colorScale.js — the same helper the live
// site's theme tokens mirror), GolfStatus reads its own fixed brand roles
// (golfStatusRoleDefs, transcribed from theme.scss).
function defaultButtonHex(themeKey, mode, color, appearance, part, scales) {
  if (themeKey === 'golfstatus') {
    const roles = Object.fromEntries(golfStatusRoleDefs()[mode].map(r => [r.key, r.fallbackHex]))
    const cap = color === 'primary' ? 'Primary' : 'Secondary'
    if (part === 'text' && (appearance === 'outline' || appearance === 'transparent')) return roles[color]
    if (appearance === 'fill') return part === 'bg' ? roles[color] : roles[`on${cap}Fill`]
    if (appearance === 'subtle') return part === 'bg' ? roles[`${color}Subtle`] : roles[`on${cap}Subtle`]
    return roles[color]
  }
  const vars = buttonThemeVars(scales.primaryScale, scales.secondaryScale, mode)
  const base = vars[`--gs-color-${color}`]
  if (appearance === 'outline' || appearance === 'transparent') return base
  const suffix = appearance === 'fill' ? 'fill' : 'subtle'
  if (part === 'text') return vars[`--gs-color-on-${color}-${suffix}`]
  return appearance === 'fill' ? base : vars[`--gs-color-${color}-subtle`]
}

// The scale step each tint-theme button part reads by default — mirrors
// colorScale.js's buttonThemeVars step numbers (base 600/200, Fill text
// 50/900, Subtle 100/700 with text 900/50), so the dropdown can show the
// current designation instead of a blank "default".
function defaultButtonRef(mode, color, appearance, part) {
  const dark = mode === 'dark'
  let step
  if (appearance === 'subtle') step = part === 'bg' ? (dark ? 700 : 100) : (dark ? 50 : 900)
  else if (appearance === 'fill' && part === 'text') step = dark ? 900 : 50
  else step = dark ? 200 : 600
  return { family: color, step }
}

// One editable color on the Buttons tab — a native swatch picker plus a text
// field taking a hex ("#1A73E8") or a scale designation ("Primary 700").
// Same draft/commit convention as DesignationInput; blank resets to default.
function ButtonColorField({ label, hex, override, defaultRef, onCommit, designationOnly }) {
  if (designationOnly) {
    // Tint themes pick from the scale (Primary 700, Secondary 100, ...)
    // rather than typing a hex — stored as a { family, step } reference so
    // the button keeps tracking the Primary/Secondary colors if they change.
    return (
      <label className="wds-btn-field">
        <span className="wds-btn-field-label">{label}</span>
        <span className="wds-btn-field-inputs">
          <span className="wds-btn-field-swatch wds-btn-field-swatch--static" style={{ backgroundColor: hex }} />
          <select
            className="wds-btn-field-text"
            value={refToText(override ?? defaultRef)}
            onChange={e => {
              const next = e.target.value ? parseDesignation(e.target.value) : null
              // Picking the built-in designation just clears the override.
              onCommit(!next || (defaultRef && next.family === defaultRef.family && next.step === defaultRef.step) ? null : next)
            }}
            aria-label={`${label} theme designation`}
          >
            {/* GolfStatus's brand defaults (grey/cyan) aren't a scale step. */}
            {!defaultRef && <option value="">Default</option>}
            <optgroup label="Base">
              <option value="White">White</option>
              <option value="Black">Black</option>
            </optgroup>
            {['Neutral', 'Primary', 'Secondary'].map(family => (
              <optgroup key={family} label={family}>
                {SCALE_STEPS.map(step => (
                  <option key={step} value={`${family} ${step}`}>{`${family} ${step}`}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </span>
      </label>
    )
  }
  const text = override ? (override.hex ?? refToText(override)) : ''
  const [draft, setDraft] = useState(text)
  useEffect(() => setDraft(text), [text])
  const commit = () => {
    const trimmed = draft.trim()
    if (!trimmed) return onCommit(null)
    if (HEX_RE.test(trimmed)) return onCommit({ hex: toFullHex(trimmed) })
    const parsed = parseDesignation(trimmed)
    if (parsed) return onCommit(parsed)
    setDraft(text)
  }
  return (
    <label className="wds-btn-field">
      <span className="wds-btn-field-label">{label}</span>
      <span className="wds-btn-field-inputs">
        <input
          type="color"
          className="wds-btn-field-swatch"
          value={toFullHex(hex)}
          onChange={e => onCommit({ hex: e.target.value })}
          aria-label={`${label} color picker`}
        />
        <input
          className="wds-btn-field-text"
          value={draft}
          placeholder={hex}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          aria-label={`${label} — hex or e.g. "Primary 600"; blank resets`}
        />
      </span>
    </label>
  )
}

// One theme + mode + color + appearance: a live button on that mode's
// backdrop, and its two editable colors.
function ButtonVariantCell({ themeKey, mode, color, appearance, parts, overrides, onChange, scales }) {
  const effective = {}
  const fields = parts.map(([part, label]) => {
    const key = buttonOverrideKey(mode, themeKey, color, appearance, part)
    const override = overrides?.[key] ?? null
    const hex = resolveButtonOverride(override, scales) ?? defaultButtonHex(themeKey, mode, color, appearance, part, scales)
    effective[buttonVarName(color, appearance, part)] = hex
    return (
      <ButtonColorField
        key={part}
        label={label}
        hex={hex}
        override={override}
        defaultRef={themeKey === 'golfstatus' ? null : defaultButtonRef(mode, color, appearance, part)}
        designationOnly
        onCommit={next =>
          onChange(prev => {
            const store = { ...(prev ?? {}) }
            if (next) store[key] = next
            else delete store[key]
            return store
          })
        }
      />
    )
  })
  return (
    <div className={`wds-btn-cell wds-btn-cell--${mode}`}>
      <div className="wds-btn-preview" style={effective}>
        <GSButton color={`${color}-color`} appearance={appearance} title="Button" isFocusable />
      </div>
      {fields}
    </div>
  )
}

// Buttons tab — every Primary/Secondary Fill/Outline/Subtle/Transparent button for each
// of the four themes, light and dark, with editable colors. Saved as
// `buttonOverrides` on the shared style draft and applied on /event-site
// via `--gs-btn-*` variables (EventWebsitePage.jsx, gs-button.scss).
// Which variant each named Event Website button uses — the same
// `buttonStyles` the /event-site right-click menu edits (EventSiteContext
// Menu.jsx), so a pick made there shows up here and vice versa.
function ButtonStylesSection({ buttonStyles, onChange }) {
  const setStyle = (id, patch) =>
    onChange(prev => {
      const [defColor, defAppearance] = BUTTON_DEFAULTS[id]
      return {
        ...(prev ?? {}),
        [id]: { color: `${defColor}-color`, appearance: defAppearance, ...(prev?.[id] ?? {}), ...patch },
      }
    })
  const reset = id =>
    onChange(prev => {
      const next = { ...(prev ?? {}) }
      delete next[id]
      return next
    })
  return (
    <section className="wds-btn-theme wds-btn-styles">
      <GSActionBar type="form-header H3" header="Button Styles" />
      {Object.entries(BUTTON_IDS).map(([id, label]) => {
        const saved = buttonStyles?.[id]
        const [defColor, defAppearance] = BUTTON_DEFAULTS[id]
        const color = saved?.color ?? `${defColor}-color`
        const appearance = saved?.appearance ?? defAppearance
        return (
          <div className="wds-btn-style-row" key={id}>
            <div className="wds-btn-style-name">{label}</div>
            <div className="wds-btn-style-options">
              {BUTTON_COLORS.map(option => (
                <button
                  key={option.key}
                  type="button"
                  className={`wds-btn-style-option${color === `${option.key}-color` ? ' is-active' : ''}`}
                  onClick={() => setStyle(id, { color: `${option.key}-color` })}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="wds-btn-style-options">
              {BUTTON_APPEARANCES.map(option => (
                <button
                  key={option.key}
                  type="button"
                  className={`wds-btn-style-option${appearance === option.key ? ' is-active' : ''}`}
                  onClick={() => setStyle(id, { appearance: option.key })}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button type="button" className="wds-btn-style-reset" disabled={!saved} onClick={() => reset(id)}>
              Reset
            </button>
          </div>
        )
      })}
    </section>
  )
}

function ButtonsTab({ themes, overrides, onChange, scales, buttonStyles, onChangeButtonStyles }) {
  return (
    <div className="wds-btn-tab">
      <ButtonStylesSection buttonStyles={buttonStyles} onChange={onChangeButtonStyles} />
      {themes.map(theme => (
        <section className="wds-btn-theme" key={theme.key}>
          <GSActionBar type="form-header H3" header={theme.label} />
          <div className="wds-btn-grid">
            <div className="wds-btn-grid-head" />
            <div className="wds-btn-grid-head">Light</div>
            <div className="wds-btn-grid-head">Dark</div>
            {BUTTON_COLORS.flatMap(({ key: color, label: colorLabel }) =>
              BUTTON_APPEARANCES.map(({ key: appearance, label: appearanceLabel, parts }) => (
                <div className="wds-btn-row" key={`${color}-${appearance}`}>
                  <div className="wds-btn-row-label">{colorLabel} {appearanceLabel}</div>
                  {['light', 'dark'].map(mode => (
                    <ButtonVariantCell
                      key={mode}
                      themeKey={theme.key}
                      mode={mode}
                      color={color}
                      appearance={appearance}
                      parts={parts}
                      overrides={overrides}
                      onChange={onChange}
                      scales={scales}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

// The Color Exploration screen — a duplicate of WebsiteDesignStyleFields.jsx
// (same fields, same fully-controlled convention), opened off the Event
// Site & Packages hub's own "Color Exploration" row as a second entry point
// onto the *same* style. EventSitePackagesListPage.jsx feeds both screens
// the same styleDraft (Primary/Secondary and themeOverrides alike), so Save
// here calls the same data/eventSiteStyle.js persistence "Website Design
// and Style" does — a change made from either screen reflects on
// /event-site (EventWebsitePage.jsx) and on the other screen alike.
// Primary/Secondary mirrors Material's own naming; Neutral is fixed (see
// NEUTRAL_SCALE above).
export default function ColorExplorationFields({
  isPremium,
  primaryColor,
  onChangePrimaryColor,
  secondaryColor,
  onChangeSecondaryColor,
  themeOverrides,
  onChangeThemeOverrides,
  elementOverrides,
  onChangeElementOverrides,
  buttonOverrides,
  onChangeButtonOverrides,
  buttonStyles,
  onChangeButtonStyles,
}) {
  const primaryScale = generateScale(primaryColor)
  const secondaryScale = generateScale(secondaryColor)
  const [activeTab, setActiveTab] = useState(() => {
    const saved = readStored(TAB_STORAGE_KEY)
    return COLOR_TABS.some(tab => tab.key === saved) ? saved : COLOR_TABS[0].key
  })
  useEffect(() => writeStored(TAB_STORAGE_KEY, activeTab), [activeTab])
  // Every editable designation this screen can't persist to the live site
  // (see liveThemeRoleDefs/golfStatusRoleDefs' own `sitePersisted`) — keyed
  // "scope-mode-roleKey" so Primary/Secondary/Neutral-local/GolfStatus can't
  // collide on a shared role key like "onBackground". Local component state
  // rather than styleDraft: these previews were never meant to survive past
  // this screen (GolfStatus stays the fixed fallback theme; Primary/
  // Secondary's own On X/Subtle roles have no site mechanism to read a
  // saved override from at all), so there's nothing to lose by resetting on
  // remount.
  const [localDesignations, setLocalDesignations] = useState(() => ({ ...DEFAULT_LOCAL_DESIGNATIONS, ...(readStored(DESIGNATIONS_STORAGE_KEY) ?? {}) }))
  useEffect(() => writeStored(DESIGNATIONS_STORAGE_KEY, localDesignations), [localDesignations])

  // Resolves one role definition (see liveThemeRoleDefs/golfStatusRoleDefs)
  // into a chip-ready { key, label, hex, designation, onChangeDesignation }
  // — reading whichever store applies (the shared themeOverrides prop for
  // `sitePersisted` roles, `localDesignations` for every other editable
  // role) and falling all the way back to naturalRef/fallbackHex when
  // nothing's been typed. `scope` only matters for the local store (keeps
  // Primary/Secondary/Neutral/GolfStatus's own local keys apart, and are
  // shared across both tint themes since Primary/Secondary don't actually
  // vary by tint); site-persisted roles instead key off
  // `${mode}-${monochromatic}-${key}` — the exact format EventWebsitePage.jsx
  // reads, so a Neutral Tint edit and a Primary Tint edit of the same role
  // land in that tint's own slot rather than colliding.
  const resolveDesignable = (def, mode, scope, tintKey = '') => {
    if (!def.editable) return { key: def.key, label: def.label, hex: def.fallbackHex }
    const storageKey = def.sitePersisted ? `${mode}-${tintKey}-${def.key}` : `${scope}-${mode}-${def.key}`
    const store = def.sitePersisted ? themeOverrides : localDesignations
    const storedRef = store?.[storageKey] ?? null
    const effectiveRef = storedRef ?? def.naturalRef
    const hex = resolveOverrideHex(effectiveRef, { primaryScale, secondaryScale }) ?? def.fallbackHex
    const designation = refToText(effectiveRef)
    const setStore = def.sitePersisted ? onChangeThemeOverrides : setLocalDesignations
    return {
      key: def.key,
      label: def.label,
      hex,
      designation,
      onChangeDesignation: text => {
        const trimmed = text.trim()
        if (!trimmed) {
          setStore(prev => {
            if (!prev?.[storageKey]) return prev ?? {}
            const next = { ...prev }
            delete next[storageKey]
            return next
          })
          return
        }
        const parsed = parseDesignation(trimmed)
        if (parsed && def.naturalRef && parsed.family === def.naturalRef.family && parsed.step === def.naturalRef.step) {
          // Picking the built-in designation just clears the override.
          setStore(prev => {
            const next = { ...(prev ?? {}) }
            delete next[storageKey]
            return next
          })
        } else if (parsed) setStore(prev => ({ ...(prev ?? {}), [storageKey]: parsed }))
        // Unparseable text is simply discarded, reverting the input back to
        // whatever it showed before the edit (DesignationInput's own effect
        // re-syncs its draft once this re-renders with the same designation).
      },
    }
  }

  const resolveGroup = (defs, mode, scope, tintKey) => defs.map(def => resolveDesignable(def, mode, scope, tintKey))

  const baseThemeDefs = liveThemeRoleDefs(primaryScale, secondaryScale)

  // One resolved { label, light: {primary,secondary,neutral}, dark: {...} }
  // per TINT_THEMES entry — Primary/Secondary groups are the exact same
  // defs (and so the same shared scope, see resolveDesignable above)
  // regardless of tint, since the live site never varies them by tint
  // either. The Neutral group's defs get re-pointed first (retintNeutralDefs)
  // for a theme with its own `retintFamily`, AND its *local-only* roles (On
  // Background/On Surface/On Surface Variant/Placeholder — the ones with no
  // site override slot, see resolveDesignable) get their own
  // `neutral-<tintKey>` scope per theme — unlike Primary/Secondary, these
  // roles' natural value genuinely differs by tint (On Background reads
  // Primary under Neutral/Primary Tint, Secondary under Secondary Tint), so
  // a typed-in designation shouldn't leak from one theme's preview into
  // another's the way sharing one scope would.
  const tintThemes = TINT_THEMES.map(tintTheme => {
    const neutralLightDefs = tintTheme.retintFamily
      ? retintNeutralDefs(baseThemeDefs.light.neutral, tintTheme.retintFamily, primaryScale, secondaryScale, tintTheme.textFamily)
      : baseThemeDefs.light.neutral
    const neutralDarkDefs = tintTheme.retintFamily
      ? retintNeutralDefs(baseThemeDefs.dark.neutral, tintTheme.retintFamily, primaryScale, secondaryScale, tintTheme.textFamily)
      : baseThemeDefs.dark.neutral
    const neutralScope = `neutral-${tintTheme.key}`
    return {
      key: tintTheme.key,
      label: tintTheme.label,
      light: {
        primary: resolveGroup(baseThemeDefs.light.primary, 'light', `primary-${tintTheme.key}`, tintTheme.key),
        secondary: resolveGroup(baseThemeDefs.light.secondary, 'light', `secondary-${tintTheme.key}`, tintTheme.key),
        neutral: resolveGroup(neutralLightDefs, 'light', neutralScope, tintTheme.key),
      },
      dark: {
        primary: resolveGroup(baseThemeDefs.dark.primary, 'dark', `primary-${tintTheme.key}`, tintTheme.key),
        secondary: resolveGroup(baseThemeDefs.dark.secondary, 'dark', `secondary-${tintTheme.key}`, tintTheme.key),
        neutral: resolveGroup(neutralDarkDefs, 'dark', neutralScope, tintTheme.key),
      },
    }
  })

  const golfStatusDefs = golfStatusRoleDefs()
  const golfStatusRoles = {
    light: resolveGroup(golfStatusDefs.light, 'light', 'golfstatus', 'golfstatus'),
    dark: resolveGroup(golfStatusDefs.dark, 'dark', 'golfstatus', 'golfstatus'),
  }

  // Each TINT_THEMES entry's own three groups flattened into one list
  // (theme.scss's declaration order — Primary, Secondary, Neutral), same as
  // "Default" on the Event Site tab used to build just for Neutral Tint —
  // the same resolved chips, same state, so editing a designation from any
  // tab is one and the same edit. Site Colors' own element list
  // (resolveElementDesignable below) reads all three, side by side, so a
  // role reference an element points at (e.g. "Background") shows how it'd
  // actually render under every tint at once.
  const flattenedTintThemes = tintThemes.map(t => ({
    key: t.key,
    label: t.label,
    light: [...t.light.primary, ...t.light.secondary, ...t.light.neutral],
    dark: [...t.dark.primary, ...t.dark.secondary, ...t.dark.neutral],
  }))

  // Site Colors' own columns: the tint themes plus GolfStatus's fixed roles
  // (already one flat list, same shape as flattenedTintThemes' entries).
  const siteColorThemes = [
    ...flattenedTintThemes,
    { key: 'golfstatus', label: 'GolfStatus', light: golfStatusRoles.light, dark: golfStatusRoles.dark },
  ]

  // Resolves one ELEMENT_DEFS entry for one mode into a chip-ready
  // { hex, designation, onChangeDesignation } — keyed by "mode-elementKey"
  // only, same override regardless of which tint it's being displayed
  // under (`roleList`, one of flattenedTintThemes' own light/dark arrays) —
  // an element's assignment ("point at Background") doesn't change per
  // tint, only what that assignment currently RESOLVES to does, since a
  // Neutral-group role's own hex genuinely differs per tint (Primary/
  // Secondary's own roles don't). Always falls back to `roleList`'s own
  // already-resolved hex for `baseRoleKey` when nothing's assigned, so an
  // element tracks whatever that role currently resolves to (including its
  // own themeOverrides riff, if any) rather than freezing a snapshot of it.
  //
  // Unlike resolveDesignable above (a role pointed at a literal scale step,
  // e.g. { family: 'primary', step: 600 } — the Theme tab's own
  // vocabulary), an element here is pointed at another ROLE by name (e.g.
  // "On Primary"), stored as { role: 'onPrimary' } and resolved by reading
  // THAT role's own already-resolved hex/label out of `roleList` — so it
  // keeps tracking whatever On Primary itself currently is (tint, its own
  // override, ...) rather than a frozen scale step. A legacy
  // { family, step }/White/Black ref (saved before this screen switched to
  // role references) still resolves fine via resolveOverrideHex, it just
  // isn't something typing into this input can produce anymore.
  const resolveElementDesignable = (def, mode, roleList, tintKey) => {
    // Assignments are shared by every theme (see setElementAssignment), so
    // GolfStatus's slot is the one source of truth all tiles read from.
    const storageKey = `${mode}-${CANONICAL_THEME}-${def.key}`
    const fallbackRole = roleList.find(item => item.key === def.baseRoleKey)
    // Light-mode header (EventWebsitePage.jsx's --es-header-ink/-on-ink,
    // .es-header-bar) isn't Primary/On Primary on a tinted theme: it's the
    // ink step (Primary 800; grey-800 for Neutral Tint) with white text.
    // GolfStatus and dark mode read Primary/On Primary roles; dark mode
    // inverts the pairing (.dark .es-header-bar).
    const roleItem = key => roleList.find(item => item.key === key)
    const HEADER_TEXT_KEYS = ['headerIcon', 'headerEventName', 'headerActionIcons']
    let headerDefault
    if (mode === 'light' && tintKey !== 'golfstatus') {
      if (tintKey === 'neutral') {
        // Neutral Tint keeps the plain Primary/On Primary header.
      } else if (def.key === 'headerBackground') {
        headerDefault = { hex: primaryScale[800], caption: 'Primary 800' }
      } else if (HEADER_TEXT_KEYS.includes(def.key)) headerDefault = { hex: WHITE, caption: 'White' }
    } else if (mode === 'dark') {
      const source = def.key === 'headerBackground' ? roleItem('onPrimary') : HEADER_TEXT_KEYS.includes(def.key) ? roleItem('primary') : null
      if (source) headerDefault = { hex: source.hex, caption: source.designation || source.label }
    }
    const storedRef = elementOverrides?.[storageKey] ?? null
    const referencedRole = storedRef?.role
      ? roleList.find(item => item.key === storedRef.role)
      : null
    const hex = referencedRole
      ? referencedRole.hex
      : resolveOverrideHex(storedRef, { primaryScale, secondaryScale }) ?? headerDefault?.hex ?? fallbackRole?.hex
    const designation = referencedRole ? referencedRole.label : refToText(storedRef)
    // What the tile shows instead of a hex: the scale step / role this
    // element resolves to under this theme (e.g. "Primary 50", "White").
    const resolvedRole = referencedRole ?? fallbackRole
    const caption = referencedRole
      ? resolvedRole?.designation || resolvedRole?.label
      : storedRef
        ? refToText(storedRef)
        : headerDefault?.caption ?? (resolvedRole?.designation || resolvedRole?.label)
    return {
      key: def.key,
      hex,
      caption,
      designation,
    }
  }

  // One dropdown per element (Site Colors' Page Element row) writes the
  // same role/scale reference into every theme + mode slot the live site
  // reads (EventWebsitePage.jsx's `${mode}-${tint}-${key}`), so structure
  // stays identical across themes while each theme still resolves that role
  // to its own colors. Picking the element's own default role clears it.
  const setElementAssignment = (def, text) => {
    const trimmed = text.trim()
    const roleKey = trimmed ? parseRoleReference(trimmed) : null
    if (trimmed && !roleKey) return
    const value = roleKey && roleKey !== def.baseRoleKey ? { role: roleKey } : null
    onChangeElementOverrides(prev => {
      const next = { ...(prev ?? {}) }
      ;['light', 'dark'].forEach(mode => siteColorThemes.forEach(theme => {
        const key = `${mode}-${theme.key}-${def.key}`
        if (value) next[key] = value
        else delete next[key]
      }))
      return next
    })
  }

  const elementAssignment = def => {
    const stored = elementOverrides?.[`light-${CANONICAL_THEME}-${def.key}`]
    const baseLabel = golfStatusRoles.light.find(r => r.key === def.baseRoleKey)?.label
    const current = stored?.role
      ? golfStatusRoles.light.find(r => r.key === stored.role)?.label
      : refToText(stored)
    return { value: current, placeholder: baseLabel }
  }

  return (
    <div className="ordr1-list">
      <GSActionBar type="form-header H3" header="Color Exploration" />

      <nav className="wds-color-tabs">
        <GSActionBar
          type="large-pad"
          pageActions={COLOR_TABS.map(tab => ({
            title: tab.label,
            ...(tab.key === activeTab
              ? { type: 'black secondary' }
              : { type: 'transparent secondary' }),
            isFocusable: true,
            onClick: () => setActiveTab(tab.key),
          }))}
        />
      </nav>

      {activeTab === 'ramps' && (() => {
        const neutralItems = RAMP_STEPS.map(step => ({ key: step, hex: NEUTRAL_SCALE[step] }))
        const primaryItems = RAMP_STEPS.map(step => ({ key: step, hex: primaryScale[step], isBase: step === 400 }))
        const secondaryItems = RAMP_STEPS.map(step => ({ key: step, hex: secondaryScale[step], isBase: step === 400 }))
        return (
          <div className="wds-ramps-compare">
            <RampRowLabels />
            <RampGroup
              label="Neutral"
              picker={<div className="wds-ramp-fixed-note">Fixed palette — not editable</div>}
              light={neutralItems}
              dark={neutralItems}
            />
            <RampGroup
              label="Primary"
              picker={<BaseColorPicker color={primaryColor} onChangeColor={onChangePrimaryColor} />}
              light={primaryItems}
              dark={primaryItems}
            />
            <RampGroup
              label="Secondary"
              picker={<BaseColorPicker color={secondaryColor} onChangeColor={onChangeSecondaryColor} />}
              light={secondaryItems}
              dark={secondaryItems}
            />
          </div>
        )
      })()}

      {activeTab === 'theme' && (
        <RoleCompareTable
          tintThemes={[
            ...tintThemes,
            { key: 'golfstatus', label: 'GolfStatus', light: groupGolfStatusRoles(golfStatusRoles.light), dark: groupGolfStatusRoles(golfStatusRoles.dark) },
          ]}
        />
      )}

      {activeTab === 'site-colors' && (
        <div className="wds-element-list" style={{ '--wds-theme-cols': siteColorThemes.length }}>
          <GSActionBar type="form-header H3" header="Assign Specific Elements" />
          {/* Every ELEMENT_DEFS entry, grouped by the section it lives in on
              the live site (Sitewide first, then per-page-section), each
              shown side by side under all three tint themes (see
              flattenedTintThemes/ElementRow's own `columns`) so a role
              reference reads as "here's how this actually renders under
              Neutral vs Primary vs Secondary Tint" instead of a single,
              tint-blind preview — the assignment itself doesn't change per
              tint, only what it currently resolves to does. Each one's own
              light/dark designation input is a real, persisted --es-el-*
              override (EventWebsitePage.jsx's ELEMENT_TO_CSS_VAR/
              customThemeStyle). Clearing an element's designation (blank/
              "—") reverts it to inheriting its baseRoleKey's own current
              value instead of a frozen snapshot of it — Sitewide's own 4
              rows (Page Background/Text/Section Box Background/Border) are
              exactly that fallback for every other element below them, so
              changing one of those moves everything still inheriting it at
              once. This used to sit behind a separate Navigation/Accent/
              Structure swatch grid + CSS variable table; both were folded
              into this one list (Sitewide's own rows cover the same 4 roles
              that table's "Structure" bucket did, each row already shows
              its own --es-el-* var via ElementRow's cssVar prop) rather
              than showing the same roles twice. */}
          <CompareHeader themes={siteColorThemes} />
          {ELEMENT_GROUPS.map(group => (
            <div className="wds-element-group" key={group.section}>
              <div className="wds-element-group-title">{group.section}</div>
              {group.defs.map(def => (
                <CompareRow
                  key={def.key}
                  label={def.label}
                  cssVar={SITE_ELEMENT_CSS_VAR[def.key]}
                  control={(() => {
                    const { value, placeholder } = elementAssignment(def)
                    return (
                      <DesignationInput
                        value={value}
                        placeholder={placeholder}
                        onCommit={text => setElementAssignment(def, text)}
                        hint={ELEMENT_DESIGNATION_HINT}
                        options={ROLE_DESIGNATIONS}
                      />
                    )
                  })()}
                  columns={siteColorThemes.map(tintTheme => ({
                    key: tintTheme.key,
                    light: resolveElementDesignable(def, 'light', tintTheme.light, tintTheme.key),
                    dark: resolveElementDesignable(def, 'dark', tintTheme.dark, tintTheme.key),
                  }))}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'buttons' && (
        <ButtonsTab
          themes={BUTTON_THEMES}
          overrides={buttonOverrides}
          onChange={onChangeButtonOverrides}
          scales={{ primaryScale, secondaryScale }}
          buttonStyles={buttonStyles}
          onChangeButtonStyles={onChangeButtonStyles}
        />
      )}
    </div>
  )
}
