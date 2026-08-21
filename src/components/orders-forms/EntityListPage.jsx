import { useLayoutEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import './EntityListPage.scss'

// Shared page shell for the Orders and Forms tile pages (Sponsors, Teams,
// Event Site & Packages) — the same action bar + sticky search + scrollable
// list structure as Orders & Payouts (OrdersDraft1Page.jsx), just without
// the funds card, which is specific to orders.
export default function EntityListPage({ className, header, pageActions, searchPlaceholder, search, onSearchChange, emptyMessage, children }) {
  // Measures the sticky search bar's actual height so any sticky sub-header
  // rendered in `children` (e.g. SponsorTierSection's tier header) can stick
  // right beneath it via --efp-sticky-offset, instead of both landing at
  // top:0 and overlapping.
  const stickyRef = useRef(null)
  const [stickyHeight, setStickyHeight] = useState(0)

  useLayoutEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const measure = () => setStickyHeight(el.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`efp-page-bg${className ? ` ${className}` : ''}`}>
      <GSActionBar type="x-large-pad H3" header={header} pageActions={pageActions} />

      <div className="efp-page-list" style={{ '--efp-sticky-offset': `${stickyHeight}px` }}>
        <div className="efp-col-scroll">
          <div className="efp-list-sticky" ref={stickyRef}>
            <div className="efp-search-row">
              <GSinput
                leftIcon={faMagnifyingGlass}
                rightIcon={search ? faXmark : null}
                rightIconClick={() => onSearchChange('')}
                placeholder={searchPlaceholder}
                textValue={search}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="efp-list-body">
            {children ?? <div className="efp-empty">{emptyMessage}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
