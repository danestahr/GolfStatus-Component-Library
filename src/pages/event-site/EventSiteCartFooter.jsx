import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import { formatMoney } from '../../components/orders/orderUtils'
import './EventSiteCartFooter.scss'

// Sticky "next step" footer shown once something's in the cart (Figma
// "Registration - Donations - Cart - Checkout" > Page Action Drawer). Sticks
// to the bottom of the viewport while the page scrolls under it; Continue
// takes the registrant on to the step it names.
export default function EventSiteCartFooter({ cart, step, sub, ctaColor, btn, onContinue }) {
  return (
    <div className="es-cart-footer" role="region" aria-label="Cart summary">
      <div className="es-cart-footer-content">
        <div className="es-cart-footer-text">
          <div className="es-cart-footer-step">
            <FontAwesomeIcon icon={faCircleCheck} className="es-cart-footer-icon" />
            <span>{step ?? `Next Step: ${cart.nextStep.label}`}</span>
          </div>
          <div className="es-cart-footer-sub">
            {sub ?? `Subtotal: $${formatMoney(cart.subtotal)} | ${cart.count} ${cart.count === 1 ? 'Item' : 'Items'}`}
          </div>
        </div>
        <GSButton title="Continue" rightIcon={faArrowRight} {...btn('continue', ctaColor, 'fill')} onClick={onContinue} isFocusable />
      </div>
    </div>
  )
}
