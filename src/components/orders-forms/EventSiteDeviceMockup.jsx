import { useEffect, useRef, useState } from 'react'
import golfstatusLogo from '../../assets/GS_Logo.svg'
import { generateScale } from '../../gs-lib/helpers/colorScale'
import './EventSiteDeviceMockup.scss'

// Pixel-accurate rebuild of the Figma "Vertical Group 2" export (the
// desktop+mobile browser-frame mockup, node 1869:93523/1869:93494 in
// https://www.figma.com/design/WutAU4FjRNv3R4u5sbWZSK/Event-Site---Packages)
// as real divs instead of an inlined/recolored SVG. Every rect below is the
// *exact* coordinate that export's own markup used (down to the same
// decimals) — see DESKTOP_ORIGIN/MOBILE_ORIGIN and `rectStyle()`. Every
// "line"/"card"/"button" here is the same abstract placeholder shape the
// export used too — there's no real copy or a real GSButton underneath any
// of it, only an *inference* of what the site looks like, same as the
// export itself was.
//
// The export's own two color-bearing spots — the filled CTA chip and the
// outline CTA chip in the desktop frame's hero card — mirror the real
// site's own Register Now/Make A Donation pair (EventWebsitePage.jsx): Fill
// reads Primary (`--gs-color-primary`/`-on-primary-fill`), Outline reads
// Secondary (`--gs-color-secondary`), each falling back to the export's own
// flat #232323/white when no color is given, since most places this renders
// aren't wrapped in a `.gs-theme-*` subtree. Everything else (chrome,
// subnav tabs, wireframe lines, sidebar cards) is deliberately left at the
// export's own flat black/white/grey — that's UI chrome and placeholder
// filler, not themed site content.

// The desktop frame's own card box in the export's coordinate space
// (x/y/width/height of its outer rounded rect) — every desktop rect below
// is positioned relative to this box. Same idea for the phone's own box.
const DESKTOP_ORIGIN = { x: 0.996094, y: 0.99649, w: 231, h: 114.663 }
const MOBILE_ORIGIN = { x: 209.012, y: 7.32779, w: 54, h: 102 }

// The phone-over-desktop composition — a negative-gap style overlap on the
// right side, vertically centered. Dimensionless fractions, not
// Figma-derived pixels, so they're easy to retune independent of either
// frame's own native size.
const PHONE_HEIGHT_FRACTION = 0.8 // phone's height, as a fraction of the desktop frame's own rendered height
const PHONE_OVERLAP_FRACTION = 0.5 // how much of the phone's own width sits over the desktop frame; the rest overhangs past its right edge
const PHONE_ASPECT = MOBILE_ORIGIN.w / MOBILE_ORIGIN.h

// Phone dimensions/overhang expressed as a ratio of deskScale (px per
// DESKTOP_ORIGIN unit) rather than of DESKTOP_ORIGIN.w/.h directly, so
// EventSiteDeviceMockup's own deskScale calc below (which has to reserve
// room for the phone's overhang *before* it knows the desktop's rendered
// size) stays a single division regardless of PHONE_HEIGHT_FRACTION.
const PHONE_HEIGHT_RATIO = PHONE_HEIGHT_FRACTION * DESKTOP_ORIGIN.h
const PHONE_WIDTH_RATIO = PHONE_HEIGHT_RATIO * PHONE_ASPECT
const OVERHANG_RATIO = PHONE_WIDTH_RATIO * (1 - PHONE_OVERLAP_FRACTION)
const TOTAL_RATIO = DESKTOP_ORIGIN.w + OVERHANG_RATIO

// Measures an element's own rendered width and keeps it in state, so the
// mockup below can compute every rect's position as a real pixel value
// (see rectStyle()) instead of a CSS %. A %-per-rect approach independently
// rounds each element's fractional width/height against the container's
// current size, so two rects meant to end up the exact same height can
// round to different device pixels from one another at some container
// widths — that reads as janky/inconsistent. A CSS `transform: scale()` on
// a fixed-size canvas fixes that inconsistency but introduces its own
// softness (the browser composites/interpolates the whole scaled layer,
// blurring hairline borders). Computing real px here with full
// floating-point precision and handing the DOM concrete values avoids
// both — layout and paint happen through the browser's normal (crisp,
// non-transformed) path, just recomputed on resize.
function useMeasuredWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

