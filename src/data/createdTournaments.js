import { ROUND_FORMATS, DEFAULT_ROUND_FORMAT } from './mockFacilities'
import defaultTournamentImage from '../assets/default-tournament-image.jpg'

// Tournaments created through Quick Start, kept in memory for the session so
// the list and the overview page can show them (a reload clears them, same as
// the rest of the mock data). Shaped like mockTournaments.js's entries, plus a
// `roundList` with the round Quick Start set up.
const created = []

const imageUrl = file => (file instanceof File ? URL.createObjectURL(file) : file || null)

const shortDate = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Nothing in Quick Start is required: blanks are filled in here. No date
// starts the round a month out at 10:00 AM; no course leaves a placeholder
// for customer support to follow up on.
const defaultStart = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T10:00`
}

export function addCreatedTournament(quickStart) {
  const startDatetime = quickStart.start_datetime || defaultStart()
  const startISO = startDatetime.slice(0, 10)
  const tournamentName = quickStart.tournament_name?.trim() || `${new Date().getFullYear()} ${quickStart.organization} Golf Tournament`
  const course = quickStart.facility?.name ?? (quickStart.course_name || 'Placeholder Course')
  // The tournament image (step 1) is the list/overview thumbnail — not the
  // website banner — and falls back to the default when none was uploaded.
  const image = imageUrl(quickStart.tournament_image) ?? defaultTournamentImage
  const tournament = {
    id: `new-${created.length + 1}`,
    startISO,
    name: tournamentName,
    organization: quickStart.organization,
    dates: shortDate(startISO),
    course,
    status: 'active',
    rounds: 1,
    players: 0,
    hasBanner: true,
    image,
    roundList: [
      {
        number: 1,
        format: ROUND_FORMATS.find(f => f.value === quickStart.round_format)?.label ?? DEFAULT_ROUND_FORMAT.label,
        startsAt: startDatetime,
        course,
        status: 'draft',
      },
    ],
  }
  created.unshift(tournament)
  return tournament
}

export const getCreatedTournaments = () => created
export const findCreatedTournament = id => created.find(t => t.id === id)
