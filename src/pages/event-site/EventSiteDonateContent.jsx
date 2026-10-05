import GSProgressBar from '../../gs-lib/components/gs-progress-bar'
import { formatMoney } from '../../components/orders/orderUtils'
import './EventSiteDonateContent.scss'

// The public Event Site's "Donate" page (Figma "Registration - Donations -
// Cart - Checkout" > Donate). The amount lives in EventWebsitePage so the
// sticky footer can appear once one is entered.
const DONATE_AMOUNTS = [200, 100, 50, 25]

export default function EventSiteDonateContent({ raised, goal, amount, onAmountChange }) {
  return (
    <div className="es-donate">
      <div className="es-donate-band es-donate-title-band">
        <div className="es-donate-inner">
          <h1 className="es-donate-title">Donate</h1>
        </div>
      </div>
      <div className="es-donate-band">
        <div className="es-donate-inner">
          <div className="es-donate-card">
            <div className="es-donate-summary">
              <h2 className="es-donate-heading">Make a Donation</h2>
              <div className="es-donation-goal-label">
                <span className="es-donation-raised-amount">${formatMoney(raised)} Raised</span> of ${formatMoney(goal)} Donation Goal
              </div>
              <GSProgressBar value={raised} max={goal} />
            </div>
            <div className="es-donate-entry">
              <div className="es-donate-tiles">
                {DONATE_AMOUNTS.map(value => (
                  <button
                    key={value}
                    type="button"
                    className={`es-donate-tile${Number(amount) === value ? ' is-selected' : ''}`}
                    onClick={() => onAmountChange(String(value))}
                  >
                    <span className="es-donate-tile-label">Donate</span>
                    <span className="es-donate-tile-value">${value}</span>
                  </button>
                ))}
              </div>
              <label className="es-donate-field">
                <span className="es-donate-field-label">Donation Amount *</span>
                <span className="es-donate-input-wrap">
                  <span className="es-donate-currency">$</span>
                  <input
                    className="es-donate-input"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => onAmountChange(e.target.value)}
                  />
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
