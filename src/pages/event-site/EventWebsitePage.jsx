import { Fragment, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShoppingCart,
  faBars,
  faArrowRight,
  faMoon,
  faSun,
  faCircleHalfStroke,
  faExternalLinkSquare,
} from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSAppNavigationHeader from '../../gs-lib/components/gs-app-navigation-header'
import GSPageSection from '../../gs-lib/components/gs-page-section'
import GSItemList from '../../gs-lib/components/gs-item-list'
import GSInfoGroup from '../../gs-lib/components/gs-info-group'
import GSProgressBar from '../../gs-lib/components/gs-progress-bar'
import GSImage from '../../gs-lib/components/gs-image'
import GSSplitView from '../../gs-lib/components/gs-split-view'
import GSHTMLViewer from '../../gs-lib/components/gs-html-viewer'
import { isEmptyEditorHtml } from '../../gs-lib/components/gs-text-editor'
import { defaultPadding, golfstatusColors } from '../../gs-lib/helpers/Theme'
import { generateScale } from '../../gs-lib/helpers/colorScale'
import { monochromatize, OUTLINE_VARIANT_MONO_STEP, resolveOverrideHex } from '../../gs-lib/helpers/monochromatic'
import { pickAccessibleTextColor } from '../../gs-lib/helpers/contrast'
import { formatMoney } from '../../components/orders/orderUtils'
import { eventSite } from '../../data/mockEventSite.js'
import { EVENT_SITE_PAGES } from '../../data/eventSitePages.js'
import { loadPageVisibility } from '../../data/eventSitePagesVisibility.js'
import {
  DONATIONS_ENABLED,
  loadHomepageSectionOrder,
  loadHomepageSectionHeaders,
  loadHomepageSectionContent,
  loadHomepageBannerImage,
  loadHomepageMediaImage,
  loadHomepageMediaVideo,
  loadHomepageSectionButtons,
} from '../../data/eventSiteHomepageSections.js'
import { sponsors, SPONSOR_TIERS } from '../../data/mockSponsors.js'
import { loadEventSiteStyle, normalizeNeutralTint, hasEventSiteStyle, saveEventSiteStyle, subscribeEventSiteStyle } from '../../data/eventSiteStyle.js'
import { loadIsPremium } from '../../data/eventSitePremium.js'
import { loadEventSitePreview, saveEventSitePreview } from '../../data/eventSitePreview.js'
import { PACKAGE_CATEGORIES, loadPackageCategoryLabels } from '../../data/eventSitePackageCategories.js'
import EventSitePackagesContent from './EventSitePackagesContent.jsx'
import EventSiteContextMenu from './EventSiteContextMenu.jsx'
import golfstatusLogo from '../../assets/GS_Logo.svg'
import avatarSample from '../../assets/avatar-sample.png'
import poweredByGolfstatus from '../../assets/powered-by-golfstatus.jpg'
import sponsorImagePending from '../../assets/sponsor-image-pending-2-1.jpg'
import golfstatusAppGif from '../../assets/GolfStatusApp.gif'
import appleDownload from '../../assets/AppleDownload.png'
import googleDownload from '../../assets/GoogleDownload.png'
import { buttonOverrideVars, buttonStyleKey } from '../../data/eventSiteButtons.js'
import './EventWebsitePage.scss'

// Public-facing preview of a tournament's event website — reached by
// clicking "View Website" on the Event Site & Packages hub's preview card
// (EventSitePreviewCard.jsx), which opens this in a new tab (see App.jsx)
// since a registrant visiting the real site would never see GolfStatus's
// own admin nav.
//
// Both the section order/content AND the underlying markup are matched
// against the real event site (events.golfstatus.dev), not just the Figma
// file, which had drifted from it. Inspecting the real site's DOM shows it's
// built entirely from this same repo's gs-lib custom-element component
// library (<gs-page-section>, <gs-item-list>/<gs-list-item>, <gs-info-group>,
// <gs-progress-bar>, <gs-image>, <gs-split-view>...) rather than plain
// semantic HTML — so this page is built on those same components (see
// GSPageSection/GSItemList/GSInfoGroup/GSProgressBar/GSImage/GSSplitView
// below), not bespoke divs, to actually match at the code level too.
//
// The sub-nav's own tab row — computed inside the component (see
// `subNavItems` below), not here, since it now depends on the Event Site
// Pages screen's own per-page Visible/Hidden toggle
// (data/eventSitePagesVisibility.js, saved from EventSitePagesTiles.jsx) —
// a page switched off there just disappears from this row instead of still
// showing a tab with nothing real behind it.
//
// The header bar and the sub-nav's horizontal tab row are the one
// place this intentionally does NOT reach for gs-lib's
// GSAppNavigation/GSAppNavigationItem — that component (and its single
// occurrence in the real DOM) is a vertical sidebar link with a left-border
// active accent, built for the admin app shell this repo's own App.jsx
// already uses; it doesn't match a horizontal underlined tab bar, so forcing
// it here would just be surface-level, not a real structural match.
//
// Colors here are pulled from the `--gs-color-*` custom properties in
// gs-lib/styles/theme.scss (the `.gs-theme-${themeName}` class below) for
// the bits this page still hand-styles (header/sub-nav/tiles) — see the
// palette button in `.es-header-actions`, which cycles `themeName` through
// THEME_NAMES. gs-lib's own components theme themselves the way the real app already
// does, via a `.light`/`.dark` ancestor class (see the root div below),
// which is why that class is there alongside `.gs-theme-${themeName}`.
// Cycled by the header's palette button, in order. Each name maps to a
// `.gs-theme-${name}` class in gs-lib/styles/theme.scss — except
// 'golfstatus', which reuses `.gs-theme-default`'s own literal values (see
// THEME_CLASS_NAMES below) but, unlike 'default' itself, never gets
// customThemeStyle's inline overrides, so it shows the base GolfStatus
// brand colors (theme.scss's grey-800/cyan-700) instead of this event's own
// saved Primary/Secondary.
const TINT_OPTIONS = ['golfstatus', 'neutral', 'neutral-two-tone', 'primary', 'full']
const TINT_LABELS = { golfstatus: 'Grayscale', neutral: 'Subtle', 'neutral-two-tone': 'Subtle Two-Tone', primary: 'Bold', secondary: 'Secondary Theme', full: 'Bold Two-Tone' }
const THEME_NAMES = ['default', 'golfstatus']

