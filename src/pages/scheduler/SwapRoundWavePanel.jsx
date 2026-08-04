import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRetweet } from '@fortawesome/free-solid-svg-icons'
import AppSidePanel from '../../components/AppSidePanel'
import './SwapRoundWavePanel.scss'

// Confirmation panel for moving a round that's already linked to a different
// wave — picking an already-linked round from WaveRoundsPanel's available
// list (see its swap badge) opens this instead of linking immediately, since
// doing so unlinks it from its current wave. Same header/body layout as
// DeleteRoundPanel/DeleteWavePanel, just framed as a move rather than a
// deletion (blue icon, no destructive "cannot be undone" language).
export default function SwapRoundWavePanel({
  isOpen, onClose, onConfirm,
  roundName, fromWaveName, toWaveName,
}) {
  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Move Round"
      dimOverlay={false}
      noTransition
      actions={[
        { name: 'Move Round', type: 'black', action: onConfirm },
        { name: 'Cancel', type: 'light-grey', action: onClose },
      ]}
    >
      <div className="srwp-header">
        <FontAwesomeIcon icon={faRetweet} className="srwp-header-icon" />
        <h1 className="srwp-header-title">Move Round</h1>
      </div>

      <div className="srwp-body">
        <div className="srwp-desc">
          Move <strong>{roundName}</strong> to <strong>{toWaveName}</strong>? It will no longer be linked to <strong>{fromWaveName}</strong>.
        </div>
      </div>
    </AppSidePanel>
  )
}
