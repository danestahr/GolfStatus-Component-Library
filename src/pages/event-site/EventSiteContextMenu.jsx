import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ELEMENT_DEFS } from '../../components/orders-forms/ColorExplorationFields.jsx'
import {
  ELEMENT_ROLES,
  elementKeysAt,
  buttonVariantAt,
} from '../../data/eventSiteElements.js'
import { BUTTON_APPEARANCES, BUTTON_COLORS, BUTTON_IDS, buttonOverrideKey, buttonStyleKey } from '../../data/eventSiteButtons.js'
import { NODE_STYLE_PROPS, selectorFor } from '../../data/eventSiteNodeStyles.js'
import { SCALE_STEPS } from '../../gs-lib/helpers/colorScale.js'
import './EventSiteContextMenu.scss'

// Per-button color overrides (Background/Text/Outline pickers) are built but
// hidden for now — the menu only lets a button pick its style. Flip this to
// bring them back.
const SHOW_BUTTON_COLOR_OVERRIDES = false

const DEFS_BY_KEY = Object.fromEntries(ELEMENT_DEFS.map(def => [def.key, def]))
const VALID_KEYS = new Set(Object.keys(DEFS_BY_KEY))
const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

// getComputedStyle hands back rgb()/rgba() — an <input type="color"> and the
// swatches want hex.
function toHex(css) {
  const m = css?.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/)
  if (!m) return css?.startsWith('#') ? css : '#000000'
  return '#' + [m[1], m[2], m[3]].map(n => Number(n).toString(16).padStart(2, '0')).join('')
}

// A button override's <select> value <-> the { family, step } / { hex }
// shape data/eventSiteButtons.js stores.
function overrideToValue(override) {
  if (!override) return 'default'
  if (override.hex) return 'custom'
  if (override.family === 'white' || override.family === 'black') return override.family
  return `${override.family}-${override.step}`
}
function valueToOverride(value) {
  if (value === 'default') return null
  if (value === 'white' || value === 'black') return { family: value }
  const [family, step] = value.split('-')
  return { family, step: Number(step) }
}

const SCALE_GROUPS = [
  { family: 'primary', label: 'Primary' },
  { family: 'secondary', label: 'Secondary' },
  { family: 'grey', label: 'Neutral' },
]

const PART_CSS = { bg: 'backgroundColor', text: 'color', border: 'borderTopColor' }

