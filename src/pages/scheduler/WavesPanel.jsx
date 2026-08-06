import { useEffect, useRef, useState } from 'react'
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
  onGrabberPointerDown,
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
  // translateY (on any row, not just the dragged one — see the flash-offset
  // rows above) creates a new stacking context for that row, which strands
  // the dragging card's own z-index inside a context scoped to its row alone
  // — sibling rows would then just stack in DOM order, letting whichever row
  // comes later in the list paint over the dragged one. Setting z-index on
  // the row itself (not just the card) keeps the dragged row on top relative
  // to every sibling, regardless of DOM order or which rows are mid-flash.
  const rowStyle = {
    transform: offsetY !== 0 ? `translateY(${offsetY}px)` : undefined,
    zIndex: isDragging ? 2 : undefined,
  }

  return (
    <div className="wp-wave-row" ref={rowRef} style={rowStyle}>
      <div className={cardClass}>
        <div className="wp-wave-header">
          <div className="wp-wave-header-text">
            <div className="wp-wave-name">{wave.name}</div>
            <div className="wp-wave-sub">{roundCount} Round{roundCount === 1 ? '' : 's'}</div>
          </div>
          <div className="wp-wave-header-actions">
            {/* Add Round and View Wave both stay out of the header while
                reordering, same as the rounds list below — one less thing
                competing for attention while you're just trying to see the
                waves and aim a drop. */}
            {!isReordering && (
              <>
                <GSButton type="black" size="primary" isFocusable buttonIcon={faPlus} title="Add Round" onClick={onAddRound} />
                <GSButton type="light-grey icon" size="primary" isFocusable buttonIcon={faPen} onClick={onViewWave} />
              </>
            )}
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
        >
          <GSButton size="secondary" buttonIcon={faGripLines} onClick={e => e.stopPropagation()} />
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
  onStartAddWave, onSetWaveOrder, onViewWave, onAddRound,
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
  // The reorder itself is a straightforward adjacent swap — the dragged card
  // and whichever neighbor it's currently overlapping trade places the
  // moment the pointer crosses the midpoint between them — but that swap
  // only ever touches `draftOrder`, local state private to this component,
  // for as long as the drag is in progress. It used to call all the way up
  // to TournamentSchedulerPage's setWaves on every single threshold crossed,
  // which seemed fine with two waves but fell over with more: that
  // component's got enough of its own derived state (roundAvailableCounts,
  // groupedRoundSections, the whole hole-assignment grid) that recomputing
  // all of it on every swap mid-drag, rather than once at the end, was slow
  // enough to make the drag itself visibly stutter or hang. onSetWaveOrder
  // now only gets called once, on release, with the final order.
  const [draggingWaveId, setDraggingWaveId] = useState(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  // The live-during-a-drag order, as an array of wave ids — null whenever
  // nothing is being dragged, in which case rendering just falls back to the
  // real `waves` prop order directly.
  const [draftOrder, setDraftOrder] = useState(null)
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

  // The order actually rendered below — the live draft while dragging,
  // otherwise just the real prop.
  const displayWaves = draftOrder
    ? draftOrder.map(id => waves.find(w => w.id === id)).filter(Boolean)
    : waves

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
    setDraftOrder(waves.map(w => w.id))
    // move/up are picked up by the window listener below (see the effect) —
    // deliberately NOT setPointerCapture on this element. Capture ties to
    // this specific DOM node, but the moment a swap happens this exact node
    // gets relocated to a new position in the list (React moving it to
    // match the new order) — and that relocation can silently drop the
    // capture, after which every event for the rest of the gesture
    // (crucially pointerup) goes wherever the cursor happens to physically
    // be instead of back here, leaving the drag stuck open forever with no
    // way to release it. A window listener has no such dependency on any
    // one element's position or continued identity.
  }

  function handleGrabberPointerMove(e) {
    if (draggingWaveId == null) return
    const step = measureRowStep(draggingWaveId)
    let offset = e.clientY - dragStartYRef.current
    if (step > 0) {
      // Mutated locally through the loop below, then written back once —
      // needs to reflect each swap immediately so a single fast move that
      // crosses more than one threshold keeps checking against the order
      // *as of the swap just before it*, not the one still in state.
      const order = [...(draftOrder ?? waves.map(w => w.id))]
      let idx = order.indexOf(draggingWaveId)
      const flashes = {}
      let didSwap = false
      while (idx < order.length - 1 && offset > step / 2) {
        const otherId = order[idx + 1]
        order[idx] = otherId
        order[idx + 1] = draggingWaveId
        flashes[otherId] = step
        idx += 1
        offset -= step
        didSwap = true
      }
      while (idx > 0 && offset < -step / 2) {
        const otherId = order[idx - 1]
        order[idx] = otherId
        order[idx - 1] = draggingWaveId
        flashes[otherId] = -step
        idx -= 1
        offset += step
        didSwap = true
      }
      if (didSwap) {
        setDraftOrder(order)
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
    // Skips the parent commit entirely for a plain click/release with no
    // actual swap — no reason to trigger that page's heavier re-render for
    // an order that hasn't changed.
    if (draftOrder && draftOrder.some((id, i) => id !== waves[i]?.id)) {
      onSetWaveOrder(draftOrder)
    }
    setDraggingWaveId(null)
    setDragOffsetY(0)
    setFlashOffsets({})
    setDraftOrder(null)
  }

  // Refs, not direct listener args, because the effect below only
  // re-subscribes when draggingWaveId itself flips — not on every render —
  // so the listener closure would otherwise be stuck on whatever draftOrder/
  // waves looked like at the exact moment the drag started, never seeing a
  // single subsequent swap. Writing the latest function into the ref on
  // every render (not inside the effect) keeps that closure current without
  // tearing down and rebuilding the actual window subscription each time.
  const pointerMoveRef = useRef(() => {})
  const pointerUpRef = useRef(() => {})
  pointerMoveRef.current = handleGrabberPointerMove
  pointerUpRef.current = handleGrabberPointerUp

  useEffect(() => {
    if (draggingWaveId == null) return
    const onMove = e => pointerMoveRef.current(e)
    const onUp = e => pointerUpRef.current(e)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [draggingWaveId])

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
        {displayWaves.map(wave => {
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
