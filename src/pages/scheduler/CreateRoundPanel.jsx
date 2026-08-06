import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faCalendarDays,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import GSinput from '../../gs-lib/components/gs-input'
import GSSelect from '../../gs-lib/components/gs-select'
import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSRadioGroup from '../../gs-lib/components/gs-radio-group'
import AppSidePanel from '../../components/AppSidePanel'
import { FACILITIES } from '../../data/mockSchedulerTournaments'
import './CreateRoundPanel.scss'

const ROUND_FORMAT_SELECT_OPTIONS = [
  { value: 'two-person-scramble', label: 'Two-Person Scramble' },
  { value: 'four-person-scramble', label: 'Four-Person Scramble' },
  { value: 'individual-stroke-play', label: 'Individual Stroke Play' },
]

const PLAYERS_PER_HOLE_OPTIONS = [
  { value: '2', label: '2 Players' },
  { value: '8', label: '8 Players' },
  { value: '6', label: '6 Players' },
]

const START_TYPE_OPTIONS = [
  { value: 'shotgun', label: 'Shotgun Start' },
  { value: 'interval', label: 'Interval Start' },
  { value: 'two-tee', label: 'Two Tee Interval' },
]

function formatRoundDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  return `${time} on ${weekday} ${month} ${d.getDate()}, ${d.getFullYear()}`
}

