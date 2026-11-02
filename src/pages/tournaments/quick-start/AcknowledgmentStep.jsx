import { faBolt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSFormSection from '../../../gs-lib/components/gs-form-section'
import ConfirmationCard from '../../../components/confirmation/ConfirmationCard.jsx'
import GSToggle from '../../../gs-lib/components/gs-toggle'
import { formatDate } from './format.js'
import './AcknowledgmentStep.scss'

const TERMS_URL = 'https://golfstatus.com/golfstatus-terms-of-service'
const PRIVACY_URL = 'https://golfstatus.com/golfstatus-privacy-policy'

// Quick Start's first screen: recaps what we already know about the prospect
// and gates the flow behind accepting the Terms of Service / Privacy Policy.
// The footer actions (Get Started / Cancel) live in QuickStartPanel.
export default function AcknowledgmentStep({ quickStart, accepted, onAcceptedChange }) {
  const { first_name, organization, tournament_date, course_name } = quickStart

  return (
    <>
      <div className="qs-ack-header">
        <FontAwesomeIcon icon={faBolt} />
        <h3>Tournament Quick Start</h3>
      </div>

      <GSFormSection
        gap="xx-large"
        extras={
          <>
            <ConfirmationCard
              intro={`${first_name}, here’s what we’ve gathered so far:`}
              groups={[
                { title: organization, lines: [organization] },
                { lines: [formatDate(tournament_date), course_name] },
              ]}
              note="Tournament information can be edited at any time"
            />

            <div className="qs-ack-terms">
              <p>
                I have reviewed and accept the{' '}
                <a href={TERMS_URL} target="_blank" rel="noreferrer">Terms of Service</a> and{' '}
                <a href={PRIVACY_URL} target="_blank" rel="noreferrer">Privacy Policy</a> on behalf of {organization}.
              </p>
              <GSToggle
                value={accepted}
                onClick={() => onAcceptedChange(!accepted)}
                trueDescription="Yes"
                falseDescription="No"
              />
            </div>
          </>
        }
      />
    </>
  )
}
