// What the /event-site right-click menu (pages/event-site/
// EventSiteContextMenu.jsx) needs to know about the page: which DOM node
// belongs to which Site Colors element, and which roles an element can be
// pointed at.

// Every role an element can be assigned — `cssVar` is the live
// `--gs-color-*` variable the page sets for it (EventWebsitePage.jsx). Same
// vocabulary as Color Exploration's Site Colors tab.
export const ELEMENT_ROLES = [
  { key: 'primary', label: 'Primary', cssVar: '--gs-color-primary' },
  { key: 'onPrimary', label: 'On Primary', cssVar: '--gs-color-on-primary' },
  { key: 'secondary', label: 'Secondary', cssVar: '--gs-color-secondary' },
  { key: 'onSecondary', label: 'On Secondary', cssVar: '--gs-color-on-secondary' },
  { key: 'background', label: 'Background', cssVar: '--gs-color-background' },
  { key: 'onBackground', label: 'On Background', cssVar: '--gs-color-on-background' },
  { key: 'surface', label: 'Surface', cssVar: '--gs-color-surface' },
  { key: 'onSurface', label: 'On Surface', cssVar: '--gs-color-on-surface' },
  { key: 'surfaceVariant', label: 'Surface Variant', cssVar: '--gs-color-surface-variant' },
  { key: 'onSurfaceVariant', label: 'On Surface Variant', cssVar: '--gs-color-on-surface-variant' },
  { key: 'surfaceContainerLow', label: 'Surface Container Low', cssVar: '--gs-color-surface-container-low' },
  { key: 'surfaceContainerHigh', label: 'Surface Container High', cssVar: '--gs-color-surface-container-high' },
  { key: 'surfaceContainerHigest', label: 'Surface Container Highest', cssVar: '--gs-color-surface-container-highest' },
  { key: 'surfaceBright', label: 'Surface Bright', cssVar: '--gs-color-surface-bright' },
  { key: 'outline', label: 'Outline', cssVar: '--gs-color-outline' },
  { key: 'outlineVariant', label: 'Outline Variant', cssVar: '--gs-color-outline-variant' },
]

