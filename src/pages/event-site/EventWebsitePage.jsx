import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShoppingCart,
  faBars,
  faArrowRight,
  faFlag,
  faUsers,
  faUser,
  faCreditCard,
  faMoon,
  faSun,
  faPalette,
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
import { defaultPadding, golfstatusColors } from '../../gs-lib/helpers/Theme'
import { generateScale } from '../../gs-lib/helpers/colorScale'
import { monochromatize, OUTLINE_VARIANT_MONO_STEP, resolveOverrideHex } from '../../gs-lib/helpers/monochromatic'
import { pickAccessibleTextColor } from '../../gs-lib/helpers/contrast'
import { formatMoney } from '../../components/orders/orderUtils'
import { eventSite } from '../../data/mockEventSite.js'
import { sponsors, SPONSOR_TIERS } from '../../data/mockSponsors.js'
import { loadEventSiteStyle } from '../../data/eventSiteStyle.js'
import { loadEventSitePreview, saveEventSitePreview } from '../../data/eventSitePreview.js'
import golfstatusLogo from '../../assets/GS_Logo.svg'
import avatarSample from '../../assets/avatar-sample.png'
import eventHero from '../../assets/event-hero.png'
import poweredByGolfstatus from '../../assets/powered-by-golfstatus.jpg'
import sponsorImagePending from '../../assets/sponsor-image-pending-2-1.jpg'
import photoTest from '../../assets/Photo_Test.gif'
import videoTest from '../../assets/Video_Test.mp4'
import golfstatusAppGif from '../../assets/GolfStatusApp.gif'
import appleDownload from '../../assets/AppleDownload.png'
import googleDownload from '../../assets/GoogleDownload.png'
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
// the bits this page still hand-styles (header/sub-nav/tiles) — that's the
// seam Winter and Lavender are built on (see the palette button in
// `.es-header-actions`, which cycles `themeName` through THEME_NAMES).
// gs-lib's own components theme themselves the way the real app already
// does, via a `.light`/`.dark` ancestor class (see the root div below),
// which is why that class is there alongside `.gs-theme-${themeName}`.
const SUB_NAV_ITEMS = ['Event Details', 'Packages', 'Sponsors', 'Registrants', 'Rounds', 'Leaderboards', 'Auction', 'Donate']

// Cycled by the header's palette button, in order. Each name maps to a
// `.gs-theme-${name}` class in gs-lib/styles/theme.scss.
const THEME_NAMES = ['default', 'winter', 'lavender']

const PACKAGE_CATEGORIES = [
  { label: 'Sponsorships', icon: faFlag },
  { label: 'Team Registrations', icon: faUsers },
  { label: 'Player Registrations', icon: faUser },
  { label: 'Add-Ons & Extras', icon: faCreditCard },
]

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
// without touching the left/right the component already set. Its
// background is also overridden inline at the call site (surface-container-
// highest instead of the page-wide `.section-body` surface-container-high
// rule in EventWebsitePage.scss) — just this one section, not every section
// body.
const TOURNAMENT_SECTION_BODY_PAD = defaultPadding.smallLayoutPad.apply('vertical')

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
  surface: '--gs-color-surface',
  surfaceBright: '--gs-color-surface-bright',
  surfaceContainerLow: '--gs-color-surface-container-low',
  surfaceContainerHigh: '--gs-color-surface-container-high',
  surfaceContainerHigest: '--gs-color-surface-container-highest',
  surfaceVariant: '--gs-color-surface-variant',
  outline: '--gs-color-outline',
  outlineVariant: '--gs-color-outline-variant',
  tertiaryContainer: '--gs-color-tertiary-container',
}

