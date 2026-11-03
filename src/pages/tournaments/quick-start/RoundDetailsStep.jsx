import { useEffect, useState } from 'react'
import { faMagnifyingGlass, faCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSFormSection from '../../../gs-lib/components/gs-form-section'
import GSButton from '../../../gs-lib/components/gs-button'
import GSinput from '../../../gs-lib/components/gs-input'
import GSSelect from '../../../gs-lib/components/gs-select'
import GSRadioGroup from '../../../gs-lib/components/gs-radio-group'
import { ROUND_FORMATS, soleCourse, isNineHoleTrio, ALL_TEE_IDS, coursesFor, searchFacilities, COUNTRIES, REGIONS } from '../../../data/mockFacilities'
import './RoundDetailsStep.scss'

// "1 x 9-Hole, 1 x 18-Hole": the facility's course types, for telling the mock facilities apart.
const courseCount = f => {
  const counts = coursesFor(f).reduce((acc, c) => ({ ...acc, [c.holes]: (acc[c.holes] ?? 0) + 1 }), {})
  return Object.keys(counts).sort((a, b) => a - b).map(h => `${counts[h]} x ${h}-Hole`).join(', ')
}

// Course search: the course name, then country (USA or Canada) and state or
// province (a dropdown, labelled to match the country). ENTER in the name runs
// the search; picking a country or state does too. Matches list below as
// selectable tiles (or an empty-state message). Starts out searched for the
// prospect's course so it's already picked.
function CourseSearch({ facility, onSelect, initialName }) {
  const [name, setName] = useState(initialName)
  const [state, setState] = useState('')
  const [country, setCountry] = useState(COUNTRIES[0])
  const [results, setResults] = useState(() => searchFacilities(initialName, '', COUNTRIES[0].value))

  const search = () => setResults(searchFacilities(name, state, country.value))
  // Switching country drops the old state/province and searches that country.
  const changeCountry = option => {
    setCountry(option)
    setState('')
    setResults(searchFacilities(name, '', option.value))
  }
  const changeState = option => {
    const next = option?.value ?? ''
    setState(next)
    setResults(searchFacilities(name, next, country.value))
  }

  return (
    <div className="rd-course">
      <div className="rd-course-inputs">
        <GSinput
          leftIcon={faMagnifyingGlass}
          placeholder="Course Name"
          textValue={name}
          onChange={e => setName(e.target.value)}
          onSubmit={search}
        />
        <div>
          <GSSelect
            options={COUNTRIES}
            selectedOption={country}
            onChange={changeCountry}
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>
        <div>
          <GSSelect
            options={REGIONS[country.value]}
            selectedOption={REGIONS[country.value].find(r => r.value === state) ?? null}
            onChange={changeState}
            placeholder={country.regionLabel}
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rd-course-empty">We couldn’t find the facility you’re looking for…</div>
      ) : (
        <div className="rd-course-results">
          {results.map(f => (
            <div
              key={f.id}
              className={`rd-facility${facility?.id === f.id ? ' rd-facility--selected' : ''}`}
              onClick={() => onSelect(f)}
            >
              <div>
                <div className="rd-facility-name">{f.name} ({courseCount(f)})</div>
                <div className="rd-facility-meta">{f.city}, {f.state}</div>
              </div>
              {facility?.id === f.id && <FontAwesomeIcon icon={faCheck} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// A picked facility, shown in place of the search. The x clears it (and the
// course picked under it) to search again.
function SelectedFacility({ facility, onClear }) {
  return (
    <div className="rd-selected-facility">
      <div>
        <div className="rd-facility-name">{facility.name}</div>
        <div className="rd-facility-meta">{facility.city}, {facility.state}</div>
      </div>
      <GSButton buttonIcon={faCircleXmark} type="transparent" onClick={onClear} isFocusable />
    </div>
  )
}

// Tiles in a grid until one is picked, then only the pick shows, full width,
// until it's cleared. Items are { id, name, detail }. Used for choosing a 9-hole
// course (the same nine can be played twice, so both sections offer every one)
// and for choosing the front or back nine of a single 18-hole course.
function TileChoice({ items, selectedId, onPick, onClear }) {
  const selected = items.find(i => i.id === selectedId)
  if (selected) {
    return (
      <div className="rd-course">
        <div className="rd-course-card rd-course-card--selected">
          <div className="rd-course-head">
            <TileSummary item={selected} />
            <GSButton buttonIcon={faCircleXmark} type="transparent" onClick={onClear} isFocusable />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="rd-course-grid">
      {items.map(item => (
        <div key={item.id} className="rd-course-card" onClick={() => onPick(item.id)}>
          <TileSummary item={item} />
        </div>
      ))}
    </div>
  )
}

const TileSummary = ({ item }) => (
  <div>
    <div className="rd-facility-name">{item.name}</div>
    <div>{item.detail}</div>
  </div>
)

const courseItems = courses => courses.map(c => ({ id: c.id, name: c.name, detail: `${c.holes} Hole Course` }))

// A facility with a single course: no course to pick, so the facility card
// stands in for it. Shows how the round plays the course.
//   9-hole course:  9-hole round plays it once, 18-hole round twice
//   18-hole course: 18-hole round is the full course; 9-hole round picks the
//                   front (1-9) or back (10-18) nine
function SoleCourseSetup({ course, roundHoles, holes, onChange }) {
  const needsSide = course.holes === 18 && roundHoles === 9
  // Outside the front/back choice the saved side is always "all".
  useEffect(() => {
    if (!needsSide && holes !== 'all') onChange({ holes: 'all' })
  }, [needsSide, holes])

  if (needsSide) {
    const sides = [
      { id: 'front', name: course.name, detail: 'Front Nine' },
      { id: 'back', name: course.name, detail: 'Back Nine' },
    ]
    return (
      <TileChoice
        items={sides}
        selectedId={holes === 'front' || holes === 'back' ? holes : null}
        onPick={id => onChange({ holes: id })}
        onClear={() => onChange({ holes: 'all' })}
      />
    )
  }
  return (
    <div className="rd-course">
      <div className="rd-course-card rd-course-card--selected">
        <div>This 9-hole course will be played {roundHoles === 18 ? 'twice (18 holes)' : 'once (9 holes)'}.</div>
      </div>
    </div>
  )
}

// How many holes the round is. Informs the course section below.
const ROUND_HOLE_OPTIONS = [
  { value: 18, label: '18 Holes' },
  { value: 9, label: '9 Holes' },
]

// Quick Start step 2: when and where the first round is played. Footer actions
// live in QuickStartPanel.
export default function RoundDetailsStep({ quickStart, onChange }) {
  const { start_datetime, round_format, round_holes, facility, course_id, course_id_2, holes, tees, course_not_listed } = quickStart
  // "I don't see my course": swaps the search flow for a note that the team will
  // set the course up; "Search Courses" brings the flow back.
  const toggleNotListed = () => onChange(course_not_listed
    ? { course_not_listed: false }
    : { course_not_listed: true, facility: null, course_id: null, course_id_2: null, tees: ALL_TEE_IDS, holes: 'all' })
  const trio = facility && isNineHoleTrio(facility)
  // Two courses (a 9 and an 18, or two 18s): one combined choice of what's played.
  const mixed = facility && coursesFor(facility).length === 2
  const trioCourses = trio ? coursesFor(facility) : []
  const sole = facility ? soleCourse(facility) : null
  const roundHoleOption = ROUND_HOLE_OPTIONS.find(o => o.value === round_holes)

  // Two courses. A 9-hole round: a nine-hole course, or the front or back of an
  // 18-hole one. An 18-hole round: an 18-hole course in full, or a nine played
  // twice. Tile ids are `courseId` or `courseId:front|back`.
  const mixedItems = () => {
    if (!mixed) return []
    return [...coursesFor(facility)].sort((a, b) => a.holes - b.holes).flatMap(course => {
      if (course.holes === 9) return [{ id: course.id, name: course.name, detail: '9 Hole Course' }]
      return round_holes === 9
        ? [
            { id: `${course.id}:front`, name: course.name, detail: 'Front Nine' },
            { id: `${course.id}:back`, name: course.name, detail: 'Back Nine' },
          ]
        : [{ id: course.id, name: course.name, detail: '18 Hole Course' }]
    })
  }
  const mixedSelectedId = () => {
    if (!course_id) return null
    const course = coursesFor(facility).find(c => c.id === course_id)
    if (course?.holes === 18 && round_holes === 9) return holes === 'front' || holes === 'back' ? `${course_id}:${holes}` : null
    return course_id
  }
  const mixedFields = [{
    label: 'Course',
    required: true,
    isEditable: true,
    customView: true,
    externalValue: mixedSelectedId() ?? '',
    value: (
      <TileChoice
        items={mixedItems()}
        selectedId={mixedSelectedId()}
        onPick={id => { const [cid, side] = id.split(':'); onChange({ course_id: cid, holes: side ?? 'all' }) }}
        onClear={() => onChange({ course_id: null, holes: 'all' })}
      />
    ),
  }]

  // Three 9-hole courses: a 9-hole round picks one; an 18-hole round picks two
  // different ones (holes 1-9, then 10-18). Tees follow.
  const trioFields = [
    {
      label: 'Holes 1-9',
      required: true,
      isEditable: true,
      customView: true,
      externalValue: course_id ?? '',
      value: (
        <TileChoice
          items={courseItems(trioCourses)}
          selectedId={course_id}
          onPick={id => onChange({ course_id: id })}
          onClear={() => onChange({ course_id: null })}
        />
      ),
    },
    ...(round_holes === 18 ? [{
      label: 'Holes 10-18',
      required: true,
      isEditable: true,
      customView: true,
      externalValue: course_id_2 ?? '',
      value: (
        <TileChoice
          items={courseItems(trioCourses)}
          selectedId={course_id_2}
          onPick={id => onChange({ course_id_2: id })}
          onClear={() => onChange({ course_id_2: null })}
        />
      ),
    }] : []),
  ]

  return (
    <>
    <GSFormSection
      type="vertical xx-large-gap"
      fields={[
        {
          label: 'Start Date & Time',
          required: true,
          isEditable: true,
          customView: true,
          externalValue: start_datetime,
          value: (
            <input
              className="rd-datetime"
              type="datetime-local"
              value={start_datetime}
              onChange={e => onChange({ start_datetime: e.target.value })}
            />
          ),
        },
        {
          label: 'Format',
          required: true,
          isEditable: true,
          customView: true,
          value: (
            <GSSelect
              options={ROUND_FORMATS}
              selectedOption={ROUND_FORMATS.find(o => o.value === round_format)}
              onChange={option => onChange({ round_format: option.value })}
              isSearchable={false}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          ),
        },
        {
          label: 'Number of Holes',
          required: true,
          isEditable: true,
          customView: true,
          value: (
            <GSRadioGroup
              isLtr
              options={ROUND_HOLE_OPTIONS}
              selectedOption={roundHoleOption}
              selectionChanged={option => onChange({
                round_holes: option.value,
                holes: 'all',
                // A new hole count invalidates a course choice made for the old one
                // (a single course is auto-picked, so it stays).
                ...(facility && !soleCourse(facility) ? { course_id: null, course_id_2: null } : {}),
              })}
            />
          ),
        },
      ]}
    />
    <GSFormSection
      title="Course Setup"
      // Hidden once a facility is picked: there's nothing left to not find.
      sectionActions={facility ? [] : [{
        buttonTitle: course_not_listed ? 'Search Courses' : "I don't see my course",
        actionClick: toggleNotListed,
        type: 'transparent',
        size: 'secondary',
      }]}
      type="vertical xx-large-gap"
      fields={course_not_listed ? [{
        isEditable: true,
        customView: true,
        value: (
          <div className="rd-course-empty rd-course-empty--note">
            <div className="rd-course-empty-title">Can’t find your course?</div>
            <div className="rd-course-empty-body">We’ll set a placeholder course and your customer support specialist will be in contact to help you out!</div>
          </div>
        ),
      }] : [
        {
          // Once a course is picked the card stands alone, with no field header.
          label: facility ? undefined : 'Course Search',
          required: true,
          isEditable: true,
          customView: true,
          externalValue: facility?.id ?? '',
          value: facility ? (
            <SelectedFacility
              facility={facility}
              onClear={() => onChange({ facility: null, course_id: null, course_id_2: null, tees: ALL_TEE_IDS, holes: 'all' })}
            />
          ) : (
            <CourseSearch
              facility={facility}
              onSelect={f => onChange({ facility: f, course_id: soleCourse(f)?.id ?? null, course_id_2: null, tees: ALL_TEE_IDS, holes: 'all' })}
              initialName={quickStart.course_name}
            />
          ),
        },
        ...(trio ? trioFields : []),
        ...(mixed ? mixedFields : []),
        // Only a single 18-hole course played for 9 holes needs a field (front or back nine).
        // A single 9-hole course's "played once/twice" description is hidden for now: the
        // facility card says it all (SoleCourseSetup still renders it if the condition is widened).
        ...(sole && sole.holes === 18 && round_holes === 9 ? [{
          label: sole.holes === 9 ? 'Round Course' : 'Holes 1-9',
          required: true,
          isEditable: true,
          customView: true,
          externalValue: course_id ?? '',
          value: <SoleCourseSetup course={sole} roundHoles={round_holes} holes={holes} onChange={onChange} />,
        }] : []),
        ...(facility && !trio && !mixed && !sole ? [{
          label: 'Course',
          required: true,
          isEditable: true,
          customView: true,
          externalValue: course_id ?? '',
          value: <TileChoice
              items={courseItems(coursesFor(facility))}
              selectedId={course_id}
              onPick={id => onChange({ course_id: id, tees: ALL_TEE_IDS, holes: 'all' })}
              onClear={() => onChange({ course_id: null, tees: ALL_TEE_IDS, holes: 'all' })}
            />,
        }] : []),
      ]}
    />
    </>
  )
}
