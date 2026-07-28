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
  faUsersSlash,
  faCircleCheck,
  faUserPen,
  faPlus,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import AppSidePanel from '../../components/AppSidePanel'
import GSButton from '../../gs-lib/components/gs-button'
import GSActionBar from '../../gs-lib/components/gs-action-bar'
import GSinput from '../../gs-lib/components/gs-input'
import GSRadioButton from '../../gs-lib/components/gs-radio-button'
import { usePanelList } from '../../gs-lib/hooks/usePanelList'
import './ExclusionPage.scss'

// ── Mock data ─────────────────────────────────────────────────────────────────
// state: 'all' | 'selected' | null (unselected)
// excludedIds: array of player IDs excluded from this group
const INITIAL_SECTIONS = [
  {
    id: 'ppfp-2026',
    name: '2026 Putt Putt Fore Puppies Mini Golf Tournament',
    collapsed: false,
    groups: [
      { id: 's1-sponsors',  name: 'Sponsors',        total: 24,  state: null, excludedIds: [] },
      { id: 's1-players',   name: 'Players & Teams', total: 156, state: null, excludedIds: [] },
      { id: 's1-waitlist',  name: 'Waitlist Members',total: 12,  state: null, excludedIds: [] },
      { id: 's1-customers', name: 'Customers',       total: 89,  state: null, excludedIds: [] },
      { id: 's1-donors',    name: 'Donors',          total: 41,  state: null, excludedIds: [] },
    ],
  },
  {
    id: 'ppfp-2025',
    name: '2025 Putt Putt Fore Puppies Mini Golf Tournament',
    collapsed: false,
    groups: [
      { id: 's2-sponsors',  name: 'Sponsors',        total: 18, state: null, excludedIds: [] },
      { id: 's2-players',   name: 'Players & Teams', total: 94, state: null, excludedIds: [] },
      { id: 's2-waitlist',  name: 'Waitlist Members',total: 6,  state: null, excludedIds: [] },
      { id: 's2-customers', name: 'Customers',       total: 34, state: null, excludedIds: [] },
      { id: 's2-donors',    name: 'Donors',          total: 27, state: null, excludedIds: [] },
    ],
  },
  {
    id: 'ppfp-2024',
    name: '2024 Putt Putt Fore Puppies Mini Golf Tournament',
    collapsed: false,
    groups: [
      { id: 's3-sponsors',  name: 'Sponsors',        total: 15, state: null, excludedIds: [] },
      { id: 's3-players',   name: 'Players & Teams', total: 88, state: null, excludedIds: [] },
      { id: 's3-waitlist',  name: 'Waitlist Members',total: 4,  state: null, excludedIds: [] },
      { id: 's3-customers', name: 'Customers',       total: 29, state: null, excludedIds: [] },
      { id: 's3-donors',    name: 'Donors',          total: 19, state: null, excludedIds: [] },
    ],
  },
  {
    id: 'ppfp-2023',
    name: '2023 Putt Putt Fore Puppies Mini Golf Tournament',
    collapsed: false,
    groups: [
      { id: 's4-sponsors',  name: 'Sponsors',        total: 11, state: null, excludedIds: [] },
      { id: 's4-players',   name: 'Players & Teams', total: 72, state: null, excludedIds: [] },
      { id: 's4-waitlist',  name: 'Waitlist Members',total: 3,  state: null, excludedIds: [] },
      { id: 's4-customers', name: 'Customers',       total: 21, state: null, excludedIds: [] },
      { id: 's4-donors',    name: 'Donors',          total: 14, state: null, excludedIds: [] },
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

// ── Group status card (include states only) ───────────────────────────────────
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
  return null
}

// ── Active group card ─────────────────────────────────────────────────────────
function RecipientGroupCard({ group, onManage, onExclude, onRemove }) {
  const { state, name, selectedCount, excludedIds } = group
  const excludedCount = excludedIds?.length ?? 0

  if (state === 'excluded') {
    return (
      <div className="rl-group-card">
        <div className="rl-card-row">
          <FontAwesomeIcon icon={faUsersSlash} className="rl-card-icon rl-card-icon--excluded" />
          <div className="rl-card-info">
            <div className="rl-card-name">{name}</div>
            <div className="rl-card-status">Excluding All Recipients</div>
          </div>
          <div className="rl-card-actions">
            <GSButton buttonIcon={faCircleXmark} onClick={onRemove} isFocusable />
          </div>
        </div>
      </div>
    )
  }

  const statusLabel = state === 'selected'
    ? `${selectedCount ?? 0} Selected Recipients`
    : 'Sending to All Available Recipients'

  return (
    <div className="rl-group-card">
      <div className="rl-card-row">
        <FontAwesomeIcon icon={faCircleCheck} className="rl-card-icon rl-card-icon--included" />
        <div className="rl-card-info">
          <div className="rl-card-name">{name}</div>
          <div className="rl-card-status">{statusLabel}</div>
          {excludedCount > 0 && (
            <div className="rl-card-excluded-badge">
              <FontAwesomeIcon icon={faBan} />
              {excludedCount} Excluded
            </div>
          )}
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
            buttonIcon={faCircleXmark}
            onClick={onRemove}
            isFocusable
          />
        </div>
      </div>
      <div className="rl-card-disclaimer">
        Changes to this group may affect who receives this message
      </div>
    </div>
  )
}

// ── Unselected group card ─────────────────────────────────────────────────────
function UnselectedGroupCard({ group, onAdd, onExclude }) {
  const noAvailable = group.total === 0
  return (
    <div className="rl-unselected-card">
      <div className="rl-card-row">
        <FontAwesomeIcon icon={faUsers} className="rl-unselected-icon" />
        <div className="rl-card-info">
          <div className="rl-card-name">{group.name}</div>
        </div>
        <div className="rl-card-actions">
          <GSButton title="include" type="white" onClick={onAdd} isDisabled={noAvailable} isFocusable />
          <GSButton buttonIcon={faUsersSlash} onClick={onExclude} isFocusable />
        </div>
      </div>
    </div>
  )
}

// ── Collapsable section ───────────────────────────────────────────────────────
function RecipientSection({ section, onToggle, onManage, onExclude, onExcludeGroup, onRemove, onAdd }) {
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
        <div className="rl-section-cards">
          {section.groups.map(group =>
            group.state !== null ? (
              <RecipientGroupCard
                key={group.id}
                group={group}
                onManage={() => onManage(group, section.id)}
                onExclude={() => onExclude(group, section.id)}
                onRemove={() => onRemove(section.id, group.id)}
              />
            ) : (
              <UnselectedGroupCard
                key={group.id}
                group={group}
                onAdd={() => onAdd(section.id, group.id)}
                onExclude={() => onExcludeGroup(section.id, group.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
// panelPage: null | 'recipients' | 'group' | 'exclude'
export default function ExclusionPageV2() {
  const [panelPage, setPanelPage]             = useState('recipients')
  const [activeManageKey, setActiveManageKey] = useState(null) // { groupId, sectionId }
  const [sections, setSections]               = useState(INITIAL_SECTIONS)
  const [search, setSearch]                   = useState('')
  const [selectedPlayers, setSelected]        = useState(new Set())

  const activeGroup = useMemo(() => {
    if (!activeManageKey) return null
    const section = sections.find(s => s.id === activeManageKey.sectionId)
    return section?.groups.find(g => g.id === activeManageKey.groupId) ?? null
  }, [sections, activeManageKey])

  const isGroupInteractive   = panelPage === 'group' && activeGroup?.state === 'selected'
  const isExcludeInteractive = panelPage === 'exclude'
  const isListInteractive    = isGroupInteractive || isExcludeInteractive

  const allGroups   = sections.flatMap(s => s.groups)
  const showDedup   = allGroups.filter(g => g.state !== null).length >= 2
  const showExcluded = allGroups.some(g => g.state === 'excluded')

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

  const list = usePanelList({
    data: filteredPlayers,
    pageSize: 25,
    panelOpen: panelPage === 'group' || panelPage === 'exclude',
  })

  const toggleSection = id =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, collapsed: !s.collapsed } : s))

  const openPanel = (group, sectionId, page) => {
    setActiveManageKey({ groupId: group.id, sectionId })
    setSearch('')
    if (page === 'group' && group.state === 'selected') {
      setSelected(new Set(ALL_PLAYERS.slice(0, group.selectedCount ?? 0).map(p => p.id)))
    } else if (page === 'exclude') {
      setSelected(new Set(group.excludedIds ?? []))
    } else {
      setSelected(new Set())
    }
    setPanelPage(page)
    requestAnimationFrame(() => {
      const body = document.querySelector('.app-side-panel-body')
      if (body) body.scrollTop = 0
    })
  }

  const handleManage  = (group, sectionId) => openPanel(group, sectionId, 'group')
  const handleExclude = (group, sectionId) => openPanel(group, sectionId, 'exclude')

  const handleSetGroupMode = (mode) => {
    if (!activeManageKey) return
    const { groupId, sectionId } = activeManageKey
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, groups: s.groups.map(g => g.id === groupId ? { ...g, state: mode } : g) }
        : s
    ))
    if (mode === 'all') setSelected(new Set())
  }

  const handleRemoveGroup = (sectionId, groupId) =>
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, groups: s.groups.map(g => g.id === groupId ? { ...g, state: null, excludedIds: [] } : g) }
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

  const handleBack = () => {
    if (activeManageKey) {
      const { groupId, sectionId } = activeManageKey
      if (panelPage === 'group' && isGroupInteractive) {
        const count = selectedPlayers.size
        setSections(prev => prev.map(s =>
          s.id === sectionId ? {
            ...s,
            groups: s.groups.map(g => g.id === groupId ? { ...g, selectedCount: count } : g),
          } : s
        ))
      }
      if (panelPage === 'exclude') {
        const excludedIds = Array.from(selectedPlayers)
        setSections(prev => prev.map(s =>
          s.id === sectionId ? {
            ...s,
            groups: s.groups.map(g => g.id === groupId ? { ...g, excludedIds } : g),
          } : s
        ))
      }
    }
    panelPage === 'group' || panelPage === 'exclude'
      ? setPanelPage('recipients')
      : setPanelPage(null)
  }

  const panelTitle = panelPage === 'group'
    ? `Manage ${activeGroup?.name ?? 'Group'}`
    : panelPage === 'exclude'
      ? `Exclude ${activeGroup?.name ?? 'Group'}`
      : 'Email Recipients'

  const headerCount = isListInteractive ? selectedPlayers.size : (activeGroup?.total ?? 0)

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

      <AppSidePanel
        isOpen={panelPage !== null}
        onClose={handleBack}
        title={panelTitle}
        actions={[{ name: 'Continue', type: 'black', action: handleBack }]}
        bottomContent={(panelPage === 'group' || panelPage === 'exclude') ? (
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

            {(showDedup || showExcluded) && (
              <div className="ex-notes-section">
                <div className="ex-notifications">
                  {showDedup && (
                    <div className="ex-notification">
                      <FontAwesomeIcon icon={faPaperPlane} className="ex-notification-icon" />
                      <span>Emails are sent once per email address, even if selected in multiple groups.</span>
                    </div>
                  )}
                  {showExcluded && (
                    <div className="ex-notification">
                      <FontAwesomeIcon icon={faUsersSlash} className="ex-notification-icon" />
                      <span>Excluded groups will not receive this message, even if their members appear in another included group.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rl-content-wrapper">
              {sections.map(section => (
                <RecipientSection
                  key={section.id}
                  section={section}
                  onToggle={() => toggleSection(section.id)}
                  onManage={handleManage}
                  onExclude={handleExclude}
                  onExcludeGroup={handleExcludeGroup}
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
              header={`Manage ${activeGroup?.name ?? 'Group'} (${headerCount})`}
            />

            <div className="gmp-form-section">
              <div className="gmp-radio-row">
                <GSRadioButton
                  label={`All ${activeGroup?.name}`}
                  value="all"
                  selectedOption={{ value: activeGroup?.state }}
                  onClick={() => handleSetGroupMode('all')}
                />
                <GSRadioButton
                  label={`Select ${activeGroup?.name}`}
                  value="selected"
                  selectedOption={{ value: activeGroup?.state }}
                  onClick={() => handleSetGroupMode('selected')}
                />
              </div>

              <GroupStatusCard group={activeGroup} selectedCount={selectedPlayers.size} />
            </div>

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
                    className={`il-list-item${isGroupInteractive ? ' il-list-item--selectable' : ''}`}
                    onClick={isGroupInteractive ? () => togglePlayer(p.id) : undefined}
                  >
                    {isGroupInteractive && <ExCheckbox checked={selectedPlayers.has(p.id)} />}
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

        {/* ── Exclude individuals page ── */}
        {panelPage === 'exclude' && (
          <>
            <GSActionBar
              type="x-large-pad H3"
              header={`Exclude ${activeGroup?.name ?? 'Group'} (${selectedPlayers.size})`}
            />

            <div className="gmp-form-section">
              {selectedPlayers.size === 0 ? (
                <div className="gmp-status-card gmp-status-card--green">
                  <FontAwesomeIcon icon={faPaperPlane} className="gmp-status-icon" />
                  <div className="gmp-status-body">
                    <div className="gmp-status-title">No Exclusions</div>
                    <div className="gmp-status-subtitle">
                      All {activeGroup?.name?.toLowerCase()} with a valid email address will receive this message.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="gmp-status-card gmp-status-card--orange">
                  <FontAwesomeIcon icon={faBan} className="gmp-status-icon" />
                  <div className="gmp-status-body">
                    <div className="gmp-status-title">{selectedPlayers.size} Excluded</div>
                    <div className="gmp-status-subtitle">
                      These {activeGroup?.name?.toLowerCase()} will not receive this message, even if included in another group.
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                    className="il-list-item il-list-item--selectable"
                    onClick={() => togglePlayer(p.id)}
                  >
                    <ExCheckbox checked={selectedPlayers.has(p.id)} />
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
