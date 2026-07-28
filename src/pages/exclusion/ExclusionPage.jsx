import { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleNotch,
  faPaperPlane,
  faCheck,
  faMagnifyingGlass,
  faBan,
  faListCheck,
  faTrash,
  faUsers,
  faPlus,
  faCircleCheck,
  faUserPen,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons'
import AppSidePanel from '../../components/AppSidePanel'
import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import GSRadioButton from '../../gs-lib/components/gs-radio-button'
import { usePanelList } from '../../gs-lib/hooks/usePanelList'
import './ExclusionPage.scss'

// ── Mock data ─────────────────────────────────────────────────────────────────
// state: 'all' | 'selected' | 'excluded' | 'some-excluded' | null (unselected)
const INITIAL_SECTIONS = [
  {
    id: 'ppfp-2026',
    name: '2026 Putt Putt Fore Puppies Mini Golf Tournament',
    collapsed: false,
    excludeAll: true,
    groups: [
      { id: 's1-sponsors',  name: 'Sponsors',        total: 24,  state: null },
      { id: 's1-players',   name: 'Players & Teams', total: 156, state: null },
      { id: 's1-waitlist',  name: 'Waitlist Members',total: 12,  state: null },
      { id: 's1-customers', name: 'Customers',       total: 89,  state: null },
      { id: 's1-donors',    name: 'Donors',          total: 41,  state: null },
    ],
  },
  {
    id: 'ppfp-2025',
    name: '2025 Putt Putt Fore Puppies Mini Golf Tournament',
    collapsed: false,
    excludeAll: false,
    groups: [
      { id: 's2-sponsors',  name: 'Sponsors',        total: 18, state: null },
      { id: 's2-players',   name: 'Players & Teams', total: 94, state: null },
      { id: 's2-waitlist',  name: 'Waitlist Members',total: 6,  state: null },
      { id: 's2-customers', name: 'Customers',       total: 34, state: null },
      { id: 's2-donors',    name: 'Donors',          total: 27, state: null },
    ],
  },
  {
    id: 'ppfp-2024',
    name: '2024 Putt Putt Fore Puppies Mini Golf Tournament',
    collapsed: false,
    excludeAll: false,
    groups: [
      { id: 's3-sponsors',  name: 'Sponsors',        total: 15, state: null },
      { id: 's3-players',   name: 'Players & Teams', total: 88, state: null },
      { id: 's3-waitlist',  name: 'Waitlist Members',total: 4,  state: null },
      { id: 's3-customers', name: 'Customers',       total: 29, state: null },
      { id: 's3-donors',    name: 'Donors',          total: 19, state: null },
    ],
  },
  {
    id: 'ppfp-2023',
    name: '2023 Putt Putt Fore Puppies Mini Golf Tournament',
    collapsed: false,
    excludeAll: false,
    groups: [
      { id: 's4-sponsors',  name: 'Sponsors',        total: 11, state: null },
      { id: 's4-players',   name: 'Players & Teams', total: 72, state: null },
      { id: 's4-waitlist',  name: 'Waitlist Members',total: 3,  state: null },
      { id: 's4-customers', name: 'Customers',       total: 21, state: null },
      { id: 's4-donors',    name: 'Donors',          total: 14, state: null },
    ],
  },
]

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

const ALL_PLAYERS = makePlayers(100)

// ── Checkbox ──────────────────────────────────────────────────────────────────
function ExCheckbox({ checked }) {
  return (
    <div className={`ex-checkbox${checked ? ' ex-checkbox--checked' : ''}`}>
      {checked && <FontAwesomeIcon icon={faCheck} className="ex-checkbox-icon" />}
    </div>
  )
}

// ── Group status card (4 styles) ──────────────────────────────────────────────
function GroupStatusCard({ group, selectedCount }) {
  if (!group) return null
  const { state, name } = group

  if (state === 'all') {
    return (
      <div className="gmp-status-card gmp-status-card--green">
        <FontAwesomeIcon icon={faPaperPlane} className="gmp-status-icon" />
        <div className="gmp-status-body">
          <div className="gmp-status-title">Sending to All {name}</div>
          <div className="gmp-status-subtitle">Every {name.toLowerCase()} with a valid email address will receive this message.</div>
        </div>
      </div>
    )
  }
  if (state === 'selected') {
    return (
      <div className="gmp-status-card gmp-status-card--grey">
        <FontAwesomeIcon icon={faUserPen} className="gmp-status-icon" />
        <div className="gmp-status-body">
          <div className="gmp-status-title">Sending to Selected {name}</div>
          <div className="gmp-status-subtitle">Only the selected {name.toLowerCase()} will receive this message.</div>
        </div>
      </div>
    )
  }
  if (state === 'excluded') {
    return (
      <div className="gmp-status-card gmp-status-card--orange">
        <FontAwesomeIcon icon={faBan} className="gmp-status-icon" />
        <div className="gmp-status-body">
          <div className="gmp-status-title">Excluding All {name}</div>
          <div className="gmp-status-subtitle">
            No {name.toLowerCase()} from this group will receive this message, even if included in another group.
          </div>
        </div>
      </div>
    )
  }
  if (state === 'some-excluded') {
    return (
      <div className="gmp-status-card gmp-status-card--grey">
        <FontAwesomeIcon icon={faBan} className="gmp-status-icon" />
        <div className="gmp-status-body">
          <div className="gmp-status-title">Excluding Selected {name}</div>
          <div className="gmp-status-subtitle">
            No {name.toLowerCase()} selected from this group will receive this message, even if included in another group.
          </div>
        </div>
      </div>
    )
  }
  return null
}

// ── Active / excluded group card ──────────────────────────────────────────────
function RecipientGroupCard({ group, onManage, onRemove }) {
  const { state, name, selectedCount } = group

  const icon = (state === 'excluded' || state === 'some-excluded') ? faBan : faCircleCheck

  let iconClass, statusLabel, disclaimerText
  switch (state) {
    case 'all':
      iconClass     = 'rl-card-icon--included'
      statusLabel   = 'Sending to All Available Recipients'
      disclaimerText = 'Changes to this group may affect who receives this message'
      break
    case 'selected':
      iconClass     = 'rl-card-icon--included'
      statusLabel   = `${selectedCount} Selected Recipients`
      disclaimerText = 'Changes to this group may affect who receives this message'
      break
    case 'excluded':
      iconClass     = 'rl-card-icon--excluded'
      statusLabel   = 'Excluding All Recipients'
      disclaimerText = 'Recipients in excluded groups will not receive an email.'
      break
    case 'some-excluded':
      iconClass     = 'rl-card-icon--some-excluded'
      statusLabel   = `${group.excludedCount ?? group.total} Excluded Recipients`
      disclaimerText = 'Some recipients in this group are excluded from receiving this email.'
      break
    default:
      iconClass     = 'rl-card-icon--included'
      statusLabel   = 'Sending to All Available Recipients'
      disclaimerText = ''
  }

  return (
    <div className="rl-group-card">
      <div className="rl-card-row">
        <FontAwesomeIcon icon={icon} className={`rl-card-icon ${iconClass}`} />
        <div className="rl-card-info">
          <div className="rl-card-name">{name}</div>
          <div className="rl-card-status">{statusLabel}</div>
        </div>
        <div className="rl-card-actions">
          <GSButton
            title="manage"
            buttonIcon={faListCheck}
            type="light-grey"
            onClick={onManage}
            isFocusable
          />
          <GSButton
            buttonIcon={faTrash}
            onClick={onRemove}
            isFocusable
          />
        </div>
      </div>
      {disclaimerText && (
        <div className={`rl-card-disclaimer${(state === 'excluded' || state === 'some-excluded') ? ' rl-card-disclaimer--excluded' : ''}`}>
          {disclaimerText}
        </div>
      )}
    </div>
  )
}

// ── Unselected group card ─────────────────────────────────────────────────────
function UnselectedGroupCard({ group, onAdd }) {
  const noAvailable = group.total === 0
  return (
    <div className="rl-unselected-card">
      <div className="rl-card-row">
        <FontAwesomeIcon icon={faUsers} className="rl-unselected-icon" />
        <div className="rl-card-info">
          <div className="rl-card-name">{group.name}</div>
        </div>
        <div className="rl-card-actions">
          <GSButton title="add group" buttonIcon={faPlus} type="white" onClick={onAdd} isDisabled={noAvailable} isFocusable />
        </div>
      </div>
    </div>
  )
}

// ── Exclude-all toggle row ────────────────────────────────────────────────────
function ExcludeAllToggle({ section, onToggleExcludeAll }) {
  return (
    <div className="rl-exclude-toggle-row">
      <div className="rl-exclude-toggle-labels">
        <span className="rl-exclude-toggle-title">Registered Participants</span>
        <span className="rl-exclude-toggle-label">Eligible as recipients for this message.</span>
      </div>
      <div className="rl-exclude-toggle-right">
        <span className="rl-exclude-toggle-value">{section.excludeAll ? 'Yes' : 'No'}</span>
        <button
          className={`rl-toggle-switch${section.excludeAll ? ' rl-toggle-switch--on' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleExcludeAll(section.id) }}
          aria-pressed={section.excludeAll}
        >
          <span className="rl-toggle-thumb" />
        </button>
      </div>
    </div>
  )
}

// ── Collapsable section ───────────────────────────────────────────────────────
function RecipientSection({ section, isFirst, sectionsCount, onToggle, onToggleExcludeAll, onManage, onRemove, onAdd }) {
  const showExcludeToggle = isFirst && sectionsCount > 1

  return (
    <div className="rl-section">
      <div className="rl-section-hdr" onClick={onToggle}>
        <span className="rl-section-name">{section.name}</span>
        <GSButton
          title={section.collapsed ? 'Show' : 'Hide'}
          type="secondary undefined"
          isFocusable
        />
      </div>

      {!section.collapsed && (
        <>
          {showExcludeToggle && (
            <ExcludeAllToggle section={section} onToggleExcludeAll={onToggleExcludeAll} />
          )}

          {showExcludeToggle && !section.excludeAll ? (
            <div className="rl-exclude-all-disclaimer">
              <div className="rl-exclude-all-title">Exclude {section.name} Participants</div>
              <div className="rl-exclude-all-subtitle">
              Participants will not receive this message, even if they're included in other recipient groups.
              </div>
            </div>
          ) : (
            <div className="rl-section-cards">
              {section.groups.map(group =>
                group.state !== null ? (
                  <RecipientGroupCard
                    key={group.id}
                    group={group}
                    onManage={() => onManage(group, section.id)}
                    onRemove={() => onRemove(section.id, group.id)}
                  />
                ) : (
                  <UnselectedGroupCard
                    key={group.id}
                    group={group}
                    onAdd={() => onAdd(section.id, group.id)}
                  />
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ExclusionPage() {
  // null = closed | 'recipients' = recipients list | 'group' = group manage page
  const [panelPage, setPanelPage]             = useState('recipients')
  const [activeManageKey, setActiveManageKey] = useState(null) // { groupId, sectionId }
  const [sections, setSections]               = useState(INITIAL_SECTIONS)
  const [search, setSearch]                   = useState('')
  const [selectedPlayers, setSelected]        = useState(new Set())

  // Derive active group live from sections so radio toggles reflect immediately
  const activeGroup = useMemo(() => {
    if (!activeManageKey) return null
    const section = sections.find(s => s.id === activeManageKey.sectionId)
    return section?.groups.find(g => g.id === activeManageKey.groupId) ?? null
  }, [sections, activeManageKey])

  // interactive = checkboxes visible, items clickable
  const isInteractive = activeGroup?.state === 'selected' || activeGroup?.state === 'some-excluded'

  const togglePlayer = id =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ALL_PLAYERS
    return ALL_PLAYERS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    )
  }, [search])

  const list = usePanelList({ data: filteredPlayers, pageSize: 25, panelOpen: panelPage === 'group' })

  const toggleSection = id =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, collapsed: !s.collapsed } : s))

  // Navigate to group manage page — no panel close/open, content swaps instantly
  const handleManage = (group, sectionId) => {
    setActiveManageKey({ groupId: group.id, sectionId })
    setSearch('')
    if (group.state === 'selected') {
      setSelected(new Set(ALL_PLAYERS.slice(0, group.selectedCount ?? 0).map(p => p.id)))
    } else if (group.state === 'some-excluded') {
      setSelected(new Set(ALL_PLAYERS.slice(0, group.excludedCount ?? 0).map(p => p.id)))
    } else {
      setSelected(new Set())
    }
    setPanelPage('group')
    requestAnimationFrame(() => {
      const body = document.querySelector('.app-side-panel-body')
      if (body) body.scrollTop = 0
    })
  }

  const handleSetGroupMode = (mode) => {
    if (!activeManageKey) return
    const { groupId, sectionId } = activeManageKey
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, groups: s.groups.map(g => g.id === groupId ? { ...g, state: mode } : g) }
        : s
    ))
    if (mode === 'all' || mode === 'excluded') setSelected(new Set())
  }

  const handleRemoveGroup = (sectionId, groupId) =>
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, groups: s.groups.map(g => g.id === groupId ? { ...g, state: null } : g) }
        : s
    ))

  const handleAddGroup = (sectionId, groupId) =>
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, groups: s.groups.map(g => g.id === groupId ? { ...g, state: 'all' } : g) }
        : s
    ))

  const handleExcludeGroup = (sectionId, groupId) =>
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, groups: s.groups.map(g => g.id === groupId ? { ...g, state: 'excluded' } : g) }
        : s
    ))

  const handleToggleExcludeAll = (sectionId) =>
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, excludeAll: !s.excludeAll } : s
    ))

  const handleBack = () => {
    if (panelPage === 'group' && activeManageKey && isInteractive) {
      const { groupId, sectionId } = activeManageKey
      const count = selectedPlayers.size
      setSections(prev => prev.map(s =>
        s.id === sectionId ? {
          ...s,
          groups: s.groups.map(g => g.id === groupId ? {
            ...g,
            ...(activeGroup?.state === 'selected'      ? { selectedCount: count } : {}),
            ...(activeGroup?.state === 'some-excluded' ? { excludedCount: count } : {}),
          } : g),
        } : s
      ))
    }
    panelPage === 'group' ? setPanelPage('recipients') : setPanelPage(null)
  }

  const groupVerb = (activeGroup?.state === 'excluded' || activeGroup?.state === 'some-excluded')
    ? 'Exclude'
    : 'Manage'

  const panelTitle = panelPage === 'group'
    ? `${groupVerb} ${activeGroup?.name ?? 'Group'}`
    : 'Email Recipients'

  const headerCount = isInteractive
    ? selectedPlayers.size
    : (activeGroup?.total ?? 0)

  return (
    <div className="exclusion-page">
      <div className="page-background">
        <GSButton
          title="Manage Recipients"
          type="black"
          onClick={() => setPanelPage('recipients')}
          isFocusable
        />
      </div>

      {/* Single panel — content swaps between pages without slide transition */}
      <AppSidePanel
        isOpen={panelPage !== null}
        onClose={handleBack}
        title={panelTitle}
        actions={[{ name: 'Continue', type: 'black', action: handleBack }]}
        bottomContent={panelPage === 'group' ? (
          <div className={`il-pill-wrapper${list.showPill ? '' : ' scrolled'}`}>
            <GSButton
              title="scroll for more"
              type="secondary pill cyan"
              onClick={() => list.getScrollEl()?.scrollBy({ top: 200, behavior: 'smooth' })}
            />
          </div>
        ) : undefined}
      >

        {/* ── Recipients list page ── */}
        {panelPage === 'recipients' && (
          <>
            <GSActionBar
              type="x-large-pad H3"
              header="Email Recipients"
              pageActions={[{
                buttonTitle: 'Manage Tournaments',
                actionIcon: faListCheck,
                type: 'light-grey',
                actionClick: () => {},
              }]}
            />

            <div className="rl-content-wrapper">
              {sections.flatMap(s => s.groups).filter(g => g.state !== null).length >= 2 && (
                <div className="ex-banner">
                  <FontAwesomeIcon icon={faPaperPlane} className="ex-banner-icon" />
                  <span>Emails are sent once per email address, even if selected in multiple groups.</span>
                </div>
              )}

              {sections.map((section, i) => (
                <RecipientSection
                  key={section.id}
                  section={section}
                  isFirst={i === 0}
                  sectionsCount={sections.length}
                  onToggle={() => toggleSection(section.id)}
                  onToggleExcludeAll={handleToggleExcludeAll}
                  onManage={handleManage}
                  onRemove={handleRemoveGroup}
                  onAdd={handleAddGroup}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Group manage page ── */}
        {panelPage === 'group' && (
          <>
            <GSActionBar
              type="x-large-pad H3"
              header={`${groupVerb} ${activeGroup?.name ?? 'Group'} (${headerCount})`}
            />

            <div className="gmp-form-section">
              {/* Added: All / Select toggles */}
              {(activeGroup?.state === 'all' || activeGroup?.state === 'selected') && (
                <div className="gmp-radio-row">
                  <GSRadioButton
                    label={`All ${activeGroup.name}`}
                    value="all"
                    selectedOption={{ value: activeGroup.state }}
                    onClick={() => handleSetGroupMode('all')}
                  />
                  <GSRadioButton
                    label={`Select ${activeGroup.name}`}
                    value="selected"
                    selectedOption={{ value: activeGroup.state }}
                    onClick={() => handleSetGroupMode('selected')}
                  />
                </div>
              )}

              {/* Excluded: Exclude All / Exclude Some toggles */}
              {(activeGroup?.state === 'excluded' || activeGroup?.state === 'some-excluded') && (
                <div className="gmp-radio-row">
                  <GSRadioButton
                    label={`Exclude All ${activeGroup.name}`}
                    value="excluded"
                    selectedOption={{ value: activeGroup.state }}
                    onClick={() => handleSetGroupMode('excluded')}
                  />
                  <GSRadioButton
                    label={`Exclude Some ${activeGroup.name}`}
                    value="some-excluded"
                    selectedOption={{ value: activeGroup.state }}
                    onClick={() => handleSetGroupMode('some-excluded')}
                  />
                </div>
              )}

              <GroupStatusCard group={activeGroup} selectedCount={selectedPlayers.size} />
            </div>

            {/* Search + full list always shown; checkboxes and click only when interactive */}
            <div className="ex-search-bar">
              <GSinput
                leftIcon={faMagnifyingGlass}
                placeholder={`Search ${activeGroup?.name ?? ''}...`}
                textValue={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {list.isInitialLoading ? (
              <div className="il-initial-loading">
                <FontAwesomeIcon icon={faCircleNotch} className="il-spinner" />
              </div>
            ) : (
              <div className="il-list" ref={list.listRef}>
                {list.visibleItems.map(p => (
                  <div
                    key={p.id}
                    className={`il-list-item${isInteractive ? ' il-list-item--selectable' : ''}`}
                    onClick={isInteractive ? () => togglePlayer(p.id) : undefined}
                  >
                    {isInteractive && <ExCheckbox checked={selectedPlayers.has(p.id)} />}
                    <div className="ex-player-info">
                      <div className="ex-player-primary">
                        <div className="il-player-name">{p.name}</div>
                        <div className="il-player-email">{p.email}</div>
                      </div>
                      <div className="il-player-team">{p.team}</div>
                    </div>
                  </div>
                ))}

                {list.visibleItems.length === 0 && (
                  <div className="il-end-row">
                    <div className="il-end-sublabel">No results for "{search}"</div>
                  </div>
                )}

                {!list.isDone && !list.isLoading && (
                  <div ref={list.sentinelRef} className="il-sentinel" />
                )}
                {list.isLoading && (
                  <div className="il-loading-row">
                    <FontAwesomeIcon icon={faCircleNotch} className="il-spinner" />
                  </div>
                )}
                {list.isDone && list.visibleItems.length > 0 && (
                  <div className="il-end-row">
                    <div className="il-end-sublabel">Showing All {list.total} Players</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </AppSidePanel>
    </div>
  )
}
