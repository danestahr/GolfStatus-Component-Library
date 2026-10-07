import { useEffect, useRef, useState } from 'react'
import { faPalette, faDownload } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSinput from '../../gs-lib/components/gs-input'
import { generateScale, buttonThemeVars, SCALE_STEPS, hexToHsl, TINT_STOPS, SHADE_STOPS } from '../../gs-lib/helpers/colorScale'
import { golfstatusColors } from '../../gs-lib/helpers/Theme'
import { pickAccessibleTextColor, contrastRatio } from '../../gs-lib/helpers/contrast'
import { resolveOverrideHex, OUTLINE_VARIANT_MONO_STEP } from '../../gs-lib/helpers/monochromatic'
import {
  BUTTON_COLORS,
  BUTTON_APPEARANCES,
  BUTTON_IDS,
  BUTTON_DEFAULTS,
  buttonOverrideKey,
  buttonStyleKey,
  buttonVarName,
  resolveButtonOverride,
} from '../../data/eventSiteButtons.js'
import { zipFiles } from '../../data/zip.js'
import { ELEMENT_ROLES } from '../../data/eventSiteElements.js'
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
// back as text. `grey` displays as "Grey" (this screen's own naming for
// that scale, see NEUTRAL_SCALE above) rather than monochromatic.js's
// internal "grey" family name.
function refToText(ref) {
  if (!ref) return ''
  if (ref.family === 'white') return 'White'
  if (ref.family === 'black') return 'Black'
  if (ref.family === 'grey') return `Grey ${ref.step}`
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
  'primary container': 'primaryContainer',
  'on primary container': 'onPrimary',
  'primary container variant': 'primaryContainerVariant',
  'on primary container variant': 'onPrimaryContainerVariant',
  'on primary': 'onPrimary',
  'secondary': 'secondary',
  'secondary container': 'secondaryContainer',
  'on secondary container': 'onSecondary',
  'secondary container variant': 'secondaryContainerVariant',
  'on secondary container variant': 'onSecondaryContainerVariant',
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
  ...['Primary', 'Secondary', 'Grey'].flatMap(family => SCALE_STEPS.map(step => `${family} ${step}`)),
]
// Theme roles only — an element points at a role, never a raw scale step.
const ROLE_DESIGNATIONS = ['Primary', 'Primary Container', 'On Primary Container', 'Primary Container Variant', 'On Primary Container Variant', 'On Primary Fill', 'Primary Subtle', 'On Primary Subtle', 'Secondary', 'Secondary Container', 'On Secondary Container', 'Secondary Container Variant', 'On Secondary Container Variant', 'On Secondary Fill', 'Secondary Subtle', 'On Secondary Subtle', 'Background', 'On Background', 'Surface', 'On Surface', 'Surface Variant', 'On Surface Variant', 'Surface Container Low', 'Surface Container High', 'Surface Container Highest', 'Surface Bright', 'Outline', 'Outline Variant', 'Placeholder', 'Tertiary', 'On Tertiary']

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

// The math behind one Primary/Secondary ramp, shown under the swatches on
// the Color Ramps tab. Reads the same TINT_STOPS/SHADE_STOPS colorScale.js's
// generateScale() uses, so the numbers here can't drift from the swatches.
const round1 = n => Math.round(n * 10) / 10