// Reverse of formatRoundDateTime above — parses its "8:00 AM on Mon Jun 15,
// 2026" display string back into a datetime-local input value, so editing an
// existing round can pre-fill the field instead of leaving it blank.
function parseRoundDateTimeForInput(display) {
  const match = display?.match(/^(.+?) on (.+)$/)
  if (!match) return ''
  const [, time, dateStr] = match
  const d = new Date(`${dateStr} ${time}`)
  if (Number.isNaN(d.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Reverse of the Round Label field's "Round Label" convention (e.g. "Round
// RED" → "RED") — only recognized when the name actually follows that
// pattern, so an auto-numbered round's plain "Round 1" (never stored as a
// custom name — see handleCreateRound) doesn't round-trip into one.
function parseRoundLabel(name) {
  return name?.match(/^Round\s+(.{1,3})$/i)?.[1] ?? ''
}

// Facility field: search-then-select. Mirrors the Available Teams pattern
// elsewhere in this page — a plain search box until something's picked, then a
// single selected-item card with a clear (X) to back out of the choice.
function FacilityField({ query, onQueryChange, onSearch, results, selected, onSelect, onClear }) {
  if (selected) {
    return (
      <div className="crf-picked-card">
        <div className="crf-picked-thumb" />
        <div className="crf-picked-text">
          <div className="crf-picked-title">{selected.name}</div>
          <div className="crf-picked-sub">{selected.location}</div>
        </div>
        <GSButton type="transparent icon" isFocusable buttonIcon={faCircleXmark} onClick={onClear} />
      </div>
    )
  }
  return (
    <div className="crf-picker">
      <GSinput
        leftIcon={faMagnifyingGlass}
        placeholder="Search for a facility…"
        textValue={query}
        onChange={e => onQueryChange(e.target.value)}
        onSubmit={onSearch}
      />
      {results.length > 0 && (
        <div className="crf-picker-results">
          {results.map(facility => (
            <button
              key={facility.id}
              type="button"
              className="crf-picker-result"
              onClick={() => onSelect(facility)}
            >
              <div className="crf-picked-thumb" />
              <div className="crf-picked-text">
                <div className="crf-picked-title">{facility.name}</div>
                <div className="crf-picked-sub">{facility.location}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Round Course field: an empty-state placeholder until a course is chosen from
// the selected facility's course list below it — the chosen course is dropped
// from that list (same hide-when-picked convention as Facility/Unassigned Teams).
function RoundCourseField({ courses, selected, onSelect, onClear }) {
  return (
    <div className="crf-picker">
      {selected ? (
        <div className="crf-picked-card">
          <div className="crf-picked-text">
            <div className="crf-picked-title">{selected.name}</div>
            <div className="crf-picked-sub">{selected.status}</div>
            <div className="crf-picked-sub">{selected.holes} Hole Course</div>
          </div>
          <GSButton type="transparent icon" isFocusable buttonIcon={faCircleXmark} onClick={onClear} />
        </div>
      ) : (
        <div className="crf-course-empty">No courses selected. Please choose one from the list below.</div>
      )}
      {courses.length > 0 && (
        <div className="crf-picker-results">
          {courses.map(course => (
            <button
              key={course.id}
              type="button"
              className="crf-picker-result"
              onClick={() => onSelect(course)}
            >
              <div className="crf-picked-text">
                <div className="crf-picked-title">{course.name}</div>
                <div className="crf-picked-sub">{course.status}</div>
                <div className="crf-picked-sub">{course.holes} Hole Course</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Pool a linked round's Round Letter is auto-assigned from — background
// bookkeeping only (see roundLetter below), never shown as a field or
// picked by anyone; it exists purely to give same-Round-Number rounds a
// stable default order before a drag reorder (see RoundGroupList) picks one.
const LETTER_OPTIONS_POOL = ['A', 'B', 'C', 'D', 'E', 'F']

const emptyDraft = {
  roundFormat: null,
  roundLabel: '',
  playersPerHole: PLAYERS_PER_HOLE_OPTIONS[0],
  roundDateTime: '',
  startType: START_TYPE_OPTIONS[0],
  facilityQuery: '',
  facilityResults: [],
  selectedFacility: null,
  selectedCourse: null,
  roundNumberText: '',
  roundLetter: 'A',
}

export default function CreateRoundPanel({
  isOpen, onClose, onCreate, editingMeta, editingRoundKey, dimOverlay, noTransition,
  waveOptions, selectedWaveOption, onSelectWave,
  roundLinkingEnabled, roundNumberGroups = [], initialRoundNumber = null,
}) {
  const [draft, setDraft] = useState(emptyDraft)

  // The next Round Number nobody's used yet — what a brand new round's Round
  // Number field defaults to before the user types anything else over it.
  const nextRoundNumber = roundNumberGroups.length
    ? Math.max(...roundNumberGroups.map(g => g.number)) + 1
    : 1

  // Fresh form every time this is opened, rather than carrying over whatever
  // was left in it from a previous session — except when opened to edit an
  // existing round (editingMeta set), where it instead pre-fills from that
  // round's current values (best-effort reverse of the mappings in
  // handleSave below, since ROUND_META stores formatted display strings
  // rather than the form's own structured option/facility/course objects).
  // editingRoundKey backstops roundNumberText for a round that predates this
  // field (e.g. seeded mock data) and so never set its own roundNumber —
  // its ROUND_META key doubled as its round number before this existed.
  useEffect(() => {
    if (!isOpen) return
    if (editingMeta) {
      const facility = FACILITIES.find(f => f.name === editingMeta.facilityName) ?? null
      const course = facility?.courses.find(c => c.name === editingMeta.course) ?? null
      setDraft({
        roundFormat: ROUND_FORMAT_SELECT_OPTIONS.find(o => o.label === editingMeta.format) ?? null,
        roundLabel: parseRoundLabel(editingMeta.name),
        playersPerHole: PLAYERS_PER_HOLE_OPTIONS[0],
        roundDateTime: parseRoundDateTimeForInput(editingMeta.dateTime),
        startType: START_TYPE_OPTIONS.find(o => o.label === editingMeta.startType) ?? START_TYPE_OPTIONS[0],
        facilityQuery: '',
        facilityResults: [],
        selectedFacility: facility,
        selectedCourse: course,
        roundNumberText: String(editingMeta.roundNumber ?? editingRoundKey ?? ''),
        roundLetter: editingMeta.roundLetter ?? 'A',
      })
    } else {
      // initialRoundNumber (see the Linked/Unlinked choice in
      // TournamentSchedulerPage) seeds a specific already-existing number
      // instead of the usual next-unused one — its own claimed letters shift
      // accordingly, same as if the user had just typed that number in.
      const numberText = String(initialRoundNumber ?? nextRoundNumber)
      const available = availableLettersFor(Number(numberText))
      setDraft({ ...emptyDraft, roundNumberText: numberText, roundLetter: available[0] ?? 'A' })
    }
    // nextRoundNumber/initialRoundNumber deliberately left out — they're only
    // meant to seed the very first render of a fresh draft, not fight the
    // user by recomputing out from under a Round Number they're already
    // typing over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingMeta, editingRoundKey])

  function set(patch) {
    setDraft(prev => ({ ...prev, ...patch }))
  }

  // Whichever letters are already claimed at a given Round Number, excluding
  // the round being edited itself (so its own current letter always stays a
  // valid option rather than looking already-taken). Background-only — see
  // LETTER_OPTIONS_POOL — so this returns the raw available letters rather
  // than {value, label} select options.
  function availableLettersFor(number) {
    const group = roundNumberGroups.find(g => g.number === number)
    const usedByOthers = new Set(
      (group?.entries ?? []).filter(e => e.round !== editingRoundKey).map(e => e.letter)
    )
    return LETTER_OPTIONS_POOL.filter(letter => !usedByOthers.has(letter))
  }

  // Changing the Round Number is how a round gets linked to (or unlinked
  // from) another — typing in a number that matches an existing round links
  // them; typing a number nothing else uses makes it stand alone again. The
  // round's own (never-shown) Round Letter shifts with it, so a letter that
  // was fine for the old number but is already taken at the new one gets
  // bumped to the first one that's actually free there.
  function handleRoundNumberChange(text) {
    const available = availableLettersFor(Number(text))
    set({
      roundNumberText: text,
      roundLetter: available.includes(draft.roundLetter) ? draft.roundLetter : (available[0] ?? 'A'),
    })
  }

  function searchFacilities() {
    const q = draft.facilityQuery.trim().toLowerCase()
    if (!q) {
      set({ facilityResults: [] })
      return
    }
    set({ facilityResults: FACILITIES.filter(f => `${f.name} ${f.location}`.toLowerCase().includes(q)) })
  }

  function selectFacility(facility) {
    set({ selectedFacility: facility, selectedCourse: null, facilityQuery: '', facilityResults: [] })
  }

  function clearFacility() {
    set({ selectedFacility: null, selectedCourse: null })
  }

  const availableCourses = draft.selectedFacility
    ? draft.selectedFacility.courses.filter(c => c.id !== draft.selectedCourse?.id)
    : []

  // Prototype convenience: Save is always enabled, even with required fields
  // left blank — every value here falls back to a placeholder instead of
  // failing so an incomplete draft still lands in the round list. Editing
  // spreads editingMeta first so any field this form doesn't manage (e.g. a
  // seeded round's teamCount/rosterOffset) survives the save untouched. No
  // status field here — the round list computes Draft/Ready itself from
  // whether the round actually has a hole assignment yet, not from anything
  // set on the round.
  function handleSave() {
    onCreate({
      ...editingMeta,
      format: draft.roundFormat?.label ?? 'Round Format Not Set',
      name: draft.roundLabel.trim() ? `Round ${draft.roundLabel.trim()}` : undefined,
      dateTime: formatRoundDateTime(draft.roundDateTime) || 'Date & Time Not Set',
      startType: draft.startType.label,
      facilityName: draft.selectedFacility?.name ?? 'Facility Not Set',
      course: draft.selectedCourse?.name ?? 'Course Not Set',
      holes: draft.selectedCourse?.holes ?? 18,
      ...(roundLinkingEnabled ? {
        roundNumber: Number(draft.roundNumberText) || nextRoundNumber,
        roundLetter: draft.roundLetter || 'A',
      } : {}),
    })
  }

  const isEditing = !!editingMeta

  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Round' : 'Add Round'}
      dimOverlay={dimOverlay}
      noTransition={noTransition}
      actions={[
        { name: 'Save', type: 'black', action: handleSave },
        { name: 'Cancel', type: 'light-grey', action: onClose },
      ]}
    >
      <GSActionBar type="form-header H3" header={isEditing ? 'Edit Round' : 'Add Round'} />
      <GSFormSection
        type="vertical xx-large-gap"
        fields={[
          // Only shown for tournaments organized into waves — lets a round
          // created from the top-level Add Round button (rather than from
          // inside a specific wave's own card) get linked on the spot instead
          // of landing in the "Other Rounds" catch-all.
          ...(waveOptions?.length > 0 ? [{
            label: 'Wave',
            isEditable: true,
            customView: true,
            value: (
              <GSSelect
                options={waveOptions}
                selectedOption={selectedWaveOption}
                onChange={onSelectWave}
                placeholder="Select a Wave"
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            ),
          }] : []),
          {
            label: 'Round Format',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSSelect
                options={ROUND_FORMAT_SELECT_OPTIONS}
                selectedOption={draft.roundFormat}
                onChange={option => set({ roundFormat: option })}
                placeholder="Select a Round Format"
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            ),
          },
          {
            label: 'Round Label',
            isEditable: true,
            customView: true,
            value: (
              <div className="crf-round-label">
                <GSinput
                  placeholder="Round Label"
                  textValue={draft.roundLabel}
                  onChange={e => set({ roundLabel: e.target.value.slice(0, 3) })}
                />
                <div className="crf-round-label-hint">
                  <span>This will replace Round 1 on leaderboards and printouts.</span>
                  <span>{draft.roundLabel.length}/3</span>
                </div>
              </div>
            ),
          },
          // Always present for a tournament that never went through Round
          // Setup at all (see roundLinkingEnabled) — on both Add and Edit,
          // not just the first time a round is created. Two rounds sharing a
          // Round Number are linked (grouped in the round list, same as
          // waves used to group rounds); which one displays first within
          // that group is decided by dragging in the round list itself (see
          // RoundGroupList), not by anything set here. Editing this field
          // later is how a round's link gets changed — set it to a number
          // nothing else uses to unlink it, or to an existing one to link it
          // there instead.
          ...(roundLinkingEnabled ? [
            {
              label: 'Round Number',
              required: true,
              isEditable: true,
              customView: true,
              value: (
                <GSinput
                  type="number"
                  placeholder="Round Number"
                  textValue={draft.roundNumberText}
                  onChange={e => handleRoundNumberChange(e.target.value)}
                />
              ),
            },
          ] : []),
          {
            label: 'Players Per Hole',
            isEditable: true,
            customView: true,
            value: (
              <GSRadioGroup
                options={PLAYERS_PER_HOLE_OPTIONS}
                selectedOption={draft.playersPerHole}
                selectionChanged={option => set({ playersPerHole: option })}
              />
            ),
          },
        ]}
      />

      <GSFormSection
        title="Start Details"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Round Date & Time',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSinput
                type="datetime-local"
                leftIcon={faCalendarDays}
                textValue={draft.roundDateTime}
                onChange={e => set({ roundDateTime: e.target.value })}
              />
            ),
          },
          {
            label: 'Start Type',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <GSRadioGroup
                options={START_TYPE_OPTIONS}
                selectedOption={draft.startType}
                selectionChanged={option => set({ startType: option })}
              />
            ),
          },
        ]}
      />

      <GSFormSection
        title="Facility Details"
        type="vertical xx-large-gap"
        fields={[
          {
            label: 'Facility',
            description: "Hit 'ENTER' to search for a facility. Then select one from the list below.",
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <FacilityField
                query={draft.facilityQuery}
                onQueryChange={q => set({ facilityQuery: q })}
                onSearch={searchFacilities}
                results={draft.facilityResults}
                selected={draft.selectedFacility}
                onSelect={selectFacility}
                onClear={clearFacility}
              />
            ),
          },
          {
            label: 'Round Course',
            required: true,
            isEditable: true,
            customView: true,
            value: (
              <RoundCourseField
                courses={availableCourses}
                selected={draft.selectedCourse}
                onSelect={course => set({ selectedCourse: course })}
                onClear={() => set({ selectedCourse: null })}
              />
            ),
          },
        ]}
      />
    </AppSidePanel>
  )
}
