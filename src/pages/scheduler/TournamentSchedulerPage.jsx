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
  faCircleCheck,
  faListOl,
  faWater,
  faShuffle,
  faTriangleExclamation,
  fa1,
} from '@fortawesome/free-solid-svg-icons'
import GSinput from '../../gs-lib/components/gs-input'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GStoggle from '../../gs-lib/components/gs-toggle'
import GSButton from '../../gs-lib/components/gs-button'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import AppSidePanel from '../../components/AppSidePanel'
import CreateRoundPanel from './CreateRoundPanel'
import WavesPanel from './WavesPanel'
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

// Round Setup: the four ways a tournament's rounds can relate to each other.
// Each format's description is split into two lines: the first covers how
// the round(s) are played, the second covers how that shapes player
// availability (single round vs. all rounds vs. one round vs. multiple).
const ROUND_FORMAT_OPTIONS = [
  {
    value: 'single',
    icon: fa1,
    title: 'Single Round',
    // No play/availability split here — with only one round, there's
    // nothing to distinguish between the two, so the tile shows just the
    // icon and title.
  },
  {
    value: 'rounds',
    icon: faListOl,
    title: 'Multi Round',
    playDescription: 'Rounds are played one after another.',
    availabilityDescription: 'Players are available to play in all rounds.',
  },
  {
    value: 'waves',
    icon: faWater,
    title: 'Waves',
    playDescription: 'Rounds are played simultaneously or sequentially.',
    availabilityDescription: 'Players are available to play in one round.',
  },
  {
    value: 'hybrid',
    icon: faShuffle,
    title: 'Hybrid',
    playDescription: 'Rounds are played either simultaneously or sequentially.',
    availabilityDescription: 'Players are available to play in multiple rounds.',
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

// Landing-view summary of the tournament's saved Round Setup choice — sits at
// the very top of the scrollable round list, above the sticky search bar, so it
// scrolls out of view on long lists while the search bar stays pinned. The
// pencil reopens the same picker used for initial setup, pre-selected to the
// current choice.
function RoundFormatSummary({ option, onEdit }) {
  return (
    <div className="sched-format-summary">
      <div className="sched-format-summary-icon">
        <FontAwesomeIcon icon={option.icon} />
      </div>
      <div className="sched-format-summary-text">
        <div className="sched-format-summary-title">{option.title} Format</div>
        {option.playDescription && (
          <div className="sched-format-summary-desc">{option.playDescription}</div>
        )}
      </div>
      <GSButton
        type="light-grey icon"
        size="secondary"
        isFocusable
        buttonIcon={faPen}
        onClick={onEdit}
      />
    </div>
  )
}

function RoundFormatOption({ icon, title, playDescription, availabilityDescription, isSelected, isDisabled, disabledReason, onClick }) {
  return (
    <div
      className={`sched-format-option${isSelected ? ' sched-format-option--selected' : ''}${isDisabled ? ' sched-format-option--disabled' : ''}`}
      onClick={isDisabled ? undefined : onClick}
    >
      <div className="sched-format-option-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="sched-format-option-text">
        <div className="sched-format-option-title">{title}</div>
        {isDisabled ? (
          <div className="sched-format-option-desc">{disabledReason}</div>
        ) : playDescription && (
          // First line covers how the round(s) are played, second covers how
          // that shapes player availability — the left rule visually groups
          // them as two facets of the same "what this means" explanation.
          // Omitted entirely for formats (Single Round) with nothing to split.
          <div className="sched-format-option-desc-list">
            <div className="sched-format-option-desc">{playDescription}</div>
            <div className="sched-format-option-desc">{availabilityDescription}</div>
          </div>
        )}
      </div>
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
function RoundListCard({ name, roundMeta, courseName, waveName, hasAssignments, assignedCount, rosterCount, hideRosterCount, onOpenHoleAssignments }) {
  const meta = roundMeta
  const isFullyAssigned = rosterCount > 0 && assignedCount === rosterCount
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
        {waveName && (
          <span className="sched-wave-badge">
            <FontAwesomeIcon icon={faWater} /> {waveName}
          </span>
        )}
        <span className={`sched-round-status sched-round-status--${meta.status.toLowerCase()}`}>{meta.status}</span>
        {!hideRosterCount && (
          <div className={`sched-round-roster${isFullyAssigned ? ' sched-round-roster--complete' : ''}`}>
            {isFullyAssigned && <FontAwesomeIcon icon={faCircleCheck} />}
            {assignedCount}/{rosterCount} Teams Assigned
          </div>
        )}
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

  function roundName(r) {
    return ROUND_META[r]?.name ?? `Round ${r}`
  }
  function roundCourse(r) {
    return ROUND_META[r]?.course ?? COURSE_NAME
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
  const [savedRoundFormat, setSavedRoundFormat] = useState(null)
  const [formatChangeWarningOpen, setFormatChangeWarningOpen] = useState(false)

  function openRoundSetup() {
    setRoundFormat(savedRoundFormat)
    setFormatChangeWarningOpen(false)
    setRoundSetupPanelOpen(true)
  }

  // Nothing to lose yet (no rounds, no waves) once this is false — a format
  // change is free to happen the instant a tile is tapped instead of needing
  // an explicit Save. Once real setup exists, Save (with its warning step) is
  // still required to actually change it.
  function hasExistingRoundSetup() {
    return hasRounds || waves.length > 0
  }

  function pickRoundFormat(format) {
    setRoundFormat(format)
    if (!hasExistingRoundSetup()) commitRoundFormat(format)
  }

  function saveRoundFormat() {
    const isChangingFormat = !!savedRoundFormat && roundFormat !== savedRoundFormat
    if (hasExistingRoundSetup() && isChangingFormat) {
      setFormatChangeWarningOpen(true)
      return
    }
    commitRoundFormat()
  }

  function cancelFormatChangeWarning() {
    setFormatChangeWarningOpen(false)
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

  function openCreateRoundPanel(targetWaveId = null) {
    setCreateRoundTargetWaveId(targetWaveId)
    setCreateRoundOpenedFromWave(!!targetWaveId)
    setCreateRoundPanelOpen(true)
  }

  function handleCreateRound(roundMeta) {
    const nextRound = ROUNDS.length ? Math.max(...ROUNDS) + 1 : 1
    setCustomRounds(prev => ({ ...prev, [nextRound]: roundMeta }))
    setAssignmentsByRound(prev => ({ ...prev, [nextRound]: {} }))
    setGroupCountsByRound(prev => ({ ...prev, [nextRound]: Object.fromEntries(HOLE_DATA.map(h => [h.number, 2])) }))
    setExcludedRoundsByRound(prev => ({ ...prev, [nextRound]: new Set() }))
    if (createRoundTargetWaveId) {
      setWaves(prev => prev.map(w => (
        w.id === createRoundTargetWaveId ? { ...w, roundIds: [...w.roundIds, nextRound] } : w
      )))
    }
    setActiveRound(nextRound)
    setCreateRoundTargetWaveId(null)
    setCreateRoundOpenedFromWave(false)
    setCreateRoundPanelOpen(false)
  }

  // Waves: grouping of rounds played simultaneously/sequentially where each team
  // plays only one of them. A wave's roundIds link out to ROUND_META entries
  // created either from inside the wave (Create Round) or picked from the
  // tournament's other existing rounds (Link Existing Round) — a round belongs
  // to at most one wave at a time.
  const [waves, setWaves] = useState([])
  const [wavesPanelOpen, setWavesPanelOpen] = useState(false)
  const waveIdCounterRef = useRef(1)

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

  function addWave(name) {
    const id = waveIdCounterRef.current++
    setWaves(prev => [...prev, { id, name: name?.trim() || `Wave ${prev.length + 1}`, roundIds: [] }])
  }

  function renameWave(id, name) {
    setWaves(prev => prev.map(w => (w.id === id ? { ...w, name } : w)))
  }

  function deleteWave(id) {
    setWaves(prev => prev.filter(w => w.id !== id))
  }

  // Wave order drives both the Waves panel's card order and the landing
  // view's wave-grouped round sections (see groupedRoundSections below), so
  // reordering here reorders both at once. Drag-to-reorder from WavesPanel:
  // draggedId is picked up out of the list and dropped in at whichever
  // wave's position it was released on.
  function reorderWave(draggedId, targetId) {
    setWaves(prev => {
      const dragIndex = prev.findIndex(w => w.id === draggedId)
      const targetIndex = prev.findIndex(w => w.id === targetId)
      if (dragIndex === -1 || targetIndex === -1) return prev
      const next = [...prev]
      const [dragged] = next.splice(dragIndex, 1)
      next.splice(targetIndex, 0, dragged)
      return next
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
        title: w.name,
        rounds: filteredRounds.filter(r => w.roundIds.includes(r)),
      }))
      .filter(section => section.rounds.length > 0)
    sections.forEach(section => section.rounds.forEach(r => groupedRoundNumbers.add(r)))
    const ungroupedRounds = filteredRounds.filter(r => !groupedRoundNumbers.has(r))
    if (ungroupedRounds.length > 0) {
      sections.push({ key: 'ungrouped', title: 'Not Assigned to Waves', rounds: ungroupedRounds })
    }
    return sections
  }, [waves, filteredRounds])

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
  // via the legacy per-round Filter panel, or the newer global Settings toggle.
  const hidingAnyTeams = !roundIsWaveExempt(activeRound) && (
    (useLegacyFilter ? excludedRounds.size > 0 : (hideTeamsAssignedElsewhere || waveFormatExclusive))
    || (hybridWaveScoped && waveMateRounds(activeRound).length > 0)
  )

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
      result[r] = teamsForRound(r).length - hiddenTeams.size
    })
    return result
  }, [assignmentsByRound, useLegacyFilter, excludedRoundsByRound, hideTeamsAssignedElsewhere, waveFormatExclusive, hybridWaveScoped, savedRoundFormat, roundWaveIdByNumber, tournament, ROUNDS, waves])

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
    return names
  }, [useLegacyFilter, excludedRounds, hideTeamsAssignedElsewhere, waveFormatExclusive, hybridWaveScoped, savedRoundFormat, roundWaveIdByNumber, assignmentsByRound, activeRound, ROUNDS, waves])

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

  // Rolls every round's roster + assigned count up into one number, so a large
  // multi-round/multi-wave event can see at a glance whether every team across
  // every round has been placed — instead of opening each round individually and
  // manually cross-checking that nothing was missed.
  const totalRosterAcrossRounds = useMemo(
    () => ROUNDS.reduce((sum, r) => sum + roundRosterCounts[r], 0),
    [ROUNDS, roundRosterCounts]
  )
  const totalAssignedAcrossRounds = useMemo(
    () => ROUNDS.reduce((sum, r) => sum + roundAssignedCounts[r], 0),
    [ROUNDS, roundAssignedCounts]
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

  // Wave nav inside the Hole Assignments panel: once a tournament has 2+ waves,
  // both are surfaced as tabs (so you can jump straight from one wave into the
  // other) and a second row of round tabs scoped to whichever wave is active
  // lets you move between that wave's own rounds without leaving the panel. A
  // round that isn't linked into any wave (or a tournament with fewer than 2
  // waves) just falls back to the plain, ungrouped round tabs below.
  const activeWaveId = activeRound !== undefined ? roundWaveIdByNumber[activeRound] : undefined
  const wavesWithRounds = useMemo(() => waves.filter(w => w.roundIds.length > 0), [waves])
  const showWaveNav = wavesWithRounds.length >= 2 && activeWaveId !== undefined
  const activeWave = showWaveNav ? wavesWithRounds.find(w => w.id === activeWaveId) : undefined

  function switchWave(waveId) {
    if (waveId === activeWaveId) return
    const wave = wavesWithRounds.find(w => w.id === waveId)
    if (wave?.roundIds.length) switchRound(wave.roundIds[0])
  }

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
          // A Single Round tournament's one round already exists — there's
          // nothing left to add, so the primary action drops out entirely
          // rather than offering an Add Round that would just be rejected.
          ...(hasRounds
            ? (savedRoundFormat === 'single'
                ? []
                // Waves and Hybrid both organize every round into a wave, so
                // Manage Waves stays primary for both — Add Round is still
                // offered alongside it (with a wave quick-select, see
                // CreateRoundPanel) so it isn't a dead end either.
                : formatManagesWaves(savedRoundFormat)
                  ? [
                      { buttonTitle: 'Manage Waves', buttonIcon: faWater, type: 'black', actionClick: () => setWavesPanelOpen(true) },
                      { buttonTitle: 'Add Round', buttonIcon: faPlus, type: 'light-grey', actionClick: () => openCreateRoundPanel() },
                    ]
                  : [{ buttonTitle: 'Add Round', buttonIcon: faPlus, type: 'black', actionClick: () => openCreateRoundPanel() }])
            : [{ buttonTitle: 'Round Setup', type: 'black', actionClick: openRoundSetup }]),
          ...(hasRounds && savedRoundFormat !== 'single' ? [
            { buttonTitle: 'Team Check In', buttonIcon: faListCheck, type: 'light-grey', actionClick: () => {} },
          ] : []),
          ...(hasRounds ? [
            { buttonTitle: 'Documents', buttonIcon: faFolderOpen, type: 'light-grey', actionClick: () => {} },
          ] : []),
          ...(!useLegacyFilter && hasRounds && !tournament.hideSettingsButton ? [{ buttonIcon: faGear, type: 'light-grey', actionClick: openSettingsPanel }] : []),
        ]}
      />

      <div className="sched-round-list-page">
        <div
          className="sched-col-scroll"
          style={{ '--round-group-header-offset': `${roundListStickyHeight}px` }}
        >
          {savedRoundFormat && (
            <div className="sched-format-summary-wrap">
              <RoundFormatSummary
                option={ROUND_FORMAT_OPTIONS.find(o => o.value === savedRoundFormat)}
                onEdit={openRoundSetup}
              />
            </div>
          )}
          {/* Once waves group the list below, each group's own sticky header
              carries the shadow — keeping it here too would double it up. */}
          <div
            className={`sched-round-list-sticky${groupedRoundSections ? ' sched-round-list-sticky--no-shadow' : ''}`}
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
            {hasMultipleRounds && !tournament.hideRosterOverview && (
              <div className={`sched-roster-overview${totalAssignedAcrossRounds === totalRosterAcrossRounds ? ' sched-roster-overview--complete' : ''}`}>
                <div className="sched-roster-overview-stat">
                  <div className="sched-roster-overview-count">{totalAssignedAcrossRounds}/{totalRosterAcrossRounds}</div>
                  <div className="sched-roster-overview-label">Teams Assigned Across All Rounds</div>
                </div>
                {totalAssignedAcrossRounds === totalRosterAcrossRounds ? (
                  <span className="sched-roster-overview-badge">
                    <FontAwesomeIcon icon={faCircleCheck} /> All Teams Accounted For
                  </span>
                ) : (
                  <span className="sched-roster-overview-badge">
                    {totalRosterAcrossRounds - totalAssignedAcrossRounds} Teams Not Yet Assigned
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={`sched-round-list-body${filteredRounds.length === 0 ? ' sched-round-list-body--empty' : ''}`}>
            {filteredRounds.length === 0 ? (
              <GSEmptyList
                title={hasRounds ? `No results for "${roundListSearch}"` : 'Add & Manage Rounds'}
                detail={hasRounds ? undefined : 'Add new rounds and manage all round details in one spot.'}
                actions={hasRounds ? undefined : (
                  formatManagesWaves(savedRoundFormat)
                    ? [
                        { title: 'Manage Waves', type: 'black', isFocusable: true, onClick: () => setWavesPanelOpen(true) },
                        { title: 'Add Round', type: 'light-grey', isFocusable: true, onClick: () => openCreateRoundPanel() },
                      ]
                    : [{ title: 'Round Setup', type: 'black', isFocusable: true, onClick: openRoundSetup }]
                )}
              />
            ) : groupedRoundSections ? (
              groupedRoundSections.map(section => (
                <div className="sched-round-group" key={section.key}>
                  <GSActionBar
                    type="form-header"
                    header={
                      <>
                        {section.title} <span className="sched-round-group-count">({section.rounds.length})</span>
                      </>
                    }
                    pageActions={[
                      { buttonIcon: faPen, type: 'light-grey icon', actionClick: () => setWavesPanelOpen(true) },
                    ]}
                  />
                  {section.rounds.map(r => (
                    <RoundListCard
                      key={r}
                      name={roundName(r)}
                      roundMeta={ROUND_META[r]}
                      courseName={roundCourse(r)}
                      hasAssignments={Object.keys(assignmentsByRound[r] || {}).length > 0}
                      assignedCount={roundAssignedCounts[r]}
                      rosterCount={roundRosterCounts[r]}
                      hideRosterCount={tournament.hideRosterOverview}
                      onOpenHoleAssignments={() => openRound(r)}
                    />
                  ))}
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
                  hideRosterCount={tournament.hideRosterOverview}
                  onOpenHoleAssignments={() => openRound(r)}
                />
              ))
            )}
          </div>
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
              header={activeRound !== undefined ? `${roundName(activeRound)} Hole Assignments` : 'Hole Assignments'}
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

          {showWaveNav ? (
            <div className="sched-wave-nav">
              <div className="sched-wave-tabs-label">Select a Wave</div>
              <div className="sched-wave-tabs">
                {wavesWithRounds.map(w => (
                  <button
                    key={w.id}
                    type="button"
                    className={`sched-wave-tab${w.id === activeWaveId ? ' sched-wave-tab--active' : ''}`}
                    onClick={() => switchWave(w.id)}
                  >
                    <FontAwesomeIcon icon={faWater} />
                    {w.name}
                  </button>
                ))}
              </div>
              <div className="sched-wave-rounds">
                <div className="sched-wave-rounds-label">
                  Rounds in <strong>{activeWave.name}</strong>
                </div>
                <div className="sched-round-tabs sched-round-tabs--wave">
                  {activeWave.roundIds.map(r => (
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
              </div>
            </div>
          ) : (
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
        title="Round Setup"
        actions={
          formatChangeWarningOpen
            ? [
                { name: 'Go Back', type: 'grey', action: cancelFormatChangeWarning },
                {
                  name: changingFromWavesToOther ? 'Remove Waves & Continue' : 'Change Format & Continue',
                  type: changingFromWavesToOther ? 'red' : 'orange',
                  action: () => commitRoundFormat(),
                },
              ]
            // No rounds (or waves) exist yet — tapping a tile below commits
            // immediately, so there's nothing left for a Save button to do.
            : hasExistingRoundSetup()
              ? [{ name: 'Save', type: 'black', isDisabled: !roundFormat, action: saveRoundFormat }]
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
        ) : (
          <>
            <GSActionBar type="form-header H3" header="Choose a Round Format" />
            <GSFormSection
              extras={
                <div className="sched-format-option-list">
                  {ROUND_FORMAT_OPTIONS.map(option => {
                    // Single Round only makes sense with exactly one round — with
                    // 2+ already created, picking it would require deleting rounds
                    // down to one first, so it's disabled rather than offered.
                    const isDisabled = option.value === 'single' && hasMultipleRounds
                    return (
                      <RoundFormatOption
                        key={option.value}
                        icon={option.icon}
                        title={option.title}
                        playDescription={option.playDescription}
                        availabilityDescription={option.availabilityDescription}
                        isSelected={roundFormat === option.value}
                        isDisabled={isDisabled}
                        disabledReason="Delete rounds down to one to select this format."
                        onClick={() => pickRoundFormat(option.value)}
                      />
                    )
                  })}
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
        rounds={ROUNDS}
        roundName={roundName}
        roundCourse={roundCourse}
        linkedRoundNumbers={linkedRoundNumbers}
        onAddWave={addWave}
        onRenameWave={renameWave}
        onDeleteWave={deleteWave}
        onReorderWave={reorderWave}
        onCreateRoundForWave={openCreateRoundPanel}
        onLinkRound={linkRoundToWave}
        onUnlinkRound={unlinkRoundFromWave}
      />

      <CreateRoundPanel
        isOpen={createRoundPanelOpen}
        onClose={() => {
          setCreateRoundPanelOpen(false)
          setCreateRoundTargetWaveId(null)
          setCreateRoundOpenedFromWave(false)
        }}
        onCreate={handleCreateRound}
        dimOverlay={!createRoundOpenedFromWave}
        noTransition={createRoundOpenedFromWave}
        waveOptions={waveQuickSelectOptions}
        selectedWaveOption={selectedWaveQuickOption}
        onSelectWave={option => setCreateRoundTargetWaveId(
          option.value === NO_WAVE_OPTION_VALUE ? null : option.value
        )}
      />
    </div>
  )
}
