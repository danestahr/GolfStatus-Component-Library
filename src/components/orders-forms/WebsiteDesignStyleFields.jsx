import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faExternalLinkSquareAlt, faRightLeft, faRotateLeft, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'
import GSRadioGroup from '../../gs-lib/components/gs-radio-group'
import { generateScale, SCALE_STEPS } from '../../gs-lib/helpers/colorScale'
import { golfstatusColors } from '../../gs-lib/helpers/Theme'
import { DEFAULT_EVENT_SITE_STYLE } from '../../data/eventSiteStyle.js'
import EventSiteDeviceMockup from './EventSiteDeviceMockup.jsx'
import './WebsiteDesignStyleFields.scss'

// Neutral is the app's own fixed greyscale (colors.scss's $grey-50...
// $grey-900, via Theme.js's golfstatusColors) — shown for reference, not
// editable like Primary/Secondary, since a design system's neutral ramp
// isn't something a single event's brand color should be able to drift.
// Same 50-900 shape as SCALE_STEPS (no White/Black bookends), so its ramp
// reads as the same length/style as the Colors section's own.
const NEUTRAL_SWATCHES = [
  { key: 50, hex: golfstatusColors.grey50 },
  { key: 100, hex: golfstatusColors.grey100 },
  { key: 200, hex: golfstatusColors.grey200 },
  { key: 300, hex: golfstatusColors.grey300 },
  { key: 400, hex: golfstatusColors.grey400 },
  { key: 500, hex: golfstatusColors.grey500 },
  { key: 600, hex: golfstatusColors.grey600 },
  { key: 700, hex: golfstatusColors.grey700 },
  { key: 800, hex: golfstatusColors.grey800 },
  { key: 900, hex: golfstatusColors.grey900 },
]

// monochromatize() (gs-lib/helpers/monochromatic.js) is the single source
// of truth for "this color is Neutral step N, substitute the same step
// from a Primary scale instead" — shared with EventWebsitePage.jsx so the
// live site's Monochromatic behaves identically to this preview.

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

// Starter colors offered under a blank Primary/Secondary input — tapping one
// commits it exactly like typing that hex.
const DEFAULT_COLOR_CHOICES = ['#1D4FA8', '#3B8EA5', '#2A6B4F', '#F4A340', '#C0392B', '#4B3A9E']

// Primary + Secondary starter pairs, one per DEFAULT_COLOR_CHOICES entry
// (same order, so each gradient sits under its own solid swatch). Tapping
// one commits both colors at once. Each Secondary is the Primary's
// complement — a different hue family (roughly opposite on the wheel).
const DEFAULT_COLOR_PAIRS = [
  ['#1D4FA8', '#E8892B'],
  ['#3B8EA5', '#D9694A'],
  ['#2A6B4F', '#A83E6C'],
  ['#F4A340', '#3F7FC4'],
  ['#C0392B', '#2A9BA3'],
  ['#4B3A9E', '#D4B12F'],
]

// <input type="color"> only accepts a full 6-digit #rrggbb — expands a
// shorthand 3-digit hex (valid everywhere else in this file) so the native
// picker doesn't just silently fall back to black on one.
function toFullHex(hex) {
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  return hex
}

