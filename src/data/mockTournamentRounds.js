import { SEED_ROUND_FORMATS } from './mockFacilities'

// A round card's status drives its pill and its two actions (see
// TournamentOverviewPage.jsx's ROUND_ACTIONS).
const ACTIVE_CYCLE = ['draft', 'ready', 'live', 'final']

// The rounds shown on a tournament's overview. Quick Start tournaments carry
// their own `roundList`; the seeded ones get one generated from their count
// and status — a draft tournament's rounds are all drafts, a completed one's
// are all final, and an active one cycles through every state.
export function roundsFor(tournament) {
  if (tournament.roundList) return tournament.roundList
  const count = Math.max(tournament.rounds || 0, 0)
  const [y, m, d] = tournament.startISO.split('-').map(Number)
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(y, m - 1, d + i)
    const pad = n => String(n).padStart(2, '0')
    return {
      number: i + 1,
      format: SEED_ROUND_FORMATS[i % SEED_ROUND_FORMATS.length].label,
      startsAt: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T08:00`,
      course: tournament.course,
      status: tournament.status === 'draft' ? 'draft' : tournament.status === 'completed' ? 'final' : ACTIVE_CYCLE[i % ACTIVE_CYCLE.length],
    }
  })
}
