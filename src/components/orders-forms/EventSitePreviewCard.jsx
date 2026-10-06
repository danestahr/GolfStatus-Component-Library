import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import { golfstatusColors } from '../../gs-lib/helpers/Theme'
import { loadEventSiteStyle, hasEventSiteStyle } from '../../data/eventSiteStyle.js'
import EventSiteDeviceMockup from './EventSiteDeviceMockup.jsx'
import './EventSitePreviewCard.scss'

// Live preview of the tournament's event site, shown under the "Event Site
// & Registration Details" nav row on the Event Site & Packages hub page
// (Figma "List Item Layout" / "Large" variant). Only the active-site state
// is wired up here — a draft/not-yet-enabled site would swap this for an
// "Enable Site" prompt, which isn't part of this round of design.
//
// Reuses EventSiteDeviceMockup.jsx — the shared desktop+mobile device-frame
// mockup — so this hub-page thumbnail can't drift out of sync with what it
// looks like elsewhere.
export default function EventSitePreviewCard({ eventSite, onViewWebsite, onEventRegistration, isPremium }) {
  const isPrivate = eventSite.registrationVisibility === 'private'

  // Same "has this tournament actually saved a custom style yet" gate
  // EventWebsitePage.jsx's own customThemeStyle uses — a non-premium
  // tournament, or one that's never touched Website Design and Style, has
  // no real Primary/Secondary to show here, so both fall back to
  // GolfStatus's own fixed brand grey (theme.scss's .gs-theme-default),
  // same as the real site does in that case. Read fresh on every render
  // (not read-once-on-load) — this card shows up on the same screen the
  // admin just saved a style from, so it needs to flip the moment
  // Save/Premium actually changes, not just on next mount.
  const showsSavedStyle = isPremium && hasEventSiteStyle()
  const savedStyle = showsSavedStyle ? loadEventSiteStyle() : null
  const primaryColor = savedStyle ? savedStyle.primaryColor : golfstatusColors.grey800
  const secondaryColor = savedStyle ? savedStyle.secondaryColor : golfstatusColors.grey800
  // No Primary picked -> Grayscale, whatever tint was saved.
  const neutralTint = savedStyle?.primaryColor ? savedStyle.neutralTint : 'golfstatus'

  return (
    <div className="efp-preview-card">
      <div className="efp-preview-thumb">
        <EventSiteDeviceMockup primaryColor={primaryColor} secondaryColor={secondaryColor} neutralTint={neutralTint} buttonStyles={savedStyle?.buttonStyles} />
      </div>

      <div className="efp-preview-body">
        <div className="efp-preview-title-group">
          <div className="efp-preview-title">{eventSite.tournamentName}&rsquo;s Event Site</div>
          <div className="efp-preview-subtext">Registration closes on {eventSite.registrationCloseAt}.</div>
        </div>
        <span className={`efp-visibility-pill ${isPrivate ? 'private' : 'public'}`}>
          <FontAwesomeIcon icon={isPrivate ? faEyeSlash : faEye} />
          {isPrivate ? 'Private Registration' : 'Public Registration'}
        </span>
      </div>

      <div className="efp-preview-actions">
        <GSButton type="light-grey" title="View Website" rightIcon={faExternalLinkSquareAlt} onClick={onViewWebsite} isFocusable />
        <GSButton type="light-grey" title="Event Registration" rightIcon={faExternalLinkSquareAlt} onClick={onEventRegistration} isFocusable />
      </div>
    </div>
  )
}
