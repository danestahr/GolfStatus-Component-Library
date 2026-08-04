import { useEffect, useState } from 'react'
import GSinput from '../../gs-lib/components/gs-input'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import AppSidePanel from '../../components/AppSidePanel'
import './AddWavePanel.scss'

// The name-only form for a wave — first step of Add Wave (saving hands off
// to WaveRoundsPanel, see TournamentSchedulerPage's handleAddWaveSave, so
// picking the wave's rounds is the very next step), and reused as-is for
// renaming an existing wave from WaveRoundsPanel's edit pencil (initialName
// set, see openEditWaveNamePanel) — same form either way, just pre-filled
// and returning to whatever page opened it instead of chaining forward.
export default function AddWavePanel({ isOpen, onClose, onSave, initialName, dimOverlay, noTransition }) {
  const [name, setName] = useState('')
  const isEditing = initialName != null

  // Fresh field every time this is opened, rather than carrying over
  // whatever was typed in a previous session — pre-filled when editing an
  // existing wave's name instead of starting blank.
  useEffect(() => {
    if (isOpen) setName(initialName ?? '')
  }, [isOpen, initialName])

  function handleSave() {
    onSave(name)
  }

  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Wave' : 'Add Wave'}
      dimOverlay={dimOverlay}
      noTransition={noTransition}
      actions={[
        { name: 'Save', type: 'black', action: handleSave },
      ]}
    >
      <GSActionBar type="form-header H3" header={isEditing ? 'Edit Wave' : 'Add Wave'} />
      <div className="awp-body">
        <label className="awp-label">Wave Name</label>
        <GSinput
          textValue={name}
          onChange={e => setName(e.target.value)}
          onSubmit={handleSave}
          placeholder="Wave name (e.g. Morning Wave)"
        />
      </div>
    </AppSidePanel>
  )
}
