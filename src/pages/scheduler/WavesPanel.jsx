import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faPen,
  faTrash,
  faCircleXmark,
  faCheck,
  faLink,
  faGripLines,
} from '@fortawesome/free-solid-svg-icons'
import GSinput from '../../gs-lib/components/gs-input'
import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import AppSidePanel from '../../components/AppSidePanel'
import './WavesPanel.scss'

// A round linked into a wave — same name/course summary used across the
// scheduler's other round rows, just with an unlink control instead of actions.
function WaveRoundRow({ name, course, onUnlink }) {
  return (
    <div className="wp-round-row">
      <div className="wp-round-row-text">
        <div className="wp-round-row-name">{name}</div>
        <div className="wp-round-row-sub">{course}</div>
      </div>
      <GSButton type="transparent icon" size="secondary" isFocusable buttonIcon={faCircleXmark} onClick={onUnlink} />
    </div>
  )
}

// Inline picker under a wave's "Link Existing Round" action — only rounds not
// already linked to some other wave are offered, since a round belongs to at
// most one wave at a time.
function LinkRoundPicker({ options, onPick, onCancel }) {
  return (
    <div className="wp-link-picker">
      {options.length === 0 ? (
        <div className="wp-link-picker-empty">Every round is already linked to a wave.</div>
      ) : (
        options.map(o => (
          <button key={o.round} type="button" className="wp-link-picker-option" onClick={() => onPick(o.round)}>
            <div className="wp-round-row-text">
              <div className="wp-round-row-name">{o.name}</div>
              <div className="wp-round-row-sub">{o.course}</div>
            </div>
          </button>
        ))
      )}
      <GSButton type="grey" title="Cancel" isFocusable onClick={onCancel} />
    </div>
  )
}