// A hex-code text field standing in for the old native color-input swatch —
// kept as its own draft/commit cycle so a half-typed hex like "#1" never
// gets pushed into generateScale mid-keystroke; only a valid 3- or 6-digit
// hex commits on blur/Enter, anything else reverts to the last real value
// (or back to blank, see `showEmpty` below). The trailing "Edit Color"
// button reopens that native picker (kept off-screen, not display:none, so
// browsers still let it be triggered) instead of typing a hex by hand.
//
// `showEmpty` is `color === DEFAULT_EVENT_SITE_STYLE.primaryColor/
// secondaryColor` (ColorsSection below) — this field reads blank (its own
// "#RRGGBB" placeholder standing in) until a color's actually been typed or
// picked, even though `color` itself is never really empty: every swatch/
// ramp/button preview on this screen keeps rendering off that GolfStatus
// default the whole time, same as a saved style already falls back to it
// (data/eventSiteStyle.js's DEFAULT_EVENT_SITE_STYLE) — only this text
// field's own display hides it, so the input doesn't read as "already
// customized" when nobody's touched it yet.
function DefaultColorSwatches({ onPick, onEdit, onPickPair }) {
  // With a pairs row, the swatches share one grid so the edit button can span
  // both rows (children auto-place around it: solids row 1, gradients row 2).
  return (
    <div className={`wds-default-swatches${onPickPair ? ' wds-default-swatches--paired' : ''}`}>
      {onEdit && (
        <button type="button" className="wds-default-swatch wds-default-swatch--edit" title="Edit Color" aria-label="Edit Color" onClick={onEdit}>
          <FontAwesomeIcon icon={faPalette} />
        </button>
      )}
      {DEFAULT_COLOR_CHOICES.map(hex => (
        <button key={hex} type="button" className="wds-default-swatch" style={{ backgroundColor: hex }} aria-label={`Use ${hex}`} onClick={() => onPick(hex)} />
      ))}
      {onPickPair && DEFAULT_COLOR_PAIRS.map(([primary, secondary]) => (
        <button
          key={primary}
          type="button"
          className="wds-default-swatch"
          style={{ backgroundImage: `linear-gradient(100deg, ${primary}, ${secondary})` }}
          aria-label={`Use ${primary} with ${secondary}`}
          onClick={() => onPickPair(primary, secondary)}
        />
      ))}
    </div>
  )
}

function HexColorField({ label, color, onChangeColor, showEmpty, onRemove, onPickPair }) {
  const [draft, setDraft] = useState(showEmpty ? '' : color)
  useEffect(() => setDraft(showEmpty ? '' : color), [color, showEmpty])
  const colorPickerRef = useRef(null)
  const commit = () => {
    const trimmed = draft.trim()
    if (HEX_RE.test(trimmed)) onChangeColor(trimmed)
    else setDraft(showEmpty ? '' : color)
  }
  const openColorPicker = () => {
    const picker = colorPickerRef.current
    if (picker?.showPicker) picker.showPicker()
    else picker?.click()
  }
  return (
    <div className="wds-hex-field">
      {label && <div className="wds-hex-label">{label}</div>}
      <GSinput
        textValue={draft}
        placeholder="#RRGGBB"
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onSubmit={commit}
        rightIcon={faTrash}
        rightIconClick={onRemove}
        rightButtonProps={{ 'aria-label': `Remove ${label ?? 'color'}` }}
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
      {showEmpty ? (
        <DefaultColorSwatches onPick={onChangeColor} onEdit={openColorPicker} onPickPair={onPickPair} />
      ) : (
        <>
          <button
            type="button"
            className="wds-ramp-base-bar"
            style={{ backgroundColor: color }}
            aria-label={`Edit ${label ?? 'color'}`}
            onClick={openColorPicker}
          >
            <FontAwesomeIcon icon={faPalette} />
          </button>
          <ColorRampSquares color={color} mode="light" />
        </>
      )}
    </div>
  )
}

// The full 50-900 ramp generated from a single hex (colorScale.js), as bare
// color squares — no White/Black bookends, no step/hex/family text, just
// the swatch itself. The 400 step (the value the hex input actually set)
// gets a 4px outline so it still reads as the base the rest of the ramp
// was derived from.
function ColorRampSquares({ color, mode }) {
  const scale = generateScale(color)
  const stops = SCALE_STEPS.map(step => ({ key: step, hex: scale[step], isBase: step === 400 }))
  const ordered = mode === 'dark' ? [...stops].reverse() : stops
  return (
    <div className={`wds-ramp-row wds-ramp-row--${mode}`}>
      {ordered.map(({ key, hex, isBase }) => (
        <div key={key} className={`wds-ramp-square${isBase ? ' wds-ramp-square--base' : ''}`} style={{ backgroundColor: hex }} />
      ))}
    </div>
  )
}

