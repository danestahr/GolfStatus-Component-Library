import { EVENT_SITE_PAGES } from './eventSitePages.js'

// The Event Site Pages screen's own per-page Visible/Hidden toggle
// (EventSitePagesTiles.jsx) and Auction URL field — every page starts
// Visible, matching that screen's own EVENT_SITE_PAGES-derived initial
// state. Same no-backend/localStorage convention as eventSiteStyle.js, so a
// toggle actually reaches /event-site (EventWebsitePage.jsx reads it back on
// mount) instead of only ever affecting the admin screen it was flipped on.
export const DEFAULT_PAGE_VISIBILITY = Object.fromEntries(EVENT_SITE_PAGES.map(page => [page, true]))

const VISIBILITY_STORAGE_KEY = 'gs-event-site-page-visibility'

export function loadPageVisibility() {
  try {
    const raw = localStorage.getItem(VISIBILITY_STORAGE_KEY)
    // Guards against a saved map that's drifted from the current
    // EVENT_SITE_PAGES list (a page added/removed since it was saved), same
    // convention as eventSiteHomepageSections.js's loadHomepageSectionOrder.
    return raw ? { ...DEFAULT_PAGE_VISIBILITY, ...JSON.parse(raw) } : DEFAULT_PAGE_VISIBILITY
  } catch {
    return DEFAULT_PAGE_VISIBILITY
  }
}

export function savePageVisibility(visibility) {
  try {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibility))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the choice won't survive this session, not a real failure.
  }
}

const AUCTION_URL_STORAGE_KEY = 'gs-event-site-auction-url'

export function loadAuctionUrl() {
  try {
    return localStorage.getItem(AUCTION_URL_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveAuctionUrl(url) {
  try {
    localStorage.setItem(AUCTION_URL_STORAGE_KEY, url)
  } catch {
    // Prototype-only persistence — same as savePageVisibility above.
  }
}
