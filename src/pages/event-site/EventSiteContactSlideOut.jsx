import { useEffect, useState } from 'react'

import GSButton from '../../gs-lib/components/gs-button'
import EventSiteSlideOut from './EventSiteSlideOut.jsx'

const FIELDS = [
  { key: 'firstName', label: 'First Name', type: 'text', autoComplete: 'given-name' },
  { key: 'lastName', label: 'Last Name', type: 'text', autoComplete: 'family-name' },
  { key: 'email', label: 'Email Address', type: 'email', autoComplete: 'email' },
  { key: 'phone', label: 'Phone Number', type: 'tel', autoComplete: 'tel' },
]
const EMPTY = { firstName: '', lastName: '', email: '', phone: '' }

// "Contact Details" slide-out (Figma "Registration - Donations - Cart -
// Checkout"), opened from the cart's Add/Edit Details. All four fields required.
export default function EventSiteContactSlideOut({ isOpen, onClose, initial, onSave, ctaColor, btn }) {
  const [values, setValues] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  // Fresh (or last-saved) values each time it opens.
  useEffect(() => {
    if (isOpen) {
      setValues(initial ?? EMPTY)
      setSubmitted(false)
    }
  }, [isOpen])

  const submit = e => {
    e?.preventDefault()
    setSubmitted(true)
    if (FIELDS.every(f => values[f.key].trim())) onSave(values)
  }

  return (
    <EventSiteSlideOut
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submit}
      title="Contact Details"
      headingAction={<GSButton title="Sign In" size="primary"{...btn('signIn', ctaColor, 'subtle')} isFocusable />}
      footer={
        <>
          <GSButton title="Save & Continue" {...btn('saveContinue', ctaColor, 'fill')} onClick={submit} isFocusable />
          <GSButton title="Cancel" {...btn('cancelSlideOut', ctaColor, 'subtle')} onClick={onClose} isFocusable />
        </>
      }
    >
      {FIELDS.map(({ key, label, type, autoComplete }) => {
        const invalid = submitted && !values[key].trim()
        return (
          <div key={key} className={`es-slide-out-field${invalid ? ' invalid' : ''}`}>
            <label htmlFor={`es-contact-${key}`}>{label} *</label>
            <input
              id={`es-contact-${key}`}
              type={type}
              autoComplete={autoComplete}
              placeholder={label}
              value={values[key]}
              onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
            />
            {invalid && <span className="error">Required</span>}
          </div>
        )
      })}
    </EventSiteSlideOut>
  )
}
