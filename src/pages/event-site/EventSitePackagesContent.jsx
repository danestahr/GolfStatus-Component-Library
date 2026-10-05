import { useEffect, useMemo, useRef, useState } from 'react'
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
const plainButton = (buttonId, color, appearance) => ({ buttonId, color, appearance })

export default function EventSitePackagesContent({ categoryLabels, scrollToKey, ctaColor = 'primary-color', btn = plainButton, onAddToCart }) {
  const [nav, setNav] = useState(null)
  // false while the buttons animate out; nav is cleared once that finishes.
  const [navShown, setNavShown] = useState(false)
  // Flips true a frame after the buttons mount so the CSS transition has a
  // hidden starting state; one transition both ways keeps a mid-flight
  // reversal (scrolling back and forth) smooth.
  const [navEntered, setNavEntered] = useState(false)
  const hasNav = nav != null
  const rootRef = useRef(null)
  const sectionRefs = useRef({})
  const startRef = useRef(null)

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
    // Resetting to the top (and restoring on Back) is the page shell's job —
    // see EventWebsitePage's goToView.
    if (scrollToKey) sectionRefs.current[scrollToKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [scrollToKey])

  // Once the "Let's Get Started" card has scrolled out of view, the page
  // sticky "Packages" title band shows the category buttons, the one whose
  // section is in view filled. The page scrolls
  // inside App.jsx's <main>, so find that container rather than the window.
  useEffect(() => {
    if (!hasNav || !navShown) return setNavEntered(false)
    const frame = requestAnimationFrame(() => setNavEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [hasNav, navShown])

  useEffect(() => {
    const items = groups.map(group => ({ key: group.key, label: labelFor(group), icon: group.icon }))
    const jump = key => sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    let scroller = null
    for (let node = startRef.current?.parentElement; node; node = node.parentElement) {
      const overflowY = getComputedStyle(node).overflowY
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) { scroller = node; break }
    }
    scroller ??= document.scrollingElement
    const update = () => {
      const header = document.querySelector('.es-header')
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0
      // Sticky title band sits under the header; sections scroll to below both.
      const headerHeight = header ? header.offsetHeight : 0
      const bandHeight = rootRef.current?.querySelector('.es-packages-title-band')?.offsetHeight ?? 0
      rootRef.current?.style.setProperty('--es-header-h', `${headerHeight}px`)
      rootRef.current?.style.setProperty('--es-sticky-h', `${headerHeight + bandHeight}px`)
      const stickyBottom = headerBottom + bandHeight
      const pastStart = startRef.current && startRef.current.getBoundingClientRect().bottom <= stickyBottom
      if (!pastStart) return setNavShown(false)
      setNavShown(true)
      // Active = last section whose top has reached just under the header.
      let activeKey = null
      for (const group of groups) {
        const el = sectionRefs.current[group.key]
        if (el && el.getBoundingClientRect().top <= stickyBottom + 8) activeKey = group.key
      }
      // A short last section can never reach the top, so at the very bottom
      // of the page the last category counts as the one in view.
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
      if (atBottom && groups.length) activeKey = groups[groups.length - 1].key
      setNav({ items, activeKey, jump })
    }
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      scroller.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, categoryLabels])

  const scrollTo = key => sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const labelFor = category => categoryLabels[category.key] ?? category.label

  return (
    <div className="es-packages" ref={rootRef}>
      <div className="es-packages-band es-packages-title-band">
        <div className="es-packages-title-row">
          <h1 className="es-packages-title">Packages</h1>
          {nav && (
            <div
              className={`es-packages-nav${navShown && navEntered ? ' is-visible' : ''}`}
              onTransitionEnd={e => e.target === e.currentTarget && !navShown && setNav(null)}
            >
              {nav.items.map(item => (
                <GSButton
                  key={item.key}
                  buttonIcon={item.icon}
                  isFocusable
                  aria-label={item.label}
                  color="primary-color"
                  appearance={item.key === nav.activeKey ? 'fill' : 'subtle'}
                  onClick={() => nav.jump(item.key)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="es-packages-band">
        <div className="es-packages-inner">
          <div className="es-packages-card es-packages-start" ref={startRef}>
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
            <GSButton title="Get Access" rightIcon={faArrowRight} {...btn('getAccess', ctaColor, 'fill')} isFocusable />
          </div>
        </div>
      </div>

      {groups.map(group => (
        <section key={group.key} className="es-packages-band" ref={el => (sectionRefs.current[group.key] = el)}>
          <div className="es-packages-inner">
            <h2 className="es-packages-section-title">{labelFor(group)}</h2>
            {group.packages.map(pkg => (
              <PackageTile key={pkg.id} pkg={pkg} ctaColor={ctaColor} btn={btn} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function PackageTile({ pkg, ctaColor, btn, onAddToCart }) {
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
          <GSButton title="Add To Cart" buttonIcon={faPlus} {...btn('addToCart', ctaColor, 'outline')} onClick={() => onAddToCart?.(pkg)} isFocusable />
        )}
      </div>
      {pkg.description && <p className="es-package-description">{pkg.description}</p>}
    </div>
  )
}
