import { useState } from 'react'
import { faMagnifyingGlass, faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSFormSection from '../../../gs-lib/components/gs-form-section'
import GSinput from '../../../gs-lib/components/gs-input'
import GSSelect from '../../../gs-lib/components/gs-select'
import { ROUND_FORMATS, searchFacilities } from '../../../data/mockFacilities'
import './RoundDetailsStep.scss'

// Facility search: name + state inputs, ENTER (in either) runs the search, and
// matches list below as selectable tiles (or an empty-state message).
// Starts out searched for the prospect's course so it's already picked.
function CourseSearch({ facility, onSelect, initialName }) {
  const [name, setName] = useState(initialName)
  const [state, setState] = useState('')
  const [results, setResults] = useState(() => searchFacilities(initialName, ''))

  const search = () => setResults(searchFacilities(name, state))

  return (
    <div className="rd-course">
      <div className="rd-course-inputs">
        <GSinput
          leftIcon={faMagnifyingGlass}
          placeholder="Facility Name"
          textValue={name}
          onChange={e => setName(e.target.value)}
          onSubmit={search}
        />
        <GSinput
          leftIcon={faMagnifyingGlass}
          placeholder="Facility State (Abbreviation)"
          textValue={state}
          onChange={e => setState(e.target.value)}
          onSubmit={search}
        />
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
                <div className="rd-facility-name">{f.name}</div>
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

// Quick Start step 2: when and where the first round is played. Footer actions
// live in QuickStartPanel.
export default function RoundDetailsStep({ quickStart, onChange }) {
  const { start_datetime, round_format, facility } = quickStart

  return (
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
          label: 'Round Format',
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
          label: 'Course',
          required: true,
          isEditable: true,
          customView: true,
          externalValue: facility?.id ?? '',
          value: (
            <CourseSearch
              facility={facility}
              onSelect={f => onChange({ facility: f })}
              initialName={quickStart.course_name}
            />
          ),
        },
      ]}
    />
  )
}
