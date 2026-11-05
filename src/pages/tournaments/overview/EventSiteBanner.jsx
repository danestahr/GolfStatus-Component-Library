import { useState } from 'react'
import { faCheck, faEye, faLink, faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSButton from '../../../gs-lib/components/gs-button'
import EventSiteDeviceMockup from '../../../components/orders-forms/EventSiteDeviceMockup.jsx'
import { golfstatusColors } from '../../../gs-lib/helpers/Theme'
import { loadEventSiteStyle, hasEventSiteStyle } from '../../../data/eventSiteStyle.js'
import { loadIsPremium } from '../../../data/eventSitePremium.js'
import './EventSiteBanner.scss'

const slugify = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Registration closes at noon the day before the tournament starts.
const registrationCloses = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d - 1).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// Event site card (Figma "Hero Banner"), in two shapes that follow the card's
// own width (a container query in the SCSS): wide, with a preview of the site
// beside its registration status; narrow, stacked, with an "Active" pill and
// no preview. A tournament with no site yet gets a prompt to build one.
export default function EventSiteBanner({ tournament, onView, onEdit }) {
  const [copied, setCopied] = useState(false)
  const published = tournament.hasBanner
  // Same device mockup and saved-style fallback as the Event Site & Packages
  // hub's preview card (EventSitePreviewCard.jsx).
  const savedStyle = loadIsPremium() && hasEventSiteStyle() ? loadEventSiteStyle() : null
  const url = `https://events.golfstatus.com/event/${slugify(tournament.name)}`

  const copy = () => {
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="es-banner-wrap">
      <section className="es-banner">
        <div className="es-banner-top">
          <div className="es-banner-details">
            <div className="es-banner-name">{tournament.name} Site</div>
            {published ? (
              <a className="es-banner-url" href={url} onClick={e => { e.preventDefault(); onView() }}>{url}</a>
            ) : (
              <div className="es-banner-text">Your website is how players register and sponsors find you.</div>
            )}
          </div>

          <div className="es-banner-actions">
            <GSButton
              title={published ? 'Edit' : 'Build Site'}
              buttonIcon={faPen}
              type="white"
              onClick={onEdit}
              isFocusable
            />
            {published && (
              <>
                <GSButton buttonIcon={copied ? faCheck : faLink} type="black" onClick={copy} isFocusable />
              </>
            )}
          </div>
        </div>

        {published && (
          <>
            <hr className="es-banner-divider" />
            <div className="es-banner-bottom">
              <div className="es-banner-preview">
                <EventSiteDeviceMockup
                  primaryColor={savedStyle ? savedStyle.primaryColor : golfstatusColors.grey800}
                  secondaryColor={savedStyle ? savedStyle.secondaryColor : golfstatusColors.grey800}
                  neutralTint={savedStyle ? savedStyle.neutralTint : 'golfstatus'}
                  buttonStyles={savedStyle?.buttonStyles}
                />
              </div>
              <div className="es-banner-status">
                <span className="es-banner-pill">
                  <FontAwesomeIcon icon={faEye} />
                  <span className="es-banner-pill-wide">Public registration</span>
                  <span className="es-banner-pill-narrow">Active</span>
                </span>
                <span className="es-banner-closes">
                  Registration is open to the public until 12:00 PM on {registrationCloses(tournament.startISO)}
                </span>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
