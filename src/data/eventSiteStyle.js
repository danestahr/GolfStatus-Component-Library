import { grey500 } from '../gs-lib/helpers/Theme'

// Theme.js's own green500 ("#FFAB22") and green300 ("#FFC54C") are actually
// orange — confirmed against the design team's Figma export, which gives
// green500 as "#59C56F" instead. Using the real Theme.js green500 here
// would make the Secondary scale render orange, so this stands in as the
// default (the confirmed Figma value) until Theme.js itself is fixed.
export const GREEN_500_FALLBACK = '#59C56F'

export const DEFAULT_EVENT_SITE_STYLE = {
  primaryColor: grey500,
  secondaryColor: GREEN_500_FALLBACK,
  // Which scale the Neutral section's white-to-black reference ramp is
  // tinted with — 'neutral' (the app's own fixed grey), 'primary', or
  // 'secondary' (WebsiteDesignStyleFields.jsx's NeutralSection). Read by
  // EventWebsitePage.jsx to decide both whether its own Monochromatic
  // toggle starts on and which scale it substitutes into the Neutral
  // theme roles.
  neutralTint: 'neutral',
  // Per-swatch riffs typed into the GolfStatus (default) theme's Theme
  // Definitions row (WebsiteDesignStyleFields.jsx's wds-swatch-hex-input) —
  // keyed by "mode-monochromatic-role" (e.g. "dark-true-background"), each
  // a { family, step, label } symbolic reference (see monochromatic.js's
  // resolveOverrideHex) rather than a frozen hex, so a "Primary 700"
  // override keeps tracking primaryColor below if it's edited again later.
  // Only the default theme's roles are ever keyed here — any other preset
  // isn't derived from this style, so its own Theme Definitions edits
  // stay local-preview-only, never saved here.
  themeOverrides: {
    'dark-full-onBackground': { family: 'white' },
    'dark-full-onSurface': { family: 'secondary', step: 50 },
    'dark-full-outline': { family: 'secondary', step: 800 },
    'dark-full-outlineVariant': { family: 'primary', step: 800 },
    'dark-full-surfaceContainerHigh': { family: 'secondary', step: 800 },
    'dark-golfstatus-surface': { family: 'grey', step: 800 },
    'dark-neutral-onBackground': { family: 'white' },
    'dark-neutral-onSurface': { family: 'white' },
    'dark-neutral-onSurfaceVariant': { family: 'white' },
    'dark-neutral-outline': { family: 'grey', step: 800 },
    'dark-neutral-surfaceContainerLow': { family: 'grey', step: 800 },
    'dark-primary-onBackground': { family: 'white' },
    'dark-primary-onSurfaceVariant': { family: 'white' },
    'dark-primary-outline': { family: 'primary', step: 800 },
    'dark-primary-outlineVariant': { family: 'primary', step: 700 },
    'dark-primary-surfaceContainerHigh': { family: 'primary', step: 500 },
    'light-full-onSurface': { family: 'secondary', step: 800 },
    'light-full-outline': { family: 'secondary', step: 100 },
    'light-full-surfaceContainerHigh': { family: 'secondary', step: 50 },
    'light-full-surfaceContainerLow': { family: 'white' },
    'light-golfstatus-outline': { family: 'grey', step: 800 },
    'light-golfstatus-surface': { family: 'grey', step: 50 },
    'light-neutral-onBackground': { family: 'grey', step: 800 },
    'light-neutral-onSurface': { family: 'grey', step: 800 },
    'light-neutral-onSurfaceVariant': { family: 'grey', step: 800 },
    'light-neutral-outline': { family: 'grey', step: 200 },
    'light-neutral-surface': { family: 'grey', step: 50 },
    'light-primary-onSurfaceVariant': { family: 'white' },
    'light-primary-outline': { family: 'primary', step: 100 },
    'light-primary-outlineVariant': { family: 'primary', step: 300 },
    'light-primary-surface': { family: 'primary', step: 100 },
    'light-primary-surfaceContainerHigest': { family: 'primary', step: 800 },
    'light-primary-surfaceContainerHigh': { family: 'primary', step: 400 },
    'light-primary-surfaceContainerLow': { family: 'white' },
    'light-primary-surfaceVariant': { family: 'primary', step: 700 },
  },
  // Per-element riffs typed into Color Exploration's own Site Colors tab
  // (ColorExplorationFields.jsx's ELEMENT_DEFS) — one specific element (the
  // header logo, a section title, a sponsor tile name, ...) pointed at a
  // different role than the one it reads by default, independent of every
  // other element sharing that same role. Keyed by "mode-elementKey" (e.g.
  // "dark-headerIcon"), each a { family, step } symbolic reference just
  // like themeOverrides above, resolved by EventWebsitePage.jsx's own
  // ELEMENT_TO_CSS_VAR into a `--es-el-*` custom property that wins over
  // that element's normal `--gs-color-*` fallback.
  elementOverrides: {
    'dark-full-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'dark-full-arrowTileLabel': { role: 'onSurfaceVariant' },
    'dark-full-donationGoalLabel': { role: 'onSurfaceVariant' },
    'dark-full-donationProgressTrack': { role: 'surface' },
    'dark-full-donationTileBackground': { role: 'surfaceContainerHigest' },
    'dark-full-donationTileText': { role: 'onSurfaceVariant' },
    'dark-full-imageFrameBorder': { role: 'outline' },
    'dark-full-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'dark-full-packageTileBorder': { role: 'surfaceContainerHigh' },
    'dark-full-packageTileIcon': { role: 'onSurfaceVariant' },
    'dark-full-packagesCardText': { role: 'onSurfaceVariant' },
    'dark-full-sectionBottomBorder': { role: 'outline' },
    'dark-full-sectionBoxBackground': { role: 'surfaceVariant' },
    'dark-full-sectionBoxText': { role: 'onSurfaceVariant' },
    'dark-full-sidebarBorder': { role: 'outline' },
    'dark-full-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'dark-full-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'dark-full-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'dark-full-sponsorTileName': { role: 'onSurfaceVariant' },
    'dark-full-subnavBorder': { role: 'outline' },
    'dark-full-tournamentDate': { role: 'onSurfaceVariant' },
    'dark-full-tournamentEventName': { role: 'onSurfaceVariant' },
    'dark-full-tournamentLocation': { role: 'onSurfaceVariant' },
    'dark-golfstatus-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'dark-golfstatus-arrowTileLabel': { role: 'onSurfaceVariant' },
    'dark-golfstatus-donationGoalLabel': { role: 'onSurfaceVariant' },
    'dark-golfstatus-donationProgressTrack': { role: 'surface' },
    'dark-golfstatus-donationTileBackground': { role: 'surfaceContainerHigest' },
    'dark-golfstatus-donationTileText': { role: 'onSurfaceVariant' },
    'dark-golfstatus-imageFrameBorder': { role: 'outline' },
    'dark-golfstatus-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'dark-golfstatus-packageTileBorder': { role: 'surfaceContainerHigh' },
    'dark-golfstatus-packageTileIcon': { role: 'onSurfaceVariant' },
    'dark-golfstatus-packagesCardText': { role: 'onSurfaceVariant' },
    'dark-golfstatus-sectionBottomBorder': { role: 'outline' },
    'dark-golfstatus-sectionBoxBackground': { role: 'surfaceVariant' },
    'dark-golfstatus-sectionBoxText': { role: 'onSurfaceVariant' },
    'dark-golfstatus-sidebarBorder': { role: 'outline' },
    'dark-golfstatus-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'dark-golfstatus-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'dark-golfstatus-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'dark-golfstatus-sponsorTileName': { role: 'onSurfaceVariant' },
    'dark-golfstatus-subnavBorder': { role: 'outline' },
    'dark-golfstatus-tournamentDate': { role: 'onSurfaceVariant' },
    'dark-golfstatus-tournamentEventName': { role: 'onSurfaceVariant' },
    'dark-golfstatus-tournamentLocation': { role: 'onSurfaceVariant' },
    'dark-neutral-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'dark-neutral-arrowTileLabel': { role: 'onSurfaceVariant' },
    'dark-neutral-donationGoalLabel': { role: 'onSurfaceVariant' },
    'dark-neutral-donationProgressTrack': { role: 'surface' },
    'dark-neutral-donationTileBackground': { role: 'surfaceContainerHigest' },
    'dark-neutral-donationTileText': { role: 'onSurfaceVariant' },
    'dark-neutral-imageFrameBorder': { role: 'outline' },
    'dark-neutral-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'dark-neutral-packageTileBorder': { role: 'surfaceContainerHigh' },
    'dark-neutral-packageTileIcon': { role: 'onSurfaceVariant' },
    'dark-neutral-packagesCardText': { role: 'onSurfaceVariant' },
    'dark-neutral-sectionBottomBorder': { role: 'outline' },
    'dark-neutral-sectionBoxBackground': { role: 'surfaceVariant' },
    'dark-neutral-sectionBoxText': { role: 'onSurfaceVariant' },
    'dark-neutral-sidebarBorder': { role: 'outline' },
    'dark-neutral-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'dark-neutral-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'dark-neutral-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'dark-neutral-sponsorTileName': { role: 'onSurfaceVariant' },
    'dark-neutral-subnavBorder': { role: 'outline' },
    'dark-neutral-tournamentDate': { role: 'onSurfaceVariant' },
    'dark-neutral-tournamentEventName': { role: 'onSurfaceVariant' },
    'dark-neutral-tournamentLocation': { role: 'onSurfaceVariant' },
    'dark-primary-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'dark-primary-arrowTileLabel': { role: 'onSurfaceVariant' },
    'dark-primary-donationGoalLabel': { role: 'onSurfaceVariant' },
    'dark-primary-donationProgressTrack': { role: 'surface' },
    'dark-primary-donationTileBackground': { role: 'surfaceContainerHigest' },
    'dark-primary-donationTileText': { role: 'onSurfaceVariant' },
    'dark-primary-imageFrameBorder': { role: 'outline' },
    'dark-primary-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'dark-primary-packageTileBorder': { role: 'surfaceContainerHigh' },
    'dark-primary-packageTileIcon': { role: 'onSurfaceVariant' },
    'dark-primary-packagesCardText': { role: 'onSurfaceVariant' },
    'dark-primary-sectionBottomBorder': { role: 'outline' },
    'dark-primary-sectionBoxBackground': { role: 'surfaceVariant' },
    'dark-primary-sectionBoxText': { role: 'onSurfaceVariant' },
    'dark-primary-sidebarBorder': { role: 'outline' },
    'dark-primary-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'dark-primary-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'dark-primary-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'dark-primary-sponsorTileName': { role: 'onSurfaceVariant' },
    'dark-primary-subnavBorder': { role: 'outline' },
    'dark-primary-tournamentDate': { role: 'onSurfaceVariant' },
    'dark-primary-tournamentEventName': { role: 'onSurfaceVariant' },
    'dark-primary-tournamentLocation': { role: 'onSurfaceVariant' },
    'dark-secondary-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'dark-secondary-arrowTileLabel': { role: 'onSurfaceVariant' },
    'dark-secondary-donationGoalLabel': { role: 'onSurfaceVariant' },
    'dark-secondary-donationProgressTrack': { role: 'surface' },
    'dark-secondary-donationTileBackground': { role: 'surfaceContainerHigest' },
    'dark-secondary-donationTileText': { role: 'onSurfaceVariant' },
    'dark-secondary-imageFrameBorder': { role: 'outline' },
    'dark-secondary-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'dark-secondary-packageTileBorder': { role: 'surfaceContainerHigh' },
    'dark-secondary-packageTileIcon': { role: 'onSurfaceVariant' },
    'dark-secondary-packagesCardText': { role: 'onSurfaceVariant' },
    'dark-secondary-sectionBottomBorder': { role: 'outline' },
    'dark-secondary-sectionBoxBackground': { role: 'surfaceVariant' },
    'dark-secondary-sectionBoxText': { role: 'onSurfaceVariant' },
    'dark-secondary-sidebarBorder': { role: 'outline' },
    'dark-secondary-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'dark-secondary-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'dark-secondary-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'dark-secondary-sponsorTileName': { role: 'onSurfaceVariant' },
    'dark-secondary-subnavBorder': { role: 'outline' },
    'dark-secondary-tournamentDate': { role: 'onSurfaceVariant' },
    'dark-secondary-tournamentEventName': { role: 'onSurfaceVariant' },
    'dark-secondary-tournamentLocation': { role: 'onSurfaceVariant' },
    'light-full-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'light-full-arrowTileLabel': { role: 'onSurfaceVariant' },
    'light-full-donationGoalLabel': { role: 'onSurfaceVariant' },
    'light-full-donationProgressTrack': { role: 'surface' },
    'light-full-donationTileBackground': { role: 'surfaceContainerHigest' },
    'light-full-donationTileText': { role: 'onSurfaceVariant' },
    'light-full-imageFrameBorder': { role: 'outline' },
    'light-full-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'light-full-packageTileBorder': { role: 'surfaceContainerHigh' },
    'light-full-packageTileIcon': { role: 'onSurfaceVariant' },
    'light-full-packagesCardText': { role: 'onSurfaceVariant' },
    'light-full-sectionBottomBorder': { role: 'outline' },
    'light-full-sectionBoxBackground': { role: 'surfaceVariant' },
    'light-full-sectionBoxText': { role: 'onSurfaceVariant' },
    'light-full-sidebarBorder': { role: 'outline' },
    'light-full-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'light-full-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'light-full-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'light-full-sponsorTileName': { role: 'onSurfaceVariant' },
    'light-full-subnavBorder': { role: 'outline' },
    'light-full-tournamentDate': { role: 'onSurfaceVariant' },
    'light-full-tournamentEventName': { role: 'onSurfaceVariant' },
    'light-full-tournamentLocation': { role: 'onSurfaceVariant' },
    'light-golfstatus-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'light-golfstatus-arrowTileLabel': { role: 'onSurfaceVariant' },
    'light-golfstatus-donationGoalLabel': { role: 'onSurfaceVariant' },
    'light-golfstatus-donationProgressTrack': { role: 'surface' },
    'light-golfstatus-donationTileBackground': { role: 'surfaceContainerHigest' },
    'light-golfstatus-donationTileText': { role: 'onSurfaceVariant' },
    'light-golfstatus-imageFrameBorder': { role: 'outline' },
    'light-golfstatus-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'light-golfstatus-packageTileBorder': { role: 'surfaceContainerHigh' },
    'light-golfstatus-packageTileIcon': { role: 'onSurfaceVariant' },
    'light-golfstatus-packagesCardText': { role: 'onSurfaceVariant' },
    'light-golfstatus-sectionBottomBorder': { role: 'outline' },
    'light-golfstatus-sectionBoxBackground': { role: 'surfaceVariant' },
    'light-golfstatus-sectionBoxText': { role: 'onSurfaceVariant' },
    'light-golfstatus-sidebarBorder': { role: 'outline' },
    'light-golfstatus-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'light-golfstatus-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'light-golfstatus-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'light-golfstatus-sponsorTileName': { role: 'onSurfaceVariant' },
    'light-golfstatus-subnavBorder': { role: 'outline' },
    'light-golfstatus-tournamentDate': { role: 'onSurfaceVariant' },
    'light-golfstatus-tournamentEventName': { role: 'onSurfaceVariant' },
    'light-golfstatus-tournamentLocation': { role: 'onSurfaceVariant' },
    'light-neutral-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'light-neutral-arrowTileLabel': { role: 'onSurfaceVariant' },
    'light-neutral-donationGoalLabel': { role: 'onSurfaceVariant' },
    'light-neutral-donationProgressTrack': { role: 'surface' },
    'light-neutral-donationTileBackground': { role: 'surfaceContainerHigest' },
    'light-neutral-donationTileText': { role: 'onSurfaceVariant' },
    'light-neutral-imageFrameBorder': { role: 'outline' },
    'light-neutral-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'light-neutral-packageTileBorder': { role: 'surfaceContainerHigh' },
    'light-neutral-packageTileIcon': { role: 'onSurfaceVariant' },
    'light-neutral-packagesCardText': { role: 'onSurfaceVariant' },
    'light-neutral-sectionBottomBorder': { role: 'outline' },
    'light-neutral-sectionBoxBackground': { role: 'surfaceVariant' },
    'light-neutral-sectionBoxText': { role: 'onSurfaceVariant' },
    'light-neutral-sidebarBorder': { role: 'outline' },
    'light-neutral-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'light-neutral-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'light-neutral-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'light-neutral-sponsorTileName': { role: 'onSurfaceVariant' },
    'light-neutral-subnavBorder': { role: 'outline' },
    'light-neutral-tournamentDate': { role: 'onSurfaceVariant' },
    'light-neutral-tournamentEventName': { role: 'onSurfaceVariant' },
    'light-neutral-tournamentLocation': { role: 'onSurfaceVariant' },
    'light-primary-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'light-primary-arrowTileLabel': { role: 'onSurfaceVariant' },
    'light-primary-donationGoalLabel': { role: 'onSurfaceVariant' },
    'light-primary-donationProgressTrack': { role: 'surface' },
    'light-primary-donationTileBackground': { role: 'surfaceContainerHigest' },
    'light-primary-donationTileText': { role: 'onSurfaceVariant' },
    'light-primary-imageFrameBorder': { role: 'outline' },
    'light-primary-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'light-primary-packageTileBorder': { role: 'surfaceContainerHigh' },
    'light-primary-packageTileIcon': { role: 'onSurfaceVariant' },
    'light-primary-packagesCardText': { role: 'onSurfaceVariant' },
    'light-primary-sectionBottomBorder': { role: 'outline' },
    'light-primary-sectionBoxBackground': { role: 'surfaceVariant' },
    'light-primary-sectionBoxText': { role: 'onSurfaceVariant' },
    'light-primary-sidebarBorder': { role: 'outline' },
    'light-primary-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'light-primary-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'light-primary-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'light-primary-sponsorTileName': { role: 'onSurfaceVariant' },
    'light-primary-subnavBorder': { role: 'outline' },
    'light-primary-tournamentDate': { role: 'onSurfaceVariant' },
    'light-primary-tournamentEventName': { role: 'onSurfaceVariant' },
    'light-primary-tournamentLocation': { role: 'onSurfaceVariant' },
    'light-secondary-arrowTileBackground': { role: 'surfaceContainerHigest' },
    'light-secondary-arrowTileLabel': { role: 'onSurfaceVariant' },
    'light-secondary-donationGoalLabel': { role: 'onSurfaceVariant' },
    'light-secondary-donationProgressTrack': { role: 'surface' },
    'light-secondary-donationTileBackground': { role: 'surfaceContainerHigest' },
    'light-secondary-donationTileText': { role: 'onSurfaceVariant' },
    'light-secondary-imageFrameBorder': { role: 'outline' },
    'light-secondary-liveScoringBodyText': { role: 'onSurfaceVariant' },
    'light-secondary-packageTileBorder': { role: 'surfaceContainerHigh' },
    'light-secondary-packageTileIcon': { role: 'onSurfaceVariant' },
    'light-secondary-packagesCardText': { role: 'onSurfaceVariant' },
    'light-secondary-sectionBottomBorder': { role: 'outline' },
    'light-secondary-sectionBoxBackground': { role: 'surfaceVariant' },
    'light-secondary-sectionBoxText': { role: 'onSurfaceVariant' },
    'light-secondary-sidebarBorder': { role: 'outline' },
    'light-secondary-sponsorFeatureDescription': { role: 'onSurfaceVariant' },
    'light-secondary-sponsorFeatureName': { role: 'onSurfaceVariant' },
    'light-secondary-sponsorTierHeader': { role: 'onSurfaceVariant' },
    'light-secondary-sponsorTileName': { role: 'onSurfaceVariant' },
    'light-secondary-subnavBorder': { role: 'outline' },
    'light-secondary-tournamentDate': { role: 'onSurfaceVariant' },
    'light-secondary-tournamentEventName': { role: 'onSurfaceVariant' },
    'light-secondary-tournamentLocation': { role: 'onSurfaceVariant' },
  },
  // Per-button riffs typed into Color Exploration's Buttons tab — Fill/
  // Subtle background + text, Outline border + text, per Primary/Secondary,
  // per theme and mode. Keyed and resolved by data/eventSiteButtons.js.
  buttonOverrides: {
    'dark-golfstatus-primary-fill-bg': { family: 'white' },
    'dark-golfstatus-primary-fill-text': { family: 'black' },
    'dark-golfstatus-primary-outline-border': { family: 'white' },
    'dark-golfstatus-primary-outline-text': { family: 'white' },
    'dark-golfstatus-primary-subtle-bg': { family: 'grey', step: 800 },
    'dark-golfstatus-primary-subtle-text': { family: 'white' },
    'dark-golfstatus-secondary-fill-bg': { family: 'white' },
    'dark-golfstatus-secondary-fill-text': { family: 'grey', step: 800 },
    'dark-golfstatus-secondary-outline-border': { family: 'white' },
    'dark-golfstatus-secondary-outline-text': { family: 'white' },
    'dark-golfstatus-secondary-subtle-bg': { family: 'grey', step: 800 },
    'dark-golfstatus-secondary-subtle-text': { family: 'white' },
    'dark-golfstatus-secondary-transparent-text': { family: 'white' },
    'light-golfstatus-primary-fill-bg': { family: 'grey', step: 800 },
    'light-golfstatus-primary-fill-text': { family: 'white' },
    'light-golfstatus-primary-outline-border': { family: 'grey', step: 800 },
    'light-golfstatus-primary-outline-text': { family: 'grey', step: 800 },
    'light-golfstatus-primary-subtle-bg': { family: 'grey', step: 100 },
    'light-golfstatus-primary-subtle-text': { family: 'grey', step: 800 },
    'light-golfstatus-secondary-fill-bg': { family: 'grey', step: 800 },
    'light-golfstatus-secondary-fill-text': { family: 'white' },
    'light-golfstatus-secondary-outline-border': { family: 'grey', step: 800 },
    'light-golfstatus-secondary-outline-text': { family: 'grey', step: 800 },
    'light-golfstatus-secondary-subtle-bg': { family: 'grey', step: 100 },
    'light-golfstatus-secondary-subtle-text': { family: 'grey', step: 800 },
    'light-golfstatus-secondary-transparent-text': { family: 'grey', step: 800 },
  },
  // Which variant each named Event Website button uses, picked from the
  // right-click menu on /event-site — { [buttonId]: { color, appearance } }
  // (color 'primary-color' | 'secondary-color', appearance 'fill' |
  // 'outline' | 'subtle' | 'transparent'). A button with no entry keeps the
  // variant the page gives it by default. Ids: data/eventSiteButtons.js.
  buttonStyles: {
    'addToCart': { color: 'primary-color', appearance: 'subtle' },
    'donateNow': { color: 'primary-color', appearance: 'fill' },
    'getAccess': { color: 'primary-color', appearance: 'fill' },
    'makeDonation': { color: 'primary-color', appearance: 'subtle' },
    'registerNow': { color: 'primary-color', appearance: 'fill' },
    'sponsorWebsite': { color: 'primary-color', appearance: 'subtle' },
  },
}

