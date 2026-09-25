// Dev-facing Premium/Non-Premium toggle (EventSitePackagesListPage.jsx's own
// top action bar) — persisted here, same read-once-on-load/save-on-toggle
// convention as eventSiteStyle.js, so /event-site (EventWebsitePage.jsx)
// can read the same flag a non-premium tournament can't customize its
// theme colors (see EventWebsitePage.jsx's `customThemeStyle`, forced off
// whenever this is false regardless of the page's own theme picker).
const STORAGE_KEY = 'gs-event-site-premium'

export const DEFAULT_IS_PREMIUM = true

export function loadIsPremium() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_IS_PREMIUM
  } catch {
    return DEFAULT_IS_PREMIUM
  }
}

export function saveIsPremium(isPremium) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isPremium))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the flag won't survive this session, not a real failure.
  }
}
