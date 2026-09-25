import './EventSiteHomepageSectionPreview.scss'

// EventSiteHomepageSectionRow's own `preview` slot — a plain, static export
// of that section's live-site layout (see EventSiteHomepageSectionsList.jsx's
// SECTION_PREVIEW_IMAGES, one Figma-exported .svg per section under
// src/assets). Tournament Details used to show a colorized wireframe here
// instead (recolored to track the Primary/Secondary/Neutral Tint picker —
// see EventSiteTournamentPreview.jsx), which this replaces for now so every
// tile's preview reads consistently: flat, uncolorized, straight from its
// own export.
export default function EventSiteHomepageSectionPreview({ src, bordered = true }) {
  return (
    <div className={`ehsp-preview${bordered ? ' ehsp-preview--bordered' : ''}`}>
      <img src={src} alt="" />
    </div>
  )
}
