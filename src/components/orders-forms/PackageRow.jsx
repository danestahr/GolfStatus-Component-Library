import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone, faEye, faEyeSlash, faGripLines } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import { formatMoney, STATUS_TYPE } from '../orders/orderUtils'
import './PackageRow.scss'

const STATUS_META = {
  active: { label: 'Active', className: 'active', icon: faEye },
  draft: { label: 'Draft', className: 'pending', icon: faEyeSlash },
  inactive: { label: 'Inactive', className: 'inactive', icon: faEyeSlash },
}

// A single package row on the full Packages list (Figma "Packages" —
// PackagesListContent, grouped into PackageCategorySection). Same
// name/price/counts/status as the compact PackageCard on the Event Site &
// Packages hub, plus the Copy action that card has no room for.
//
// The drag handle (`showGrabber`) only appears once its category has more
// than one package to reorder against — reordering itself is driven
// entirely by the parent (PackageCategorySection's pointer-based drag,
// same convention as SponsorRow/SponsorTierSection), this component just
// renders whatever offsetY/isDragging it's given and forwards the
// grabber's pointerdown upward.
export default function PackageRow({ pkg, onCopy, showGrabber, isDragging, offsetY, onGrabberPointerDown, onRowRef }) {
  const meta = STATUS_META[pkg.status]

  const style = {
    transform: offsetY ? `translateY(${offsetY}px)` : undefined,
    zIndex: isDragging ? 2 : undefined,
  }

  return (
    <div className={`pkgr-row${isDragging ? ' pkgr-row--dragging' : ''}`} ref={onRowRef} style={style}>
      <div className="pkgr-row-details">
        <div className="pkgr-row-title-group">
          <div className="pkgr-row-name">{pkg.name}</div>
          <div className="pkgr-row-sub">${formatMoney(pkg.price)}</div>
        </div>

        <div className="pkgr-row-counts">
          <div className="pkgr-row-sub">{pkg.purchased} Purchased</div>
          <div className="pkgr-row-sub">{pkg.remaining == null ? 'Unlimited' : pkg.remaining} Remaining</div>
        </div>

        <GSButton type={`status ${STATUS_TYPE[meta.className]}`} title={meta.label} buttonIcon={meta.icon} isPill hoverType="none" style={{ cursor: 'default', alignSelf: 'flex-start' }} />
      </div>

      <GSButton
        type="light-grey"
        size="primary"
        title="Copy"
        buttonIcon={faClone}
        isFocusable
        onClick={() => onCopy(pkg)}
      />

      {showGrabber && (
        <span className="pkgr-drag-handle" aria-label="Drag to reorder" onPointerDown={onGrabberPointerDown}>
          <GSButton buttonIcon={faGripLines} />
        </span>
      )}
    </div>
  )
}