// Rounds every edge to a whole CSS pixel (min 1px for width/height, so
// nothing disappears at a very small render size). This is the actual
// second half of "scale it proportionally" — real px from a measured
// container (useMeasuredWidth above) already fixed *relative* proportions
// being inconsistent between rects, but a fractional height like 1.3px vs.
// 1.7px on two rects that are each individually meant to be "a thin line"
// still anti-aliases each one differently, which is what was still reading
// as soft/uneven. Snapping every edge to the pixel grid (same idea as
// Figma's own "snap to pixel grid") is what makes a 1px line render as an
// actual crisp 1px line instead of a blurred ~1.5px one, consistently.
function snap(value) {
  return Math.round(value)
}

function rectStyle(origin, x, y, w, h, scale) {
  return {
    left: `${snap((x - origin.x) * scale)}px`,
    top: `${snap((y - origin.y) * scale)}px`,
    width: `${Math.max(1, snap(w * scale))}px`,
    height: `${Math.max(1, snap(h * scale))}px`,
  }
}

function Rect({ origin, x, y, w, h, scale, className, style }) {
  return <div className={`edm-rect${className ? ` ${className}` : ''}`} style={{ ...rectStyle(origin, x, y, w, h, scale), ...style }} />
}

// The GolfStatus favicon mark in the header/status bar — recolored white
// via the mask-image trick (not a plain <img>, which can't be recolored),
// same technique/asset EventWebsitePage.jsx's own `.es-brand-logo` uses for
// its header icon. Quoted url() — an unquoted one breaks once Vite inlines
// this small an SVG as a data: URI in a production build (see that file's
// own comment on `.es-brand-logo`).
function BrandIcon({ origin, x, y, w, h, scale }) {
  return (
    <div
      className="edm-icon"
      style={{
        ...rectStyle(origin, x, y, w, h, scale),
        WebkitMaskImage: `url("${golfstatusLogo}")`,
        maskImage: `url("${golfstatusLogo}")`,
      }}
    />
  )
}

// The 8 subnav tabs (Frame 43-51 in the Figma structure) — same x-step
// (13.785) and size repeated 8 times, so generated instead of hand-copied
// 8 times over. Only the first (index 0) is "active" (Figma's #E3E3E3
// pill) — the rest render as bare text bars on the page's own white, same
// as the export.
const SUBNAV_TAB_COUNT = 8
const SUBNAV_TAB_X0 = 120.684
const SUBNAV_TAB_STEP = 13.785
const SUBNAV_TAB_Y = 13.3646
const SUBNAV_TAB_W = 12.7546
const SUBNAV_TAB_H = 4.89571
const SUBNAV_TEXT_OFFSET_X = 1.803
const SUBNAV_TEXT_Y = 15.4259
const SUBNAV_TEXT_W = 9.14724
const SUBNAV_TEXT_H = 0.773006

// The export's Fill/Outline CTA chips read --gs-color-primary/-on-primary-
// fill and --gs-color-secondary (see EventSiteDeviceMockup.scss's
// edm-rect--cta-*) — same step convention (600/50 in light mode) as
// colorScale.js's own buttonThemeVars, mirroring EventWebsitePage.jsx's
// real Register Now (Fill/Primary) and Make A Donation (Outline/Secondary)
// buttons. Each half is left out of the returned object (falling through to
// its own fallback hex in the stylesheet) when that color isn't given.
// Register Now / Make A Donation chips follow the color + style saved for
// those buttons (the same `buttonStyles` the live site's btn() reads), same
// 600/50 step convention as the Fill/Outline defaults above.
function chipVars(n, buttonId, defColor, defAppearance, scales, buttonStyles) {
  const saved = buttonStyles?.[buttonId]
  const color = saved?.color ? saved.color.replace('-color', '') : defColor
  const appearance = saved?.appearance ?? defAppearance
  const scale = scales[color]
  if (!scale) return null
  const chip = { bg: 'transparent', border: 'transparent', label: scale[600] }
  if (appearance === 'fill') Object.assign(chip, { bg: scale[600], border: scale[600], label: scale[50] })
  else if (appearance === 'outline') Object.assign(chip, { border: scale[600] })
  else if (appearance === 'subtle') Object.assign(chip, { bg: scale[100], border: scale[100], label: scale[900] })
  return {
    [`--edm-cta${n}-bg`]: chip.bg,
    [`--edm-cta${n}-border`]: chip.border,
    [`--edm-cta${n}-label`]: chip.label,
  }
}

