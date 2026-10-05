import { SECTION_SCENES } from '../../data/eventSiteSectionScenes.js'
import { ctaThemeVars, rectStyle, snap, useMeasuredWidth } from './EventSiteDeviceMockup.jsx'
import './EventSiteSectionSvg.scss'

// One homepage section's thumbnail, rebuilt as absolutely-positioned divs
// (one per shape in data/eventSiteSectionScenes.js, generated from the old
// Figma .svg exports) — same approach as EventSiteDeviceMockup: measure the
// container, convert every export coordinate to snapped real px
// (rectStyle/snap), no inlined or recolored SVG. Every shape's `role` is a
// class (`.esss-*`) reading the same --edm-* / --gs-color-* vars that
// mockup's ctaThemeVars sets, so the thumbnails follow the saved Site Theme
// (colors, Neutral Tint, button styles) and fall back to the export's flat
// black/white/grey when no theme is given.
const ORIGIN = { x: 0, y: 0 }

// The camera/play glyphs in Banner/Photos/Video are compound paths, not
// boxes — drawn as a mask (same trick as the mockup's BrandIcon) over the
// whole scene so the div's themed background-color shows through.
function iconMask(d, width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path d="${d}"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function Shape({ s, scale, size }) {
  if (s.role === 'icon') {
    const mask = iconMask(s.d, size[0], size[1])
    return (
      <div
        className="esss-shape esss-icon"
        style={{ inset: 0, WebkitMaskImage: mask, maskImage: mask }}
      />
    )
  }
  const radius = s.rx ? `${s.rx * scale}px` : undefined
  // Stroked shapes (card, CTA outline) center their border on the export's
  // edge, so grow the box by half the stroke each side.
  const sw = s.role === 'card' ? s.sw : s.role === 'cta-outline' ? 2 : 0
  if (sw) {
    const border = Math.max(1, snap(sw * scale))
    const grow = sw / 2
    return (
      <div
        className={`esss-shape esss-${s.role}`}
        style={{
          ...rectStyle(ORIGIN, s.x - grow, s.y - grow, s.w + sw, s.h + sw, scale),
          borderWidth: `${border}px`,
          borderRadius: s.rx ? `${(s.rx + grow) * scale}px` : undefined,
        }}
      />
    )
  }
  return <div className={`esss-shape esss-${s.role}`} style={{ ...rectStyle(ORIGIN, s.x, s.y, s.w, s.h, scale), borderRadius: radius }} />
}

export default function EventSiteSectionSvg({ sectionId, primaryColor, secondaryColor, neutralTint = 'golfstatus', buttonStyles }) {
  const [ref, width] = useMeasuredWidth()
  const scene = SECTION_SCENES[sectionId]
  if (!scene) return null
  const scale = width ? width / scene.size[0] : 0

  return (
    <div className="esss" ref={ref} style={{ height: `${snap(scene.size[1] * scale)}px`, ...ctaThemeVars(primaryColor, secondaryColor, neutralTint, buttonStyles) }}>
      {scale > 0 && scene.shapes.map((s, i) => <Shape key={i} s={s} scale={scale} size={scene.size} />)}
    </div>
  )
}
