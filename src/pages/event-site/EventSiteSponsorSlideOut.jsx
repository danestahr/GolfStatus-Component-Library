import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowCircleUp, faExternalLinkSquare } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import EventSiteSlideOut from './EventSiteSlideOut.jsx'

const EMPTY = { name: '', website: '', message: '', image: '', appImage: '', contactName: '', contactEmail: '', contactPhone: '' }

// "Sponsor Details" slide-out (Figma "Registration - Donations - Cart -
// Checkout"), opened from a Sponsorship package's form row in the cart.
// Name and both images are required.
export default function EventSiteSponsorSlideOut({ isOpen, onClose, initial, contact, onSave, ctaColor, btn }) {
  const [values, setValues] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(initial ?? { ...EMPTY, contactName: contact ? `${contact.firstName} ${contact.lastName}`.trim() : '', contactEmail: contact?.email ?? '', contactPhone: contact?.phone ?? '' })
      setSubmitted(false)
    }
  }, [isOpen])

  const set = (key, value) => setValues(prev => ({ ...prev, [key]: value }))
  const valid = values.name.trim() && values.image && values.appImage && values.contactName.trim() && values.contactEmail.trim()

  const submit = e => {
    e?.preventDefault()
    setSubmitted(true)
    if (valid) onSave(values)
  }

  return (
    <EventSiteSlideOut
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submit}
      title="Sponsor details"
      heading="Sponsor Details"
      footer={
        <>
          <GSButton title="Save & Continue" {...btn('saveContinue', ctaColor, 'fill')} onClick={submit} isFocusable />
          <GSButton title="Cancel" {...btn('cancelSlideOut', ctaColor, 'subtle')} onClick={onClose} isFocusable />
        </>
      }
    >
      <div className="es-slide-out-group">
        <div className="es-slide-out-group-header"><h3>Sponsor Information</h3></div>
        <div className={`es-slide-out-field${submitted && !values.name.trim() ? ' invalid' : ''}`}>
          <label htmlFor="es-sponsor-name">Sponsor Name *</label>
          <input id="es-sponsor-name" placeholder="Sponsor Name" value={values.name} onChange={e => set('name', e.target.value)} />
          {submitted && !values.name.trim() && <span className="error">Required</span>}
        </div>
        <div className="es-slide-out-field">
          <label htmlFor="es-sponsor-website">Sponsor Website</label>
          <div className="es-slide-out-input-icon">
            <input id="es-sponsor-website" type="url" placeholder="Sponsor Website" value={values.website} onChange={e => set('website', e.target.value)} />
            <FontAwesomeIcon icon={faExternalLinkSquare} />
          </div>
          <span className="hint">e.g. www.sponsorwebsite.com</span>
        </div>
        <div className="es-slide-out-field">
          <label htmlFor="es-sponsor-message">In-App Sponsor Message</label>
          <textarea id="es-sponsor-message" placeholder="In-App Sponsor Message" value={values.message} onChange={e => set('message', e.target.value)} />
          <span className="hint">This message will be shown in the sponsor details section of GolfStatus app.</span>
        </div>
      </div>

      <div className="es-slide-out-group">
        <div className="es-slide-out-group-header"><h3>Sponsor Images</h3></div>
        <ImageUpload
          label="Sponsor Image"
          ratio="2:1"
          value={values.image}
          onChange={v => set('image', v)}
          invalid={submitted && !values.image}
          ctaColor={ctaColor}
          btn={btn}
        />
        <ImageUpload
          label="In-App Sponsor Image"
          ratio="4:1"
          value={values.appImage}
          onChange={v => set('appImage', v)}
          invalid={submitted && !values.appImage}
          ctaColor={ctaColor}
          btn={btn}
        />
      </div>

      <div className="es-slide-out-group">
        <div className="es-slide-out-group-header"><h3>Sponsor Contact</h3></div>
        <div className={`es-slide-out-field${submitted && !values.contactName.trim() ? ' invalid' : ''}`}>
          <label htmlFor="es-sponsor-contact-name">Full Name *</label>
          <input id="es-sponsor-contact-name" autoComplete="name" placeholder="Full Name" value={values.contactName} onChange={e => set('contactName', e.target.value)} />
          {submitted && !values.contactName.trim() && <span className="error">Required</span>}
        </div>
        <div className={`es-slide-out-field${submitted && !values.contactEmail.trim() ? ' invalid' : ''}`}>
          <label htmlFor="es-sponsor-contact-email">Email Address *</label>
          <input id="es-sponsor-contact-email" type="email" autoComplete="email" placeholder="Email Address" value={values.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
          {submitted && !values.contactEmail.trim() && <span className="error">Required</span>}
        </div>
        <div className="es-slide-out-field">
          <label htmlFor="es-sponsor-contact-phone">Phone Number</label>
          <input id="es-sponsor-contact-phone" type="tel" autoComplete="tel" placeholder="Phone Number" value={values.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
        </div>
      </div>
    </EventSiteSlideOut>
  )
}

function ImageUpload({ label, ratio, value, onChange, invalid, ctaColor, btn }) {
  const inputRef = useRef(null)
  const pick = file => file && onChange(URL.createObjectURL(file))
  return (
    <div className={`es-slide-out-field${invalid ? ' invalid' : ''}`}>
      <label>{label} *</label>
      <div
        className="es-slide-out-upload"
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          pick(e.dataTransfer.files?.[0])
        }}
      >
        {value && <img src={value} alt="" />}
        <GSButton
          title={value ? 'Replace' : 'Upload'}
          buttonIcon={faArrowCircleUp}
          {...btn('uploadImage', ctaColor, 'subtle')}
          onClick={() => inputRef.current?.click()}
          isFocusable
        />
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.gif" onChange={e => pick(e.target.files?.[0])} />
        <span className="hint">Tap or drag a file to upload. The image ratio is {ratio}. Accepted file types are .JPG, .PNG, .GIF</span>
      </div>
      {invalid && <span className="error">Required</span>}
    </div>
  )
}
