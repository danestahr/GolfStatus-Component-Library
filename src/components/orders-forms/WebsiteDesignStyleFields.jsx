import { useEffect, useRef, useState } from 'react'
import { faPalette, faExternalLinkSquareAlt, faRightLeft } from '@fortawesome/free-solid-svg-icons'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSButton from '../../gs-lib/components/gs-button'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSinput from '../../gs-lib/components/gs-input'
import GSRadioGroup from '../../gs-lib/components/gs-radio-group'
import { generateScale, SCALE_STEPS } from '../../gs-lib/helpers/colorScale'
import { golfstatusColors } from '../../gs-lib/helpers/Theme'
import { DEFAULT_EVENT_SITE_STYLE } from '../../data/eventSiteStyle.js'
import EventSiteTournamentPreview from './EventSiteTournamentPreview.jsx'
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
// (or back to blank, see `showEmpty` below). The palette icon reopens that
// native picker (kept off-screen, not display:none, so browsers still let
// it be triggered) instead of typing a hex by hand.
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
function HexColorField({ label, color, onChangeColor, showEmpty }) {
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

// One color's own block: a centered uppercase name, a solid bar of the
// color exactly as picked, then — once the Color Range toggle is on — its
// light ramp bare (no box) and its dark ramp inset in a rounded black pill.
// The ramp stays mounted either way (see .wds-ramp-reveal) and animates
// open/closed with a 0.3s transition instead of popping in/out. No hex
// input here anymore — both inputs sit together above, in their own row
// (see .wds-hex-inputs).
function ColorBlock({ label, color, showRamp }) {
  return (
    <div className="wds-color-block">
      <div className="wds-color-block-label">{label}</div>
      <div className="wds-ramp-base-bar" style={{ backgroundColor: color }} />
      <div className={`wds-ramp-reveal${showRamp ? ' wds-ramp-reveal--open' : ''}`}>
        <div className="wds-ramp-reveal-inner">
          <ColorRampSquares color={color} mode="light" />
          <div className="wds-ramp-dark-pill">
            <ColorRampSquares color={color} mode="dark" />
          </div>
        </div>
      </div>
    </div>
  )
}

// The Colors section: Primary's and Secondary's hex inputs side by side,
// then — set apart by a 16px gap in its own grey-bordered tile — each
// color's block (name, bar, and its ramp) side by side in a row, with the
// Swap button sitting between them. The tile itself is the Color Range
// toggle (tap anywhere on it) rather than a separate "View Color Range"
// button, so the swap button stops its own click from bubbling up into
// that toggle.
function ColorsSection({ primaryColor, onChangePrimaryColor, secondaryColor, onChangeSecondaryColor, onSwapColors }) {
  const [showFullRange, setShowFullRange] = useState(false)
  const toggleFullRange = () => setShowFullRange(v => !v)
  const onTileKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFullRange()
    }
  }
  return (
    <div className="wds-scale-row">
      <div className="wds-hex-inputs">
        <HexColorField
          label="Primary Color"
          color={primaryColor}
          onChangeColor={onChangePrimaryColor}
          showEmpty={primaryColor === DEFAULT_EVENT_SITE_STYLE.primaryColor}
        />
        <HexColorField
          label="Secondary Color"
          color={secondaryColor}
          onChangeColor={onChangeSecondaryColor}
          showEmpty={secondaryColor === DEFAULT_EVENT_SITE_STYLE.secondaryColor}
        />
      </div>

      <div
        className="wds-colors-tile wds-colors-tile--clickable"
        role="button"
        tabIndex={0}
        aria-pressed={showFullRange}
        aria-label={showFullRange ? 'Hide color range' : 'View color range'}
        onClick={toggleFullRange}
        onKeyDown={onTileKeyDown}
      >
        <div className="wds-colors-tile-blocks">
          <ColorBlock label="Primary" color={primaryColor} showRamp={showFullRange} />
          <div className="wds-colors-swap">
            <GSButton
              type="light-grey"
              buttonIcon={faRightLeft}
              isFocusable
              aria-label="Swap Primary and Secondary colors"
              onClick={e => {
                e.stopPropagation()
                onSwapColors()
              }}
            />
          </div>
          <ColorBlock label="Secondary" color={secondaryColor} showRamp={showFullRange} />
        </div>
      </div>
    </div>
  )
}

