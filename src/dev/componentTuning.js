import saved from '../styles/component-tuning.json'

// Per-selector CSS overrides ({ 'gs-button': { 'padding-top': '12' } }) that
// restyle every instance of a shared component. The saved copy lives in
// styles/component-tuning.json and is injected as one <style> tag — in prod
// too — while the dev-only Component Tuner (ComponentTuner.jsx) edits it
// live and writes it back through the Vite endpoint in vite.config.js.

export const TUNABLE_PROPS = [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'gap',
  'font-size',
  'line-height',
  'border-radius',
  'opacity',
  'display',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'justify-content',
]

// Keyword props — only these values are written.
export const ENUMS = {
  display: ['flex'],
  'flex-direction': ['row', 'column'],
  'flex-wrap': ['wrap', 'nowrap'],
  'align-items': ['flex-start', 'center', 'flex-end', 'stretch'],
  'justify-content': ['flex-start', 'center', 'flex-end', 'space-between'],
}

const UNITLESS = new Set(['line-height', 'opacity'])

const NUMBER = /^-?\d*\.?\d+$/
const WITH_UNIT = /^-?\d*\.?\d+(px|rem|em|%)$/

// "12" -> "12px" (line-height and opacity stay unitless); null if not a usable value.
function normalize(prop, raw) {
  const v = String(raw).trim()
  if (ENUMS[prop]) return ENUMS[prop].includes(v) ? v : null
  if (WITH_UNIT.test(v)) return v
  if (NUMBER.test(v)) return UNITLESS.has(prop) ? v : `${v}px`
  return null
}

const SAFE_SELECTOR = /^[^{};<>]+$/

function toCss(tuning) {
  return Object.entries(tuning)
    .filter(([selector]) => SAFE_SELECTOR.test(selector))
    .map(([selector, decls]) => {
      const body = Object.entries(decls)
        .filter(([prop]) => TUNABLE_PROPS.includes(prop))
        .map(([prop, raw]) => [prop, normalize(prop, raw)])
        .filter(([, v]) => v !== null)
        .map(([prop, v]) => `${prop}:${v} !important`)
        .join(';')
      return body && `${selector}{${body}}`
    })
    .filter(Boolean)
    .join('\n')
}

let tuning = JSON.parse(JSON.stringify(saved))
const listeners = new Set()
let status = 'saved' // 'saved' | 'saving' | 'error'
let saveTimer

function paint() {
  let el = document.getElementById('component-tuning')
  if (!el) {
    el = document.createElement('style')
    el.id = 'component-tuning'
    document.head.appendChild(el)
  }
  el.textContent = toCss(tuning)
}

const emit = () => listeners.forEach(fn => fn())

function scheduleSave() {
  if (!import.meta.env.DEV) return
  status = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      const res = await fetch('/__tuning/save', { method: 'POST', body: JSON.stringify(tuning) })
      status = res.ok ? 'saved' : 'error'
    } catch {
      status = 'error'
    }
    emit()
  }, 400)
}

function commit(next) {
  tuning = next
  paint()
  scheduleSave()
  emit()
}

export const getTuning = () => tuning
export const getStatus = () => status
export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Set several props on one selector in one commit; '' / null clears a prop.
export function setValues(selector, values) {
  const decls = { ...(tuning[selector] ?? {}) }
  for (const [prop, value] of Object.entries(values)) {
    if (value === '' || value == null) delete decls[prop]
    else decls[prop] = value
  }
  const next = { ...tuning }
  if (Object.keys(decls).length) next[selector] = decls
  else delete next[selector]
  commit(next)
}

export function setValue(selector, props, value) {
  setValues(selector, Object.fromEntries([].concat(props).map(prop => [prop, value])))
}

export function resetSelector(selector) {
  const next = { ...tuning }
  delete next[selector]
  commit(next)
}

paint()

// The endpoint rewrites the JSON on every save; accept it here so Vite
// doesn't full-reload the page out from under an in-progress edit.
if (import.meta.hot) import.meta.hot.accept('../styles/component-tuning.json', () => {})
