import { faBolt, faUserPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSFormSection from '../../../gs-lib/components/gs-form-section'
import ConfirmationCard from '../../../components/confirmation/ConfirmationCard.jsx'
import InfoCallout from '../../../components/callout/InfoCallout.jsx'
import GSToggle from '../../../gs-lib/components/gs-toggle'
import { formatDate } from './format.js'
import './AcknowledgmentStep.scss'

const TERMS_URL = 'https://golfstatus.com/golfstatus-terms-of-service'
const PRIVACY_URL = 'https://golfstatus.com/golfstatus-privacy-policy'

// Quick Start's first screen: recaps what we already know about the prospect
// and gates the flow behind accepting the Terms of Service / Privacy Policy.
// The footer actions (Get Started / Cancel) live in QuickStartPanel.
export default function AcknowledgmentStep({ quickStart, accepted, onAcceptedChange }) {
  const { first_name, organization, tournament_name, tournament_date, course_name, facility } = quickStart

  return (
    <>
      <div className="qs-ack-header">
        <FontAwesomeIcon icon={faBolt} />
        <h3>Let’s Get Started</h3>
      </div>

      <GSFormSection
        gap="xx-large"
        extras={
          <>
            <ConfirmationCard
              intro={`${first_name}, here’s what we’ve gathered so far:`}
              // The date and course lines only show for what we actually know.
              groups={[
                { title: tournament_name, lines: [organization] },
                { lines: [tournament_date && formatDate(tournament_date), facility?.name ?? course_name].filter(Boolean) },
              ].filter(group => group.title || group.lines.length)}
            />

            <InfoCallout icon={faUserPen} title="What if things change?">
              No problem. You can edit this anytime, and you’ll soon have full access to the tournament management software for even more flexibility.
            </InfoCallout>

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
