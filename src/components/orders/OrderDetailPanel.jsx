import { faCircleArrowDown, faPaperPlane, faPen } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import OrderFormSection from './OrderFormSection.jsx'
import OrderLineItemRow from './OrderLineItemRow.jsx'
import { formatMoney, STATUS_META } from './orderUtils.js'
import './OrderDetailPanel.scss'
import '../orders/OrderListItem.scss'

export function orderActionsFor(order, { onMarkPaid, onVoid, onRefund }) {
  switch (order.status) {
    case 'paid':
      return [{ name: 'Refund Order', type: 'light-grey', action: onRefund }]
    case 'pending':
      return [
        { name: 'Mark as Paid', type: 'green', action: onMarkPaid },
        { name: 'Void Invoice', type: 'light-grey', action: onVoid },
      ]
    default:
      return []
  }
}

export default function OrderDetailPanel({ order }) {
  const status = STATUS_META[order.status]

  return (
    <div className="ord-detail-panel">
      <div className="ord-detail-header">
        <div className="ord-detail-header-title">Order Details</div>
        <div className="ord-detail-header-actions">
          <GSButton title="Resend Receipt" buttonIcon={faPaperPlane} type="light-grey" isFocusable onClick={() => {}} />
          <GSButton buttonIcon={faCircleArrowDown} type="light-grey icon" isFocusable onClick={() => {}} />
          <GSButton buttonIcon={faPen} type="light-grey icon" isFocusable onClick={() => {}} />
        </div>
      </div>

      <OrderFormSection>
        <div className="ord-row ord-row--static">
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
          </div>
        </div>
      </OrderFormSection>

      <OrderFormSection title="Order Details">
        {order.lineItems.map((item, i) => (
          <OrderLineItemRow
            key={i}
            label={item.name}
            amount={`$${formatMoney(item.unitPrice * item.quantity)}`}
            note={item.quantity > 1 ? `(${item.quantity} X $${formatMoney(item.unitPrice)})` : null}
          />
        ))}
        <OrderLineItemRow label="Fee" amount={`$${formatMoney(order.fee)}`} />
        <OrderLineItemRow label="Total" amount={`$${formatMoney(order.amount)}`} />
      </OrderFormSection>

      {order.status === 'paid' && (
        <OrderFormSection title="Refund Details">
          <OrderLineItemRow
            label="Refundable Amount"
            amount={`$${formatMoney(order.amount - order.fee)}`}
            note="The fee is non-refundable."
          />
        </OrderFormSection>
      )}

      <OrderFormSection title="Form Responses">
        {order.formResponses.map((field, i) => (
          <OrderLineItemRow key={i} label={field.label} amount={field.value} />
        ))}
      </OrderFormSection>
    </div>
  )
}
