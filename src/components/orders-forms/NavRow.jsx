import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'

import './NavRow.scss'

// A single settings-style row on the Event Site & Packages hub page (Figma
// "Navigation List Item") — bold title, grey description, chevron. `onClick`
// is optional: most of these (Event Site & Registration Details, Sponsored
// Holes, etc.) don't lead anywhere yet in this prototype, so the chevron is
// decorative unless a destination is actually wired up. The chevron itself
// is an undefined-type GSButton (no color/size class) — same plain primary
// look as AppSidePanel's own back chevron — rather than a bare icon.
export default function NavRow({ title, description, onClick }) {
  return (
    <div
      className={`efp-nav-row${onClick ? ' efp-nav-row--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      <div className="efp-nav-row-text">
        <div className="efp-nav-row-title">{title}</div>
        <div className="efp-nav-row-description">{description}</div>
      </div>
      <GSButton buttonIcon={faChevronRight} style={{ flexShrink: 0 }} />
    </div>
  )
}