// What `.gs-theme-${x}` class each THEME_NAMES entry actually renders —
// identity for every name except 'golfstatus', which has no CSS class of
// its own and instead borrows 'default''s.
const THEME_CLASS_NAMES = { golfstatus: 'default' }

const ADDITIONAL_PAGES = ['Rounds', 'Registrants', 'Leaderboards']

const DONATION_AMOUNTS = [500, 250, 100, 25]

// The Technology Sponsor feature card (Figma "Section Content Layout",
// Large) shows a description alongside the sponsor's name/logo — not part of
// mockSponsors.js's own schema (that file backs the real Sponsors CRM list,
// which has no such marketing copy), so it stays local to this preview page.
const TECHNOLOGY_SPONSOR_DESCRIPTION =
  "Carter Insurance Group is proud to power the live scoring and registration technology behind the Highland Ridge Charity Classic, helping every dollar raised go further for local students."

// GSPageSection pads its .section-body with defaultPadding.xLargePad (24px
// all sides) by default, which is what every section below wants except the
// tournament detail section (the intro/hero row right under the banner
// image) — that one bumps just the top/bottom to smallLayoutPad (56px)
// without touching the left/right the component already set. Its background
// is unstyled here — it shares the page-wide `.section-body` rule in
// EventWebsitePage.scss every other section reads, which itself tints to
// Primary/Secondary Tint's 100 step under Monochromatic (see
// `--gs-color-surface-container-high` above).
const TOURNAMENT_SECTION_BODY_PAD = defaultPadding.smallLayoutPad.apply('vertical')

// GSPageSection's `description` skips rendering entirely for a falsy value
// (see gs-page-section.jsx) — Quill's own "empty" HTML isn't falsy
// ("<div><br></div>"), so this normalizes that case to null too, same as a
// blank Section Header already hides that section's title.
function sectionHtml(html) {
  return isEmptyEditorHtml(html) ? null : <GSHTMLViewer html={html} />
}

function arrowTile(label, sub) {
  return (
    <div className="es-arrow-tile" style={{ width: '100%' }} tabIndex={0}>
      <div className="es-arrow-tile-text">
        <div className="es-arrow-tile-label">{label}</div>
        {sub && <div className="es-arrow-tile-sub">{sub}</div>}
      </div>
      <FontAwesomeIcon icon={faArrowRight} className="es-arrow-tile-arrow" />
    </div>
  )
}

// .gs-theme-default's own Neutral values (theme.scss), by mode — the
// starting point Monochromatic (below) substitutes away from. Must be kept
// in sync with that file by hand, same as WebsiteDesignStyleFields.jsx's
// own copy of this shape (ThemeDefinitionRow's `merged` background/surface/
// etc.) — there's no single source both a compiled .scss file and this
// runtime JS can share.
const DEFAULT_NEUTRAL_TOKENS = {
  light: {
    '--gs-color-background': golfstatusColors.white,
    '--gs-color-surface': golfstatusColors.white,
    '--gs-color-surface-variant': golfstatusColors.grey50,
    '--gs-color-surface-container-low': golfstatusColors.white,
    '--gs-color-surface-container-high': golfstatusColors.grey50,
    '--gs-color-surface-container-highest': golfstatusColors.grey100,
    '--gs-color-surface-bright': golfstatusColors.white,
    '--gs-color-outline': golfstatusColors.grey700,
    '--gs-color-outline-variant': golfstatusColors.grey100,
    '--gs-color-placeholder': golfstatusColors.grey300,
  },
  dark: {
    '--gs-color-background': golfstatusColors.black,
    '--gs-color-surface': golfstatusColors.grey900,
    '--gs-color-surface-variant': golfstatusColors.grey800,
    '--gs-color-surface-container-low': golfstatusColors.grey900,
    '--gs-color-surface-container-high': golfstatusColors.grey800,
    '--gs-color-surface-container-highest': golfstatusColors.grey700,
    '--gs-color-surface-bright': golfstatusColors.grey700,
    '--gs-color-outline': golfstatusColors.white,
    '--gs-color-outline-variant': golfstatusColors.grey700,
    // .dark doesn't redefine placeholder in theme.scss, so it stays
    // .gs-theme-default's own light value even in dark mode.
    '--gs-color-placeholder': golfstatusColors.grey300,
  },
}

// Which of this page's own CSS custom properties each Theme Definitions
// role (WebsiteDesignStyleFields.jsx's THEME_ROLES) corresponds to — only
// the roles this page actually themes anything with get an entry; a
// wds-swatch-hex-input edit to a role missing here (Secondary High,
// Surface Dim, the Surface Container extremes, Error, Scrim) has nothing
// live to reflect onto, so it stays a Website Design and Style preview only.
const ROLE_TO_CSS_VAR = {
  primaryContainer: '--gs-color-primary',
  secondaryContainer: '--gs-color-secondary',
  background: '--gs-color-background',
  onBackground: '--gs-color-on-background',
  surface: '--gs-color-surface',
  onSurface: '--gs-color-on-surface',
  onSurfaceVariant: '--gs-color-on-surface-variant',
  surfaceBright: '--gs-color-surface-bright',
  surfaceContainerLow: '--gs-color-surface-container-low',
  surfaceContainerHigh: '--gs-color-surface-container-high',
  surfaceContainerHigest: '--gs-color-surface-container-highest',
  surfaceVariant: '--gs-color-surface-variant',
  outline: '--gs-color-outline',
  outlineVariant: '--gs-color-outline-variant',
  tertiaryContainer: '--gs-color-tertiary-container',
}

