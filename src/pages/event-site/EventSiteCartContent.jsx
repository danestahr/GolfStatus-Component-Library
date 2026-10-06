import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faExclamationCircle, faMinus, faPen, faPlus, faRotateLeft, faTrash } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import { formatMoney } from '../../components/orders/orderUtils'
import { eventSitePackages } from '../../data/mockEventSitePackages.js'
import { loadSavedPackages } from '../../data/eventSitePackageCategories.js'
import avatarSample from '../../assets/avatar-sample.png'
import { MOCK_CONTACT, requiredFormName } from './useEventSiteCart.js'
import EventSiteContactSlideOut from './EventSiteContactSlideOut.jsx'
import EventSiteSponsorSlideOut from './EventSiteSponsorSlideOut.jsx'
import EventSiteTeamSlideOut from './EventSiteTeamSlideOut.jsx'
import './EventSiteCartContent.scss'

// The public Event Site's "My Cart" page (Figma "Registration - Donations -
// Cart - Checkout" > My Cart). Reached from the sticky footer's Continue
// button or the header's cart icon. Reuses the Packages page's band/card
// styles (EventSitePackagesContent.scss) so the two read as one site.
//
// Donations aren't in the cart yet — the homepage's Donate tiles aren't wired
// to it — so the Figma's "My Donation" section has no counterpart here.
const SUGGESTION_COUNT = 4
// "You Might Also Like" is hidden for now; flip to true to bring it back.
const SHOW_SUGGESTIONS = false

