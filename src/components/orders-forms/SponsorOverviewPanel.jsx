import { faPen } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import SponsorDetails from './SponsorDetails.jsx'
import NavRow from './NavRow.jsx'
import './SponsorOverviewPanel.scss'

// Content of the side panel opened by clicking a sponsor row (Figma
// "Sponsor Overview"). Order Details and Form Responses open the sponsor's
// linked order right in this same panel (see SponsorsListPage.jsx) — reusing
// the Orders & Payouts side-panel screens rather than navigating away.
// Sponsored Holes doesn't lead anywhere yet — that screen doesn't exist in
// this prototype — so, like NavRow's other use on the Event Site & Packages
// page, it's decorative for now rather than wired to a route.
export default function SponsorOverviewPanel({ sponsor, onViewOrderDetails, onViewFormResponses }) {
  return (
    <div className="spn-overview">
      <div className="spn-overview-hero">
        <div className="spn-overview-stack">
          <div className="spn-overview-thumb" />
          <SponsorDetails sponsor={sponsor} />
        </div>

        <GSButton buttonIcon={faPen} type="light-grey icon" isFocusable onClick={() => {}} />
      </div>

      <NavRow title="Sponsored Holes" description="View and manage sponsored holes for all rounds." />
      <NavRow title="Order Details" description="View sponsor payment and order details." onClick={onViewOrderDetails} />
      <NavRow title="Form Responses" description="View this sponsor's form responses." onClick={onViewFormResponses} />
    </div>
  )
}