// Color Exploration's own Site Colors tab (ColorExplorationFields.jsx's
// ELEMENT_DEFS) lets a single named element — the header logo, a section
// title, one sponsor tile's name, ... — point at a different role than the
// one it reads by default, independent of every other element sharing that
// role. Each key here matches an ELEMENT_DEFS entry exactly; the CSS
// variable it maps to is read (with a fallback to that element's normal
// `--gs-color-*`/local-alias value) by the selector(s) in
// EventWebsitePage.scss actually styling that element — see this file's own
// `var(--es-el-*, ...)` usages there.
const ELEMENT_TO_CSS_VAR = {
  pageBackground: '--es-el-page-background',
  pageTextDefault: '--es-el-page-text-default',
  sectionBoxBackground: '--es-el-section-box-background',
  sectionBottomBorder: '--es-el-section-bottom-border',
  headerIcon: '--es-el-header-icon',
  headerEventName: '--es-el-header-event-name',
  headerBackground: '--es-el-header-background',
  avatarBorder: '--es-el-avatar-border',
  subnavBackground: '--es-el-subnav-background',
  subnavBorder: '--es-el-subnav-border',
  tournamentEventName: '--es-el-tournament-event-name',
  tournamentDate: '--es-el-tournament-date',
  tournamentLocation: '--es-el-tournament-location',
  sidebarBorder: '--es-el-sidebar-border',
  sectionTitle: '--es-el-section-title',
  sectionDescription: '--es-el-section-description',
  arrowTileBackground: '--es-el-arrow-tile-background',
  arrowTileLabel: '--es-el-arrow-tile-label',
  arrowTileArrow: '--es-el-arrow-tile-arrow',
  packageTileIcon: '--es-el-package-tile-icon',
  additionalPagesSub: '--es-el-additional-pages-sub',
  sponsorTierHeader: '--es-el-sponsor-tier-header',
  sponsorTileName: '--es-el-sponsor-tile-name',
  sponsorFeatureName: '--es-el-sponsor-feature-name',
  sponsorFeatureDescription: '--es-el-sponsor-feature-description',
  videoFrameBorder: '--es-el-video-frame-border',
  imageFrameBorder: '--es-el-image-frame-border',
  packagesCardText: '--es-el-packages-card-text',
  soldOutBadgeBackground: '--es-el-sold-out-badge-background',
  soldOutBadgeText: '--es-el-sold-out-badge-text',
  sectionBoxText: '--es-el-section-box-text',
  avatarBackground: '--es-el-avatar-background',
  mobileMenuIcon: '--es-el-mobile-menu-icon',
  headerActionIcons: '--es-el-header-action-icons',
  packageTileBorder: '--es-el-package-tile-border',
  donationProgressTrack: '--es-el-donation-progress-track',
  donationProgressText: '--es-el-donation-progress-text',
  donationTileBackground: '--es-el-donation-tile-background',
  donationTileText: '--es-el-donation-tile-text',
  donationGoalLabel: '--es-el-donation-goal-label',
  donationProgressEnd: '--es-el-donation-progress-end',
  liveScoringBodyText: '--es-el-live-scoring-body-text',
}

// EVENT_SITE_USED_KEYS' 11 roles' real `--gs-color-*` variable — every one
// of them a real custom property this file's own customThemeStyle always
// sets (directly, or via ROLE_TO_CSS_VAR's own themeOverrides riff above).
// An element override can alias one of these roles by name (Site Colors'
// own ELEMENT_DEFS, `{ role: roleKey }`) instead of a literal hex — see the
// element-override block below, which then just points that element's own
// --es-el-* variable at `var(${thisRoleVar})` rather than computing a hex,
// so the element keeps tracking whatever that role itself resolves to
// (tint, its own override, ...) instead of freezing a snapshot of it.
const ROLE_KEY_TO_LIVE_CSS_VAR = {
  primary: '--gs-color-primary',
  onPrimary: '--gs-color-on-primary',
  secondary: '--gs-color-secondary',
  onSecondary: '--gs-color-on-secondary',
  background: '--gs-color-background',
  onBackground: '--gs-color-on-background',
  surface: '--gs-color-surface',
  onSurface: '--gs-color-on-surface',
  surfaceVariant: '--gs-color-surface-variant',
  onSurfaceVariant: '--gs-color-on-surface-variant',
  surfaceContainerLow: '--gs-color-surface-container-low',
  surfaceContainerHigh: '--gs-color-surface-container-high',
  surfaceContainerHigest: '--gs-color-surface-container-highest',
  surfaceBright: '--gs-color-surface-bright',
  outline: '--gs-color-outline',
  outlineVariant: '--gs-color-outline-variant',
  tertiaryContainer: '--gs-color-tertiary-container',
}