// No backend for this prototype, so "Save" on the Website Design and Style
// screen (EventSitePackagesListPage.jsx) persists here instead — this is
// what lets a saved style survive navigating away to /event-site
// (EventWebsitePage.jsx), which reads it back on mount, and survive a
// page reload too.
const STORAGE_KEY = 'gs-event-site-style'

export function loadEventSiteStyle() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_EVENT_SITE_STYLE, ...JSON.parse(raw) } : DEFAULT_EVENT_SITE_STYLE
  } catch {
    return DEFAULT_EVENT_SITE_STYLE
  }
}

// Whether an admin has ever actually hit "Save" on the Website Design and
// Style screen — distinct from loadEventSiteStyle() above, which always
// hands back a usable style object (DEFAULT_EVENT_SITE_STYLE's own grey/
// green placeholder values when nothing's saved yet). EventWebsitePage.jsx
// reads this to decide whether /event-site should build its theme from
// that style at all: a tournament that's never been customized has no
// saved style to reflect, so it renders GolfStatus's own fixed brand
// colors (theme.scss's `.gs-theme-default`) instead of this placeholder
// starting point, exactly like a non-premium tournament already does (see
// `customThemeStyle`).
export function hasEventSiteStyle() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

// Fires whenever ANOTHER tab saves the style (the browser's `storage` event
// never fires in the tab that wrote it) — how /event-site's right-click menu
// and Color Exploration stay in sync when they're open side by side. The
// callback gets the freshly loaded style.
export function subscribeEventSiteStyle(callback) {
  const onStorage = e => {
    if (e.key === STORAGE_KEY) callback(loadEventSiteStyle())
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export function saveEventSiteStyle(style) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(style))
  } catch {
    // Prototype-only persistence — a full/unavailable localStorage just
    // means the style won't survive this session, not a real failure.
  }
}