// The Colors section: an Add Color button until a color is added, then a
// Primary field (and, after tapping Add Color again, a Secondary field) —
// each with its own default swatches / color bar / ramps stacked under its
// input (HexColorField). `added` tracks which slots the admin has opened,
// independent of whether they've picked a color yet.
function ColorsSection({ secondaryAdded, onPickPair, primaryColor, onChangePrimaryColor, primaryIsSet, secondaryColor, onChangeSecondaryColor, secondaryIsSet, onRemovePrimary, onRemoveSecondary }) {
  return (
    <div className="wds-scale-row">
      <div className="wds-hex-inputs">
        <HexColorField
          label="Primary Color"
          color={primaryColor}
          onChangeColor={onChangePrimaryColor}
          showEmpty={!primaryIsSet}
          onRemove={onRemovePrimary}
          onPickPair={secondaryAdded ? undefined : onPickPair}
        />
        {secondaryAdded && (
          <HexColorField
            label="Secondary Color"
            color={secondaryColor}
            onChangeColor={onChangeSecondaryColor}
            showEmpty={!secondaryIsSet}
            onRemove={onRemoveSecondary}
          />
        )}
      </div>
    </div>
  )
}

const NEUTRAL_MODE_OPTIONS = [
  { label: 'Grayscale', value: 'golfstatus' },
  { label: 'Subtle (single color)', value: 'neutral' },
  { label: 'Subtle', value: 'neutral-two-tone' },
  { label: 'Bold (single color)', value: 'primary' },
  { label: 'Bold', value: 'full' },
]

// Which themes each color setup unlocks: nothing picked -> Grayscale only;
// a Primary alone -> Grayscale/Subtle/Bold; Primary + Secondary -> the
// Two-Tone variants in place of the single-color ones.
function availableThemeValues(hasPrimary, hasSecondary) {
  if (!hasPrimary) return ['golfstatus']
  // Subtle and Bold are hidden for now (NEUTRAL_MODE_OPTIONS still defines them).
  return ['golfstatus', 'neutral-two-tone', 'full']
}

// A saved tint that the current colors no longer offer shows as its nearest
// available sibling (Subtle <-> Subtle, Bold <-> Bold).
function coerceTint(tint, allowed) {
  if (allowed.includes(tint)) return tint
  if (allowed.length === 1) return allowed[0]
  const twoTone = allowed.includes('full')
  if (tint === 'neutral' || tint === 'neutral-two-tone') return twoTone ? 'neutral-two-tone' : 'neutral'
  return twoTone ? 'full' : 'primary'
}

// Toggled off while the tournament-details preview (below) is standing in
// for this section's own light/dark ramp squares — flip back to true to
// restore them once the preview no longer needs the room.
const SHOW_NEUTRAL_RAMPS = false

