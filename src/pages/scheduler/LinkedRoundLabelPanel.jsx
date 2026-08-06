import { useEffect, useState } from 'react'
import GSinput from '../../gs-lib/components/gs-input'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import AppSidePanel from '../../components/AppSidePanel'
import './LinkedRoundLabelPanel.scss'

// Purely cosmetic override for a Round Number's own sticky-header/tile-
// picker title (see linkedGroupLabel in TournamentSchedulerPage) — every
// Round Number gets one of these, whether or not anything else actually
// shares it. The Round Number itself, and everything that actually keys off
// it (CreateRoundPanel's own Round Number field, each round's individual
// name), stays exactly as it is; this only ever changes what its header
// reads as.
export default function LinkedRoundLabelPanel({ isOpen, onClose, onSave, roundNumber, initialLabel }) {
  const [label, setLabel] = useState('')

  // Fresh field every time this is opened, pre-filled with whatever label
  // (if any) this Round Number already has.
  useEffect(() => {
    if (isOpen) setLabel(initialLabel ?? '')
  }, [isOpen, initialLabel])

  function handleSave() {
    onSave(label)
  }

  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Linked Round Label"
      actions={[
        { name: 'Save', type: 'black', action: handleSave },
      ]}
    >
      <GSActionBar type="form-header H3" header="Linked Round Label" />
      <div className="lrlp-body">
        <label className="lrlp-label">Label</label>
        <GSinput
          textValue={label}
          onChange={e => setLabel(e.target.value)}
          onSubmit={handleSave}
          placeholder={`Round ${roundNumber}`}
        />
        <div className="lrlp-hint">
          Shown in place of "Round {roundNumber}" wherever this Round Number is listed. Leave blank to show the
          Round Number instead.
        </div>
      </div>
    </AppSidePanel>
  )
}
