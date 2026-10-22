import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircleXmark, faDisplay, faMagnifyingGlass, faStar } from '@fortawesome/free-solid-svg-icons'

import GSButton from '../../gs-lib/components/gs-button'
import GSImage from '../../gs-lib/components/gs-image'
import { eventSiteLeaderboards } from '../../data/mockEventSiteLeaderboards.js'
import sponsorImagePending from '../../assets/sponsor-image-pending-2-1.jpg'
import './EventSiteLeaderboardsContent.scss'

const STATS = [
  ['Total', 'total'],
  ['Thru', 'thru'],
  ['R1', 'r1'],
  ['R2', 'r2'],
  ['R3', 'r3'],
  ['Points', 'points'],
]

// The public Event Site's "Leaderboards" page (Figma "Leaderboards"). Same
// band/card/title classes as the other pages so every designation applies.
// `donationSection` is the homepage's Donation section, shown again at the
// bottom like the Figma frame.
export default function EventSiteLeaderboardsContent({ ctaColor = 'primary-color', btn, donationSection }) {
  const [boardIndex, setBoardIndex] = useState(0)
  const [favorites, setFavorites] = useState({})
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  // The sponsor images stick under the sticky .es-header — measure it (same
  // variable the Packages page sets). The title band scrolls away.
  useEffect(() => {
    const update = () => {
      const headerHeight = document.querySelector('.es-header')?.offsetHeight ?? 0
      rootRef.current?.style.setProperty('--es-header-h', `${headerHeight}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const board = eventSiteLeaderboards[boardIndex]
  const needle = query.trim().toLowerCase()
  const entries = needle ? board.entries.filter(e => `${e.name} ${e.team ?? ''}`.toLowerCase().includes(needle)) : board.entries
  const favoriteEntries = board.entries.filter(e => favorites[e.id])
  const toggleFavorite = id => setFavorites(prev => ({ ...prev, [id]: !prev[id] }))

  // One row — the star toggles it in and out of My Favorites.
  const renderRow = (entry, isFavorite) => {
    const starred = !!favorites[entry.id]
    return (
      <div className={`es-packages-card es-leaderboard-row${isFavorite ? ' is-favorite' : ''}`} key={entry.id}>
        <GSButton
          buttonIcon={faStar}
          size="secondary"
          aria-label={starred ? 'Remove from favorites' : 'Add to favorites'}
          {...(starred ? btn('favorite', 'secondary-color', 'fill') : btn('favoriteOff', 'neutral-color', 'subtle'))}
          onClick={() => toggleFavorite(entry.id)}
          isFocusable
        />
        <div className="es-leaderboard-who">
          <div className="es-leaderboard-rank">{entry.rank}</div>
          <div className="es-leaderboard-name">{entry.name}</div>
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
  }

  return (
    <div className="es-packages es-leaderboards-page" ref={rootRef}>
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

      {favoriteEntries.length > 0 && (
        <section className="es-packages-band">
          <div className="es-packages-inner es-leaderboard-list">
            <h2 className="es-packages-section-title">My Favorites</h2>
            <div className="es-leaderboard-rows">{favoriteEntries.map(entry => renderRow(entry, true))}</div>
          </div>
        </section>
      )}

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
        <div className="es-packages-inner es-leaderboard-list">
          <label className="es-leaderboard-search">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="es-leaderboard-search-icon" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Players..." aria-label="Search players" />
            {query && (
              <button type="button" className="es-leaderboard-search-clear" aria-label="Clear search" onClick={() => setQuery('')}>
                <FontAwesomeIcon icon={faCircleXmark} />
              </button>
            )}
          </label>
          <div className="es-leaderboard-rows">{entries.map(entry => renderRow(entry, false))}</div>
        </div>
      </div>

      {donationSection}
    </div>
  )
}
