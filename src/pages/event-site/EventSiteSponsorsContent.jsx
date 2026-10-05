import { useMemo } from 'react'
import { faArrowRight, faExternalLinkSquare } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSImage from '../../gs-lib/components/gs-image'
import GSItemList from '../../gs-lib/components/gs-item-list'
import GSSplitView from '../../gs-lib/components/gs-split-view'
import { formatMoney } from '../../components/orders/orderUtils'
import { sponsors, SPONSOR_TIERS } from '../../data/mockSponsors.js'
import { eventSitePackages } from '../../data/mockEventSitePackages.js'
import { loadSavedPackages } from '../../data/eventSitePackageCategories.js'
import sponsorImagePending from '../../assets/sponsor-image-pending-2-1.jpg'
import './EventSiteSponsorsContent.scss'

// The public Event Site's "Sponsors" page (Figma "Sponsors"). Reuses the
// Packages page's band/card/title classes and the homepage's sponsor tile
// classes so every Site Colors / button designation applies here too.
export default function EventSiteSponsorsContent({ description, ctaColor = 'primary-color', btn, onViewPackages }) {
  const tiers = SPONSOR_TIERS.map(tier => ({ tier, items: sponsors.filter(s => s.tier === tier) })).filter(g => g.items.length > 0)
  const available = useMemo(
    () => (loadSavedPackages() ?? eventSitePackages).filter(p => p.category === 'Sponsorship Package' && p.status === 'active'),
    []
  )

  return (
    <div className="es-packages es-sponsors-page">
      <div className="es-packages-band es-packages-title-band">
        <div className="es-packages-title-row">
          <h1 className="es-packages-title">Sponsors</h1>
        </div>
      </div>

      <div className="es-packages-band">
        <div className="es-packages-inner">
          <div className="es-packages-card es-packages-exclusive">
            <div>
              <div className="es-packages-card-title">Sponsor Registration</div>
              <div className="es-packages-card-sub">Check out all available registration packages for {description ?? 'this event'}.</div>
            </div>
            <GSButton title="View Packages" rightIcon={faArrowRight} {...btn('viewPackages', ctaColor, 'fill')} onClick={() => onViewPackages('sponsorship')} isFocusable />
          </div>
        </div>
      </div>

      {tiers.map(({ tier, items }) => (
        <section className="es-packages-band" key={tier}>
          <div className="es-packages-inner es-sponsor-tier">
            <h2 className="es-packages-section-title">{tier}</h2>
            <div className="es-packages-card es-sponsors-card">
              {tier === 'Technology Sponsor' ? (
                <GSSplitView
                  left={<GSImage ratio="wide" style={{ width: '100%', aspectRatio: '2 / 1' }} src={sponsorImagePending} alt={items[0].sponsorName} />}
                  right={
                    <div className="es-sponsor-feature-name-wrap">
                      <div className="es-sponsor-feature">
                        <div className="es-sponsor-feature-name">{items[0].sponsorName}</div>
                        <div className="es-sponsor-feature-body">
                          <GSButton title="Sponsor Website" rightIcon={faExternalLinkSquare} {...btn('sponsorWebsite', ctaColor, 'subtle')} size="secondary" isFocusable />
                        </div>
                      </div>
                    </div>
                  }
                />
              ) : (
                <SponsorGrid items={items} columns={3} ctaColor={ctaColor} btn={btn} />
              )}
            </div>
          </div>
        </section>
      ))}

      <section className="es-packages-band">
        <div className="es-packages-inner es-sponsor-tier">
          <h2 className="es-packages-section-title">All Sponsors</h2>
          <div className="es-packages-card es-sponsors-card">
            <SponsorGrid items={sponsors} columns={3} ctaColor={ctaColor} btn={btn} />
          </div>
        </div>
      </section>

      {available.length > 0 && (
        <section className="es-packages-band">
          <div className="es-packages-inner">
            <h2 className="es-packages-section-title">Available Sponsorships</h2>
            <div className="es-packages-card es-sponsors-available">
              {available.map(pkg => {
                const soldOut = pkg.remaining === 0
                return (
                  <div className="es-sponsors-package" key={pkg.id}>
                    <div>
                      <div className="es-package-name">{pkg.name}</div>
                      <div className="es-package-price">${formatMoney(pkg.price)}</div>
                      {pkg.remaining != null && !soldOut && <div className="es-package-available">{pkg.remaining} Available</div>}
                    </div>
                    {soldOut ? (
                      <span className="es-package-sold-out">Sold Out</span>
                    ) : (
                      <GSButton title="View" rightIcon={faArrowRight} {...btn('viewPackage', ctaColor, 'subtle')} size="secondary" onClick={() => onViewPackages('sponsorship')} isFocusable />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function SponsorGrid({ items, columns, ctaColor, btn }) {
  return (
    <GSItemList
      type="grid medium-large-gap"
      listStyle={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      items={items}
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
  )
}
