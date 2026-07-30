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
}

export default function CreateRoundPanel({
  isOpen, onClose, onCreate, dimOverlay, noTransition,
  waveOptions, selectedWaveOption, onSelectWave,
}) {
  const [draft, setDraft] = useState(emptyDraft)

  // Fresh form every time this is opened, rather than carrying over whatever
  // was left in it from a previous Add Round session.
  useEffect(() => {
    if (isOpen) setDraft(emptyDraft)
  }, [isOpen])

  function set(patch) {
    setDraft(prev => ({ ...prev, ...patch }))
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
  // failing so an incomplete draft still lands in the round list.
  function handleSave() {
    onCreate({
      format: draft.roundFormat?.label ?? 'Round Format Not Set',
      name: draft.roundLabel.trim() || undefined,
      dateTime: formatRoundDateTime(draft.roundDateTime) || 'Date & Time Not Set',
      startType: draft.startType.label,
      facilityName: draft.selectedFacility?.name ?? 'Facility Not Set',
      course: draft.selectedCourse?.name ?? 'Course Not Set',
      holes: draft.selectedCourse?.holes ?? 18,
      status: 'Draft',
    })
  }

  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Add Round"
      dimOverlay={dimOverlay}
      noTransition={noTransition}
      actions={[
        { name: 'Save', type: 'black', action: handleSave },
      ]}
    >
      <GSActionBar type="form-header H3" header="Add Round" />
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
