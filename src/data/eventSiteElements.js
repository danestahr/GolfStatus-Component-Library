// What the /event-site right-click menu (pages/event-site/
// EventSiteContextMenu.jsx) needs to know about the page: which DOM node
// belongs to which Site Colors element, and which roles an element can be
// pointed at.

import { THEME_ROLES, rolePart } from './eventSiteThemeRoles.js'

// Every designation an element can be assigned — exactly Theme.js's
// `defaultTheme` keys (see eventSiteThemeRoles.js). `cssVar` is the live
// `--gs-color-*` variable of the designation's fill (or its only color) and
// `textCssVar` its text color, when it has one — the right-click menu shows
// both so a pair reads as a pair.
export const ELEMENT_ROLES = THEME_ROLES.map(role => ({
  key: role.key,
  label: role.label,
  cssVar: rolePart(role.key, 'background').cssVar,
  textCssVar: role.parts.some(p => p.part === 'text') ? rolePart(role.key, 'text').cssVar : null,
}))

// What one named element is on the page. `kind` says which of a
// designation's colors it takes: 'background' (a fill), 'text' (text/icons)
// or 'border'. Elements that share a `component` are ONE thing with a
// background and text (the header bar and its logo/title/icons, a text
// field and its text, ...): assigning a designation to the component writes
// it to every part, and each part reads the color that matches its own kind
// — so the pair always switches together. The component is labelled by its
// first part's `componentLabel`; `key` matches EventWebsitePage.jsx's
// `--es-el-*` custom property exactly (camelCase -> kebab-case).
export const ELEMENT_DEFS = [
  // The page-wide defaults every other element either reads directly
  // (nothing below overrides it) or falls back to once its own element
  // override is cleared.
  { key: 'pageBackground', label: 'Page Background', section: 'Sitewide', baseRoleKey: 'background', kind: 'background', component: 'page', componentLabel: 'Page' },
  { key: 'pageTextDefault', label: 'Page Text Default', section: 'Sitewide', baseRoleKey: 'background', kind: 'text', component: 'page' },
  { key: 'sectionBoxBackground', label: 'Section Content Box Background', section: 'Sitewide', baseRoleKey: 'surfaceContainerHigh', kind: 'background', component: 'sectionBox', componentLabel: 'Section Content Box' },
  { key: 'sectionBoxText', label: 'Section Content Box Text (default)', section: 'Sitewide', baseRoleKey: 'surfaceContainerHigh', kind: 'text', component: 'sectionBox' },
  { key: 'sectionBottomBorder', label: 'Section Bottom Border', section: 'Sitewide', baseRoleKey: 'outlineVariant', kind: 'border' },

  { key: 'headerBackground', label: 'Header Background', section: 'Header', baseRoleKey: 'primaryContainer', kind: 'background', component: 'header', componentLabel: 'Header Bar (background, logo, event name, icons)' },
  { key: 'headerIcon', label: 'Icon (Logo)', section: 'Header', baseRoleKey: 'primaryContainer', kind: 'text', component: 'header' },
  { key: 'headerEventName', label: 'Event Name', section: 'Header', baseRoleKey: 'primaryContainer', kind: 'text', component: 'header' },
  { key: 'headerActionIcons', label: 'Action Icons (cart, theme toggle)', section: 'Header', baseRoleKey: 'primaryContainer', kind: 'text', component: 'header' },
  { key: 'mobileMenuIcon', label: 'Mobile Menu Icon', section: 'Header', baseRoleKey: 'primary', kind: 'text' },
  { key: 'menuBackground', label: 'Menu Background', section: 'Header', baseRoleKey: 'menuContainer', kind: 'background', component: 'menu', componentLabel: 'Menu Container (background + text)' },
  { key: 'menuText', label: 'Menu Text', section: 'Header', baseRoleKey: 'menuContainer', kind: 'text', component: 'menu' },
  { key: 'avatarBackground', label: 'Avatar Placeholder Fill', section: 'Header', baseRoleKey: 'outlineVariant', kind: 'background' },
  { key: 'avatarBorder', label: 'Avatar Border', section: 'Header', baseRoleKey: 'outlineVariant', kind: 'border' },
  { key: 'subnavBackground', label: 'Sub-nav Background', section: 'Header', baseRoleKey: 'background', kind: 'background' },
  { key: 'subnavBorder', label: 'Sub-nav Border', section: 'Header', baseRoleKey: 'outlineVariant', kind: 'border' },

  { key: 'tournamentEventName', label: 'Event Name', section: 'Tournament Details', baseRoleKey: 'surface', kind: 'text' },
  { key: 'tournamentDate', label: 'Date Range', section: 'Tournament Details', baseRoleKey: 'surface', kind: 'text' },
  { key: 'tournamentLocation', label: 'Facility / Location', section: 'Tournament Details', baseRoleKey: 'surface', kind: 'text' },
  { key: 'sidebarBorder', label: 'Sidebar Card Border', section: 'Tournament Details', baseRoleKey: 'outlineVariant', kind: 'border' },

  { key: 'sectionTitle', label: 'Section Title', section: 'Sections (all)', baseRoleKey: 'background', kind: 'text' },
  { key: 'sectionDescription', label: 'Section Description / Body Copy', section: 'Sections (all)', baseRoleKey: 'background', kind: 'text' },

  { key: 'arrowTileBackground', label: 'Tile Background', section: 'Packages & Additional Pages', baseRoleKey: 'surfaceBright', kind: 'background', component: 'arrowTile', componentLabel: 'Tile (background, icon, label, arrow)' },
  { key: 'packageTileIcon', label: 'Package Tile Icon', section: 'Packages & Additional Pages', baseRoleKey: 'surfaceBright', kind: 'text', component: 'arrowTile' },
  { key: 'arrowTileLabel', label: 'Tile Label', section: 'Packages & Additional Pages', baseRoleKey: 'surfaceBright', kind: 'text', component: 'arrowTile' },
  { key: 'additionalPagesSub', label: 'Additional Pages Sub-label', section: 'Packages & Additional Pages', baseRoleKey: 'surfaceBright', kind: 'text', component: 'arrowTile' },
  { key: 'arrowTileArrow', label: 'Tile Arrow Icon', section: 'Packages & Additional Pages', baseRoleKey: 'surfaceBright', kind: 'text', component: 'arrowTile' },

  { key: 'packageTileBorder', label: 'Tile Border (Packages page)', section: 'Packages & Additional Pages', baseRoleKey: 'outlineVariant', kind: 'border' },
  { key: 'packagesCardText', label: 'Package Card Text (Packages page)', section: 'Packages & Additional Pages', baseRoleKey: 'surface', kind: 'text' },

  { key: 'soldOutBadgeBackground', label: 'Sold Out Badge Background', section: 'Packages & Additional Pages', baseRoleKey: 'primaryContainer', kind: 'background', component: 'soldOutBadge', componentLabel: 'Sold Out Badge' },
  { key: 'soldOutBadgeText', label: 'Sold Out Badge Text', section: 'Packages & Additional Pages', baseRoleKey: 'primaryContainer', kind: 'text', component: 'soldOutBadge' },

  { key: 'cartItemBackground', label: 'Cart Item Background (suggestions, quantity, forms)', section: 'Cart', baseRoleKey: 'surfaceBright', kind: 'background' },
  { key: 'cartFormIncompleteBorder', label: 'Incomplete Form Border', section: 'Cart', baseRoleKey: 'outline', kind: 'border' },
  { key: 'cartFooterBackground', label: 'Next Step Footer Background', section: 'Cart', baseRoleKey: 'background', kind: 'background', component: 'cartFooter', componentLabel: 'Next Step Footer' },
  { key: 'cartFooterText', label: 'Next Step Footer Text', section: 'Cart', baseRoleKey: 'background', kind: 'text', component: 'cartFooter' },
  { key: 'cartFooterBorder', label: 'Next Step Footer Border', section: 'Cart', baseRoleKey: 'outlineVariant', kind: 'border' },

  { key: 'slideOutBackground', label: 'Slide Out Background', section: 'Slide Outs', baseRoleKey: 'background', kind: 'background', component: 'slideOut', componentLabel: 'Slide Out' },
  { key: 'slideOutText', label: 'Slide Out Text', section: 'Slide Outs', baseRoleKey: 'background', kind: 'text', component: 'slideOut' },
  { key: 'slideOutNavBackground', label: 'Slide Out Nav Background', section: 'Slide Outs', baseRoleKey: 'background', kind: 'background' },
  { key: 'slideOutBorder', label: 'Slide Out Dividers', section: 'Slide Outs', baseRoleKey: 'outlineVariant', kind: 'border' },
  { key: 'slideOutFieldBorder', label: 'Text Field Border', section: 'Slide Outs', baseRoleKey: 'outline', kind: 'border' },

  { key: 'formSectionBackground', label: 'Form Section Background', section: 'Forms', baseRoleKey: 'background', kind: 'background' },
  { key: 'formSectionBorder', label: 'Form Section Border', section: 'Forms', baseRoleKey: 'outlineVariant', kind: 'border' },
  { key: 'textFieldBackground', label: 'Text Field Background', section: 'Forms', baseRoleKey: 'background', kind: 'background', component: 'textField', componentLabel: 'Text Field' },
  { key: 'textFieldText', label: 'Text Field Text', section: 'Forms', baseRoleKey: 'background', kind: 'text', component: 'textField' },
  { key: 'textAreaBackground', label: 'Text Area Background', section: 'Forms', baseRoleKey: 'background', kind: 'background', component: 'textArea', componentLabel: 'Text Area' },
  { key: 'textAreaText', label: 'Text Area Text', section: 'Forms', baseRoleKey: 'background', kind: 'text', component: 'textArea' },
  { key: 'textAreaBorder', label: 'Text Area Border', section: 'Forms', baseRoleKey: 'outline', kind: 'border' },
  { key: 'dropdownBackground', label: 'Dropdown Background', section: 'Forms', baseRoleKey: 'surfaceBright', kind: 'background', component: 'dropdown', componentLabel: 'Dropdown' },
  { key: 'dropdownText', label: 'Dropdown Text', section: 'Forms', baseRoleKey: 'surfaceBright', kind: 'text', component: 'dropdown' },
  { key: 'dropdownBorder', label: 'Dropdown Border', section: 'Forms', baseRoleKey: 'outline', kind: 'border' },
  { key: 'toggleOnTrack', label: 'Toggle On Track', section: 'Forms', baseRoleKey: 'primaryContainer', kind: 'background', component: 'toggleOn', componentLabel: 'Toggle (on track + knob)' },
  { key: 'toggleKnob', label: 'Toggle Knob', section: 'Forms', baseRoleKey: 'primaryContainer', kind: 'text', component: 'toggleOn' },
  { key: 'toggleOffTrack', label: 'Toggle Off Track', section: 'Forms', baseRoleKey: 'outline', kind: 'background' },
  { key: 'fileUploadBackground', label: 'File Upload Background', section: 'Forms', baseRoleKey: 'background', kind: 'background', component: 'fileUpload', componentLabel: 'File Upload' },
  { key: 'fileUploadText', label: 'File Upload Text', section: 'Forms', baseRoleKey: 'background', kind: 'text', component: 'fileUpload' },
  { key: 'fileUploadBorder', label: 'File Upload Border', section: 'Forms', baseRoleKey: 'outlineVariant', kind: 'border' },

  { key: 'sponsorTierHeader', label: 'Tier Header', section: 'Sponsors', baseRoleKey: 'surface', kind: 'text' },
  { key: 'sponsorTileName', label: 'Sponsor Tile Name', section: 'Sponsors', baseRoleKey: 'surface', kind: 'text' },
  { key: 'registrantTileBackground', label: 'Registrant Tile Background', section: 'Sponsors', baseRoleKey: 'surfaceBright', kind: 'background' },
  { key: 'sponsorFeatureName', label: 'Feature Sponsor Name', section: 'Sponsors', baseRoleKey: 'surface', kind: 'text' },
  { key: 'sponsorFeatureDescription', label: 'Feature Sponsor Description', section: 'Sponsors', baseRoleKey: 'surface', kind: 'text' },

  { key: 'videoFrameBorder', label: 'Video Frame Border', section: 'Media', baseRoleKey: 'outlineVariant', kind: 'border' },
  { key: 'imageFrameBorder', label: 'Image Frame Border (photos, sponsor logos)', section: 'Media', baseRoleKey: 'outlineVariant', kind: 'border' },

  { key: 'donationGoalLabel', label: 'Goal Label', section: 'Donation', baseRoleKey: 'surface', kind: 'text' },
  { key: 'donationProgressBorder', label: 'Progress Bar Border', section: 'Donation', baseRoleKey: 'outlineVariant', kind: 'border' },
  { key: 'donationProgressTrack', label: 'Progress Bar Track', section: 'Donation', baseRoleKey: 'surfaceContainerHigest', kind: 'background' },
  { key: 'donationProgressText', label: 'Progress Bar Percentage', section: 'Donation', baseRoleKey: 'surface', kind: 'text' },
  { key: 'donationTileBackground', label: 'Amount Tile Background', section: 'Donation', baseRoleKey: 'surfaceBright', kind: 'background', component: 'donationTile', componentLabel: 'Amount Tile' },
  { key: 'donationTileText', label: 'Amount Tile Text', section: 'Donation', baseRoleKey: 'surfaceBright', kind: 'text', component: 'donationTile' },
  { key: 'donationProgressFill', label: 'Progress Bar Fill', section: 'Donation', baseRoleKey: 'secondaryContainer', kind: 'background' },

  { key: 'liveScoringBodyText', label: 'Body Text', section: 'Live Scoring', baseRoleKey: 'surface', kind: 'text' },
]

