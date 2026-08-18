import { useEffect, useState } from 'react'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import './OrderResponsesFilterNav.scss'

export const RESPONSE_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'team', label: 'Team' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'player', label: 'Player Forms' },
]

export const CATEGORY_DESCRIPTIONS = {
  all: 'All Responses',
  team: 'Team Responses',
  sponsor: 'Sponsor Responses',
  player: 'Player Responses',
}

// Two-step filter for the All Responses list — same collapsible drill-down
// shape as Hole Assignments' wave/round nav (see scheduler/WaveRoundNav.jsx
// and the "{Wave Name} Wave | Change Round" switch above it): a top row of
// categories (All/Team/Sponsor/Player Forms), and picking one that has more
// than one respondent (multiple teams, multiple sponsors, multiple players)
// swaps that row for a name picker instead, with a back arrow. A single-
// respondent category has nothing left to narrow, so it applies directly
// and collapses the nav — same as a one-round wave jumping straight to its
// round instead of stopping on a one-item list.
export default function OrderResponsesFilterNav({ isOpen, categories, category, onSelectCategory, namesByCategory, selectedName, onSelectName }) {
  const [viewingNames, setViewingNames] = useState(false)

  // Re-drills into the active category's own names every time the nav
  // opens, so "Change" always lands back where you left off — except when
  // that category only has the one respondent, since there's nowhere useful
  // to land inside a one-item list.
  useEffect(() => {
    if (!isOpen) return
    setViewingNames((namesByCategory[category]?.length ?? 0) > 1)
  }, [isOpen, category, namesByCategory])

  const names = namesByCategory[category] ?? []
  const showNames = viewingNames && names.length > 1
  const tabsKey = showNames ? `names-${category}` : 'categories'

  return (
    <div className={`ordr1-filter-nav-collapse${isOpen ? ' ordr1-filter-nav-collapse--open' : ''}`}>
      <div className="ordr1-filter-nav-collapse-inner">
        <div className="ordr1-filter-nav">
          <div className="ordr1-filter-nav-label">
            {showNames
              ? [RESPONSE_CATEGORIES.find(c => c.value === category)?.label, selectedName].filter(Boolean).join(' / ')
              : 'Filter'}
          </div>
          <div className="ordr1-filter-nav-tabs" key={tabsKey}>
            {showNames ? (
              <>
                <GSButton
                  type="light-grey icon"
                  isFocusable
                  buttonIcon={faChevronLeft}
                  onClick={() => setViewingNames(false)}
                />
                {names.map(name => (
                  <div key={name} className="ordr1-filter-nav-tab">
                    <GSButton
                      type={name === selectedName ? 'black' : 'light-grey'}
                      isFocusable
                      title={name}
                      onClick={() => onSelectName(name === selectedName ? null : name)}
                    />
                  </div>
                ))}
              </>
            ) : (
              categories.map(c => (
                <div key={c.value} className="ordr1-filter-nav-tab">
                  <GSButton
                    type={c.value === category ? 'black' : 'light-grey'}
                    isFocusable
                    title={c.label}
                    onClick={() => onSelectCategory(c.value)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
