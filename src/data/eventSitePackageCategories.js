import { faFlag, faUsers, faUser, faCreditCard } from '@fortawesome/free-solid-svg-icons'

// Stable keys for each mockEventSitePackages.js `category` value, plus the
// default display label shown on the Packages list's category headers
// (Figma "Packages" — PackageCategorySection) and the icon the public Event
// Website's own "Packages" tiles show per category (EventWebsitePage.jsx) —
// one shared source for both instead of two hardcoded copies that could
// drift out of sync. The key is what the "Package Category" edit screen's
// route/state key off (see EventSitePackagesListPage.jsx's
// `categoryLabels`) — the raw `category` values below never change, only
// the label a viewer sees.
export const PACKAGE_CATEGORIES = [
  { key: 'sponsorship', category: 'Sponsorship Package', label: 'Sponsorships', icon: faFlag },
  { key: 'team-registration', category: 'Team Registration Package', label: 'Team Registrations', icon: faUsers },
  { key: 'player-registration', category: 'Player Registration Package', label: 'Player Registrations', icon: faUser },
  { key: 'addon', category: 'Add-on Package', label: 'Add-Ons & Extras', icon: faCreditCard },
]

export const PACKAGE_CATEGORY_BY_KEY = Object.fromEntries(PACKAGE_CATEGORIES.map(c => [c.key, c]))
export const PACKAGE_CATEGORY_KEY_BY_CATEGORY = Object.fromEntries(PACKAGE_CATEGORIES.map(c => [c.category, c.key]))

export const DEFAULT_PACKAGE_CATEGORY_LABELS = Object.fromEntries(PACKAGE_CATEGORIES.map(c => [c.key, c.label]))

// Fixed category labels shown while the Packages screen's own Premium
// toggle (EventSitePackagesListPage.jsx's `isPremium`, wired through
// PackagesListContent) is off — a non-premium tournament can't rename
// categories, so its Packages screen always reads these regardless of
// whatever's saved in `categoryLabels`/localStorage. This toggle exists only
// to demo the two visual states to developers; there's no real premium/
// non-premium gating in this prototype otherwise.
export const NON_PREMIUM_PACKAGE_CATEGORY_LABELS = {
  sponsorship: 'Sponsorships',
  'team-registration': 'Team Registrations',
  'player-registration': 'Player Registrations',
  addon: 'Add Ons & Extras',
}

// No backend for this prototype, so a Save on the "Package Category" screen
// (EditPackageCategoryFields, via EventSitePackagesListPage.jsx's
// `handleSaveCategoryLabel`) persists here instead — same convention as
// data/eventSiteStyle.js. This is what lets a renamed category survive
// navigating to /event-site (EventWebsitePage.jsx reads it back on mount,
// same read-once-on-load convention as siteStyle there) and a page reload.
const LABELS_STORAGE_KEY = 'gs-event-site-package-category-labels'

export function loadPackageCategoryLabels() {
  try {
    const raw = localStorage.getItem(LABELS_STORAGE_KEY)
    return raw ? { ...DEFAULT_PACKAGE_CATEGORY_LABELS, ...JSON.parse(raw) } : DEFAULT_PACKAGE_CATEGORY_LABELS
  } catch {
    return DEFAULT_PACKAGE_CATEGORY_LABELS
  }
}

export function savePackageCategoryLabels(labels) {
  try {
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the labels won't survive this session, not a real failure.
  }
}
