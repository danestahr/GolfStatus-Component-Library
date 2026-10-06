import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import GSToggle from '../../gs-lib/components/gs-toggle'
import EventSiteSlideOut from './EventSiteSlideOut.jsx'

const PLAYER_COUNT = 4
const TEE_LOCATIONS = ['Front 9', 'Back 9', 'Shotgun']
const TEES = ['Championship', 'Blue', 'White', 'Gold', 'Red']
const CUSTOM_OPTIONS = ['Option 1', 'Option 2', 'Option 3']

const EMPTY_PLAYER = {
  useContact: false, firstName: '', lastName: '', email: '', phone: '', notes: '', ghin: '', handicap: '',
  custom1: '', custom2: '', tee: '', teeLocation: '',
}
const EMPTY_ANSWERS = { question1: '', question2: '' }
const emptyTeam = () => ({
  // The first player is usually the person registering.
  players: Array.from({ length: PLAYER_COUNT }, (_, i) => ({ ...EMPTY_PLAYER, useContact: i === 0 })),
  answers: EMPTY_ANSWERS,
})

// "Team Details" slide-out (Figma "Registration - Donations - Cart -
// Checkout"), opened from a Team Registration package's form row in the cart.
// Each player can borrow the registrant's contact details; first and last
// name are required for every player.
export default function EventSiteTeamSlideOut({ isOpen, onClose, initial, contact, onSave, ctaColor, btn }) {
  const [team, setTeam] = useState(emptyTeam)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTeam(initial ?? emptyTeam())
      setSubmitted(false)
    }
  }, [isOpen])

  // Players on "Use Contact Details" mirror the contact live.
  const resolved = team.players.map(p => (p.useContact && contact ? { ...p, ...contact } : p))

  const setPlayer = (i, patch) =>
    setTeam(prev => ({ ...prev, players: prev.players.map((p, idx) => (idx === i ? { ...resolved[i], ...patch } : p)) }))
  const setAnswer = (key, value) => setTeam(prev => ({ ...prev, answers: { ...prev.answers, [key]: value } }))

  const submit = e => {
    e?.preventDefault()
    setSubmitted(true)
    if (team.answers.question1 && resolved.every(p => p.firstName.trim() && p.lastName.trim())) onSave({ ...team, players: resolved })
  }

  return (
    <EventSiteSlideOut
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submit}
      title="Player details"
      heading="Team Details"
      footer={
        <>
          <GSButton title="Save & Continue" {...btn('saveContinue', ctaColor, 'fill')} onClick={submit} isFocusable />
          <GSButton title="Cancel" {...btn('cancelSlideOut', ctaColor, 'subtle')} onClick={onClose} isFocusable />
        </>
      }
    >
      {resolved.map((player, i) => (
        <PlayerFields
          key={i}
          index={i}
          player={player}
          submitted={submitted}
          onChange={patch => setPlayer(i, patch)}
        />
      ))}

      <div className="es-slide-out-group">
        <div className="es-slide-out-group-header"><h3>Additional Team Questions</h3></div>
        <div className="es-slide-out-group-list">
          <SelectField id="es-team-q1" label="Team Question #1" required invalid={submitted && !team.answers.question1} placeholder="Select an Option..." options={CUSTOM_OPTIONS} value={team.answers.question1} onChange={v => setAnswer('question1', v)} />
          <div className="es-slide-out-field">
            <label htmlFor="es-team-q2">Team Question #2</label>
            <input id="es-team-q2" placeholder="Team Question #2" value={team.answers.question2} onChange={e => setAnswer('question2', e.target.value)} />
          </div>
        </div>
      </div>
    </EventSiteSlideOut>
  )
}

function PlayerFields({ index, player, submitted, onChange }) {
  const id = `es-player-${index}`
  const locked = player.useContact
  const text = (key, label, { required, type = 'text', noLock } = {}) => {
    const invalid = submitted && required && !player[key].trim()
    return (
      <div className={`es-slide-out-field${invalid ? ' invalid' : ''}`}>
        <label htmlFor={`${id}-${key}`}>{label}{required ? ' *' : ''}</label>
        <input id={`${id}-${key}`} type={type} placeholder={label} disabled={locked && !noLock} value={player[key]} onChange={e => onChange({ [key]: e.target.value })} />
        {invalid && <span className="error">Required</span>}
      </div>
    )
  }
  return (
    <div className="es-slide-out-group">
      <div className="es-slide-out-group-header">
        <h3>Player {index + 1} Details</h3>
        <GSToggle
          label={null}
          rowReverse
          trueColor="var(--es-el-toggle-on-track, var(--gs-color-primary))"
          falseColor="var(--es-el-toggle-off-track, var(--gs-color-outline))"
          value={player.useContact}
          trueDescription="Use Contact Details"
          falseDescription="Use Contact Details"
          onClick={() => onChange({ useContact: !player.useContact })}
        />
      </div>
      <div className="es-slide-out-group-list">
        {text('firstName', 'First Name', { required: true })}
        {text('lastName', 'Last Name', { required: true })}
        {text('email', 'Email Address', { type: 'email' })}
        {text('phone', 'Phone Number', { type: 'tel' })}
        <div className="es-slide-out-field">
          <label htmlFor={`${id}-notes`}>Player Notes</label>
          <textarea id={`${id}-notes`} placeholder="Player Notes" value={player.notes} onChange={e => onChange({ notes: e.target.value })} />
        </div>
        <div className="es-slide-out-field">
          <label htmlFor={`${id}-ghin`}>GHIN Number</label>
          <input id={`${id}-ghin`} inputMode="numeric" placeholder="GHIN Number" value={player.ghin} onChange={e => onChange({ ghin: e.target.value })} />
          <span className="hint">Enter GHIN number without dashes.</span>
        </div>
        {text('handicap', 'Handicap')}
        <SelectField id={`${id}-custom1`} label="Custom Form Question #1" placeholder="Select an Option..." options={CUSTOM_OPTIONS} value={player.custom1} onChange={v => onChange({ custom1: v })} />
        {text('custom2', 'Custom Form Question #2', { noLock: true })}
        <SelectField id={`${id}-tee`} label="Select a Tee..." placeholder="Select a Tee..." options={TEES} value={player.tee} onChange={v => onChange({ tee: v })} />
        <SelectField id={`${id}-tee-location`} label="Select a Tee Location..." placeholder="Select a Tee Location..." options={TEE_LOCATIONS} value={player.teeLocation} onChange={v => onChange({ teeLocation: v })} />
      </div>
    </div>
  )
}

function SelectField({ id, label, placeholder, options, value, onChange, required, invalid }) {
  return (
    <div className={`es-slide-out-field${invalid ? ' invalid' : ''}`}>
      <label htmlFor={id}>{label}{required ? ' *' : ''}</label>
      <div className="es-slide-out-select">
        <select id={id} value={value} onChange={e => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <FontAwesomeIcon icon={faChevronDown} />
      </div>
      {invalid && <span className="error">Required</span>}
    </div>
  )
}
