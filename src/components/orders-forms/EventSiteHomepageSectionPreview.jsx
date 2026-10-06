import EventSiteSectionLayouts from './EventSiteSectionLayouts.jsx'
import './EventSiteHomepageSectionPreview.scss'

// EventSiteHomepageSectionRow's own `preview` slot — a themed, flex-layout
// rebuild of that section's Figma frame (see EventSiteSectionLayouts.jsx),
// recolored by the saved Site Theme the same way EventSiteDeviceMockup is.
export default function EventSiteHomepageSectionPreview({ sectionId, bordered = true, ...theme }) {
  return (
    <div className={`ehsp-preview${bordered ? ' ehsp-preview--bordered' : ''}`}>
      <EventSiteSectionLayouts sectionId={sectionId} {...theme} />
    </div>
  )
}