// Element key (ColorExplorationFields.jsx's ELEMENT_DEFS) -> the selectors
// that element's `--es-el-*` variable is actually read by in
// EventWebsitePage.scss / EventSitePackagesContent.scss, fully resolved
// (compiled from the nested SCSS). A right-clicked node belongs to an
// element when it, or an ancestor, matches one of these.
export const ELEMENT_SELECTORS = {
  pageBackground: ['.es-page', '.es-page gs-page-section', '.es-packages-band', '.es-donate-band'],
  pageTextDefault: ['.es-page'],
  sectionBoxBackground: ['.es-page .section-body', '.es-packages-card', '.es-donate-card'],
  sectionBoxText: ['.es-page .section-body'],
  sectionBottomBorder: ['.es-page gs-page-section', '.es-packages-band', '.es-donate-band'],
  sectionTitle: [
    '.es-page gs-page-section > gs-action-bar.H2 h2',
    '.es-packages-title',
    '.es-packages-section-title',
    '.es-donate-title',
    '.es-donate-heading',
  ],
  sectionDescription: ['.es-page gs-page-section > .description'],
  imageFrameBorder: ['.es-page gs-image'],
  headerBackground: ['.es-header-bar'],
  headerEventName: ['.es-header-bar gs-app-navigation-header .nav-header-title'],
  headerIcon: ['.es-brand-logo'],
  headerActionIcons: [
    '.es-cart-button gs-button',
    '.es-theme-toggle gs-button',
    '.es-theme-picker gs-button',
  ],
  avatarBorder: ['.es-avatar'],
  avatarBackground: ['.es-avatar-image'],
  mobileMenuIcon: ['.es-menu-button gs-button'],
  subnavBackground: ['.es-subnav'],
  subnavBorder: ['.es-subnav'],
  tournamentEventName: ['.es-tournament-event-name'],
  tournamentDate: ['.es-tournament-date'],
  tournamentLocation: ['.es-tournament-location'],
  sidebarBorder: ['.es-sidebar-card'],
  liveScoringBodyText: ['.es-body-text'],
  arrowTileBackground: ['.es-arrow-tile', '.es-packages-start-tile'],
  packageTileIcon: ['.es-arrow-tile-icon', '.es-packages-start-tile svg'],
  arrowTileLabel: ['.es-arrow-tile-label', '.es-packages-start-tile'],
  additionalPagesSub: ['.es-arrow-tile-sub'],
  arrowTileArrow: ['.es-arrow-tile-arrow'],
  sponsorTierHeader: ['.es-sponsor-tier > gs-action-bar h3'],
  sponsorTileName: ['.es-sponsor-tile gs-action-bar h5'],
  sponsorFeatureName: ['.es-sponsor-feature-name'],
  sponsorFeatureDescription: ['.es-sponsor-feature-description'],
  donationProgressTrack: ['.es-donation-body gs-progress-bar'],
  donationProgressText: ['.es-donation-body gs-progress-bar .percentage-value'],
  donationGoalLabel: ['.es-donation-goal-label'],
  donationTileBackground: ['.es-donation-tile gs-button', '.es-donate-tile'],
  donationTileText: ['.es-donation-tile gs-button', '.es-donate-tile'],
  videoFrameBorder: ['.es-video-frame'],
  packagesCardText: ['.es-packages-card', '.es-donate-card'],
  packageTileBorder: ['.es-packages-start-tile'],
  soldOutBadgeBackground: ['.es-package-sold-out'],
  soldOutBadgeText: ['.es-package-sold-out'],
  cartItemBackground: ['.es-cart-suggestion', '.es-cart-qty', '.es-cart-form', '.es-sponsors-package'],
  cartFormIncompleteBorder: ['.es-cart-form.incomplete'],
  cartFooterBackground: ['.es-cart-footer'],
  cartFooterText: ['.es-cart-footer'],
  cartFooterBorder: ['.es-cart-footer'],
  slideOutBackground: ['.es-slide-out', '.es-slide-out-footer'],
  slideOutText: ['.es-slide-out'],
  slideOutNavBackground: ['.es-slide-out > gs-side-panel-navigation'],
  slideOutBorder: ['.es-slide-out-heading', '.es-slide-out-footer'],
  slideOutFieldBorder: ['.es-slide-out-field input'],
}

// Every theme slot an element assignment is written to — Site Colors keeps
// one shared assignment across all of them (setElementAssignment), plus
// 'secondary' since the page's own tint can be that too.
export const ELEMENT_OVERRIDE_THEMES = ['neutral', 'neutral-two-tone', 'primary', 'secondary', 'full', 'golfstatus']

const depthOf = node => {
  let depth = 0
  for (let n = node; n; n = n.parentElement) depth++
  return depth
}

// The element keys a right-clicked node belongs to, deepest matched node
// first (a tile's label before the tile's own background before the page
// itself), so the first entry is the most specific thing under the cursor.
export function elementKeysAt(node, validKeys) {
  const hits = []
  Object.entries(ELEMENT_SELECTORS).forEach(([key, selectors]) => {
    if (validKeys && !validKeys.has(key)) return
    let deepest = null
    selectors.forEach(selector => {
      const match = node.closest(selector)
      if (match && (!deepest || depthOf(match) > depthOf(deepest))) deepest = match
    })
    if (deepest) hits.push({ key, depth: depthOf(deepest) })
  })
  return hits.sort((a, b) => b.depth - a.depth).map(hit => hit.key)
}

// { id, color, appearance } for a named Primary/Secondary Fill/Outline/
// Subtle/Transparent GSButton (gs-button.jsx's `data-button-id` and
// `color-*`/`style-*` classes), or null for any other node — including
// buttons that don't carry those (the header icons and donation tiles, which
// are elements instead, and the sub-nav tabs).
export function buttonVariantAt(node) {
  const button = node.closest('gs-button[data-button-id]')
  if (!button) return null
  const color = ['primary', 'secondary'].find(c => button.classList.contains(`color-${c}-color`))
  const appearance = ['fill', 'outline', 'subtle', 'transparent'].find(a => button.classList.contains(`style-${a}`))
  return color && appearance ? { id: button.dataset.buttonId, color, appearance } : null
}
