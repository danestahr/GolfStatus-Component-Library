import { eventSite } from './mockEventSite.js'

// Whether this tournament has donations turned on at all — a real toggle
// would live elsewhere in the app (event settings, not modeled in this
// prototype); hardcoded off here so the Make a Donation tile/section can
// show what a tournament with donations disabled actually looks like,
// admin and live site both. Flip to true to bring the whole feature back —
// nothing else about its tile or its EventWebsitePage.jsx block needs to
// change to support that.
export const DONATIONS_ENABLED = true

// Every section is `editable: true` except Make a Donation while
// DONATIONS_ENABLED is false — the underlying data for some of these (the
// actual package/sponsor lists) is still managed on its own real admin
// screen elsewhere in the app, but this screen can always edit that
// section's own header text and/or button copy (see DEFAULT_SECTION_HEADERS/
// DEFAULT_SECTION_BUTTONS below), so every tile gets a pen affordance and a
// tap target — except Make a Donation, which has nothing to edit while the
// feature itself is off for this tournament. That's the *baseline*; see
// `isHomepageSectionEditable` below for the actual, Premium-aware answer
// EventSiteHomepageSectionsList/EventSitePackagesListPage read instead of
// this flag directly.
//
// One entry per section of the public Event Site homepage (see
// EventWebsitePage.jsx), labeled to match that page's own section text
// exactly, in the same top-to-bottom order they render there. Backs
// EventSiteHomepageSectionsList's tile list.
export const HOMEPAGE_SECTIONS = [
  { id: 'banner', label: 'Banner Image', editable: true },
  { id: 'tournamentDetails', label: 'Tournament Details', editable: true },
  { id: 'description', label: 'Event Description', editable: true },
  { id: 'additionalDescription', label: 'Additional Event Description', editable: true },
  { id: 'registrationDetails', label: 'Registration Details', editable: true },
  { id: 'packages', label: 'Packages', editable: true },
  { id: 'sponsors', label: 'Sponsors', editable: true },
  { id: 'photo', label: 'Photo', editable: true },
  { id: 'video', label: 'Video', editable: true },
  { id: 'donation', label: 'Make a Donation', editable: DONATIONS_ENABLED },
  { id: 'additionalPages', label: 'Additional Pages', editable: true },
  { id: 'liveScoring', label: 'Live Scoring Powered by GolfStatus', editable: true },
]

export const DEFAULT_HOMEPAGE_SECTION_ORDER = HOMEPAGE_SECTIONS.map(s => s.id)

export const HOMEPAGE_SECTION_BY_ID = Object.fromEntries(HOMEPAGE_SECTIONS.map(s => [s.id, s]))

// Sections whose fields editor is otherwise just a bare Section Header field
// (Packages/Sponsors/Donation/Additional Pages/Live Scoring — see
// EventSiteHomepageFields.jsx) or button copy (Tournament Details) — a
// non-premium tournament can't type into a Section Header at all (that
// field itself disappears, see EventSiteHomepageFields.jsx's `locked`), so
// without this list those five tiles would open onto a screen with no
// fields left on it whatsoever. Hiding their pen/plus (and blocking direct
// navigation to their own edit route) instead of showing that empty screen
// is what `isHomepageSectionEditable` below actually does.
const PREMIUM_ONLY_SECTION_IDS = ['tournamentDetails', 'packages', 'sponsors', 'donation', 'liveScoring', 'additionalPages']

// The one place EventSiteHomepageSectionsList (tile pen/plus + disabled
// look) and EventSitePackagesListPage (its own edit route's validity) both
// read a section's real, Premium-aware editable state from, instead of
// HOMEPAGE_SECTIONS' own static `editable` directly.
export function isHomepageSectionEditable(id, isPremium) {
  return Boolean(HOMEPAGE_SECTION_BY_ID[id]?.editable) && (isPremium || !PREMIUM_ONLY_SECTION_IDS.includes(id))
}

// No backend for this prototype, so drag-reordering the tile list (Save on
// EventSiteHomepageSectionsList, via EventSitePackagesListPage.jsx) persists
// the order here — same convention as data/eventSiteStyle.js. This is what
// lets a saved order actually drive the rendered section order on the public
// event site (EventWebsitePage.jsx reads it back on mount) and survive a
// page reload too.
const ORDER_STORAGE_KEY = 'gs-event-site-homepage-order'

