import { formatMoney, STATUS_TYPE } from '../orders/orderUtils'
import GSButton from '../../gs-lib/components/gs-button'
import './EntityListItem.scss'

// Generic list row shared by the Orders and Forms tile pages (Sponsors,
// Teams, Event Site & Packages) — mirrors OrderListItem.jsx's layout so
// every tile's list reads as the same structure as Orders & Payouts.
export default function EntityListItem({ primary, secondaryLines = [], tertiaryLines = [], tagLine, amount, statusLabel, statusClassName }) {
  return (
    <div className="efi-row">
      <div className="efi-row-details">
        <div className="efi-row-group">
          <div className="efi-row-name">{primary}</div>
          {secondaryLines.map(line => (
            <div key={line} className="efi-row-sub">{line}</div>
          ))}
        </div>

        {tertiaryLines.length > 0 && (
          <div className="efi-row-group">
            {tertiaryLines.map(line => (
              <div key={line} className="efi-row-sub">{line}</div>
            ))}
          </div>
        )}

        {tagLine && <div className="efi-row-sub">{tagLine}</div>}
      </div>

      <div className="efi-row-side">
        {amount != null && <div className="efi-row-amount">${formatMoney(amount)}</div>}
        {statusLabel && <GSButton type={`status ${STATUS_TYPE[statusClassName]}`} title={statusLabel} isPill hoverType="none" style={{ cursor: 'default' }} />}
      </div>
    </div>
  )
}
