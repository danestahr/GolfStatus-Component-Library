import EventSiteSectionSvg from './EventSiteSectionSvg.jsx'
import './EventSiteHomepageSectionPreview.scss'

// EventSiteHomepageSectionRow's own `preview` slot — a themed, component-
// built rebuild of that section's live-site layout (see
// EventSiteSectionSvg.jsx / data/eventSiteSectionScenes.js), recolored by
// the saved Site Theme the same way EventSiteDeviceMockup is.
export default function EventSiteHomepageSectionPreview({ sectionId, bordered = true, ...theme }) {
  return (
    <div className={`ehsp-preview${bordered ? ' ehsp-preview--bordered' : ''}`}>
      <EventSiteSectionSvg sectionId={sectionId} {...theme} />
    </div>
  )
}
