import { eventSite } from './mockEventSite.js'

// The public Event Site's own top-level pages, in the same order as its
// sub-nav tab row (see EventWebsitePage.jsx's SUB_NAV_ITEMS, which imports
// this rather than keeping its own copy). Backs the Event Site Pages tiled
// list on the Event Site & Packages hub (EventSitePagesTiles.jsx) so the two
// can't drift apart.
export const EVENT_SITE_PAGES = ['Event Details', 'Packages', 'Sponsors', 'Registrants', 'Rounds', 'Leaderboards', 'Auction', 'Donate']

function slugify(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// The public URL for each page — shown (and copyable) on its own tile in
// EventSitePagesTiles.jsx. Built from the same tournament name the live
// preview itself uses (mockEventSite.js) rather than a second hardcoded
// slug, so the two can't drift apart.
const EVENT_SITE_BASE_URL = `https://events.golfstatus.dev/${slugify(eventSite.tournamentName)}`

export const EVENT_SITE_PAGE_URLS = Object.fromEntries(
  EVENT_SITE_PAGES.map(page => [page, `${EVENT_SITE_BASE_URL}/${slugify(page)}`])
)
