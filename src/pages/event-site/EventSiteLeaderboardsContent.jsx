import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faDisplay, faStar } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import GSImage from '../../gs-lib/components/gs-image'
import { eventSiteLeaderboards } from '../../data/mockEventSiteLeaderboards.js'
import sponsorImagePending from '../../assets/sponsor-image-pending-2-1.jpg'
import './EventSiteLeaderboardsContent.scss'

const STATS = [
  ['Total', 'total'],
  ['Thru', 'thru'],
  ['Strokes', 'strokes'],
  ['Points', 'points'],
]

// The public Event Site's "Leaderboards" page (Figma "Leaderboards"). Same
// band/card/title classes as the other pages so every designation applies.
// `donationSection` is the homepage's Donation section, shown again at the
// bottom like the Figma frame.
export default function EventSiteLeaderboardsContent({ ctaColor = 'primary-color', btn, donationSection }) {
  const [boardIndex, setBoardIndex] = useState(0)
  const [favorites, setFavorites] = useState({})
  const board = eventSiteLeaderboards[boardIndex]

  return (
    <div className="es-packages es-leaderboards-page">
      <div className="es-packages-band es-packages-title-band">
        <div className="es-packages-title-row">
          <h1 className="es-packages-title">Leaderboards</h1>
          <GSButton buttonIcon={faDisplay} aria-label="Full screen" {...btn('leaderboardDisplay', ctaColor, 'subtle')} isFocusable />
        </div>
      </div>

      <div className="es-packages-band es-leaderboards-sponsors">
        <div className="es-packages-inner es-leaderboards-banners">
          <GSImage ratio="wide" style={{ width: 160, aspectRatio: '2 / 1' }} src={sponsorImagePending} alt="Sponsor" />
          <GSImage ratio="wide" style={{ width: 160, aspectRatio: '2 / 1' }} src={sponsorImagePending} alt="Sponsor" />
        </div>
      </div>

      <div className="es-packages-band">
        <div className="es-packages-inner">
          <div className="es-packages-card es-packages-exclusive">
            <div>
              <div className="es-packages-card-title">{board.title}</div>
              <div className="es-packages-card-sub">Updated {board.updated}</div>
            </div>
            {eventSiteLeaderboards.length > 1 && (
              <GSButton title="Change" rightIcon={faArrowRight} {...btn('changeLeaderboard', ctaColor, 'fill')} onClick={() => setBoardIndex(i => (i + 1) % eventSiteLeaderboards.length)} isFocusable />
            )}
          </div>
        </div>
      </div>

      <div className="es-packages-band">
        <div className="es-packages-inner">
          {board.entries.map(entry => {
            const starred = !!favorites[entry.id]
            return (
              <div className="es-packages-card es-leaderboard-row" key={entry.id}>
                <div className="es-leaderboard-who">
                  <div className="es-leaderboard-rank">{entry.rank}</div>
                  <div className="es-leaderboard-name">{entry.name}</div>
                  <button
                    type="button"
                    className={`es-leaderboard-star${starred ? ' is-starred' : ''}`}
                    aria-label={starred ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={starred}
                    onClick={() => setFavorites(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </button>
                </div>
                <div className="es-leaderboard-stats">
                  {STATS.map(([label, key]) => (
                    <div className="es-leaderboard-stat" key={key}>
                      <div className="es-leaderboard-stat-label">{label}</div>
                      <div className="es-leaderboard-stat-value">{entry[key]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {donationSection}
    </div>
  )
}
