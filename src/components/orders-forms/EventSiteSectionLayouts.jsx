import { SECTION_ICONS } from '../../data/eventSiteSectionIcons.js'
import { ctaThemeVars, useMeasuredWidth } from './EventSiteDeviceMockup.jsx'
import './EventSiteSectionLayouts.scss'

// Homepage section thumbnails, rebuilt as flex/padding layouts that mirror the
// auto-layout frames in the Figma "Homepage sections" file (frame widths,
// paddings, gaps and radii are the Figma values, in design px). Each section
// renders at its Figma width and the wrapper zooms it to the container, so
// the layout stays real DOM rather than coordinates. Fills are roles
// (`.esl-*`) reading the same --edm-* / --gs-color-* vars as
// EventSiteDeviceMockup's ctaThemeVars, so the thumbnails follow the saved
// Site Theme (colors, Neutral Tint, button styles) and fall back to Figma's
// flat black/white/grey when no theme is given.

// A solid bar/pill. role: ink | line | cta-text | cta-outline-text
function Bar({ role = 'ink', w, h, r = 4, grow, style }) {
  return <div className={`esl-bar esl-${role}`} style={{ width: w, height: h, borderRadius: r, flex: grow ? '1 0 0' : '0 0 auto', ...style }} />
}

function Glyph({ name }) {
  const { box, d } = SECTION_ICONS[name]
  const [x, y, w, h] = box
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}"><path d="${d}"/></svg>`
  const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return <div className="esl-icon" style={{ width: w, height: h, WebkitMaskImage: mask, maskImage: mask }} />
}

// Fill CTA — Figma "Frame 45": 99x38, 14px sides, label bar(s) inside.
function FillCta({ children }) {
  return (
    <div className="esl-cta esl-cta-fill">
      {children}
    </div>
  )
}

function OutlineCta() {
  return (
    <div className="esl-cta esl-cta-outline">
      <Bar role="cta-outline-text" h={6} r={3} grow />
    </div>
  )
}

function CtaLabel({ w, grow }) {
  return <Bar role="cta-text" w={w} h={6} r={3} grow={grow} />
}

// Section title row used by Sponsors / Packages / Donations: title bar left,
// "Add" style CTA right.
function HeaderRow() {
  return (
    <div className="esl-header">
      <div className="esl-header__title">
        <Bar w={232} h={12} />
      </div>
      <FillCta>
        <CtaLabel grow />
        <CtaLabel w={10} />
      </FillCta>
    </div>
  )
}

function PlainTitle() {
  return <Bar w={232} h={12} />
}

function Section({ children, gap = 24 }) {
  return <div className="esl-section" style={{ gap }}>{children}</div>
}

function Panel({ children, gap = 16, className = '' }) {
  return <div className={`esl-panel ${className}`} style={{ gap }}>{children}</div>
}

function Banner() {
  return (
    <div className="esl-banner">
      <Glyph name="banner" />
    </div>
  )
}

function TournamentDetails() {
  return (
    <Section>
      <div className="esl-panel esl-panel--hero">
        <div className="esl-hero">
          <div className="esl-hero__text">
            <div className="esl-stack" style={{ gap: 16 }}>
              <Bar w={374} h={16} />
              <Bar w={162} h={16} />
            </div>
            <Bar role="line" w={241} h={9} />
            <div className="esl-stack" style={{ gap: 8 }}>
              <Bar role="line" w={136} h={9} />
              <Bar role="line" w={60} h={9} />
              <Bar role="line" w={150} h={9} />
              <Bar role="line" w={111} h={9} />
            </div>
            <div className="esl-row" style={{ gap: 8 }}>
              <FillCta><CtaLabel grow /></FillCta>
              <OutlineCta />
            </div>
          </div>
          <div className="esl-hero__image">
            <div className="esl-card esl-card--hero" />
          </div>
        </div>
      </div>
    </Section>
  )
}

// Event Description / Additional Event Description / Registration Details:
// a heading bar over two text lines, no panel.
function TextBlock({ title, lines }) {
  return (
    <Section>
      <div className="esl-stack" style={{ gap: 24 }}>
        <Bar w={title} h={12} />
        <div className="esl-stack" style={{ gap: 9 }}>
          {lines.map((w, i) => <Bar key={i} role="line" w={w} h={9} />)}
        </div>
      </div>
    </Section>
  )
}

function ChipCaption({ w }) {
  return (
    <div className="esl-caption">
      <Bar w={w} h={9} />
      <div className="esl-chip">
        <Bar w={9.1} h={4.48} r={2.24} grow />
      </div>
    </div>
  )
}

