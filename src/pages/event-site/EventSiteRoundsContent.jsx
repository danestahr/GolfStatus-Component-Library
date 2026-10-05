import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight, faArrowUpRightFromSquare, faFileLines, faUsers } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import { eventSiteRounds } from '../../data/mockEventSiteRounds.js'
import './EventSiteRoundsContent.scss'

const sum = values => values.reduce((a, b) => a + b, 0)
const fmt = n => n.toLocaleString('en-US')

// The public Event Site's "Rounds" page (Figma "Rounds"). Same band/card/
// title classes as the other pages so every designation applies.
export default function EventSiteRoundsContent({ ctaColor = 'primary-color', btn }) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [teeIndex, setTeeIndex] = useState(0)
  const round = eventSiteRounds[roundIndex]
  const { facility } = round
  const tee = round.tees[teeIndex]
  const prevTee = round.tees[(teeIndex - 1 + round.tees.length) % round.tees.length]
  const nextTee = round.tees[(teeIndex + 1) % round.tees.length]
  const query = encodeURIComponent(`${facility.name} ${facility.address.join(' ')}`)

  return (
    <div className="es-packages es-rounds-page">
      <div className="es-packages-band es-packages-title-band">
        <div className="es-packages-title-row">
          <h1 className="es-packages-title">Rounds</h1>
        </div>
      </div>

      <div className="es-packages-band">
        <div className="es-packages-inner">
          <div className="es-packages-card es-packages-exclusive">
            <div className="es-rounds-summary">
              <div className="es-packages-card-title">{round.name}</div>
              <div className="es-rounds-meta">{round.when}</div>
              <div className="es-rounds-meta">
                <div>{round.format}</div>
                <div>{round.holes} Holes</div>
                <div>{round.startType}</div>
              </div>
              <div className="es-rounds-meta">
                <div>{facility.name}</div>
                <div>{facility.address[1].replace(/ \d+$/, '')}</div>
              </div>
            </div>
            {eventSiteRounds.length > 1 && (
              <GSButton
                title="Change Round"
                rightIcon={faArrowRight}
                {...btn('changeRound', ctaColor, 'fill')}
                onClick={() => {
                  setRoundIndex(i => (i + 1) % eventSiteRounds.length)
                  setTeeIndex(0)
                }}
                isFocusable
              />
            )}
          </div>
        </div>
      </div>

      <section className="es-packages-band">
        <div className="es-packages-inner">
          <h2 className="es-packages-section-title">Round Details</h2>
          <div className="es-packages-card es-rounds-facility">
            <div className="es-rounds-facility-info">
              <div className="es-packages-card-title">{facility.name}</div>
              <div className="es-rounds-courses">{facility.courses.map(c => <div key={c}>{c}</div>)}</div>
              <div className="es-rounds-meta">{facility.address.map(line => <div key={line}>{line}</div>)}</div>
              <a className="es-rounds-link" href={`https://${facility.website}`} target="_blank" rel="noreferrer">{facility.website}</a>
              <div className="es-rounds-meta">{facility.phone}</div>
            </div>
            <div className="es-rounds-map">
              <iframe title="Course map" src={`https://maps.google.com/maps?q=${query}&t=k&output=embed`} loading="lazy" />
              <a className="es-rounds-map-link" href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noreferrer">
                Open Google Maps <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </a>
            </div>
          </div>
          <div className="es-packages-card es-rounds-links">
            {[
              { label: 'Hole Assignments', icon: faUsers },
              { label: 'Rules', icon: faFileLines },
            ].map(link => (
              <button key={link.label} type="button" className="es-packages-start-tile es-rounds-link-tile">
                <FontAwesomeIcon icon={link.icon} />
                <span>{link.label}</span>
                <FontAwesomeIcon icon={faArrowRight} className="es-rounds-link-arrow" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="es-packages-band">
        <div className="es-packages-inner">
          <h2 className="es-packages-section-title">Tees</h2>
          <div className="es-rounds-meta">Only tees active for this event are included.</div>
          <div className="es-packages-card es-rounds-tee">
            <div>
              <div className="es-packages-card-title">{tee.name} Tee</div>
              <div className="es-rounds-meta">
                <div>{tee.holes} Holes · Par {tee.par}</div>
                <div>{tee.rating} · {fmt(sum(tee.yardsOut) + sum(tee.yardsIn))} Yards</div>
                <div>{facility.courses[0]}</div>
              </div>
            </div>
            <div className="es-rounds-scorecards">
              <Half label="OUT" start={1} pars={tee.parsOut} hcp={tee.hcpOut} yards={tee.yardsOut} />
              <Half label="IN" start={10} pars={tee.parsIn} hcp={tee.hcpIn} yards={tee.yardsIn} />
            </div>
            {round.tees.length > 1 && (
              <div className="es-rounds-tee-nav">
                <GSButton title={prevTee.name} leftIcon={faArrowLeft} {...btn('teeNav', ctaColor, 'subtle')} onClick={() => setTeeIndex((teeIndex - 1 + round.tees.length) % round.tees.length)} isFocusable />
                <GSButton title={nextTee.name} rightIcon={faArrowRight} {...btn('teeNav', ctaColor, 'subtle')} onClick={() => setTeeIndex((teeIndex + 1) % round.tees.length)} isFocusable />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Half({ label, start, pars, hcp, yards }) {
  const rows = [
    ['Par', pars, sum(pars)],
    ['Handicap', hcp, '-'],
    ['Yardage', yards, fmt(sum(yards))],
  ]
  return (
    <div className="es-rounds-half">
      <div className="es-rounds-row">
        {pars.map((_, i) => <span key={i} className="es-rounds-hole">{start + i}</span>)}
        <span className="es-rounds-total">{label}</span>
      </div>
      {rows.map(([name, values, total]) => (
        <div key={name}>
          <div className="es-rounds-row-label">{name}</div>
          <div className="es-rounds-row">
            {values.map((v, i) => <span key={i} className="es-rounds-cell">{v}</span>)}
            <span className="es-rounds-total">{total}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
