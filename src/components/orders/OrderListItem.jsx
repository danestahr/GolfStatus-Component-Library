import { faClipboardList } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import { formatMoney, STATUS_META } from './orderUtils'
import './OrderListItem.scss'

export default function OrderListItem({ order, onClick, onViewResponses }) {
  const status = STATUS_META[order.status]

  return (
    <div
      className="ord-row"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="ord-row-details">
        <div className="ord-row-group">
          <div className="ord-row-name">{order.buyerName}</div>
          <div className="ord-row-sub">{order.email}</div>
          <div className="ord-row-sub">{order.phone}</div>
        </div>

        <div className="ord-row-group">
          <div className="ord-row-sub">{order.paymentType}</div>
          <div className="ord-row-sub">{order.dateTime}</div>
          <div className="ord-row-sub">{order.orderType}</div>
        </div>

        <div className="ord-row-sub">{order.packages.join(', ')}</div>
      </div>

      <div className="ord-row-side">
        <div className="ord-row-amount">${formatMoney(order.amount)}</div>
        <span className={`ord-status-pill ${status.className}`}>{status.label}</span>

        {onViewResponses && (
          <GSButton
            title={`Form Responses (${order.formResponses.length})`}
            buttonIcon={faClipboardList}
            type="light-grey"
            isFocusable
            onClick={e => {
              e.stopPropagation()
              onViewResponses()
            }}
          />
        )}
      </div>
    </div>
  )
}
