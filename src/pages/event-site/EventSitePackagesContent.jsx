import { useEffect, useMemo, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faPlus } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import { formatMoney } from '../../components/orders/orderUtils'
import { eventSitePackages } from '../../data/mockEventSitePackages.js'
import { PACKAGE_CATEGORIES, loadPackageOrder, loadSavedPackages } from '../../data/eventSitePackageCategories.js'
import './EventSitePackagesContent.scss'

// The public Event Site's "Packages" page (Figma "Registration - Donations -
// Cart - Checkout" > Packages). Renders inside EventWebsitePage's own
// header/theme when its Packages tab is active. Category order comes from
// PACKAGE_CATEGORIES, package order within each from the admin Packages
// screen's saved `packageOrder`, and the labels from the same renamed-
// category store the homepage tiles read — so all three stay in sync with
// what was just set up in the admin.
//
// `scrollToKey` is the category tile the viewer tapped on the homepage's
// Packages section (null for Register Now / View Packages) — it scrolls that
// category's section into view once on arrival.
export default function EventSitePackagesContent({ categoryLabels, scrollToKey }) {
  const sectionRefs = useRef({})

  const groups = useMemo(() => {
    const packages = loadSavedPackages() ?? eventSitePackages
    const byId = Object.fromEntries(packages.map(pkg => [pkg.id, pkg]))
    const saved = loadPackageOrder() ?? {}
    return PACKAGE_CATEGORIES.map(category => {
      const ordered = (saved[category.key] ?? []).map(id => byId[id]).filter(Boolean)
      const seen = new Set(ordered.map(pkg => pkg.id))
      // Packages the saved order doesn't know about yet (e.g. added before
      // ordering was persisted) go last, price high to low.
      const rest = packages
        .filter(pkg => pkg.category === category.category && !seen.has(pkg.id))
        .sort((a, b) => b.price - a.price)
      return { ...category, packages: [...ordered, ...rest].filter(pkg => pkg.category === category.category && pkg.status === 'active') }
    }).filter(group => group.packages.length > 0)
  }, [])

  useEffect(() => {
    if (scrollToKey) sectionRefs.current[scrollToKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.scrollTo({ top: 0 })
  }, [scrollToKey])

  const scrollTo = key => sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const labelFor = category => categoryLabels[category.key] ?? category.label

  return (
    <div className="es-packages">
      <div className="es-packages-band es-packages-title-band">
        <h1 className="es-packages-title">Packages</h1>
      </div>

      <div className="es-packages-band">
        <div className="es-packages-inner">
          <div className="es-packages-card es-packages-start">
            <div className="es-packages-start-text">
              <div className="es-packages-card-title">Let's Get Started</div>
              <div className="es-packages-card-sub">Select the package types you're looking for.</div>
            </div>
            <div className="es-packages-start-tiles">
              {groups.map(group => (
                <button key={group.key} type="button" className="es-packages-start-tile" onClick={() => scrollTo(group.key)}>
                  <FontAwesomeIcon icon={group.icon} />
                  <span>{labelFor(group)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="es-packages-card es-packages-exclusive">
            <div>
              <div className="es-packages-card-title">Exclusive Packages</div>
              <div className="es-packages-card-sub">To purchase certain packages for this event, you must have a code.</div>
            </div>
            <GSButton title="Get Access" rightIcon={faArrowRight} type="black" isFocusable />
          </div>
        </div>
      </div>

      {groups.map(group => (
        <section key={group.key} className="es-packages-band" ref={el => (sectionRefs.current[group.key] = el)}>
          <div className="es-packages-inner">
            <h2 className="es-packages-section-title">{labelFor(group)}</h2>
            {group.packages.map(pkg => (
              <PackageTile key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function PackageTile({ pkg }) {
  const soldOut = pkg.remaining === 0
  return (
    <div className="es-packages-card es-package">
      <div className="es-package-top">
        <div className="es-package-title">
          <div className="es-package-name">{pkg.name}</div>
          <div>
            <div className="es-package-price">${formatMoney(pkg.price)}</div>
            {pkg.remaining != null && !soldOut && <div className="es-package-available">{pkg.remaining} Available</div>}
          </div>
        </div>
        {soldOut ? (
          <span className="es-package-sold-out">Sold Out</span>
        ) : (
          <GSButton title="Add To Cart" buttonIcon={faPlus} type="green" isFocusable />
        )}
      </div>
      {pkg.description && <p className="es-package-description">{pkg.description}</p>}
    </div>
  )
}