function Sponsors() {
  return (
    <Section>
      <HeaderRow />
      <Panel>
        <Bar w={232} h={12} />
        <div className="esl-row" style={{ gap: 16 }}>
          {[169, 185, 102].map((w, i) => (
            <div key={i} className="esl-stack esl-col" style={{ gap: 10 }}>
              <div className="esl-card esl-card--image" />
              <ChipCaption w={w} />
            </div>
          ))}
        </div>
      </Panel>
    </Section>
  )
}

function MediaSection({ icon }) {
  return (
    <Section>
      <PlainTitle />
      <Panel>
        <div className="esl-card esl-card--media">
          <Glyph name={icon} />
        </div>
      </Panel>
    </Section>
  )
}

function Donation() {
  return (
    <Section>
      <HeaderRow />
      <Panel>
        <Bar role="line" w={204} h={9} />
        <div className="esl-progress">
          <Bar w={491} h={24} r={12} />
        </div>
        <div className="esl-row" style={{ gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="esl-card esl-card--tile esl-col esl-center">
              <div className="esl-stack esl-center" style={{ gap: 4 }}>
                <Bar role="line" w={37} h={5} r={2.5} />
                <Bar w={69} h={9} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </Section>
  )
}

function Packages() {
  return (
    <Section>
      <HeaderRow />
      <Panel>
        <div className="esl-row" style={{ gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="esl-card esl-card--tile esl-col esl-split esl-split--packages">
              <div className="esl-stack" style={{ gap: 10, width: 169 }}>
                <Bar w={12} h={9} />
                <Bar w={119} h={9} />
              </div>
              <Bar w={12} h={9} />
            </div>
          ))}
        </div>
      </Panel>
    </Section>
  )
}

function AdditionalPages() {
  return (
    <Section>
      <PlainTitle />
      <Panel>
        <div className="esl-row" style={{ gap: 16 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="esl-card esl-card--tile esl-col esl-split">
              <div className="esl-stack" style={{ gap: 4 }}>
                <Bar w={119} h={9} />
                <Bar role="line" w={100} h={9} />
              </div>
              <Bar w={12} h={9} />
            </div>
          ))}
        </div>
      </Panel>
    </Section>
  )
}

function LiveScoring() {
  return (
    <Section>
      <PlainTitle />
      <Panel>
        <div className="esl-row" style={{ gap: 16 }}>
          <div className="esl-col esl-center esl-live__phone">
            <Bar w={236} h={491} r={36} />
          </div>
          <div className="esl-col esl-live__text">
            <Bar role="line" w={466} h={9} />
            <div className="esl-row" style={{ gap: 10 }}>
              <FillCta><CtaLabel grow /></FillCta>
              <FillCta><CtaLabel grow /></FillCta>
            </div>
          </div>
        </div>
      </Panel>
    </Section>
  )
}

// Figma frame width for each section (everything is 1100 except Banner).
export const SECTION_LAYOUTS = {
  banner: { width: 1080, render: () => <Banner /> },
  tournamentDetails: { width: 1100, render: () => <TournamentDetails /> },
  description: { width: 1100, render: () => <TextBlock title={197} lines={[1013, 805]} /> },
  additionalDescription: { width: 1100, render: () => <TextBlock title={335} lines={[908, 640]} /> },
  registrationDetails: { width: 1100, render: () => <TextBlock title={240} lines={[969, 918]} /> },
  packages: { width: 1100, render: () => <Packages /> },
  sponsors: { width: 1100, render: () => <Sponsors /> },
  photo: { width: 1100, render: () => <MediaSection icon="photo" /> },
  video: { width: 1100, render: () => <MediaSection icon="video" /> },
  donation: { width: 1100, render: () => <Donation /> },
  additionalPages: { width: 1100, render: () => <AdditionalPages /> },
  liveScoring: { width: 1100, render: () => <LiveScoring /> },
}

export default function EventSiteSectionLayouts({ sectionId, primaryColor, secondaryColor, neutralTint = 'golfstatus', buttonStyles }) {
  const [ref, width] = useMeasuredWidth()
  const layout = SECTION_LAYOUTS[sectionId]
  if (!layout) return null

  return (
    <div className="esl" ref={ref} style={ctaThemeVars(primaryColor, secondaryColor, neutralTint, buttonStyles)}>
      {width > 0 && (
        <div className="esl-canvas" style={{ width: layout.width, zoom: width / layout.width }}>
          {layout.render()}
        </div>
      )}
    </div>
  )
}
