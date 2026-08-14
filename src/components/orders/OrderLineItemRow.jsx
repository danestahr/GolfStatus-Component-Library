import './OrderLineItemRow.scss'

export default function OrderLineItemRow({ label, amount, note }) {
  return (
    <div className="ord-line-item">
      <div className="ord-line-item-row">
        <span className="ord-line-item-label">{label}</span>
        <div className="ord-line-item-value">
          <span className="ord-line-item-amount">{amount}</span>
          {note && <div className="ord-line-item-note">{note}</div>}
        </div>
      </div>
    </div>
  )
}