export default function EventSiteCartContent({ cart, ctaColor, btn, onBrowsePackages }) {
  const inCartIds = new Set(cart.items.map(item => item.pkg.id))

  // "You Might Also Like": active packages not already in the cart, add-ons
  // first since those are the easy upsells.
  const suggestions = useMemo(() => {
    const packages = loadSavedPackages() ?? eventSitePackages
    return packages
      .filter(pkg => pkg.status === 'active' && pkg.remaining !== 0 && !inCartIds.has(pkg.id))
      .sort((a, b) => Number(b.category === 'Add-on Package') - Number(a.category === 'Add-on Package') || a.price - b.price)
      .slice(0, SUGGESTION_COUNT)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.items.length])

  return (
    <div className="es-packages es-cart">
      <div className="es-packages-band es-packages-title-band">
        <div className="es-cart-title-row">
          <h1 className="es-packages-title">My Cart</h1>
          <GSButton title="Restart Order" buttonIcon={faRotateLeft} {...btn('restartOrder', ctaColor, 'transparent')} onClick={cart.restart} isFocusable />
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="es-packages-band">
          <div className="es-packages-inner">
            <div className="es-packages-card es-cart-empty">
              <div className="es-packages-card-title">Your cart is empty</div>
              <div className="es-packages-card-sub">Add a package to get started.</div>
              <GSButton title="View Packages" {...btn('viewPackages', ctaColor, 'fill')} onClick={onBrowsePackages} isFocusable />
            </div>
          </div>
        </div>
      ) : (
        <>
          <ContactSection cart={cart} ctaColor={ctaColor} btn={btn} />

          {SHOW_SUGGESTIONS && suggestions.length > 0 && (
            <div className="es-packages-band">
              <div className="es-packages-inner">
                <h2 className="es-packages-section-title">You Might Also Like</h2>
                <div className="es-packages-card es-cart-suggestions">
                  {suggestions.map(pkg => (
                    <div key={pkg.id} className="es-cart-suggestion">
                      <div className="es-cart-suggestion-text">
                        <div className="es-package-name">{pkg.name}</div>
                        <div className="es-package-price">${formatMoney(pkg.price)}</div>
                        {pkg.remaining != null && <div className="es-package-available">{pkg.remaining} Available</div>}
                      </div>
                      <GSButton title="Add" buttonIcon={faPlus} size="secondary" {...btn('addSuggested', ctaColor, 'subtle')} onClick={() => cart.add(pkg)} isFocusable />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="es-packages-band" id="es-cart-packages">
            <div className="es-packages-inner">
              <h2 className="es-packages-section-title">My Packages</h2>
              {cart.items.map(item => (
                <CartPackage key={item.pkg.id} item={item} cart={cart} ctaColor={ctaColor} btn={btn} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Signed-out: prompt for details. Once added, the card becomes the registrant's
// own summary (Figma's logged-in "Default" variant).
function ContactSection({ cart, ctaColor, btn }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const contact = cart.contact ?? MOCK_CONTACT
  const contactName = cart.contact ? `${cart.contact.firstName} ${cart.contact.lastName}` : MOCK_CONTACT.name
  return (
    <div className="es-packages-band" id="es-cart-contact">
      <div className="es-packages-inner">
        <div className="es-packages-card es-cart-contact">
          {cart.contactComplete ? (
            <>
              <div className="es-cart-contact-summary">
                <img className="es-cart-contact-avatar" src={avatarSample} alt="" />
                <div>
                  <div className="es-packages-card-title">{contactName}</div>
                  <div className="es-package-available">{contact.email}</div>
                  <div className="es-package-available">{contact.phone}</div>
                </div>
              </div>
              <GSButton title="Edit Details" buttonIcon={faPen} {...btn('addDetails', ctaColor, 'subtle')} onClick={() => setPanelOpen(true)} isFocusable />
            </>
          ) : (
            <>
              <div className="es-cart-contact-text">
                <div className="es-packages-card-title">Add Your Contact Details</div>
                <div className="es-packages-card-sub">If you have an account already, sign in and we’ll auto-fill it for you.</div>
              </div>
              <div className="es-cart-contact-actions">
                <GSButton title="Add Details" buttonIcon={faPen} {...btn('addDetails', ctaColor, 'fill')} onClick={() => setPanelOpen(true)} isFocusable />
                <GSButton title="Sign In" {...btn('signIn', ctaColor, 'subtle')} isFocusable />
              </div>
            </>
          )}
        </div>
      </div>
      <EventSiteContactSlideOut
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        initial={cart.contact}
        onSave={details => {
          cart.saveContact(details)
          setPanelOpen(false)
        }}
        ctaColor={ctaColor}
        btn={btn}
      />
    </div>
  )
}

// Package forms that have a designed slide-out.
const SLIDE_OUT_BY_FORM = { 'Sponsor Details': EventSiteSponsorSlideOut, 'Team Details': EventSiteTeamSlideOut }

const splitMockContact = () => {
  const [firstName, ...rest] = MOCK_CONTACT.name.split(' ')
  return { firstName, lastName: rest.join(' '), email: MOCK_CONTACT.email, phone: MOCK_CONTACT.phone }
}

function CartPackage({ item, cart, ctaColor, btn }) {
  const { pkg, qty } = item
  const formName = requiredFormName(pkg)
  const atMax = pkg.remaining != null && qty >= pkg.remaining
  // Sponsor / Team forms open a slide-out for the unit being edited; their
  // saved answers are kept per unit. Other forms just toggle complete.
  const [openKey, setOpenKey] = useState(null)
  const [formData, setFormData] = useState({})
  const SlideOut = SLIDE_OUT_BY_FORM[formName]
  const contact = cart.contact ?? splitMockContact()

  return (
    <div className="es-packages-card es-cart-package">
      <div className="es-cart-package-top">
        <div className="es-cart-package-details">
          <div className="es-package-name">{pkg.name}</div>
          <div className="es-package-price">${formatMoney(pkg.price)}</div>
          <div className="es-cart-qty" role="group" aria-label={`Quantity of ${pkg.name}`}>
            <GSButton buttonIcon={faMinus} size="secondary" aria-label="Decrease quantity" {...btn('qtyStepper', ctaColor, 'subtle')} onClick={() => cart.setQty(pkg.id, qty - 1)} isDisabled={qty <= 1} isFocusable />
            <span className="es-cart-qty-value">{qty}</span>
            <GSButton buttonIcon={faPlus} size="secondary" aria-label="Increase quantity" {...btn('qtyStepper', ctaColor, 'subtle')} onClick={() => cart.setQty(pkg.id, qty + 1)} isDisabled={atMax} isFocusable />
          </div>
        </div>
        <GSButton buttonIcon={faTrash} aria-label={`Remove ${pkg.name}`} {...btn('removePackage', ctaColor, 'subtle')} onClick={() => cart.remove(pkg.id)} isFocusable />
      </div>

      {formName && (
        <div className="es-cart-forms">
          <div className="es-cart-forms-label">{qty > 1 ? 'Package Forms' : 'Package Form'}</div>
          {Array.from({ length: qty }).map((_, unit) => {
            const key = `${pkg.id}:${unit}`
            const done = !!cart.completedForms[key]
            return (
              <div key={key} className={`es-cart-form${done ? '' : ' incomplete'}`}>
                <div className="es-cart-form-details">
                  <div>
                    <div className="es-package-name">{qty > 1 ? `${formName} ${unit + 1}` : formName}</div>
                    <div className="es-package-available">Required</div>
                  </div>
                  <span className={`es-cart-form-status${done ? ' complete' : ''}`}>
                    <FontAwesomeIcon icon={done ? faCircleCheck : faExclamationCircle} />
                    {done ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <GSButton
                  title={done ? 'Edit Details' : 'Add Details'}
                  buttonIcon={faPen}
                  {...(done ? btn('addDetails', ctaColor, 'subtle') : { buttonId: 'addDetails', type: 'error' })}
                  onClick={() => (SlideOut ? setOpenKey(key) : cart.toggleForm(key))}
                  isFocusable
                />
              </div>
            )
          })}
        </div>
      )}

      {SlideOut && (
        <SlideOut
          isOpen={openKey !== null}
          onClose={() => setOpenKey(null)}
          initial={formData[openKey]}
          contact={contact}
          onSave={details => {
            setFormData(prev => ({ ...prev, [openKey]: details }))
            cart.completeForm(openKey)
            setOpenKey(null)
          }}
          ctaColor={ctaColor}
          btn={btn}
        />
      )}
    </div>
  )
}