export function loadHomepageSectionOrder() {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY)
    if (!raw) return DEFAULT_HOMEPAGE_SECTION_ORDER
    const parsed = JSON.parse(raw)
    // Guards against a saved order that's drifted from the current
    // HOMEPAGE_SECTIONS list (a section added/removed since it was saved) —
    // keeps whatever's still valid, in the saved order, dropping ids this
    // list doesn't recognize any more. A section introduced since the save
    // (e.g. Photo/Video, split out of the old combined "media" id) slots in
    // right where it sits in DEFAULT_HOMEPAGE_SECTION_ORDER, next to
    // whichever of its default neighbors is still present — not just
    // appended after everything else — so a fresh split/addition lands
    // where an admin would actually expect it instead of trailing at the
    // very bottom for every tournament that saved an order before it
    // existed.
    const kept = parsed.filter(id => id in HOMEPAGE_SECTION_BY_ID)
    const missing = DEFAULT_HOMEPAGE_SECTION_ORDER.filter(id => !kept.includes(id))
    const result = [...kept]
    missing.forEach(id => {
      const defaultIndex = DEFAULT_HOMEPAGE_SECTION_ORDER.indexOf(id)
      let insertAfter = -1
      for (let i = defaultIndex - 1; i >= 0; i--) {
        const precedingIndex = result.indexOf(DEFAULT_HOMEPAGE_SECTION_ORDER[i])
        if (precedingIndex !== -1) {
          insertAfter = precedingIndex
          break
        }
      }
      result.splice(insertAfter + 1, 0, id)
    })
    return result
  } catch {
    return DEFAULT_HOMEPAGE_SECTION_ORDER
  }
}

export function saveHomepageSectionOrder(order) {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the order won't survive this session, not a real failure.
  }
}

// The public event site's own title text for each editable section that has
// one (EventWebsitePage.jsx's GSPageSection `title`) — customizable from the
// Event Site Homepage screen's own field editor (EventSiteHomepageFields.jsx's
// "Section Header" input), separate from this file's own HOMEPAGE_SECTIONS
// `label`, which stays the fixed, admin-facing tile name regardless of what's
// typed here. Only sections whose fields editor actually has a Section Header
// field get an entry — 'banner' and 'tournamentDetails' have no title on the
// live site to customize (see EventWebsitePage.jsx's banner/tournamentDetails
// blocks), so they're left out; tournamentDetails still gets its own button-
// text fields instead (see DEFAULT_SECTION_BUTTONS below). Cleared to '' is a
// real, savable value here (see loadHomepageSectionHeaders below) — it's what
// a blank Section Header field means: GSPageSection already skips rendering
// its title when passed a falsy value, so an empty header just hides that
// section's header on the live site instead of falling back to its default
// text.
export const DEFAULT_SECTION_HEADERS = {
  description: 'Event Description',
  additionalDescription: 'Additional Event Description',
  registrationDetails: 'Registration Details',
  packages: 'Packages',
  sponsors: 'Sponsors',
  photo: 'Photo',
  video: 'Video',
  donation: 'Make a Donation',
  additionalPages: 'Additional Pages',
  liveScoring: 'Live Scoring Powered by GolfStatus',
}

// Same no-backend/localStorage convention as loadHomepageSectionOrder/
// saveHomepageSectionOrder above — this is what lets a saved header survive
// navigating to /event-site (EventWebsitePage.jsx reads it back on mount)
// and a page reload.
const HEADERS_STORAGE_KEY = 'gs-event-site-homepage-headers'

export function loadHomepageSectionHeaders() {
  try {
    const raw = localStorage.getItem(HEADERS_STORAGE_KEY)
    return raw ? { ...DEFAULT_SECTION_HEADERS, ...JSON.parse(raw) } : DEFAULT_SECTION_HEADERS
  } catch {
    return DEFAULT_SECTION_HEADERS
  }
}

