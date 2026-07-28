import { useEffect, useState, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { faMagnifyingGlass, faCircleArrowUp, faCircleArrowDown, faGear, faCircleCheck, faRotateLeft } from '@fortawesome/free-solid-svg-icons'

import GSinput from '../../gs-lib/components/gs-input'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSSelect from '../../gs-lib/components/gs-select'
import GSButton from '../../gs-lib/components/gs-button'
import AppSidePanel from '../../components/AppSidePanel'
import RoundHero from '../../components/scorecard/RoundHero'
import ScorecardListItem from '../../components/scorecard/ScorecardListItem'
import ScorecardListItemIndividual from '../../components/scorecard/ScorecardListItemIndividual'
import ScorecardListItemTeamMulti from '../../components/scorecard/ScorecardListItemTeamMulti'
import ScorecardListItemV1 from '../../components/scorecard/ScorecardListItemV1'
import { mockHoleAssignments, mockScorecards } from '../../data/mockScorecards'
import './ScorecardListPage.scss'

const VIEW_OPTIONS = [
  { value: 'holes', label: 'Assignments' },
  { value: 'teams', label: 'Teams' },
]

const FORMAT_OPTIONS = [
  { value: 'individual',  label: 'S' },
  { value: 'team-single', label: 'T' },
  { value: 'team-multi',  label: 'T2' },
  { value: 'v1',          label: 'O' },
]

const COMPLETE_STATUSES = ['complete', 'submitted', 'confirmed']
const LIVE_SCORED_STATUSES = ['in-progress', 'submitted', 'confirmed']

function hasIncompleteScores(scorecard) {
  const { status, holeScores } = scorecard
  if (!holeScores) return false
  const internalGap = holeScores.some((s, i) => {
    if (s !== 0) return false
    const before = holeScores.slice(0, i).some(v => v !== 0)
    const after  = holeScores.slice(i + 1).some(v => v !== 0)
    return before && after
  })
  return internalGap || (COMPLETE_STATUSES.includes(status) && holeScores.some(s => s === 0))
}

const STAT_PREDICATE = {
  live: sc => LIVE_SCORED_STATUSES.includes(sc.status),
  complete: sc => {
    if (sc.status === 'not-generated' || !sc.holeScores) return false
    return !sc.holeScores.some(s => s === 0)
  },
  missing: sc => sc.status === 'not-generated',
  incomplete: sc => {
    if (sc.status === 'not-generated' || !sc.holeScores) return false
    return sc.holeScores.some(s => s === 0)
  },
}

const FORMAT_COMPONENT = {
  'individual':  ScorecardListItemIndividual,
  'team-single': ScorecardListItem,
  'team-multi':  ScorecardListItemTeamMulti,
  'v1':          ScorecardListItemV1,
}

export default function ScorecardListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromScorecardId = location.state?.fromScorecardId
  const [panelOpen,        setPanelOpen]        = useState(Boolean(fromScorecardId))
  const [search,           setSearch]           = useState('')
  const [viewMode,         setViewMode]         = useState(VIEW_OPTIONS[0])
  const [format,           setFormat]           = useState(FORMAT_OPTIONS[1])
  const [isFinalized,      setIsFinalized]      = useState(location.state?.isFinalized ?? false)
  const [liveScoringEnded, setLiveScoringEnded] = useState(location.state?.liveScoringEnded ?? false)
  const [selectedStat,     setSelectedStat]     = useState(location.state?.fromStat ?? null)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [showPill,         setShowPill]         = useState(false)

  const contentRef = useRef(null)
  const loadingRef = useRef(false)

  const getScrollEl = useCallback(
    () => contentRef.current?.closest('.app-side-panel-body'),
    []
  )

  useEffect(() => {
    if (!fromScorecardId) return
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector(`[data-scorecard-id="${fromScorecardId}"]`)
      el?.scrollIntoView({ block: 'center' })
    })
    return () => cancelAnimationFrame(raf)
  }, [fromScorecardId])

  const Card = FORMAT_COMPONENT[format.value] ?? ScorecardListItem

  const query = search.toLowerCase()
  const statPredicate = selectedStat ? STAT_PREDICATE[selectedStat] : () => true
  const matches = sc =>
    (sc.teamName.toLowerCase().includes(query) || sc.players?.toLowerCase().includes(query)) &&
    statPredicate(sc)

  const filteredGroups = mockHoleAssignments
    .map(group => ({
      ...group,
      scorecards: group.scorecards.filter(matches),
    }))
    .filter(group => group.scorecards.length > 0)

  const filteredTeams = mockScorecards.filter(matches)

  // Show loading screen on panel open; clear once content is ready
  useEffect(() => {
    if (!panelOpen) return
    setShowPill(false)
    setIsInitialLoading(true)
    loadingRef.current = true
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
      loadingRef.current = false
    }, 800)
    return () => clearTimeout(timer)
  }, [panelOpen])

  // Pill check — re-runs when loading clears, content filters change, or user scrolls/resizes
  useEffect(() => {
    const el = getScrollEl()
    if (!el || !panelOpen || isInitialLoading) return
    const check = () => {
      const scrollRemaining = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowPill(el.scrollTop < 200 && scrollRemaining >= 200)
    }
    const rafId = requestAnimationFrame(check)
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [panelOpen, getScrollEl, isInitialLoading, filteredTeams.length, viewMode, selectedStat])

  const isIndividual    = format.value === 'individual'
  const totalTeams      = mockScorecards.length
  const liveCount       = mockScorecards.filter(STAT_PREDICATE.live).length
  const completeCount   = mockScorecards.filter(STAT_PREDICATE.complete).length
  const missingCount    = mockScorecards.filter(STAT_PREDICATE.missing).length
  const incompleteCount = mockScorecards.filter(STAT_PREDICATE.incomplete).length
  const generatedTeams  = totalTeams - missingCount

  const onEdit = id => {
    setPanelOpen(false)
    navigate(`/scorecards/${id}`, { state: { fromStat: selectedStat, isFinalized, liveScoringEnded } })
  }

  const drawerActions = isFinalized
    ? [
        ...(isIndividual ? [{ name: 'Post to GHIN', type: 'black', action: () => {} }] : []),
        { name: 'Reactivate Round', type: 'light-grey', buttonIcon: faRotateLeft, action: () => setIsFinalized(false) },
      ]
    : [
        { name: 'Finalize Scores', type: 'green', buttonIcon: faCircleCheck, action: () => setIsFinalized(true) },
      ]

  return (
    <div className="scorecard-list-page">
      <div className="page-background">
        <GSButton
          title="View Scorecards"
          type="black"
          onClick={() => setPanelOpen(true)}
          isFocusable
        />
      </div>

      <AppSidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Scorecards"
        actions={drawerActions}
        bottomContent={
          <div className={`sl-pill-wrapper${showPill ? '' : ' scrolled'}`}>
            <GSButton
              title="scroll for more"
              type="secondary pill cyan"
              onClick={() => getScrollEl()?.scrollBy({ top: 200, behavior: 'smooth' })}
            />
          </div>
        }
      >
        {isInitialLoading ? (
          <div className="sl-initial-loading">
            <FontAwesomeIcon icon={faCircleNotch} className="sl-spinner" />
          </div>
        ) : (
          <div ref={contentRef}>
            <div className="list-action-bar">
              <GSActionBar
                type="x-large-pad H3"
                header="Round 1 Scorecards"
                pageActions={[
                  { buttonTitle: 'Upload',   actionIcon: faCircleArrowUp,   type: 'light-grey', actionClick: () => {} },
                  { buttonTitle: 'Download', actionIcon: faCircleArrowDown, type: 'light-grey', actionClick: () => {} },
                  {                          actionIcon: faGear,            type: 'light-grey', actionClick: () => {} },
                ]}
              />
            </div>

            <RoundHero
              pillLabel={isFinalized ? 'Finalized' : 'Live Round'}
              pillType={isFinalized ? 'black' : 'green'}
              subtitle={(isFinalized || liveScoringEnded)
                ? 'Scorecards are not available to players in the GolfStatus app.'
                : 'Players have access to their scorecards in the GolfStatus app.'}
              toggleLabel={isFinalized ? null : (liveScoringEnded ? 'Enable Live Scoring' : 'Disable Live Scoring')}
              onToggle={() => setLiveScoringEnded(prev => !prev)}
              stats={[
                { key: 'live',       label: 'Live Scoring',     value: `${liveCount}/${generatedTeams}` },
                { key: 'complete',   label: 'Complete',         value: `${completeCount}` },
                { key: 'incomplete', label: 'Incomplete',       value: `${incompleteCount}` },
                { key: 'missing',    label: 'Not Generated',    value: `${missingCount}` },
              ]}
              selectedKey={selectedStat}
              onSelectStat={key => {
                const isDeselect = selectedStat === key
                setSelectedStat(isDeselect ? null : key)
                if (isDeselect) return
                requestAnimationFrame(() => {
                  document.querySelector('.search-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                })
              }}
            />

            <div className="search-area">
              <GSinput
                leftIcon={faMagnifyingGlass}
                placeholder="Search teams or players..."
                textValue={search}
                onChange={e => setSearch(e.target.value)}
              />
              <GSSelect
                options={VIEW_OPTIONS}
                selectedOption={viewMode}
                onChange={setViewMode}
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <GSSelect
                options={FORMAT_OPTIONS}
                selectedOption={format}
                onChange={setFormat}
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            {viewMode.value === 'teams' ? (
              filteredTeams.length === 0 ? (
                <div className="empty-state">No scorecards match your search</div>
              ) : (
                filteredTeams.map(scorecard => (
                  <Card
                    key={scorecard.id}
                    scorecard={scorecard}
                    onEdit={onEdit}
                    isFinalized={isFinalized}
                    searchQuery={search}
                  />
                ))
              )
            ) : (
              filteredGroups.length === 0 ? (
                <div className="empty-state">No scorecards match your search</div>
              ) : (
                filteredGroups.map(group => (
                  <div key={group.hole} className="hole-group">
                    <div className="hole-group-header">
                      <GSActionBar
                        type="grey-header x-large-pad"
                        header={`Hole ${group.hole} — ${group.startTime}`}
                      />
                    </div>
                    {group.scorecards.map(scorecard => (
                      <Card
                        key={scorecard.id}
                        scorecard={scorecard}
                        onEdit={onEdit}
                        isFinalized={isFinalized}
                        searchQuery={search}
                      />
                    ))}
                  </div>
                ))
              )
            )}
          </div>
        )}
      </AppSidePanel>
    </div>
  )
}
