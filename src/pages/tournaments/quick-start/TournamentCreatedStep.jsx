import { faCircleCheck, faEye, faSquareUpRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSButton from '../../../gs-lib/components/gs-button'
import GSFormSection from '../../../gs-lib/components/gs-form-section'
import EventSiteDeviceMockup from '../../../components/orders-forms/EventSiteDeviceMockup.jsx'
import { formatDate, shiftDate } from './format.js'
import './TournamentCreatedStep.scss'

// A brand-new tournament has no saved site theme yet, so the mockup renders in
// neutral greys (it needs both colors to build its theme variables).
const MOCKUP_PRIMARY = '#232323'
const MOCKUP_SECONDARY = '#7A7A7A'

// Registration closes at noon the day before the tournament starts.
const registrationCloses = startDatetime => `${formatDate(shiftDate(startDatetime.slice(0, 10), -1))} at 12:00 PM`

// Quick Start's last screen: confirms the tournament exists and links to its
// new event site. Footer actions (Tournament Overview / Close) live in
// QuickStartPanel.
export default function TournamentCreatedStep({ quickStart, onViewWebsite }) {
  const { tournament_name, start_datetime } = quickStart

  return (
    <>
      <div className="qs-created-header">
        <FontAwesomeIcon icon={faCircleCheck} />
        <h3>Tournament Created</h3>
      </div>

      <GSFormSection
        extras={
          <div className="qs-created">
            <p className="qs-created-message">{tournament_name} has been successfully created!</p>

            <div className="qs-created-card">
              <div className="qs-created-mockup">
                <EventSiteDeviceMockup primaryColor={MOCKUP_PRIMARY} secondaryColor={MOCKUP_SECONDARY} />
              </div>
              <div className="qs-created-details">
                <div className="qs-created-text">
                  <div className="qs-created-title">{tournament_name}’s Event Site</div>
                  <div className="qs-created-meta">Registration closes on {registrationCloses(start_datetime)}.</div>
                </div>
                <GSButton type="status active" title="Public Registration" buttonIcon={faEye} isPill hoverType="none" style={{ cursor: 'default' }} />
              </div>
              <GSButton title="View Website" type="light-grey" rightIcon={faSquareUpRight} onClick={onViewWebsite} isFocusable />
            </div>
          </div>
        }
      />
    </>
  )
}
