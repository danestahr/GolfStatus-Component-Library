import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import eventSitePreviewThumb from '../../assets/event-site-preview-thumb.png'
import './EventSitePreviewCard.scss'

// Live preview of the tournament's event site, shown under the "Event Site
// & Registration Details" nav row on the Event Site & Packages hub page
// (Figma "List Item Layout" / "Large" variant). Only the active-site state
// is wired up here — a draft/not-yet-enabled site would swap this for an
// "Enable Site" prompt, which isn't part of this round of design.
export default function EventSitePreviewCard({ eventSite, onViewWebsite, onEventRegistration }) {
  const isPrivate = eventSite.registrationVisibility === 'private'

  return (
    <div className="efp-preview-card">
      <div className="efp-preview-thumb">
        <img className="efp-preview-thumb-img" src={eventSitePreviewThumb} alt="" />
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
