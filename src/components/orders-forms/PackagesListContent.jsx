import { useLayoutEffect, useRef, useState } from 'react'
import { faMagnifyingGlass, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'

import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import GSEmptyList from '../../gs-lib/components/gs-empty-list'
import PackageCategorySection from './PackageCategorySection.jsx'
import { NON_PREMIUM_PACKAGE_CATEGORY_LABELS, PACKAGE_CATEGORIES } from '../../data/eventSitePackageCategories.js'
import './PackagesListContent.scss'

// The "Packages" screen opened from the "Packages" row (or a package tile)
// on EventSitePackagesListPage (Figma "Event Site + Packages" → Packages) —
// same action-bar/search/grouped-list shell as FormsListContent, grouped
// into one PackageCategorySection per category instead of a flat list.
// `categoryLabels` is keyed by PACKAGE_CATEGORIES' own stable `key` (not the
// raw mockEventSitePackages.js `category` value) — see
// EventSitePackagesListPage.jsx's `categoryLabels` state, which the "Edit
// Package Category" screen (`onEditCategory`) writes back to. `packageOrder`
// (also keyed by that same `key`) is each category's own price-sorted/
// manually-reordered id list — see that page's `packageOrder` state and
// `reorderWithinCategory`, same "ids, not the objects themselves" convention
// as SponsorsListPage's `tierOrder`.
export default function PackagesListContent({
  packagesById,
  packageOrder,
  categoryLabels,
  onAddPackage,
  onCopyPackage,
  onEditCategory,
  onReorderCategory,
  isPremium,
}) {
  const [search, setSearch] = useState('')

  // Measures the sticky search bar's height so each category's own sticky
  // header can stick right beneath it — same convention as
  // EntityListPage.jsx, just scoped to this panel screen instead of the
  // page behind it.
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

  const query = search.trim().toLowerCase()
  const matchesSearch = pkg => !query || pkg.name.toLowerCase().includes(query) || pkg.category.toLowerCase().includes(query)

  const groups = PACKAGE_CATEGORIES.map(({ key }) => [
    key,
    packageOrder[key].map(id => packagesById[id]).filter(matchesSearch),
  ]).filter(([, groupPackages]) => groupPackages.length > 0)

  return (
    <div className="pkgl-list" style={{ '--pkgc-sticky-offset': `${stickyHeight}px` }}>
      <GSActionBar
        type="x-large-pad H3"
        header="Packages"
        pageActions={[{ buttonTitle: 'Add Package', buttonIcon: faPlus, type: 'black', actionClick: onAddPackage }]}
      />

      <div className="pkgl-search" ref={stickyRef}>
        <GSinput
          leftIcon={faMagnifyingGlass}
          rightIcon={search ? faXmark : null}
          rightIconClick={() => setSearch('')}
          placeholder="Search Packages..."
          textValue={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="pkgl-body">
        {groups.length === 0 ? (
          search ? (
            <div className="pkgl-empty">No results for "{search}"</div>
          ) : (
            <GSEmptyList title="No Packages Yet" detail="Add a package for registrants to purchase." />
          )
        ) : (
          groups.map(([key, groupPackages]) => (
            <PackageCategorySection
              key={key}
              label={isPremium ? categoryLabels[key] : NON_PREMIUM_PACKAGE_CATEGORY_LABELS[key]}
              packages={groupPackages}
              onCopyPackage={onCopyPackage}
              // Non-premium categories can't be renamed — no edit handler
              // means PackageCategorySection just leaves the pencil off.
              onEditCategory={isPremium ? () => onEditCategory(key) : undefined}
              // Same for reordering — no handler means PackageCategorySection
              // leaves the grab handle off too (see its own `reorderable`).
              onReorder={isPremium ? newOrder => onReorderCategory(key, newOrder) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
