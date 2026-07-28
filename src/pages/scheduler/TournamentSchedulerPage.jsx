import { useState, useMemo, useRef, useLayoutEffect } from 'react'
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
} from '@fortawesome/free-solid-svg-icons'
import GSinput from '../../gs-lib/components/gs-input'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GStoggle from '../../gs-lib/components/gs-toggle'
import GSButton from '../../gs-lib/components/gs-button'
import AppSidePanel from '../../components/AppSidePanel'
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

// ── Sub-components ─────────────────────────────────────────────────────────────

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

function FilterRoundCard({ name, roundMeta, courseName, activeRoundName, isActive, assignedCount, availableCount, isExcluded, onToggleExclude }) {
  const meta = roundMeta
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
        <span className={`sched-round-status sched-round-status--${meta.status.toLowerCase()}`}>{meta.status}</span>
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
function RoundListCard({ name, roundMeta, courseName, hasAssignments, onOpenHoleAssignments }) {
  const meta = roundMeta
  return (
    <div className="sched-round-card">
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
        <span className={`sched-round-status sched-round-status--${meta.status.toLowerCase()}`}>{meta.status}</span>
      </div>
      <div className="sched-round-card-actions">
        {!hasAssignments && (
          <GSButton type="light-grey" isFocusable buttonIcon={faPen} title="Edit Round" onClick={() => {}} />
        )}
        <GSButton type="light-grey" isFocusable buttonIcon={faBolt} title="Hole Assignments" onClick={onOpenHoleAssignments} />
        {hasAssignments && (
          <GSButton type="green" isFocusable title="Start Round" onClick={() => {}} />
        )}
        <GSButton type="light-grey icon" size="primary" isFocusable buttonIcon={faClone} onClick={() => {}} />
      </div>
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
  const ROUND_META = tournament.rounds
  const ROUNDS = Object.keys(ROUND_META).map(Number).sort((a, b) => a - b)
  const hasMultipleRounds = ROUNDS.length >= 2

  // This event's registered roster — a prefix of the shared team pool, sized per
  // tournament (falls back to the full pool for tournaments with no explicit count).
  const TOURNAMENT_TEAMS = useMemo(
    () => SORTED_TEAMS.slice(0, tournament.teamCount ?? SORTED_TEAMS.length),
    [tournament]
  )

  function roundName(r) {
    return ROUND_META[r]?.name ?? `Round ${r}`
  }
  function roundCourse(r) {
    return ROUND_META[r]?.course ?? COURSE_NAME
  }

  const [panelOpen, setPanelOpen] = useState(false)
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [panelWidthAnimating, setPanelWidthAnimating] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

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

  const [activeRound, setActiveRound] = useState(ROUNDS[0])

  // Per-round assignments: { 1: { slotId: teamName }, 2: { slotId: teamName }, ... }
  // Rounds start empty except where the tournament defines a seeded starting state.
  const [assignmentsByRound, setAssignmentsByRound] = useState(() => (
    Object.fromEntries(ROUNDS.map(r => [r, { ...(tournament.initialAssignments?.[r] ?? {}) }]))
  ))

  const assignments = assignmentsByRound[activeRound]

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
  }

  // Per-round hole grouping counts: { [round]: { [holeNumber]: groupCount } }.
  // Every hole starts with the standard A/B pair; the "+" control lets each hole
  // grow additional groups (C, D, …) independently, per round.
  const [groupCountsByRound, setGroupCountsByRound] = useState(() => (
    Object.fromEntries(ROUNDS.map(r => [r, Object.fromEntries(HOLE_DATA.map(h => [h.number, 2]))]))
  ))

  const groupCounts = groupCountsByRound[activeRound]

  function setGroupCounts(updater) {
    setGroupCountsByRound(prev => ({
      ...prev,
      [activeRound]: typeof updater === 'function' ? updater(prev[activeRound]) : updater,
    }))
  }

  const totalSlotsByRound = useMemo(() => (
    Object.fromEntries(ROUNDS.map(r => [
      r,
      Object.values(groupCountsByRound[r] || {}).reduce((sum, n) => sum + n, 0),
    ]))
  ), [groupCountsByRound])

  // selection: either a team name or a slot id is active, never both
  const [selectedTeam, setSelectedTeam]   = useState(null)
  const [selectedSlot, setSelectedSlot]   = useState(null)
  const [holeSearch, setHoleSearch]       = useState('')
  const [teamSearch, setTeamSearch]       = useState('')
  const [roundListSearch, setRoundListSearch] = useState('')

  // Rounds shown on the tournament landing view, filtered by round number/name.
  const filteredRounds = useMemo(() => {
    const q = roundListSearch.trim().toLowerCase()
    if (!q) return ROUNDS
    return ROUNDS.filter(r => roundName(r).toLowerCase().includes(q) || String(r).includes(q))
  }, [ROUNDS, roundListSearch])

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

  // Rounds whose already-assigned teams should also be hidden from a given round's
  // unassigned list (set from the Filter panel's per-round toggles). Scoped per round —
  // e.g. hiding Round 1 while working on Round 2 shouldn't also hide it while on Round 3.
  const [excludedRoundsByRound, setExcludedRoundsByRound] = useState(() => (
    Object.fromEntries(ROUNDS.map(r => [r, new Set()]))
  ))

  const excludedRounds = excludedRoundsByRound[activeRound]

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

  // How many teams would be available for each round, given that round's own
  // assignments plus whichever other rounds it has chosen to hide via the Filter panel.
  const roundAvailableCounts = useMemo(() => {
    const result = {}
    ROUNDS.forEach(r => {
      const hiddenTeams = new Set(Object.values(assignmentsByRound[r] || {}))
      excludedRoundsByRound[r]?.forEach(er => {
        Object.values(assignmentsByRound[er] || {}).forEach(name => hiddenTeams.add(name))
      })
      result[r] = TOURNAMENT_TEAMS.length - hiddenTeams.size
    })
    return result
  }, [assignmentsByRound, excludedRoundsByRound, TOURNAMENT_TEAMS])

  // Teams that are already assigned in this round (not in the available pool)
  const assignedTeamNames = useMemo(() => new Set(Object.values(assignments)), [assignments])

  // Teams assigned in any round the user has chosen to exclude via the Filter panel
  const filterExcludedTeamNames = useMemo(() => {
    const names = new Set()
    excludedRounds.forEach(r => {
      Object.values(assignmentsByRound[r] || {}).forEach(name => names.add(name))
    })
    return names
  }, [excludedRounds, assignmentsByRound])

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
    () => ROUNDS.reduce((acc, r) => ({ ...acc, [r]: Object.keys(assignmentsByRound[r]).length }), {}),
    [assignmentsByRound]
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
          { buttonTitle: 'Add Round', buttonIcon: faPlus, type: 'black', actionClick: () => {} },
          { buttonTitle: 'Team Check In', buttonIcon: faListCheck, type: 'light-grey', actionClick: () => {} },
          { buttonTitle: 'Documents', buttonIcon: faFolderOpen, type: 'light-grey', actionClick: () => {} },
        ]}
      />

      <div className="sched-round-list-page">
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
        <div className="sched-col-scroll">
          {filteredRounds.map(r => (
            <RoundListCard
              key={r}
              name={roundName(r)}
              roundMeta={ROUND_META[r]}
              courseName={roundCourse(r)}
              hasAssignments={Object.keys(assignmentsByRound[r] || {}).length > 0}
              onOpenHoleAssignments={() => openRound(r)}
            />
          ))}
        </div>
      </div>

      <AppSidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Shotgun Assignment"
        banner={panelBanner}
        expanded={panelExpanded}
        animateWidth={panelWidthAnimating}
        rightIcon={panelExpanded ? faDownLeftAndUpRightToCenter : faUpRightAndDownLeftFromCenter}
        onRightAction={toggleExpanded}
      >
        <div className="sched-panel-layout">
          <div className="sched-panel-action-bar">
            <GSActionBar
              type="x-large-pad H3"
              header={`${roundName(activeRound)} Hole Assignments`}
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

          <div className="sched-round-tabs">
            {ROUNDS.map(r => (
              <button
                key={r}
                className={`sched-round-tab${activeRound === r ? ' sched-round-tab--active' : ''}`}
                onClick={() => switchRound(r)}
              >
                {roundName(r)}
                <span className="sched-round-tab-count">
                  {roundAssignedCounts[r]}/{totalSlotsByRound[r]}
                </span>
              </button>
            ))}
          </div>

          <div className="sched-body">
            {/* ── Left: Holes ─────────────────────────────────────────────── */}
            <div
              className="sched-col sched-col--holes"
              style={{ '--col-header-offset': `${holesHeaderHidden ? 0 : holesHeaderHeight}px` }}
            >
              <div className="sched-col-scroll" onScroll={handleHolesScroll}>
                <div ref={holesHeaderRef} className={`sched-col-header${holesHeaderHidden ? ' sched-col-header--hidden' : ''}`}>
                  <div className="sched-col-title">
                    Assigned <span className="sched-col-count">({assignedCount}{excludedRounds.size === 0 ? `/${TOURNAMENT_TEAMS.length}` : ''})</span>
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
                <div className="sched-col-scroll" onScroll={handleTeamsScroll}>
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
        </div>
      </AppSidePanel>

      {hasMultipleRounds && (
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
    </div>
  )
}