// The Neutral section's own ramp preview — Neutral Tint (default) shows the
// app's own fixed grey ramp (NEUTRAL_SWATCHES); Primary/Secondary Tint swap
// it for that color's own generated scale, same substitution
// monochromatize() does for the live site's theme roles, just applied
// directly to the reference ramp instead of to individual role hexes. Same
// bare-squares-in-a-tile layout as the Colors section above
// (.wds-colors-tile/.wds-ramp-dark-pill) — Primary/Secondary Tint reuse
// ColorRampSquares directly so the two sections' ramps can't drift apart;
// Neutral Tint's own fixed swatches get the same row markup by hand, since
// they come from NEUTRAL_SWATCHES rather than a generated scale.
// Controlled (neutralTint/onChangeNeutralTint) rather than local state — it
// lives in styleDraft (data/eventSiteStyle.js) alongside Primary/Secondary,
// so changing it enables Save same as they do, and Save persists it to
// /event-site (EventWebsitePage.jsx), which reads it to decide whether its
// own Monochromatic toggle starts on and which scale it tints with.
function NeutralSection({ primaryColor, secondaryColor, neutralTint, onChangeNeutralTint, buttonStyles, hasPrimary, hasSecondary }) {
  const allowed = availableThemeValues(hasPrimary, hasSecondary)
  const options = NEUTRAL_MODE_OPTIONS.filter(o => allowed.includes(o.value))
  neutralTint = coerceTint(neutralTint, allowed)
  const tintColor = neutralTint === 'primary' ? primaryColor : neutralTint === 'secondary' ? secondaryColor : null // (Full Theme has no single ramp)
  return (
    <div className="wds-scale-row">
      {/* Nothing to choose until a color unlocks a second theme. */}
      {options.length > 1 && (
        <GSRadioGroup
          isLtr
          options={options}
          selectedOption={options.find(o => o.value === neutralTint)}
          selectionChanged={option => onChangeNeutralTint(option.value)}
        />
      )}
      {SHOW_NEUTRAL_RAMPS && (
        <div className="wds-colors-tile">
          {tintColor ? (
            <>
              <ColorRampSquares color={tintColor} mode="light" />
              <div className="wds-ramp-dark-pill">
                <ColorRampSquares color={tintColor} mode="dark" />
              </div>
            </>
          ) : (
            <>
              <div className="wds-ramp-row wds-ramp-row--light">
                {NEUTRAL_SWATCHES.map(({ key, hex }) => (
                  <div key={key} className="wds-ramp-square" style={{ backgroundColor: hex }} />
                ))}
              </div>
              <div className="wds-ramp-dark-pill">
                <div className="wds-ramp-row wds-ramp-row--dark">
                  {[...NEUTRAL_SWATCHES].reverse().map(({ key, hex }) => (
                    <div key={key} className="wds-ramp-square" style={{ backgroundColor: hex }} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <EventSiteDeviceMockup primaryColor={primaryColor} secondaryColor={secondaryColor} neutralTint={neutralTint} buttonStyles={buttonStyles} />
    </div>
  )
}

// The Website Design and Style screen — opened directly off the Event Site &
// Packages hub's own "Website Design and Style" row, same fully-controlled
// fields-only convention as EventSiteHomepageFields: the page that owns the
// single AppSidePanel holds this draft state and the Save/Cancel actions.
// Colors takes Primary/Secondary as hex input (mirrors Material's own
// naming) with the full generated ramp collapsed behind a toggle; Neutral
// previews the fixed grey reference ramp or, via the Color/Monochromatic
// radio, the same ramp re-tinted with Primary.
export default function WebsiteDesignStyleFields({
  isPremium,
  primaryColor,
  onChangePrimaryColor,
  secondaryColor,
  onChangeSecondaryColor,
  neutralTint,
  onChangeNeutralTint,
  buttonStyles,
  onChangeThemeOverrides,
  saveCount,
}) {
  // A color equal to the GolfStatus default reads as "unset", but a starter
  // pair can equal that default exactly (#C0392B + #2A9BA3) — so a pick made
  // here also counts as set, tracked separately from the value itself.
  const [primaryPicked, setPrimaryPicked] = useState(false)
  const [secondaryPicked, setSecondaryPicked] = useState(false)
  const primaryIsSet = primaryPicked || primaryColor !== DEFAULT_EVENT_SITE_STYLE.primaryColor
  // Until a separate Secondary is picked it mirrors Primary (see
  // changePrimary), so a Secondary equal to Primary reads as unset too.
  const secondaryIsSet = secondaryPicked || (secondaryColor !== DEFAULT_EVENT_SITE_STYLE.secondaryColor && secondaryColor !== primaryColor)
  const [secondaryAdded, setSecondaryAdded] = useState(secondaryIsSet)
  // A color set from outside (e.g. loaded from a saved style) always shows.
  const showSecondary = secondaryAdded || secondaryIsSet
  // Add Color starts the Secondary off as the existing Primary.
  const addColor = () => {
    setSecondaryPicked(true)
    onChangeSecondaryColor(primaryColor)
    setSecondaryAdded(true)
  }
  // An empty Secondary input that was opened but never given a color goes
  // away once the style is saved.
  const firstSave = useRef(saveCount)
  useEffect(() => {
    if (saveCount === firstSave.current) return
    if (!secondaryIsSet) setSecondaryAdded(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveCount])
  const canSwap = showSecondary
  const canReset = primaryIsSet || showSecondary || neutralTint !== DEFAULT_EVENT_SITE_STYLE.neutralTint

  const changePrimary = hex => {
    setPrimaryPicked(true)
    onChangePrimaryColor(hex)
    // Secondary follows Primary until it's set separately.
    if (!secondaryPicked) onChangeSecondaryColor(hex)
  }
  const changeSecondary = hex => {
    setSecondaryPicked(true)
    onChangeSecondaryColor(hex)
  }

  const pickPair = (primary, secondary) => {
    changePrimary(primary)
    changeSecondary(secondary)
    setSecondaryAdded(true)
  }

  const removePrimary = () => {
    setPrimaryPicked(false)
    onChangePrimaryColor(DEFAULT_EVENT_SITE_STYLE.primaryColor)
    if (!secondaryPicked) onChangeSecondaryColor(DEFAULT_EVENT_SITE_STYLE.secondaryColor)
  }
  const removeSecondary = () => {
    setSecondaryPicked(false)
    onChangeSecondaryColor(primaryIsSet ? primaryColor : DEFAULT_EVENT_SITE_STYLE.secondaryColor)
    setSecondaryAdded(false)
    // Two-Tone themes need both colors — drop back to the single-color sibling.
    if (neutralTint === 'full') onChangeNeutralTint('primary')
    if (neutralTint === 'neutral-two-tone') onChangeNeutralTint('neutral')
  }

  const resetColors = () => {
    setPrimaryPicked(false)
    setSecondaryPicked(false)
    onChangePrimaryColor(DEFAULT_EVENT_SITE_STYLE.primaryColor)
    onChangeSecondaryColor(DEFAULT_EVENT_SITE_STYLE.secondaryColor)
    onChangeNeutralTint(DEFAULT_EVENT_SITE_STYLE.neutralTint)
    onChangeThemeOverrides?.({})
    setSecondaryAdded(false)
  }

  const swapColors = () => {
    // An unset slot stays unset (its own GolfStatus default) rather than
    // handing the other slot's default across.
    onChangePrimaryColor(secondaryIsSet ? secondaryColor : DEFAULT_EVENT_SITE_STYLE.primaryColor)
    onChangeSecondaryColor(primaryIsSet ? primaryColor : DEFAULT_EVENT_SITE_STYLE.secondaryColor)
  }

  return (
    <div className="ordr1-list">
      <GSActionBar
        type="form-header H3"
        header="Website Design and Style"
        pageActions={[
          ...(canReset
            ? [{ type: 'light-grey', actionIcon: faRotateLeft, isFocusable: true, 'aria-label': 'Reset colors', actionClick: resetColors }]
            : []),
          {
            buttonTitle: 'View Website',
            rightIcon: faExternalLinkSquareAlt,
            type: 'light-grey',
            isFocusable: true,
            actionClick: () => window.open('/event-site', '_blank', 'noopener,noreferrer'),
          },
        ]}
      />

      <GSFormSection
        title="Colors"
        sectionActions={[
          ...(canSwap
            ? [{ type: 'light-grey', actionIcon: faRightLeft, isFocusable: true, 'aria-label': 'Swap Primary and Secondary colors', actionClick: swapColors }]
            : []),
          ...(showSecondary
            ? []
            : [{ buttonTitle: 'Add Color', actionIcon: faPlus, type: 'light-grey', isFocusable: true, actionClick: addColor }]),
        ]}
        type="vertical xx-large-gap"
        fields={[
          {
            isEditable: true,
            customView: true,
            value: (
              <ColorsSection
                secondaryAdded={showSecondary}
                onPickPair={pickPair}
                primaryColor={primaryColor}
                onChangePrimaryColor={changePrimary}
                primaryIsSet={primaryIsSet}
                secondaryColor={secondaryColor}
                onChangeSecondaryColor={changeSecondary}
                secondaryIsSet={secondaryIsSet}
                onRemovePrimary={removePrimary}
                onRemoveSecondary={removeSecondary}
              />
            ),
          },
        ]}
      />

      <GSFormSection
        title="Site Style"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Site Theme',
            isEditable: true,
            customView: true,
            value: (
              <NeutralSection
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                neutralTint={neutralTint}
                onChangeNeutralTint={onChangeNeutralTint}
                buttonStyles={buttonStyles}
                hasPrimary={primaryIsSet}
                hasSecondary={secondaryIsSet}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
