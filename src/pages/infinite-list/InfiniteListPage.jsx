import { useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import AppSidePanel from '../../components/AppSidePanel'
import GSButton from '../../gs-lib/components/gs-button'
import { usePanelList } from '../../gs-lib/hooks/usePanelList'
import './InfiniteListPage.scss'

// ── Mock data ─────────────────────────────────────────────────────────────────
const FIRST   = ['Jordan','Taylor','Morgan','Casey','Riley','Avery','Sam','Alex','Drew','Quinn',
                 'Jamie','Blake','Charlie','Jesse','Skyler','Devon','Reese','Peyton','Sage','River']
const LAST    = ['Alvarez','Kim','Patel','Rivera','Chen','Nguyen','Torres','Reyes','Walsh','Okafor',
                 'Larson','Mendez','Johnson','Williams','Brown','Davis','Wilson','Anderson','Martinez','Thomas']
const TEAMS   = ['Birdie Brigade','Eagle Squad','Fairway Flyers','The Bogeymen','Par Excellence',
                 "Iron Mike's",'Hole in Fun','Slice of Life','Bogey Knights','Putt Pirates']
const DOMAINS = ['gmail.com','yahoo.com','outlook.com','example.com','golfmail.com']

function makePlayers(count) {
  return Array.from({ length: count }, (_, i) => {
    const first  = FIRST[i % FIRST.length]
    const last   = LAST[Math.floor(i / FIRST.length) % LAST.length]
    const suffix = i >= FIRST.length ? i : ''
    return {
      id:    i + 1,
      name:  `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${suffix}@${DOMAINS[i % DOMAINS.length]}`,
      team:  TEAMS[i % TEAMS.length],
    }
  })
}

// ── Scenarios ─────────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    label:       'Full list',
    description: '100 players, loads 25 at a time',
    title:       'Players & Teams',
    data:        makePlayers(100),
    pageSize:    25,
  },
  {
    label:       'Short list',
    description: '12 players, loads 25 at a time',
    title:       'Players & Teams',
    data:        makePlayers(12),
    pageSize:    25,
    actions:     [{ name: 'Done', type: 'light-grey', action: () => {} }],
  },
  {
    label:       'Tiny list',
    description: '3 items — fits on screen, pill never appears',
    title:       'Tiny List',
    data:        makePlayers(3),
    pageSize:    3,
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InfiniteListPage() {
  return (
    <div className="infinite-list-page">
      <div className="page-background">
        <div className="il-scenario-grid">
          {SCENARIOS.map(s => (
            <ScenarioCard key={s.label} scenario={s} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ScenarioCard({ scenario }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const list = usePanelList({
    data:            scenario.data,
    pageSize:        scenario.pageSize,
    initialPageSize: scenario.initialPageSize,
    panelOpen,
  })

  return (
    <div className="il-scenario-card">
      <div className="il-scenario-label">{scenario.label}</div>
      <div className="il-scenario-desc">{scenario.description}</div>
      <GSButton
        title="Open Panel"
        type="black"
        onClick={() => setPanelOpen(true)}
        isFocusable
      />

      <AppSidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={scenario.title}
        actions={scenario.actions}
        bottomContent={
          <div className={`il-pill-wrapper${list.showPill ? '' : ' scrolled'}`}>
            <GSButton
              title="scroll for more"
              type="secondary pill white"
              onClick={() => list.getScrollEl()?.scrollBy({ top: 200, behavior: 'smooth' })}
            />
          </div>
        }
      >
        {list.isInitialLoading ? (
          <div className="il-initial-loading">
            <FontAwesomeIcon icon={faCircleNotch} className="il-spinner" />
          </div>
        ) : (
          <div className="il-list" ref={list.listRef}>
            {list.visibleItems.map(p => (
              <div key={p.id} className="il-list-item">
                <div className="il-player-name">{p.name}</div>
                <div className="il-player-email">{p.email}</div>
                <div className="il-player-team">{p.team}</div>
              </div>
            ))}

            {!list.isDone && !list.isLoading && (
              <div ref={list.sentinelRef} className="il-sentinel" />
            )}
            {list.isLoading && (
              <div className="il-loading-row">
                <FontAwesomeIcon icon={faCircleNotch} className="il-spinner" />
              </div>
            )}
            {list.isDone && (
              <div className="il-end-row">
                <div className="il-end-sublabel">Showing All {list.total} Players</div>
              </div>
            )}
          </div>
        )}
      </AppSidePanel>
    </div>
  )
}