export default function EventSiteContextMenu({
  menu,
  pageEl,
  canEditElements,
  canEditButtons,
  blockedReason,
  mode,
  tint,
  siteStyle,
  onChangeStyle,
  onClose,
}) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ left: menu.x, top: menu.y })

  const buttonVariant = useMemo(() => buttonVariantAt(menu.node), [menu.node])
  const elementKeys = useMemo(() => elementKeysAt(menu.node, VALID_KEYS), [menu.node])
  const [selected, setSelected] = useState(buttonVariant ? 'button' : elementKeys[0] ?? 'node')
  const [scope, setScope] = useState('one')

  // Keep the menu on screen.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setPos({
      left: Math.max(8, Math.min(menu.x, window.innerWidth - width - 8)),
      top: Math.max(8, Math.min(menu.y, window.innerHeight - height - 8)),
    })
  }, [menu.x, menu.y, selected])

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    const onDown = e => {
      if (!ref.current?.contains(e.target)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    const onScroll = e => {
      if (!ref.current?.contains(e.target)) onClose()
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  const roleHex = role => toHex(getComputedStyle(pageEl).getPropertyValue(role.cssVar).trim())

  // ---- Element assignment ------------------------------------------------
  const assignElement = (def, roleKey) => {
    const value = roleKey && roleKey !== def.baseRoleKey ? { role: roleKey } : null
    onChangeStyle(prev => {
      const next = { ...(prev.elementOverrides ?? {}) }
      // Only the theme being viewed — every theme keeps its own assignments.
      ;['light', 'dark'].forEach(m => {
        const key = `${m}-${tint}-${def.key}`
        if (value) next[key] = value
        else delete next[key]
      })
      return { ...prev, elementOverrides: next }
    })
  }

  // ---- Button override ---------------------------------------------------
  const setButtonPart = (part, override) => {
    if (!buttonVariant) return
    const key = buttonOverrideKey(mode, tint, buttonVariant.color, buttonVariant.appearance, part)
    onChangeStyle(prev => {
      const next = { ...(prev.buttonOverrides ?? {}) }
      if (override) next[key] = override
      else delete next[key]
      return { ...prev, buttonOverrides: next }
    })
  }

  const setButtonStyle = patch => {
    if (!buttonVariant) return
    onChangeStyle(prev => ({
      ...prev,
      buttonStyles: {
        ...(prev.buttonStyles ?? {}),
        [buttonStyleKey(tint, buttonVariant.id)]: {
          color: `${buttonVariant.color}-color`,
          appearance: buttonVariant.appearance,
          ...(prev.buttonStyles?.[buttonStyleKey(tint, buttonVariant.id)] ?? {}),
          ...patch,
        },
      },
    }))
  }
  const resetButtonStyle = () => {
    if (!buttonVariant) return
    onChangeStyle(prev => {
      const next = { ...(prev.buttonStyles ?? {}) }
      delete next[buttonStyleKey(tint, buttonVariant.id)]
      return { ...prev, buttonStyles: next }
    })
  }

  const renderElementPanel = () => {
    const def = DEFS_BY_KEY[selected]
    if (!def) return null
    if (!canEditElements) return <div className="es-ctx-note">{blockedReason}</div>
    const override = siteStyle.elementOverrides?.[`${mode}-${tint}-${def.key}`]
    const activeRole = override?.role ?? (override ? null : def.baseRoleKey)
    const base = ELEMENT_ROLES.find(r => r.key === def.baseRoleKey)
    return (
      <>
        <div className="es-ctx-subhead">Designation</div>
        <div className="es-ctx-list">
          {ELEMENT_ROLES.map(role => (
            <button
              key={role.key}
              type="button"
              className={`es-ctx-item${activeRole === role.key ? ' is-active' : ''}`}
              onClick={() => assignElement(def, role.key)}
            >
              <span className="es-ctx-swatch" style={{ background: roleHex(role) }} />
              <span className="es-ctx-item-label">{role.label}</span>
              {role.key === def.baseRoleKey && <span className="es-ctx-tag">default</span>}
              {activeRole === role.key && <span className="es-ctx-check">✓</span>}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="es-ctx-reset"
          disabled={!override}
          onClick={() => assignElement(def, null)}
        >
          Reset to default{base ? ` (${base.label})` : ''}
        </button>
      </>
    )
  }

  const renderButtonPanel = () => {
    if (!canEditButtons) return <div className="es-ctx-note">{blockedReason}</div>
    const { color, appearance } = buttonVariant
    const parts = BUTTON_APPEARANCES.find(a => a.key === appearance).parts
    const button = menu.node.closest('gs-button')
    const computed = getComputedStyle(button)
    const isSaved = !!siteStyle.buttonStyles?.[buttonStyleKey(tint, buttonVariant.id)]
    return (
      <>
        <div className="es-ctx-subhead">Color</div>
        <div className="es-ctx-options">
          {BUTTON_COLORS.map(option => (
            <button
              key={option.key}
              type="button"
              className={`es-ctx-option${color === option.key ? ' is-active' : ''}`}
              onClick={() => setButtonStyle({ color: `${option.key}-color` })}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="es-ctx-subhead">Style</div>
        <div className="es-ctx-options">
          {BUTTON_APPEARANCES.map(option => (
            <button
              key={option.key}
              type="button"
              className={`es-ctx-option${appearance === option.key ? ' is-active' : ''}`}
              onClick={() => setButtonStyle({ appearance: option.key })}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button type="button" className="es-ctx-reset" disabled={!isSaved} onClick={resetButtonStyle}>
          Reset to default
        </button>
        {SHOW_BUTTON_COLOR_OVERRIDES && parts.map(([part, label]) => {
          const key = buttonOverrideKey(mode, tint, color, appearance, part)
          const override = siteStyle.buttonOverrides?.[key] ?? null
          const liveHex = toHex(computed[PART_CSS[part]])
          return (
            <div className="es-ctx-part" key={part}>
              <span className="es-ctx-part-label">{label}</span>
              <input
                type="color"
                className="es-ctx-color"
                value={override?.hex ?? liveHex}
                onChange={e => setButtonPart(part, { hex: e.target.value })}
                aria-label={`${label} custom color`}
              />
              <select
                className="es-ctx-select"
                value={overrideToValue(override)}
                onChange={e => e.target.value !== 'custom' && setButtonPart(part, valueToOverride(e.target.value))}
                aria-label={`${label} designation`}
              >
                <option value="default">Default</option>
                {override?.hex && <option value="custom">Custom {override.hex}</option>}
                {SCALE_GROUPS.map(group => (
                  <optgroup key={group.family} label={group.label}>
                    {SCALE_STEPS.map(step => (
                      <option key={step} value={`${group.family}-${step}`}>
                        {group.label} {step}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Fixed">
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </optgroup>
              </select>
            </div>
          )
        })}
        {SHOW_BUTTON_COLOR_OVERRIDES && (
          <div className="es-ctx-foot">
            Applies to every {cap(color)} {cap(appearance)} button in {cap(mode)} mode, {tint} tint.
          </div>
        )}
      </>
    )
  }

  // ---- Any element (free-form CSS) --------------------------------------
  const nodeSelector = useMemo(() => selectorFor(menu.node, pageEl, scope), [menu.node, pageEl, scope])
  const setNodeProp = (key, value) => {
    onChangeStyle(prev => {
      const all = { ...(prev.nodeStyles ?? {}) }
      const props = { ...(all[nodeSelector] ?? {}) }
      if (value === '' || value == null) delete props[key]
      else props[key] = value
      if (Object.keys(props).length) all[nodeSelector] = props
      else delete all[nodeSelector]
      return { ...prev, nodeStyles: all }
    })
  }
  const resetNode = () => {
    onChangeStyle(prev => {
      const all = { ...(prev.nodeStyles ?? {}) }
      delete all[nodeSelector]
      return { ...prev, nodeStyles: all }
    })
  }

  const renderNodePanel = () => {
    const saved = siteStyle.nodeStyles?.[nodeSelector] ?? {}
    const computed = getComputedStyle(menu.node)
    const live = {
      background: toHex(computed.backgroundColor),
      color: toHex(computed.color),
      borderColor: toHex(computed.borderTopColor),
      borderWidth: parseFloat(computed.borderTopWidth) || 0,
      borderRadius: parseFloat(computed.borderTopLeftRadius) || 0,
      padding: parseFloat(computed.paddingTop) || 0,
      gap: parseFloat(computed.rowGap) || 0,
      fontSize: parseFloat(computed.fontSize) || 0,
      fontWeight: computed.fontWeight,
    }
    return (
      <>
        <div className="es-ctx-options">
          {[['one', 'This element'], ['all', 'All like this']].map(([key, label]) => (
            <button key={key} type="button" className={`es-ctx-option${scope === key ? ' is-active' : ''}`} onClick={() => setScope(key)}>
              {label}
            </button>
          ))}
        </div>
        {NODE_STYLE_PROPS.map(prop => (
          <div className="es-ctx-part" key={prop.key}>
            <span className="es-ctx-part-label">{prop.label}</span>
            {prop.kind === 'color' && (
              <>
                <input
                  type="color"
                  className="es-ctx-color"
                  value={saved[prop.key]?.startsWith('#') ? saved[prop.key] : live[prop.key]}
                  onChange={e => setNodeProp(prop.key, e.target.value)}
                  aria-label={`${prop.label} custom color`}
                />
                <select
                  className="es-ctx-select"
                  value={saved[prop.key]?.startsWith('var(') ? saved[prop.key] : saved[prop.key] ? 'custom' : ''}
                  onChange={e => e.target.value !== 'custom' && setNodeProp(prop.key, e.target.value)}
                  aria-label={`${prop.label} designation`}
                >
                  <option value="">Default</option>
                  {saved[prop.key] && !saved[prop.key].startsWith('var(') && <option value="custom">Custom {saved[prop.key]}</option>}
                  {ELEMENT_ROLES.map(role => (
                    <option key={role.key} value={`var(${role.cssVar})`}>{role.label}</option>
                  ))}
                  <option value="transparent">Transparent</option>
                </select>
              </>
            )}
            {prop.kind === 'px' && (
              <input
                type="number"
                min="0"
                className="es-ctx-select"
                placeholder={String(Math.round(live[prop.key]))}
                value={saved[prop.key] ?? ''}
                onChange={e => setNodeProp(prop.key, e.target.value)}
                aria-label={prop.label}
              />
            )}
            {prop.kind === 'weight' && (
              <select className="es-ctx-select" value={saved[prop.key] ?? ''} onChange={e => setNodeProp(prop.key, e.target.value)} aria-label={prop.label}>
                <option value="">Default ({live.fontWeight})</option>
                {[300, 400, 500, 600, 700, 800].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            )}
          </div>
        ))}
        <button type="button" className="es-ctx-reset" disabled={!Object.keys(saved).length} onClick={resetNode}>
          Reset this element
        </button>
        <div className="es-ctx-foot">{nodeSelector}</div>
      </>
    )
  }

  const chips = [
    ...(buttonVariant ? [{ id: 'button', label: `${BUTTON_IDS[buttonVariant.id] ?? 'Button'} button` }] : []),
    ...elementKeys.map(key => ({ id: key, label: DEFS_BY_KEY[key].label })),
    { id: 'node', label: 'Any style' },
  ]

  return createPortal(
    <div
      ref={ref}
      className="es-ctx-menu"
      style={{ left: pos.left, top: pos.top }}
      onContextMenu={e => e.preventDefault()}
    >
      <div className="es-ctx-head">
        {selected === 'button'
          ? `${BUTTON_IDS[buttonVariant.id] ?? 'Button'} button`
          : selected === 'node'
            ? `<${menu.node.tagName.toLowerCase()}> style`
            : DEFS_BY_KEY[selected]?.label}
      </div>
      {chips.length > 1 && (
        <div className="es-ctx-chips" aria-label="Elements under the cursor">
          {chips.slice(0, 8).map(chip => (
            <button
              key={chip.id}
              type="button"
              className={`es-ctx-chip${selected === chip.id ? ' is-active' : ''}`}
              onClick={() => setSelected(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      {selected === 'button' ? renderButtonPanel() : selected === 'node' ? renderNodePanel() : renderElementPanel()}
    </div>,
    document.body
  )
}
