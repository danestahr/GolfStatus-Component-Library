import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserTie, faPeopleGroup, faHandHoldingDollar, faGlobe } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import './OrdersFormsHubPage.scss'

const TILES = [
  { to: '/orders-forms/sponsors', icon: faUserTie, name: 'Sponsors', description: 'Everyone who purchased a sponsorship package.' },
  { to: '/orders-forms/teams', icon: faPeopleGroup, name: 'Teams', description: 'Everyone who registered a team.' },
  // Temporarily hidden — see conversation on 2026-08-25.
  // { to: '/orders-forms/event-site-packages', icon: faGlobe, name: 'Event Site & Packages', description: 'Manage the event site, registration packages, and related pages.' },
  { to: '/orders-draft-1', icon: faHandHoldingDollar, name: 'Orders & Payouts', description: 'Every order placed, and the funds available to pay out.' },
]

// Landing spot for the "Edit Form Responses" nav item — a tile per area, each
// eventually filtering into the Edit Form Responses page based on which
// tile brought you there.
export default function OrdersFormsHubPage() {
  const navigate = useNavigate()

  return (
    <div className="off-hub-page-bg">
      <GSActionBar type="x-large-pad H3" header="Edit Form Responses" />

      <div className="off-hub-grid">
        {TILES.map(tile => (
          <div key={tile.to} className="off-hub-tile" onClick={() => navigate(tile.to)}>
            <div className="off-hub-tile-icon">
              <FontAwesomeIcon icon={tile.icon} />
            </div>
            <div className="off-hub-tile-name">{tile.name}</div>
            <div className="off-hub-tile-sub">{tile.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
