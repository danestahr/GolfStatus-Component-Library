import { useState } from 'react'

// Cart state for the public Event Website preview (no backend — lives for the
// page session only). Shared by the Packages page's "Add To Cart" buttons, the
// sticky next-step footer, and the My Cart page.
//
// Every package with a required form gets one form per unit bought (Figma "My
// Cart": a quantity of 2 shows two Required rows). The mock packages carry no
// real form links (formsCount is 0 across the board), so the form each
// category asks for is mapped here by category instead.
const FORM_BY_CATEGORY = {
  'Sponsorship Package': 'Sponsor Details',
  'Team Registration Package': 'Team Details',
  'Player Registration Package': 'Player Details',
}

export const requiredFormName = pkg => FORM_BY_CATEGORY[pkg.category] ?? null

// Signed-out visitors add their contact details in the cart; this stands in
// for what that form would collect.
export const MOCK_CONTACT = { name: 'Alex Morgan', email: 'alex.morgan@email.com', phone: '(555) 010-2030' }

export function useEventSiteCart() {
  // [{ pkg, qty }] in the order added.
  const [items, setItems] = useState([])
  // Completed form rows, keyed `${pkg.id}:${unitIndex}`.
  const [completedForms, setCompletedForms] = useState({})
  const [contactComplete, setContactComplete] = useState(false)
  const [contact, setContact] = useState(null)

  const maxQty = pkg => (pkg.remaining == null ? Infinity : pkg.remaining)

  const add = pkg =>
    setItems(prev => {
      const existing = prev.find(item => item.pkg.id === pkg.id)
      if (!existing) return [...prev, { pkg, qty: 1 }]
      return prev.map(item => (item === existing ? { ...item, qty: Math.min(item.qty + 1, maxQty(pkg)) } : item))
    })

  const setQty = (pkgId, qty) =>
    setItems(prev => prev.map(item => (item.pkg.id === pkgId ? { ...item, qty: Math.max(1, Math.min(qty, maxQty(item.pkg))) } : item)))

  const remove = pkgId => setItems(prev => prev.filter(item => item.pkg.id !== pkgId))

  const toggleForm = key => setCompletedForms(prev => ({ ...prev, [key]: !prev[key] }))

  const completeForm = key => setCompletedForms(prev => ({ ...prev, [key]: true }))

  const restart = () => {
    setItems([])
    setCompletedForms({})
    setContactComplete(false)
    setContact(null)
  }

  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.pkg.price, 0)

  const incompleteForms = items.reduce((sum, item) => {
    if (!requiredFormName(item.pkg)) return sum
    return sum + Array.from({ length: item.qty }).filter((_, unit) => !completedForms[`${item.pkg.id}:${unit}`]).length
  }, 0)

  // What the sticky footer points the registrant at next.
  const nextStep = !contactComplete
    ? { label: 'Add Contact Details', target: 'contact' }
    : incompleteForms > 0
      ? { label: 'Complete Package Forms', target: 'forms' }
      : { label: 'Review & Checkout', target: 'checkout' }

  return {
    items,
    count,
    subtotal,
    completedForms,
    contactComplete,
    setContactComplete,
    contact,
    saveContact: details => {
      setContact(details)
      setContactComplete(true)
    },
    incompleteForms,
    nextStep,
    add,
    setQty,
    remove,
    toggleForm,
    completeForm,
    restart,
  }
}