function WaveCard({
  wave, linkedRounds, availableToLink,
  isEditingName, editingName, onStartRename, onChangeEditingName, onCommitRename, onCancelRename,
  isConfirmingDelete, onStartDelete, onConfirmDelete, onCancelDelete,
  isLinking, onStartLink, onCancelLink, onLinkRound,
  onCreateRound, onUnlinkRound,
  showGrabber, isDragging, isDropTarget, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
}) {
  if (isConfirmingDelete) {
    return (
      <div className="wp-wave-card wp-wave-card--confirm">
        <div className="wp-confirm-text">
          Delete <strong>{wave.name}</strong>? Its rounds won't be deleted, just unlinked from this wave.
        </div>
        <div className="wp-confirm-actions">
          <GSButton type="grey" title="Cancel" isFocusable onClick={onCancelDelete} />
          <GSButton type="red" title="Delete Wave" isFocusable onClick={onConfirmDelete} />
        </div>
      </div>
    )
  }

  let cardClass = 'wp-wave-card'
  if (isDragging) cardClass += ' wp-wave-card--dragging'
  if (isDropTarget) cardClass += ' wp-wave-card--drop-target'

  return (
    <div className="wp-wave-row" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={cardClass}>
        <div className="wp-wave-header">
          {isEditingName ? (
            <div className="wp-wave-rename">
              <GSinput
                textValue={editingName}
                onChange={e => onChangeEditingName(e.target.value)}
                onSubmit={onCommitRename}
                placeholder="Wave name"
              />
              <GSButton type="black icon" size="secondary" isFocusable buttonIcon={faCheck} onClick={onCommitRename} />
              <GSButton type="transparent icon" size="secondary" isFocusable buttonIcon={faCircleXmark} onClick={onCancelRename} />
            </div>
          ) : (
            <>
              <div className="wp-wave-header-text">
                <div className="wp-wave-name">{wave.name}</div>
                <div className="wp-wave-sub">{linkedRounds.length} Round{linkedRounds.length === 1 ? '' : 's'}</div>
              </div>
              <div className="wp-wave-header-actions">
                <GSButton type="light-grey icon" size="secondary" isFocusable buttonIcon={faPen} onClick={onStartRename} />
                <GSButton type="light-grey icon" size="secondary" isFocusable buttonIcon={faTrash} onClick={onStartDelete} />
              </div>
            </>
          )}
        </div>

        {linkedRounds.length > 0 && (
          <div className="wp-wave-rounds">
            {linkedRounds.map(r => (
              <WaveRoundRow key={r.round} name={r.name} course={r.course} onUnlink={() => onUnlinkRound(r.round)} />
            ))}
          </div>
        )}

        {isLinking ? (
          <LinkRoundPicker options={availableToLink} onPick={onLinkRound} onCancel={onCancelLink} />
        ) : (
          <div className="wp-wave-footer">
            <GSButton type="light-grey" buttonIcon={faPlus} title="Create Round" isFocusable onClick={onCreateRound} />
            {availableToLink.length > 0 && (
              <GSButton
                type="light-grey"
                buttonIcon={faLink}
                title="Link Existing Round"
                isFocusable
                onClick={onStartLink}
              />
            )}
          </div>
        )}
      </div>

      {showGrabber && (
        <div
          className="wp-wave-grabber"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <GSButton type="light-grey icon" size="secondary" buttonIcon={faGripLines} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

// Waves side panel: create/rename/delete waves, and within each wave either
// create a brand-new round (hands off to CreateRoundPanel) or link one of the
// tournament's existing, not-yet-linked rounds.
export default function WavesPanel({
  isOpen, onClose,
  waves, rounds, roundName, roundCourse, linkedRoundNumbers,
  onAddWave, onRenameWave, onDeleteWave, onReorderWave,
  onCreateRoundForWave, onLinkRound, onUnlinkRound,
}) {
  const [addingWave, setAddingWave] = useState(false)
  const [newWaveName, setNewWaveName] = useState('')
  const [editingWaveId, setEditingWaveId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [confirmDeleteWaveId, setConfirmDeleteWaveId] = useState(null)
  const [linkingWaveId, setLinkingWaveId] = useState(null)
  // Drag-to-reorder: draggingWaveId is the tile currently being dragged (via
  // its grabber handle), dragOverWaveId is whichever tile the cursor is
  // currently over, so that tile alone can highlight as the drop target.
  const [draggingWaveId, setDraggingWaveId] = useState(null)
  const [dragOverWaveId, setDragOverWaveId] = useState(null)

  function handleDragStart(e, waveId) {
    setDraggingWaveId(waveId)
    e.dataTransfer.effectAllowed = 'move'
    // Use the whole card (not just the small grabber button beside it) as
    // the drag image, so it looks like you're picking up the tile itself —
    // the grabber is now a sibling of the card, not a descendant, so it's
    // found via the shared row parent rather than closest().
    const card = e.currentTarget.parentElement?.querySelector('.wp-wave-card')
    if (card) e.dataTransfer.setDragImage(card, card.offsetWidth / 2, 24)
  }

  function handleDragEnd() {
    setDraggingWaveId(null)
    setDragOverWaveId(null)
  }

  function handleDragOver(e, waveId) {
    e.preventDefault()
    if (waveId !== draggingWaveId) setDragOverWaveId(waveId)
  }

  function handleDragLeave(waveId) {
    setDragOverWaveId(prev => (prev === waveId ? null : prev))
  }

  function handleDrop(e, waveId) {
    e.preventDefault()
    if (draggingWaveId && draggingWaveId !== waveId) onReorderWave(draggingWaveId, waveId)
    setDraggingWaveId(null)
    setDragOverWaveId(null)
  }

  function startAddWave() {
    setNewWaveName('')
    setAddingWave(true)
  }

  function commitAddWave() {
    onAddWave(newWaveName)
    setAddingWave(false)
    setNewWaveName('')
  }

  function startRename(wave) {
    setEditingWaveId(wave.id)
    setEditingName(wave.name)
  }

  function commitRename() {
    if (editingName.trim()) onRenameWave(editingWaveId, editingName.trim())
    setEditingWaveId(null)
  }

  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Waves"
      actions={[
        { name: 'Done', type: 'black', action: onClose },
      ]}
    >
      <GSActionBar
        type="form-header H3"
        header="Manage Waves"
        pageActions={[{ buttonTitle: 'Add Wave', buttonIcon: faPlus, type: 'black', actionClick: startAddWave }]}
      />

      <div className="wp-body">
        {addingWave && (
          <div className="wp-wave-card wp-wave-card--new">
            <GSinput
              textValue={newWaveName}
              onChange={e => setNewWaveName(e.target.value)}
              onSubmit={commitAddWave}
              placeholder="Wave name (e.g. Morning Wave)"
            />
            <div className="wp-confirm-actions">
              <GSButton type="grey" title="Cancel" isFocusable onClick={() => setAddingWave(false)} />
              <GSButton type="black" title="Add Wave" isFocusable onClick={commitAddWave} />
            </div>
          </div>
        )}

        {waves.length === 0 && !addingWave ? (
          <GSEmptyList
            title="No Waves Yet"
            detail="Add a wave, then create or link rounds inside it."
            actions={[{ title: 'Add Wave', type: 'black', isFocusable: true, onClick: startAddWave }]}
          />
        ) : (
          waves.map(wave => {
            // Reordering only means anything once there's something to reorder
            // relative to — a single wave has nowhere to go, so the grabber
            // (and the drag machinery behind it) stays hidden until a second
            // wave exists.
            const showGrabber = waves.length >= 2
            const linkedRounds = wave.roundIds.map(r => ({ round: r, name: roundName(r), course: roundCourse(r) }))
            const availableToLink = rounds
              .filter(r => !linkedRoundNumbers.has(r))
              .map(r => ({ round: r, name: roundName(r), course: roundCourse(r) }))
            return (
              <WaveCard
                key={wave.id}
                wave={wave}
                linkedRounds={linkedRounds}
                availableToLink={availableToLink}
                isEditingName={editingWaveId === wave.id}
                editingName={editingName}
                onStartRename={() => startRename(wave)}
                onChangeEditingName={setEditingName}
                onCommitRename={commitRename}
                onCancelRename={() => setEditingWaveId(null)}
                isConfirmingDelete={confirmDeleteWaveId === wave.id}
                onStartDelete={() => setConfirmDeleteWaveId(wave.id)}
                onConfirmDelete={() => { onDeleteWave(wave.id); setConfirmDeleteWaveId(null) }}
                onCancelDelete={() => setConfirmDeleteWaveId(null)}
                isLinking={linkingWaveId === wave.id}
                onStartLink={() => setLinkingWaveId(wave.id)}
                onCancelLink={() => setLinkingWaveId(null)}
                onLinkRound={r => { onLinkRound(wave.id, r); setLinkingWaveId(null) }}
                onCreateRound={() => onCreateRoundForWave(wave.id)}
                onUnlinkRound={r => onUnlinkRound(wave.id, r)}
                showGrabber={showGrabber}
                isDragging={wave.id === draggingWaveId}
                isDropTarget={wave.id === dragOverWaveId && wave.id !== draggingWaveId}
                onDragStart={e => handleDragStart(e, wave.id)}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, wave.id)}
                onDragLeave={() => handleDragLeave(wave.id)}
                onDrop={e => handleDrop(e, wave.id)}
              />
            )
          })
        )}
      </div>
    </AppSidePanel>
  )
}
