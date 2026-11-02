// "2026-11-05" -> "Thu, Nov 5, 2026" (parsed as a local date so it can't slip a day).
export const formatDate = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// The ISO date `days` after (or before, if negative) another ISO date.
export const shiftDate = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number)
  const shifted = new Date(y, m - 1, d + days)
  const pad = n => String(n).padStart(2, '0')
  return `${shifted.getFullYear()}-${pad(shifted.getMonth() + 1)}-${pad(shifted.getDate())}`
}