export const ELEMENT_DEFS_BY_KEY = Object.fromEntries(ELEMENT_DEFS.map(def => [def.key, def]))

// ELEMENT_DEFS folded into the things you actually assign: a `component`
// (every part of it, one designation) or a lone element. Same order and
// section grouping as ELEMENT_DEFS; the first part's label/base role name it.
export const ELEMENT_COMPONENTS = ELEMENT_DEFS.reduce((list, def) => {
  const id = def.component ?? def.key
  const existing = list.find(c => c.key === id)
  if (existing) existing.defs.push(def)
  else list.push({ key: id, label: def.componentLabel ?? def.label, section: def.section, baseRoleKey: def.baseRoleKey, defs: [def] })
  return list
}, [])

export const ELEMENT_COMPONENT_BY_ELEMENT = Object.fromEntries(
  ELEMENT_COMPONENTS.flatMap(component => component.defs.map(def => [def.key, component]))
)

// `--es-el-*` custom property an element's own override is written to —
// mechanical camelCase -> kebab-case of its key, which EventWebsitePage.scss
// and friends read as `var(--es-el-*, <the element's default designation>)`.
const camelToKebab = str => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
export const elementCssVar = key => `--es-el-${camelToKebab(key)}`

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
  menuBackground: ['.es-menu-panel'],
  menuText: ['.es-menu-panel'],
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
  registrantTileBackground: ['.es-registrant-tile'],
  sponsorFeatureName: ['.es-sponsor-feature-name'],
  sponsorFeatureDescription: ['.es-sponsor-feature-description'],
  donationProgressTrack: ['.es-donation-body gs-progress-bar'],
  donationProgressBorder: ['.es-donation-body gs-progress-bar'],
  donationProgressText: ['.es-donation-body gs-progress-bar .percentage-value'],
  donationProgressFill: ['.es-donation-body gs-progress-bar'],
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
  slideOutFieldBorder: ['.es-slide-out-field input:not([type="file"])'],
  formSectionBackground: ['.es-slide-out-group'],
  formSectionBorder: ['.es-slide-out-group'],
  textFieldBackground: ['.es-slide-out-field input:not([type="file"])'],
  textFieldText: ['.es-slide-out-field input:not([type="file"])'],
  textAreaBackground: ['.es-slide-out-field textarea'],
  textAreaText: ['.es-slide-out-field textarea'],
  textAreaBorder: ['.es-slide-out-field textarea'],
  dropdownBackground: ['.es-slide-out-select'],
  dropdownText: ['.es-slide-out-select'],
  dropdownBorder: ['.es-slide-out-select'],
  toggleOnTrack: ['.es-slide-out gs-toggle'],
  toggleOffTrack: ['.es-slide-out gs-toggle'],
  toggleKnob: ['.es-slide-out gs-toggle'],
  fileUploadBackground: ['.es-slide-out-upload'],
  fileUploadBorder: ['.es-slide-out-upload'],
  fileUploadText: ['.es-slide-out-upload'],
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

// { id, color, appearance } for a named Grey/Primary/Secondary Fill/Outline/
// Subtle/Transparent GSButton (gs-button.jsx's `data-button-id` and
// `color-*`/`style-*` classes), or null for any other node — including
// buttons that don't carry those (the header icons and donation tiles, which
// are elements instead, and the sub-nav tabs).
export function buttonVariantAt(node) {
  const button = node.closest('gs-button[data-button-id]')
  if (!button) return null
  const color = ['primary', 'secondary', 'neutral', 'error'].find(c => button.classList.contains(`color-${c}-color`))
  const appearance = ['fill', 'outline', 'subtle', 'transparent'].find(a => button.classList.contains(`style-${a}`))
  return color && appearance ? { id: button.dataset.buttonId, color, appearance } : null
}
