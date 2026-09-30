import { Fragment, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

import EntityListPage from '../../components/orders-forms/EntityListPage.jsx'
import NavRow from '../../components/orders-forms/NavRow.jsx'
import EventSitePreviewCard from '../../components/orders-forms/EventSitePreviewCard.jsx'
import PackageCard from '../../components/orders-forms/PackageCard.jsx'
import FormsListContent from '../../components/orders-forms/FormsListContent.jsx'
import EventSiteHomepageSectionsList, { sectionTileLabel } from '../../components/orders-forms/EventSiteHomepageSectionsList.jsx'
import EventSiteHomepageFields from '../../components/orders-forms/EventSiteHomepageFields.jsx'
import EventSitePagesTiles from '../../components/orders-forms/EventSitePagesTiles.jsx'
import PackagesListContent from '../../components/orders-forms/PackagesListContent.jsx'
import EditPackageCategoryFields from '../../components/orders-forms/EditPackageCategoryFields.jsx'
import WebsiteDesignStyleFields from '../../components/orders-forms/WebsiteDesignStyleFields.jsx'
import ColorExplorationFields from '../../components/orders-forms/ColorExplorationFields.jsx'
import AddFormFields from '../../components/orders-forms/AddFormFields.jsx'
import AddQuestionFields, { emptyQuestionDraft } from '../../components/orders-forms/AddQuestionFields.jsx'
import AddResponseFields, { answerKey, emptyResponseDraft, formQuestionsFor, playerAnswerKey } from '../../components/orders-forms/AddResponseFields.jsx'
import AppSidePanel from '../../components/AppSidePanel.jsx'
import OrderFormOverviewDraft1 from '../../components/orders/OrderFormOverviewDraft1.jsx'
import AllOrderResponsesForFormDraft1 from '../../components/orders/AllOrderResponsesForFormDraft1.jsx'
import { eventSite } from '../../data/mockEventSite.js'
import { eventSitePackages } from '../../data/mockEventSitePackages.js'
import { forms as initialForms } from '../../data/mockForms.js'
import { orders as initialOrders } from '../../data/mockOrders.js'
import { sponsors } from '../../data/mockSponsors.js'
import { registeredTeams } from '../../data/mockTeams.js'
import { loadEventSiteStyle, saveEventSiteStyle, subscribeEventSiteStyle } from '../../data/eventSiteStyle.js'
import {
  DEFAULT_HOMEPAGE_SECTION_ORDER,
  DEFAULT_SECTION_HEADERS,
  HOMEPAGE_SECTION_BY_ID,
  isHomepageSectionEditable,
  loadHomepageSectionOrder,
  saveHomepageSectionOrder,
  loadHomepageSectionHeaders,
  saveHomepageSectionHeaders,
  loadHomepageSectionContent,
  saveHomepageSectionContent,
  loadHomepageBannerImage,
  saveHomepageBannerImage,
  loadHomepageMediaImage,
  saveHomepageMediaImage,
  loadHomepageMediaVideo,
  saveHomepageMediaVideo,
  loadHomepageSectionButtons,
  saveHomepageSectionButtons,
} from '../../data/eventSiteHomepageSections.js'
import { EVENT_SITE_PAGES } from '../../data/eventSitePages.js'
import {
  loadPageVisibility,
  savePageVisibility,
  loadAuctionUrl,
  saveAuctionUrl,
} from '../../data/eventSitePagesVisibility.js'
import { loadIsPremium, saveIsPremium } from '../../data/eventSitePremium.js'
import {
  DEFAULT_PACKAGE_CATEGORY_LABELS,
  PACKAGE_CATEGORIES,
  PACKAGE_CATEGORY_BY_KEY,
  PACKAGE_CATEGORY_KEY_BY_CATEGORY,
  loadPackageCategoryLabels,
  loadPackageOrder,
  savePackageOrder,
  loadSavedPackages,
  saveSavedPackages,
  savePackageCategoryLabels,
} from '../../data/eventSitePackageCategories.js'
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
    id: 'event-site-pages',
    title: 'Event Site Pages',
    description: 'View all pages on the event site.',
    // Hidden for now — the screen (EventSitePagesTiles) and its route stay
    // wired up (still reachable at SITE_PAGES_PATH), just not surfaced here.
    hidden: true,
  },
  {
    id: 'website-design-style',
    title: 'Website Colors',
    description: 'Manage the event site’s primary and accent colors.',
    // Premium-only — non-premium tournaments can't customize colors, so the
    // row itself disappears rather than opening a locked screen.
    premiumOnly: true,
  },
  // A second entry point onto the same draft as the row above — same
  // Primary/Secondary (and, for the roles the live site can override,
  // themeOverrides) as Website Colors, so an edit from either screen
  // reflects on the other and on /event-site alike (see
  // ColorExplorationFields.jsx). Hidden here — the screen and its route stay
  // wired up (still reachable at COLOR_EXPLORATION_PATH), just not surfaced
  // on this list, same convention as `event-site-pages` above.
  {
    id: 'color-exploration',
    title: 'Color Exploration',
    description: 'Experiment with alternate primary and accent colors for the event site.',
    hidden: true,
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
    id: 'forms',
    title: 'Forms',
    description: 'Manage forms to collect additional registrant information.',
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

// Each category's starting order (Figma "Packages") — price high to low.
// Keyed by PACKAGE_CATEGORIES' own stable `key`, same "ids, not the objects
// themselves" convention as SponsorsListPage's `tierOrder`/`groupByTier` —
// `packageOrder` (below) is what actually drives display order from here
// on, this only ever runs once per package list to seed it.
function buildPackageOrder(list) {
  return Object.fromEntries(
    PACKAGE_CATEGORIES.map(({ key, category }) => [
      key,
      list
        .filter(pkg => pkg.category === category)
        .slice()
        .sort((a, b) => b.price - a.price)
        .map(pkg => pkg.id),
    ])
  )
}

// Where a brand new or copied package's id belongs in an already price-
// sorted (high to low) category order — used by handleAddPackage/
// handleCopyPackage so a new entry lands wherever its price actually
// belongs, without needing any dedicated reorder UI of its own: it just
// slots in ahead of the first existing id whose price is lower.
function insertIdByPrice(order, getPrice, id) {
  const price = getPrice(id)
  const insertAt = order.findIndex(existingId => getPrice(existingId) < price)
  const at = insertAt === -1 ? order.length : insertAt
  return [...order.slice(0, at), id, ...order.slice(at)]
}

const FORMS_PATH = '/orders-forms/event-site-packages/forms'
const HOMEPAGE_PATH = '/orders-forms/event-site-packages/homepage'
const STYLE_PATH = '/orders-forms/event-site-packages/website-design-style'
const COLOR_EXPLORATION_PATH = '/orders-forms/event-site-packages/color-exploration'
const SITE_PAGES_PATH = '/orders-forms/event-site-packages/pages'
const PACKAGES_PATH = '/orders-forms/event-site-packages/packages'
const PACKAGE_CATEGORY_PATH = `${PACKAGES_PATH}/category`

// One side panel for the whole Forms flow (list → add form → form overview →
// add question), same single-panel-many-screens convention as TeamsListPage/
// SponsorsListPage, rather than each destination opening its own stacked
// panel. Unlike those, though, the "which form"/"viewing its responses"
// screens ARE routes here (see `formId`/`viewingResponses` below) — a
// question tile's Responses button (OrderFormOverviewDraft1.jsx) opens that
// route directly, and it's also reachable by appending /responses to a
// form's own URL by hand. Add Form/Add Question stay plain local-state
// overlays (`addingForm`/`addingQuestion`) on top of whichever route screen
// is showing, same as before.
export default function EventSitePackagesListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { formId: formOverviewId, categoryKey, homepageSectionId } = useParams()
  const [search, setSearch] = useState('')
  // Per-page show/hide switch on the Event Site Pages screen (see
  // EventSitePagesTiles) — every page starts Visible; toggling just flips
  // this in place, same instant-apply convention as ScorecardDetailPage's
  // Override Total toggle (no Save/Cancel step, unlike Homepage/Style below).
  // Persisted (data/eventSitePagesVisibility.js), same read-once-on-load/
  // save-on-toggle convention as isPremium above, so a hidden page's subnav
  // tab actually disappears on /event-site (EventWebsitePage.jsx reads this
  // same flag back on mount) instead of only ever affecting this admin list.
  const [pageVisibility, setPageVisibility] = useState(loadPageVisibility)
  // The Auction page's own required URL field (EventSitePagesTiles), saved
  // via that field's own inline Save button rather than this screen's
  // Save/Cancel (it has neither) — starts blank same as a tournament that
  // hasn't linked an auction yet. Same persisted, read-once-on-load
  // convention as pageVisibility above.
  const [auctionUrl, setAuctionUrl] = useState(loadAuctionUrl)
  const [addingForm, setAddingForm] = useState(false)
  // True for a beat between clicking Save & Continue on a brand new form and
  // actually landing on its overview — simulates the save/load a real
  // form-builder backend would need, same convention as ScorecardListPage's
  // isInitialLoading. Only the *create* path gets this (see
  // `handleAddFormSave`); renaming an existing form still commits instantly.
  const [creatingForm, setCreatingForm] = useState(false)
  const [addingQuestion, setAddingQuestion] = useState(false)
  // Overlay on top of the responses screen, same convention as
  // addingForm/addingQuestion above — opened via AllOrderResponsesForFormDraft1's
  // own "Add Response" button (see `openAddResponse`/`handleAddResponseSave`
  // below).
  const [addingResponse, setAddingResponse] = useState(false)
  const [responseDraft, setResponseDraft] = useState(emptyResponseDraft)
  const [formsList, setFormsList] = useState(initialForms)
  // Mutated by the Packages screen's own Add Package/Copy actions (see
  // `handleAddPackage`/`handleCopyPackage` below) — the hub page's own
  // inline package strip (`visiblePackages` below) reads from this same
  // list, so anything added or copied there shows up in both places.
  const [packagesList, setPackagesList] = useState(() => loadSavedPackages() ?? eventSitePackages)
  const packagesById = useMemo(() => Object.fromEntries(packagesList.map(pkg => [pkg.id, pkg])), [packagesList])
  // Each category's own display order (Figma "Packages") — starts sorted
  // price high to low (see `buildPackageOrder`), then only ever changes via
  // a manual drag (`reorderWithinCategory`, PackageCategorySection's own
  // handle) or a new/copied package landing wherever its price belongs
  // (`insertIdByPrice`, see `handleAddPackage`/`handleCopyPackage`) — never
  // re-sorted wholesale, so a manual reorder always sticks. The hub page's
  // own inline package strip (`visiblePackages` below) flattens this same
  // order (category by category) instead of reading `packagesList` directly,
  // so its order always matches the Packages screen even though it has no
  // category headers of its own to group by.
  const [packageOrder, setPackageOrder] = useState(() => loadPackageOrder() ?? buildPackageOrder(loadSavedPackages() ?? eventSitePackages))
  // Mirrored to localStorage so the public Packages page reads the same
  // order and package list (data/eventSitePackageCategories.js).
  useEffect(() => {
    savePackageOrder(packageOrder)
    saveSavedPackages(packagesList)
  }, [packageOrder, packagesList])
  // Display label per PACKAGE_CATEGORIES key, keyed the same way — starts on
  // whatever's already saved (or each category's own default label, the
  // first time), and a Save on the "Package Category" screen (see
  // `handleSaveCategoryLabel` below) writes back to that same
  // localStorage-backed store (data/eventSitePackageCategories.js), same
  // convention as eventSiteStyle.js. This is what lets a renamed category
  // actually show up on the public event site's own Packages tiles
  // (EventWebsitePage.jsx reads it back on mount) instead of staying
  // admin-only.
  const [categoryLabels, setCategoryLabels] = useState(loadPackageCategoryLabels)
  // Dev-facing Premium/Non-Premium toggle, shown on this hub page's own
  // top action bar — purely so this prototype can show off both visual
  // states side by side; there's no real plan/entitlement system behind it.
  // `isPremium` is still read by PackagesListContent/EventSiteHomepageSectionsList
  // (and the `website-design-style` row above) to gate what each shows, they
  // just no longer render a toggle of their own. Persisted (see
  // data/eventSitePremium.js) so /event-site (EventWebsitePage.jsx) can read
  // the same flag back and lock its own theme to GolfStatus's baseline
  // colors while non-premium, same read-once-on-load/save-on-toggle
  // convention as eventSiteStyle.js.
  const [isPremium, setIsPremium] = useState(loadIsPremium)

  // Premium -> Non-Premium (never the other direction) also resets any
  // custom `categoryLabels` back to PACKAGE_CATEGORIES' own defaults — a
  // downgrade doesn't get to keep a customized category name, same as it
  // wouldn't keep any other premium-only customization. PackagesListContent
  // still always reads NON_PREMIUM_PACKAGE_CATEGORY_LABELS while `isPremium`
  // is off regardless (see its own comment), so this only actually matters
  // for what's showing the next time Premium is switched back on. Same
  // downgrade also resets `packageOrder` back to price high-to-low within
  // each category (`buildPackageOrder`, the same sort it starts on) — a
  // non-premium tournament can't drag-reorder packages either (see
  // PackagesListContent/PackageCategorySection's own `isPremium` gating), so
  // any manual reorder gets discarded right along with it rather than just
  // becoming un-editable in place.
  //
  // Same downgrade also resets the Event Site Homepage screen's own section
  // order and section headers back to their defaults (DEFAULT_HOMEPAGE_
  // SECTION_ORDER/DEFAULT_SECTION_HEADERS) — a non-premium tournament can't
  // drag-reorder sections either (see EventSiteHomepageSectionsList's own
  // `isPremium` gating), and its Section Header field disappears there too
  // (see EventSiteHomepageFields.jsx's `locked`), so both get discarded the
  // same way `categoryLabels`/`packageOrder` do above. Deliberately leaves
  // every other homepage field alone — the actual paragraph content
  // (description/additionalDescription/registrationDetails), button text,
  // and images all survive a downgrade untouched.
  function toggleIsPremium() {
    setIsPremium(prev => {
      const next = !prev
      saveIsPremium(next)
      if (prev && !next) {
        setCategoryLabels(DEFAULT_PACKAGE_CATEGORY_LABELS)
        savePackageCategoryLabels(DEFAULT_PACKAGE_CATEGORY_LABELS)
        setPackageOrder(buildPackageOrder(packagesList))
        setHomepageDraft(current => ({
          ...current,
          sectionOrder: DEFAULT_HOMEPAGE_SECTION_ORDER,
          sectionHeaders: DEFAULT_SECTION_HEADERS,
        }))
        saveHomepageSectionOrder(DEFAULT_HOMEPAGE_SECTION_ORDER)
        saveHomepageSectionHeaders(DEFAULT_SECTION_HEADERS)
      }
      return next
    })
  }
  // The "Package Category" screen's own draft — reseeded from
  // `categoryLabels` whenever the route's `categoryKey` changes, same
  // reseed-on-route-param convention as `formNameDraft`.
  const [categoryLabelDraft, setCategoryLabelDraft] = useState('')
  // Only mutated by AllOrderResponsesForFormDraft1's inline answer editing
  // (see `saveResponseAnswer` below) — this page has no order-details screen
  // of its own (its "View Order" link navigates elsewhere, see `viewOrder`),
  // so nothing else here needs a live order list.
  const [orderList, setOrderList] = useState(initialOrders)
  const [addFormName, setAddFormName] = useState('')
  // null while adding a brand new form; the form's stable id while editing
  // an existing one (opened via OrderFormOverviewDraft1's edit pencil, which
  // is itself currently hidden — see that component) — same convention as
  // `editingQuestionKey` below.
  const [editingFormId, setEditingFormId] = useState(null)
  // `formOverviewId` (above) comes straight from the :formId route param
  // now, not local state — a rename only ever touches its `formsList` entry
  // (see `handleAddFormSave`), so deriving the live display name from
  // `formsList` below means the panel just reflects the rename
  // automatically, with nothing to keep in sync by hand. It's also what
  // lets `orders` responses stay linked across a rename (see `formId` in
  // OrderFormOverviewDraft1.jsx/orderUtils.js) — a form's `formsList` name
  // can drift from what's stored on its `orders` responses, but its id
  // never does.
  const formOverviewName = formOverviewId ? formsList.find(f => f.id === formOverviewId)?.name ?? null : null
  const showingFormsList = location.pathname === FORMS_PATH
  const viewingResponses = location.pathname.endsWith('/responses')
  const showingHomepage = location.pathname === HOMEPAGE_PATH
  const showingStyle = location.pathname === STYLE_PATH
  const showingColorExploration = location.pathname === COLOR_EXPLORATION_PATH
  const showingSitePages = location.pathname === SITE_PAGES_PATH
  const showingPackagesList = location.pathname === PACKAGES_PATH
  // Only true for a real, known category key — an unrecognized one (a typo'd
  // direct visit) just falls through to nothing rendering, same as an
  // unrecognized `formId` would.
  const showingEditCategory = categoryKey != null && PACKAGE_CATEGORY_BY_KEY[categoryKey] != null
  // A single Event Site Homepage section's own edit screen (Figma "Event
  // Site Homepage" tile detail) — reached via that tile's pencil/plus on
  // EventSiteHomepageSectionsList (`handleEditHomepageSection` below), a
  // real route (not local state) so it's its own back-stack entry/deep-
  // linkable, same as "Package Category" (`showingEditCategory` above).
  // Only true for a real, currently-editable section id — an unrecognized
  // or non-editable one (Make a Donation while DONATIONS_ENABLED is off, or
  // any of isHomepageSectionEditable's own Premium-gated ids while
  // non-premium) just falls through to nothing rendering, same reasoning as
  // `showingEditCategory` — a direct/bookmarked visit to a now-locked
  // section's URL can't bypass the tile list's own hidden pen/plus either.
  const editingHomepageSectionId =
    homepageSectionId != null && isHomepageSectionEditable(homepageSectionId, isPremium) ? homepageSectionId : null
  const panelOpen =
    location.pathname.startsWith(FORMS_PATH) ||
    showingHomepage ||
    Boolean(editingHomepageSectionId) ||
    showingStyle ||
    showingColorExploration ||
    showingSitePages ||
    showingPackagesList ||
    showingEditCategory
  // The Form Name field's draft on OrderFormOverviewDraft1 itself (renaming
  // moved inline there — see `handleSaveFormName`/`handleCancelFormName`
  // below). Reseeded from the form's current name whenever the *route's*
  // formId changes (a fresh visit or switching forms) — not on every
  // `formOverviewName` change, or saving a rename would immediately stomp
  // right back over its own draft.
  const [formNameDraft, setFormNameDraft] = useState('')
  useEffect(() => {
    if (formOverviewName != null) setFormNameDraft(formOverviewName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOverviewId])
  useEffect(() => {
    if (showingEditCategory) setCategoryLabelDraft(categoryLabels[categoryKey])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey])
  // Add Form/Add Question are plain overlays on top of whichever route is
  // showing (see the comment above this component) — they never push their
  // own history entry, so the browser's own back/forward buttons skip right
  // past them and change the route underneath without ever closing them.
  // Closing both here on every route change (however it happened — the
  // panel's own back chevron, the browser's back/forward buttons, or a
  // question's Responses link) keeps whichever overlay was open from being
  // left stranded over a screen it no longer belongs to.
  useEffect(() => {
    setAddingForm(false)
    setAddingQuestion(false)
    setAddingResponse(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
  const isEditingFormName = formOverviewName != null && formNameDraft !== formOverviewName
  // Which question AllOrderResponsesForFormDraft1 should open on — only
  // ever set by clicking a question's own Responses button (see
  // `openViewResponses`), so a direct/bookmarked visit to a form's
  // /responses URL just leaves this null and that component falls back to
  // its own first question, same as an unrecognized question would.
  const [viewingQuestion, setViewingQuestion] = useState(null)
  const [questionDraft, setQuestionDraft] = useState(emptyQuestionDraft)
  // Snapshot of `questionDraft` as it was when the Add/Edit Question screen
  // opened (see `openAddQuestion`/`openEditQuestion`) — Save stays disabled
  // until the draft actually diverges from this, same "nothing to save yet"
  // reasoning as `isEditingFormName` above.
  const [originalQuestionDraft, setOriginalQuestionDraft] = useState(emptyQuestionDraft)
  // Each question's editable draft (type/required/etc), keyed by question
  // text and then by form id — covers both a question this page created
  // from scratch (no real order data backs it) and an edited override of a
  // real question's metadata (OrderFormOverviewDraft1 merges the override
  // in; the real answers/respondent counts always still come from `orders`).
  const [customQuestionsByForm, setCustomQuestionsByForm] = useState({})
  // null while adding a brand new question; the question's original text
  // while editing an existing one (its own or a real question's override).
  const [editingQuestionKey, setEditingQuestionKey] = useState(null)
  // Question text deleted per form, keyed by form id — the only way to
  // actually remove a *real*, order-derived question from the list (see
  // `handleDeleteQuestion`/OrderFormOverviewDraft1.jsx's `deletedQuestions`
  // prop), since there's no form-builder here to remove it from `orders`
  // itself. A custom question this page created is already fully gone once
  // its `customQuestionsByForm` override is deleted, so this only actually
  // matters for real ones, but filtering by it either way is simplest.
  const [deletedQuestionsByForm, setDeletedQuestionsByForm] = useState({})

  // Event Site Homepage (Figma "Event Site Homepage") — no panel-level
  // Save/Cancel here (see EventSiteHomepageSectionsList.jsx's own tile
  // Save/Discard instead): each tile persists itself the moment its own
  // Save is tapped (handleSaveHomepageSection below), so there's nothing
  // left to batch-commit or discard at the screen level — the panel's own
  // close chevron can just navigate away same as any other read-through
  // screen. `homepageDraft` still reseeds from whatever's currently
  // persisted every time this screen's route is entered (below), same
  // "reseed on route" reasoning as `formNameDraft`, since it's read fresh
  // rather than kept in sync live with what other tabs/sessions might save.
  // bannerFiles/photoFiles/videoFiles start empty here since their real
  // saved value lives in IndexedDB (see eventSiteHomepageSections.js's own
  // "NOT localStorage" comment) behind an async load*, not one of the
  // synchronous localStorage reads above — the effect below fills them in
  // right after this fires, same reseed-on-route trigger, once that load
  // resolves.
  function loadHomepageDraft() {
    const savedHomepageContent = loadHomepageSectionContent()
    return {
      bannerFiles: [],
      description: savedHomepageContent.description,
      additionalDescription: savedHomepageContent.additionalDescription,
      registrationDetails: savedHomepageContent.registrationDetails,
      photoFiles: [],
      videoFiles: [],
      sectionOrder: loadHomepageSectionOrder(),
      sectionHeaders: loadHomepageSectionHeaders(),
      sectionButtons: loadHomepageSectionButtons(),
    }
  }
  const [homepageDraft, setHomepageDraft] = useState(loadHomepageDraft)
  useEffect(() => {
    if (showingHomepage) setHomepageDraft(loadHomepageDraft())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Fills in bannerFiles/photoFiles/videoFiles once IndexedDB actually
  // answers — without this, a saved banner/photo/video would reset to
  // empty (hasContent's `hidden` check going back to true, the tile's own
  // Save flow showing an empty file field again) every time this route
  // reseeds, even though handleSaveHomepageSection below did persist it.
  useEffect(() => {
    if (!showingHomepage) return
    let cancelled = false
    Promise.all([loadHomepageBannerImage(), loadHomepageMediaImage(), loadHomepageMediaVideo()]).then(
      ([bannerImage, photoImage, video]) => {
        if (cancelled) return
        setHomepageDraft(prev => ({
          ...prev,
          bannerFiles: bannerImage ? [bannerImage] : prev.bannerFiles,
          photoFiles: photoImage ? [photoImage] : prev.photoFiles,
          videoFiles: video ? [video] : prev.videoFiles,
        }))
      }
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Website Design and Style — same single-screen, reseed-on-route,
  // Save/Cancel convention as Event Site Homepage above. Colors default to
  // DEFAULT_EVENT_SITE_STYLE (data/eventSiteStyle.js) rather than starting
  // blank, but styleSaved actually seeds from whatever was last persisted
  // there (loadEventSiteStyle) — this prototype has no backend, so that's
  // also what /event-site (EventWebsitePage.jsx) reads to reflect a saved
  // style, and what handleSaveStyle below writes back to. neutralTint picks
  // which scale (Neutral/Primary/Secondary) the Neutral section's own
  // reference ramp is tinted with (WebsiteDesignStyleFields) — that same
  // saved choice decides whether /event-site's own Monochromatic toggle
  // starts on and which scale it substitutes in.
  const [styleSaved, setStyleSaved] = useState(loadEventSiteStyle)
  const [styleDraft, setStyleDraft] = useState(loadEventSiteStyle)
  useEffect(() => {
    if (showingStyle || showingColorExploration) setStyleDraft(styleSaved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
  // /event-site's right-click menu saves element/button changes straight to
  // the stored style. When one lands from another tab, take it as the new
  // saved style, and fold just what that menu edits into the draft so
  // unsaved color edits here aren't lost (and Save can't overwrite it).
  useEffect(
    () =>
      subscribeEventSiteStyle(next => {
        setStyleSaved(next)
        setStyleDraft(prev => ({
          ...prev,
          elementOverrides: next.elementOverrides,
          buttonOverrides: next.buttonOverrides,
          buttonStyles: next.buttonStyles,
        }))
      }),
    []
  )

  function openFormsPanel() {
    navigate(FORMS_PATH)
  }

  function openHomepagePanel() {
    navigate(HOMEPAGE_PATH)
  }

  // Fires from EventSiteHomepageSectionsList's own per-tile Save (not a
  // whole-screen batch commit) — every tile's fields live in one of four
  // shared stores (headers/buttons/content/header visibility), so this
  // always writes all four regardless of which section triggered it (cheap,
  // and correct even though only one section's values actually changed);
  // the two IndexedDB-backed file fields only get re-written when their own
  // section is the one that saved, since those writes are heavier.
  //
  // Reads `homepageDraft` through setHomepageDraft's own updater callback
  // rather than closing over the `homepageDraft` in scope — the Save click
  // that triggers this fires in the same tick React is still committing the
  // field's own last keystroke, so the plain in-scope `homepageDraft` can
  // still be one render behind (a real, reproduced bug: the first Save
  // right after typing silently wrote the pre-edit value). The updater
  // callback is the one place React guarantees the truly-latest state,
  // batched keystroke or not — this returns it unchanged, it's only here to
  // read it safely.
  function handleSaveHomepageSection(id) {
    setHomepageDraft(current => {
      saveHomepageSectionHeaders(current.sectionHeaders)
      saveHomepageSectionButtons(current.sectionButtons)
      saveHomepageSectionContent({
        description: current.description,
        additionalDescription: current.additionalDescription,
        registrationDetails: current.registrationDetails,
      })
      if (id === 'banner') saveHomepageBannerImage(current.bannerFiles[0] ?? null)
      if (id === 'photo') saveHomepageMediaImage(current.photoFiles[0] ?? null)
      if (id === 'video') saveHomepageMediaVideo(current.videoFiles[0] ?? null)
      return current
    })
  }

  // Reordering isn't a tile's own Save (it's the drag handle, not a field
  // edit), so it persists immediately on drop rather than waiting on any
  // particular tile's Save — same "every action here writes through right
  // away" rule the rest of this screen now follows.
  function handleReorderHomepageSections(sectionOrder) {
    setHomepageDraft(prev => ({ ...prev, sectionOrder }))
    saveHomepageSectionOrder(sectionOrder)
  }

  function openHomepageSectionPanel(id) {
    navigate(`${HOMEPAGE_PATH}/${id}`)
  }

  // What a homepage section's own edit screen (EventSiteHomepageFields,
  // reached via `openHomepageSectionPanel` above) actually holds right now —
  // only the keys that section owns, same "only what's there" convention
  // EventSiteHomepageSectionsList's own snapshot used to capture before this
  // screen moved out of that list and into its own route. Captured the
  // moment the screen opens (see the effect below) so Cancel has something
  // to revert to.
  function captureHomepageSectionSnapshot(id) {
    const d = homepageDraft
    switch (id) {
      case 'banner':
        return { bannerFiles: d.bannerFiles }
      case 'description':
        return { header: d.sectionHeaders.description, description: d.description }
      case 'additionalDescription':
        return { header: d.sectionHeaders.additionalDescription, additionalDescription: d.additionalDescription }
      case 'registrationDetails':
        return { header: d.sectionHeaders.registrationDetails, registrationDetails: d.registrationDetails }
      case 'photo':
        return { header: d.sectionHeaders.photo, photoFiles: d.photoFiles }
      case 'video':
        return { header: d.sectionHeaders.video, videoFiles: d.videoFiles }
      case 'tournamentDetails':
        return { buttons: { ...d.sectionButtons.tournamentDetails } }
      case 'packages':
        return { header: d.sectionHeaders.packages, buttons: { ...d.sectionButtons.packages } }
      case 'sponsors':
        return { header: d.sectionHeaders.sponsors, buttons: { ...d.sectionButtons.sponsors } }
      case 'donation':
        return { header: d.sectionHeaders.donation, buttons: { ...d.sectionButtons.donation } }
      case 'additionalPages':
        return { header: d.sectionHeaders.additionalPages }
      case 'liveScoring':
        return { header: d.sectionHeaders.liveScoring }
      default:
        return {}
    }
  }

  function restoreHomepageSectionSnapshot(id, snapshot) {
    setHomepageDraft(prev => ({
      ...prev,
      ...('header' in snapshot ? { sectionHeaders: { ...prev.sectionHeaders, [id]: snapshot.header } } : {}),
      ...('bannerFiles' in snapshot ? { bannerFiles: snapshot.bannerFiles } : {}),
      ...('description' in snapshot ? { description: snapshot.description } : {}),
      ...('additionalDescription' in snapshot ? { additionalDescription: snapshot.additionalDescription } : {}),
      ...('registrationDetails' in snapshot ? { registrationDetails: snapshot.registrationDetails } : {}),
      ...('photoFiles' in snapshot ? { photoFiles: snapshot.photoFiles } : {}),
      ...('videoFiles' in snapshot ? { videoFiles: snapshot.videoFiles } : {}),
      ...('buttons' in snapshot ? { sectionButtons: { ...prev.sectionButtons, [id]: snapshot.buttons } } : {}),
    }))
  }

  // Whatever the currently-open section's own fields held right before it
  // opened — captured below, restored by Cancel (`handleCancelHomepageSection`).
  const [homepageSectionSnapshot, setHomepageSectionSnapshot] = useState(null)
  useEffect(() => {
    if (editingHomepageSectionId) setHomepageSectionSnapshot(captureHomepageSectionSnapshot(editingHomepageSectionId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingHomepageSectionId])

  function handleSaveHomepageSectionScreen() {
    handleSaveHomepageSection(editingHomepageSectionId)
    navigate(HOMEPAGE_PATH)
  }

  function handleCancelHomepageSectionScreen() {
    if (homepageSectionSnapshot) restoreHomepageSectionSnapshot(editingHomepageSectionId, homepageSectionSnapshot)
    navigate(HOMEPAGE_PATH)
  }

  function openStylePanel() {
    navigate(STYLE_PATH)
  }

  function openSitePagesPanel() {
    navigate(SITE_PAGES_PATH)
  }

  function openPackagesPanel() {
    navigate(PACKAGES_PATH)
  }

  // No Add Package fields screen exists in this prototype yet (see
  // AddFormFields for the equivalent Forms flow) — Add Package just drops a
  // blank draft straight onto the list, same "no real backend" spirit as
  // the rest of this page. Its price (0) is what places it last within its
  // category's own order (see `insertIdByPrice`) — nothing special-cased.
  function handleAddPackage() {
    const newPackage = {
      id: `pkg-${Date.now()}`,
      name: 'New Package',
      category: PACKAGE_CATEGORIES[0].category,
      price: 0,
      formsCount: 0,
      purchased: 0,
      remaining: null,
      updatedAt: 'Updated just now',
      status: 'active',
    }
    const key = PACKAGE_CATEGORY_KEY_BY_CATEGORY[newPackage.category]
    setPackagesList(prev => [...prev, newPackage])
    setPackageOrder(prev => ({
      ...prev,
      [key]: insertIdByPrice(prev[key], id => (id === newPackage.id ? newPackage.price : packagesById[id].price), newPackage.id),
    }))
  }

  // Inserted right after the original in `packagesList` so the duplicate
  // reads as "next to what it copied"; `packageOrder` instead places it by
  // price (see `insertIdByPrice`) — same price as the original it copied,
  // so it lands right alongside it there too.
  function handleCopyPackage(pkg) {
    const copy = { ...pkg, id: `${pkg.id}-copy-${Date.now()}`, name: `${pkg.name} (Copy)`, purchased: 0, status: 'active' }
    const key = PACKAGE_CATEGORY_KEY_BY_CATEGORY[pkg.category]
    setPackagesList(prev => {
      const idx = prev.findIndex(p => p.id === pkg.id)
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
    setPackageOrder(prev => ({
      ...prev,
      [key]: insertIdByPrice(prev[key], id => (id === copy.id ? copy.price : packagesById[id].price), copy.id),
    }))
  }

  // `newOrder` is the reordered id list for whatever packages were visible
  // to the drag (see PackageCategorySection) — usually the whole category,
  // but only the search-matched subset while a filter is active. Ids
  // outside that subset keep their existing slots, with the reordered ids
  // dropped in wherever their old ones were — same convention as
  // SponsorsListPage's `reorderWithinTier`.
  function reorderWithinCategory(key, newOrder) {
    setPackageOrder(prev => {
      const visible = new Set(newOrder)
      let i = 0
      const merged = prev[key].map(id => (visible.has(id) ? newOrder[i++] : id))
      return { ...prev, [key]: merged }
    })
  }

  // The "Package Category" screen (Figma "Package Category") — reached via
  // a category's own edit pencil (PackageCategorySection), a real route (not
  // a local-state overlay) so it's its own back-stack entry/deep-linkable,
  // same as a form's own overview screen.
  function openEditCategory(key) {
    navigate(`${PACKAGE_CATEGORY_PATH}/${key}`)
  }

  function handleSaveCategoryLabel() {
    const label = categoryLabelDraft.trim()
    if (!label) return
    const next = { ...categoryLabels, [categoryKey]: label }
    setCategoryLabels(next)
    savePackageCategoryLabels(next)
    navigate(PACKAGES_PATH)
  }

  function handleCancelCategoryLabel() {
    navigate(PACKAGES_PATH)
  }

  function togglePageVisibility(page) {
    setPageVisibility(prev => {
      const next = { ...prev, [page]: !prev[page] }
      savePageVisibility(next)
      return next
    })
  }

  function handleSaveAuctionUrl(url) {
    setAuctionUrl(url)
    saveAuctionUrl(url)
  }

  function handleSaveStyle() {
    setStyleSaved(styleDraft)
    saveEventSiteStyle(styleDraft)
    // Panel stays open (no navigate) — this screen's whole point is riffing
    // on colors and Theme Definitions overrides in real time, so closing it
    // on every save would interrupt that instead of supporting it. Save
    // simply re-disables itself (styleDraft now equals styleSaved) until
    // the next change.
  }

  function handleCancelStyle() {
    navigate('/orders-forms/event-site-packages')
  }

  function openColorExplorationPanel() {
    navigate(COLOR_EXPLORATION_PATH)
  }

  // Same shared styleDraft/styleSaved as handleSaveStyle/handleCancelStyle
  // above — Color Exploration and Website Design and Style are the same
  // underlying draft now, just two entry points onto it.
  const handleSaveColorExploration = handleSaveStyle
  const handleCancelColorExploration = handleCancelStyle

  function openAddForm() {
    setEditingFormId(null)
    setAddFormName('')
    setAddingForm(true)
  }

  function openEditForm() {
    setEditingFormId(formOverviewId)
    setAddFormName(formOverviewName)
    setAddingForm(true)
  }

  function openFormOverview(form) {
    navigate(`${FORMS_PATH}/${form.id}`)
  }

  // Inline replacement for the old pencil-opens-AddFormFields rename flow
  // (see OrderFormOverviewDraft1.jsx) — commits the Form Name field's draft
  // straight to the matching `formsList` entry. Trimmed so trailing
  // whitespace can't leave `isEditingFormName` stuck true after a save.
  function handleSaveFormName() {
    const name = formNameDraft.trim()
    if (!name) return
    setFormsList(prev => prev.map(f => (f.id === formOverviewId ? { ...f, name } : f)))
    setFormNameDraft(name)
  }

  function handleCancelFormName() {
    setFormNameDraft(formOverviewName ?? '')
  }

  function openAddQuestion() {
    setEditingQuestionKey(null)
    setQuestionDraft(emptyQuestionDraft)
    setOriginalQuestionDraft(emptyQuestionDraft)
    setAddingQuestion(true)
  }

  function openEditQuestion(draft) {
    setEditingQuestionKey(draft.question)
    setQuestionDraft(draft)
    setOriginalQuestionDraft(draft)
    setAddingQuestion(true)
  }

  // Reachable only via OrderFormOverviewDraft1's own Responses button, which
  // is currently hidden there — kept wired (see that component) so
  // restoring it is just uncommenting the button. Direct navigation to a
  // form's /responses URL gets here too, just without a specific question
  // (see `viewingQuestion` above).
  function openViewResponses(question) {
    setViewingQuestion(question)
    navigate(`${FORMS_PATH}/${formOverviewId}/responses`)
  }

  // AllOrderResponsesForFormDraft1's "View Order"/"View Team"/"View Sponsor"
  // links — this page has no order-details screen of its own, so they
  // navigate to whichever page actually owns that entity, same resolution
  // OrdersDraft1Page/TeamsListPage/SponsorsListPage use.
  function viewOrder(orderId) {
    navigate(`/orders/${orderId}`)
  }

  // `packageName` disambiguates the rare order that bundles two separate
  // teams (see the ord-1005 comment in mockTeams.js) or two separate
  // sponsors (see the ord-1006 comment in mockOrders.js) — falls back to
  // matching by orderId alone whenever the order only has the one
  // team/sponsor anyway.
  function viewEntity(orderId, fillLevel, packageName) {
    if (fillLevel === 'sponsor') {
      const sponsor =
        sponsors.find(s => s.orderId === orderId && s.package === packageName) ??
        sponsors.find(s => s.orderId === orderId)
      navigate('/sponsors', sponsor ? { state: { sponsorId: sponsor.id } } : undefined)
      return
    }
    const team =
      registeredTeams.find(t => t.orderId === orderId && t.packageName === packageName) ??
      registeredTeams.find(t => t.orderId === orderId)
    navigate('/teams', team ? { state: { teamId: team.id } } : undefined)
  }

  function saveResponseAnswer(orderId, responseIndex, answerIndex, value) {
    setOrderList(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              formResponses: o.formResponses.map((entry, i) =>
                i === responseIndex
                  ? {
                      ...entry,
                      answers: entry.answers.map((a, j) =>
                        j === answerIndex ? { ...a, value, editedAt: new Date().toISOString() } : a
                      ),
                    }
                  : entry
              ),
            }
          : o
      )
    )
  }

  function openAddResponse() {
    setResponseDraft(emptyResponseDraft)
    setAddingResponse(true)
  }

  // Bundles every link/form/question combination in `responseDraft` into one
  // synthetic order (no real purchase backs a manually-added response, but
  // AllOrderResponsesForFormDraft1/OrderFormOverviewDraft1 only ever read an
  // order's `id`/`buyerName`/`businessName`/`formResponses` — see
  // OrderFormOverviewDraft1.jsx's computeFormStats — so a minimal stand-in
  // object slots right into `orderList` and shows up in both alongside every
  // real order). A team/sponsor/order link answers each of that category's
  // own questions once (see AddResponseFields' CATEGORY_FILL_LEVEL); a
  // player link answers each player-level question once per player on its
  // roster instead, same "everyone on the team answers separately" shape a
  // real team registration's own player-level responses already have.
  // Blank answers are kept (same as a real unanswered question) rather than
  // silently dropped, and a question already answered by a different link
  // just becomes a second `formResponses` entry for the same question —
  // responsesForFormAcrossOrders (orderUtils.js) merges every entry for a
  // question into one answer list regardless of how many entries it came
  // from, so this doesn't need to merge them itself.
  function handleAddResponseSave() {
    const formResponses = []
    responseDraft.formIds.forEach(formId => {
      const form = formsList.find(f => f.id === formId)
      if (!form) return
      responseDraft.links.forEach(link => {
        if (link.category === 'player') {
          formQuestionsFor(orderList, form)
            .filter(q => q.fillLevel === 'player')
            .forEach(q => {
              formResponses.push({
                formId,
                formName: form.name,
                packageName: 'Manually Added',
                question: q.question,
                fillLevel: 'player',
                answers: link.players.map(player => ({
                  respondent: player.name,
                  value: responseDraft.answers[playerAnswerKey(link.key, player.id, formId, q.question)] ?? '',
                })),
              })
            })
          return
        }
        const questions =
          link.category === 'order'
            ? formQuestionsFor(orderList, form)
            : formQuestionsFor(orderList, form).filter(q => q.fillLevel === link.category)
        questions.forEach(q => {
          formResponses.push({
            formId,
            formName: form.name,
            packageName: 'Manually Added',
            question: q.question,
            fillLevel: q.fillLevel,
            answers: [{ respondent: link.name, value: responseDraft.answers[answerKey(link.key, formId, q.question)] ?? '' }],
          })
        })
      })
    })
    if (formResponses.length > 0) {
      setOrderList(prev => [
        ...prev,
        { id: `manual-${Date.now()}`, buyerName: 'Manually Added', businessName: null, formResponses },
      ])
    }
    setAddingResponse(false)
    setResponseDraft(emptyResponseDraft)
  }

  function handlePanelBack() {
    if (addingResponse) {
      setAddingResponse(false)
      return
    }
    if (addingQuestion) {
      setAddingQuestion(false)
      return
    }
    if (addingForm) {
      if (editingFormId) setAddingForm(false)
      else navigate(FORMS_PATH)
      return
    }
    if (viewingResponses) {
      navigate(`${FORMS_PATH}/${formOverviewId}`)
      return
    }
    if (showingEditCategory) {
      navigate(PACKAGES_PATH)
      return
    }
    if (editingHomepageSectionId) {
      handleCancelHomepageSectionScreen()
      return
    }
    navigate(FORMS_PATH)
  }

  // The new form has no responses yet — OrderFormOverviewDraft1 just shows
  // all-zero stats and an empty question list until questions get built out
  // (no form-builder exists in this prototype yet, see that component).
  // Editing an existing form (`editingFormId` set, via the overview's edit
  // pencil) just renames its `formsList` entry in place instead — nothing
  // else needs updating since `formOverviewId`/`customQuestionsByForm` key
  // off the id, which the rename never touches, and the *next* screen's real
  // answers/respondent counts come from `orders`, matched by that same
  // stable id (see `formId` in OrderFormOverviewDraft1.jsx).
  function handleAddFormSave() {
    const name = addFormName.trim()
    if (!name) return

    if (editingFormId) {
      setFormsList(prev => prev.map(f => (f.id === editingFormId ? { ...f, name } : f)))
      setAddingForm(false)
      return
    }

    const id = `form-${formsList.length + 1}`
    setCreatingForm(true)
    setTimeout(() => {
      setFormsList(prev => [
        ...prev,
        { id, name, createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
      ])
      setAddingForm(false)
      setCreatingForm(false)
      navigate(`${FORMS_PATH}/${id}`)
    }, 800)
  }

  function handleAddQuestionSave() {
    const question = questionDraft.question.trim()
    if (!question) return
    setCustomQuestionsByForm(prev => {
      const existing = { ...(prev[formOverviewId] ?? {}) }
      if (editingQuestionKey && editingQuestionKey !== question) delete existing[editingQuestionKey]
      existing[question] = { ...questionDraft, question }
      return { ...prev, [formOverviewId]: existing }
    })
    setAddingQuestion(false)
  }

  // Removes whichever question is currently open — nothing to delete yet
  // while adding a brand new one (`editingQuestionKey` null), so this is a
  // no-op then rather than deleting the wrong (or no) question. Clears any
  // override on it (a custom question is now fully gone) and adds it to
  // `deletedQuestionsByForm` (what actually hides a *real*, order-derived
  // question — see that state's own comment above).
  function handleDeleteQuestion() {
    if (!editingQuestionKey) {
      setAddingQuestion(false)
      return
    }
    setCustomQuestionsByForm(prev => {
      const existing = { ...(prev[formOverviewId] ?? {}) }
      delete existing[editingQuestionKey]
      return { ...prev, [formOverviewId]: existing }
    })
    setDeletedQuestionsByForm(prev => ({
      ...prev,
      [formOverviewId]: [...(prev[formOverviewId] ?? []), editingQuestionKey],
    }))
    setAddingQuestion(false)
  }

  // The form disappears from `formsList` (and can't be navigated back to);
  // its real `orders` responses aren't touched — same "editing here never
  // touches real order data" limitation as everything else on this screen.
  function handleDeleteForm() {
    setFormsList(prev => prev.filter(f => f.id !== formOverviewId))
    navigate(FORMS_PATH)
  }

  const { visibleRowIds, visiblePackages } = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = NAV_ROWS.filter(
      row => !row.hidden && (!row.premiumOnly || isPremium) && matches(query, row.title, row.description)
    )
    // Flattens `packageOrder` category by category (Sponsorships, Team
    // Registrations, Player Registrations, Add-Ons & Extras, in that order)
    // rather than reading `packagesList`'s own order directly — this strip
    // has no category headers of its own to group by, but its packages
    // still need to read in the exact same order as the Packages screen's.
    const orderedPackages = PACKAGE_CATEGORIES.flatMap(({ key }) => packageOrder[key].map(id => packagesById[id]))
    return {
      visibleRowIds: new Set(rows.map(row => row.id)),
      visiblePackages: orderedPackages.filter(pkg => matches(query, pkg.name, pkg.category)),
    }
  }, [search, packageOrder, packagesById, isPremium])

  const showPackages = visibleRowIds.has('packages') || visiblePackages.length > 0
  const isEmpty = visibleRowIds.size === 0 && visiblePackages.length === 0

  const panelTitle =
    addingForm
      ? 'Form Details'
      : addingQuestion
      ? 'Question Details'
      : addingResponse
      ? 'Add Response'
      : showingHomepage
      ? 'Event Site Homepage'
      // Live off `homepageDraft.sectionHeaders` (same helper the tile list
      // itself reads its own label from) so typing into this screen's own
      // Section Header field updates the side panel's own top title bar as
      // you type, not just the tile you'll see again once you navigate back.
      : editingHomepageSectionId
      ? sectionTileLabel(
          editingHomepageSectionId,
          HOMEPAGE_SECTION_BY_ID[editingHomepageSectionId].label,
          homepageDraft.sectionHeaders,
          isPremium
        )
      : showingStyle
      ? 'Website Colors'
      : showingColorExploration
      ? 'Color Exploration'
      : showingSitePages
      ? 'Event Site Pages'
      : showingPackagesList
      ? 'Packages'
      : showingEditCategory
      ? 'Package Category'
      : formOverviewId
      // Static, matching 'Add Form' above, now that renaming happens inline
      // on the form-overview screen itself — same title whether that
      // screen's showing the form or its responses.
      ? 'Form Details'
      : 'Forms'

  // Save stays disabled until there's actually something to save — a name
  // that's still blank, or (when editing) hasn't changed from what's
  // already on `formsList`. A brand new form's "original" is just '' so
  // typing anything at all enables it.
  const addFormOriginalName = editingFormId ? formOverviewName ?? '' : ''
  const canSaveForm = addFormName.trim() !== '' && addFormName.trim() !== addFormOriginalName
  // Same reasoning for the question draft — required text present, and the
  // draft has actually diverged from `originalQuestionDraft` (seeded when
  // the screen opened, see `openAddQuestion`/`openEditQuestion`).
  const canSaveQuestion =
    questionDraft.question.trim() !== '' && JSON.stringify(questionDraft) !== JSON.stringify(originalQuestionDraft)
  // At least one link to attach the response to, and at least one form to
  // answer questions on — the answers themselves are allowed to stay blank
  // (same "No response yet" allowance a real order's own responses get).
  const canSaveResponse = responseDraft.links.length > 0 && responseDraft.formIds.length > 0
  // Same "nothing to save yet" reasoning as canSaveForm above.
  const canSaveCategoryLabel =
    showingEditCategory && categoryLabelDraft.trim() !== '' && categoryLabelDraft.trim() !== categoryLabels[categoryKey]

  const panelActions =
    // Buttons hidden during the simulated create — nothing to Save (already
    // saving) or Cancel out of mid-"save".
    creatingForm
      ? []
      : addingForm
      ? [
          {
            name: editingFormId ? 'Save' : 'Save & Continue',
            type: 'black',
            action: handleAddFormSave,
            isDisabled: !canSaveForm,
          },
          { name: 'Cancel', type: 'light-grey', action: () => (editingFormId ? setAddingForm(false) : navigate(FORMS_PATH)) },
        ]
      : addingQuestion
      ? [
          { name: 'Save', type: 'black', action: handleAddQuestionSave, isDisabled: !canSaveQuestion },
          { name: 'Cancel', type: 'light-grey', action: () => setAddingQuestion(false) },
          // Only once there's an actual question to delete — creating a
          // brand new one (`editingQuestionKey` null) has nothing yet.
          ...(editingQuestionKey ? [{ name: 'Delete Question', type: 'transparent red', action: handleDeleteQuestion }] : []),
        ]
      // No panel-level Save/Cancel on the list screen itself — reordering
      // persists immediately on drop, and a tile's own fields are edited
      // (and saved/canceled) on their own screen instead, right below.
      : showingHomepage
      ? []
      : editingHomepageSectionId
      ? [
          { name: 'Save', type: 'black', action: handleSaveHomepageSectionScreen },
          { name: 'Cancel', type: 'light-grey', action: handleCancelHomepageSectionScreen },
        ]
      : showingStyle
      ? [
          { name: 'Save', type: 'black', action: handleSaveStyle },
          { name: 'Cancel', type: 'light-grey', action: handleCancelStyle },
        ]
      : showingColorExploration
      ? [
          { name: 'Save', type: 'black', action: handleSaveColorExploration },
          { name: 'Cancel', type: 'light-grey', action: handleCancelColorExploration },
        ]
      : addingResponse
      ? [
          { name: 'Save', type: 'black', action: handleAddResponseSave, isDisabled: !canSaveResponse },
          { name: 'Cancel', type: 'light-grey', action: () => setAddingResponse(false) },
        ]
      : viewingResponses
      ? []
      : showingSitePages
      ? []
      : showingPackagesList
      ? []
      : showingEditCategory
      ? [
          { name: 'Save', type: 'black', action: handleSaveCategoryLabel, isDisabled: !canSaveCategoryLabel },
          { name: 'Cancel', type: 'light-grey', action: handleCancelCategoryLabel },
        ]
      : formOverviewId
      // While the Form Name field's draft differs from the saved name,
      // Save/Cancel take over from Delete Form — revert: drop this
      // `isEditingFormName` branch back to just the Delete Form action.
      ? isEditingFormName
        ? [
            { name: 'Save', type: 'black', action: handleSaveFormName },
            { name: 'Cancel', type: 'light-grey', action: handleCancelFormName },
          ]
        : [{ name: 'Delete Form', type: 'transparent red', action: handleDeleteForm }]
      : undefined

  return (
    <>
      <EntityListPage
        header="Event Site & Packages"
        searchPlaceholder="Search Event Site and Packages..."
        search={search}
        onSearchChange={setSearch}
        pageActions={[
          {
            actionType: 'toggle',
            pageActionProps: { label: 'Premium', value: isPremium, onClick: toggleIsPremium },
          },
        ]}
      >
        {isEmpty ? (
          <div className="efp-empty">No results match your search.</div>
        ) : (
          <>
            {NAV_ROWS.map(row => (
              <Fragment key={row.id}>
                {visibleRowIds.has(row.id) && (
                  <NavRow
                    title={row.title}
                    description={row.description}
                    onClick={
                      row.id === 'forms'
                        ? openFormsPanel
                        : row.id === 'event-site-homepage'
                        ? openHomepagePanel
                        : row.id === 'website-design-style'
                        ? openStylePanel
                        : row.id === 'color-exploration'
                        ? openColorExplorationPanel
                        : row.id === 'event-site-pages'
                        ? openSitePagesPanel
                        : row.id === 'packages'
                        ? openPackagesPanel
                        : undefined
                    }
                  />
                )}
                {row.id === 'event-site-details' && visibleRowIds.has('event-site-details') && (
                  <EventSitePreviewCard
                    eventSite={eventSite}
                    onViewWebsite={() => window.open('/event-site', '_blank', 'noopener,noreferrer')}
                    isPremium={isPremium}
                  />
                )}
                {row.id === 'packages' && showPackages && (
                  <div className="efp-pkg-row">
                    {visiblePackages.map(pkg => (
                      <PackageCard key={pkg.id} pkg={pkg} onClick={openPackagesPanel} />
                    ))}
                  </div>
                )}
              </Fragment>
            ))}
          </>
        )}
      </EntityListPage>

      <AppSidePanel
        isOpen={panelOpen}
        expanded={showingColorExploration}
        // Both disabled during the simulated create — nothing to back out
        // of or close mid-"save" (the timer in `handleAddFormSave` would
        // still land on the new form afterward regardless, which would be a
        // confusing jump back if the panel had already navigated away).
        onClose={creatingForm ? undefined : () => navigate('/orders-forms/event-site-packages')}
        onBack={
          creatingForm ||
          !panelOpen ||
          showingHomepage ||
          showingStyle ||
          showingColorExploration ||
          showingSitePages ||
          showingPackagesList ||
          (showingFormsList && !addingForm && !addingQuestion)
            ? undefined
            : handlePanelBack
        }
        title={panelTitle}
        actions={panelActions}
      >
        {creatingForm ? (
          <div className="efp-loading">
            <FontAwesomeIcon icon={faCircleNotch} className="efp-spinner" />
            <div className="efp-loading-text">
              <div className="efp-loading-title">Loading...</div>
              <div className="efp-loading-detail">This may take a moment.</div>
            </div>
          </div>
        ) : addingQuestion ? (
          <AddQuestionFields
            draft={questionDraft}
            onChange={patch => setQuestionDraft(prev => ({ ...prev, ...patch }))}
            onSubmit={handleAddQuestionSave}
            isEditing={editingQuestionKey != null}
          />
        ) : addingForm ? (
          <AddFormFields
            name={addFormName}
            onChangeName={setAddFormName}
            onSubmit={handleAddFormSave}
            isEditing={editingFormId != null}
          />
        ) : addingResponse ? (
          <AddResponseFields
            orders={orderList}
            forms={formsList}
            draft={responseDraft}
            onChange={patch => setResponseDraft(prev => ({ ...prev, ...patch }))}
          />
        ) : showingHomepage ? (
          <EventSiteHomepageSectionsList
            order={homepageDraft.sectionOrder}
            onReorder={handleReorderHomepageSections}
            bannerFiles={homepageDraft.bannerFiles}
            description={homepageDraft.description}
            additionalDescription={homepageDraft.additionalDescription}
            registrationDetails={homepageDraft.registrationDetails}
            photoFiles={homepageDraft.photoFiles}
            videoFiles={homepageDraft.videoFiles}
            headers={homepageDraft.sectionHeaders}
            onEditSection={openHomepageSectionPanel}
            isPremium={isPremium}
          />
        ) : editingHomepageSectionId === 'photo' ? (
          <EventSiteHomepageFields
            section="photo"
            title={sectionTileLabel('photo', HOMEPAGE_SECTION_BY_ID.photo.label, homepageDraft.sectionHeaders, isPremium)}
            photoFiles={homepageDraft.photoFiles}
            onChangePhotoFiles={files => setHomepageDraft(prev => ({ ...prev, photoFiles: files }))}
            header={homepageDraft.sectionHeaders.photo}
            onChangeHeader={value => setHomepageDraft(prev => ({ ...prev, sectionHeaders: { ...prev.sectionHeaders, photo: value } }))}
            isPremium={isPremium}
          />
        ) : editingHomepageSectionId === 'video' ? (
          <EventSiteHomepageFields
            section="video"
            title={sectionTileLabel('video', HOMEPAGE_SECTION_BY_ID.video.label, homepageDraft.sectionHeaders, isPremium)}
            videoFiles={homepageDraft.videoFiles}
            onChangeVideoFiles={files => setHomepageDraft(prev => ({ ...prev, videoFiles: files }))}
            header={homepageDraft.sectionHeaders.video}
            onChangeHeader={value => setHomepageDraft(prev => ({ ...prev, sectionHeaders: { ...prev.sectionHeaders, video: value } }))}
            isPremium={isPremium}
          />
        ) : editingHomepageSectionId ? (
          <EventSiteHomepageFields
            section={editingHomepageSectionId}
            title={sectionTileLabel(
              editingHomepageSectionId,
              HOMEPAGE_SECTION_BY_ID[editingHomepageSectionId].label,
              homepageDraft.sectionHeaders,
              isPremium
            )}
            bannerFiles={homepageDraft.bannerFiles}
            onChangeBannerFiles={files => setHomepageDraft(prev => ({ ...prev, bannerFiles: files }))}
            description={homepageDraft.description}
            onChangeDescription={description => setHomepageDraft(prev => ({ ...prev, description }))}
            additionalDescription={homepageDraft.additionalDescription}
            onChangeAdditionalDescription={additionalDescription =>
              setHomepageDraft(prev => ({ ...prev, additionalDescription }))
            }
            registrationDetails={homepageDraft.registrationDetails}
            onChangeRegistrationDetails={registrationDetails =>
              setHomepageDraft(prev => ({ ...prev, registrationDetails }))
            }
            header={homepageDraft.sectionHeaders[editingHomepageSectionId]}
            onChangeHeader={value =>
              setHomepageDraft(prev => ({
                ...prev,
                sectionHeaders: { ...prev.sectionHeaders, [editingHomepageSectionId]: value },
              }))
            }
            buttons={homepageDraft.sectionButtons[editingHomepageSectionId]}
            onChangeButton={(key, value) =>
              setHomepageDraft(prev => ({
                ...prev,
                sectionButtons: {
                  ...prev.sectionButtons,
                  [editingHomepageSectionId]: { ...prev.sectionButtons[editingHomepageSectionId], [key]: value },
                },
              }))
            }
            isPremium={isPremium}
          />
        ) : showingStyle ? (
          <WebsiteDesignStyleFields
            isPremium={isPremium}
            primaryColor={styleDraft.primaryColor}
            onChangePrimaryColor={primaryColor => setStyleDraft(prev => ({ ...prev, primaryColor }))}
            secondaryColor={styleDraft.secondaryColor}
            onChangeSecondaryColor={secondaryColor => setStyleDraft(prev => ({ ...prev, secondaryColor }))}
            neutralTint={styleDraft.neutralTint}
            onChangeNeutralTint={neutralTint => setStyleDraft(prev => ({ ...prev, neutralTint }))}
            buttonStyles={styleDraft.buttonStyles}
            themeOverrides={styleDraft.themeOverrides}
            onChangeThemeOverrides={updater =>
              setStyleDraft(prev => ({
                ...prev,
                themeOverrides: typeof updater === 'function' ? updater(prev.themeOverrides ?? {}) : updater,
              }))
            }
          />
        ) : showingColorExploration ? (
          <ColorExplorationFields
            isPremium={isPremium}
            primaryColor={styleDraft.primaryColor}
            onChangePrimaryColor={primaryColor => setStyleDraft(prev => ({ ...prev, primaryColor }))}
            secondaryColor={styleDraft.secondaryColor}
            onChangeSecondaryColor={secondaryColor => setStyleDraft(prev => ({ ...prev, secondaryColor }))}
            themeOverrides={styleDraft.themeOverrides}
            onChangeThemeOverrides={updater =>
              setStyleDraft(prev => ({
                ...prev,
                themeOverrides: typeof updater === 'function' ? updater(prev.themeOverrides ?? {}) : updater,
              }))
            }
            elementOverrides={styleDraft.elementOverrides}
            onChangeElementOverrides={updater =>
              setStyleDraft(prev => ({
                ...prev,
                elementOverrides: typeof updater === 'function' ? updater(prev.elementOverrides ?? {}) : updater,
              }))
            }
            buttonOverrides={styleDraft.buttonOverrides}
            onChangeButtonOverrides={updater =>
              setStyleDraft(prev => ({
                ...prev,
                buttonOverrides: typeof updater === 'function' ? updater(prev.buttonOverrides ?? {}) : updater,
              }))
            }
            buttonStyles={styleDraft.buttonStyles}
            onChangeButtonStyles={updater =>
              setStyleDraft(prev => ({
                ...prev,
                buttonStyles: typeof updater === 'function' ? updater(prev.buttonStyles ?? {}) : updater,
              }))
            }
          />
        ) : showingSitePages ? (
          <EventSitePagesTiles
            visibility={pageVisibility}
            onToggleVisibility={togglePageVisibility}
            auctionUrl={auctionUrl}
            onSaveAuctionUrl={handleSaveAuctionUrl}
            onEditHomepage={openHomepagePanel}
          />
        ) : showingPackagesList ? (
          <PackagesListContent
            packagesById={packagesById}
            packageOrder={packageOrder}
            categoryLabels={categoryLabels}
            onAddPackage={handleAddPackage}
            onCopyPackage={handleCopyPackage}
            onEditCategory={openEditCategory}
            onReorderCategory={reorderWithinCategory}
            isPremium={isPremium}
          />
        ) : showingEditCategory ? (
          <EditPackageCategoryFields
            value={categoryLabelDraft}
            onChange={setCategoryLabelDraft}
            onSubmit={handleSaveCategoryLabel}
          />
        ) : viewingResponses ? (
          formOverviewName && (
            <AllOrderResponsesForFormDraft1
              key={`${formOverviewId}-${viewingQuestion}`}
              orders={orderList}
              formName={formOverviewName}
              formId={formOverviewId}
              initialQuestion={viewingQuestion}
              onViewOrder={viewOrder}
              onViewEntity={viewEntity}
              onSaveAnswer={saveResponseAnswer}
              onAddResponse={openAddResponse}
            />
          )
        ) : formOverviewId ? (
          formOverviewName && (
            <OrderFormOverviewDraft1
              orders={orderList}
              formName={formOverviewName}
              formId={formOverviewId}
              onViewQuestion={openViewResponses}
              onAddQuestion={openAddQuestion}
              onEditQuestion={openEditQuestion}
              onEditForm={openEditForm}
              formNameDraft={formNameDraft}
              onChangeFormNameDraft={setFormNameDraft}
              onSubmitFormName={handleSaveFormName}
              extraQuestions={customQuestionsByForm[formOverviewId] ?? {}}
              deletedQuestions={deletedQuestionsByForm[formOverviewId] ?? []}
            />
          )
        ) : showingFormsList ? (
          <FormsListContent forms={formsList} onAddForm={openAddForm} onSelectForm={openFormOverview} />
        ) : null}
      </AppSidePanel>
    </>
  )
}
