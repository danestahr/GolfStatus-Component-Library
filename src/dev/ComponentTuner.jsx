import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  getStatus,
  getTuning,
  resetSelector,
  setValues,
  subscribe,
} from './componentTuning.js'
import './ComponentTuner.scss'

// Option/Alt + click anything (Shift adds to the selection) to tune the shared component (or class) under
// it: padding, gap, font size, line height, radius. Edits apply live to every
// instance and autosave to src/styles/component-tuning.json. Dev-only.

const FIELDS = [
  { label: 'Padding', props: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'], all: true },
  { label: 'Gap', props: ['gap'] },
  { label: 'Font size', props: ['font-size'] },
  { label: 'Line height', props: ['line-height'] },
  { label: 'Border radius', props: ['border-radius'] },
  { label: 'Opacity', props: ['opacity'] },
]
const SIDES = [
  ['padding-top', 'T'],
  ['padding-right', 'R'],
  ['padding-bottom', 'B'],
  ['padding-left', 'L'],
]
// Arrow-key step for props that aren't whole pixels (Shift multiplies by 4).
const STEPS = { 'line-height': 0.1, opacity: 0.05 }
// Figma-style auto layout on the selected element's children.
const DIRECTIONS = [
  ['Row', 'row'],
  ['Column', 'column'],
]
const ALIGN = [
  ['Start', 'flex-start'],
  ['Center', 'center'],
  ['End', 'flex-end'],
  ['Fill', 'stretch'],
]
const JUSTIFY = [
  ['Start', 'flex-start'],
  ['Center', 'center'],
  ['End', 'flex-end'],
  ['Between', 'space-between'],
]
const VALID_INPUT = /^-?\d*\.?\d*(px|rem|em|%)?$/

// A selector that matches only `el`: tag + first class + :nth-child, with
// ancestors prepended until it's unique. Structure-based, so it follows the
// instance only while the page layout around it stays the same.
const STATE_CLASS = /^(enabled|disabled|active|selected|dark|light)$/
function instanceSelector(el) {
  const parts = []
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const cls = [...node.classList].find(c => !STATE_CLASS.test(c))
    const index = [...node.parentElement.children].indexOf(node) + 1
    parts.unshift(`${node.tagName.toLowerCase()}${cls ? `.${CSS.escape(cls)}` : ''}:nth-child(${index})`)
    const selector = parts.join(' ')
    if (document.querySelectorAll(selector).length === 1) return selector
  }
  return parts.join(' ')
}

function candidatesFor(el) {
  const out = []
  const seen = new Set()
  const add = (selector, kind, node) => {
    if (!selector || seen.has(selector)) return
    seen.add(selector)
    out.push({ selector, kind, node })
  }
  let node = el
  for (let i = 0; node && node !== document.body && i < 10; i++, node = node.parentElement) {
    const tag = node.tagName.toLowerCase()
    if (tag.startsWith('gs-')) add(tag, 'component', node)
    const cls = [...node.classList][0]
    if (cls && !STATE_CLASS.test(cls)) add(`.${cls}`, 'class', node)
  }
  // The element itself leads; a bare <div> with no component/class still
  // gets an entry (a path to just that element).
  if (!out.some(c => c.node === el)) out.unshift({ selector: instanceSelector(el), kind: 'element', node: el })
  return out
}

const isNavigable = el => el && el !== document.body && el !== document.documentElement && el.id !== 'root'

function currentValue(selector, anchor, prop) {
  let el = null
  try {
    el = anchor?.closest(selector) ?? document.querySelector(selector)
  } catch {
    return ''
  }
  if (!el) return ''
  const v = getComputedStyle(el).getPropertyValue(prop)
  return v.endsWith('px') ? String(parseFloat(v)) : v
}