export function saveHomepageSectionHeaders(headers) {
  try {
    localStorage.setItem(HEADERS_STORAGE_KEY, JSON.stringify(headers))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the headers won't survive this session, not a real failure.
  }
}

// The public event site's own body copy for each editable section that has
// one (EventWebsitePage.jsx's GSPageSection `description`) — same
// customizable-from-the-fields-editor, separate-from-the-tile-label
// relationship DEFAULT_SECTION_HEADERS has above, just for the
// GSTextEditor field instead of the Section Header input. Defaults mirror
// data/mockEventSite.js's own copy (description/additionalDescription) so
// the live site's first render matches what it already showed before this
// became editable; 'registrationDetails' has no such field on eventSite, so
// its default is the same "Registration closes on..." line
// EventWebsitePage.jsx used to hardcode there.
export const DEFAULT_SECTION_CONTENT = {
  description: eventSite.description,
  additionalDescription: eventSite.additionalDescription,
  registrationDetails: `Registration closes on ${eventSite.registrationCloseAt}.`,
}

// Same no-backend/localStorage convention as the headers pair above.
const CONTENT_STORAGE_KEY = 'gs-event-site-homepage-content'

export function loadHomepageSectionContent() {
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY)
    return raw ? { ...DEFAULT_SECTION_CONTENT, ...JSON.parse(raw) } : DEFAULT_SECTION_CONTENT
  } catch {
    return DEFAULT_SECTION_CONTENT
  }
}

export function saveHomepageSectionContent(content) {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the content won't survive this session, not a real failure.
  }
}

// The Banner Image/Promotional Image/Promotional Video file fields
// (EventSiteHomepageFields.jsx) store their actual File/Blob in IndexedDB —
// NOT localStorage like every pair above. A photo, and especially a video,
// routinely exceeds localStorage's ~5-10MB per-origin quota once
// base64-encoded (which itself inflates the file another ~33% on top of
// that), so `localStorage.setItem` would just throw and get swallowed by a
// catch, silently: it'd still look saved in the admin (the draft still
// holds the real in-memory File), but /event-site would never actually
// show it. IndexedDB has no such practical ceiling and stores the Blob at
// its real binary size, no base64 inflation — that's the whole reason
// these three don't follow the JSON.stringify-into-localStorage convention
// every other saved field on this page uses. `load*` below hand back that
// Blob directly (a Promise, unlike every synchronous load* above) —
// EventWebsitePage.jsx turns it into an object URL (and revokes the
// previous one) rather than using it as a `src` string directly.
const FILES_DB_NAME = 'gs-event-site-homepage-files'
const FILES_STORE_NAME = 'files'

function openHomepageFilesDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(FILES_DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(FILES_STORE_NAME)) {
        request.result.createObjectStore(FILES_STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function saveHomepageImage(key, file) {
  try {
    const db = await openHomepageFilesDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(FILES_STORE_NAME, 'readwrite')
      if (file) tx.objectStore(FILES_STORE_NAME).put(file, key)
      else tx.objectStore(FILES_STORE_NAME).delete(key)
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Prototype-only persistence — IndexedDB unavailable/blocked (private
    // browsing, storage disabled) just means the file won't survive this
    // session, not a real failure.
  }
}

async function loadHomepageImage(key) {
  try {
    const db = await openHomepageFilesDb()
    return await new Promise((resolve, reject) => {
      const request = db.transaction(FILES_STORE_NAME, 'readonly').objectStore(FILES_STORE_NAME).get(key)
      request.onsuccess = () => resolve(request.result ?? null)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return null
  }
}

const BANNER_IMAGE_STORAGE_KEY = 'banner-image'

export function loadHomepageBannerImage() {
  return loadHomepageImage(BANNER_IMAGE_STORAGE_KEY)
}

export function saveHomepageBannerImage(file) {
  return saveHomepageImage(BANNER_IMAGE_STORAGE_KEY, file)
}

const MEDIA_IMAGE_STORAGE_KEY = 'media-image'

export function loadHomepageMediaImage() {
  return loadHomepageImage(MEDIA_IMAGE_STORAGE_KEY)
}

export function saveHomepageMediaImage(file) {
  return saveHomepageImage(MEDIA_IMAGE_STORAGE_KEY, file)
}

const MEDIA_VIDEO_STORAGE_KEY = 'media-video'

export function loadHomepageMediaVideo() {
  return loadHomepageImage(MEDIA_VIDEO_STORAGE_KEY)
}

export function saveHomepageMediaVideo(file) {
  return saveHomepageImage(MEDIA_VIDEO_STORAGE_KEY, file)
}

// The public event site's own button copy for each section that renders one
// (EventWebsitePage.jsx's GSButton/sectionActions `title`) — customizable
// from the same fields editor as DEFAULT_SECTION_HEADERS above, via a
// "<Button> Button Text" field per button (EventSiteHomepageFields.jsx).
// Keyed by sectionId -> { buttonKey: text }, since a section like
// tournamentDetails or sponsors renders more than one button. Only sections
// with at least one customizable button get an entry.
export const DEFAULT_SECTION_BUTTONS = {
  tournamentDetails: { registerNow: 'Register Now', makeDonation: 'Make A Donation' },
  packages: { viewPackages: 'View Packages' },
  sponsors: { viewSponsors: 'View Sponsors' },
  donation: { donateNow: 'Donate Now' },
}

// Same no-backend/localStorage convention as the pairs above. Merges per
// section (not just top-level) so a section added to DEFAULT_SECTION_BUTTONS
// after a save already happened still gets its new button's default text
// instead of `undefined`. Only picks up keys DEFAULT_SECTION_BUTTONS still
// recognizes for that section, not everything `saved[sectionId]` happens to
// hold — a button field removed from a section (e.g. Sponsors' old "Sponsor
// Website" text) can still be sitting in localStorage from before it was
// removed, and blindly spreading it back in would leave that orphaned key in
// the live `buttons[id]` object forever.
const BUTTONS_STORAGE_KEY = 'gs-event-site-homepage-buttons'

export function loadHomepageSectionButtons() {
  try {
    const raw = localStorage.getItem(BUTTONS_STORAGE_KEY)
    const saved = raw ? JSON.parse(raw) : {}
    return Object.fromEntries(
      Object.entries(DEFAULT_SECTION_BUTTONS).map(([sectionId, defaults]) => [
        sectionId,
        Object.fromEntries(Object.keys(defaults).map(key => [key, saved[sectionId]?.[key] ?? defaults[key]])),
      ])
    )
  } catch {
    return DEFAULT_SECTION_BUTTONS
  }
}

export function saveHomepageSectionButtons(buttons) {
  try {
    localStorage.setItem(BUTTONS_STORAGE_KEY, JSON.stringify(buttons))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the button text won't survive this session, not a real failure.
  }
}

// Every section's own "Display Section Header" toggle (EventSiteHomepageFields.jsx) —
// on by default, so the tile opens exactly as it does today until an admin
// actually turns one off. Off hides that section's OTHER input fields
// entirely (EventSiteHomepageFields.jsx's own sectionFields helper) — there's
// nothing left to configure for a section that isn't showing. Turning it
// back on doesn't erase whatever was typed while it was off; the fields
// just reappear holding it.
export const DEFAULT_SECTION_HEADER_VISIBILITY = Object.fromEntries(HOMEPAGE_SECTIONS.map(s => [s.id, true]))

// Same no-backend/localStorage convention as the pairs above.
const HEADER_VISIBILITY_STORAGE_KEY = 'gs-event-site-homepage-header-visibility'

export function loadHomepageSectionHeaderVisibility() {
  try {
    const raw = localStorage.getItem(HEADER_VISIBILITY_STORAGE_KEY)
    return raw ? { ...DEFAULT_SECTION_HEADER_VISIBILITY, ...JSON.parse(raw) } : DEFAULT_SECTION_HEADER_VISIBILITY
  } catch {
    return DEFAULT_SECTION_HEADER_VISIBILITY
  }
}

export function saveHomepageSectionHeaderVisibility(visibility) {
  try {
    localStorage.setItem(HEADER_VISIBILITY_STORAGE_KEY, JSON.stringify(visibility))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the choice won't survive this session, not a real failure.
  }
}
