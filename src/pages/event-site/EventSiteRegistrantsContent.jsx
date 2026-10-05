import { useMemo } from 'react'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import { formatMoney } from '../../components/orders/orderUtils'
import { registeredTeams, unassignedPlayers } from '../../data/mockTeams.js'
import { eventSitePackages } from '../../data/mockEventSitePackages.js'
import { loadSavedPackages } from '../../data/eventSitePackageCategories.js'
import avatarSample from '../../assets/avatar-sample.png'
import './EventSiteSponsorsContent.scss'
import './EventSiteRegistrantsContent.scss'

const REGISTRATION_CATEGORIES = ['Team Registration Package', 'Player Registration Package']

// The public Event Site's "Registrants" page (Figma "Registrants"). Same
// band/card/title classes as Packages and Sponsors, so every designation
// applies here too.
export default function EventSiteRegistrantsContent({ eventName, ctaColor = 'primary-color', btn, onViewPackages }) {
  const available = useMemo(
    () => (loadSavedPackages() ?? eventSitePackages).filter(p => REGISTRATION_CATEGORIES.includes(p.category) && p.status === 'active'),
    []
  )

  return (
    <div className="es-packages es-registrants-page">
      <div className="es-packages-band es-packages-title-band">
        <div className="es-packages-title-row">
          <h1 className="es-packages-title">Registrants</h1>
        </div>
      </div>

      <div className="es-packages-band">
        <div className="es-packages-inner">
          <div className="es-packages-card es-packages-exclusive">
            <div>
              <div className="es-packages-card-title">Team &amp; Player Registration</div>
              <div className="es-packages-card-sub">Check out all available registration packages for {eventName}.</div>
            </div>
            <GSButton title="View Packages" rightIcon={faArrowRight} {...btn('viewPackages', ctaColor, 'fill')} onClick={() => onViewPackages('team-registration')} isFocusable />
          </div>
        </div>
      </div>

      <section className="es-packages-band">
        <div className="es-packages-inner">
          <h2 className="es-packages-section-title">Registered Teams</h2>
          <div className="es-registrant-tiles">
            {registeredTeams.map(team => (
              <div className="es-registrant-tile" key={team.id}>
                <div className="es-registrant-team-name">{team.teamName}</div>
                <div className="es-registrant-people">
                  {team.players.map(player => (
                    <Person key={player.id} name={player.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {unassignedPlayers.length > 0 && (
        <section className="es-packages-band">
          <div className="es-packages-inner">
            <h2 className="es-packages-section-title">Unassigned Players</h2>
            <div className="es-registrant-tiles">
              {unassignedPlayers.map(player => (
                <div className="es-registrant-tile" key={player.id}>
                  <Person name={player.name} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {available.length > 0 && (
        <section className="es-packages-band">
          <div className="es-packages-inner">
            <h2 className="es-packages-section-title">Registration Packages</h2>
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
                      <GSButton
                        title="View"
                        rightIcon={faArrowRight}
                        {...btn('viewPackage', ctaColor, 'subtle')}
                        size="secondary"
                        onClick={() => onViewPackages(pkg.category === 'Team Registration Package' ? 'team-registration' : 'player-registration')}
                        isFocusable
                      />
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

function Person({ name, muted }) {
  return (
    <div className={`es-registrant-person${muted ? ' is-muted' : ''}`}>
      <span className="es-avatar">
        <img className="es-avatar-image" src={avatarSample} alt="" />
      </span>
      <span>{name}</span>
    </div>
  )
}