const NEUTRAL_MODE_OPTIONS = [
  { label: 'GolfStatus', value: 'neutral' },
  { label: 'Primary Tint', value: 'primary' },
  { label: 'Secondary Tint', value: 'secondary' },
]

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
function NeutralSection({ isPremium, primaryColor, secondaryColor, neutralTint, onChangeNeutralTint }) {
  const tintColor = neutralTint === 'primary' ? primaryColor : neutralTint === 'secondary' ? secondaryColor : null
  return (
    <div className="wds-scale-row">
      <GSRadioGroup
        isLtr
        options={NEUTRAL_MODE_OPTIONS}
        selectedOption={NEUTRAL_MODE_OPTIONS.find(o => o.value === neutralTint)}
        selectionChanged={option => onChangeNeutralTint(option.value)}
      />
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

      <EventSiteTournamentPreview isPremium={isPremium} />
    </div>
  )
}

// The 6 Fill/Outline/Subtle x Primary/Secondary GSButton variants (see
// gs-button.jsx's color/appearance props) — same variants EventWebsitePage
// uses, previewed here so a Primary/Secondary edit above shows what its
// buttons will actually look like before saving.
// Not color-qualified in their own title ("Fill", not "Primary Fill") —
// each row already sits under its own "Primary"/"Secondary" block label
// (see ButtonColorBlock), so repeating the color name on every button
// would just be noise.
const BUTTON_APPEARANCES = [
  { appearance: 'fill', label: 'Fill' },
  { appearance: 'outline', label: 'Outline' },
  { appearance: 'subtle', label: 'Subtle' },
]

// The `--gs-color-*` tokens GSButton's Fill/Outline/Subtle variants read
// (gs-lib/styles/theme.scss's role names) — computed here from this
// screen's own Primary/Secondary scales exactly the way EventWebsitePage.jsx
// computes them for the live site, so this preview and that site can't
// drift apart. Set as inline style on a wrapping div (same "inject as CSS
// custom properties" approach EventWebsitePage.jsx uses on its root div).
function buttonPreviewStyle(primaryScale, secondaryScale, mode) {
  // Fill/Outline's base color sits noticeably lighter in dark mode (600 ->
  // 200) so it doesn't read as a flat, oversaturated block against a dark
  // background — same convention EventWebsitePage.jsx's own
  // --gs-color-primary/-secondary follow, so the two can't drift apart.
  const primaryBase = primaryScale[mode === 'dark' ? 200 : 600]
  const secondaryBase = secondaryScale[mode === 'dark' ? 200 : 600]
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

function ButtonPreviewRow({ primaryScale, secondaryScale, mode, colorKey }) {
  return (
    <div className="wds-button-row" style={buttonPreviewStyle(primaryScale, secondaryScale, mode)}>
      {BUTTON_APPEARANCES.map(({ appearance, label }) => (
        <GSButton key={appearance} color={colorKey} appearance={appearance} title={label} isFocusable />
      ))}
    </div>
  )
}

// One color's own block, same shape as ColorBlock: a centered "Primary"/
// "Secondary" label, its Fill/Outline/Subtle row in light mode (bare), then
// the same row in dark mode inset in a rounded black pill.
function ButtonColorBlock({ label, colorKey, primaryScale, secondaryScale }) {
  return (
    <div className="wds-color-block">
      <div className="wds-color-block-label">{label}</div>
      <ButtonPreviewRow primaryScale={primaryScale} secondaryScale={secondaryScale} mode="light" colorKey={colorKey} />
      <div className="wds-ramp-dark-pill">
        <ButtonPreviewRow primaryScale={primaryScale} secondaryScale={secondaryScale} mode="dark" colorKey={colorKey} />
      </div>
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
}) {
  const primaryScale = generateScale(primaryColor)
  const secondaryScale = generateScale(secondaryColor)

  const swapColors = () => {
    onChangePrimaryColor(secondaryColor)
    onChangeSecondaryColor(primaryColor)
  }

  return (
    <div className="ordr1-list">
      <GSActionBar
        type="form-header H3"
        header="Website Design and Style"
        pageActions={[
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
        type="vertical xx-large-gap"
        fields={[
          {
            isEditable: true,
            customView: true,
            value: (
              <ColorsSection
                primaryColor={primaryColor}
                onChangePrimaryColor={onChangePrimaryColor}
                secondaryColor={secondaryColor}
                onChangeSecondaryColor={onChangeSecondaryColor}
                onSwapColors={swapColors}
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
                isPremium={isPremium}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                neutralTint={neutralTint}
                onChangeNeutralTint={onChangeNeutralTint}
              />
            ),
          },
        ]}
      />

      {/* Button Styles — hidden for now, Dane's re-adding it later. */}
    </div>
  )
}
