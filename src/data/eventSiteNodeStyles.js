// Free-form per-element style edits made from the /event-site click menu
// (pages/event-site/EventSiteContextMenu.jsx's "This element" panel) for
// anything that isn't one of the named Site Colors elements. Saved on the
// site style as `nodeStyles: { [selector]: { [prop]: value } }` and rendered
// as one <style> block by EventWebsitePage.jsx.

// prop -> CSS property. `kind` drives the control the menu shows.
export const NODE_STYLE_PROPS = [
  { key: 'background', css: 'background-color', label: 'Background', kind: 'color' },
  { key: 'color', css: 'color', label: 'Text', kind: 'color' },
  { key: 'borderColor', css: 'border-color', label: 'Border color', kind: 'color' },
  { key: 'borderWidth', css: 'border-width', label: 'Border width', kind: 'px' },
  { key: 'borderRadius', css: 'border-radius', label: 'Radius', kind: 'px' },
  { key: 'padding', css: 'padding', label: 'Padding', kind: 'px' },
  { key: 'gap', css: 'gap', label: 'Gap', kind: 'px' },
  { key: 'fontSize', css: 'font-size', label: 'Font size', kind: 'px' },
  { key: 'fontWeight', css: 'font-weight', label: 'Font weight', kind: 'weight' },
]

const STATE_CLASS = /^(is-|has-|gs-theme-|light$|dark$|active$|invalid$|incomplete$|true$|false$|open$|selected$|focus|hover)/

function segmentFor(node, withIndex) {
  const classes = [...node.classList].filter(c => !STATE_CLASS.test(c)).map(c => `.${CSS.escape(c)}`).join('')
  let seg = node.tagName.toLowerCase() + classes
  if (withIndex && node.parentElement) {
    seg += `:nth-child(${[...node.parentElement.children].indexOf(node) + 1})`
  }
  return seg
}

// scope 'one' pins the exact element (full path, nth-child at every step);
// 'all' matches every element sharing this one's tag + classes.
export function selectorFor(node, pageEl, scope) {
  if (scope === 'all') return `.es-page ${segmentFor(node, false)}`
  const parts = []
  for (let n = node; n && n !== pageEl && n !== document.body; n = n.parentElement) parts.unshift(segmentFor(n, true))
  return `${pageEl?.contains(node) ? '.es-page ' : ''}${parts.join(' > ')}`
}

const withUnit = (prop, value) => (prop.kind === 'px' ? `${value}px` : value)

export function nodeStylesCss(nodeStyles) {
  return Object.entries(nodeStyles ?? {})
    .map(([selector, props]) => {
      const decls = NODE_STYLE_PROPS
        .filter(p => props[p.key] !== undefined && props[p.key] !== '')
        .map(p => `${p.css}:${withUnit(p, props[p.key])} !important`)
        // A border color/width does nothing without a border style.
        .concat(props.borderColor || props.borderWidth ? ['border-style:solid !important'] : [])
      return decls.length ? `${selector}{${decls.join(';')}}` : ''
    })
    .join('\n')
}
