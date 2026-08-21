import './SponsorDetails.scss'

// Sponsor name/type/contact text block — shared by the list row (SponsorRow)
// and the Sponsor Overview panel hero, so both read the exact same way.
export default function SponsorDetails({ sponsor }) {
  return (
    <div className="spn-details">
      <div className="spn-details-group">
        <div className="spn-details-name">{sponsor.sponsorName}</div>
        <div className="spn-details-type">Sponsor</div>
      </div>
      <div className="spn-details-contact">
        <div>{sponsor.contactName}</div>
        <div>{sponsor.email}</div>
        <div>{sponsor.phone}</div>
      </div>
    </div>
  )
}
