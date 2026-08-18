import { useNavigate } from 'react-router-dom'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import './OrdersHubPage.scss'

const OPTIONS = [
  { to: '/orders/original', name: 'Original', description: 'The current Orders & Payouts design.' },
  { to: '/orders-draft-1', name: 'Draft 1', description: 'A copy to riff on.' },
  { to: '/orders-draft-2', name: 'Draft 2', description: 'A second copy to riff on.' },
]

// Landing spot for the "Orders & Payouts" nav item — picking a variation
// here keeps the sidebar to one entry instead of one per draft.
export default function OrdersHubPage() {
  const navigate = useNavigate()

  return (
    <div className="ord-hub-page-bg">
      <GSActionBar type="x-large-pad H3" header="Orders & Payouts" />

      <div className="ord-hub-list">
        {OPTIONS.map(option => (
          <div key={option.to} className="ord-hub-card" onClick={() => navigate(option.to)}>
            <div className="ord-hub-card-name">{option.name}</div>
            <div className="ord-hub-card-sub">{option.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
