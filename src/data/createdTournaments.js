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

export function addCreatedTournament(quickStart) {
  const startISO = quickStart.start_datetime.slice(0, 10)
  const course = quickStart.facility?.name ?? quickStart.course_name
  // The tournament image (step 1) is the list/overview thumbnail — not the
  // website banner — and falls back to the default when none was uploaded.
  const image = imageUrl(quickStart.tournament_image) ?? defaultTournamentImage
  const tournament = {
    id: `new-${created.length + 1}`,
    startISO,
    name: quickStart.tournament_name,
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
        startsAt: quickStart.start_datetime,
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