// Viewport rects of the selected elements, kept current through scrolling,
// resizing, and the tuner's own edits (which change their size).
function useRects(node, extras, tuning) {
  const [rects, setRects] = useState([])
  useLayoutEffect(() => {
    const measure = () => setRects([node, ...extras].map(n => (n?.isConnected ? n.getBoundingClientRect() : null)))
    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [node, extras, tuning])
  return rects
}

const commonParent = els => {
  let p = els[0]?.parentElement
  while (p && !els.every(el => p.contains(el))) p = p.parentElement
  return p
}

export default function ComponentTuner() {
  const [target, setTarget] = useState(null) // { anchor, candidates }
  const [selector, setSelector] = useState('')
  const [custom, setCustom] = useState('')
  const [instance, setInstance] = useState(false)
  const [extras, setExtras] = useState([]) // other selected elements (Shift + Option + click)
  const tuning = useSyncExternalStore(subscribe, getTuning)
  const status = useSyncExternalStore(subscribe, getStatus)
  const panelRef = useRef(null)

  // Select an element: it becomes the highlighted target. `trail` is the leaf
  // the user originally clicked, so Enter can walk back down toward it.
  const select = (el, trail, keepExtras = false) => {
    if (!keepExtras) setExtras([])
    const candidates = candidatesFor(el)
    setTarget({ anchor: el, trail, candidates })
    setSelector(candidates[0].selector)
    setCustom('')
    setInstance(false)
  }
  const nav = useRef({})

  useEffect(() => {
    // Option/Alt + click picks the element. The press events are swallowed
    // too, so the page's own mousedown/click handlers (buttons, links,
    // tiles) don't fire underneath.
    const swallow = e => {
      if (!e.altKey || panelRef.current?.contains(e.target)) return false
      e.preventDefault()
      e.stopPropagation()
      return true
    }
    const onClick = e => {
      if (!swallow(e)) return
      const { node, extras, select, setExtras } = nav.current
      if (!(e.shiftKey && node)) return select(e.target, e.target)
      // Shift adds/removes from the selection.
      const el = e.target
      if (el === node) {
        if (extras.length) {
          select(extras[0], extras[0], true)
          setExtras(extras.slice(1))
        }
      } else if (extras.includes(el)) setExtras(extras.filter(x => x !== el))
      else setExtras([...extras, el])
    }
    const onKey = e => {
      if (e.key === 'Escape') return setTarget(null)
      const { node, trail, select } = nav.current
      if (!node || e.altKey || e.metaKey || e.ctrlKey) return
      // Leave the panel's own inputs/buttons to their normal keys.
      if (panelRef.current?.contains(document.activeElement) || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return
      if (e.key === '\\') {
        // Up to the parent, like Figma.
        e.preventDefault()
        if (isNavigable(node.parentElement)) select(node.parentElement, trail)
      } else if (e.key === 'Enter') {
        // Down toward where you clicked, else the first child.
        e.preventDefault()
        const kids = [...node.children].filter(c => c.offsetParent !== null || getComputedStyle(c).position === 'fixed')
        const child = kids.find(c => c.contains(trail)) ?? kids[0]
        if (child) select(child, trail)
      }
    }
    const PRESS = ['pointerdown', 'mousedown', 'mouseup', 'auxclick']
    PRESS.forEach(type => window.addEventListener(type, swallow, true))
    window.addEventListener('click', onClick, true)
    window.addEventListener('keydown', onKey, true)
    return () => {
      PRESS.forEach(type => window.removeEventListener(type, swallow, true))
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [])

  const node = target?.candidates.find(c => c.selector === selector)?.node
  nav.current = { node, trail: target?.trail, select, extras, setExtras }
  const rects = useRects(node, extras, tuning)
  const rect = rects[0]
  // Re-measured each render so the "this instance" path tracks the live DOM.
  const scoped = instance && node?.isConnected ? instanceSelector(node) : selector

  const matchCount = useMemo(() => {
    try {
      return scoped ? document.querySelectorAll(scoped).length : 0
    } catch {
      return 0
    }
  }, [scoped, tuning])

  if (!target) return null

  const decls = tuning[scoped] ?? {}
  // Every selected element gets the same edit, each through its own selector.
  const extraSelector = el => (instance ? instanceSelector(el) : candidatesFor(el)[0].selector)
  const allScoped = [...new Set([scoped, ...extras.filter(el => el.isConnected).map(extraSelector)])]
  const apply = values => allScoped.forEach(sel => setValues(sel, values))
  const propsToValues = (props, value) => Object.fromEntries(props.map(prop => [prop, value]))
  const tuned = Object.keys(tuning)

  const dispatchEnter = () => {
    const kids = [...node.children]
    const child = kids.find(c => c.contains(target.trail)) ?? kids[0]
    if (child) select(child, target.trail)
  }

  const step = (e, field) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const first = field.props[0]
    const cur = parseFloat(decls[first] ?? currentValue(scoped, target.anchor, first)) || 0
    const delta = (e.key === 'ArrowUp' ? 1 : -1) * (STEPS[field.props[0]] ?? 1) * (e.shiftKey ? 4 : 1)
    const next = Math.round((cur + delta) * 100) / 100
    apply(propsToValues(field.props, String(field.props[0] === 'opacity' ? Math.min(1, Math.max(0, next)) : next)))
  }

  const change = (props, raw) => {
    if (VALID_INPUT.test(raw)) apply(propsToValues(props, raw))
  }

  return (
    <>
    {rects.map((r, i) => r && (
      <div
        key={i}
        className={`ct-highlight${i ? ' extra' : ''}`}
        style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
      >
        {i === 0 && <span className="ct-tag">{node.tagName.toLowerCase()}{node.classList[0] ? `.${node.classList[0]}` : ''}</span>}
      </div>
    ))}
    <div className="ct-panel" ref={panelRef}>
      <div className="ct-head">
        <strong>Component Tuner</strong>
        <span className={`ct-status ${status}`}>
          {status === 'saving' ? 'Saving…' : status === 'error' ? 'Save failed' : 'Saved'}
        </span>
        <button className="ct-x" onClick={() => setTarget(null)} aria-label="Close">×</button>
      </div>

      {extras.length > 0 && (
        <div className="ct-multi">
          <strong>{extras.length + 1} selected</strong> · edits apply to all
          <div className="ct-multi-actions">
            <button className="ct-btn" onClick={() => {
              const p = commonParent([node, ...extras])
              if (isNavigable(p)) select(p, target.trail)
            }}>
              Select common parent
            </button>
            <button className="ct-btn" onClick={() => setExtras([])}>Clear others</button>
          </div>
        </div>
      )}

      <label className="ct-label">Target</label>
      <select className="ct-select" value={selector} onChange={e => setSelector(e.target.value)}>
        {target.candidates.map(c => (
          <option key={c.selector} value={c.selector}>
            {c.selector} ({c.kind})
          </option>
        ))}
        {!target.candidates.some(c => c.selector === selector) && selector && (
          <option value={selector}>{selector} (custom)</option>
        )}
      </select>
      <input
        className="ct-input ct-custom"
        placeholder="…or type a selector, e.g. gs-button .button-icon"
        value={custom}
        onChange={e => setCustom(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && custom.trim() && setSelector(custom.trim())}
      />
      <div className="ct-scope">
        <button className={!instance ? 'on' : ''} onClick={() => setInstance(false)}>All instances</button>
        <button className={instance ? 'on' : ''} disabled={!node} onClick={() => setInstance(true)}>
          Just this one
        </button>
      </div>
      <div className="ct-hint">
        {instance
          ? `Only this ${selector} · ${matchCount} match`
          : `${matchCount} on this page · edits apply to every one, everywhere`}
      </div>

      {FIELDS.map(field => (
        <div className="ct-row" key={field.label}>
          <label className="ct-label">{field.label}</label>
          {field.all && (
            <input
              className="ct-input"
              placeholder="all"
              value=""
              onChange={e => change(field.props, e.target.value)}
              onKeyDown={e => step(e, field)}
            />
          )}
          {field.all ? (
            <div className="ct-sides">
              {SIDES.map(([prop, side]) => (
                <label key={prop} className="ct-side">
                  <span>{side}</span>
                  <input
                    className="ct-input"
                    value={decls[prop] ?? ''}
                    placeholder={currentValue(scoped, target.anchor, prop)}
                    onChange={e => change([prop], e.target.value)}
                    onKeyDown={e => step(e, { props: [prop] })}
                  />
                </label>
              ))}
            </div>
          ) : (
            <input
              className="ct-input"
              value={decls[field.props[0]] ?? ''}
              placeholder={currentValue(scoped, target.anchor, field.props[0])}
              onChange={e => change(field.props, e.target.value)}
              onKeyDown={e => step(e, field)}
            />
          )}
        </div>
      ))}

      <label className="ct-label">Layout (children)</label>
      <div className="ct-seg">
        {DIRECTIONS.map(([label, value]) => (
          <button
            key={value}
            className={decls.display === 'flex' && decls['flex-direction'] === value ? 'on' : ''}
            onClick={() => apply({ display: 'flex', 'flex-direction': value })}
          >
            {label}
          </button>
        ))}
        <button
          className={decls['flex-wrap'] === 'wrap' ? 'on' : ''}
          onClick={() => apply({ display: 'flex', 'flex-wrap': decls['flex-wrap'] === 'wrap' ? 'nowrap' : 'wrap' })}
        >
          Wrap
        </button>
        <button
          disabled={!decls.display && !decls['flex-direction']}
          onClick={() => apply({ display: '', 'flex-direction': '', 'flex-wrap': '', 'align-items': '', 'justify-content': '' })}
        >
          Off
        </button>
      </div>
      {[['Align', 'align-items', ALIGN], ['Justify', 'justify-content', JUSTIFY]].map(([label, prop, options]) => (
        <div className="ct-seg-row" key={prop}>
          <span>{label}</span>
          <div className="ct-seg">
            {options.map(([text, value]) => (
              <button
                key={value}
                className={decls[prop] === value ? 'on' : ''}
                onClick={() => apply({ display: 'flex', [prop]: decls[prop] === value ? '' : value })}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="ct-actions">
        <button className="ct-btn" disabled={!tuning[scoped]} onClick={() => allScoped.forEach(resetSelector)}>
          Reset {instance ? 'this instance' : selector}
        </button>
      </div>

      {tuned.length > 0 && (
        <div className="ct-tuned">
          <label className="ct-label">Tuned ({tuned.length})</label>
          {tuned.map(sel => (
            <button key={sel} className="ct-chip" onClick={() => { setInstance(false); setSelector(sel) }}>
              {sel}
            </button>
          ))}
        </div>
      )}
      <div className="ct-nav">
        <button className="ct-btn" disabled={!isNavigable(node?.parentElement)} onClick={() => select(node.parentElement, target.trail)}>
          ↑ Parent <kbd>\</kbd>
        </button>
        <button className="ct-btn" disabled={!node?.children.length} onClick={() => dispatchEnter()}>
          ↓ Child <kbd>Enter</kbd>
        </button>
      </div>
      <div className="ct-hint">Arrow keys nudge · Shift = ×4 · blank = untouched · Option/Alt + click to retarget · + Shift to multi-select</div>
    </div>
    </>
  )
}