function ctaThemeVars(primaryColor, secondaryColor, neutralTint, buttonStyles) {
  if (!primaryColor && !secondaryColor) return undefined
  const primary = primaryColor ? generateScale(primaryColor) : null
  const secondary = secondaryColor ? generateScale(secondaryColor) : null
  // Neutral Tint ('primary'/'secondary') re-tints the mockup's grey chrome
  // and placeholder shapes with that scale, same white->50, grey-50->100
  // (softer than monochromatize()'s 50 so the hero card still reads against
  // the page), grey-200->200, grey-800->800 substitution the live site's
  // Monochromatic mode applies (monochromatic.js). 'neutral' leaves every
  // --edm-* var unset, so the stylesheet's own flat greys win.
  // 'full' tints surfaces with Secondary and borders/ink with Primary.
  const surfaceScale = neutralTint === 'primary' ? primary : neutralTint === 'secondary' || neutralTint === 'full' ? secondary : null
  const inkScale = neutralTint === 'full' ? primary : surfaceScale
  return {
    ...(primary && { '--gs-color-primary': primary[600], '--gs-color-on-primary-fill': primary[50] }),
    // Neutral Tint's header is the plain Primary bar (tinted themes keep the
    // dark ink header) — same rule as EventWebsitePage.jsx's --es-header-ink.
    ...(primary && neutralTint === 'neutral' && { '--edm-header': primary[600] }),
    ...chipVars('1', 'registerNow', neutralTint === 'secondary' ? 'secondary' : 'primary', 'fill', { primary, secondary }, buttonStyles),
    ...chipVars('2', 'makeDonation', 'secondary', 'outline', { primary, secondary }, buttonStyles),
    ...(secondary && { '--gs-color-secondary': secondary[600] }),
    ...(surfaceScale && inkScale && {
      '--edm-surface': surfaceScale[50],
      '--edm-card-bg': surfaceScale[100],
      '--edm-border': inkScale[200],
      '--edm-ink': inkScale[800],
    }),
  }
}

