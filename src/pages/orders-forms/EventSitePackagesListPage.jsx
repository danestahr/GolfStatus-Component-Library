import { Fragment, useMemo, useState } from 'react'

import EntityListPage from '../../components/orders-forms/EntityListPage.jsx'
import NavRow from '../../components/orders-forms/NavRow.jsx'
import EventSitePreviewCard from '../../components/orders-forms/EventSitePreviewCard.jsx'
import PackageCard from '../../components/orders-forms/PackageCard.jsx'
import { eventSite } from '../../data/mockEventSite.js'
import { eventSitePackages } from '../../data/mockEventSitePackages.js'
import './EventSitePackagesListPage.scss'

// Order matches the Figma "Event Site + Packages" navigation list — the
// event site preview card hangs off the first row and the package cards
// hang off the "Packages" row, so search filtering below keys off these ids
// to decide whether that inline content should stay visible.
const NAV_ROWS = [
  {
    id: 'event-site-details',
    title: 'Event Site & Registration Details',
    description: 'Manage tournament activation, registration privacy, event site url, registration details, and registration close date.',
  },
  {
    id: 'event-site-homepage',
    title: 'Event Site Homepage',
    description: 'Manage promotional content, imagery, and media.',
  },
  {
    id: 'packages',
    title: 'Packages',
    description: 'Manage registration packages, package items, forms, and more.',
  },
  {
    id: 'additional-pages',
    title: 'Additional Event Site Pages',
    description: 'Manage the visibility of sponsorships, hole assignments, course details, leaderboards, and registrants.',
  },
  {
    id: 'auction',
    title: 'Auction',
    description: 'Link to an auction on the event site.',
  },
  {
    id: 'discounts',
    title: 'Discounts',
    description: 'Manage discounts codes.',
  },
  {
    id: 'order-receipt',
    title: 'Order Receipt',
    description: 'Manage text and images on registration order receipts.',
  },
]

function matches(query, ...texts) {
  return !query || texts.some(text => text.toLowerCase().includes(query))
}

export default function EventSitePackagesListPage() {
  const [search, setSearch] = useState('')

  const { visibleRowIds, visiblePackages } = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = NAV_ROWS.filter(row => matches(query, row.title, row.description))
    return {
      visibleRowIds: new Set(rows.map(row => row.id)),
      visiblePackages: eventSitePackages.filter(pkg => matches(query, pkg.name, pkg.category)),
    }
  }, [search])

  const showPackages = visibleRowIds.has('packages') || visiblePackages.length > 0
  const isEmpty = visibleRowIds.size === 0 && visiblePackages.length === 0

  return (
    <EntityListPage
      header="Event Site & Packages"
      searchPlaceholder="Search Event Site and Packages..."
      search={search}
      onSearchChange={setSearch}
    >
      {isEmpty ? (
        <div className="efp-empty">No results match your search.</div>
      ) : (
        <>
          {NAV_ROWS.map(row => (
            <Fragment key={row.id}>
              {visibleRowIds.has(row.id) && <NavRow title={row.title} description={row.description} />}
              {row.id === 'event-site-details' && visibleRowIds.has('event-site-details') && (
                <EventSitePreviewCard eventSite={eventSite} />
              )}
              {row.id === 'packages' && showPackages && (
                <div className="efp-pkg-row">
                  {visiblePackages.map(pkg => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              )}
            </Fragment>
          ))}
        </>
      )}
    </EntityListPage>
  )
}
