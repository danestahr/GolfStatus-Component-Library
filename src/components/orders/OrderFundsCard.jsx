import { formatMoney } from './orderUtils'
import './OrderFundsCard.scss'

export default function OrderFundsCard({ funds, stats }) {
  return (
    <div className="ord-funds-card">
      <div className="ord-funds-main">
        <div className="ord-funds-title-group">
          <div className="ord-funds-label">Available Funds</div>
          <div className="ord-funds-amount">${formatMoney(funds.amount)}</div>
        </div>
        <div className="ord-funds-asof">as of {funds.asOf}</div>
      </div>

      <div className="ord-funds-stats">
        {stats.map(stat => (
          <div className="ord-stat" key={stat.key}>
            <div className="ord-stat-heading">
              <div className="ord-stat-label">{stat.label}</div>
              <div className="ord-stat-value">{stat.value}</div>
            </div>
            <div className="ord-stat-count">{stat.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
