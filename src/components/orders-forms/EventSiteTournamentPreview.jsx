import { useId } from 'react'
import './EventSiteTournamentPreview.scss'
import rawEventSiteSvg from '../../assets/EventSite.svg?raw'

// Shared by WebsiteDesignStyleFields.jsx's own Site Theme preview,
// EventSitePreviewCard.jsx's event-site thumbnail, EventSiteHomepageSectionsList.jsx's
// own banner, and ColorExplorationFields.jsx's SVG Preview tab — all four
// want the exact same mockup of the real event site's tournament-details
// section, so it lives here once instead of separate copies that could
// drift apart.

// assets/EventSite.svg itself (the "generic, colorless placeholder" export)
// is never touched — its two color-bearing spots (the active sub-nav tab
// pill, and the outline donation button) are just grey/black placeholders
// on disk. This inlines that exact file (via Vite's `?raw`) and swaps only
// those two spots' hex values in memory to whatever /event-site itself
// would actually render there (EventWebsitePage.jsx's `customThemeStyle`/
// `hasSavedStyle` gate) — same "match the real page, don't hand-maintain a
// second colored export" fix that page's own non-premium buttons got. A
// tournament that HAS saved a custom Primary/Secondary (`hasSavedStyle`)
// still isn't tracked pixel-for-pixel here — same drift risk a previous
// version of this component hit trying to do that — so it just stays the
// plain export's own grey/black look, same as before.
const TAB_PILL_BG_MATCH = '<rect x="929" y="96" width="99" height="38" rx="8" fill="#E3E3E3"/>'
const TAB_PILL_TEXT_MATCH = '<rect x="943" y="112" width="71" height="6" rx="3" fill="black"/>'
const OUTLINE_BORDER_MATCH = '<rect x="488.5" y="596.5" width="97" height="36" rx="7" stroke="#232323" stroke-width="2"/>'
const OUTLINE_TEXT_MATCH = '<rect x="501.5" y="611.5" width="71" height="6" rx="3" fill="#232323"/>'

// The exact tokens EventWebsitePage.jsx's own `customThemeStyle` gate falls
// back to once it's skipped (theme.scss's `.gs-theme-default`, un-overridden)
// — grey-200/grey-800 for the active tab's `--gs-color-primary-subtle`/`-on-
// primary-subtle` (always this, `customThemeStyle` only ever retints it for
// an actually-saved style, which this preview doesn't track — see above),
// and cyan-700 for the outline button's `--gs-color-secondary`. Non-premium
// then locks that outline to grey-800 too, same as the real page's own
// buttons (EventWebsitePage.jsx's `style={!isPremium ? ... : undefined}`).
const GOLFSTATUS_TAB_BG = '#DCDCDC'
const GOLFSTATUS_TAB_TEXT = '#232323'
const GOLFSTATUS_OUTLINE = '#00767C'
const GOLFSTATUS_OUTLINE_NON_PREMIUM = '#232323'

function EventSiteTournamentPreview({ label, bordered = true, isPremium = true }) {
  const clipId = useId()
  // Read fresh on every render (not read-once-on-load) — this preview
  // shows up on the same screen the admin just saved from, so it needs to
  // flip the moment Save/Premium actually changes, not just on next mount.

  let svg = rawEventSiteSvg.replaceAll('clip0_2568_51582', `clip0_2568_51582_${clipId}`)

  if (!isPremium) {
    const tabBg = GOLFSTATUS_TAB_BG
    const tabText = GOLFSTATUS_TAB_TEXT
    const outline = isPremium ? GOLFSTATUS_OUTLINE : GOLFSTATUS_OUTLINE_NON_PREMIUM
    svg = svg
      .replace(TAB_PILL_BG_MATCH, `<rect x="929" y="96" width="99" height="38" rx="8" fill="${tabBg}"/>`)
      .replace(TAB_PILL_TEXT_MATCH, `<rect x="943" y="112" width="71" height="6" rx="3" fill="${tabText}"/>`)
      .replace(OUTLINE_BORDER_MATCH, `<rect x="488.5" y="596.5" width="97" height="36" rx="7" stroke="${outline}" stroke-width="2"/>`)
      .replace(OUTLINE_TEXT_MATCH, `<rect x="501.5" y="611.5" width="71" height="6" rx="3" fill="${outline}"/>`)
  }

  return (
    <div className="estp-preview-block">
      {label && <div className="estp-preview-label">{label}</div>}
      <div
        className={`estp-preview${bordered ? ' estp-preview--bordered' : ''}`}
        // eslint-disable-next-line react/no-danger -- svg is our own local
        // asset (assets/EventSite.svg) with two hex values swapped above,
        // never user-controlled input.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}

export default EventSiteTournamentPreview
