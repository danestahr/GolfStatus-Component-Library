import { useRef, useState } from 'react'
import {
  faPlus,
  faPen,
  faGripLines,
} from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import AppSidePanel from '../../components/AppSidePanel'
import './WavesPanel.scss'

// A wave's linked round, shown read-only on this list — removing one is
// WaveRoundsPanel's job (opened via the pen icon below), so there's no
// unlink control here, just the same name/course summary used elsewhere.
function WaveRoundRow({ name, course }) {
  return (
    <div className="wp-round-row">
      <div className="wp-round-row-text">
        <div className="wp-round-row-name">{name}</div>
        <div className="wp-round-row-sub">{course}</div>
      </div>
    </div>
  )
}

// The catch-all tile for rounds not yet linked to any wave — mirrors a
// WaveCard's header/round-list layout but is otherwise read-only: no view/
// reorder/add actions, since there's no wave here to manage, just rounds to
// surface until they're linked from inside a real wave. Only rendered by
// the parent when there's at least one such round — nothing to say once
// every round in the tournament is already spoken for.
function UnassignedRoundsCard({ rounds }) {
  return (
    <div className="wp-wave-row">
      <div className="wp-wave-card wp-wave-card--unassigned">
        <div className="wp-wave-header">
          <div className="wp-wave-header-text">
            <div className="wp-wave-name">Not Assigned to Waves</div>
            <div className="wp-wave-sub">{rounds.length} Round{rounds.length === 1 ? '' : 's'}</div>
          </div>
        </div>
        <div className="wp-wave-rounds">
          {rounds.map(r => (
            <WaveRoundRow key={r.round} name={r.name} course={r.course} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WaveCard({
  wave, roundCount, linkedRounds,
  onViewWave, onAddRound,
  showGrabber, isDragging, isReordering, offsetY,
  onGrabberPointerDown, onGrabberPointerMove, onGrabberPointerUp,
  rowRef,
}) {
  let cardClass = 'wp-wave-card'
  if (isDragging) cardClass += ' wp-wave-card--dragging'

  // Every card — including the one being dragged — collapses to the same
  // small, header-only height for as long as reordering is active. That's
  // what guarantees nothing can ever overlap or hide anything: there's no
  // size mismatch between the dragged tile and whatever it passes over, so
  // there's nothing for either to hide behind the other.
  const isCollapsed = isReordering
  const rowStyle = offsetY !== 0 ? { transform: `translateY(${offsetY}px)` } : undefined

  return (
    <div className="wp-wave-row" ref={rowRef} style={rowStyle}>
      <div className={cardClass}>
        <div className="wp-wave-header">
          <div className="wp-wave-header-text">
            <div className="wp-wave-name">{wave.name}</div>
            <div className="wp-wave-sub">{roundCount} Round{roundCount === 1 ? '' : 's'}</div>
          </div>
          <div className="wp-wave-header-actions">
            {/* Add Round stays out of the header while reordering, same as
                the rounds list below — one less thing competing for
                attention while you're just trying to see the waves and aim
                a drop. */}
            {!isReordering && (
              <GSButton type="black icon" size="primary" isFocusable buttonIcon={faPlus} onClick={onAddRound} />
            )}
            <GSButton type="light-grey icon" size="primary" isFocusable buttonIcon={faPen} onClick={onViewWave} />
          </div>
        </div>

        <div className={`wp-wave-collapsible${isCollapsed ? ' wp-wave-collapsible--collapsed' : ''}`}>
          <div className="wp-wave-collapsible-inner">
            {linkedRounds.length > 0 && (
              <div className="wp-wave-rounds">
                {linkedRounds.map(r => (
                  <WaveRoundRow key={r.round} name={r.name} course={r.course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showGrabber && (
        <div
          className="wp-wave-grabber"
          onPointerDown={onGrabberPointerDown}
          onPointerMove={onGrabberPointerMove}
          onPointerUp={onGrabberPointerUp}
          onPointerCancel={onGrabberPointerUp}
        >
          <GSButton type="light-grey icon" size="secondary" buttonIcon={faGripLines} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

// Waves side panel: a plain list of the tournament's waves — each one's own
// name/rounds/rename/delete now lives in WaveRoundsPanel, opened via a wave
// card's "View Wave" pen icon (see TournamentSchedulerPage) — that's also
// where a round already linked elsewhere gets linked into this wave instead,
// so this panel doesn't need its own separate "Link Round" shortcut. This
// panel only handles the list itself: adding and reordering waves. A wave
// card's "Add Round" bypasses WaveRoundsPanel entirely and creates a round
// straight into the wave.
export default function WavesPanel({
  isOpen, onClose,
  waves, roundName, roundCourse,
  onStartAddWave, onReorderWave, onViewWave, onAddRound,
  unassignedRounds = [],
}) {
  // Drag-to-reorder, driven by pointer events on the grabber rather than
  // native HTML5 drag-and-drop — that API only recognizes a drag after the
  // cursor has moved a browser-defined threshold, never fires from touch at
  // all, and (per its own quirks) freezes its ghost preview on a stale
  // snapshot taken before any state update can react to it. Pointer events
  // give full control from the very first press: draggingWaveId flips the
  // instant you press the grabber (no movement needed), works identically
  // for mouse and touch.
  //
  // The reorder itself is a straightforward adjacent swap rather than a
  // "shift a whole range to make room for an insert" preview — the dragged
  // card and whichever neighbor it's currently overlapping trade places the
  // moment the pointer crosses the midpoint between them, live, not just on
  // release. That happens by literally calling onReorderWave (already an
  // adjacent-swap under the hood — see TournamentSchedulerPage) once per
  // threshold crossed, rather than once at the end with a possibly-distant
  // target. Simpler to reason about, and with only ever one live swap
  // happening between two same-sized (collapsed) rows, there's no room left
  // for the kind of overlap a range-shift could produce.
  const [draggingWaveId, setDraggingWaveId] = useState(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  // Transient per-wave nudge for whichever card just got swapped out of the
  // dragged card's way — set to the distance it just moved (in the opposite
  // direction) the instant the swap happens, then cleared a frame later so
  // the existing transform transition animates it back to 0, i.e. a manual
  // "it used to be here, now it's sliding to there" (FLIP) for just that one
  // card, rather than a jump-cut to its new spot.
  const [flashOffsets, setFlashOffsets] = useState({})
  const isReordering = draggingWaveId != null

  const rowRefs = useRef(new Map())
  const dragStartYRef = useRef(0)
  const wpBodyRef = useRef(null)

  function setRowRef(waveId, el) {
    if (el) rowRefs.current.set(waveId, el)
    else rowRefs.current.delete(waveId)
  }

  // One row's height + the gap after it — every card's movement is some
  // whole multiple of this. Measured fresh on every move rather than cached:
  // right as a drag starts, nothing has collapsed yet (the state update that
  // triggers the collapse hasn't been rendered), so an early measurement
  // would grab a stale, still-expanded height. Settles to the right value
  // within the first couple of moves as the collapse transition finishes.
  function measureRowStep(excludeId) {
    const gap = wpBodyRef.current ? parseFloat(getComputedStyle(wpBodyRef.current).rowGap) || 0 : 0
    for (const [id, el] of rowRefs.current) {
      if (id === excludeId) continue
      return el.getBoundingClientRect().height + gap
    }
    return 0
  }

  function handleGrabberPointerDown(e, waveId) {
    // Ignore a second touch point or a non-primary mouse button already
    // mid-gesture — only one drag at a time.
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    dragStartYRef.current = e.clientY
    setDraggingWaveId(waveId)
    setDragOffsetY(0)
    // Keeps this same element receiving move/up events for the rest of the
    // gesture even once the pointer strays outside its small hit area.
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function handleGrabberPointerMove(e) {
    if (draggingWaveId == null) return
    const step = measureRowStep(draggingWaveId)
    let offset = e.clientY - dragStartYRef.current
    if (step > 0) {
      // A local stand-in for the real order — onReorderWave's own state
      // update (setWaves in the parent) won't be reflected in the `waves`
      // prop until the next render, but a single fast move can cross more
      // than one threshold at once, so each loop iteration needs to know
      // the order *as of the swap just before it*, not the one still on
      // the prop.
      const order = waves.map(w => w.id)
      let idx = order.indexOf(draggingWaveId)
      const flashes = {}
      while (idx < order.length - 1 && offset > step / 2) {
        const otherId = order[idx + 1]
        onReorderWave(draggingWaveId, otherId)
        flashes[otherId] = step
        order[idx] = otherId
        order[idx + 1] = draggingWaveId
        idx += 1
        offset -= step
      }
      while (idx > 0 && offset < -step / 2) {
        const otherId = order[idx - 1]
        onReorderWave(draggingWaveId, otherId)
        flashes[otherId] = -step
        order[idx] = otherId
        order[idx - 1] = draggingWaveId
        idx -= 1
        offset += step
      }
      if (Object.keys(flashes).length > 0) {
        setFlashOffsets(prev => ({ ...prev, ...flashes }))
        // Double rAF: the first "from" value (the flash offset just set
        // above) needs to actually paint before the second frame clears it
        // to 0 — collapsing this to a single rAF sometimes lands both
        // writes in the same frame, and then there's nothing for the
        // transition to animate from.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setFlashOffsets(prev => {
              const next = { ...prev }
              Object.keys(flashes).forEach(id => { next[id] = 0 })
              return next
            })
          })
        })
      }
      // Clamped to the list's own slot positions — the dragged card can
      // move up by at most its own (possibly just-updated) index worth of
      // rows, and down by at most however many rows remain below it, so it
      // can never wander above the first slot or below the last one.
      const min = -idx * step
      const max = (order.length - 1 - idx) * step
      offset = Math.min(Math.max(offset, min), max)
    }
    setDragOffsetY(offset)
    // Rebases the reference point so the *next* move computes its raw
    // offset relative to where this one left off, rather than the original
    // press position. Without this, every swap this call already "used up"
    // gets recomputed and re-applied again on the next move too — since
    // e.clientY - dragStartYRef.current would still measure the full
    // distance from the start, not just what's happened since the last
    // swap, each subsequent move re-triggers the same threshold check
    // against a distance that already included an earlier swap's worth of
    // travel, repeatedly swapping (or, past the list's own bounds, getting
    // visibly stuck) on every further pixel moved downward in particular,
    // since dragging down is what this compounds against fastest.
    dragStartYRef.current = e.clientY - offset
  }

  function handleGrabberPointerUp() {
    setDraggingWaveId(null)
    setDragOffsetY(0)
    setFlashOffsets({})
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
        pageActions={[{ buttonTitle: 'Add Wave', buttonIcon: faPlus, type: 'black', actionClick: onStartAddWave }]}
      />

      <div ref={wpBodyRef} className={`wp-body${isReordering ? ' wp-body--reordering' : ''}`}>
        {waves.length === 0 && (
          <GSEmptyList
            title="No Waves Yet"
            detail="Add a wave, then add rounds inside it."
            actions={[{ title: 'Add Wave', type: 'black', isFocusable: true, onClick: onStartAddWave }]}
          />
        )}
        {waves.map(wave => {
          // Reordering only means anything once there's something to reorder
          // relative to — a single wave has nowhere to go, so the grabber
          // (and the drag machinery behind it) stays hidden until a second
          // wave exists.
          const showGrabber = waves.length >= 2
          const linkedRounds = wave.roundIds.map(r => ({ round: r, name: roundName(r), course: roundCourse(r) }))
          return (
            <WaveCard
              key={wave.id}
              wave={wave}
              roundCount={wave.roundIds.length}
              linkedRounds={linkedRounds}
              onViewWave={() => onViewWave(wave.id)}
              onAddRound={() => onAddRound(wave.id)}
              showGrabber={showGrabber}
              isDragging={wave.id === draggingWaveId}
              isReordering={isReordering}
              offsetY={wave.id === draggingWaveId ? dragOffsetY : (flashOffsets[wave.id] ?? 0)}
              onGrabberPointerDown={e => handleGrabberPointerDown(e, wave.id)}
              onGrabberPointerMove={handleGrabberPointerMove}
              onGrabberPointerUp={handleGrabberPointerUp}
              rowRef={el => setRowRef(wave.id, el)}
            />
          )
        })}
        {unassignedRounds.length > 0 && (
          <UnassignedRoundsCard rounds={unassignedRounds} />
        )}
      </div>
    </AppSidePanel>
  )
}
