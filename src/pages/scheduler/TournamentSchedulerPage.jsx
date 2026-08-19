import { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faUsersViewfinder,
  faBolt,
  faGear,
  faFloppyDisk,
  faUpRightAndDownLeftFromCenter,
  faDownLeftAndUpRightToCenter,
  faCircleXmark,
  faRetweet,
  faArrowsRotate,
  faCircleNotch,
  faTrash,
  faPlus,
  faListCheck,
  faFolderOpen,
  faPen,
  faClone,
  faCircleCheck,
  faListOl,
  faWater,
  faShuffle,
  faTriangleExclamation,
  faArrowRight,
  fa1,
  faGripLines,
  faLink,
  faLinkSlash,
} from '@fortawesome/free-solid-svg-icons'
import GSinput from '../../gs-lib/components/gs-input'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GStoggle from '../../gs-lib/components/gs-toggle'
import GSButton from '../../gs-lib/components/gs-button'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import GSLoadingSpinnerOverlay from '../../gs-lib/components/gs-loading-spinner-overlay'
import AppSidePanel from '../../components/AppSidePanel'
import CreateRoundPanel from './CreateRoundPanel'
import WavesPanel from './WavesPanel'
import AddWavePanel from './AddWavePanel'
import WaveRoundsPanel from './WaveRoundsPanel'
import SwapRoundWavePanel from './SwapRoundWavePanel'
import DeleteWavePanel from './DeleteWavePanel'
import WaveRoundNav from './WaveRoundNav'
import LinkedRoundLabelPanel from './LinkedRoundLabelPanel'
import { HOLE_DATA, TEAM_DATA, SORTED_TEAMS, TOURNAMENTS } from '../../data/mockSchedulerTournaments'
import './TournamentSchedulerPage.scss'

const MIN_GROUPS_PER_HOLE = 0
const MAX_GROUPS_PER_HOLE = 3

function groupLetter(index) {
  return String.fromCharCode(65 + index)
}

function getSlotIds(holeNumber, groupCount) {
  return Array.from({ length: groupCount }, (_, i) => `${holeNumber}-${groupLetter(i)}`)
}

// Round Setup: the four ways a tournament's rounds can relate to each other —
// 'hybrid' isn't its own picker tile any more (see WAVE_SCOPE_OPTIONS below),
// but its entry stays here since a tournament already saved with it still
// needs a title/icon/description for the landing view's summary banner.
// Each format's description is split into two lines: the first covers how
// the round(s) are played, the second covers how that shapes player
// availability (single round vs. all rounds vs. one round vs. multiple).
const ROUND_FORMAT_OPTIONS = [
  {
    value: 'single',
    icon: fa1,
    title: 'Single Round',
    playDescription: 'Tournament is one round.',
    availabilityDescription: 'Players and teams are available to play in the round.',
  },
  {
    value: 'rounds',
    icon: faListOl,
    title: 'Sequence',
    playDescription: 'Tournament is multiple rounds, played sequentially.',
    availabilityDescription: 'Players and teams play in every round.',
  },
  {
    value: 'waves',
    icon: faWater,
    title: 'Wave',
    playDescription: 'Multiple rounds are played simultaneously or sequentially.',
    availabilityDescription: 'Players and teams play in one round.',
  },
  {
    value: 'hybrid',
    icon: faShuffle,
    title: 'Hybrid Wave',
    playDescription: 'Multiple waves are played simultaneously or sequentially.',
    availabilityDescription: 'Players will play in one round per wave.',
  },
]

// Round Setup is a three-step pick rather than one flat screen: first Single
// vs Multiple Rounds (below), then — once Multiple Rounds is chosen — which
// of the two multi-round formats (reusing ROUND_FORMAT_OPTIONS' own
// 'rounds'/'waves' entries so their copy/values stay a single source of
// truth), and finally — only once Wave is chosen — the assignment-scope
// question below (WAVE_SCOPE_OPTIONS). There's no top-level Hybrid Wave tile
// any more: what used to be a separate format is now that third step's other
// answer, since the two only ever differed in assignment scope, not in how
// rounds/waves themselves get set up.
const ROUND_TYPE_OPTIONS = [
  { value: 'single', iconText: '1', title: 'Single Round', description: 'Tournament is one round.' },
  { value: 'multiple', iconText: '2+', title: 'Multiple Rounds', description: 'Tournament is more than one round.' },
]

const MULTI_ROUND_FORMAT_OPTIONS = ROUND_FORMAT_OPTIONS.filter(o => o.value === 'rounds' || o.value === 'waves')

// Wave format's own follow-up question, offered only once Wave is picked
// above — the two answers are what used to be two separate top-level formats
// (plain Wave vs Hybrid Wave), collapsed into one Wave format's own
// sub-choice since that's all they ever differed on. Reuses the existing
// 'waves'/'hybrid' savedRoundFormat values so every downstream
// formatManagesWaves/waveFormatExclusive/hybridWaveScoped check keeps working
// unchanged — only the picker UI that leads to them has changed.
const WAVE_SCOPE_OPTIONS = [
  {
    value: 'waves',
    icon: faWater,
    title: 'One Round',
    description: 'Players and teams are assigned to one round for the whole tournament.',
  },
  {
    value: 'hybrid',
    icon: faShuffle,
    title: 'One Round Per Wave',
    description: 'Players and teams are assigned to one round in each wave.',
  },
]

// Waves and Hybrid both organize rounds into waves (see WavesPanel) — the
// only real difference between them is assignment scope (see
// waveFormatExclusive/hybridWaveScoped below), not the setup flow — so both
// formats get the "Manage Waves" entry point instead of the plain "Add
// Round" flow.
function formatManagesWaves(format) {
  return format === 'waves' || format === 'hybrid'
}

// ── Sub-components ─────────────────────────────────────────────────────────────

// advancesToNextStep flags the tiles that move on to another question
// (Multiple Rounds, Wave) rather than already being a complete answer
// (Single Round, Sequence, either Assign Players & Teams tile) — those get a
// right arrow so it's clear tapping them isn't final; every other tile shows
// no end icon at all.
function RoundFormatOption({ icon, iconText, title, playDescription, availabilityDescription, isSelected, isDisabled, disabledReason, advancesToNextStep, onClick }) {
  return (
    <div
      className={`sched-format-option${isSelected ? ' sched-format-option--selected' : ''}${isDisabled ? ' sched-format-option--disabled' : ''}`}
      onClick={isDisabled ? undefined : onClick}
    >
      <div className="sched-format-option-icon">
        {icon ? <FontAwesomeIcon icon={icon} /> : <span className="sched-format-option-icon-text">{iconText}</span>}
      </div>
      <div className="sched-format-option-text">
        <div className="sched-format-option-title">{title}</div>
        {isDisabled ? (
          <div className="sched-format-option-desc">{disabledReason}</div>
        ) : (
          // First line covers how the round(s) are played, second covers how
          // that shapes player availability.
          <>
            {playDescription && <div className="sched-format-option-desc">{playDescription}</div>}
            {availabilityDescription && <div className="sched-format-option-desc">{availabilityDescription}</div>}
          </>
        )}
      </div>
      {!isDisabled && advancesToNextStep && (
        <div className="sched-format-option-end-icon">
          <FontAwesomeIcon icon={faArrowRight} />
        </div>
      )}
    </div>
  )
}

