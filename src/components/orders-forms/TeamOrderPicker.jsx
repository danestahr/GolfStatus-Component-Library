import OrderListItem from '../orders/OrderListItem.jsx'
import '../orders/OrderDetailPanel.scss'

// Shown instead of jumping straight to a single order whenever a team
// actually has more than one associated with it — its own bulk Team
// Registration order, plus a separate order for any player manually added
// in from Unassigned Players rather than registered as part of the team's
// own order (see the Fairway Fanatics comment in mockTeams.js) — so
// "Order Details" doesn't have to guess which one the user means. Reuses
// the exact same header treatment (`.ord-detail-header`) and row component
// (OrderListItem) as the Orders & Payouts list, so a row here looks and
// reads identically to its counterpart there.
export default function TeamOrderPicker({ orders, onSelect }) {
  return (
    <div className="ord-detail-panel">
      <div className="ord-detail-header">
        <div className="ord-detail-header-title">Order Details</div>
      </div>

      {orders.map(order => (
        <OrderListItem key={order.id} order={order} onClick={() => onSelect(order.id)} />
      ))}
    </div>
  )
}