function EventSiteDeviceMockup({ label, primaryColor, secondaryColor, neutralTint = 'neutral', buttonStyles }) {
  const [mockupRef, mockupWidth] = useMeasuredWidth()

  // Reserve enough of the container's own measured width for the desktop
  // frame that the phone — PHONE_HEIGHT_FRACTION of the desktop's height,
  // PHONE_OVERLAP_FRACTION of its own width hanging past the desktop's
  // right edge — still fits inside the container instead of spilling past
  // it. TOTAL_RATIO already folds PHONE_HEIGHT_FRACTION/-OVERLAP_FRACTION
  // in, so this stays one division regardless of how those are tuned.
  const deskScale = mockupWidth ? mockupWidth / TOTAL_RATIO : 0
  const deskWidthPx = snap(DESKTOP_ORIGIN.w * deskScale)
  const deskHeightPx = snap(DESKTOP_ORIGIN.h * deskScale)

  const phoneHeightPx = snap(PHONE_HEIGHT_RATIO * deskScale)
  const phoneWidthPx = snap(phoneHeightPx * PHONE_ASPECT)
  const phoneScale = phoneWidthPx / MOBILE_ORIGIN.w
  const phoneLeftPx = snap(deskWidthPx - phoneWidthPx * PHONE_OVERLAP_FRACTION)
  const phoneTopPx = snap((deskHeightPx - phoneHeightPx) / 2)

  return (
    <div className="edm-block">
      {label && <div className="edm-label">{label}</div>}
      <div className="edm-mockup" ref={mockupRef} style={{ height: `${deskHeightPx}px` }}>
        <div
          className="edm-desktop-window"
          style={{ width: `${deskWidthPx}px`, height: `${deskHeightPx}px`, ...ctaThemeVars(primaryColor, secondaryColor, neutralTint, buttonStyles) }}
        >
          {/* Header bar + brand icon + title bar + right-side action chip */}
          <Rect origin={DESKTOP_ORIGIN} x={0.996094} y={0.99649} w={231} h={10.3067} scale={deskScale} className="edm-rect--header" />
          <BrandIcon origin={DESKTOP_ORIGIN} x={3.15} y={3.15} w={5.79} h={5.79} scale={deskScale} />
          <Rect origin={DESKTOP_ORIGIN} x={11.3027} y={5.76337} w={17.7791} h={0.773006} scale={deskScale} className="edm-rect--faint-on-dark" />
          <Rect origin={DESKTOP_ORIGIN} x={212.542} y={5.76337} w={1.80368} h={0.773006} scale={deskScale} className="edm-rect--faint-on-dark" />
          <Rect origin={DESKTOP_ORIGIN} x={217.18} y={3.70203} w={12.7546} h={4.89571} scale={deskScale} className="edm-rect--chip" />
          <Rect origin={DESKTOP_ORIGIN} x={218.983} y={5.76337} w={9.14724} h={0.773006} scale={deskScale} className="edm-rect--chip-text" />

          {/* Subnav tab row — tab 0 is the active/highlighted pill */}
          {Array.from({ length: SUBNAV_TAB_COUNT }, (_, i) => {
            const x = SUBNAV_TAB_X0 + i * SUBNAV_TAB_STEP
            return (
              <div key={i}>
                <Rect
                  origin={DESKTOP_ORIGIN}
                  x={x}
                  y={SUBNAV_TAB_Y}
                  w={SUBNAV_TAB_W}
                  h={SUBNAV_TAB_H}
                  scale={deskScale}
                  className={i === 0 ? 'edm-rect--tab-active' : 'edm-rect--tab'}
                />
                <Rect
                  origin={DESKTOP_ORIGIN}
                  x={x + SUBNAV_TEXT_OFFSET_X}
                  y={SUBNAV_TEXT_Y}
                  w={SUBNAV_TEXT_W}
                  h={SUBNAV_TEXT_H}
                  scale={deskScale}
                  className="edm-rect--line"
                />
              </div>
            )
          })}

          {/* Hero card: headline/date/detail lines + Fill/Outline CTA chips + sidebar */}
          <Rect origin={DESKTOP_ORIGIN} x={46.9258} y={27.5364} w={139.141} h={80.908} scale={deskScale} className="edm-rect--card-bg" />
          <Rect origin={DESKTOP_ORIGIN} x={50.0176} y={53.3677} w={48.184} h={2.06135} scale={deskScale} className="edm-rect--heading" />
          <Rect origin={DESKTOP_ORIGIN} x={50.0176} y={57.4904} w={20.8712} h={2.06135} scale={deskScale} className="edm-rect--heading" />
          <Rect origin={DESKTOP_ORIGIN} x={50.0176} y={62.6437} w={31.0491} h={1.15951} scale={deskScale} className="edm-rect--line" />
          <Rect origin={DESKTOP_ORIGIN} x={50.0176} y={66.8953} w={17.5215} h={1.15951} scale={deskScale} className="edm-rect--line" />
          <Rect origin={DESKTOP_ORIGIN} x={50.0176} y={69.0855} w={7.73006} h={1.15951} scale={deskScale} className="edm-rect--line" />
          <Rect origin={DESKTOP_ORIGIN} x={50.0176} y={71.2757} w={19.3252} h={1.15951} scale={deskScale} className="edm-rect--line" />
          <Rect origin={DESKTOP_ORIGIN} x={50.0176} y={73.4658} w={14.3006} h={1.15951} scale={deskScale} className="edm-rect--line" />
          <Rect origin={DESKTOP_ORIGIN} x={50.0176} y={77.7174} w={12.7546} h={4.89571} scale={deskScale} className="edm-rect--cta-fill" />
          <Rect origin={DESKTOP_ORIGIN} x={51.8213} y={79.7787} w={9.14724} h={0.773006} scale={deskScale} className="edm-rect--cta-fill-text" />
          <Rect origin={DESKTOP_ORIGIN} x={63.9316} y={77.8462} w={12.4969} h={4.63804} scale={deskScale} className="edm-rect--cta-outline" />
          <Rect origin={DESKTOP_ORIGIN} x={65.6064} y={79.7787} w={9.14724} h={0.773006} scale={deskScale} className="edm-rect--cta-outline-text" />
          <Rect origin={DESKTOP_ORIGIN} x={117.978} y={34.4934} w={65.2546} h={32.7239} scale={deskScale} className="edm-rect--card" />
          <Rect origin={DESKTOP_ORIGIN} x={117.978} y={68.7634} w={65.2546} h={32.7239} scale={deskScale} className="edm-rect--card" />
        </div>

        {/* The phone — PHONE_HEIGHT_FRACTION the desktop's height, hanging
            PHONE_OVERLAP_FRACTION of its own width past the desktop's right
            edge, vertically centered on it. */}
        <div className="edm-mobile" style={{ ...ctaThemeVars(primaryColor, secondaryColor, neutralTint, buttonStyles), left: `${phoneLeftPx}px`, top: `${phoneTopPx}px`, width: `${phoneWidthPx}px`, height: `${phoneHeightPx}px` }}>
          {/* Status bar + brand icon + right-side action chip */}
          <Rect origin={MOBILE_ORIGIN} x={209.012} y={7.32779} w={54} h={10.5362} scale={phoneScale} className="edm-rect--header" />
          <BrandIcon origin={MOBILE_ORIGIN} x={211.218} y={9.53366} w={5.78} h={5.78} scale={phoneScale} />
          <Rect origin={MOBILE_ORIGIN} x={236.539} y={12.2008} w={1.84383} h={0.790215} scale={phoneScale} className="edm-rect--faint-on-dark" />
          <Rect origin={MOBILE_ORIGIN} x={241.28} y={10.0935} w={13.0385} h={5.00469} scale={phoneScale} className="edm-rect--chip" />
          <Rect origin={MOBILE_ORIGIN} x={243.124} y={12.2008} w={9.35087} h={0.790215} scale={phoneScale} className="edm-rect--chip-text" />
          <Rect origin={MOBILE_ORIGIN} x={257.217} y={12.2008} w={1.84383} h={0.790215} scale={phoneScale} className="edm-rect--faint-on-dark" />

          {/* Content card: headline/date/detail lines + stacked image cards */}
          <Rect origin={MOBILE_ORIGIN} x={211.581} y={25.2393} w={48.8616} h={86.5285} scale={phoneScale} className="edm-rect--card-bg" />
          <Rect origin={MOBILE_ORIGIN} x={214.742} y={32.6147} w={35.1646} h={2.10724} scale={phoneScale} className="edm-rect--heading" />
          <Rect origin={MOBILE_ORIGIN} x={214.742} y={36.8291} w={21.3358} h={2.10724} scale={phoneScale} className="edm-rect--heading" />
          <Rect origin={MOBILE_ORIGIN} x={214.742} y={42.0972} w={31.7403} h={1.18532} scale={phoneScale} className="edm-rect--line" />
          <Rect origin={MOBILE_ORIGIN} x={214.742} y={46.4434} w={17.9115} h={1.18532} scale={phoneScale} className="edm-rect--line" />
          <Rect origin={MOBILE_ORIGIN} x={214.742} y={48.6824} w={7.90215} h={1.18532} scale={phoneScale} className="edm-rect--line" />
          <Rect origin={MOBILE_ORIGIN} x={214.742} y={50.9213} w={19.7554} h={1.18532} scale={phoneScale} className="edm-rect--line" />
          <Rect origin={MOBILE_ORIGIN} x={214.742} y={53.1602} w={14.619} h={1.18532} scale={phoneScale} className="edm-rect--line" />
          <Rect origin={MOBILE_ORIGIN} x={214.479} y={57.6381} w={43.0667} h={21.9943} scale={phoneScale} className="edm-rect--card" />
          <Rect origin={MOBILE_ORIGIN} x={214.479} y={82.6616} w={43.0667} h={21.9943} scale={phoneScale} className="edm-rect--card" />
        </div>
      </div>
    </div>
  )
}

export default EventSiteDeviceMockup
