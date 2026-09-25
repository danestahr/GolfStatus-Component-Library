import {
  faPlus,
  faPen,
  faGripLines,
} from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import AppSidePanel from '../../components/AppSidePanel'
import { useDragToReorder } from '../../gs-lib/hooks/useDragToReorder.js'
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
  // Drag-to-reorder (useDragToReorder), driven by pointer events on the
  // grabber rather than native HTML5 drag-and-drop — that API only
  // recognizes a drag after the cursor has moved a browser-defined
  // threshold, never fires from touch at all, and (per its own quirks)
  // freezes its ghost preview on a stale snapshot taken before any state
  // update can react to it. Pointer events give full control from the very
  // first press: draggingWaveId flips the instant you press the grabber (no
  // movement needed), works identically for mouse and touch.
  //
  // The reorder itself is a straightforward adjacent swap — the dragged card
  // and whichever neighbor it's currently overlapping trade places the
  // moment the pointer crosses the midpoint between them — but that swap
  // only ever touches the hook's own draft order, local to the hook, for as
  // long as the drag is in progress. It used to call all the way up to
  // TournamentSchedulerPage's setWaves on every single threshold crossed,
  // which seemed fine with two waves but fell over with more: that
  // component's got enough of its own derived state (roundAvailableCounts,
  // groupedRoundSections, the whole hole-assignment grid) that recomputing
  // all of it on every swap mid-drag, rather than once at the end, was slow
  // enough to make the drag itself visibly stutter or hang. onSetWaveOrder
  // now only gets called once, on release, with the final order.
  const {
    draggingId: draggingWaveId,
    dragOffsetY,
    flashOffsets,
    displayOrder: displayWaveIds,
    isReordering,
    rowsBoxRef: wpBodyRef,
    setRowRef,
    handleGrabberPointerDown,
  } = useDragToReorder(waves.map(w => w.id), onSetWaveOrder)

  // The order actually rendered below — the live draft while dragging,
  // otherwise just the real prop.
  const displayWaves = displayWaveIds.map(id => waves.find(w => w.id === id)).filter(Boolean)

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