function RampFormula({ label, baseHex, scale }) {
  const [h, s, l] = hexToHsl(baseHex)
  const rows = RAMP_STEPS.map(step => {
    if (step === 400) return { step, rule: 'Base color (as entered)', calc: `L = ${round1(l)}`, L: l }
    if (TINT_STOPS[step] != null) {
      const t = TINT_STOPS[step]
      const L = l + (100 - l) * t
      return { step, rule: `Tint, t = ${t}`, calc: `${round1(l)} + (100 − ${round1(l)}) × ${t}`, L }
    }
    const t = SHADE_STOPS[step]
    const L = l * (1 - t)
    return { step, rule: `Shade, t = ${t}`, calc: `${round1(l)} × (1 − ${t})`, L }
  })
  return (
    <div className="wds-ramp-formula-group">
      <div className="wds-ramp-group-title">{label}</div>
      <div className="wds-ramp-formula-base">
        Base {baseHex.toUpperCase()} → H {round1(h)}°, S {round1(s)}%, L {round1(l)}%
      </div>
      <table className="wds-ramp-formula-table">
        <thead>
          <tr><th>Step</th><th>Rule</th><th>Lightness calc</th><th>HSL</th><th>Hex</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.step}>
              <td>{r.step}</td>
              <td>{r.rule}</td>
              <td>{r.calc} = {round1(r.L)}</td>
              <td>hsl({round1(h)}, {round1(s)}%, {round1(r.L)}%)</td>
              <td>
                <span className="wds-ramp-formula-dot" style={{ backgroundColor: scale[r.step] }} />
                {scale[r.step]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RampFormulaSection({ primaryColor, secondaryColor, primaryScale, secondaryScale }) {
  return (
    <section className="wds-ramp-formula">
      <div className="wds-ramp-formula-title">How the ramps are calculated</div>
      <div className="wds-ramp-formula-intro">
        Each ramp starts from one base color, which becomes step 400. Convert it to HSL, then hold
        Hue (H) and Saturation (S) constant and move only Lightness (L). Tints (300 → 50) blend toward
        white; shades (500 → 900) blend toward black. Both sides use evenly spaced stops, each
        reaching 90% of the way to white/black at the end.
        <ul>
          <li><b>Tint:</b> L = L<sub>base</sub> + (100 − L<sub>base</sub>) × t &nbsp;(t: 300 = 0.225, 200 = 0.45, 100 = 0.675, 50 = 0.9)</li>
          <li><b>Shade:</b> L = L<sub>base</sub> × (1 − t) &nbsp;(t: 500 = 0.18, 600 = 0.36, 700 = 0.54, 800 = 0.72, 900 = 0.9)</li>
          <li>Grey is a fixed palette, not generated.</li>
        </ul>
      </div>
      <div className="wds-ramp-formula-groups">
        <RampFormula label="Primary" baseHex={primaryColor} scale={primaryScale} />
        <RampFormula label="Secondary" baseHex={secondaryColor} scale={secondaryScale} />
      </div>
    </section>
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
function RoleCompareCell({ light, dark, designationHint, designationOptions, single }) {
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
      {!single && <div className="wds-role-chip-slot wds-role-chip-slot--dark">
        <RampChip
          caption={dark.caption}
          hex={dark.hex}
          designation={dark.designation}
          onChangeDesignation={dark.onChangeDesignation}
          designationHint={designationHint}
          designationPlaceholder={dark.placeholder}
          designationOptions={designationOptions}
        />
      </div>}
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
// Subtle starts as a copy of Subtle but its element assignments
// are fully independent of every other theme's.
const SEPARATE_THEME = 'neutral-two-tone'
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
          <RoleCompareCell key={column.key} light={column.light} dark={column.dark} single={column.single} designationHint={designationHint} designationOptions={designationOptions} />
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
          {/* Row labels come from a full-role theme — the fixed Neutral Theme column can lead but has fewer roles. */}
          {(tintThemes.find(t => t.key !== 'golfstatus') ?? tintThemes[0]).light[group.key].map(roleDef => (
            <CompareRow
              key={roleDef.key}
              label={roleDef.label}
              columns={tintThemes.map(theme => ({
                key: theme.key,
                // Primary/Secondary are just the chosen colors — no dark mode.
                single: roleDef.key === 'primary' || roleDef.key === 'secondary',
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
    // Primary/Secondary: the chosen colors, same in light and dark.
    const primaryBase = primaryScale[400]
    const secondaryBase = secondaryScale[400]
    // pickAccessibleTextColor (contrast.js) picks whichever of these two
    // steps actually wins — recomputed here (via the same exported
    // contrastRatio) just to know *which* step it picked, for naturalRef.
    const onPrimaryStep = contrastRatio(primaryBase, primaryScale[800]) >= contrastRatio(primaryBase, primaryScale[100]) ? 800 : 100
    const onSecondaryStep = contrastRatio(secondaryBase, secondaryScale[800]) >= contrastRatio(secondaryBase, secondaryScale[100]) ? 800 : 100
    return {
      primary: [
        { key: 'primary', label: 'Primary', fallbackHex: primaryScale[400], naturalRef: null, editable: false },
        { key: 'primaryContainer', label: 'Primary Container', fallbackHex: primaryBase, naturalRef: { family: 'primary', step: 400 }, editable: true, sitePersisted: true, compact: true, impliedFamily: 'primary' },
        { key: 'onPrimary', label: 'On Primary Container', fallbackHex: pickAccessibleTextColor(primaryBase, primaryScale[100], primaryScale[800]), naturalRef: { family: 'primary', step: onPrimaryStep }, editable: true, sitePersisted: true, compact: true, impliedFamily: 'primary' },
        { key: 'primaryContainerVariant', label: 'Primary Container Variant', fallbackHex: primaryScale[isDark ? 700 : 100], naturalRef: { family: 'primary', step: isDark ? 700 : 100 }, editable: true, sitePersisted: true, compact: true, impliedFamily: 'primary' },
        { key: 'onPrimaryContainerVariant', label: 'On Primary Container Variant', fallbackHex: primaryScale[isDark ? 50 : 900], naturalRef: { family: 'primary', step: isDark ? 50 : 900 }, editable: true, sitePersisted: true, compact: true, impliedFamily: 'primary' },
      ],
      secondary: [
        { key: 'secondary', label: 'Secondary', fallbackHex: secondaryScale[400], naturalRef: null, editable: false },
        { key: 'secondaryContainer', label: 'Secondary Container', fallbackHex: secondaryBase, naturalRef: { family: 'secondary', step: 400 }, editable: true, sitePersisted: true, compact: true, impliedFamily: 'secondary' },
        { key: 'onSecondary', label: 'On Secondary Container', fallbackHex: pickAccessibleTextColor(secondaryBase, secondaryScale[100], secondaryScale[800]), naturalRef: { family: 'secondary', step: onSecondaryStep }, editable: true, sitePersisted: true, compact: true, impliedFamily: 'secondary' },
        { key: 'secondaryContainerVariant', label: 'Secondary Container Variant', fallbackHex: secondaryScale[isDark ? 700 : 100], naturalRef: { family: 'secondary', step: isDark ? 700 : 100 }, editable: true, sitePersisted: true, compact: true, impliedFamily: 'secondary' },
        { key: 'onSecondaryContainerVariant', label: 'On Secondary Container Variant', fallbackHex: secondaryScale[isDark ? 50 : 900], naturalRef: { family: 'secondary', step: isDark ? 50 : 900 }, editable: true, sitePersisted: true, compact: true, impliedFamily: 'secondary' },
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
  // Subtle and Bold are hidden for now — drop `hidden` to bring them back.
  { key: 'neutral', label: 'Subtle (single color)', monochromatic: false, retintFamily: null, hidden: true },
  // Straight duplicate of Subtle (see normalizeNeutralTint) with its own override slots.
  { key: 'neutral-two-tone', label: 'Subtle', monochromatic: false, retintFamily: null },
  { key: 'primary', label: 'Bold (single color)', monochromatic: true, retintFamily: 'primary', hidden: true },
  // Full Tint (EventWebsitePage.jsx's textScale): surfaces/backgrounds tint
  // with Secondary, text and Outline Variant with Primary.
  { key: 'full', label: 'Bold', monochromatic: true, retintFamily: 'secondary', textFamily: 'primary' },
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
  'primaryContainer', 'secondaryContainer', 'onPrimary', 'onSecondary',
  'primaryContainerVariant', 'onPrimaryContainerVariant', 'secondaryContainerVariant', 'onSecondaryContainerVariant',
  'background', 'onBackground', 'surface', 'onSurface', 'onSurfaceVariant', 'surfaceBright',
  'surfaceContainerLow', 'surfaceContainerHigh', 'surfaceContainerHigest', 'surfaceVariant',
  'outline', 'outlineVariant', 'tertiaryContainer',
])

function golfStatusRoleDefs() {
  const forMode = mode => {
    const isDark = mode === 'dark'
    const roles = [
      { key: 'primary', label: 'Primary', fallbackHex: isDark ? WHITE : golfstatusColors.grey800, naturalRef: null, editable: false },
      { key: 'primaryContainer', label: 'Primary Container', fallbackHex: isDark ? WHITE : golfstatusColors.grey800, naturalRef: isDark ? { family: 'white' } : { family: 'grey', step: 800 }, editable: true },
      { key: 'onPrimary', label: 'On Primary Container', fallbackHex: isDark ? golfstatusColors.grey800 : WHITE, naturalRef: isDark ? { family: 'grey', step: 800 } : { family: 'white' }, editable: true },
      { key: 'primaryContainerVariant', label: 'Primary Container Variant', fallbackHex: isDark ? golfstatusColors.grey700 : golfstatusColors.grey200, naturalRef: { family: 'grey', step: isDark ? 700 : 200 }, editable: true },
      { key: 'onPrimaryContainerVariant', label: 'On Primary Container Variant', fallbackHex: isDark ? WHITE : golfstatusColors.grey800, naturalRef: isDark ? { family: 'white' } : { family: 'grey', step: 800 }, editable: true },
      { key: 'secondary', label: 'Secondary', fallbackHex: isDark ? golfstatusColors.cyan200 : golfstatusColors.cyan700, naturalRef: null, editable: false },
      { key: 'secondaryContainer', label: 'Secondary Container', fallbackHex: isDark ? golfstatusColors.cyan200 : golfstatusColors.cyan700, naturalRef: null, editable: true },
      { key: 'onSecondary', label: 'On Secondary Container', fallbackHex: WHITE, naturalRef: { family: 'white' }, editable: true },
      { key: 'secondaryContainerVariant', label: 'Secondary Container Variant', fallbackHex: isDark ? golfstatusColors.cyan800 : golfstatusColors.cyan200, naturalRef: null, editable: true },
      { key: 'onSecondaryContainerVariant', label: 'On Secondary Container Variant', fallbackHex: isDark ? golfstatusColors.cyan100 : golfstatusColors.cyan800, naturalRef: null, editable: true },
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
  'primary', 'primaryContainer', 'onPrimary',
  'secondary', 'secondaryContainer',
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
  { key: 'headerBackground', label: 'Header Background', section: 'Header', baseRoleKey: 'primaryContainer' },
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

  { key: 'cartItemBackground', label: 'Cart Item Background (suggestions, quantity, forms)', section: 'Cart', baseRoleKey: 'surfaceBright' },
  { key: 'cartFormIncompleteBorder', label: 'Incomplete Form Border', section: 'Cart', baseRoleKey: 'outline' },
  { key: 'cartFooterBackground', label: 'Next Step Footer Background', section: 'Cart', baseRoleKey: 'background' },
  { key: 'cartFooterText', label: 'Next Step Footer Text', section: 'Cart', baseRoleKey: 'onBackground' },
  { key: 'cartFooterBorder', label: 'Next Step Footer Border', section: 'Cart', baseRoleKey: 'outlineVariant' },

  { key: 'slideOutBackground', label: 'Slide Out Background', section: 'Slide Outs', baseRoleKey: 'background' },
  { key: 'slideOutText', label: 'Slide Out Text', section: 'Slide Outs', baseRoleKey: 'onBackground' },
  { key: 'slideOutNavBackground', label: 'Slide Out Nav Background', section: 'Slide Outs', baseRoleKey: 'background' },
  { key: 'slideOutBorder', label: 'Slide Out Dividers', section: 'Slide Outs', baseRoleKey: 'outlineVariant' },
  { key: 'slideOutFieldBorder', label: 'Text Field Border', section: 'Slide Outs', baseRoleKey: 'outline' },

  { key: 'formSectionBackground', label: 'Form Section Background', section: 'Forms', baseRoleKey: 'background' },
  { key: 'formSectionBorder', label: 'Form Section Border', section: 'Forms', baseRoleKey: 'outlineVariant' },
  { key: 'textFieldBackground', label: 'Text Field Background', section: 'Forms', baseRoleKey: 'background' },
  { key: 'textFieldText', label: 'Text Field Text', section: 'Forms', baseRoleKey: 'onBackground' },
  { key: 'textAreaBackground', label: 'Text Area Background', section: 'Forms', baseRoleKey: 'background' },
  { key: 'textAreaText', label: 'Text Area Text', section: 'Forms', baseRoleKey: 'onBackground' },
  { key: 'textAreaBorder', label: 'Text Area Border', section: 'Forms', baseRoleKey: 'outline' },
  { key: 'dropdownBackground', label: 'Dropdown Background', section: 'Forms', baseRoleKey: 'surfaceBright' },
  { key: 'dropdownText', label: 'Dropdown Text', section: 'Forms', baseRoleKey: 'onSurface' },
  { key: 'dropdownBorder', label: 'Dropdown Border', section: 'Forms', baseRoleKey: 'outline' },
  { key: 'toggleOnTrack', label: 'Toggle On Track', section: 'Forms', baseRoleKey: 'primary' },
  { key: 'toggleOffTrack', label: 'Toggle Off Track', section: 'Forms', baseRoleKey: 'outline' },
  { key: 'toggleKnob', label: 'Toggle Knob', section: 'Forms', baseRoleKey: 'onPrimary' },
  { key: 'fileUploadBackground', label: 'File Upload Background', section: 'Forms', baseRoleKey: 'background' },
  { key: 'fileUploadBorder', label: 'File Upload Border', section: 'Forms', baseRoleKey: 'outlineVariant' },
  { key: 'fileUploadText', label: 'File Upload Text', section: 'Forms', baseRoleKey: 'onBackground' },

  { key: 'sponsorTierHeader', label: 'Tier Header', section: 'Sponsors', baseRoleKey: 'onSurface' },
  { key: 'sponsorTileName', label: 'Sponsor Tile Name', section: 'Sponsors', baseRoleKey: 'onSurface' },
  { key: 'registrantTileBackground', label: 'Registrant Tile Background', section: 'Sponsors', baseRoleKey: 'surfaceBright' },
  { key: 'sponsorFeatureName', label: 'Feature Sponsor Name', section: 'Sponsors', baseRoleKey: 'onSurface' },
  { key: 'sponsorFeatureDescription', label: 'Feature Sponsor Description', section: 'Sponsors', baseRoleKey: 'onSurface' },

  { key: 'videoFrameBorder', label: 'Video Frame Border', section: 'Media', baseRoleKey: 'outlineVariant' },
  { key: 'imageFrameBorder', label: 'Image Frame Border (photos, sponsor logos)', section: 'Media', baseRoleKey: 'outlineVariant' },

  { key: 'donationGoalLabel', label: 'Goal Label', section: 'Donation', baseRoleKey: 'onSurface' },
  { key: 'donationProgressBorder', label: 'Progress Bar Border', section: 'Donation', baseRoleKey: 'outlineVariant' },
  { key: 'donationProgressTrack', label: 'Progress Bar Track', section: 'Donation', baseRoleKey: 'surfaceContainerHighest' },
  { key: 'donationProgressText', label: 'Progress Bar Percentage', section: 'Donation', baseRoleKey: 'onSurface' },
  { key: 'donationTileBackground', label: 'Amount Tile Background', section: 'Donation', baseRoleKey: 'surfaceBright' },
  { key: 'donationTileText', label: 'Amount Tile Text', section: 'Donation', baseRoleKey: 'onSurface' },
  { key: 'donationProgressFill', label: 'Progress Bar Fill', section: 'Donation', baseRoleKey: 'secondaryContainer' },

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
  { key: 'golfstatus', label: 'Grayscale' },
  { key: 'neutral-two-tone', label: 'Subtle' },
  { key: 'full', label: 'Bold' },
]

// What a button part renders as when nothing's been overridden: the tint
// themes read buttonThemeVars (colorScale.js — the same helper the live
// site's theme tokens mirror), GolfStatus reads its own fixed brand roles
// (golfStatusRoleDefs, transcribed from theme.scss).
function defaultButtonHex(mode, color, appearance, part, scales) {
  if (color === 'neutral') {
    const dark = mode === 'dark'
    const ink = dark ? WHITE : golfstatusColors.grey800
    if (appearance === 'fill') return part === 'bg' ? ink : dark ? golfstatusColors.grey800 : WHITE
    if (appearance === 'subtle') return part === 'bg' ? (dark ? golfstatusColors.grey800 : golfstatusColors.grey100) : ink
    return ink
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
function defaultButtonRef(mode, color, appearance, part, scales) {
  const dark = mode === 'dark'
  if (color === 'neutral') {
    if (appearance === 'fill') return part === 'bg' ? (dark ? { family: 'white' } : { family: 'grey', step: 800 }) : (dark ? { family: 'grey', step: 800 } : { family: 'white' })
    if (appearance === 'subtle' && part === 'bg') return { family: 'grey', step: dark ? 800 : 100 }
    return dark ? { family: 'white' } : { family: 'grey', step: 800 }
  }
  let step
  if (appearance === 'subtle') step = part === 'bg' ? (dark ? 700 : 100) : (dark ? 50 : 900)
  else if (appearance === 'fill' && part === 'text') {
    // Same AA pick as buttonThemeVars (colorScale.js).
    const scale = scales[`${color}Scale`]
    step = contrastRatio(scale[400], scale[50]) >= contrastRatio(scale[400], scale[900]) ? 50 : 900
  } else step = 400
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
            value={override?.role ? ELEMENT_ROLES.find(r => r.key === override.role)?.label ?? '' : refToText(override ?? defaultRef)}
            onChange={e => {
              const roleKey = e.target.value ? parseRoleReference(e.target.value) : null
              const next = roleKey ? { role: roleKey } : e.target.value ? parseDesignation(e.target.value) : null
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
            <optgroup label="Theme">
              {ELEMENT_ROLES.map(role => (
                <option key={role.key} value={role.label}>{role.label}</option>
              ))}
            </optgroup>
            {['Grey', 'Primary', 'Secondary'].map(family => (
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
function ButtonVariantCell({ mode, color, appearance, parts, overrides, onChange, scales }) {
  const effective = {}
  const fields = parts.map(([part, label]) => {
    const key = buttonOverrideKey(mode, color, appearance, part)
    const override = overrides?.[key] ?? null
    const hex = resolveButtonOverride(override, scales, mode) ?? defaultButtonHex(mode, color, appearance, part, scales)
    effective[buttonVarName(color, appearance, part)] = hex
    return (
      <ButtonColorField
        key={part}
        label={label}
        hex={hex}
        override={override}
        defaultRef={defaultButtonRef(mode, color, appearance, part, scales)}
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
function ButtonStylesSection({ themes, buttonStyles, onChange }) {
  // Picks are stored per theme, so one theme is edited at a time.
  const [themeKey, setThemeKey] = useState(themes[0].key)
  const setStyle = (id, patch) =>
    onChange(prev => {
      const [defColor, defAppearance] = BUTTON_DEFAULTS[id]
      const k = buttonStyleKey(themeKey, id)
      return {
        ...(prev ?? {}),
        [k]: { color: `${defColor}-color`, appearance: defAppearance, ...(prev?.[k] ?? {}), ...patch },
      }
    })
  const reset = id =>
    onChange(prev => {
      const next = { ...(prev ?? {}) }
      delete next[buttonStyleKey(themeKey, id)]
      return next
    })
  return (
    <section className="wds-btn-theme wds-btn-styles">
      <GSActionBar type="form-header H3" header="Button Styles" />
      <div className="wds-btn-style-options">
        {themes.map(t => (
          <button
            key={t.key}
            type="button"
            className={`wds-btn-style-option${themeKey === t.key ? ' is-active' : ''}`}
            onClick={() => setThemeKey(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {Object.entries(BUTTON_IDS).map(([id, label]) => {
        const saved = buttonStyles?.[buttonStyleKey(themeKey, id)]
        const [defColor, defAppearance] = BUTTON_DEFAULTS[id]
        // Grayscale only ever uses Grey buttons.
        const color = themeKey === 'golfstatus' ? 'neutral-color' : saved?.color ?? `${defColor}-color`
        const appearance = saved?.appearance ?? defAppearance
        return (
          <div className="wds-btn-style-row" key={id}>
            <div className="wds-btn-style-name">{label}</div>
            <div className="wds-btn-style-options">
              {BUTTON_COLORS.filter(option => themeKey !== 'golfstatus' || option.key === 'neutral').map(option => (
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
      {BUTTON_COLORS.map(({ key: color, label: colorLabel }) => (
        <section className="wds-btn-theme" key={color}>
          <GSActionBar type="form-header H3" header={colorLabel} />
          <div className="wds-btn-grid">
            <div className="wds-btn-grid-head" />
            <div className="wds-btn-grid-head">Light</div>
            <div className="wds-btn-grid-head">Dark</div>
            {BUTTON_APPEARANCES.map(({ key: appearance, label: appearanceLabel, parts }) => (
              <div className="wds-btn-row" key={`${color}-${appearance}`}>
                <div className="wds-btn-row-label">{colorLabel} {appearanceLabel}</div>
                {['light', 'dark'].map(mode => (
                  <ButtonVariantCell
                    key={mode}
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
            ))}
          </div>
        </section>
      ))}
      <ButtonStylesSection themes={themes} buttonStyles={buttonStyles} onChange={onChangeButtonStyles} />
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
  // Each theme role's hex per mode — what a button part pointing at a role shows.
  const buttonRoleHexes = Object.fromEntries(
    Object.entries(liveThemeRoleDefs(primaryScale, secondaryScale)).map(([mode, groups]) => [
      mode,
      Object.fromEntries(Object.values(groups).flat().map(r => [r.key, r.fallbackHex])),
    ])
  )
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
  const tintThemes = TINT_THEMES.filter(tintTheme => !tintTheme.hidden).map(tintTheme => {
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
  // Ordered to match the Site Theme radio (Neutral Theme first).
  const siteColorThemes = [
    { key: 'golfstatus', label: 'Grayscale', light: golfStatusRoles.light, dark: golfStatusRoles.dark },
    ...flattenedTintThemes,
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
    // GolfStatus's slot is the one source of truth all tiles read from —
    // except Subtle, which keeps its own so it can diverge.
    const storageKey = `${mode}-${tintKey}-${def.key}`
    const fallbackRole = roleList.find(item => item.key === def.baseRoleKey)
    // The header reads Primary Container / On Primary Container (its
    // baseRoleKeys) in every theme; only the fixed GolfStatus theme's dark
    // mode inverts the pairing (see EventWebsitePage.jsx's headerStyle).
    const roleItem = key => roleList.find(item => item.key === key)
    const HEADER_TEXT_KEYS = ['headerIcon', 'headerEventName', 'headerActionIcons']
    let headerDefault
    if (mode === 'dark' && tintKey === 'golfstatus') {
      const source = def.key === 'headerBackground' ? roleItem('onPrimary') : HEADER_TEXT_KEYS.includes(def.key) ? roleItem('primaryContainer') : null
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
  const setElementAssignment = (def, text, separate = false) => {
    const trimmed = text.trim()
    const roleKey = trimmed ? parseRoleReference(trimmed) : null
    if (trimmed && !roleKey) return
    const value = roleKey && roleKey !== def.baseRoleKey ? { role: roleKey } : null
    onChangeElementOverrides(prev => {
      const next = { ...(prev ?? {}) }
      ;['light', 'dark'].forEach(mode => siteColorThemes.forEach(theme => {
        if ((theme.key === SEPARATE_THEME) !== separate) return
        const key = `${mode}-${theme.key}-${def.key}`
        if (value) next[key] = value
        else delete next[key]
      }))
      return next
    })
  }

  const elementAssignment = (def, separate = false) => {
    const stored = elementOverrides?.[`light-${separate ? SEPARATE_THEME : CANONICAL_THEME}-${def.key}`]
    const baseLabel = golfStatusRoles.light.find(r => r.key === def.baseRoleKey)?.label
    const current = stored?.role
      ? golfStatusRoles.light.find(r => r.key === stored.role)?.label
      : refToText(stored)
    return { value: current, placeholder: baseLabel }
  }

  // One ES module per theme (Grayscale + the four tints, in the order the
  // Theme tab shows them), zipped into one download. Same shape the devs'
  // own theme files use: each token has a light/dark pair of CSS-style
  // props (color / backgroundColor / borderColor), valued with the color's
  // designation (white, grey800, primary600, ...) instead of a hex. Tokens
  // this page doesn't define are listed in the devs' order, marked unused,
  // with no value. A `null` spec = unused.
  const downloadThemes = () => {
    const tokenSpecs = [
      ['primary', { color: 'primary' }],
      ['secondary', { color: 'secondary' }],
      ['primaryContainer', { backgroundColor: 'primaryContainer', color: 'onPrimary' }],
      ['secondaryContainer', { backgroundColor: 'secondaryContainer', color: 'onSecondary' }],
      ['secondaryContainerHigh', null],
      ['background', { backgroundColor: 'background', color: 'onBackground' }],
      ['surface', { backgroundColor: 'surface', color: 'onSurface' }],
      ['surfaceDim', null],
      ['surfaceBright', { backgroundColor: 'surfaceBright', color: 'onSurface' }],
      ['surfaceVariant', { backgroundColor: 'surfaceVariant', color: 'onSurfaceVariant' }],
      ['surfaceContainer', null],
      ['surfaceContainerLowest', null],
      ['surfaceContainerLow', { backgroundColor: 'surfaceContainerLow', color: 'onSurface' }],
      ['surfaceContainerHigh', { backgroundColor: 'surfaceContainerHigh', color: 'onSurface' }],
      // The library spells this token "Higest" (single h) — kept so it overrides.
      ['surfaceContainerHigest', { backgroundColor: 'surfaceContainerHigest', color: 'onSurface' }],
      ['outline', { borderColor: 'outline' }],
      ['outlineVariant', { borderColor: 'outlineVariant' }],
      ['scrim', null],
      ['error', null],
      ['errorContainer', null],
      ['tertiary', null],
      ['tertiaryContainer', { backgroundColor: 'tertiaryContainer', color: 'onSurface' }],
    ]
    // File/export names the devs expect, by Theme-tab theme.
    const THEME_FILE_NAMES = {
      golfstatus: 'grayscaleTheme',
      neutral: 'subtleTheme',
      'neutral-two-tone': 'subtleTwoToneTheme',
      primary: 'boldTheme',
      full: 'boldTwoToneTheme',
    }
    const palette = { ...golfstatusColors }
    const normHex = hex => {
      const h = String(hex).toLowerCase()
      return /^#[0-9a-f]{3}$/.test(h) ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h
    }
    const hexToName = (hex, names) => names.find(name => typeof palette[name] === 'string' && normHex(palette[name]) === normHex(hex))
    // Numbered/base names (grey800, white) win over aliases (cyan, brightGreen).
    const paletteNames = Object.keys(palette).sort((x, y) => Number(/\d$|^(white|black)$/.test(y)) - Number(/\d$|^(white|black)$/.test(x)))
    const scaleNames = {}
    ;[['primary', primaryScale], ['secondary', secondaryScale]].forEach(([family, scale]) =>
      SCALE_STEPS.forEach(step => { scaleNames[`${family}${step}`] = scale[step] })
    )
    const designationName = text => {
      const [family, step] = text.split(' ')
      if (family === 'White') return 'white'
      if (family === 'Black') return 'black'
      return `${family === 'Grey' ? 'grey' : family.toLowerCase()}${step}`
    }
    // Name a role's color: its designation if it has one, else whichever
    // known palette color / brand scale step matches its hex.
    const nameFor = (role, theme) => {
      if (!role) return null
      if (role.designation) return designationName(role.designation)
      if (theme.key !== 'golfstatus') {
        const scaleName = Object.keys(scaleNames).find(n => normHex(scaleNames[n]) === normHex(role.hex))
        if (scaleName) return scaleName
      }
      return hexToName(role.hex, paletteNames) ?? JSON.stringify(role.hex.toUpperCase())
    }
    // "How the ramps are calculated" (Color Ramps tab), as comments.
    const r1 = n => Math.round(n * 10) / 10
    const rampTable = (label, baseHex, scale) => {
      const [h, sat, l] = hexToHsl(baseHex)
      return [
        `// ${label}: base ${baseHex.toUpperCase()} -> H ${r1(h)}deg, S ${r1(sat)}%, L ${r1(l)}%`,
        ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(step => {
          if (step === 400) return `//   ${step}  base color (as entered), L = ${r1(l)}  ${scale[step]}`
          if (TINT_STOPS[step] != null) {
            const t = TINT_STOPS[step]
            return `//   ${step}  tint, t = ${t}: ${r1(l)} + (100 - ${r1(l)}) x ${t} = ${r1(l + (100 - l) * t)}  ${scale[step]}`
          }
          const t = SHADE_STOPS[step]
          return `//   ${step}  shade, t = ${t}: ${r1(l)} x (1 - ${t}) = ${r1(l * (1 - t))}  ${scale[step]}`
        }),
      ]
    }
    const rampDoc = [
      '// --- How the color ramps are created ---',
      '// Each ramp starts from one base color, which becomes step 400. Convert it to HSL, then hold',
      '// Hue (H) and Saturation (S) constant and move only Lightness (L). Tints (300 -> 50) blend toward',
      '// white; shades (500 -> 900) blend toward black. Both sides use evenly spaced stops, each',
      '// reaching 90% of the way to white/black at the end.',
      '//   Tint:  L = L_base + (100 - L_base) x t   (t: 300 = 0.225, 200 = 0.45, 100 = 0.675, 50 = 0.9)',
      '//   Shade: L = L_base x (1 - t)              (t: 500 = 0.18, 600 = 0.36, 700 = 0.54, 800 = 0.72, 900 = 0.9)',
      '//   Grey is a fixed palette, not generated.',
      '//',
      ...rampTable('Primary', primaryColor, primaryScale),
      '//',
      ...rampTable('Secondary', secondaryColor, secondaryScale),
    ]
    const files = siteColorThemes.map(theme => {
      const name = THEME_FILE_NAMES[theme.key]
      const used = new Set()
      const tokens = tokenSpecs.filter(([, props]) => props).map(([token, props]) => {
        const modes = ['light', 'dark'].map(mode => {
          const lines = Object.entries(props).map(([prop, roleKey]) => {
            const value = nameFor(theme[mode].find(role => role.key === roleKey), theme)
            used.add(value)
            return `      ${prop}: ${value},`
          })
          return `    ${mode}: {\n${lines.join('\n')}\n    },`
        })
        return `  ${token}: {\n${modes.join('\n')}\n  },`
      })
      // primary/secondary scale steps aren't in the library — defined here.
      const scaleDefs = Object.keys(scaleNames).filter(n => used.has(n)).map(n => `const ${n} = ${JSON.stringify(scaleNames[n].toUpperCase())};`)
      const header = [
        '// Color names (white, grey800, cyan700, ...) are the library\'s Theme.js constants.',
        ...(scaleDefs.length ? ['// primaryN / secondaryN are this theme\'s brand color scale steps:', ...scaleDefs] : []),
        '',
      ]
      // Tokens this page doesn't define: listed, commented out, as unused.
      const unusedTokens = tokenSpecs.filter(([, props]) => !props).map(([token]) => `  // ${token}: {}, // not used`)
      const body = [...tokens, '  // --- Not used (no value set) ---', ...unusedTokens]
      // Scale steps the theme above doesn't reference, kept for reference.
      const unusedScaleDefs = Object.keys(scaleNames).filter(n => !used.has(n)).map(n => `// const ${n} = ${JSON.stringify(scaleNames[n].toUpperCase())}; // not used`)
      return {
        name: `${name}.js`,
        content: [
          header.join('\n'),
          `\nexport const ${name} = {\n${body.join('\n')}\n};\n`,
          '// --- Primary / Secondary designations not used by this theme ---',
          ...unusedScaleDefs,
          '',
          ...rampDoc,
        ].join('\n') + '\n',
      }
    })
    const url = URL.createObjectURL(zipFiles(files))
    const a = document.createElement('a')
    a.href = url
    a.download = 'event-site-themes.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="ordr1-list">
      <GSActionBar
        type="form-header H3"
        header="Color Exploration"
        pageActions={[{ buttonTitle: 'Download Themes (.zip)', rightIcon: faDownload, type: 'light-grey', isFocusable: true, actionClick: downloadThemes }]}
      />

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
          <>
          <RampFormulaSection primaryColor={primaryColor} secondaryColor={secondaryColor} primaryScale={primaryScale} secondaryScale={secondaryScale} />
          <div className="wds-ramps-compare">
            <RampRowLabels />
            <RampGroup
              label="Grey"
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
          </>
        )
      })()}

      {activeTab === 'theme' && (
        <RoleCompareTable
          tintThemes={[
            { key: 'golfstatus', label: 'Grayscale', light: groupGolfStatusRoles(golfStatusRoles.light), dark: groupGolfStatusRoles(golfStatusRoles.dark) },
            ...tintThemes,
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
                  control={(
                    <>
                      {[false, true].map(separate => {
                        const { value, placeholder } = elementAssignment(def, separate)
                        return (
                          <DesignationInput
                            key={separate ? 'separate' : 'shared'}
                            value={value}
                            placeholder={placeholder}
                            onCommit={text => setElementAssignment(def, text, separate)}
                            hint={separate ? 'Subtle only' : ELEMENT_DESIGNATION_HINT}
                            options={ROLE_DESIGNATIONS}
                          />
                        )
                      })}
                    </>
                  )}
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
          scales={{ primaryScale, secondaryScale, roleHexes: buttonRoleHexes }}
          buttonStyles={buttonStyles}
          onChangeButtonStyles={onChangeButtonStyles}
        />
      )}
    </div>
  )
}
