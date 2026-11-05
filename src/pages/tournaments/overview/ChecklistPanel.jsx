import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { faCheck, faMagnifyingGlass, faPlus, faWandMagicSparkles, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GSActionBar from '../../../gs-lib/components/gs-action-bar'
import GSButton from '../../../gs-lib/components/gs-button'
import GSinput from '../../../gs-lib/components/gs-input'
import GSCheckbox from '../../../gs-lib/components/gs-checkbox'
import GSToggle from '../../../gs-lib/components/gs-toggle'
import AppSidePanel from '../../../components/AppSidePanel'
import { ChecklistItemFields } from './ChecklistPanelContent.jsx'
import {
  ME, PHASES, SUGGESTIONS, isDone, isOverdue, longDue, newItemId, saveChecklist,
} from '../../../data/mockChecklist'
import './ChecklistPanel.scss'

// ISO due date for a suggestion, `due` days from the tournament start.
const suggestionDue = (s, startISO) => {
  const [y, m, d] = startISO.split('-').map(Number)
  const date = new Date(y, m - 1, d + s.due)
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Progress ring: grey track, black arc (green once everything is done).
function Ring({ percent, size = 84, stroke = 16, complete }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg className={`clp-ring${complete ? ' complete' : ''}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="clp-ring-track" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} className="clp-ring-arc" strokeWidth={stroke}
        strokeDasharray={`${(c * percent) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {complete && <path d={`M${size * 0.36} ${size * 0.52}l${size * 0.1} ${size * 0.1}l${size * 0.19}-${size * 0.2}`} className="clp-ring-check" />}
    </svg>
  )
}

// Event checklist slide-out for the Overview page: progress hero, suggested
// tasks, search, and tasks grouped by phase. One AppSidePanel swaps between
// the list and a task screen (`screen`: 'list' | 'new' | task id) — never a
// second stacked panel. `items` live in the page so the widget stays in sync.
export default function ChecklistPanel({ isOpen, onClose, tournament, items, onItemsChange }) {
  const navigate = useNavigate()
  const [showCompleted, setShowCompleted] = useState(true)
  const [search, setSearch] = useState('')
  const [hidden, setHidden] = useState({}) // phase id -> collapsed
  const [dismissed, setDismissed] = useState([])
  const [screen, setScreen] = useState('list')
  const [draft, setDraft] = useState(null)

  const commit = next => {
    onItemsChange(next)
    saveChecklist(tournament, next)
  }

  const total = items.length
  const done = items.filter(i => isDone(i, tournament)).length
  const percent = total ? Math.round((done / total) * 100) : 0
  const overdue = items.filter(i => isOverdue(i, tournament)).length

  const toggle = id => commit(items.map(i => (i.id === id ? { ...i, done: !i.done } : i)))

  const openItem = id => { setDraft({ ...items.find(i => i.id === id) }); setScreen(id) }
  const addItem = (base = {}) => {
    setDraft({
      id: newItemId(), phase: 'plan', title: '', why: '', auto: null, to: null,
      dueISO: tournament.startISO, assignee: ME, notes: '', done: false, ...base,
    })
    setScreen('new')
  }
  const addSuggestion = s => {
    commit([...items, {
      id: newItemId(), phase: s.phase, title: s.title, why: s.why, auto: null, to: null,
      dueISO: suggestionDue(s, tournament.startISO), assignee: ME, notes: '', done: false,
    }])
    setDismissed(d => [...d, s.key])
  }

  const backToList = () => setScreen('list')
  const closePanel = () => { onClose(); setScreen('list') }
  const saveItem = () => {
    if (!draft.title.trim()) return
    commit(screen === 'new' ? [...items, draft] : items.map(i => (i.id === draft.id ? draft : i)))
    backToList()
  }
  const deleteItem = () => { commit(items.filter(i => i.id !== draft.id)); backToList() }

  const suggestions = SUGGESTIONS.filter(s => !dismissed.includes(s.key) && !items.some(i => i.title === s.title))
  const q = search.trim().toLowerCase()
  const visible = items.filter(i =>
    (showCompleted || !isDone(i, tournament)) && (!q || i.title.toLowerCase().includes(q)))

  const onList = screen === 'list'
  const panelActions = onList
    ? []
    : [
        { name: 'Save', type: 'black', action: saveItem },
        { name: 'Cancel', type: 'light-grey', action: backToList },
        ...(screen === 'new' ? [] : [{ name: 'Delete Task', type: 'transparent red', action: deleteItem }]),
      ]

  return (
    <AppSidePanel
      isOpen={isOpen}
      onClose={closePanel}
      onBack={onList ? closePanel : backToList}
      title={onList ? 'Tournament Checklist' : screen === 'new' ? 'Add Task' : 'Task'}
      actions={panelActions}
      actionsKey={onList ? 'list' : screen === 'new' ? 'new' : 'edit'}
    >
      {onList ? (
      <div className="clp">
        <GSActionBar
          type="x-large-pad H3"
          header="Tournament Checklist"
          pageActions={[{ buttonTitle: 'Add Item', buttonIcon: faPlus, type: 'black', actionClick: () => addItem() }]}
        />
      <div className="clp-body">
        <section className="clp-hero">
          <Ring percent={percent} complete={percent === 100} />
          <div className="clp-hero-text">
            <strong>{percent}% Complete</strong>
            <span>{done}/{total} Tasks</span>
            <span className="clp-hero-start">Tournament starts on {longDue(tournament.startISO)}</span>
            {overdue > 0 && <span className="clp-pill clp-pill--red">{overdue} overdue</span>}
          </div>
          <GSToggle
            label={null}
            rowReverse
            value={showCompleted}
            onClick={() => setShowCompleted(v => !v)}
            falseDescription="Show Completed Items"
            trueDescription="Show Completed Items"
            style={{ marginLeft: 'auto' }}
          />
        </section>

        {suggestions.length > 0 && (
          <section className="clp-suggested">
            {suggestions.map(s => (
              <div key={s.key} className="clp-suggested-card">
                <div className="clp-suggested-text">
                  <div>
                    <div className="clp-title">{s.title}</div>
                    <div className="clp-meta">Due {longDue(suggestionDue(s, tournament.startISO))}</div>
                  </div>
                  <GSButton type="light-grey" size="secondary" isPill title="Suggested" buttonIcon={faWandMagicSparkles} hoverType="none" style={{ cursor: 'default' }} />
                </div>
                <GSButton type="light-grey" buttonIcon={faPlus} isFocusable onClick={() => addSuggestion(s)} />
              </div>
            ))}
          </section>
        )}

        <div className="clp-search">
          <GSinput
            leftIcon={faMagnifyingGlass}
            rightIcon={search ? faXmark : null}
            rightIconClick={() => setSearch('')}
            placeholder="Search..."
            textValue={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="clp-phases">
          {PHASES.map(phase => {
            const all = items.filter(i => i.phase === phase.id)
            const rows = visible.filter(i => i.phase === phase.id)
            if (all.length === 0 || rows.length === 0) return null
            const phaseDone = all.filter(i => isDone(i, tournament)).length
            const phasePct = Math.round((phaseDone / all.length) * 100)
            const collapsed = hidden[phase.id]
            return (
              <section key={phase.id} className={`clp-phase${phasePct === 100 ? ' complete' : ''}`}>
                <header>
                  <Ring percent={phasePct} size={36} stroke={7} complete={phasePct === 100} />
                  <div className="clp-phase-text">
                    <div className="clp-phase-title">{phase.label}</div>
                    <div className="clp-meta">{phaseDone}/{all.length} ({phasePct}%)</div>
                  </div>
                  <button type="button" className="clp-hide" onClick={() => setHidden(h => ({ ...h, [phase.id]: !collapsed }))}>
                    {collapsed ? 'Show' : 'Hide'}
                  </button>
                </header>
                {!collapsed && rows.map(item => {
                  const complete = isDone(item, tournament)
                  const late = isOverdue(item, tournament)
                  return (
                    <div key={item.id} className={`clp-card${complete ? ' complete' : ''}`}>
                      <div className={`clp-check${item.auto ? ' locked' : ''}`}>
                        <GSCheckbox checked={complete} onClick={() => !item.auto && toggle(item.id)} />
                      </div>
                      <button type="button" className="clp-card-main" onClick={() => openItem(item.id)}>
                        <span className="clp-title">{item.title}</span>
                        <span className={`clp-meta${late ? ' overdue' : ''}`}>
                          {late ? 'Overdue · ' : ''}Due {longDue(item.dueISO)} · {item.assignee}
                        </span>
                        {item.why && <span className="clp-meta clp-why">{item.why}</span>}
                      </button>
                      {item.auto && complete && <span className="clp-pill clp-pill--green"><FontAwesomeIcon icon={faCheck} /> Auto</span>}
                      {item.auto && !complete && <span className="clp-pill clp-pill--blue"><FontAwesomeIcon icon={faWandMagicSparkles} /> Auto</span>}
                    </div>
                  )
                })}
              </section>
            )
          })}
          {visible.length === 0 && <div className="clp-empty">No tasks match.</div>}
        </div>
      </div>
      </div>
      ) : (
        <ChecklistItemFields
          draft={draft}
          isNew={screen === 'new'}
          onChange={patch => setDraft(d => ({ ...d, ...patch }))}
          onSubmit={saveItem}
          onGo={to => { closePanel(); navigate(to.replace(':id', tournament.id)) }}
        />
      )}
    </AppSidePanel>
  )
}
