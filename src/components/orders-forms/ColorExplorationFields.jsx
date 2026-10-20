import { useEffect, useRef, useState } from 'react'
import { faPalette, faDownload } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSinput from '../../gs-lib/components/gs-input'
import { generateScale, buttonThemeVars, SCALE_STEPS, hexToHsl, TINT_STOPS, SHADE_STOPS } from '../../gs-lib/helpers/colorScale'
import { golfstatusColors } from '../../gs-lib/helpers/Theme'
import { pickAccessibleTextColor, contrastRatio } from '../../gs-lib/helpers/contrast'
import { keepOrReadableText } from '../../data/eventSiteThemeVars.js'
import { resolveOverrideHex, OUTLINE_VARIANT_MONO_STEP, NEUTRAL_STEP_BY_HEX, normalizeHex } from '../../gs-lib/helpers/monochromatic'
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
import { ELEMENT_ROLES, ELEMENT_DEFS, ELEMENT_COMPONENTS, ELEMENT_OVERRIDE_THEMES, elementCssVar } from '../../data/eventSiteElements.js'
import {
  THEME_ROLES,
  THEME_ROLE_LABELS,
  THEME_ROLE_KEY_BY_LABEL,
  MISSING_ROLE_COLOR,
  canonicalRoleKey,
  rolePart,
  themePartValue,
  hexToRef,
} from '../../data/eventSiteThemeRoles.js'
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
  const withFamily = trimmed.match(/^(primary|secondary|neutral|grey|cyan|green|orange|red)\s*(\d{2,3})$/i)
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
  // Theme.js's own palette families (cyan700, green200, orange400, ...).
  if (['cyan', 'green', 'orange', 'red'].includes(ref.family)) return `${ref.family[0].toUpperCase()}${ref.family.slice(1)} ${ref.step}`
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

