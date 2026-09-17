// Generates a 50-900 tint/shade scale from a single base ("400") color.
// Hue and saturation are held constant; only lightness moves — tints blend
// toward white, shades blend toward black.
//
// Previously the base was 500 and the stops were empirical (fitted against
// real Theme.js scales), which made adjacent steps inconsistent — e.g. 500
// (pure base, t=0) to 600 (t=0.27) was a much bigger lightness jump than
// 600 to 700 (t=0.482, only +0.212). Stops below are evenly spaced instead:
// each side ramps linearly from the base out to 90% of the way to white/
// black, so every step-to-step jump on a given side is the same size —
// tints step by 0.9/4, shades by 0.9/5 (four tint steps vs. five shade
// steps below 400, since 400 sits left of the scale's midpoint).
const TINT_STOPS = { 300: 0.225, 200: 0.45, 100: 0.675, 50: 0.9 }
const SHADE_STOPS = { 500: 0.18, 600: 0.36, 700: 0.54, 800: 0.72, 900: 0.9 }

export function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s * 100, l * 100]
}

export function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

// Plug in a single 400 hex; get back the full 50-900 scale, keyed by step.
export function generateScale(hex400) {
  const [h, s, l] = hexToHsl(hex400)
  const scale = { 400: hex400.toUpperCase() }
  for (const [step, t] of Object.entries(TINT_STOPS)) {
    scale[step] = hslToHex(h, s, l + (100 - l) * t)
  }
  for (const [step, t] of Object.entries(SHADE_STOPS)) {
    scale[step] = hslToHex(h, s, l * (1 - t))
  }
  return scale
}

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