function AssignmentSlot({ slotId, assignment, isSelected, isHighlighted, hasActiveSelection, isFlashing, pendingKind, onSlotClick, onSwap }) {
  const occupied = !!assignment
  const team = occupied ? TEAM_DATA.find(t => t.name === assignment) : null
  const isPending = !!pendingKind

  let slotClass = 'sched-slot'
  if (occupied) slotClass += ' sched-slot--occupied'
  if (isSelected) slotClass += ' sched-slot--selected'
  if (isHighlighted && !isSelected) slotClass += ' sched-slot--highlighted'
  if (isFlashing) slotClass += ' sched-slot--flash'
  if (isPending) slotClass += ` sched-slot--pending sched-slot--pending-${pendingKind}`

  return (
    <div className={slotClass} onClick={() => !isPending && onSlotClick(slotId)}>
      {isPending && !occupied && (
        <div className="sched-slot-pending">
          <FontAwesomeIcon icon={faCircleNotch} className="sched-slot-spinner" />
        </div>
      )}
      {!isPending && !occupied && (
        <div className="sched-slot-empty">
          <FontAwesomeIcon icon={faUsersViewfinder} className="sched-slot-icon" />
          <span className="sched-slot-label">{isSelected ? 'Select a Team' : 'Tap to Assign'}</span>
        </div>
      )}
      {occupied && (
        <>
          <div className="sched-slot-team">
            <div className="sched-team-name">{team.name} ({team.handicap})</div>
            <div className="sched-team-players">{team.players}</div>
            <div className="sched-team-flight">{team.flight}</div>
          </div>
          {!isSelected && !isPending && (
            <GSButton
              type="transparent white icon"
              isPill
              isFocusable
              buttonIcon={hasActiveSelection ? faRetweet : faCircleXmark}
              onClick={e => { e.stopPropagation(); onSwap(slotId) }}
              style={{ flexShrink: 0, alignSelf: 'center' }}
            />
          )}
          {isPending && (
            <div className="sched-slot-pending-overlay">
              <FontAwesomeIcon icon={faCircleNotch} className="sched-slot-spinner" />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function HoleGrouping({ label, slotIds, assignments, selectedSlot, highlightedSlots, hasActiveSelection, flashSlots, pendingSlots, onSlotClick, onSwap, isOccupied, canRemoveGroup, onRemoveGroup }) {
  return (
    <div className="sched-grouping">
      <div className="sched-grouping-label">{label}</div>
      <div className="sched-grouping-slots">
        {slotIds.map(id => (
          <AssignmentSlot
            key={id}
            slotId={id}
            assignment={assignments[id]}
            isSelected={selectedSlot === id}
            isHighlighted={highlightedSlots.has(id)}
            hasActiveSelection={hasActiveSelection}
            isFlashing={flashSlots.has(id)}
            pendingKind={pendingSlots.get(id)}
            onSlotClick={onSlotClick}
            onSwap={onSwap}
          />
        ))}
      </div>
      {!isOccupied && (
        <div className="sched-grouping-trash">
          <GSButton
            type="transparent icon"
            size="secondary"
            isFocusable
            isDisabled={!canRemoveGroup}
            buttonIcon={faTrash}
            onClick={onRemoveGroup}
          />
        </div>
      )}
    </div>
  )
}

function HoleSection({ hole, courseName, assignments, groupCount, selectedSlot, highlightedSlots, hasActiveSelection, flashSlots, pendingSlots, onSlotClick, onSwap, onAddGroup, onRemoveGroup, isVisible }) {
  if (!isVisible) return null
  const groupLabels = Array.from({ length: groupCount }, (_, i) => groupLetter(i))
  return (
    <div className="sched-hole-section">
      <div className="sched-hole-header">
        <div className="sched-hole-info">
          <span className="sched-hole-title">Hole {hole.number}</span>
          <span className="sched-hole-par">Par {hole.par}</span>
        </div>
        <span className="sched-hole-course">{courseName}</span>
      </div>
      <div className="sched-grouping-list">
        {groupLabels.map((label, i) => {
          const slotId = `${hole.number}-${label}`
          const isLastGroup = i === groupCount - 1
          const isOccupied = !!assignments[slotId]
          const canRemoveGroup = isLastGroup && groupCount > MIN_GROUPS_PER_HOLE && !isOccupied
          return (
            <HoleGrouping
              key={label}
              label={label} slotIds={[slotId]} assignments={assignments}
              selectedSlot={selectedSlot} highlightedSlots={highlightedSlots}
              hasActiveSelection={hasActiveSelection} flashSlots={flashSlots} pendingSlots={pendingSlots}
              onSlotClick={onSlotClick} onSwap={onSwap}
              isOccupied={isOccupied}
              canRemoveGroup={canRemoveGroup} onRemoveGroup={() => onRemoveGroup(hole.number, slotId)}
            />
          )
        })}
        {groupCount < MAX_GROUPS_PER_HOLE && (
          <div className="sched-add-group">
            <GSButton
              type={groupCount === 0 ? 'light-grey' : 'transparent icon'}
              size={groupCount === 0 ? 'primary' : 'secondary'}
              isFocusable
              buttonIcon={faPlus}
              onClick={() => onAddGroup(hole.number)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Only used for tournaments with legacyFilter: true — the original Unassigned
// Filter panel's per-round toggle row.
function FilterRoundCard({ name, roundMeta, courseName, activeRoundName, isActive, assignedCount, availableCount, isExcluded, onToggleExclude }) {
  const meta = roundMeta
  // Draft until the round actually has a hole assignment — status isn't
  // something anyone sets by hand, it just reports whether that's happened
  // yet (see the same computation in RoundListCard below).
  const status = assignedCount > 0 ? 'Ready' : 'Draft'
  return (
    <div className={`sched-filter-round${isActive ? ' sched-filter-round--active' : ''}`}>
      <div className="sched-filter-round-details">
        <div className="sched-filter-round-group">
          <div className="sched-filter-round-name">{name}</div>
          <div className="sched-filter-round-sub">{meta.format}</div>
        </div>
        <div className="sched-filter-round-group">
          <div className="sched-filter-round-sub">{meta.dateTime}</div>
          <div className="sched-filter-round-sub">{meta.startType}</div>
        </div>
        <div className="sched-filter-round-sub">{meta.facilityName}</div>
        <div className="sched-filter-round-group">
          <div className="sched-filter-round-sub">{courseName}</div>
          <div className="sched-filter-round-sub">{meta.holes} Holes</div>
        </div>
        <span className={`sched-round-status sched-round-status--${status.toLowerCase()}`}>{status}</span>
      </div>
      <div className="sched-filter-round-side">
        <div className="sched-filter-round-count">{assignedCount} Assigned / {availableCount} Available</div>
        {isActive ? (
          <span className="sched-filter-round-selected">Selected Round</span>
        ) : (
          <GStoggle
            value={isExcluded}
            onClick={onToggleExclude}
            trueDescription={`Hide from ${activeRoundName} Assignments`}
            falseDescription={`Hide from ${activeRoundName} Assignments`}
            rowReverse
          />
        )}
      </div>
    </div>
  )
}

// Landing view for a tournament: one row per round, with its schedule details on
// the left and its actions on the right. Once a round has hole assignments made,
// "Edit Round" gives way to "Start Round" — the setup step is done, so editing the
// round's own info no longer applies here and starting it becomes the live action.
// Shares the info-block markup/classes with FilterRoundCard above.
function RoundListCard({ name, roundMeta, courseName, waveName, hasAssignments, assignedCount, rosterCount, hideRosterCount, onOpenHoleAssignments, onEditRound, onCloneRound }) {
  const meta = roundMeta
  const isFullyAssigned = rosterCount > 0 && assignedCount === rosterCount
  // Draft until the round actually has a hole assignment — nobody sets this
  // by hand, it just reports whether that's happened yet.
  const status = hasAssignments ? 'Ready' : 'Draft'
  return (
    <div className="sched-round-card">
      <div className="sched-filter-round-details">
        <div className="sched-filter-round-group">
          {name && <div className="sched-filter-round-name">{name}</div>}
          <div className="sched-filter-round-sub">{meta.format}</div>
        </div>
        <div className="sched-filter-round-group">
          <div className="sched-filter-round-sub">{meta.dateTime}</div>
          <div className="sched-filter-round-sub">{meta.startType}</div>
        </div>
        <div className="sched-filter-round-sub">{meta.facilityName}</div>
        <div className="sched-filter-round-group">
          <div className="sched-filter-round-sub">{courseName}</div>
          <div className="sched-filter-round-sub">{meta.holes} Holes</div>
        </div>
        {waveName && (
          <span className="sched-wave-badge">
            <FontAwesomeIcon icon={faWater} /> {waveName}
          </span>
        )}
        <span className={`sched-round-status sched-round-status--${status.toLowerCase()}`}>{status}</span>
        {!hideRosterCount && (
          <div className={`sched-round-roster${isFullyAssigned ? ' sched-round-roster--complete' : ''}`}>
            {isFullyAssigned && <FontAwesomeIcon icon={faCircleCheck} />}
            {assignedCount}/{rosterCount} Teams Assigned
          </div>
        )}
      </div>
      <div className="sched-round-card-actions">
        {!hasAssignments && (
          <GSButton type="light-grey" isFocusable buttonIcon={faPen} title="Edit Round" onClick={onEditRound} />
        )}
        <GSButton type="light-grey" isFocusable buttonIcon={faBolt} title="Hole Assignments" onClick={onOpenHoleAssignments} />
        {hasAssignments && (
          <GSButton type="green" isFocusable title="Start Round" onClick={() => {}} />
        )}
        <GSButton type="light-grey icon" size="primary" isFocusable buttonIcon={faClone} title="Copy Round" onClick={onCloneRound} />
      </div>
    </div>
  )
}

// One linked section's rounds (a Round Number group, or a wave's own
// rounds), drag-to-reorder via a grabber — same pointer-driven adjacent-swap
// approach as WavesPanel's own wave list, scaled down to this list's flat
// rows (no header-collapse needed; a round card is already just the one
// row, nothing nested to shrink out of the way while dragging). Reordering
// only ever changes the array `rounds` is rendered in — it never touches
// each round's own (internal, never-shown) Round Letter; onReorder feeds
// roundOrderOverrides, which is the actual source of truth for display
// order from here on.
function RoundGroupList({ rounds, renderRound, onReorder }) {
  const [draggingRound, setDraggingRound] = useState(null)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const [draftOrder, setDraftOrder] = useState(null)
  const [flashOffsets, setFlashOffsets] = useState({})
  const isReordering = draggingRound != null

  const rowRefs = useRef(new Map())
  const dragStartYRef = useRef(0)
  const listRef = useRef(null)

  const displayRounds = draftOrder ?? rounds

  function setRowRef(round, el) {
    if (el) rowRefs.current.set(round, el)
    else rowRefs.current.delete(round)
  }

  function measureRowStep(excludeRound) {
    const gap = listRef.current ? parseFloat(getComputedStyle(listRef.current).rowGap) || 0 : 0
    for (const [round, el] of rowRefs.current) {
      if (round === excludeRound) continue
      return el.getBoundingClientRect().height + gap
    }
    return 0
  }

  function handleGrabberPointerDown(e, round) {
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    dragStartYRef.current = e.clientY
    setDraggingRound(round)
    setDragOffsetY(0)
    setDraftOrder(rounds)
  }

  function handleGrabberPointerMove(e) {
    if (draggingRound == null) return
    const step = measureRowStep(draggingRound)
    let offset = e.clientY - dragStartYRef.current
    if (step > 0) {
      const order = [...(draftOrder ?? rounds)]
      let idx = order.indexOf(draggingRound)
      const flashes = {}
      let didSwap = false
      while (idx < order.length - 1 && offset > step / 2) {
        const other = order[idx + 1]
        order[idx] = other
        order[idx + 1] = draggingRound
        flashes[other] = step
        idx += 1
        offset -= step
        didSwap = true
      }
      while (idx > 0 && offset < -step / 2) {
        const other = order[idx - 1]
        order[idx] = other
        order[idx - 1] = draggingRound
        flashes[other] = -step
        idx -= 1
        offset += step
        didSwap = true
      }
      if (didSwap) {
        setDraftOrder(order)
        setFlashOffsets(prev => ({ ...prev, ...flashes }))
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
      const min = -idx * step
      const max = (order.length - 1 - idx) * step
      offset = Math.min(Math.max(offset, min), max)
    }
    setDragOffsetY(offset)
    dragStartYRef.current = e.clientY - offset
  }

  function handleGrabberPointerUp() {
    if (draftOrder && draftOrder.some((round, i) => round !== rounds[i])) {
      onReorder(draftOrder)
    }
    setDraggingRound(null)
    setDragOffsetY(0)
    setFlashOffsets({})
    setDraftOrder(null)
  }

  const pointerMoveRef = useRef(() => {})
  const pointerUpRef = useRef(() => {})
  pointerMoveRef.current = handleGrabberPointerMove
  pointerUpRef.current = handleGrabberPointerUp

  useEffect(() => {
    if (draggingRound == null) return
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
  }, [draggingRound])

  // Same as WavesPanel's wave grabber: reordering only means anything once
  // there's a second row to reorder against, so a lone round in its group
  // gets no grabber to drag.
  const showGrabber = rounds.length >= 2

  return (
    <div ref={listRef} className={`sched-round-group-list${isReordering ? ' sched-round-group-list--reordering' : ''}`}>
      {displayRounds.map(r => {
        const isDragging = r === draggingRound
        const rowStyle = {
          transform: (isDragging ? dragOffsetY : (flashOffsets[r] ?? 0)) !== 0
            ? `translateY(${isDragging ? dragOffsetY : flashOffsets[r]}px)`
            : undefined,
          zIndex: isDragging ? 2 : undefined,
        }
        return (
          <div key={r} ref={el => setRowRef(r, el)} className="sched-round-row" style={rowStyle}>
            <div className={`sched-round-row-inner${isDragging ? ' sched-round-row-inner--dragging' : ''}`}>
              <div className="sched-round-row-card">
                {renderRound(r)}
              </div>
              {showGrabber && (
                <div className="sched-round-row-grabber" onPointerDown={e => handleGrabberPointerDown(e, r)}>
                  <GSButton size="secondary" buttonIcon={faGripLines} onClick={e => e.stopPropagation()} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TeamCard({ team, isSelected, isHighlighted, showSwap, isFlashing, isPending, onClick, onSwap }) {
  let cls = 'sched-team-card'
  if (isSelected) cls += ' sched-team-card--selected'
  else if (isHighlighted) cls += ' sched-team-card--highlighted'
  if (isFlashing) cls += ' sched-team-card--flash'
  if (isPending) cls += ' sched-team-card--pending'
  return (
    <div className={cls} onClick={isPending ? undefined : onClick}>
      <div className="sched-team-info">
        <div className="sched-team-name">{team.name} ({team.handicap})</div>
        <div className="sched-team-players">{team.players}</div>
        <div className="sched-team-flight">{team.flight}</div>
      </div>
      {showSwap && !isPending && (
        <GSButton
          type="grey icon"
          isPill
          isFocusable
          buttonIcon={faRetweet}
          onClick={e => { e.stopPropagation(); onSwap() }}
          style={{ flexShrink: 0, alignSelf: 'center' }}
        />
      )}
      {isPending && (
        <div className="sched-team-card-pending">
          <FontAwesomeIcon icon={faCircleNotch} className="sched-team-card-spinner" />
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function TournamentSchedulerPage() {
  const { tournamentId } = useParams()
  const tournament = TOURNAMENTS.find(t => t.id === tournamentId) ?? TOURNAMENTS[0]
  const COURSE_NAME = tournament.courseName

  // Rounds created from the Add Round form, merged on top of the tournament's
  // seeded mock rounds — kept separate so a freshly created round doesn't have
  // to be written back into the static TOURNAMENTS data.
  const [customRounds, setCustomRounds] = useState({})
  const ROUND_META = { ...tournament.rounds, ...customRounds }
  const ROUNDS = Object.keys(ROUND_META).map(Number).sort((a, b) => a - b)
  const hasRounds = ROUNDS.length > 0
  const hasMultipleRounds = ROUNDS.length >= 2

  // Older tournaments keep the original per-round Unassigned Filter panel; newer
  // ones use the Rounds & Scorecards Settings toggle instead.
  const useLegacyFilter = !!tournament.legacyFilter

  // A round's registered roster — its own slice of the shared team pool when the
  // round defines one (e.g. simultaneous rounds at a 36-hole facility, each
  // fielding only half the event), otherwise the whole tournament's roster. This
  // is what keeps a large multi-round/multi-wave event from dumping its entire
  // field into every round's Unassigned list.
  function teamsForRound(r) {
    const meta = ROUND_META[r]
    if (meta?.teamCount !== undefined) {
      const offset = meta.rosterOffset ?? 0
      return SORTED_TEAMS.slice(offset, offset + meta.teamCount)
    }
    return SORTED_TEAMS.slice(0, tournament.teamCount ?? SORTED_TEAMS.length)
  }

  // Round Number is the user-facing linking key (see CreateRoundPanel's own
  // Round Number field) — separate from a round's internal ROUND_META key,
  // which stays a unique per-round id regardless of how many rounds share the
  // same displayed number. Falls back to the round's own key for any round
  // that never set one (every pre-existing seeded round), so numbering reads
  // exactly as it always has until a tournament actually starts linking
  // rounds together.
  function roundNumberOf(r) {
    return ROUND_META[r]?.roundNumber ?? r
  }

  // Every round sharing r's Round Number, r included — length > 1 is what
  // "linked" means: two rounds that happen at the same time, grouped in the
  // round list the same way waves used to group rounds into one section.
  function roundGroupMates(r) {
    const num = roundNumberOf(r)
    return ROUNDS.filter(other => roundNumberOf(other) === num)
  }

  // roundGroupMates minus r itself — a Round Number is essentially a wave:
  // rounds sharing one are exclusive to each other the same way wave-mates
  // are (see waveMateRounds/hybridWaveScoped below), regardless of
  // savedRoundFormat, since round-linking is how a format-less tournament
  // gets this same "one of these, not both" behavior. Empty for an unlinked
  // round — nothing to be exclusive with.
  function roundNumberMates(r) {
    return roundGroupMates(r).filter(other => other !== r)
  }

  // First Round Letter not already claimed at a given Round Number, excluding
  // excludeRound itself — same pool/logic as CreateRoundPanel's own
  // availableLettersFor, reimplemented here since a round can also pick up a
  // new Round Number/Letter pair from outside that form entirely (see
  // assignRoundToWaveGroup below).
  function nextAvailableRoundLetter(number, excludeRound) {
    const usedByOthers = new Set(
      ROUNDS.filter(r => r !== excludeRound && roundNumberOf(r) === number).map(r => ROUND_META[r]?.roundLetter ?? 'A')
    )
    return ['A', 'B', 'C', 'D', 'E', 'F'].find(letter => !usedByOthers.has(letter)) ?? 'A'
  }

  // Closes the gap a departing round leaves behind in its old Round Number
  // group — e.g. A/B/C losing B should read as A/B afterward, not A/_/C.
  // excludeRound is the round that just left (or is about to); its own
  // ROUND_META is left untouched here, only its former groupmates'.
  // Existing relative order (by current letter) is preserved so compacting
  // never visibly reshuffles which round reads as "first" in the group —
  // only the departing round's own gap actually moves anyone. Returns a
  // {[round]: newMeta} map of just the rounds that actually changed, ready
  // to spread straight into a setCustomRounds update.
  function compactRoundNumberGroup(number, excludeRound) {
    const mates = ROUNDS
      .filter(r => r !== excludeRound && roundNumberOf(r) === number)
      .sort((a, b) => (ROUND_META[a]?.roundLetter ?? 'A').localeCompare(ROUND_META[b]?.roundLetter ?? 'A'))
    const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
    const changes = {}
    mates.forEach((r, i) => {
      const letter = LETTERS[i] ?? 'A'
      if ((ROUND_META[r]?.roundLetter ?? 'A') !== letter) {
        changes[r] = { ...ROUND_META[r], roundLetter: letter }
      }
    })
    return changes
  }

  // Keeps a round's own Round Number/Letter in step with which wave it
  // actually belongs to — a wave is exactly the same "one of these, not
  // both" grouping a shared Round Number is (see roundGroupMates above), so
  // a round joining a wave that already has other rounds in it should read
  // as linked to them (e.g. "Round 1A"/"Round 1B") rather than keeping
  // whatever standalone number it happened to have before the move. A wave
  // with nothing else in it yet has no number of its own to adopt, so the
  // round's existing Round Number/Letter are left alone.
  function assignRoundToWaveGroup(round, waveId) {
    const mates = waves.find(w => w.id === waveId)?.roundIds ?? []
    if (mates.length === 0) return
    const oldNumber = roundNumberOf(round)
    const number = roundNumberOf(mates[0])
    const letter = nextAvailableRoundLetter(number, round)
    setCustomRounds(prev => ({
      ...prev,
      ...compactRoundNumberGroup(oldNumber, round),
      [round]: { ...ROUND_META[round], roundNumber: number, roundLetter: letter },
    }))
  }

  function roundName(r) {
    // A custom Round Label (see CreateRoundPanel) always wins outright —
    // stored pre-formatted as "Round <label>" — over the auto Round Letter
    // suffix below, whether or not this round is actually grouped with others.
    if (ROUND_META[r]?.name) return ROUND_META[r].name
    const number = roundNumberOf(r)
    // The A/B/C suffix (this round's own internal Round Letter — see
    // CreateRoundPanel) only earns its place once there's actually another
    // round sharing this Round Number to tell apart — a solo round (every
    // sequenced/wave/single round, and any round-number-linking round that
    // isn't actually linked to anything) just reads as "Round 1" same as ever.
    return roundGroupMates(r).length > 1 ? `Round ${number}${ROUND_META[r]?.roundLetter ?? 'A'}` : `Round ${number}`
  }

  // The round list item's own name, as distinct from roundName above — a
  // solo round's card already sits right under its group's own "Round 1"
  // header (see the Round Number group rendering further down), so
  // repeating that same plain number on the card too just doubles it up
  // with nothing gained; it only earns a name of its own once there's
  // something to actually distinguish (a custom Round Label, or a real
  // Round Letter once a second round joins the group). Every other place
  // roundName is used (panel titles, nav labels, the Link-to-Round choice
  // grid, search) keeps the plain fallback — those aren't sitting under a
  // group header repeating it back.
  function roundCardName(r) {
    return ROUND_META[r]?.name || roundGroupMates(r).length > 1 ? roundName(r) : ''
  }

  // "A, B, or C" for a group's own header description below — reads off
  // each round's actual Round Letter rather than just the group's size, so
  // it stays accurate as rounds join or leave (see the group header
  // rendering further down).
  function formatOxfordList(items) {
    if (items.length <= 1) return items[0] ?? ''
    if (items.length === 2) return `${items[0]} or ${items[1]}`
    return `${items.slice(0, -1).join(', ')}, or ${items[items.length - 1]}`
  }

  function roundCourse(r) {
    return ROUND_META[r]?.course ?? COURSE_NAME
  }

  // Sortable timestamp out of a round's display dateTime (e.g. "8:00 AM on
  // Sat Aug 15, 2026") — reverses CreateRoundPanel's formatRoundDateTime by
  // dropping the "on <weekday>" and reordering into something Date can parse
  // ("Aug 15, 2026 8:00 AM"). Missing/unparseable dates sort last rather than
  // collapsing to the top with everything else that's unscheduled.
  function roundDateTimeMs(r) {
    const match = ROUND_META[r]?.dateTime?.match(/^(.+?) on (?:\S+ )(.+)$/)
    if (!match) return Infinity
    const [, time, dateStr] = match
    const ms = new Date(`${dateStr} ${time}`).getTime()
    return Number.isNaN(ms) ? Infinity : ms
  }

  function byUpcoming(a, b) {
    return roundDateTimeMs(a.round) - roundDateTimeMs(b.round)
  }

  const [panelOpen, setPanelOpen] = useState(false)
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [panelWidthAnimating, setPanelWidthAnimating] = useState(false)
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  // Round Setup: chooses how this tournament's rounds relate to each other
  // (Rounds/Waves/Hybrid). savedRoundFormat is the committed selection shown on
  // the landing view; roundFormat is the panel's own draft so reopening it to
  // change the choice doesn't affect the summary until Save is pressed.
  // formatChangeWarningOpen gates a second confirmation step in the same panel —
  // changing the format once the tournament already has rounds (or waves) set
  // up under the old one could reorganize or orphan them, so Save is
  // intercepted once to surface that consequence before committing.
  const [roundSetupPanelOpen, setRoundSetupPanelOpen] = useState(false)
  const [roundFormat, setRoundFormat] = useState(null)
  const [savedRoundFormat, setSavedRoundFormat] = useState(() => tournament.savedRoundFormat ?? null)
  // Round Number linking (as opposed to Wave assignment) only applies to a
  // tournament that never went through Round Setup at all — one that
  // already has a format (Waves included) still gets its round numbers
  // assigned plainly/in sequence.
  const roundLinkingEnabled = !savedRoundFormat
  const [formatChangeWarningOpen, setFormatChangeWarningOpen] = useState(false)
  // Round Setup's own three-step navigation: 'type' is the Single/Multiple
  // Rounds picker, 'format' is the Sequence/Wave picker offered only once
  // Multiple Rounds is chosen, and 'wave-scope' is the One Round/One Round
  // Per Wave picker offered only once Wave is chosen there. Each step's own
  // back arrow (see backToRoundTypeStep/backToFormatStep below) steps back
  // one at a time rather than closing the panel outright. Editing an existing
  // format always re-walks the steps rather than dropping straight into
  // 'wave-scope' — the one exception is 'type' itself, skipped straight to
  // 'format' when the tournament already has 2+ rounds, since Single Round is
  // disabled (and so unreachable) in that case anyway.
  const [roundSetupStep, setRoundSetupStep] = useState('type')

  function openRoundSetup() {
    setRoundFormat(savedRoundFormat)
    setFormatChangeWarningOpen(false)
    setRoundSetupStep(hasMultipleRounds ? 'format' : 'type')
    setRoundSetupPanelOpen(true)
  }

  // Single commits immediately (same as picking any format tile always has) —
  // Multiple Rounds has no format of its own, so it just advances to the next
  // question instead. Clears a stale 'single' draft when backing into Multiple
  // Rounds so neither of the format tiles reads as pre-selected.
  function pickRoundType(type) {
    if (type === 'single') {
      pickRoundFormat('single')
      return
    }
    setRoundFormat(prev => (prev === 'single' ? null : prev))
    setRoundSetupStep('format')
  }

  function backToRoundTypeStep() {
    setRoundSetupStep('type')
  }

  function backToFormatStep() {
    setRoundSetupStep('format')
  }

  // Sequence commits (or drafts) same as any other tile always has — but Wave
  // isn't a complete answer on its own any more, so picking it just advances
  // to the assignment-scope question instead. Carries over an already-chosen
  // scope (waves or hybrid) if there is one — e.g. re-walking the steps to
  // edit a tournament already saved as Hybrid Wave lands back on Wave here —
  // so its answer shows pre-selected on the next screen instead of forcing a
  // reselect of something already chosen.
  function pickMultiRoundFormat(format) {
    if (format === 'waves') {
      setRoundFormat(prev => (formatManagesWaves(prev) ? prev : null))
      setRoundSetupStep('wave-scope')
      return
    }
    pickRoundFormat(format)
  }

  // Nothing to lose yet (no rounds, no waves) once this is false — a format
  // change is free to commit the instant a tile is tapped. Once real setup
  // exists, tapping a tile still commits immediately unless it's actually
  // changing the format, in which case the warning step below intercepts it
  // first — there's no separate Save; every terminal tile IS the save.
  function hasExistingRoundSetup() {
    return hasRounds || waves.length > 0
  }

  function pickRoundFormat(format) {
    setRoundFormat(format)
    const isChangingFormat = !!savedRoundFormat && format !== savedRoundFormat
    if (hasExistingRoundSetup() && isChangingFormat) {
      setFormatChangeWarningOpen(true)
      return
    }
    commitRoundFormat(format)
  }

  function cancelFormatChangeWarning() {
    setFormatChangeWarningOpen(false)
  }

  // Drives the side panel's own top-left chevron (see AppSidePanel's onBack)
  // instead of a per-step arrow inside each GSActionBar — steps back one
  // screen at a time through Round Setup's flow, only actually closing the
  // panel once there's nowhere left to step back to. Mirrors openRoundSetup's
  // own entry logic: 'format' is a true first step (nothing to back into)
  // whenever 'type' was skipped for having 2+ rounds already.
  function handleRoundSetupBack() {
    if (formatChangeWarningOpen) {
      cancelFormatChangeWarning()
    } else if (roundSetupStep === 'wave-scope') {
      backToFormatStep()
    } else if (roundSetupStep === 'format' && !hasMultipleRounds) {
      backToRoundTypeStep()
    } else {
      setRoundSetupPanelOpen(false)
    }
  }

  function commitRoundFormat(format = roundFormat) {
    // Based on rounds actually existing (not on whether a format was chosen
    // before) — e.g. picking Waves, adding a wave, then switching to Rounds
    // before ever creating a round inside it should still count as "no rounds
    // yet" and flow straight into Create Round.
    const isFirstRound = !hasRounds
    // Waves and Hybrid both organize rounds into waves — the only real
    // difference between them is assignment scope (Waves keeps a team
    // exclusive to one wave; Hybrid lets a team play in more than one), not
    // the setup flow — so picking either one drops straight into the Waves
    // panel instead of the plain Add Round flow.
    const enteringWaves = formatManagesWaves(format)
    const leavingWaves = formatManagesWaves(savedRoundFormat) && !formatManagesWaves(format)
    if (leavingWaves) {
      // Waves scope which teams can be assigned where — dropping them means
      // every team goes back to being available for assignment in any round.
      setWaves([])
      setAllowMultipleAssignments(true)
    }
    setSavedRoundFormat(format)
    setFormatChangeWarningOpen(false)
    setRoundSetupPanelOpen(false)
    if (enteringWaves) {
      // Waves has its own management panel instead of dropping straight into
      // Create Round — rounds only get created/linked from inside a wave.
      setWavesPanelOpen(true)
    } else if (isFirstRound) {
      // No rounds exist yet — flow straight into creating the first one
      // instead of stranding the user back on the (still-empty) overview.
      openCreateRoundPanel()
    }
  }

  // Add Round: the Create Round form itself lives in its own component — this
  // page just owns where the created round lands. createRoundTargetWaveId is
  // set when Add Round was triggered from inside a specific wave, so the new
  // round gets linked into that wave once saved — Waves/Hybrid's own top-level
  // Add Round button also lets the form's wave quick-select change this while
  // open. createRoundOpenedFromWave is captured once at open time (separately
  // from the editable target) purely to keep the panel's overlay/transition
  // styling stable regardless of what the quick-select is changed to.
  const [createRoundPanelOpen, setCreateRoundPanelOpen] = useState(false)
  const [createRoundTargetWaveId, setCreateRoundTargetWaveId] = useState(null)
  const [createRoundOpenedFromWave, setCreateRoundOpenedFromWave] = useState(false)
  // Set instead of createRoundTargetWaveId when the panel was opened via a
  // round's own "Edit Round" action (rather than to create a new one) — the
  // panel pre-fills from this round's current ROUND_META and, on save,
  // overwrites it in place rather than appending a new round number. Editing
  // never touches wave assignment (that's WaveRoundsPanel's job), so the
  // Wave quick-select stays hidden whenever this is set.
  const [editingRoundNumber, setEditingRoundNumber] = useState(null)
  // Set when the panel was opened via the Linked/Unlinked choice below —
  // unlike createRoundOpenedFromWave's panel, that one closes itself before
  // this one opens (it has nothing left to show once the choice is made),
  // so there's no longer anything else on screen to carry the dim overlay;
  // this only ever suppresses the slide-in transition, keeping the swap
  // feeling like one continuous panel rather than a close-then-reopen.
  const [createRoundOpenedFromLinkChoice, setCreateRoundOpenedFromLinkChoice] = useState(false)
  // Seeds the form's Round Number field with a specific already-existing
  // number (see linkToRoundNumber below) instead of the next unused one —
  // null means "leave it at the usual default."
  const [createRoundInitialNumber, setCreateRoundInitialNumber] = useState(null)
  // Set when the panel was opened to duplicate an existing round (see
  // handleCloneRoundClick/chooseUnlinkedRound/linkToRoundNumber below)
  // instead of creating a blank one — the form pre-fills every field from
  // this round's current ROUND_META, same as editing does, but Save still
  // appends a new round rather than overwriting it.
  const [duplicateFromMeta, setDuplicateFromMeta] = useState(null)

  function openCreateRoundPanel(targetWaveId = null, initialNumber = null, openedFromLinkChoice = false, duplicateFromRound = null) {
    setEditingRoundNumber(null)
    setCreateRoundTargetWaveId(targetWaveId)
    setCreateRoundOpenedFromWave(!!targetWaveId)
    setCreateRoundInitialNumber(initialNumber)
    setCreateRoundOpenedFromLinkChoice(openedFromLinkChoice)
    setDuplicateFromMeta(duplicateFromRound != null ? ROUND_META[duplicateFromRound] : null)
    setCreateRoundPanelOpen(true)
  }

  function openEditRoundPanel(round) {
    setEditingRoundNumber(round)
    setCreateRoundTargetWaveId(null)
    setCreateRoundOpenedFromWave(false)
    setDuplicateFromMeta(null)
    setCreateRoundPanelOpen(true)
  }

  function closeCreateRoundPanel() {
    setCreateRoundPanelOpen(false)
    setCreateRoundTargetWaveId(null)
    setCreateRoundOpenedFromWave(false)
    setEditingRoundNumber(null)
    setCreateRoundInitialNumber(null)
    setCreateRoundOpenedFromLinkChoice(false)
    setDuplicateFromMeta(null)
  }

  // Round Number linking's own guided picker — shown before CreateRoundPanel
  // for Copy Round (see handleCloneRoundClick below), since a duplicate
  // needs its own Round Number decided same as any other new round would —
  // silently inheriting the original's would either double up an existing
  // link or leave the two indistinguishable with no chance to reconsider.
  // 'choice' offers Linked/Unlinked; 'target' (skipped entirely when
  // exactly one Round Number already exists — see chooseLinkedRound) lets a
  // Linked choice pick which existing Round Number to share. Add Round
  // itself no longer goes through this picker at all — every round is
  // always shown grouped by its own Round Number now (see
  // roundNumberGroupedSections), solo groups included, so "Add Round" only
  // ever needs to mean "a brand new, not-yet-linked-to-anything round" —
  // linking one into an existing group instead is what each group's own
  // Add Course shortcut is for (see handleAddRoundToGroupClick).
  // addRoundTargetWaveId carries a wave-scoped Copy Round through the same
  // picker.
  const [addRoundChoicePanelOpen, setAddRoundChoicePanelOpen] = useState(false)
  const [addRoundChoiceStep, setAddRoundChoiceStep] = useState('choice')
  const [cloningRound, setCloningRound] = useState(null)
  const [addRoundTargetWaveId, setAddRoundTargetWaveId] = useState(null)

  // Always heads straight into a blank CreateRoundPanel — no Linked/Unlinked
  // ask (see the picker's own comment above) — landing on the next unused
  // Round Number of its own (CreateRoundPanel's own nextRoundNumber default,
  // since initialNumber is left unset here) rather than joining any
  // existing group.
  function handleAddRoundClick(targetWaveId = null) {
    openCreateRoundPanel(targetWaveId)
  }

  function handleCloneRoundClick(round) {
    setCloningRound(round)
    setAddRoundTargetWaveId(null)
    setAddRoundChoiceStep('choice')
    setAddRoundChoicePanelOpen(true)
  }

  // Round group header's own Add Round shortcut: unlike handleCloneRoundClick,
  // the group a new round belongs to is already known from context (this is
  // its section), so there's nothing left for the Linked/Unlinked picker to
  // ask — this goes straight into CreateRoundPanel pre-linked to the group,
  // duplicating its last round the same way Copy Round would.
  function handleAddRoundToGroupClick(section) {
    const source = section.rounds[section.rounds.length - 1]
    if (source === undefined) return
    const number = section.kind === 'roundNumber' ? section.number : roundNumberOf(source)
    openCreateRoundPanel(section.waveId ?? null, number, false, source)
  }

  function closeAddRoundChoicePanel() {
    setAddRoundChoicePanelOpen(false)
    setAddRoundChoiceStep('choice')
    setCloningRound(null)
    setAddRoundTargetWaveId(null)
  }

  function chooseUnlinkedRound() {
    const source = cloningRound
    const targetWaveId = addRoundTargetWaveId
    closeAddRoundChoicePanel()
    openCreateRoundPanel(targetWaveId, null, true, source)
  }

  function chooseLinkedRound() {
    if (roundNumberGroups.length === 1) {
      linkToRoundNumber(roundNumberGroups[0].number)
    } else {
      setAddRoundChoiceStep('target')
    }
  }

  function linkToRoundNumber(number) {
    const source = cloningRound
    const targetWaveId = addRoundTargetWaveId
    closeAddRoundChoicePanel()
    openCreateRoundPanel(targetWaveId, number, true, source)
  }

  function handleCreateRound(roundMeta) {
    // Editing an existing round: overwrite its ROUND_META entry in place
    // (customRounds already overrides tournament.rounds by key, so this works
    // whether the round was seeded or created earlier) — nothing else about
    // it (assignments, group counts, wave membership) changes. Its Round
    // Letter is always decided here rather than trusted from the form
    // (which has no visibility into any other round's letter): unchanged if
    // its Round Number didn't move, or the next free letter in its new
    // group if it did — with the group it left compacted behind it (see
    // compactRoundNumberGroup) so it doesn't leave a gap for someone else
    // to notice (e.g. A/B/C losing B should read as A/B afterward, not A/_/C).
    if (editingRoundNumber != null) {
      const oldNumber = roundNumberOf(editingRoundNumber)
      const numberChanged = roundMeta.roundNumber !== oldNumber
      const roundLetter = numberChanged
        ? nextAvailableRoundLetter(roundMeta.roundNumber, editingRoundNumber)
        : (ROUND_META[editingRoundNumber]?.roundLetter ?? 'A')
      setCustomRounds(prev => ({
        ...prev,
        ...(numberChanged ? compactRoundNumberGroup(oldNumber, editingRoundNumber) : {}),
        [editingRoundNumber]: { ...roundMeta, roundLetter },
      }))
      closeCreateRoundPanel()
      return
    }
    const nextRound = ROUNDS.length ? Math.max(...ROUNDS) + 1 : 1
    // Same reasoning as the editing branch above — decided here, not
    // trusted from the form, since only this component can see whether a
    // brand new round is joining an already-existing group.
    const roundLetter = nextAvailableRoundLetter(roundMeta.roundNumber, null)
    setCustomRounds(prev => ({ ...prev, [nextRound]: { ...roundMeta, roundLetter } }))
    setAssignmentsByRound(prev => ({ ...prev, [nextRound]: {} }))
    setGroupCountsByRound(prev => ({ ...prev, [nextRound]: Object.fromEntries(HOLE_DATA.map(h => [h.number, 2])) }))
    setExcludedRoundsByRound(prev => ({ ...prev, [nextRound]: new Set() }))
    if (createRoundTargetWaveId) {
      setWaves(prev => prev.map(w => (
        w.id === createRoundTargetWaveId ? { ...w, roundIds: [...w.roundIds, nextRound] } : w
      )))
      // Land back on the waves overview rather than this specific wave's own
      // detail panel underneath — a no-op if WaveRoundsPanel wasn't actually
      // open (e.g. a wave card's own top-level Add Round button already
      // sits directly on top of the overview with no detail panel involved).
      closeWaveRoundsPanel()
    }
    setActiveRound(nextRound)
    closeCreateRoundPanel()
  }

  // Waves: grouping of rounds played simultaneously/sequentially where each team
  // plays only one of them. A wave's roundIds link out to ROUND_META entries,
  // managed from WaveRoundsPanel (below) either by creating a brand-new round
  // or picking one of the tournament's other existing rounds — a round belongs
  // to at most one wave at a time.
  const [waves, setWaves] = useState(() => tournament.waves ?? [])
  const [wavesPanelOpen, setWavesPanelOpen] = useState(false)
  // Starts past any seeded wave's own id (see tournament.waves) so a wave
  // added later never collides with one the tournament shipped with.
  const waveIdCounterRef = useRef((tournament.waves?.length ? Math.max(...tournament.waves.map(w => w.id)) : 0) + 1)

  // Quick-select offered inside the Add Round form itself when the tournament
  // organizes rounds into waves — lets a round created from the top-level Add
  // Round button (rather than from inside a specific wave's own card) still
  // get linked on the spot instead of landing in the "Not Assigned to Waves"
  // catch-all.
  const NO_WAVE_OPTION_VALUE = '__no_wave__'
  const waveQuickSelectOptions = useMemo(() => {
    if (!formatManagesWaves(savedRoundFormat) || waves.length === 0) return []
    return [
      { value: NO_WAVE_OPTION_VALUE, label: 'No Wave (Ungrouped)' },
      ...waves.map(w => ({ value: w.id, label: w.name })),
    ]
  }, [savedRoundFormat, waves])
  const selectedWaveQuickOption = waveQuickSelectOptions.find(
    o => o.value === (createRoundTargetWaveId ?? NO_WAVE_OPTION_VALUE)
  ) ?? null

  const linkedRoundNumbers = useMemo(() => new Set(waves.flatMap(w => w.roundIds)), [waves])

  const roundWaveNameByNumber = useMemo(() => {
    const map = {}
    waves.forEach(w => w.roundIds.forEach(r => { map[r] = w.name }))
    return map
  }, [waves])

  const roundWaveIdByNumber = useMemo(() => {
    const map = {}
    waves.forEach(w => w.roundIds.forEach(r => { map[r] = w.id }))
    return map
  }, [waves])

  // A wave means "teams play one round" within it — so a round's wave-mates (the
  // other rounds sharing its wave, if any) always compete for the same teams,
  // regardless of the Allow Multiple Assignments setting. Rounds in a different
  // wave (or no wave at all) are unaffected, so the same team can still be
  // assigned to one round per wave.
  function waveMateRounds(round) {
    const waveId = roundWaveIdByNumber[round]
    if (waveId === undefined) return []
    return waves.find(w => w.id === waveId)?.roundIds.filter(r => r !== round) ?? []
  }

  // A round left out of every wave isn't part of the "one round per wave"
  // structure at all, so none of the wave-driven exclusivity should touch it —
  // every tournament team stays available for it, same as a round would be in
  // a plain Multi Round tournament.
  function roundIsWaveExempt(round) {
    return formatManagesWaves(savedRoundFormat) && roundWaveIdByNumber[round] === undefined
  }

  // Returns the new wave's id so the caller (handleAddWaveSave below) can
  // immediately open WaveRoundsPanel targeted at it.
  function addWave(name) {
    const id = waveIdCounterRef.current++
    setWaves(prev => [...prev, { id, name: name?.trim() || `Wave ${prev.length + 1}`, roundIds: [] }])
    return id
  }

  function renameWave(id, name) {
    setWaves(prev => prev.map(w => (w.id === id ? { ...w, name } : w)))
  }

  function deleteWave(id) {
    setWaves(prev => prev.filter(w => w.id !== id))
  }

  // Wave order drives both the Waves panel's card order and the landing
  // view's wave-grouped round sections (see groupedRoundSections below), so
  // reordering here reorders both at once. WavesPanel's own drag handles the
  // live, swap-by-swap preview entirely with local state — this only gets
  // called once, on release, with the final order — because this component
  // has enough of its own derived state (roundAvailableCounts,
  // groupedRoundSections, the whole hole-assignment grid, etc.) that
  // recomputing it on every single swap mid-drag, rather than once at the
  // end, was slow enough to make the drag itself visibly stutter/hang.
  function setWaveOrder(orderedIds) {
    setWaves(prev => {
      const byId = new Map(prev.map(w => [w.id, w]))
      const next = orderedIds.map(id => byId.get(id)).filter(Boolean)
      return next.length === prev.length ? next : prev
    })
  }

  function linkRoundToWave(waveId, round) {
    setWaves(prev => prev.map(w => (w.id === waveId ? { ...w, roundIds: [...w.roundIds, round] } : w)))
  }

  function unlinkRoundFromWave(waveId, round) {
    setWaves(prev => prev.map(w => (
      w.id === waveId ? { ...w, roundIds: w.roundIds.filter(r => r !== round) } : w
    )))
  }

  // Add Wave: its own slide-out (just the name field) stacked on top of
  // WavesPanel — saving it creates the wave, then immediately hands off to
  // WaveRoundsPanel (below) so picking the wave's rounds is the very next step
  // rather than a separate trip back into the wave list. The same form is
  // reused to rename an existing wave (editingWaveId set) from
  // WaveRoundsPanel's edit pencil — see openEditWaveNamePanel — in which case
  // saving just renames it and returns to WaveRoundsPanel instead of chaining
  // into it.
  const [addWaveFormOpen, setAddWaveFormOpen] = useState(false)
  const [editingWaveId, setEditingWaveId] = useState(null)

  function openAddWaveForm() {
    setEditingWaveId(null)
    setAddWaveFormOpen(true)
  }

  function openEditWaveNamePanel(waveId) {
    setEditingWaveId(waveId)
    setAddWaveFormOpen(true)
  }

  function closeAddWaveForm() {
    setAddWaveFormOpen(false)
    setEditingWaveId(null)
  }

  function handleAddWaveSave(name) {
    if (editingWaveId != null) {
      renameWave(editingWaveId, name)
      closeAddWaveForm()
      return
    }
    const id = addWave(name)
    setAddWaveFormOpen(false)
    openWaveRoundsPanel(id)
    // Every existing round is already claimed by another wave (or there are no
    // rounds at all) — nothing left to link into this new wave, so skip
    // straight to creating one instead of leaving the user on WaveRoundsPanel's
    // empty state. Backing out of Create Round just closes it, landing back on
    // that empty wave overview underneath.
    if (waveRoundsAvailableRounds.length === 0) {
      handleAddRoundClick(id)
    }
  }

  // Wave Rounds: the one page for everything a wave's round roster needs —
  // renaming the wave, adding one of the tournament's not-yet-linked rounds
  // (via GSQuickFilter's search list), removing one already linked (via its
  // selected-list X), or deleting the wave itself — opened either right
  // after Add Wave above, or from an existing wave's own "View Wave"/"Link
  // Round" action in WavesPanel. Also stacked on top of WavesPanel the same
  // way CreateRoundPanel is.
  const [waveRoundsPanelOpen, setWaveRoundsPanelOpen] = useState(false)
  const [waveRoundsTargetWaveId, setWaveRoundsTargetWaveId] = useState(null)

  function openWaveRoundsPanel(waveId) {
    setWaveRoundsTargetWaveId(waveId)
    setWaveRoundsPanelOpen(true)
  }

  function closeWaveRoundsPanel() {
    setWaveRoundsPanelOpen(false)
    setWaveRoundsTargetWaveId(null)
  }

  const waveRoundsTargetWave = waves.find(w => w.id === waveRoundsTargetWaveId)

  // Sorted soonest-first rather than in link order, so a wave's round list
  // reads as a schedule (what plays first) instead of a history of when each
  // round was added to it.
  const waveRoundsLinkedRounds = useMemo(() => (
    (waveRoundsTargetWave?.roundIds ?? [])
      .map(r => ({ round: r, name: roundName(r), course: roundCourse(r) }))
      .sort(byUpcoming)
  ), [waveRoundsTargetWave])

  const waveRoundsAvailableRounds = useMemo(() => (
    ROUNDS.filter(r => !linkedRoundNumbers.has(r)).map(r => ({ round: r, name: roundName(r), course: roundCourse(r) }))
  ), [ROUNDS, linkedRoundNumbers])

  // WaveRoundsPanel's own available list is looser than the plain-unlinked
  // waveRoundsAvailableRounds above (which still drives WavesPanel's "Link
  // Round" button and the Add Wave skip-to-Create-Round check) — it also
  // offers up rounds already linked to a *different* wave, tagged with
  // otherWaveId/otherWaveName so the panel can flag them with a swap icon.
  // Picking one of those goes through handleWaveRoundsAddRound below instead
  // of linking immediately.
  const waveRoundsLinkableRounds = useMemo(() => {
    const targetRoundIds = new Set(waveRoundsTargetWave?.roundIds ?? [])
    return ROUNDS.filter(r => !targetRoundIds.has(r)).map(r => ({
      round: r,
      name: roundName(r),
      course: roundCourse(r),
      otherWaveId: roundWaveIdByNumber[r],
      otherWaveName: roundWaveNameByNumber[r],
    })).sort(byUpcoming)
  }, [ROUNDS, waveRoundsTargetWave, roundWaveIdByNumber, roundWaveNameByNumber])

  // Picking an already-linked round from that list doesn't link it on the
  // spot the way an unlinked one does — it belongs to another wave, so
  // moving it needs a confirmation step (SwapRoundWavePanel below) rather
  // than silently stealing it out from under that wave.
  function handleWaveRoundsAddRound(round) {
    const currentWaveId = roundWaveIdByNumber[round]
    if (currentWaveId !== undefined && currentWaveId !== waveRoundsTargetWaveId) {
      setSwapRoundNumber(round)
      setSwapRoundPanelOpen(true)
      return
    }
    linkRoundToWave(waveRoundsTargetWaveId, round)
  }

  // Swap Round: confirmation panel stacked on top of WaveRoundsPanel (same
  // pattern as DeleteWavePanel) — accepting it unlinks the round from
  // whichever wave currently has it and links it into the wave
  // WaveRoundsPanel is showing.
  const [swapRoundPanelOpen, setSwapRoundPanelOpen] = useState(false)
  const [swapRoundNumber, setSwapRoundNumber] = useState(null)

  function closeSwapRoundPanel() {
    setSwapRoundPanelOpen(false)
    setSwapRoundNumber(null)
  }

  function handleConfirmSwapRound() {
    const fromWaveId = roundWaveIdByNumber[swapRoundNumber]
    unlinkRoundFromWave(fromWaveId, swapRoundNumber)
    linkRoundToWave(waveRoundsTargetWaveId, swapRoundNumber)
    assignRoundToWaveGroup(swapRoundNumber, waveRoundsTargetWaveId)
    closeSwapRoundPanel()
  }

  // Delete Wave: confirmation panel (DeleteWavePanel below), same pattern as
  // Delete Round — a type-the-name-to-confirm step gating a permanent action —
  // opened from WaveRoundsPanel's trash icon, stacked on top of it the same
  // way CreateRoundPanel stacks on WaveRoundsPanel. Deleting closes both this
  // panel and WaveRoundsPanel itself, since the wave it was showing no longer
  // exists — back to the Manage Waves list underneath.
  const [deleteWaveFormOpen, setDeleteWaveFormOpen] = useState(false)

  function openDeleteWavePanel() {
    setDeleteWaveFormOpen(true)
  }

  function closeDeleteWaveForm() {
    setDeleteWaveFormOpen(false)
  }

  function handleConfirmDeleteWave() {
    deleteWave(waveRoundsTargetWaveId)
    setDeleteWaveFormOpen(false)
    closeWaveRoundsPanel()
  }

  // Only animate the width change for the moment right after the expand button is
  // pressed — leaving the transition off the rest of the time keeps live viewport
  // resizes (which also change the panel's calc()-based width) instant, not jerky.
  function toggleExpanded() {
    setPanelWidthAnimating(true)
    setPanelExpanded(prev => !prev)
    window.setTimeout(() => setPanelWidthAnimating(false), 320)
  }

  // Each column's header (title + search) slides out of view once you've scrolled
  // down 56px continuously, and slides back as soon as you've scrolled up 56px —
  // the same distance both ways, so hide/show feels identical between columns
  // regardless of how tall their rows are. Distance-based (not per-event) so a
  // single scroll-down doesn't hide it instantly, and reversing direction resets
  // the count so short back-and-forth jitter near the top doesn't flicker it.
  const TOGGLE_DISTANCE = 56
  const [holesHeaderHidden, setHolesHeaderHidden] = useState(false)
  const [teamsHeaderHidden, setTeamsHeaderHidden] = useState(false)
  const holesScrollState = useRef({ lastTop: 0, accum: 0, direction: null })
  const teamsScrollState = useRef({ lastTop: 0, accum: 0, direction: null })
  // The actual scrollable elements, so switching rounds/waves can snap both
  // columns back to the top instead of leaving them mid-scroll on content
  // that now belongs to a different round.
  const holesColScrollRef = useRef(null)
  const teamsColScrollRef = useRef(null)

  function makeHeaderScrollHandler(stateRef, setHidden) {
    return e => {
      const top = e.currentTarget.scrollTop
      const state = stateRef.current
      const delta = top - state.lastTop
      state.lastTop = top

      if (top <= 0) {
        state.accum = 0
        state.direction = null
        setHidden(false)
        return
      }
      if (delta === 0) return

      const direction = delta > 0 ? 'down' : 'up'
      state.accum = direction === state.direction ? state.accum + Math.abs(delta) : Math.abs(delta)
      state.direction = direction

      if (direction === 'down' && state.accum >= TOGGLE_DISTANCE) setHidden(true)
      else if (direction === 'up' && state.accum >= TOGGLE_DISTANCE) setHidden(false)
    }
  }

  const handleHolesScroll = makeHeaderScrollHandler(holesScrollState, setHolesHeaderHidden)
  const handleTeamsScroll = makeHeaderScrollHandler(teamsScrollState, setTeamsHeaderHidden)

  // Measured (never assumed) height of the Holes column's Assigned header. Both
  // it and a hole's own header are sticky at the same top:0, so without this a
  // hole's header would just sit pinned *behind* the still-visible Assigned
  // header for its entire height's worth of scrolling instead of appearing right
  // below it — giving it that measured height as its own `top` (see
  // --col-header-offset in the CSS) makes it stick right underneath instead.
  const holesHeaderRef = useRef(null)
  const [holesHeaderHeight, setHolesHeaderHeight] = useState(0)

  useLayoutEffect(() => {
    const el = holesHeaderRef.current
    if (!el) return
    const measure = () => setHolesHeaderHeight(el.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Same measured-offset trick for the round list: its search bar (+ roster
  // overview banner, shown/hidden depending on round count) is sticky at
  // top:0, so a wave group's own sticky header needs that same height as its
  // own `top` to stick right underneath it instead of hiding behind it.
  const roundListStickyRef = useRef(null)
  const [roundListStickyHeight, setRoundListStickyHeight] = useState(0)

  useLayoutEffect(() => {
    const el = roundListStickyRef.current
    if (!el) return
    const measure = () => setRoundListStickyHeight(el.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const [activeRound, setActiveRound] = useState(ROUNDS[0])

  // The active round's roster — what "Unassigned" and "Assigned (X/Y)" scope to.
  const TOURNAMENT_TEAMS = useMemo(() => teamsForRound(activeRound), [activeRound, tournament])

  // Per-round assignments: { 1: { slotId: teamName }, 2: { slotId: teamName }, ... }
  // Rounds start empty except where the tournament defines a seeded starting state.
  const [assignmentsByRound, setAssignmentsByRound] = useState(() => (
    Object.fromEntries(ROUNDS.map(r => [r, { ...(tournament.initialAssignments?.[r] ?? {}) }]))
  ))

  // Falls back to {} when the tournament has no rounds yet (activeRound is undefined).
  const assignments = assignmentsByRound[activeRound] ?? {}

  function setAssignments(updater) {
    setAssignmentsByRound(prev => ({
      ...prev,
      [activeRound]: typeof updater === 'function' ? updater(prev[activeRound]) : updater,
    }))
  }

  function switchRound(round) {
    setActiveRound(round)
    setSelectedTeam(null)
    setSelectedSlot(null)
    setHoleSearch('')
    setTeamSearch('')

    // Slot ids (e.g. "1-A") and team names are shared across every round, so
    // without this, a flash/pending state left over from the round you're
    // leaving would render as if it belonged to the same slot/team in the
    // round you're switching into.
    setFlashSlots(new Set())
    setFlashTeams(new Set())
    setPendingSlots(new Map())
    setPendingTeams(new Set())

    // Each column scrolls independently per round, but the scroll position
    // (and the header hide/show it drives) shouldn't carry over — land back
    // at the top of both columns, with their headers visible, every time.
    if (holesColScrollRef.current) holesColScrollRef.current.scrollTop = 0
    if (teamsColScrollRef.current) teamsColScrollRef.current.scrollTop = 0
    holesScrollState.current = { lastTop: 0, accum: 0, direction: null }
    teamsScrollState.current = { lastTop: 0, accum: 0, direction: null }
    setHolesHeaderHidden(false)
    setTeamsHeaderHidden(false)
  }

  // Picking a different round while the panel is already open (from
  // WaveRoundNav or the plain round tabs below) holds on a full-panel loading
  // state briefly rather than swapping instantly — a placeholder for the real
  // fetch delay once round data is server-backed, so switching between rounds
  // reads as loading fresh content rather than an instant, jarring swap.
  const [isSwitchingRound, setIsSwitchingRound] = useState(false)

  function selectRound(round) {
    if (round === activeRound) return
    setIsSwitchingRound(true)
    window.setTimeout(() => {
      switchRound(round)
      setIsSwitchingRound(false)
    }, 2000)
  }

  // Per-round hole grouping counts: { [round]: { [holeNumber]: groupCount } }.
  // Every hole starts with the standard A/B pair; the "+" control lets each hole
  // grow additional groups (C, D, …) independently, per round.
  const [groupCountsByRound, setGroupCountsByRound] = useState(() => (
    Object.fromEntries(ROUNDS.map(r => [r, Object.fromEntries(HOLE_DATA.map(h => [h.number, 2]))]))
  ))

  // Falls back to {} when the tournament has no rounds yet (activeRound is undefined).
  const groupCounts = groupCountsByRound[activeRound] ?? {}

  function setGroupCounts(updater) {
    setGroupCountsByRound(prev => ({
      ...prev,
      [activeRound]: typeof updater === 'function' ? updater(prev[activeRound]) : updater,
    }))
  }

  // selection: either a team name or a slot id is active, never both
  const [selectedTeam, setSelectedTeam]   = useState(null)
  const [selectedSlot, setSelectedSlot]   = useState(null)
  const [holeSearch, setHoleSearch]       = useState('')
  const [teamSearch, setTeamSearch]       = useState('')
  const [roundListSearch, setRoundListSearch] = useState('')

  // Manual drag order for a linked section's rounds (see RoundGroupList),
  // keyed by the section's own key — independent of each round's Round
  // Letter, which is never shown or user-editable, just auto-assigned at
  // creation (see CreateRoundPanel) to give same-number rounds a stable
  // default order before anyone's dragged them. This override is what
  // actually decides display order from then on.
  const [roundOrderOverrides, setRoundOrderOverrides] = useState({})

  // Rounds shown on the tournament landing view, filtered by round
  // number/name and ordered by each round's own Round Number (not its
  // ROUND_META key, which is just an internal id that a custom-numbered or
  // edited round can easily disagree with), then by each round's internal,
  // auto-assigned Round Letter (A-Z) as a default tiebreak for rounds that
  // share a number — overridden the moment someone drags one, see
  // roundOrderOverrides above.
  const filteredRounds = useMemo(() => {
    const q = roundListSearch.trim().toLowerCase()
    const rounds = q
      ? ROUNDS.filter(r => roundName(r).toLowerCase().includes(q) || String(r).includes(q))
      : ROUNDS
    return [...rounds].sort((a, b) => (
      roundNumberOf(a) - roundNumberOf(b)
      || (ROUND_META[a]?.roundLetter ?? 'A').localeCompare(ROUND_META[b]?.roundLetter ?? 'A')
    ))
  }, [ROUNDS, roundListSearch])

  // Segmented-list grouping (mirrors the tiered Sponsors list pattern): once
  // waves exist, the flat round list gives way to one section per wave — in
  // wave-creation order — followed by a catch-all section for any round not
  // yet linked to a wave. null (rather than an empty array) is the signal to
  // fall back to the plain flat list, since there's nothing to group by
  // outside the Waves format.
  const groupedRoundSections = useMemo(() => {
    if (waves.length === 0) return null
    const groupedRoundNumbers = new Set()
    const sections = waves
      .map(w => ({
        key: `wave-${w.id}`,
        kind: 'wave',
        waveId: w.id,
        title: w.name,
        rounds: filteredRounds.filter(r => w.roundIds.includes(r)),
      }))
      .filter(section => section.rounds.length > 0)
    sections.forEach(section => section.rounds.forEach(r => groupedRoundNumbers.add(r)))
    const ungroupedRounds = filteredRounds.filter(r => !groupedRoundNumbers.has(r))
    if (ungroupedRounds.length > 0) {
      sections.push({ key: 'ungrouped', kind: 'wave', title: 'Not Assigned to Waves', rounds: ungroupedRounds })
    }
    return sections
  }, [waves, filteredRounds])

  // Linked Round Label: a purely cosmetic override for a Round Number
  // group's own sticky-header/tile-picker title — available for every Round
  // Number, solo or actually shared with others (see that header's own edit
  // pencil below, and the target step of the Linked/Unlinked choice further
  // down). Stored separately from ROUND_META since it names the *group*,
  // not any one round, and never touches the Round Number itself,
  // CreateRoundPanel's own Round Number field, or any individual round's
  // own name (see roundName) — those all still read as "Round 1" regardless
  // of what this is set to.
  const [linkedRoundLabels, setLinkedRoundLabels] = useState({})
  const [linkedRoundLabelPanelOpen, setLinkedRoundLabelPanelOpen] = useState(false)
  const [editingLinkedRoundNumber, setEditingLinkedRoundNumber] = useState(null)

  function linkedGroupLabel(number, fallback) {
    return linkedRoundLabels[number]?.trim() || fallback
  }

  function openLinkedRoundLabelPanel(number) {
    setEditingLinkedRoundNumber(number)
    setLinkedRoundLabelPanelOpen(true)
  }

  function closeLinkedRoundLabelPanel() {
    setLinkedRoundLabelPanelOpen(false)
    setEditingLinkedRoundNumber(null)
  }

  function saveLinkedRoundLabel(label) {
    setLinkedRoundLabels(prev => ({ ...prev, [editingLinkedRoundNumber]: label }))
    closeLinkedRoundLabelPanel()
  }

  // Fallback grouping for tournaments that never went through Round Setup at
  // all (no waves, no savedRoundFormat) — rounds instead get linked directly
  // by sharing a Round Number (see CreateRoundPanel's own Round Number
  // field), so the list groups those the same way it groups waves. Every
  // Round Number always gets its own section here, solo (unlinked) ones
  // included — same as a wave section shows even with just one round in it
  // — so every group, from its very first round on, already has somewhere
  // to hang its own Linked Round Label (see the header's edit pencil
  // further down) and its own Add a Course shortcut (see
  // handleAddRoundToGroupClick), which always links a new round into that
  // same Round Number.
  const roundNumberGroupedSections = useMemo(() => {
    // Waves group rounds their own way (see groupedRoundSections); a format
    // like Single/Sequence never uses Round Number linking at all, so its
    // rounds stay a plain flat list rather than each getting a solo section.
    if (waves.length > 0 || !roundLinkingEnabled || filteredRounds.length === 0) return null
    const byNumber = new Map()
    filteredRounds.forEach(r => {
      const num = roundNumberOf(r)
      if (!byNumber.has(num)) byNumber.set(num, [])
      byNumber.get(num).push(r)
    })
    return [...byNumber.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([num, rounds]) => ({
        key: `round-number-${num}`,
        kind: 'roundNumber',
        number: num,
        title: linkedGroupLabel(num, `Round ${num}`),
        rounds,
      }))
  }, [waves, filteredRounds, linkedRoundLabels])

  // Layers any manual drag order on top of a section's default (Round
  // Number then Letter) order — a stored override only ever reorders rounds
  // already in the section; a round added or unlinked since the drag just
  // falls in at the end rather than getting dropped.
  const displayedRoundSections = useMemo(() => {
    const sections = groupedRoundSections ?? roundNumberGroupedSections
    if (!sections) return sections
    return sections.map(section => {
      const order = roundOrderOverrides[section.key]
      if (!order) return section
      const orderedSet = new Set(order)
      const ordered = order.filter(r => section.rounds.includes(r))
      const rest = section.rounds.filter(r => !orderedSet.has(r))
      return { ...section, rounds: [...ordered, ...rest] }
    })
  }, [groupedRoundSections, roundNumberGroupedSections, roundOrderOverrides])

  // Every distinct Round Number already in use, oldest first, each with the
  // letters already claimed within it — feeds CreateRoundPanel's own Round
  // Number field (its "Link to Round X" options) and the next-available-
  // letter default for a round newly linked into one of these groups.
  const roundNumberGroups = useMemo(() => {
    const map = new Map()
    ROUNDS.forEach(r => {
      const num = roundNumberOf(r)
      const letter = ROUND_META[r]?.roundLetter ?? 'A'
      if (!map.has(num)) map.set(num, [])
      map.get(num).push({ round: r, letter })
    })
    return [...map.entries()]
      .map(([number, entries]) => ({ number, entries }))
      .sort((a, b) => a.number - b.number)
  }, [ROUNDS, ROUND_META])

  // Momentary confirmation highlight: a slot that was just assigned/swapped into holds
  // cyan-800 then fades to cyan-700; a team just returned to the pool (swapped out or
  // removed) holds grey-100 then fades to white. FLASH_MS must match the hold+fade
  // timing in the CSS keyframes.
  const FLASH_MS = 3000
  const [flashSlots, setFlashSlots] = useState(new Set())
  const [flashTeams, setFlashTeams] = useState(new Set())

  function flashSlot(slotId) {
    setFlashSlots(prev => new Set(prev).add(slotId))
    window.setTimeout(() => {
      setFlashSlots(prev => {
        const next = new Set(prev)
        next.delete(slotId)
        return next
      })
    }, FLASH_MS)
  }

  function flashTeam(teamName) {
    setFlashTeams(prev => new Set(prev).add(teamName))
    window.setTimeout(() => {
      setFlashTeams(prev => {
        const next = new Set(prev)
        next.delete(teamName)
        return next
      })
    }, FLASH_MS)
  }

  // Simulated save latency: the slot(s) involved in an in-flight assignment/swap/
  // removal show a spinner for PENDING_MS before the change actually lands (mirroring
  // the ~1s round trip in the real app), then `commit` applies the mutation and kicks
  // off the confirmation flash. Each pending slot is tagged 'dark' (it will be occupied
  // once the mutation lands, whether newly assigned or swapped) or 'light' (it will be
  // empty, i.e. a removal) so the spinner tile can be styled accordingly.
  const PENDING_MS = 1000
  const [pendingSlots, setPendingSlots] = useState(new Map())
  // Teams currently mid-assignment from the Unassigned pool — the pool list filters
  // an assigned team out only once `assignments` actually updates in `commit`, so
  // without this a team clicked into a slot would sit in the list unchanged for the
  // whole PENDING_MS window with no sign anything was happening.
  const [pendingTeams, setPendingTeams] = useState(new Set())

  function mutateWithPending(entries, commit, teamNames = []) {
    // Cancel any confirmation flash still animating on these slots — its keyframes
    // drive background/border-color directly, so it would otherwise keep painting
    // over the pending style for the rest of its 3s run even after --pending is added.
    setFlashSlots(prev => {
      const next = new Set(prev)
      entries.forEach(([id]) => next.delete(id))
      return next
    })
    setPendingSlots(prev => {
      const next = new Map(prev)
      entries.forEach(([id, kind]) => next.set(id, kind))
      return next
    })
    if (teamNames.length) {
      setPendingTeams(prev => {
        const next = new Set(prev)
        teamNames.forEach(name => next.add(name))
        return next
      })
    }
    window.setTimeout(() => {
      setPendingSlots(prev => {
        const next = new Map(prev)
        entries.forEach(([id]) => next.delete(id))
        return next
      })
      if (teamNames.length) {
        setPendingTeams(prev => {
          const next = new Set(prev)
          teamNames.forEach(name => next.delete(name))
          return next
        })
      }
      commit()
    }, PENDING_MS)
  }

  // Rounds & Scorecards Settings: "Allow Multiple Hole Assignments" — when off, a
  // team already assigned to any other round in this tournament is hidden from
  // every round's Unassigned pool, not just its own. Draft state is staged
  // separately so Cancel can discard changes made while the panel was open.
  const [allowMultipleAssignments, setAllowMultipleAssignments] = useState(true)
  const [draftAllowMultipleAssignments, setDraftAllowMultipleAssignments] = useState(true)
  const hideTeamsAssignedElsewhere = !allowMultipleAssignments

  // Waves format means "teams play one round" — full stop, across every wave —
  // so a team assigned anywhere is hidden from every other round regardless of
  // which wave it's in. Hybrid format is the looser version: a team can appear
  // in multiple waves, just not twice within the same wave.
  const waveFormatExclusive = savedRoundFormat === 'waves'
  const hybridWaveScoped = savedRoundFormat === 'hybrid'

  function openSettingsPanel() {
    setDraftAllowMultipleAssignments(allowMultipleAssignments)
    setSettingsPanelOpen(true)
  }

  function saveSettings() {
    setAllowMultipleAssignments(draftAllowMultipleAssignments)
    setSettingsPanelOpen(false)
  }

  // legacyFilter tournaments only: rounds whose already-assigned teams should also
  // be hidden from a given round's unassigned list (set from the Filter panel's
  // per-round toggles). Scoped per round — e.g. hiding Round 1 while working on
  // Round 2 shouldn't also hide it while on Round 3.
  const [excludedRoundsByRound, setExcludedRoundsByRound] = useState(() => (
    Object.fromEntries(ROUNDS.map(r => [r, new Set()]))
  ))

  const excludedRounds = excludedRoundsByRound[activeRound] ?? new Set()

  function toggleExcludedRound(round) {
    setExcludedRoundsByRound(prev => {
      const next = new Set(prev[activeRound])
      if (next.has(round)) next.delete(round)
      else next.add(round)
      return { ...prev, [activeRound]: next }
    })
  }

  function clearExcludedRounds() {
    setExcludedRoundsByRound(prev => ({ ...prev, [activeRound]: new Set() }))
  }

  // Whether any teams are currently being hidden from the active round's pool —
  // via the legacy per-round Filter panel, the newer global Settings toggle, or
  // (independent of format) this round being linked to others by Round Number.
  const hidingAnyTeams = (
    !roundIsWaveExempt(activeRound) && (
      (useLegacyFilter ? excludedRounds.size > 0 : (hideTeamsAssignedElsewhere || waveFormatExclusive))
      || (hybridWaveScoped && waveMateRounds(activeRound).length > 0)
    )
  ) || roundNumberMates(activeRound).length > 0

  // How many teams would be available for each round, given that round's own
  // assignments plus whichever other rounds are currently hidden from it (legacy:
  // per-round Filter panel choice; newer: the Settings toggle applied to every round).
  const roundAvailableCounts = useMemo(() => {
    const result = {}
    ROUNDS.forEach(r => {
      const hiddenTeams = new Set(Object.values(assignmentsByRound[r] || {}))
      if (roundIsWaveExempt(r)) {
        // No wave, no exclusivity — every team stays available for this round.
      } else if (useLegacyFilter) {
        excludedRoundsByRound[r]?.forEach(er => {
          Object.values(assignmentsByRound[er] || {}).forEach(name => hiddenTeams.add(name))
        })
      } else if (hideTeamsAssignedElsewhere || waveFormatExclusive) {
        ROUNDS.forEach(other => {
          if (other === r) return
          Object.values(assignmentsByRound[other] || {}).forEach(name => hiddenTeams.add(name))
        })
      } else if (hybridWaveScoped) {
        waveMateRounds(r).forEach(wr => {
          Object.values(assignmentsByRound[wr] || {}).forEach(name => hiddenTeams.add(name))
        })
      }
      // Independent of format/branch above — a round linked to others by
      // Round Number is exclusive to them the same way wave-mates are.
      roundNumberMates(r).forEach(mate => {
        Object.values(assignmentsByRound[mate] || {}).forEach(name => hiddenTeams.add(name))
      })
      result[r] = teamsForRound(r).length - hiddenTeams.size
    })
    return result
  }, [assignmentsByRound, useLegacyFilter, excludedRoundsByRound, hideTeamsAssignedElsewhere, waveFormatExclusive, hybridWaveScoped, savedRoundFormat, roundWaveIdByNumber, tournament, ROUNDS, ROUND_META, waves])

  // Teams that are already assigned in this round (not in the available pool)
  const assignedTeamNames = useMemo(() => new Set(Object.values(assignments)), [assignments])

  // Teams hidden from this round's pool: legacy tournaments hide teams assigned in
  // whichever rounds were toggled off via the Filter panel; newer tournaments hide
  // teams assigned in any other round when the Settings toggle is on.
  const filterExcludedTeamNames = useMemo(() => {
    const names = new Set()
    if (roundIsWaveExempt(activeRound)) {
      // No wave, no exclusivity — every team stays available for this round.
    } else if (useLegacyFilter) {
      excludedRounds.forEach(r => {
        Object.values(assignmentsByRound[r] || {}).forEach(name => names.add(name))
      })
    } else if (hideTeamsAssignedElsewhere || waveFormatExclusive) {
      ROUNDS.forEach(r => {
        if (r === activeRound) return
        Object.values(assignmentsByRound[r] || {}).forEach(name => names.add(name))
      })
    } else if (hybridWaveScoped) {
      waveMateRounds(activeRound).forEach(r => {
        Object.values(assignmentsByRound[r] || {}).forEach(name => names.add(name))
      })
    }
    // Independent of format/branch above — a round linked to others by Round
    // Number is exclusive to them the same way wave-mates are.
    roundNumberMates(activeRound).forEach(r => {
      Object.values(assignmentsByRound[r] || {}).forEach(name => names.add(name))
    })
    return names
  }, [useLegacyFilter, excludedRounds, hideTeamsAssignedElsewhere, waveFormatExclusive, hybridWaveScoped, savedRoundFormat, roundWaveIdByNumber, assignmentsByRound, activeRound, ROUNDS, ROUND_META, waves])

  const availableTeams = useMemo(
    () => TOURNAMENT_TEAMS.filter(t => !assignedTeamNames.has(t.name) && !filterExcludedTeamNames.has(t.name)),
    [assignedTeamNames, filterExcludedTeamNames, TOURNAMENT_TEAMS]
  )

  const filteredAvailableTeams = useMemo(() => {
    const q = teamSearch.trim().toLowerCase()
    if (!q) return availableTeams
    return availableTeams.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.players.toLowerCase().includes(q) ||
      t.flight.toLowerCase().includes(q)
    )
  }, [availableTeams, teamSearch])

  // Which slots are currently empty
  const emptySlotIds = useMemo(() => {
    const all = HOLE_DATA.flatMap(h => getSlotIds(h.number, groupCounts[h.number] ?? 2))
    return new Set(all.filter(id => !assignments[id]))
  }, [assignments, groupCounts])

  // Highlighted targets: when a team is selected, highlight empty slots;
  // when a slot is selected, highlight available teams
  const highlightedSlots = useMemo(() => {
    if (selectedTeam) return emptySlotIds
    return new Set()
  }, [selectedTeam, emptySlotIds])

  // The occupied slot a selected team is currently assigned to (the swap source)
  const selectedTeamSlot = useMemo(() => {
    if (!selectedTeam) return null
    return Object.entries(assignments).find(([, v]) => v === selectedTeam)?.[0] ?? null
  }, [selectedTeam, assignments])

  const activeSlot = selectedSlot || selectedTeamSlot

  const teamsHighlighted = !!selectedSlot
  const hasActiveSelection = !!(selectedTeam || selectedSlot)

  // Hole search — match hole number/par or any assigned team name/players
  const holeVisible = useMemo(() => {
    const q = holeSearch.trim().toLowerCase()
    if (!q) return new Set(HOLE_DATA.map(h => h.number))
    return new Set(
      HOLE_DATA
        .filter(h => {
          if (`hole ${h.number} par ${h.par}`.includes(q)) return true
          return getSlotIds(h.number, groupCounts[h.number] ?? 2).some(sid => {
            const team = assignments[sid]
            if (!team) return false
            const td = TEAM_DATA.find(t => t.name === team)
            return `${team} ${td?.players ?? ''}`.toLowerCase().includes(q)
          })
        })
        .map(h => h.number)
    )
  }, [holeSearch, assignments, groupCounts])

  const assignedCount = Object.keys(assignments).length
  const roundAssignedCounts = useMemo(
    () => ROUNDS.reduce((acc, r) => ({ ...acc, [r]: Object.keys(assignmentsByRound[r] || {}).length }), {}),
    [assignmentsByRound]
  )

  // Every round's own roster size — each round only fields the teams registered
  // to it (see teamsForRound), not necessarily the whole tournament.
  const roundRosterCounts = useMemo(
    () => Object.fromEntries(ROUNDS.map(r => [r, teamsForRound(r).length])),
    [ROUNDS, tournament]
  )

  // ── Interaction handlers ───────────────────────────────────────────────────

  function handleTeamClick(teamName) {
    // If a slot is selected, assign immediately
    if (selectedSlot && emptySlotIds.has(selectedSlot)) {
      doAssign(teamName, selectedSlot)
      return
    }
    // Toggle team selection
    if (selectedTeam === teamName) {
      setSelectedTeam(null)
    } else {
      setSelectedTeam(teamName)
      setSelectedSlot(null)
    }
  }

  function handleSlotClick(slotId) {
    if (pendingSlots.has(slotId)) return
    const occupied = !!assignments[slotId]

    if (!occupied) {
      // Empty slot
      if (selectedTeam) {
        const sourceSlot = Object.entries(assignments).find(([, v]) => v === selectedTeam)?.[0]
        if (sourceSlot) {
          if (pendingSlots.has(sourceSlot)) return
          // Move: clear the old slot as we assign the new one
          const team = selectedTeam
          setSelectedTeam(null)
          setSelectedSlot(null)
          mutateWithPending([[slotId, 'dark'], [sourceSlot, 'light']], () => {
            setAssignments(prev => {
              const next = { ...prev }
              delete next[sourceSlot]
              next[slotId] = team
              return next
            })
            flashSlot(slotId)
          })
        } else {
          doAssign(selectedTeam, slotId)
        }
      } else {
        setSelectedSlot(prev => prev === slotId ? null : slotId)
        setSelectedTeam(null)
      }
    } else {
      // Occupied slot
      const occupiedTeam = assignments[slotId]
      if (selectedTeam) {
        // Swap: move selectedTeam here, return occupiedTeam to pool
        const sourceSlot = Object.entries(assignments).find(([, v]) => v === selectedTeam)?.[0]
        const team = selectedTeam
        if (sourceSlot) {
          if (pendingSlots.has(sourceSlot)) return
          // Both assigned: swap
          setSelectedTeam(null)
          setSelectedSlot(null)
          mutateWithPending([[sourceSlot, 'dark'], [slotId, 'dark']], () => {
            setAssignments(prev => ({ ...prev, [sourceSlot]: occupiedTeam, [slotId]: team }))
            flashSlot(sourceSlot)
            flashSlot(slotId)
          })
        } else {
          // selectedTeam is from the available pool
          setSelectedTeam(null)
          setSelectedSlot(null)
          mutateWithPending([[slotId, 'dark']], () => {
            setAssignments(prev => ({ ...prev, [slotId]: team }))
            flashSlot(slotId)
            flashTeam(occupiedTeam)
          }, [team])
        }
      } else if (selectedSlot) {
        setSelectedSlot(null)
        setSelectedTeam(null)
      } else {
        // Select the team in this slot for potential swap
        setSelectedTeam(occupiedTeam)
        setSelectedSlot(null)
      }
    }
  }

  // Only the swap button on an occupied slot triggers this — tapping the
  // tile body itself never swaps.
  function handleSlotSwap(slotId) {
    if (pendingSlots.has(slotId)) return
    const occupiedTeam = assignments[slotId]
    if (selectedSlot) {
      if (pendingSlots.has(selectedSlot)) return
      const targetSlot = selectedSlot
      setSelectedSlot(null)
      setSelectedTeam(null)
      mutateWithPending([[slotId, 'light'], [targetSlot, 'dark']], () => {
        setAssignments(prev => {
          const next = { ...prev }
          delete next[slotId]
          next[targetSlot] = occupiedTeam
          return next
        })
        flashSlot(targetSlot)
      })
    } else if (selectedTeam) {
      const sourceSlot = Object.entries(assignments).find(([, v]) => v === selectedTeam)?.[0]
      const team = selectedTeam
      if (sourceSlot && pendingSlots.has(sourceSlot)) return
      setSelectedTeam(null)
      setSelectedSlot(null)
      if (sourceSlot) {
        mutateWithPending([[sourceSlot, 'dark'], [slotId, 'dark']], () => {
          setAssignments(prev => ({ ...prev, [sourceSlot]: occupiedTeam, [slotId]: team }))
          flashSlot(sourceSlot)
          flashSlot(slotId)
        })
      } else {
        mutateWithPending([[slotId, 'dark']], () => {
          setAssignments(prev => ({ ...prev, [slotId]: team }))
          flashSlot(slotId)
          flashTeam(occupiedTeam)
        }, [team])
      }
    } else {
      handleRemove(slotId)
    }
  }

  // Only the swap button on an unassigned team card triggers this — puts the
  // clicked team into the selected (assigned) team's slot, freeing it to the pool.
  function handleTeamSwap(teamName) {
    if (!selectedTeamSlot || pendingSlots.has(selectedTeamSlot)) return
    const slotId = selectedTeamSlot
    const displacedTeam = assignments[slotId]
    setSelectedTeam(null)
    setSelectedSlot(null)
    mutateWithPending([[slotId, 'dark']], () => {
      setAssignments(prev => ({ ...prev, [slotId]: teamName }))
      flashSlot(slotId)
      if (displacedTeam) flashTeam(displacedTeam)
    }, [teamName])
  }

  function handleRemove(slotId) {
    if (pendingSlots.has(slotId)) return
    const displacedTeam = assignments[slotId]
    setSelectedTeam(null)
    setSelectedSlot(null)
    mutateWithPending([[slotId, 'light']], () => {
      setAssignments(prev => {
        const next = { ...prev }
        delete next[slotId]
        return next
      })
      if (displacedTeam) flashTeam(displacedTeam)
    })
  }

  // Groups can only be added at the end of a hole's list (the next letter),
  // and only the last group can be removed — and only while it's unassigned —
  // so letters never get reused/reordered underneath an in-progress assignment.
  function handleAddGroup(holeNumber) {
    setGroupCounts(prev => {
      const current = prev[holeNumber] ?? 2
      if (current >= MAX_GROUPS_PER_HOLE) return prev
      return { ...prev, [holeNumber]: current + 1 }
    })
  }

  function handleRemoveGroup(holeNumber, slotId) {
    if (assignments[slotId]) return
    setSelectedSlot(prev => prev === slotId ? null : prev)
    setGroupCounts(prev => {
      const current = prev[holeNumber] ?? 2
      if (current <= MIN_GROUPS_PER_HOLE) return prev
      return { ...prev, [holeNumber]: current - 1 }
    })
  }

  function doAssign(teamName, slotId) {
    if (pendingSlots.has(slotId)) return
    setSelectedTeam(null)
    setSelectedSlot(null)
    mutateWithPending([[slotId, 'dark']], () => {
      setAssignments(prev => ({ ...prev, [slotId]: teamName }))
      flashSlot(slotId)
    }, [teamName])
  }

  // Opens the assignment panel targeted at a specific round — the "Hole Assignments"
  // action on that round's card in the landing list.
  function openRound(round) {
    switchRound(round)
    setPanelOpen(true)
  }

  // Wave nav inside the Hole Assignments panel: every wave is surfaced as its
  // own tab (so you can jump straight from one into another) and a second
  // row of round tabs scoped to whichever wave is active lets you move
  // between that wave's own rounds without leaving the panel — WaveRoundNav
  // itself already collapses that first step when there's only one wave to
  // begin with (see its own isOpen effect), so this only needs to gate on
  // there being more than one round to switch to in total, not on there
  // being more than one wave.
  const activeWaveId = activeRound !== undefined ? roundWaveIdByNumber[activeRound] : undefined
  const wavesWithRounds = useMemo(() => waves.filter(w => w.roundIds.length > 0), [waves])
  const showWaveNav = activeWaveId !== undefined
    && wavesWithRounds.reduce((count, w) => count + w.roundIds.length, 0) >= 2
  const activeWaveName = wavesWithRounds.find(w => w.id === activeWaveId)?.name

  // Same nav, reused for a format-less tournament's Round Number groups — a
  // Round Number is essentially a wave (see roundNumberMates), so linked
  // rounds get the same drill-down picker real waves do, shaped into the
  // same {id, name, roundIds} groups WaveRoundNav already expects. Same
  // reasoning as showWaveNav above — gated on total rounds, not on there
  // being more than one distinct Round Number, so a single 3-way-linked
  // group still gets a way to switch between its own three rounds.
  const roundNumberNavGroups = useMemo(() => {
    const map = new Map()
    ROUNDS.forEach(r => {
      const num = roundNumberOf(r)
      if (!map.has(num)) map.set(num, [])
      map.get(num).push(r)
    })
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([num, roundIds]) => ({ id: num, name: linkedGroupLabel(num, `Round ${num}`), roundIds }))
  }, [ROUNDS, ROUND_META, linkedRoundLabels])
  const activeRoundNumberGroupId = activeRound !== undefined ? roundNumberOf(activeRound) : undefined
  const showRoundNumberNav = roundLinkingEnabled && ROUNDS.length >= 2
  const activeRoundNumberGroupName = roundNumberNavGroups.find(g => g.id === activeRoundNumberGroupId)?.name

  // Every remaining shape (currently just Sequence) has no wave or Round
  // Number grouping to speak of — one synthetic group holding every round
  // lets WaveRoundNav's own single-group auto-drill show a flat round-tab
  // row the same way a lone wave or Round Number group already does, so
  // every hole assignment page ends up with the same Change Round button
  // rather than this one shape needing its own separate fallback UI.
  const showPlainRoundNav = !showWaveNav && !showRoundNumberNav && ROUNDS.length >= 2
  const plainRoundNavGroups = useMemo(() => [{ id: 'all-rounds', name: 'Rounds', roundIds: ROUNDS }], [ROUNDS])

  // Within the Round Number nav case, the active round's own group can still
  // turn out to be a solo one (everything else in the tournament is linked,
  // this one round just isn't) — same redundancy as showPlainRoundNav, just
  // scoped to this one round instead of the whole tournament, so it gets the
  // same bare "Change Round" treatment rather than naming a "group" of one.
  const activeRoundIsUnlinked = activeRound !== undefined && roundNumberMates(activeRound).length === 0
  const hideWaveSwitchLabel = showPlainRoundNav || (showRoundNumberNav && activeRoundIsUnlinked)

  // WaveRoundNav (the wave/round picker) is collapsed to a compact "Wave
  // Name | Change Round" line by default and only expands on demand — it
  // re-collapses itself the moment a round is actually picked, rather than
  // staying open or trying to track scroll position at all.
  const [waveNavOpen, setWaveNavOpen] = useState(false)

  // Only the "leaving Waves" direction actually destroys data (the waves
  // themselves) — every other format change just reorganizes existing rounds,
  // so the warning step's copy/severity is tailored to which case this is.
  const changingFromWavesToOther = formatChangeWarningOpen
    && formatManagesWaves(savedRoundFormat) && !formatManagesWaves(roundFormat) && waves.length > 0

  const panelBanner = (
    <div className="sched-banner">
      <FontAwesomeIcon icon={faFloppyDisk} className="sched-banner-icon" />
      <span className="sched-banner-text">Assignments will be automatically saved.</span>
    </div>
  )

  return (
    <div className="sched-page-bg">
      <GSActionBar
        type="x-large-pad H3"
        header="Rounds & Scorecards"
        pageActions={[
          // Add Round is always available, regardless of format or whether
          // the tournament already has rounds — even a Single Round
          // tournament with its one round already saved can still re-show
          // it (Single's own one-round rule is enforced elsewhere, not by
          // hiding the button).
          { buttonTitle: 'Add Round', buttonIcon: faPlus, type: 'black', actionClick: () => handleAddRoundClick() },
          // Waves and Hybrid both organize every round into a wave — Manage
          // Waves is the occasional setup/reorganizing action alongside Add
          // Round's far more frequent day-to-day one.
          ...(formatManagesWaves(savedRoundFormat) ? [
            { buttonTitle: 'Manage Waves', buttonIcon: faWater, type: 'light-grey', actionClick: () => setWavesPanelOpen(true) },
          ] : []),
          // Team Check In and Documents both operate on rounds that already
          // exist — nothing to check a team into or attach a document to
          // before this tournament's first round is actually created.
          ...(hasRounds ? [
            { buttonTitle: 'Team Check In', buttonIcon: faListCheck, type: 'light-grey', actionClick: () => {} },
            { buttonTitle: 'Documents', buttonIcon: faFolderOpen, type: 'light-grey', actionClick: () => {} },
          ] : []),
          ...(!useLegacyFilter && savedRoundFormat && !tournament.hideSettingsButton ? [{ buttonIcon: faGear, type: 'light-grey', actionClick: openSettingsPanel }] : []),
        ]}
      />

      <div className="sched-round-list-page">
        <div
          className="sched-col-scroll"
          style={{ '--round-group-header-offset': `${roundListStickyHeight}px` }}
        >
          {/* Once waves (or linked Round Numbers) group the list below — or
              the placeholder Round 1 group takes its place before any round
              exists — that group's own sticky header carries the shadow;
              keeping it here too would double it up. */}
          <div
            className={`sched-round-list-sticky${displayedRoundSections || (!hasRounds && !savedRoundFormat) ? ' sched-round-list-sticky--no-shadow' : ''}`}
            ref={roundListStickyRef}
          >
            <div className="sched-round-search">
              <GSinput
                leftIcon={faMagnifyingGlass}
                rightIcon={roundListSearch ? faCircleXmark : undefined}
                rightIconClick={() => setRoundListSearch('')}
                placeholder="Search by Round Number or Label…"
                textValue={roundListSearch}
                onChange={e => setRoundListSearch(e.target.value)}
              />
            </div>
          </div>
          <div className={`sched-round-list-body${filteredRounds.length === 0 && savedRoundFormat ? ' sched-round-list-body--empty' : ''}`}>
            {!hasRounds && !savedRoundFormat ? (
              // A brand new tournament (nothing added, no format chosen yet)
              // always starts on a real "Round 1" group — same header as any
              // other Round Number group further down — rather than the
              // generic "Add & Manage Rounds" placeholder screen this used to
              // drop into. Its own Add a Course action stands in for a round
              // card until one actually exists; clicking it goes straight to
              // Add Round the same as the page header's own button does
              // (skipping the Linked/Unlinked ask, same as any first round —
              // see handleAddRoundClick), and the round it creates lands as
              // Round 1 by simply being the tournament's first.
              <div className="sched-round-group">
                <GSActionBar
                  type="form-header"
                  header={
                    <div className="sched-round-group-header">
                      <div className="sched-round-group-header-title">Round 1</div>
                      <div className="sched-round-group-header-desc">Add a course to create this round</div>
                    </div>
                  }
                  pageActions={[
                    { buttonTitle: 'Add a Course', buttonIcon: faPlus, type: 'grey', isFocusable: true, actionClick: () => handleAddRoundClick() },
                  ]}
                />
              </div>
            ) : filteredRounds.length === 0 ? (
              <GSEmptyList
                title={hasRounds ? `No results for "${roundListSearch}"` : 'Add & Manage Rounds'}
                detail={hasRounds ? undefined : 'Add new rounds and manage all round details in one spot.'}
                actions={hasRounds ? undefined : (
                  // No format ever gets chosen up front any more — a brand
                  // new tournament goes straight to Add Round, the same as
                  // any other plain-rounds tournament. Round Setup only still
                  // exists for tournaments that already went through it (see
                  // RoundFormatSummary's edit pencil above).
                  !savedRoundFormat
                    ? [{ title: 'Add Round', buttonIcon: faPlus, type: 'black', isFocusable: true, onClick: () => handleAddRoundClick() }]
                    : formatManagesWaves(savedRoundFormat)
                      ? [
                          { title: 'Add Round', buttonIcon: faPlus, type: 'black', isFocusable: true, onClick: () => handleAddRoundClick() },
                          { title: 'Manage Waves', type: 'light-grey', isFocusable: true, onClick: () => setWavesPanelOpen(true) },
                        ]
                      : [{ title: 'Add Round', buttonIcon: faPlus, type: 'black', isFocusable: true, onClick: () => handleAddRoundClick() }]
                )}
              />
            ) : displayedRoundSections ? (
              displayedRoundSections.map(section => (
                <div className="sched-round-group" key={section.key}>
                  <GSActionBar
                    type="form-header"
                    header={
                      <div className="sched-round-group-header">
                        <div className="sched-round-group-header-title">{section.title}</div>
                        <div className="sched-round-group-header-desc">
                          {section.rounds.length === 1
                            ? 'All players and teams can play in this round'
                            : `Teams can play in one round (${formatOxfordList(section.rounds.map(r => ROUND_META[r]?.roundLetter ?? 'A'))})`}
                        </div>
                      </div>
                    }
                    // The Add Round shortcut is skipped for the wave-format
                    // catch-all "Not Assigned to Waves" section — it has no
                    // single Round Number of its own to link a new round
                    // into (see handleAddRoundToGroupClick). Round-Number
                    // groups have nothing to "manage" the way a wave does
                    // (no membership panel; dragging a round's own grabber,
                    // see RoundGroupList, is what reorders one), so the edit
                    // pencil stays wave-only — the group's cosmetic label is
                    // still editable via openLinkedRoundLabelPanel, but that
                    // entry point is hidden here for now.
                    pageActions={[
                      ...(section.key !== 'ungrouped' ? [
                        { buttonTitle: 'Add Course', buttonIcon: faPlus, type: 'grey', isFocusable: true, actionClick: () => handleAddRoundToGroupClick(section) },
                      ] : []),
                      ...(section.kind === 'wave' ? [
                        { buttonIcon: faPen, type: 'light-grey icon', actionClick: () => setWavesPanelOpen(true) },
                      ] : []),
                    ]}
                  />
                  <RoundGroupList
                    rounds={section.rounds}
                    onReorder={newOrder => setRoundOrderOverrides(prev => ({ ...prev, [section.key]: newOrder }))}
                    renderRound={r => (
                      <RoundListCard
                        name={roundCardName(r)}
                        roundMeta={ROUND_META[r]}
                        courseName={roundCourse(r)}
                        hasAssignments={Object.keys(assignmentsByRound[r] || {}).length > 0}
                        assignedCount={roundAssignedCounts[r]}
                        rosterCount={roundRosterCounts[r]}
                        hideRosterCount={tournament.hideRosterCount}
                        onOpenHoleAssignments={() => openRound(r)}
                        onEditRound={() => openEditRoundPanel(r)}
                        onCloneRound={() => handleCloneRoundClick(r)}
                      />
                    )}
                  />
                </div>
              ))
            ) : (
              filteredRounds.map(r => (
                <RoundListCard
                  key={r}
                  name={roundName(r)}
                  roundMeta={ROUND_META[r]}
                  courseName={roundCourse(r)}
                  waveName={roundWaveNameByNumber[r]}
                  hasAssignments={Object.keys(assignmentsByRound[r] || {}).length > 0}
                  assignedCount={roundAssignedCounts[r]}
                  rosterCount={roundRosterCounts[r]}
                  hideRosterCount={tournament.hideRosterCount}
                  onOpenHoleAssignments={() => openRound(r)}
                  onEditRound={() => openEditRoundPanel(r)}
                  onCloneRound={() => handleCloneRoundClick(r)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <AppSidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={activeRound !== undefined ? `${roundName(activeRound)} Hole Assignments` : 'Hole Assignments'}
        banner={isSwitchingRound ? null : panelBanner}
        expanded={panelExpanded}
        animateWidth={panelWidthAnimating}
        rightIcon={panelExpanded ? faDownLeftAndUpRightToCenter : faUpRightAndDownLeftFromCenter}
        onRightAction={toggleExpanded}
      >
        <div className="sched-panel-layout">
          <div className="sched-panel-action-bar">
            <GSActionBar
              type="x-large-pad H3"
              header={
                <>
                  {activeRound !== undefined ? `${roundName(activeRound)} Hole Assignments` : 'Hole Assignments'}
                  {(showWaveNav || showRoundNumberNav || showPlainRoundNav) && (
                    <div className="sched-wave-switch">
                      {/* Skipped for the plain (no wave, no Round Number
                          linking) case, and for a linked tournament's own
                          unlinked rounds — the header just above already
                          reads "{round name} Hole Assignments", so
                          repeating that same name here would just be
                          redundant; "Change Round" alone still says
                          exactly what tapping it does. */}
                      {!hideWaveSwitchLabel && (
                        <>
                          <span className="sched-wave-switch-name">
                            {showWaveNav ? `${activeWaveName} Wave` : activeRoundNumberGroupName}
                          </span>
                          <span className="sched-wave-switch-sep">|</span>
                        </>
                      )}
                      <button
                        type="button"
                        className="sched-wave-switch-link"
                        onClick={() => setWaveNavOpen(v => !v)}
                      >
                        {waveNavOpen ? 'Close' : 'Change Round'}
                      </button>
                    </div>
                  )}
                </>
              }
              pageActions={[
                {
                  buttonTitle: 'Auto Assign',
                  buttonIcon: faBolt,
                  type: 'black',
                  actionClick: () => {},
                },
                {
                  buttonIcon: faGear,
                  type: 'light-grey',
                  actionClick: () => {},
                },
              ]}
            />
          </div>

          {(showWaveNav || showRoundNumberNav || showPlainRoundNav) && (
            <WaveRoundNav
              isOpen={waveNavOpen}
              waves={showWaveNav ? wavesWithRounds : showRoundNumberNav ? roundNumberNavGroups : plainRoundNavGroups}
              activeWaveId={showWaveNav ? activeWaveId : showRoundNumberNav ? activeRoundNumberGroupId : 'all-rounds'}
              activeRound={activeRound}
              roundName={roundName}
              onSelectRound={round => { selectRound(round); setWaveNavOpen(false) }}
              groupLabel={showWaveNav ? 'Waves' : 'Rounds'}
            />
          )}

          <div className="sched-body">
            {/* ── Left: Holes ─────────────────────────────────────────────── */}
            <div
              className="sched-col sched-col--holes"
              style={{ '--col-header-offset': `${holesHeaderHidden ? 0 : holesHeaderHeight}px` }}
            >
              <div className="sched-col-scroll" ref={holesColScrollRef} onScroll={handleHolesScroll}>
                <div ref={holesHeaderRef} className={`sched-col-header${holesHeaderHidden ? ' sched-col-header--hidden' : ''}`}>
                  <div className="sched-col-title">
                    Assigned <span className="sched-col-count">({assignedCount}{!hidingAnyTeams ? `/${TOURNAMENT_TEAMS.length}` : ''})</span>
                  </div>
                  <GSinput
                    leftIcon={faMagnifyingGlass}
                    rightIcon={holeSearch ? faCircleXmark : undefined}
                    rightIconClick={() => setHoleSearch('')}
                    placeholder="Search players & teams…"
                    textValue={holeSearch}
                    onChange={e => setHoleSearch(e.target.value)}
                  />
                </div>
                {HOLE_DATA.map(hole => (
                  <HoleSection
                    key={hole.number}
                    hole={hole}
                    courseName={roundCourse(activeRound)}
                    assignments={assignments}
                    groupCount={groupCounts[hole.number] ?? 2}
                    selectedSlot={activeSlot}
                    highlightedSlots={highlightedSlots}
                    hasActiveSelection={hasActiveSelection}
                    flashSlots={flashSlots}
                    pendingSlots={pendingSlots}
                    onSlotClick={handleSlotClick}
                    onSwap={handleSlotSwap}
                    onAddGroup={handleAddGroup}
                    onRemoveGroup={handleRemoveGroup}
                    isVisible={holeVisible.has(hole.number)}
                  />
                ))}
                {holeVisible.size === 0 && (
                  <div className="sched-empty-msg">No results for "{holeSearch}"</div>
                )}
              </div>
            </div>

            {/* ── Right: Available Teams ─────────────────────────────────────
                Once every team in the tournament roster is assigned to this round
                (or filtered out via the round-exclusion panel), there's nothing left
                to show here — dropping the column lets the holes list take the
                full width instead of leaving an empty panel on screen. */}
            {availableTeams.length > 0 && (
              <div className="sched-col sched-col--teams">
                <div className="sched-col-scroll" ref={teamsColScrollRef} onScroll={handleTeamsScroll}>
                  <div className={`sched-col-header${teamsHeaderHidden ? ' sched-col-header--hidden' : ''}`}>
                    <div className="sched-col-title">
                      Unassigned <span className="sched-col-count">({filteredAvailableTeams.length})</span>
                    </div>
                    <GSinput
                      leftIcon={faMagnifyingGlass}
                      rightIcon={teamSearch ? faCircleXmark : undefined}
                      rightIconClick={() => setTeamSearch('')}
                      placeholder="Search players & teams…"
                      textValue={teamSearch}
                      onChange={e => setTeamSearch(e.target.value)}
                    />
                  </div>
                  {useLegacyFilter && (
                    <div className="sched-teams-notice">
                      <span className="sched-teams-notice-text">
                        {excludedRounds.size > 0
                          ? (() => {
                              const visibleRounds = ROUNDS.length - excludedRounds.size
                              return `Displaying ${availableTeams.length} Unassigned Teams From ${visibleRounds} Round${visibleRounds === 1 ? '' : 's'}`
                            })()
                          : 'Displaying All Teams'}
                      </span>
                      {hasMultipleRounds && (
                        <button
                          type="button"
                          className="sched-teams-notice-link"
                          onClick={() => setFilterPanelOpen(true)}
                        >
                          Filter
                        </button>
                      )}
                    </div>
                  )}
                  {filteredAvailableTeams.length === 0 && (
                    <div className="sched-empty-msg">No results for "{teamSearch}"</div>
                  )}
                  {filteredAvailableTeams.length > 0 && (
                    <div className={`sched-teams-list${panelExpanded ? ' sched-teams-list--bento' : ''}`}>
                      {filteredAvailableTeams.map(team => (
                        <TeamCard
                          key={team.name}
                          team={team}
                          isSelected={selectedTeam === team.name}
                          isHighlighted={(teamsHighlighted || !!selectedTeamSlot) && selectedTeam !== team.name}
                          showSwap={!!selectedTeamSlot}
                          isFlashing={flashTeams.has(team.name)}
                          isPending={pendingTeams.has(team.name)}
                          onClick={() => handleTeamClick(team.name)}
                          onSwap={() => handleTeamSwap(team.name)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {isSwitchingRound && (
            <GSLoadingSpinnerOverlay
              spinnerSize="large"
              mainText="Loading Round…"
            />
          )}
        </div>
      </AppSidePanel>

      {useLegacyFilter && hasMultipleRounds && (
        <AppSidePanel
          isOpen={filterPanelOpen}
          onClose={() => setFilterPanelOpen(false)}
          title="Unassigned Filter"
          noTransition
          dimOverlay={false}
          actions={[
            { name: 'Done', type: 'light-grey', action: () => setFilterPanelOpen(false) },
          ]}
        >
        <GSActionBar type="form-header H3" header={`Filter ${roundName(activeRound)} Available Teams`} />
        <GSFormSection
          extras={
            <div className="sched-filter-panel-body">
              <div className="sched-filter-stat-header">
                <div className="sched-filter-stat-top">
                  <div className="sched-filter-stat-main">
                    <div className="sched-filter-stat-count">{availableTeams.length}</div>
                    <div className="sched-filter-stat-label">Available Teams</div>
                  </div>
                  {excludedRounds.size > 0 && (
                    <GSButton
                      type="grey"
                      buttonIcon={faArrowsRotate}
                      title="Reset"
                      isFocusable
                      onClick={clearExcludedRounds}
                    />
                  )}
                </div>
                <div className="sched-filter-stat-desc">Assigned teams hidden from {roundName(activeRound)}, will not be available for assignment.</div>
              </div>
              <div className="sched-filter-round-list">
                {ROUNDS.map(r => (
                  <FilterRoundCard
                    key={r}
                    name={roundName(r)}
                    roundMeta={ROUND_META[r]}
                    courseName={roundCourse(r)}
                    activeRoundName={roundName(activeRound)}
                    isActive={r === activeRound}
                    assignedCount={roundAssignedCounts[r]}
                    availableCount={roundAvailableCounts[r]}
                    isExcluded={excludedRounds.has(r)}
                    onToggleExclude={() => toggleExcludedRound(r)}
                  />
                ))}
              </div>
            </div>
          }
        />
      </AppSidePanel>
      )}

      {!useLegacyFilter && (
        <AppSidePanel
          isOpen={settingsPanelOpen}
          onClose={() => setSettingsPanelOpen(false)}
          title="Rounds & Scorecards Settings"
          actions={[
            { name: 'Save', type: 'black', action: saveSettings },
            { name: 'Cancel', type: 'grey', action: () => setSettingsPanelOpen(false) },
          ]}
        >
          <GSActionBar type="form-header H3" header="Rounds & Scorecards Settings" />
          <GSFormSection
            fields={[
              {
                label: 'Allow Multiple Hole Assignments',
                description: 'Allow players & teams to be assigned to multiple rounds',
                isEditable: true,
                customView: true,
                value: (
                  <GStoggle
                    value={draftAllowMultipleAssignments}
                    onClick={() => setDraftAllowMultipleAssignments(v => !v)}
                    trueDescription="Yes"
                    falseDescription="No"
                  />
                ),
              },
            ]}
          />
        </AppSidePanel>
      )}

      <AppSidePanel
        isOpen={roundSetupPanelOpen}
        onClose={() => setRoundSetupPanelOpen(false)}
        onBack={handleRoundSetupBack}
        title="Round Setup"
        actions={
          // Every tile commits on tap (see pickRoundFormat) — the only time
          // this panel needs its own action buttons is the format-change
          // warning above, intercepting a tile tap that would actually
          // change an existing format instead of committing it outright.
          formatChangeWarningOpen
            ? [
                { name: 'Go Back', type: 'grey', action: cancelFormatChangeWarning },
                {
                  name: changingFromWavesToOther ? 'Remove Waves & Continue' : 'Change Format & Continue',
                  type: changingFromWavesToOther ? 'red' : 'orange',
                  action: () => commitRoundFormat(),
                },
              ]
            : []
        }
      >
        {formatChangeWarningOpen ? (
          <>
            <GSActionBar type="form-header H3" header={changingFromWavesToOther ? 'Remove Waves?' : 'Change Round Format?'} />
            <GSFormSection
              extras={
                <div className="sched-format-warning">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="sched-format-warning-icon" />
                  <div className="sched-format-warning-text">
                    {changingFromWavesToOther ? (
                      <>
                        <div className="sched-format-warning-title">Switching away from Waves removes every wave</div>
                        <div className="sched-format-warning-desc">
                          This tournament has {waves.length} wave{waves.length === 1 ? '' : 's'}. Switching formats will
                          delete {waves.length === 1 ? 'it' : 'them'} — teams that were only available within a wave will
                          become available for assignment in all rounds.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="sched-format-warning-title">This tournament already has rounds set up</div>
                        <div className="sched-format-warning-desc">
                          Changing the round format may affect how those rounds are organized.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              }
            />
          </>
        ) : roundSetupStep === 'type' ? (
          <>
            <GSActionBar type="form-header H3" header="How Many Rounds?" />
            <GSFormSection
              extras={
                <div className="sched-format-option-list">
                  {ROUND_TYPE_OPTIONS.map(option => {
                    // Single Round only makes sense with exactly one round — with
                    // 2+ already created, picking it would require deleting rounds
                    // down to one first, so it's disabled rather than offered.
                    const isDisabled = option.value === 'single' && hasMultipleRounds
                    // Multiple Rounds reads as selected for any format behind
                    // it — Sequence, or either of Wave's own assignment-scope
                    // answers — so backing out of the later steps still shows
                    // where the draft currently stands.
                    const isSelected = option.value === 'single'
                      ? roundFormat === 'single'
                      : !!roundFormat && roundFormat !== 'single'
                    return (
                      <RoundFormatOption
                        key={option.value}
                        iconText={option.iconText}
                        title={option.title}
                        playDescription={option.description}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        disabledReason="Delete rounds down to one to select this format."
                        advancesToNextStep={option.value === 'multiple'}
                        onClick={() => pickRoundType(option.value)}
                      />
                    )
                  })}
                </div>
              }
            />
          </>
        ) : roundSetupStep === 'format' ? (
          <>
            <GSActionBar type="form-header H3" header="Choose a Round Format" />
            <GSFormSection
              extras={
                <div className="sched-format-option-list">
                  {MULTI_ROUND_FORMAT_OPTIONS.map(option => (
                    <RoundFormatOption
                      key={option.value}
                      icon={option.icon}
                      title={option.title}
                      playDescription={option.availabilityDescription}
                      // Wave reads as selected for either of the two
                      // assignment-scope answers behind it, so backing out of
                      // that step still shows where the draft currently
                      // stands (same convention as Multiple Rounds above).
                      isSelected={option.value === 'waves' ? formatManagesWaves(roundFormat) : roundFormat === option.value}
                      advancesToNextStep={option.value === 'waves'}
                      onClick={() => pickMultiRoundFormat(option.value)}
                    />
                  ))}
                </div>
              }
            />
          </>
        ) : (
          <>
            <GSActionBar type="form-header H3" header="Assign Players & Teams" />
            <GSFormSection
              extras={
                <div className="sched-format-option-list">
                  {WAVE_SCOPE_OPTIONS.map(option => (
                    <RoundFormatOption
                      key={option.value}
                      icon={option.icon}
                      title={option.title}
                      playDescription={option.description}
                      isSelected={roundFormat === option.value}
                      onClick={() => pickRoundFormat(option.value)}
                    />
                  ))}
                </div>
              }
            />
          </>
        )}
      </AppSidePanel>

      <WavesPanel
        isOpen={wavesPanelOpen}
        onClose={() => setWavesPanelOpen(false)}
        waves={waves}
        roundName={roundName}
        roundCourse={roundCourse}
        onStartAddWave={openAddWaveForm}
        onSetWaveOrder={setWaveOrder}
        onViewWave={openWaveRoundsPanel}
        onAddRound={handleAddRoundClick}
        unassignedRounds={waveRoundsAvailableRounds}
      />

      <WaveRoundsPanel
        isOpen={waveRoundsPanelOpen}
        onClose={closeWaveRoundsPanel}
        wave={waveRoundsTargetWave}
        linkedRounds={waveRoundsLinkedRounds}
        availableRounds={waveRoundsLinkableRounds}
        onAddRound={handleWaveRoundsAddRound}
        onRemoveRound={round => unlinkRoundFromWave(waveRoundsTargetWaveId, round)}
        onEditName={() => openEditWaveNamePanel(waveRoundsTargetWaveId)}
        onCreateRound={() => handleAddRoundClick(waveRoundsTargetWaveId)}
        onStartDelete={openDeleteWavePanel}
        dimOverlay={false}
        noTransition
      />

      {/* Declared after WaveRoundsPanel so it stacks on top of it, same
          reasoning as AddWavePanel/CreateRoundPanel below. */}
      <SwapRoundWavePanel
        isOpen={swapRoundPanelOpen}
        onClose={closeSwapRoundPanel}
        onConfirm={handleConfirmSwapRound}
        roundName={swapRoundNumber != null ? roundName(swapRoundNumber) : ''}
        fromWaveName={swapRoundNumber != null ? roundWaveNameByNumber[swapRoundNumber] : ''}
        toWaveName={waveRoundsTargetWave?.name}
      />

      <DeleteWavePanel
        isOpen={deleteWaveFormOpen}
        onClose={closeDeleteWaveForm}
        onDelete={handleConfirmDeleteWave}
        waveName={waveRoundsTargetWave?.name}
        dimOverlay={false}
        noTransition
      />

      {/* Declared after WaveRoundsPanel so it stacks on top when opened from
          its edit pencil (later in DOM order wins the same-z-index overlap),
          same reasoning as CreateRoundPanel being declared last. */}
      <AddWavePanel
        isOpen={addWaveFormOpen}
        onClose={closeAddWaveForm}
        onSave={handleAddWaveSave}
        initialName={editingWaveId != null ? waves.find(w => w.id === editingWaveId)?.name ?? '' : null}
        dimOverlay={false}
        noTransition
      />

      <LinkedRoundLabelPanel
        isOpen={linkedRoundLabelPanelOpen}
        onClose={closeLinkedRoundLabelPanel}
        onSave={saveLinkedRoundLabel}
        roundNumber={editingLinkedRoundNumber}
        initialLabel={editingLinkedRoundNumber != null ? linkedRoundLabels[editingLinkedRoundNumber] : ''}
      />

      {/* Round Number linking's own Linked/Unlinked picker (see
          handleAddRoundClick) — precedes CreateRoundPanel itself, so it's
          declared just above it in this same stacking-order convention. */}
      <AppSidePanel
        isOpen={addRoundChoicePanelOpen}
        onClose={closeAddRoundChoicePanel}
        onBack={addRoundChoiceStep === 'target' ? () => setAddRoundChoiceStep('choice') : undefined}
        title={cloningRound != null ? 'Copy Round' : 'Add Round'}
        dimOverlay={!addRoundTargetWaveId}
        noTransition={!!addRoundTargetWaveId}
      >
        {addRoundChoiceStep === 'choice' ? (
          <>
            <GSActionBar type="form-header H3" header="Add Round" />
            <GSFormSection
              extras={
                <div className="sched-format-option-list">
                  <RoundFormatOption
                    icon={faLink}
                    title="Link to Existing Round"
                    playDescription="A portion of players and teams will play in this round."
                    advancesToNextStep={roundNumberGroups.length > 1}
                    onClick={chooseLinkedRound}
                  />
                  <RoundFormatOption
                    icon={faLinkSlash}
                    title="Add New Round"
                    playDescription="All players and teams will play in this round."
                    onClick={chooseUnlinkedRound}
                  />
                </div>
              }
            />
          </>
        ) : (
          <>
            <GSActionBar type="form-header H3" header="Link to Which Round?" />
            <GSFormSection
              extras={
                <div className="sched-format-option-list">
                  {roundNumberGroups.map(group => (
                    <RoundFormatOption
                      key={group.number}
                      iconText={String(group.number)}
                      title={linkedGroupLabel(group.number, roundName(group.entries[0].round))}
                      playDescription={roundCourse(group.entries[0].round)}
                      onClick={() => linkToRoundNumber(group.number)}
                    />
                  ))}
                </div>
              }
            />
          </>
        )}
      </AppSidePanel>

      <CreateRoundPanel
        isOpen={createRoundPanelOpen}
        onClose={closeCreateRoundPanel}
        onCreate={handleCreateRound}
        editingMeta={editingRoundNumber != null ? ROUND_META[editingRoundNumber] : null}
        editingRoundKey={editingRoundNumber}
        duplicateFromMeta={duplicateFromMeta}
        dimOverlay={!createRoundOpenedFromWave}
        noTransition={createRoundOpenedFromWave || createRoundOpenedFromLinkChoice}
        initialRoundNumber={createRoundInitialNumber}
        waveOptions={editingRoundNumber != null ? [] : waveQuickSelectOptions}
        selectedWaveOption={selectedWaveQuickOption}
        onSelectWave={option => setCreateRoundTargetWaveId(
          option.value === NO_WAVE_OPTION_VALUE ? null : option.value
        )}
        roundNumberGroups={roundNumberGroups}
      />
    </div>
  )
}