export default function EventWebsitePage() {
  const [activeTab, setActiveTab] = useState(SUB_NAV_ITEMS[0])
  // Read once on load — this prototype has no backend, so this is what
  // "reflects" a style saved from the Website Design and Style screen
  // (EventSitePackagesListPage.jsx via data/eventSiteStyle.js) here.
  const [siteStyle] = useState(loadEventSiteStyle)
  // This page's own header toggles (Light/Dark, the theme picker,
  // Monochromatic) — separate from siteStyle above, and persisted via
  // data/eventSitePreview.js so refreshing this page keeps whatever you
  // last had it previewing instead of resetting to Light/Default/Off.
  const [preview] = useState(loadEventSitePreview)
  const [themeMode, setThemeMode] = useState(preview.themeMode ?? 'light')
  const [themeName, setThemeName] = useState(preview.themeName ?? THEME_NAMES[0])
  // Seeded from the last-previewed value if there is one, else the saved
  // style — toggleable here too via the header's monochromatic button
  // (es-monochromatic-toggle below), same "Neutral roles substitute to a
  // step of the Primary scale" behavior Monochromatic Theme drives on the
  // Website Design and Style screen.
  const [monochromatic, setMonochromatic] = useState(preview.monochromatic ?? siteStyle.monochromatic)

  useEffect(() => {
    saveEventSitePreview({ themeMode, themeName, monochromatic })
  }, [themeMode, themeName, monochromatic])

  // Only the "default" theme is ever built from this saved style — Winter
  // and Lavender stay their own fixed presets (gs-lib/styles/theme.scss),
  // same as everywhere else this distinction has been made.
  const primaryScale = generateScale(siteStyle.primaryColor)
  const secondaryScale = generateScale(siteStyle.secondaryColor)

  // Subtle buttons sit a step lighter than the base color in light mode, a
  // step darker in dark mode (100/700); their text is pinned opposite —
  // 900 in light mode, 50 in dark mode — same "fixed step, not AA-picked"
  // convention as Fill's on-*-fill (step 50) below.
  const primarySubtleBg = primaryScale[themeMode === 'dark' ? 700 : 100]
  const secondarySubtleBg = secondaryScale[themeMode === 'dark' ? 700 : 100]

  // Fill/Outline's base color sits two steps lighter in dark mode (400 ->
  // 200) so it doesn't read as a flat, oversaturated block against a dark
  // background — same convention WebsiteDesignStyleFields.jsx's Button
  // Styles preview follows, so the two can't drift apart.
  const primaryBase = primaryScale[themeMode === 'dark' ? 200 : 400]
  const secondaryBase = secondaryScale[themeMode === 'dark' ? 200 : 400]

  const customThemeStyle = themeName !== 'default' ? undefined : {
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
    ...(monochromatic &&
      Object.fromEntries(
        Object.entries(DEFAULT_NEUTRAL_TOKENS[themeMode]).map(([token, hex]) => [
          token,
          // Pinned to a fixed step instead of monochromatize()'s usual
          // hex-based lookup — see OUTLINE_VARIANT_MONO_STEP's own comment
          // (monochromatic.js) for why Outline Variant needs a fixed step.
          token === '--gs-color-outline-variant' ? primaryScale[OUTLINE_VARIANT_MONO_STEP] : monochromatize(hex, primaryScale),
        ])
      )),
    // Per-swatch riffs saved from the Website Design and Style screen's
    // Theme Definitions row (see ROLE_TO_CSS_VAR above) — applied last so a
    // saved override always wins over both the plain and Monochromatic
    // values above, exactly like it does in that screen's own preview.
    ...Object.fromEntries(
      Object.entries(ROLE_TO_CSS_VAR)
        .map(([roleKey, cssVar]) => {
          const override = siteStyle.themeOverrides?.[`${themeMode}-${monochromatic}-${roleKey}`]
          const hex = resolveOverrideHex(override, { primaryScale, secondaryScale })
          return hex ? [cssVar, hex] : null
        })
        .filter(Boolean)
    ),
  }

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
            { type: 'headline-1', value: eventSite.tournamentName },
            { type: 'body-regular secondary', value: eventSite.dateRange },
            {
              type: 'body-regular secondary',
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

  return (
    <div className={`es-page gs-theme-${themeName} ${themeMode}`} style={customThemeStyle}>
      <header className="es-header">
        <div className="es-header-bar">
          <div className="es-brand-row">
            <div
              className="es-brand-logo"
              style={{ WebkitMaskImage: `url(${golfstatusLogo})`, maskImage: `url(${golfstatusLogo})` }}
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
            <div className="es-theme-picker">
              <GSButton
                buttonIcon={faPalette}
                isFocusable
                aria-label={`Switch color theme (current: ${themeName})`}
                onClick={() => setThemeName(name => THEME_NAMES[(THEME_NAMES.indexOf(name) + 1) % THEME_NAMES.length])}
              />
            </div>
            <div className="es-monochromatic-toggle">
              <GSButton
                buttonIcon={faCircleHalfStroke}
                isFocusable
                aria-label={`${monochromatic ? 'Disable' : 'Enable'} monochromatic theme`}
                onClick={() => setMonochromatic(value => !value)}
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
            pageActions={SUB_NAV_ITEMS.map(item => ({
              title: item,
              ...(item === activeTab
                ? { color: 'primary-color', appearance: 'subtle', size: 'secondary' }
                : { type: 'transparent secondary' }),
              isFocusable: true,
              onClick: () => setActiveTab(item),
            }))}
          />
        </nav>
      </header>

      <GSImage src={eventHero} style={{ width: '100%', height: 280, borderRadius: 0, border: 'none' }} />

      <GSPageSection
        bodyStyle={{ ...TOURNAMENT_SECTION_BODY_PAD, backgroundColor: 'var(--gs-color-surface-container-highest)' }}
        body={[
          <GSSplitView
            left={
              <div className="es-intro-main">
                <GSInfoGroup dataGroups={introInfo} />
                <div className="es-intro-actions">
                  <GSButton color="primary-color" appearance="fill" title="Register Now" isFocusable />
                  <GSButton color="secondary-color" appearance="outline" title="Make A Donation" isFocusable />
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

        <GSPageSection title="Event Description" description={eventSite.description} />

        <GSPageSection title="Additional Event Description" description={eventSite.additionalDescription} />

        <GSPageSection
          title="Registration Details"
          description={`Registration closes on ${eventSite.registrationCloseAt}.`}
        />

        <GSPageSection
          title="Packages"
          sectionActions={[{ title: 'View Packages', rightIcon: faArrowRight, color: 'primary-color', appearance: 'fill', isFocusable: true }]}
          body={[
            <GSItemList
              type="grid medium-large-gap es-package-tiles"
              style={{ width: '100%' }}
              items={PACKAGE_CATEGORIES}
              listItem={category => (
                <div className="es-arrow-tile" style={{ width: '100%' }} tabIndex={0}>
                  <FontAwesomeIcon icon={category.icon} className="es-arrow-tile-icon" />
                  <div className="es-arrow-tile-label">{category.label}</div>
                  <FontAwesomeIcon icon={faArrowRight} className="es-arrow-tile-arrow" />
                </div>
              )}
            />,
          ]}
        />

        <GSPageSection
          title="Sponsors"
          sectionActions={[{ title: 'View Sponsors', rightIcon: faArrowRight, color: 'primary-color', appearance: 'fill', isFocusable: true }]}
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
                              <GSButton color="primary-color" appearance="subtle" title="Sponsor Website" rightIcon={faExternalLinkSquare} isFocusable />
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
                          pageActions={[{ actionIcon: faExternalLinkSquare, color: 'primary-color', appearance: 'subtle', size: 'secondary', isFocusable: true }]}
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

        <GSPageSection
          title="Photos &amp; Video"
          body={[
            <GSImage src={photoTest} style={{ width: '100%', height: 'auto' }} />,
            <video className="es-video-frame" src={videoTest} controls style={{ width: '100%', height: 'auto' }} />,
          ]}
        />

        <GSPageSection
          title="Make a Donation"
          description="Help us drive real change in our community!"
          sectionActions={[{ title: 'Donate Now', rightIcon: faArrowRight, color: 'secondary-color', appearance: 'fill', isFocusable: true }]}
          body={[
            <div className="es-donation-body">
              <div className="es-donation-goal-label">
                <span className="es-donation-raised-amount">${formatMoney(eventSite.donationRaised)} Raised</span> of $
                {formatMoney(eventSite.donationGoal)} Donation Goal
              </div>
              <GSProgressBar
                value={eventSite.donationRaised}
                max={eventSite.donationGoal}
                trackStyle={{ background: 'linear-gradient(90deg, var(--gs-color-secondary-subtle), var(--gs-color-secondary))' }}
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

        <GSPageSection
          title="Additional Pages"
          body={[
            <GSItemList
              type="grid medium-large-gap es-additional-pages-tiles"
              style={{ width: '100%' }}
              items={ADDITIONAL_PAGES}
              listItem={page => arrowTile(page, 'View All')}
            />,
          ]}
        />

        <GSPageSection
          title="Live Scoring Powered by GolfStatus"
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
    </div>
  )
}
