// Persists the Event Website preview's own header toggles (Light/Dark
// mode, the Default/Winter/Lavender theme picker, and the Monochromatic
// button) across a page refresh — separate from eventSiteStyle.js's own
// storage, which is the *saved design* the Website Design and Style
// screen's Save button writes. These three are just "how I'm currently
// previewing it", not part of that saved design, so toggling one here
// never marks that screen's own Save as dirty.
const STORAGE_KEY = 'gs-event-site-preview'

export function loadEventSitePreview() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveEventSitePreview(preview) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preview))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means these toggles won't survive this session, not a real failure.
  }
}