export default function EventWebsitePage() {
  // Read once on load — same convention as siteStyle etc. below — so a page
  // hidden from the Event Site Pages screen (EventSitePagesTiles.jsx, via
  // data/eventSitePagesVisibility.js) actually loses its subnav tab here.
  // 'Event Details' has no toggle of its own (it's the site's core landing
  // content, always shown — see EventSitePagesTiles.jsx's own comment) and
  // 'Donate' has no toggle either (its visibility is DONATIONS_ENABLED
  // instead, same as its own homepage section below), so both are filtered
  // by those instead of this map.
  const [pageVisibility] = useState(loadPageVisibility)
  const subNavItems = EVENT_SITE_PAGES.filter(page => {
    if (page === 'Event Details') return true
    if (page === 'Donate') return DONATIONS_ENABLED
    return pageVisibility[page]
  })
  const [activeTab, setActiveTab] = useState(subNavItems[0])
  // Category tile tapped on the homepage's Packages section — the Packages
  // page scrolls that category into view on arrival (null otherwise).
  const [packagesScrollKey, setPackagesScrollKey] = useState(null)
  function openPackages(categoryKey = null) {
    setPackagesScrollKey(categoryKey)
    setActiveTab('Packages')
    if (!categoryKey) window.scrollTo({ top: 0 })
  }
  // Read once on load — this prototype has no backend, so this is what
  // "reflects" a style saved from the Website Design and Style screen
  // (EventSitePackagesListPage.jsx via data/eventSiteStyle.js) here.
  const [siteStyle, setSiteStyle] = useState(loadEventSiteStyle)
  // Right-click menu (EventSiteContextMenu.jsx) edits element/button
  // designations in place — written straight back to the saved style, same
  // storage the Website Design and Style screen's Save uses.
  const [ctxMenu, setCtxMenu] = useState(null)
  const [pageEl, setPageEl] = useState(null)
  // Applied to whatever's saved right now, not this tab's copy — Color
  // Exploration may have saved since this page loaded.
  const updateSiteStyle = updater => {
    const next = updater(loadEventSiteStyle())
    setSiteStyle(next)
    saveEventSiteStyle(next)
  }
  // DEFAULT_EVENT_SITE_STYLE now carries the designed theme/element/button
  // defaults for every theme, so a premium tournament renders from it even
  // before anything's been saved (a saved style just replaces it). Non-premium
  // still gets the fixed brand look via the `!isPremium` checks below.
  const [hasSavedStyle, setHasSavedStyle] = useState(true)
  // Picks up a style saved from Color Exploration in another tab (including
  // the very first save, which is what turns the custom theme on).
  useEffect(() => {
    const apply = style => {
      setSiteStyle(style)
      setHasSavedStyle(true)
    }
    const unsubscribe = subscribeEventSiteStyle(apply)
    // Backstop for a missed `storage` event (e.g. a backgrounded tab): re-read
    // the saved style whenever this tab comes back into view.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && hasEventSiteStyle()) apply(loadEventSiteStyle())
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [])
  // Same read-once-on-load convention as siteStyle above — a non-premium
  // tournament can't customize its theme colors (see the `website-design-
  // style` row's `premiumOnly` in EventSitePackagesListPage.jsx), so this
  // page has to lock to GolfStatus's baseline colors regardless of whatever
  // was saved to siteStyle before a downgrade, or of the theme picker below
  // (see `customThemeStyle`).
  const [isPremium] = useState(loadIsPremium)
  // Which order this page's own sections render in — whatever was last
  // saved from the Event Site Homepage screen's tile list
  // (EventSiteHomepageSectionsList, via EventSitePackagesListPage.jsx),
  // same read-once-on-load convention as siteStyle above. See sectionsById
  // below for how each HOMEPAGE_SECTIONS id maps to a block of this page.
  const [sectionOrder] = useState(loadHomepageSectionOrder)
  // Custom titles for the sections below that have one (every section
  // except Banner Image and Tournament Details — see DEFAULT_SECTION_HEADERS'
  // own comment) — same read-once-on-load convention as sectionOrder above,
  // saved from the same screen's "Section Header" field
  // (EventSiteHomepageFields.jsx). A section whose saved header is '' passes
  // that empty string straight through as its GSPageSection `title`, which
  // already skips rendering a title at all for a falsy value (see
  // gs-page-section.jsx) — that's what actually hides it, not any
  // special-casing here.
  const [sectionHeaders] = useState(loadHomepageSectionHeaders)
  // Custom body copy for the same sections as sectionHeaders above (Event
  // Description, Additional Event Description, Registration Details) —
  // same read-once-on-load convention, saved from that screen's own
  // GSTextEditor fields (EventSiteHomepageFields.jsx). Rendered via
  // GSHTMLViewer below since GSTextEditor's value is Quill-authored HTML,
  // not plain text.
  const [sectionContent] = useState(loadHomepageSectionContent)
  // Custom copy for the buttons below that have one (Register Now/Make A
  // Donation, View Packages, View Sponsors, Donate Now) — same
  // read-once-on-load convention as sectionHeaders above, saved from that
  // screen's own "<Button> Button Text" fields (EventSiteHomepageFields.jsx).
  const [sectionButtons] = useState(loadHomepageSectionButtons)
  // The Banner Image/Photo/Video files uploaded from that same screen
  // (EventSiteHomepageFields.jsx) — null when nothing's been uploaded yet,
  // in which case that block/section just doesn't render at all (see
  // sectionsById's banner/photo/video entries below) — same "never fall
  // back to a stand-in" rule as the admin tile list's own hasContent/"Not
  // Added". Unlike every other read-once-on-load state above, these three
  // come from IndexedDB (data/eventSiteHomepageSections.js — localStorage's
  // quota can't reliably hold a photo, let alone a video), which is only
  // ever read asynchronously, so this loads them in an effect instead of a
  // lazy useState initializer, and turns each Blob into an object URL —
  // revoked on unmount/replacement so a re-visit doesn't leak one per load.
  const [homepageBannerImage, setHomepageBannerImage] = useState(null)
  const [homepagePhotoImage, setHomepagePhotoImage] = useState(null)
  const [homepageVideoFile, setHomepageVideoFile] = useState(null)
  useEffect(() => {
    let cancelled = false
    const urls = []
    function toObjectUrl(blob) {
      if (!blob) return null
      const url = URL.createObjectURL(blob)
      urls.push(url)
      return url
    }
    Promise.all([loadHomepageBannerImage(), loadHomepageMediaImage(), loadHomepageMediaVideo()]).then(
      ([bannerBlob, photoBlob, videoBlob]) => {
        if (cancelled) return
        setHomepageBannerImage(toObjectUrl(bannerBlob))
        setHomepagePhotoImage(toObjectUrl(photoBlob))
        setHomepageVideoFile(toObjectUrl(videoBlob))
      }
    )
    return () => {
      cancelled = true
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])
  // This page's own "Packages" tiles read their label from here, not
  // PACKAGE_CATEGORIES' own default `label` — same read-once-on-load
  // convention as siteStyle above, so a category renamed from the
  // "Package Category" screen (EventSitePackagesListPage.jsx's
  // `handleSaveCategoryLabel`) shows up here too.
  const [packageCategoryLabels] = useState(loadPackageCategoryLabels)
  // This page's own header toggles (Light/Dark, the theme picker,
  // Monochromatic) — separate from siteStyle above, and persisted via
  // data/eventSitePreview.js so refreshing this page keeps whatever you
  // last had it previewing instead of resetting to Light/Default/Off.
  const [preview] = useState(loadEventSitePreview)
  const [themeMode, setThemeMode] = useState(preview.themeMode ?? 'light')
    // Whether the site opens tinted at all — unlike themeMode/themeName
  // above, this always exactly mirrors the saved Site Style radio
  // (WebsiteDesignStyleFields.jsx's Neutral/Primary/Secondary Tint) rather
  // than seeding from a previous preview session, so the site can never
  // open showing a tint the admin didn't actually save (or vice versa) just
  // because a viewer's browser had an old toggle lying around. Still
  // toggleable here via the header's monochromatic button
  // (es-monochromatic-toggle below) for ad hoc previewing — that flips this
  // state for the current session only (see the useEffect below, which
  // deliberately excludes it from what gets persisted), so a refresh always
  // lands back on the saved design again. monoScale below is what answers
  // "which color"; this is only "is it on".
  const [tint, setTint] = useState(siteStyle.neutralTint)
  const monochromatic = normalizeNeutralTint(tint) !== 'neutral' && tint !== 'golfstatus'
  // The GolfStatus Default option is the fixed .gs-theme-golfstatus preset
  // rather than a tint of the saved site style.
  const themeName = tint === 'golfstatus' ? 'golfstatus' : 'default'

  useEffect(() => {
    saveEventSitePreview({ themeMode, themeName })
  }, [themeMode, themeName])

  // Only the "default" theme is ever built from this saved style — any
  // other preset stays its own fixed values (gs-lib/styles/theme.scss),
  // same as everywhere else this distinction has been made.
  const primaryScale = generateScale(siteStyle.primaryColor)
  const secondaryScale = generateScale(siteStyle.secondaryColor)
  // Which scale Monochromatic substitutes into the Neutral theme roles —
  // the saved neutralTint's own color, defaulting to Primary (e.g. if the
  // saved tint is 'neutral' but the viewer turned Monochromatic on here
  // anyway via the header toggle).
  const monoScale = tint === 'secondary' || tint === 'full' ? secondaryScale : primaryScale
  // The page's main-CTA buttons (Register Now, View Packages, View Sponsors,
  // Sponsor Website) default to Primary, matching Neutral/Primary Tint — but
  // under Secondary Tint they'd otherwise be the one thing on the page still
  // reading Primary while every section body and text role around them has
  // already switched to Secondary (monoScale above), so they follow the same
  // tint instead of staying pinned to Primary. Doesn't touch the Donation
  // section's own buttons (Make A Donation/Donate Now) — those are
  // deliberately Secondary regardless of tint, matching that section's
  // hardcoded Secondary progress bar below.
  // Full Tint: surfaces/backgrounds tint with Secondary (monoScale), text and
  // outline roles with Primary (textScale) — a combination of both.
  // GolfStatus Default theme's progress bar is fixed cyan 300-600.
  const progressScale = themeName === 'golfstatus'
    ? { 300: golfstatusColors.cyan300, 600: golfstatusColors.cyan600 }
    : primaryScale
  const textScale = tint === 'full' ? primaryScale : monoScale
  const ctaColor = tint === 'secondary' ? 'secondary-color' : 'primary-color'
  // Props for one named button: its id (what the right-click menu edits) plus
  // the color/appearance saved for it (siteStyle.buttonStyles), falling back
  // to the variant the page gives it by default. Like every other saved
  // customization, ignored until a style's been saved on a premium tournament.
  const btn = (buttonId, color, appearance) => {
    const saved = isPremium && hasSavedStyle ? siteStyle.buttonStyles?.[buttonStyleKey(tint, buttonId)] : null
    return { buttonId, color: saved?.color ?? color, appearance: saved?.appearance ?? appearance }
  }

  // Subtle buttons sit a step lighter than the base color in light mode, a
  // step darker in dark mode (100/700); their text is pinned opposite —
  // 900 in light mode, 50 in dark mode — same "fixed step, not AA-picked"
  // convention as Fill's on-*-fill (step 50) below.
  const primarySubtleBg = primaryScale[themeMode === 'dark' ? 700 : 100]
  const secondarySubtleBg = secondaryScale[themeMode === 'dark' ? 700 : 100]

  // Fill/Outline's base color sits noticeably lighter in dark mode (600 ->
  // 200) so it doesn't read as a flat, oversaturated block against a dark
  // background — same convention WebsiteDesignStyleFields.jsx's Button
  // Styles preview follows, so the two can't drift apart. This is also
  // --gs-color-primary/-secondary itself (see customThemeStyle below), so
  // the header/active-tab accent moves with this same step too — the real
  // theme system has no separate "just the buttons" token.
  const primaryBase = primaryScale[themeMode === 'dark' ? 200 : 600]
  const secondaryBase = secondaryScale[themeMode === 'dark' ? 200 : 600]

  const customThemeStyle = themeName !== 'default' || !isPremium || !hasSavedStyle ? undefined : {
    '--gs-color-primary': primaryBase,
    // --gs-color-on-primary/-secondary stay AA-picked — the header bar
    // (EventWebsitePage.scss's .es-header-bar) reads these same tokens for
    // its own bg/fg pairing, so they can't be pinned to a fixed step.
    // Fill buttons read the dedicated -fill tokens below instead.
    '--gs-color-on-primary': pickAccessibleTextColor(primaryBase, primaryScale[100], primaryScale[800]),
    '--gs-color-secondary': secondaryBase,
    '--gs-color-on-secondary': pickAccessibleTextColor(secondaryBase, secondaryScale[100], secondaryScale[800]),
    // Dark mode's Fill background is a light tint (see primaryBase/
    // secondaryBase above, step 200) so its text needs to be dark (900),
    // not light (50) the way light mode's step-400 background needs.
    '--gs-color-on-primary-fill': primaryScale[themeMode === 'dark' ? 900 : 50],
    '--gs-color-on-secondary-fill': secondaryScale[themeMode === 'dark' ? 900 : 50],
    '--gs-color-primary-subtle': primarySubtleBg,
    '--gs-color-on-primary-subtle': primaryScale[themeMode === 'dark' ? 50 : 900],
    '--gs-color-secondary-subtle': secondarySubtleBg,
    '--gs-color-on-secondary-subtle': secondaryScale[themeMode === 'dark' ? 50 : 900],
    // All page text/icons (section headers, descriptions, tile labels, tile
    // icons) read one of these three "on-*" text-role tokens — pinning all
    // three to the same step of monoScale (Primary for Neutral/Primary Tint,
    // Secondary for Secondary Tint — same scale the Neutral roles below tint
    // with) gives the whole page one text color that actually follows the
    // saved Site Style radio instead of always reading Primary, and every
    // "lighter" text treatment already layers its own opacity on top of
    // whichever color these tokens resolve to (see EventWebsitePage.scss's
    // .es-arrow-tile-sub/-arrow, .es-sponsor-feature-description, and
    // GSPageSection's own description div), so that opacity now lightens
    // this step instead of on-surface. Flips light (near-900) to dark
    // (near-50/100) with themeMode, same as theme.scss's own .gs-theme-
    // default/.dark split for these same three roles (grey-800 vs white/
    // grey-100) — without this the backgrounds below (monoScale[900] in
    // dark mode) and this text sat one step apart on the same dark end of
    // the scale, unreadable.
    '--gs-color-on-background': textScale[themeMode === 'dark' ? 50 : 800],
    '--gs-color-on-surface': textScale[themeMode === 'dark' ? 50 : 800],
    '--gs-color-on-surface-variant': textScale[themeMode === 'dark' ? 100 : 800],
    // Light-mode header bar: the dark ink step (800) instead of the raw
    // primary, same as the preview mockup's header (EventSiteDeviceMockup.jsx
    // --edm-ink). Dark mode keeps its own inverted header (.dark
    // .es-header-bar).
    // Neutral Tint skips this and keeps the plain Primary/On Primary header.
    ...(themeMode === 'light' && monochromatic && {
      '--es-header-ink': textScale[800],
      '--es-header-on-ink': golfstatusColors.white,
    }),
    ...(monochromatic &&
      Object.fromEntries(
        Object.entries(DEFAULT_NEUTRAL_TOKENS[themeMode]).map(([token, hex]) => [
          token,
          // Pinned to a fixed step instead of monochromatize()'s usual
          // hex-based lookup — see OUTLINE_VARIANT_MONO_STEP's own comment
          // (monochromatic.js) for why Outline Variant needs a fixed step.
          // Surface Container High gets the same treatment so every
          // section body (EventWebsitePage.scss's .section-body reads this
          // token) tints to the same 100 step under Primary/Secondary Tint,
          // in both light and dark mode, instead of following
          // monochromatize()'s light/dark-dependent grey-50/grey-800 lookup.
          token === '--gs-color-outline-variant'
            ? textScale[OUTLINE_VARIANT_MONO_STEP]
            : token === '--gs-color-surface-container-high'
              ? monoScale[OUTLINE_VARIANT_MONO_STEP] // surface scale, matching the preview's card bodies
              : monochromatize(hex, monoScale),
        ])
      )),
  }

  // Role riffs saved from Color Exploration/Website Design and Style. Applied
  // under every theme (GolfStatus included) — each is keyed by tint, so the
  // 'golfstatus' slot holds its own edits.
  const roleStyle = !isPremium || !hasSavedStyle ? {} : {
  // Per-swatch riffs saved from the Website Design and Style screen's
  // Theme Definitions row (see ROLE_TO_CSS_VAR above) — applied last so a
  // saved override always wins over both the plain and Monochromatic
  // values above, exactly like it does in that screen's own preview.
  ...Object.fromEntries(
    Object.entries(ROLE_TO_CSS_VAR)
      .map(([roleKey, cssVar]) => {
        const override = siteStyle.themeOverrides?.[`${themeMode}-${tint}-${roleKey}`]
        const hex = resolveOverrideHex(override, { primaryScale, secondaryScale })
        return hex ? [cssVar, hex] : null
      })
      .filter(Boolean)
  ),
  }

  // Applies under every theme (GolfStatus included), unlike customThemeStyle
  // — overrides are already keyed by tint, so 'golfstatus' has its own set.
  const elementStyle = !isPremium || !hasSavedStyle ? {} : {
  // Per-element riffs saved from Color Exploration's own Site Colors tab
  // (see ELEMENT_TO_CSS_VAR above) — applied last of all so a saved
  // element override always wins over its role's own value, including a
  // themeOverrides riff to that same role above (an element override is
  // more specific — it names one element, not the whole role).
  ...Object.fromEntries(
    Object.entries(ELEMENT_TO_CSS_VAR)
      .map(([elementKey, cssVar]) => {
        const override = siteStyle.elementOverrides?.[`${themeMode}-${tint}-${elementKey}`]
        if (!override) return null
        // A role reference (Site Colors' own vocabulary going forward,
        // see ROLE_KEY_TO_LIVE_CSS_VAR above) points this element's own
        // variable straight at that role's live variable — var(...) can
        // nest — instead of computing a hex, so the element keeps
        // tracking whatever that role itself resolves to. A legacy
        // { family, step }/White/Black ref (saved before this screen
        // switched to role references) still resolves via
        // resolveOverrideHex.
        if (override.role) {
          const roleCssVar = ROLE_KEY_TO_LIVE_CSS_VAR[override.role]
          return roleCssVar ? [cssVar, `var(${roleCssVar})`] : null
        }
        const hex = resolveOverrideHex(override, { primaryScale, secondaryScale })
        return hex ? [cssVar, hex] : null
      })
      .filter(Boolean)
  ),
  }

  // Button color riffs saved from Color Exploration's Buttons tab
  // (data/eventSiteButtons.js) apply under every theme, GolfStatus included —
  // that theme has no customThemeStyle of its own (it stays the fixed brand
  // preset), so these `--gs-btn-*` variables are layered on separately.
  const buttonStyle = isPremium && hasSavedStyle
    ? buttonOverrideVars(siteStyle.buttonOverrides, themeMode, tint, { primaryScale, secondaryScale })
    : {}
  const extraStyle = { ...roleStyle, ...elementStyle, ...buttonStyle }
  const pageThemeStyle = Object.keys(extraStyle).length ? { ...customThemeStyle, ...extraStyle } : customThemeStyle

  const sponsorsByTier = SPONSOR_TIERS.map(tier => ({
    tier,
    sponsors: sponsors.filter(s => s.tier === tier),
  })).filter(group => group.sponsors.length > 0)

  const introInfo = [
    {
      sections: [
        {
          gap: 'medium-large-gap',
          sectionItems: [
            { type: 'headline-1 es-tournament-event-name', value: eventSite.tournamentName },
            { type: 'body-regular secondary es-tournament-date', value: eventSite.dateRange },
            {
              // Own class distinct from es-tournament-date above — both are
              // otherwise the same GSInfoGroup "body-regular secondary"
              // item type, which Site Colors' Tournament Date/Location
              // elements (ColorExplorationFields.jsx's ELEMENT_DEFS) need to
              // read independently of one another.
              type: 'body-regular secondary es-tournament-location',
              value: (
                <div className="es-course-location-group">
                  <span>{eventSite.facility}</span>
                  <span>{eventSite.location}</span>
                </div>
              ),
            },
          ],
        },
      ],
    },
  ]

  // Every HOMEPAGE_SECTIONS id (data/eventSiteHomepageSections.js) mapped to
  // the block of this page it actually renders — `sectionOrder` (above)
  // walks these in whatever order was saved from the tile list, so this is
  // the one place that reorder has to stay in sync with. 'banner' and
  // 'tournamentDetails' are two separately reorderable tiles even though
  // they sit right on top of each other by default — same independent-slot
  // treatment every other section here gets.
  const sectionsById = {
    banner: homepageBannerImage ? (
      <GSImage src={homepageBannerImage} style={{ width: '100%', height: 280, borderRadius: 0, border: 'none' }} />
    ) : null,

    tournamentDetails: (
      <GSPageSection
        bodyStyle={TOURNAMENT_SECTION_BODY_PAD}
        body={[
          <GSSplitView
            left={
              <div className="es-intro-main">
                <GSInfoGroup dataGroups={introInfo} />
                <div className="es-intro-actions">
                  <GSButton {...btn('registerNow', ctaColor, 'fill')} title={sectionButtons.tournamentDetails.registerNow} isFocusable onClick={() => openPackages()} />
                  <GSButton
                    {...btn('makeDonation', 'secondary-color', 'outline')}
                    title={sectionButtons.tournamentDetails.makeDonation}
                    isFocusable
                    // Non-premium locks to GolfStatus's own grey-800, not
                    // --gs-color-secondary's teal — same brand-only rule as
                    // customThemeStyle above, just scoped to this one button
                    // via a local CSS var override instead of the header's
                    // page-wide class swap (this button reads --gs-color-
                    // secondary for both border and text, so overriding it
                    // here moves both without touching any other secondary
                    // element on the page, e.g. the Donation section's own
                    // progress bar).
                    style={!isPremium ? { '--gs-color-secondary': golfstatusColors.grey800 } : undefined}
                  />
                </div>
              </div>
            }
            right={
              <div className="es-intro-sidebar">
                <div className="es-sidebar-card">
                  <img className="es-sidebar-card-image" src={poweredByGolfstatus} alt="Event Powered By GolfStatus" />
                </div>
                <GSImage src={sponsorImagePending} style={{ width: '100%', height: 240 }} />
              </div>
            }
          />,
        ]}
      />
    ),

    description: <GSPageSection title={sectionHeaders.description} description={sectionHtml(sectionContent.description)} />,

    additionalDescription: (
      <GSPageSection
        title={sectionHeaders.additionalDescription}
        description={sectionHtml(sectionContent.additionalDescription)}
      />
    ),

    registrationDetails: (
      <GSPageSection
        title={sectionHeaders.registrationDetails}
        description={sectionHtml(sectionContent.registrationDetails)}
      />
    ),

    packages: (
      <GSPageSection
        title={sectionHeaders.packages}
        sectionActions={[
          { title: sectionButtons.packages.viewPackages, rightIcon: faArrowRight, ...btn('viewPackages', ctaColor, 'fill'), isFocusable: true, onClick: () => openPackages() },
        ]}
        body={[
          <GSItemList
            type="grid medium-large-gap es-package-tiles"
            style={{ width: '100%' }}
            items={PACKAGE_CATEGORIES}
            listItem={category => (
              <div className="es-arrow-tile" style={{ width: '100%' }} tabIndex={0} onClick={() => openPackages(category.key)}>
                <FontAwesomeIcon icon={category.icon} className="es-arrow-tile-icon" />
                <div className="es-arrow-tile-label">{packageCategoryLabels[category.key] ?? category.label}</div>
                <FontAwesomeIcon icon={faArrowRight} className="es-arrow-tile-arrow" />
              </div>
            )}
          />,
        ]}
      />
    ),

    sponsors: (
      <GSPageSection
        title={sectionHeaders.sponsors}
        sectionActions={[
          { title: sectionButtons.sponsors.viewSponsors, rightIcon: faArrowRight, ...btn('viewSponsors', ctaColor, 'fill'), isFocusable: true },
        ]}
        body={[
          ...sponsorsByTier.map(group => {
            // The Technology Sponsor tier is the event's single top sponsor
            // (see mockSponsors.js), so it gets its own split-view feature
            // treatment (Figma "Section Content Layout", Large) instead of
            // sharing the grid the other tiers use below.
            if (group.tier === 'Technology Sponsor') {
              const sponsor = group.sponsors[0]
              return (
                <div className="es-sponsor-tier" key={group.tier}>
                  <GSActionBar type="H3" header={group.tier} />
                  <GSSplitView
                    left={
                      <GSImage
                        ratio="wide"
                        style={{ width: '100%', aspectRatio: '2 / 1' }}
                        src={sponsorImagePending}
                        alt={sponsor.sponsorName}
                      />
                    }
                    right={
                      <div className="es-sponsor-feature-name-wrap">
                        <div className="es-sponsor-feature">
                          <div className="es-sponsor-feature-name">{sponsor.sponsorName}</div>
                          <div className="es-sponsor-feature-body">
                            <p className="es-sponsor-feature-description">{TECHNOLOGY_SPONSOR_DESCRIPTION}</p>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
              )
            }
            return (
              <div className="es-sponsor-tier" key={group.tier}>
                <GSActionBar type="H3" header={group.tier} />
                <GSItemList
                  type="grid medium-large-gap"
                  listStyle={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
                  items={group.sponsors}
                  listItem={sponsor => (
                    <div className="es-sponsor-tile" style={{ width: '100%' }}>
                      <GSImage ratio="wide" style={{ width: '100%', aspectRatio: '2 / 1' }} src={sponsorImagePending} alt={sponsor.sponsorName} />
                      <GSActionBar
                        type="H5"
                        header={sponsor.sponsorName}
                        pageActions={[{ actionIcon: faExternalLinkSquare, ...btn('sponsorWebsite', ctaColor, 'subtle'), size: 'secondary', isFocusable: true }]}
                      />
                    </div>
                  )}
                />
              </div>
            )
          }),
          <div className="es-sponsor-tier" key="all-sponsors">
            <GSActionBar type="H3" header="All Sponsors" />
            <GSItemList
              type="grid medium-large-gap"
              listStyle={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}
              items={sponsors}
              listItem={sponsor => (
                <GSImage ratio="wide" style={{ width: '100%', aspectRatio: '2 / 1' }} src={sponsorImagePending} alt={sponsor.sponsorName} />
              )}
            />
          </div>,
        ]}
      />
    ),

    // Photo and Video used to be one combined "Photos & Video" section —
    // now two fully independent, independently reorderable sections/tiles,
    // each gated on (and rendering) only its own file.
    photo: homepagePhotoImage ? (
      <GSPageSection
        title={sectionHeaders.photo}
        body={[<GSImage src={homepagePhotoImage} style={{ width: '100%', height: 'auto' }} />]}
      />
    ) : null,

    video: homepageVideoFile ? (
      <GSPageSection
        title={sectionHeaders.video}
        body={[
          <video
            className="es-video-frame"
            src={homepageVideoFile}
            controls
            style={{ width: '100%', height: 'auto' }}
          />,
        ]}
      />
    ) : null,

    donation: !DONATIONS_ENABLED ? null : (
      <GSPageSection
        title={sectionHeaders.donation}
        description="Help us drive real change in our community!"
        sectionActions={[
          {
            title: sectionButtons.donation.donateNow,
            rightIcon: faArrowRight,
            ...btn('donateNow', 'secondary-color', 'fill'),
            isFocusable: true,
            // Non-premium locks this to a flat black fill instead of
            // --gs-color-secondary's teal — same local CSS var override as
            // the outline button above, scoped to just this button so the
            // progress bar's own --gs-color-secondary read stays teal.
            style: !isPremium ? { '--gs-color-secondary': golfstatusColors.black } : undefined,
          },
        ]}
        body={[
          <div className="es-donation-body">
            <div className="es-donation-goal-label">
              <span className="es-donation-raised-amount">${formatMoney(eventSite.donationRaised)} Raised</span> of $
              {formatMoney(eventSite.donationGoal)} Donation Goal
            </div>
            <GSProgressBar
              value={eventSite.donationRaised}
              max={eventSite.donationGoal}
              trackStyle={{
                background: `linear-gradient(90deg, ${progressScale[300]}, var(--es-el-donation-progress-end, ${progressScale[600]}))`,
              }}
            />
            <GSItemList
              type="grid medium-large-gap es-donation-tiles"
              style={{ width: '100%' }}
              items={DONATION_AMOUNTS}
              listItem={amount => (
                <div className="es-donation-tile" style={{ width: '100%' }}>
                  <GSButton
                    isFocusable
                    title={
                      <>
                        <div className="es-donation-tile-label">Donate</div>
                        <div className="es-donation-tile-value">${amount}</div>
                      </>
                    }
                  />
                </div>
              )}
            />
          </div>,
        ]}
      />
    ),

    additionalPages: (
      <GSPageSection
        title={sectionHeaders.additionalPages}
        body={[
          <GSItemList
            type="grid medium-large-gap es-additional-pages-tiles"
            style={{ width: '100%' }}
            items={ADDITIONAL_PAGES}
            listItem={page => arrowTile(page, 'View All')}
          />,
        ]}
      />
    ),

    liveScoring: (
      <GSPageSection
        title={sectionHeaders.liveScoring}
        body={[
          <div className="es-live-scoring-section">
            <GSSplitView
              left={<img src={golfstatusAppGif} alt="GolfStatus App" style={{ width: 260, height: 'auto' }} />}
              right={
                <div className="es-live-scoring-body">
                  <p className="es-body-text">
                    Download the free GolfStatus App to live score {eventSite.tournamentName}!
                  </p>
                  <div className="es-store-badges">
                    <img src={appleDownload} alt="Download on the App Store" className="es-store-badge-image" />
                    <img src={googleDownload} alt="Get it on Google Play" className="es-store-badge-image" />
                  </div>
                </div>
              }
            />
          </div>,
        ]}
      />
    ),
  }

  return (
    <div
      ref={setPageEl}
      className={`es-page gs-theme-${THEME_CLASS_NAMES[themeName] ?? themeName} ${themeMode}`}
      style={pageThemeStyle}
      // Right-click any element or button to change its designation. Shift +
      // right-click still opens the browser's own menu. Dev-only — the
      // handler isn't attached in a production build (import.meta.env.DEV).
      onContextMenu={e => {
        if (!import.meta.env.DEV || e.shiftKey) return
        e.preventDefault()
        setCtxMenu({ x: e.clientX, y: e.clientY, node: e.target })
      }}
    >
      <header className="es-header">
        <div className="es-header-bar">
          <div className="es-brand-row">
            <div
              className="es-brand-logo"
              // Quoted url() — a *production build* only bug: this SVG is
              // small enough that Vite inlines it as a data: URI, and that
              // encoded SVG keeps its own attributes' quotes literally
              // (e.g. width='50') un-percent-encoded. An unquoted url() is
              // invalid CSS once it contains a literal quote character, so
              // the browser silently drops the whole mask-image declaration
              // — worked in `vite dev` (served as a plain file URL there),
              // broke only after `vite build` / in production.
              style={{ WebkitMaskImage: `url("${golfstatusLogo}")`, maskImage: `url("${golfstatusLogo}")` }}
            />
            <GSAppNavigationHeader title={eventSite.tournamentName} />
          </div>
          <div className="es-header-actions">
            <div className="es-cart-button">
              <GSButton buttonIcon={faShoppingCart} isFocusable aria-label="Cart" />
            </div>
            <div className="es-avatar">
              <img className="es-avatar-image" src={avatarSample} alt="" />
            </div>
            <div className="es-theme-toggle">
              <GSButton
                buttonIcon={themeMode === 'light' ? faMoon : faSun}
                isFocusable
                aria-label="Toggle dark mode"
                onClick={() => setThemeMode(mode => (mode === 'light' ? 'dark' : 'light'))}
              />
            </div>
            <div className="es-monochromatic-toggle">
              <GSButton
                buttonIcon={faCircleHalfStroke}
                isFocusable
                aria-label={`Theme: ${TINT_LABELS[tint]} (click to cycle)`}
                title={TINT_LABELS[tint]}
                onClick={() => setTint(t => TINT_OPTIONS[(TINT_OPTIONS.indexOf(t) + 1) % TINT_OPTIONS.length])}
              />
            </div>
            <div className="es-menu-button">
              <GSButton buttonIcon={faBars} isFocusable aria-label="Menu" />
            </div>
          </div>
        </div>
        <nav className="es-subnav">
          <GSActionBar
            type="large-pad"
            pageActions={subNavItems.map(item => ({
              title: item,
              ...(item === activeTab
                ? { ...btn('subnavSelected', 'primary-color', 'subtle'), size: 'secondary' }
                : { ...btn('subnavUnselected', 'primary-color', 'transparent'), size: 'secondary' }),
              isFocusable: true,
              onClick: () => (item === 'Packages' ? openPackages() : setActiveTab(item)),
            }))}
          />
        </nav>
      </header>

      {activeTab === 'Packages' ? (
        <EventSitePackagesContent categoryLabels={packageCategoryLabels} scrollToKey={packagesScrollKey} ctaColor={ctaColor} btn={btn} />
      ) : (
        sectionOrder.map(id => {
          const node = sectionsById[id]
          return node ? <Fragment key={id}>{node}</Fragment> : null
        })
      )}
      {import.meta.env.DEV && ctxMenu && pageEl && (
        <EventSiteContextMenu
          menu={ctxMenu}
          pageEl={pageEl}
          canEditButtons={isPremium && hasSavedStyle}
          canEditElements={isPremium && hasSavedStyle}
          blockedReason={
            !isPremium
              ? 'Custom colors need a premium plan.'
              : !hasSavedStyle
                ? 'Save a style in Website Design and Style first.'
                : 'The GolfStatus theme is fixed — switch the theme to Default to edit elements.'
          }
          mode={themeMode}
          tint={tint}
          siteStyle={siteStyle}
          onChangeStyle={updateSiteStyle}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  )
}
