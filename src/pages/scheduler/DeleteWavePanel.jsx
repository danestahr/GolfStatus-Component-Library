import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import AppSidePanel from '../../components/AppSidePanel'

// Confirmation panel for permanently removing a wave — same header/body
// layout as DeleteRoundPanel (icon + headline, divider, description).
export default function DeleteWavePanel({ isOpen, onClose, onDelete, waveName }) {
  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Delete"
      dimOverlay={false}
      noTransition
      actions={[
        { name: 'Delete', type: 'red', action: onDelete },
        { name: 'Cancel', type: 'light-grey', action: onClose },
      ]}
    >
      <div className="drp-header">
        <FontAwesomeIcon icon={faCircleExclamation} className="drp-header-icon" />
        <h1 className="drp-header-title">Delete</h1>
      </div>

      <div className="drp-body">
        <div className="drp-desc">
          Are you sure you want to remove <strong>{waveName}</strong>? This cannot be undone.
        </div>
      </div>
    </AppSidePanel>
  )
}
