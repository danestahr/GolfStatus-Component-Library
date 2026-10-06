import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSButton from '../../gs-lib/components/gs-button'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import { formatMoney, STATUS_TYPE } from '../orders/orderUtils'
import './PackageCard.scss'

const STATUS_META = {
  active: { label: 'Active', className: 'active', icon: faEye },
  draft: { label: 'Draft', className: 'pending', icon: faEyeSlash },
  inactive: { label: 'Inactive', className: 'inactive', icon: faEyeSlash },
}

// A single package tile in the horizontal "Packages" preview on the Event
// Site & Packages hub page (Figma "Horizontal Card List") — clicking any
// tile opens the full Packages list (Figma "Packages" — PackagesListContent),
// same as tapping the "Packages" row above it.
export default function PackageCard({ pkg, onClick }) {
  const meta = STATUS_META[pkg.status]

  return (
    <div
      className={`efp-pkg-card${onClick ? ' efp-pkg-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      <div className="efp-pkg-title-group">
        <div className="efp-pkg-name">{pkg.name}</div>
        <div className="efp-pkg-sub">{pkg.category}</div>
        <div className="efp-pkg-sub">${formatMoney(pkg.price)}</div>
      </div>

      <div className="efp-pkg-counts">
        <div className="efp-pkg-sub">{pkg.purchased} Purchased</div>
        <div className="efp-pkg-sub">{pkg.remaining == null ? 'Unlimited' : pkg.remaining} Remaining</div>
      </div>

      <GSButton type={`status ${STATUS_TYPE[meta.className]}`} title={meta.label} buttonIcon={meta.icon} isPill hoverType="none" style={{ cursor: 'default' }} />
    </div>
  )
}