// An element points at a designation (Theme.js's `defaultTheme` keys — see
// data/eventSiteThemeRoles.js) by name, not a literal scale step like
// "Primary 100" — that stays the Theme tab's own vocabulary
// (RoleCompareTable/resolveDesignable below), since aliasing a designation
// keeps an element tracking whatever that designation itself currently
// resolves to (tint, its own themeOverrides riff, ...) instead of freezing
// one scale step forever.
function parseRoleReference(text) {
  return THEME_ROLE_KEY_BY_LABEL[text.trim().toLowerCase()] ?? null
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
  ...['Primary', 'Secondary', 'Grey', 'Cyan', 'Green', 'Orange'].flatMap(family => SCALE_STEPS.map(step => `${family} ${step}`)),
]
// Theme designations only — an element points at one, never a raw scale step.
const ROLE_DESIGNATIONS = THEME_ROLE_LABELS

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
function RampChip({ caption, label, hex, textHex, isBase, designation, onChangeDesignation, designationHint, designationPlaceholder, designationOptions }) {
  // Auto height whenever there's a label and/or a designation slot (more
  // than just a color + hex) — not just when there's a label, since the
  // Theme tab's own role-compare table below passes chips with a
  // designation but no repeated label (the row's own left-hand label
  // column already names the role).
  const expanded = Boolean(label) || Boolean(onChangeDesignation)
  return (
    <div className={`wds-ramp-chip${expanded ? ' wds-ramp-chip--labeled' : ''}`}>
      <div
        className={`wds-ramp-chip-color${isBase ? ' wds-ramp-chip-color--base' : ''}${textHex ? ' wds-ramp-chip-color--pair' : ''}`}
        style={{ backgroundColor: hex, ...(textHex && { color: textHex }) }}
      >
        {textHex ? 'Aa' : null}
      </div>
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
          textHex={light.textHex}
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
          textHex={dark.textHex}
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
// Every theme gets the same element assignments, so any one slot shows the
// current pick — GolfStatus's is the one read back.
const CANONICAL_THEME = 'golfstatus'
const ELEMENT_DESIGNATION_HINT = 'Which designation this reads from — sets its background and text together'

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

// Consecutive rows of one designation folded together, in order.
function groupByRole(defs) {
  return defs.reduce((list, def) => {
    const last = list[list.length - 1]
    if (last && last.roleKey === def.roleKey) last.defs.push(def)
    else list.push({ roleKey: def.roleKey, roleLabel: def.roleLabel ?? def.label, defs: [def] })
    return list
  }, [])
}

function RoleCompareTable({ tintThemes }) {
  return (
    <div className="wds-role-table" style={{ '--wds-theme-cols': tintThemes.length }}>
      <CompareHeader themes={tintThemes} />
      {THEME_TABLE_GROUPS.map(group => (
        <div key={group.key} className="wds-role-group">
          <div className="wds-role-group-title">{group.label}</div>
          {/* Row labels come from a full-role theme — the fixed Neutral Theme column can lead but has fewer roles. */}
          {/* One card per designation, its colors listed beneath by the CSS property they set. */}
          {groupByRole((tintThemes.find(t => t.key !== 'golfstatus') ?? tintThemes[0]).light[group.key]).map(role => (
            <div className="wds-role-card" key={role.roleKey}>
              <div className="wds-role-card-title">
                {role.roleLabel}
                {role.defs.length > 1 && <span className="wds-role-card-note">{role.defs.length} colors applied together</span>}
              </div>
              {role.defs.map(roleDef => (
                <CompareRow
                  key={roleDef.key}
                  label={roleDef.propLabel ?? roleDef.label}
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
      ))}
    </div>
  )
}

// Every designation in Theme.js's `defaultTheme` (data/eventSiteThemeRoles.js),
// split into one row per color it carries — a fill and its text are two rows
// of the same designation ("Surface — Background" / "Surface — Text"), a
// color-only designation (Primary, Error, ...) or a border-only one
// (Outline) is a single row. Grouped Primary/Secondary/Neutral instead of
// dumped in Theme.js's declaration order. `key` is the part's storage key
// (`${mode}-${tint}-${key}` in themeOverrides — what EventWebsitePage.jsx's
// ROLE_TO_CSS_VAR applies to the live site), so every editable row here
// persists. `fallbackHex` is exactly what EventWebsitePage.jsx's own
// customThemeStyle computes for it in its default state, so this preview
// can't drift from what saving here actually renders on the site.
// `naturalRef` is that same value expressed as a { family, step } — what the
// row's designation defaults to before any override — `null` for a color
// with no single palette name (the brand Primary/Secondary). `editable:
// false` marks the one row per brand color this screen won't let you
// reassign — the base Primary/Secondary swatch itself, since "what step is
// Primary?" is circular (see RampChip).
const roleGroup = key => {
  if (key === 'primary' || key === 'primaryContainer' || key === 'primaryContainerHigh') return 'primary'
  if (key === 'secondary' || key === 'secondaryContainer' || key === 'secondaryContainerHigh') return 'secondary'
  return 'neutral'
}

const partLabel = (role, part) => {
  if (part.part === 'background') return `${role.label} — Background`
  if (part.part === 'text') return `${role.label} — Text`
  return role.label
}

// The row names the Theme tab shows under each designation's heading —
// the CSS property each one sets, same words Theme.js uses.
const PROP_LABELS = { background: 'Background color', text: 'Color', color: 'Color', border: 'Border color' }
const partIdentity = (role, part) => ({ roleKey: role.key, roleLabel: role.label, propLabel: PROP_LABELS[part.part] })

// Neutral fills whose text the live site tints with the Primary scale (see
// EventWebsitePage.jsx's TEXT_TOKEN_PARTS) rather than Theme.js's fixed grey.
const NEUTRAL_FILL_ROLES = new Set([
  'background', 'surface', 'surfaceDim', 'surfaceBright', 'surfaceVariant',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainerHigh', 'surfaceContainerHigest', 'menuContainer',
])

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
    const onPrimary = { hex: pickAccessibleTextColor(primaryBase, primaryScale[100], primaryScale[800]), ref: { family: 'primary', step: onPrimaryStep } }
    const onSecondary = { hex: pickAccessibleTextColor(secondaryBase, secondaryScale[100], secondaryScale[800]), ref: { family: 'secondary', step: onSecondaryStep } }
    // The designations the brand colors drive; every other row is Theme.js's
    // own value (Neutral fills/borders get re-tinted per theme by
    // retintNeutralDefs below).
    const brand = {
      'primary:color': { hex: primaryBase, ref: null, editable: false },
      'secondary:color': { hex: secondaryBase, ref: null, editable: false },
      'primaryContainer:background': { hex: primaryBase, ref: { family: 'primary', step: 400 } },
      'primaryContainer:text': onPrimary,
      'primaryContainerHigh:background': isDark
        ? { hex: primaryScale[200], ref: { family: 'primary', step: 200 } }
        : { hex: primaryBase, ref: { family: 'primary', step: 400 } },
      'primaryContainerHigh:text': isDark
        ? { hex: primaryScale[900], ref: { family: 'primary', step: 900 } }
        : onPrimary,
      'secondaryContainer:background': { hex: secondaryBase, ref: { family: 'secondary', step: 400 } },
      'secondaryContainer:text': onSecondary,
      'secondaryContainerHigh:background': isDark
        ? { hex: secondaryScale[200], ref: { family: 'secondary', step: 200 } }
        : { hex: secondaryBase, ref: { family: 'secondary', step: 400 } },
      'secondaryContainerHigh:text': isDark
        ? { hex: secondaryScale[900], ref: { family: 'secondary', step: 900 } }
        : onSecondary,
    }
    const groups = { primary: [], secondary: [], neutral: [] }
    THEME_ROLES.forEach(role => role.parts.forEach(part => {
      const theme = themePartValue(role.key, part.part, mode)
      let value = brand[`${role.key}:${part.part}`]
      if (!value && part.part === 'text' && NEUTRAL_FILL_ROLES.has(role.key)) {
        const step = NEUTRAL_STEP_BY_HEX[normalizeHex(theme.hex)]
        if (step) value = { hex: primaryScale[step], ref: { family: 'primary', step } }
      }
      value = value ?? { hex: theme.hex, ref: theme.ref }
      const group = roleGroup(role.key)
      const editable = value.editable !== false
      groups[group].push({
        key: part.storageKey,
        label: partLabel(role, part),
        ...partIdentity(role, part),
        fallbackHex: value.hex,
        naturalRef: value.ref,
        editable,
        ...(editable && { sitePersisted: true }),
        ...(editable && group !== 'neutral' && { compact: true, impliedFamily: group }),
      })
    }))
    return groups
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
  'background', 'surface', 'surfaceDim', 'surfaceVariant', 'surfaceContainerLowest', 'surfaceContainerLow',
  'surfaceContainerHigh', 'surfaceContainerHigest', 'surfaceBright', 'menuContainer',
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
const ALWAYS_MONO_KEYS = new Set(
  THEME_ROLES.filter(role => NEUTRAL_FILL_ROLES.has(role.key)).map(role => role.parts.find(p => p.part === 'text').storageKey)
)

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

// GolfStatus's own fixed designations — Theme.js's `defaultTheme` itself,
// read straight from it (via data/eventSiteThemeRoles.js) rather than
// transcribed. EventWebsitePage.jsx reuses theme.scss's `.gs-theme-default`
// (generated from the same values) as-is for its "golfstatus" theme, with
// none of customThemeStyle's brand overrides — so this never moves with the
// Primary/Secondary pickers above, unlike the tint themes. Same base-swatch
// exception as liveThemeRoleDefs above (Primary/Secondary aren't
// reassignable). An edit to any other row is saved under the 'golfstatus'
// tint slot and applied on top (EventWebsitePage.jsx's roleStyle).
function golfStatusRoleDefs() {
  const forMode = mode => THEME_ROLES.flatMap(role => role.parts.map(part => {
    const theme = themePartValue(role.key, part.part, mode)
    const editable = role.key !== 'primary' && role.key !== 'secondary'
    return {
      key: part.storageKey,
      label: partLabel(role, part),
      ...partIdentity(role, part),
      fallbackHex: theme.hex,
      naturalRef: editable ? theme.ref : null,
      editable,
      ...(editable && { sitePersisted: true }),
    }
  }))
  return { light: forMode('light'), dark: forMode('dark') }
}

// Site Colors' per-element list lives in data/eventSiteElements.js
// (ELEMENT_DEFS / ELEMENT_COMPONENTS) — every named, non-button element the
// live Event Website renders, each pointed at one designation
// (`baseRoleKey`) by default, with parts that form one component (a
// background and the text on it) assigned together. Grouped here by the
// `section` each lives in, in first-seen order — this tab's own display
// order (Header, Tournament Details, ...), not alphabetical.
const ELEMENT_GROUPS = ELEMENT_COMPONENTS.reduce((groups, component) => {
  const group = groups.find(g => g.section === component.section)
  if (group) group.components.push(component)
  else groups.push({ section: component.section, components: [component] })
  return groups
}, [])

// Each element's real `--es-el-*` custom property (data/eventSiteElements.js's
// elementCssVar — the same derivation EventWebsitePage.jsx uses, so the two
// can't drift).
const SITE_ELEMENT_CSS_VAR = Object.fromEntries(ELEMENT_DEFS.map(def => [def.key, elementCssVar(def.key)]))

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
// Designations for rows the live site can't persist (see `sitePersisted`).
// Every editable Theme row persists now, so this is only a fallback store.
const DEFAULT_LOCAL_DESIGNATIONS = {}

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
  // Fill is the Container designation's own pair, so it follows the Theme tab.
  if (appearance === 'fill') {
    return scales.roleHexes?.[mode]?.[`${color}Container:${part === 'bg' ? 'background' : 'text'}`]
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
  // Fill reads a Container designation (see defaultButtonHex) — no scale step.
  if (appearance === 'fill') return null
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
function ButtonColorField({ label, hex, override, defaultRef, onCommit, designationOnly, greyOnly }) {
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
            value={override?.role ? ELEMENT_ROLES.find(r => r.key === canonicalRoleKey(override.role))?.label ?? 'Missing designation' : refToText(override ?? defaultRef)}
            onChange={e => {
              if (e.target.value === 'Missing designation') return
              const roleKey = e.target.value ? parseRoleReference(e.target.value) : null
              const next = roleKey ? { role: roleKey } : e.target.value ? parseDesignation(e.target.value) : null
              // Picking the built-in designation just clears the override.
              onCommit(!next || (defaultRef && next.family === defaultRef.family && next.step === defaultRef.step) ? null : next)
            }}
            aria-label={`${label} theme designation`}
          >
            {/* GolfStatus's brand defaults (grey/cyan) aren't a scale step. */}
            {!defaultRef && <option value="">Default</option>}
            {/* A saved designation that's no longer in Theme.js — pink on the site. */}
            {override?.role && !canonicalRoleKey(override.role) && <option value="Missing designation">Missing designation (pink)</option>}
            <optgroup label="Base">
              <option value="White">White</option>
              <option value="Black">Black</option>
            </optgroup>
            <optgroup label="Theme">
              {ELEMENT_ROLES.map(role => (
                <option key={role.key} value={role.label}>{role.label}</option>
              ))}
            </optgroup>
            {(greyOnly ? ['Grey'] : ['Grey', 'Primary', 'Secondary']).map(family => (
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
    const hex = resolveButtonOverride(override, scales, mode, part) ?? defaultButtonHex(mode, color, appearance, part, scales)
    effective[buttonVarName(color, appearance, part)] = hex
    return (
      <ButtonColorField
        key={part}
        label={label}
        hex={hex}
        override={override}
        defaultRef={defaultButtonRef(mode, color, appearance, part, scales)}
        designationOnly
        greyOnly={color === 'neutral'}
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
  // One style per button for EVERY theme — a pick is written to all of them
  // (Grayscale, Subtle and Bold never diverge), same rule as the element
  // designations. The first theme's slot is the one read back.
  const readTheme = ELEMENT_OVERRIDE_THEMES[0]
  const setStyle = (id, patch) =>
    onChange(prev => {
      const [defColor, defAppearance] = BUTTON_DEFAULTS[id]
      const next = { ...(prev ?? {}) }
      const current = { color: `${defColor}-color`, appearance: defAppearance, ...(prev?.[buttonStyleKey(readTheme, id)] ?? {}) }
      ELEMENT_OVERRIDE_THEMES.forEach(theme => { next[buttonStyleKey(theme, id)] = { ...current, ...patch } })
      return next
    })
  const reset = id =>
    onChange(prev => {
      const next = { ...(prev ?? {}) }
      ELEMENT_OVERRIDE_THEMES.forEach(theme => delete next[buttonStyleKey(theme, id)])
      return next
    })
  return (
    <section className="wds-btn-theme wds-btn-styles">
      <GSActionBar type="form-header H3" header="Button Styles" />
      <div className="wds-btn-style-name">Applies to Grayscale, Subtle and Bold alike. (Grayscale always draws Grey buttons.)</div>
      {Object.entries(BUTTON_IDS).map(([id, label]) => {
        const saved = buttonStyles?.[buttonStyleKey(readTheme, id)]
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

// One designation for a whole button variant: picking "Primary Container" on
// Primary Fill points its background at that designation's background color
// and its text at its text color (an outline's border at its border color) —
// in light and dark both, so the pair always switches together. Blank clears
// every part back to the button's own default. Shows the shared designation
// when every part points at the same one, else "Mixed".
function ButtonDesignationSelect({ color, appearance, parts, overrides, onChange }) {
  const modes = ['light', 'dark']
  const keys = modes.flatMap(mode => parts.map(([part]) => buttonOverrideKey(mode, color, appearance, part)))
  const roles = keys.map(key => overrides?.[key]?.from ?? overrides?.[key]?.role ?? null)
  const first = roles[0]
  const shared = first && roles.every(role => role === first) ? canonicalRoleKey(first) ?? 'missing' : null
  const mixed = !shared && roles.some(Boolean)
  const value = shared === 'missing' ? 'Missing designation' : shared ? ELEMENT_ROLES.find(r => r.key === shared)?.label ?? '' : mixed ? 'Mixed' : ''
  return (
    <select
      className="wds-ramp-chip-designation"
      value={value}
      aria-label={`${color} ${appearance} designation — sets every color of this button`}
      onChange={e => {
        const text = e.target.value
        if (text === 'Mixed' || text === 'Missing designation') return
        const roleKey = text ? parseRoleReference(text) : null
        const hasFill = roleKey && THEME_ROLES.find(r => r.key === roleKey).parts.some(p => p.part === 'background')
        // Readability: a button's text has to contrast with what's behind it.
        //  - Fill/Subtle text sits on the designation's own fill, so it takes
        //    the designation's paired text color. A color-only designation
        //    (Primary, Error, ...) has no pair, so its text falls back to the
        //    page Background color instead of matching its own fill.
        //  - Outline/Transparent text sits on the PAGE, so a designation with
        //    a fill (whose text color is made for that fill — white on a dark
        //    container) uses its fill color as the text instead.
        const onFill = appearance === 'fill' || appearance === 'subtle'
        const partOverride = part => {
          if (part !== 'text') return { role: roleKey }
          if (onFill && !hasFill) return { role: 'background', kind: 'background', from: roleKey }
          if (!onFill && hasFill) return { role: roleKey, kind: 'background' }
          return { role: roleKey }
        }
        onChange(prev => {
          const store = { ...(prev ?? {}) }
          modes.forEach(mode => parts.forEach(([part]) => {
            const key = buttonOverrideKey(mode, color, appearance, part)
            if (roleKey) store[key] = partOverride(part)
            else delete store[key]
          }))
          return store
        })
      }}
    >
      <option value="">Default</option>
      {mixed && <option value="Mixed">Mixed</option>}
      {shared === 'missing' && <option value="Missing designation">Missing designation (pink)</option>}
      {ELEMENT_ROLES.map(role => (
        <option key={role.key} value={role.label}>{role.label}</option>
      ))}
    </select>
  )
}

function ButtonsTab({ themes, overrides, onChange, scales: baseScales, roleHexesByTheme, defaultPreviewTheme, buttonStyles, onChangeButtonStyles }) {
  // Buttons are shared by every theme. Grey buttons always resolve
  // designations against the default (Grayscale) theme; Primary/Secondary
  // against the most-edited theme.
  const scalesFor = color => ({
    ...baseScales,
    roleHexes: (color === 'neutral' && roleHexesByTheme.golfstatus) || roleHexesByTheme[defaultPreviewTheme],
  })
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
                <div className="wds-btn-row-label">
                  {colorLabel} {appearanceLabel}
                  <ButtonDesignationSelect color={color} appearance={appearance} parts={parts} overrides={overrides} onChange={onChange} />
                </div>
                {['light', 'dark'].map(mode => (
                  <ButtonVariantCell
                    key={mode}
                    mode={mode}
                    color={color}
                    appearance={appearance}
                    parts={parts}
                    overrides={overrides}
                    onChange={onChange}
                    scales={scalesFor(color)}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
      <ButtonStylesSection buttonStyles={buttonStyles} onChange={onChangeButtonStyles} />
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
    const identity = { roleKey: def.roleKey, roleLabel: def.roleLabel, propLabel: def.propLabel }
    if (!def.editable) return { key: def.key, label: def.label, ...identity, hex: def.fallbackHex }
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
      ...identity,
      hex,
      overridden: Boolean(storedRef),
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

  // A fill's paired text is made for the ORIGINAL fill — when only the fill
  // is overridden, the text is re-picked for contrast against the new one
  // (same rule as data/eventSiteThemeVars.js), unless it's overridden too.
  const pairReadableText = (items, defs) => {
    const overriddenKeys = new Set(items.filter(item => item.overridden).map(item => item.key))
    return items.map(item => {
      const def = defs.find(d => d.key === item.key)
      if (!def || def.propLabel !== 'Color' || !def.sitePersisted || overriddenKeys.has(item.key)) return item
      const fill = items.find(other => other.roleKey === item.roleKey && other.propLabel === 'Background color')
      if (!fill?.overridden) return item
      // Keep the text it has while it still reads on the new fill.
      const hex = keepOrReadableText(item.hex, fill.hex)
      if (hex === item.hex) return item
      // Label it as what it now is (White / Grey 800), not the designation it replaced.
      return { ...item, hex, designation: refToText(hexToRef(hex)) }
    })
  }
  const resolveGroup = (defs, mode, scope, tintKey) =>
    pairReadableText(defs.map(def => resolveDesignable(def, mode, scope, tintKey)), defs)

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

  // Each designation's hex per theme, mode and kind ("surface:background",
  // "surface:text", "outline:border") — what a button part pointing at a
  // designation shows (data/eventSiteButtons.js's resolveButtonOverride).
  // Built from the same RESOLVED Theme rows as everything else, so an edit
  // made on the Theme tab (e.g. Primary Container High's background) shows up
  // on the buttons that use it.
  const roleHexesByTheme = Object.fromEntries(siteColorThemes.map(theme => [
    theme.key,
    Object.fromEntries(['light', 'dark'].map(mode => {
      const hexByKey = Object.fromEntries(theme[mode].map(item => [item.key, item.hex]))
      return [mode, Object.fromEntries(THEME_ROLES.flatMap(role =>
        ['background', 'text', 'border'].map(kind => [`${role.key}:${kind}`, hexByKey[rolePart(role.key, kind).storageKey]])
      ))]
    })),
  ]))
  // Which theme the Buttons tab previews by default: the one whose Theme
  // rows you've actually edited most.
  const editedCounts = {}
  Object.keys(themeOverrides ?? {}).forEach(key => {
    const tint = key.split('-').slice(1, -1).join('-')
    editedCounts[tint] = (editedCounts[tint] ?? 0) + 1
  })
  const defaultButtonPreviewTheme = siteColorThemes.map(t => t.key).sort((x, y) => (editedCounts[y] ?? 0) - (editedCounts[x] ?? 0))[0]

  // Resolves one Site Colors component (data/eventSiteElements.js's
  // ELEMENT_COMPONENTS — a lone element, or a background plus the text on it)
  // for one mode into a chip-ready { key, hex, caption, designation } —
  // keyed by "mode-tint-elementKey" (`tintKey` is the theme column being
  // displayed, `roleList` that theme's own already-resolved Theme rows).
  // An element is pointed at a DESIGNATION by name (e.g. "Surface"), stored
  // as { role: 'surface' }; each of the component's parts then reads the
  // color of that designation matching its own kind (a fill reads the
  // background, text reads the text color, a border the border) from
  // `roleList`, so it keeps tracking whatever that designation itself
  // currently is (tint, its own override, ...) instead of a frozen scale
  // step. A designation that isn't in Theme.js (a role saved before the On X/
  // *Variant ones were dropped) resolves to pink, same as on the live site.
  // The chip shows the first part's color; the caption lists every part's
  // scale designation ("White / Grey 800" for a fill and its text).
  const resolveElementDesignable = (component, mode, roleList, tintKey) => {
    const first = component.defs[0]
    // Assignments are shared by every theme (see setElementAssignment), so
    // GolfStatus's slot is the one source of truth all tiles read from —
    // except Subtle, which keeps its own so it can diverge.
    const storedRef = elementOverrides?.[`${mode}-${tintKey}-${first.key}`] ?? null
    const missing = Boolean(storedRef?.role) && !canonicalRoleKey(storedRef.role)
    const roleKey = storedRef?.role ? canonicalRoleKey(storedRef.role) : component.baseRoleKey
    const items = component.defs.map(def => {
      if (missing) return { hex: MISSING_ROLE_COLOR, caption: 'Missing' }
      if (!storedRef?.role && storedRef) {
        // A legacy { family, step }/White/Black ref (saved before this screen
        // switched to designation references).
        const hex = resolveOverrideHex(storedRef, { primaryScale, secondaryScale })
        return { hex, caption: refToText(storedRef) }
      }
      const item = roleList.find(r => r.key === rolePart(roleKey, def.kind)?.storageKey)
      return { hex: item?.hex ?? MISSING_ROLE_COLOR, caption: item?.designation || item?.label }
    })
    const captions = [...new Set(items.map(item => item.caption).filter(Boolean))]
    // Components with text on a fill show that text color on the swatch too.
    const textIndex = component.defs.findIndex(def => def.kind === 'text')
    const hasFill = component.defs.some(def => def.kind === 'background')
    return {
      key: component.key,
      hex: items[0].hex,
      textHex: hasFill && textIndex >= 0 ? items[textIndex].hex : undefined,
      caption: captions.join(' / '),
      designation: missing ? 'Missing designation' : storedRef?.role ? THEME_ROLES.find(r => r.key === roleKey).label : refToText(storedRef),
    }
  }

  // One dropdown per component (Site Colors' Page Element row) writes the
  // same designation reference into every part of it, in every theme + mode
  // slot the live site reads (EventWebsitePage.jsx's `${mode}-${tint}-${key}`),
  // so structure stays identical across themes while each theme still
  // resolves that designation to its own colors — and a background and its
  // text always switch together. Picking the component's own default
  // designation clears it.
  const setElementAssignment = (component, text) => {
    const trimmed = text.trim()
    const roleKey = trimmed ? parseRoleReference(trimmed) : null
    if (trimmed && !roleKey) return
    const value = roleKey && roleKey !== component.baseRoleKey ? { role: roleKey } : null
    onChangeElementOverrides(prev => {
      const next = { ...(prev ?? {}) }
      // Every theme gets the same designation — Grayscale, Subtle and Bold
      // never diverge, so one pick here is one pick everywhere.
      ;['light', 'dark'].forEach(mode => ELEMENT_OVERRIDE_THEMES.forEach(themeKey => {
        component.defs.forEach(def => {
          const key = `${mode}-${themeKey}-${def.key}`
          if (value) next[key] = value
          else delete next[key]
        })
      }))
      return next
    })
  }

  const elementAssignment = component => {
    const stored = elementOverrides?.[`light-${CANONICAL_THEME}-${component.defs[0].key}`]
    const baseLabel = THEME_ROLES.find(r => r.key === component.baseRoleKey)?.label
    let current
    if (stored?.role) current = THEME_ROLES.find(r => r.key === canonicalRoleKey(stored.role))?.label ?? 'Missing designation'
    else current = refToText(stored)
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
    // One token per `defaultTheme` designation, in Theme.js's own order —
    // each part valued by its row's color designation (white, grey800,
    // cyan700, primary600, ...).
    const tokenSpecs = THEME_ROLES.map(role => [
      role.key,
      Object.fromEntries(role.parts.map(part => [part.prop, part.storageKey])),
    ])
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
              {group.components.map(component => (
                <CompareRow
                  key={component.key}
                  label={component.label}
                  cssVar={component.defs.map(def => SITE_ELEMENT_CSS_VAR[def.key]).join(' · ')}
                  control={(() => {
                    const { value, placeholder } = elementAssignment(component)
                    return (
                      <DesignationInput
                        value={value}
                        placeholder={placeholder}
                        onCommit={text => setElementAssignment(component, text)}
                        hint={ELEMENT_DESIGNATION_HINT}
                        options={ROLE_DESIGNATIONS}
                      />
                    )
                  })()}
                  columns={siteColorThemes.map(tintTheme => ({
                    key: tintTheme.key,
                    light: resolveElementDesignable(component, 'light', tintTheme.light, tintTheme.key),
                    dark: resolveElementDesignable(component, 'dark', tintTheme.dark, tintTheme.key),
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
          roleHexesByTheme={roleHexesByTheme}
          defaultPreviewTheme={defaultButtonPreviewTheme}
          buttonStyles={buttonStyles}
          onChangeButtonStyles={onChangeButtonStyles}
        />
      )}
    </div>
  )
}
