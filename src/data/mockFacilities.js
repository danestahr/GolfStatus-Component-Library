// Mock facility directory for Quick Start's course search (round details).
export const FACILITIES = [
  { id: 'f1', name: 'Pine Valley', city: 'Pine Valley', state: 'NJ' },
  { id: 'f2', name: 'Pine Valley Golf Club', city: 'Dallas', state: 'TX' },
  { id: 'f3', name: 'Pinehurst Resort', city: 'Pinehurst', state: 'NC' },
  { id: 'f4', name: 'Pine Hollow Country Club', city: 'Austin', state: 'TX' },
  { id: 'f5', name: 'Barton Creek', city: 'Austin', state: 'TX' },
  { id: 'f6', name: 'Cedar Ridge Country Club', city: 'Tulsa', state: 'OK' },
  { id: 'f7', name: 'Oak Hollow Golf Course', city: 'High Point', state: 'NC' },
]

// Name is a contains-match, state (optional) an exact abbreviation match.
export const searchFacilities = (name, state) => {
  const n = name.trim().toLowerCase()
  const s = state.trim().toLowerCase()
  if (!n && !s) return []
  return FACILITIES.filter(f =>
    (!n || f.name.toLowerCase().includes(n)) && (!s || f.state.toLowerCase() === s)
  )
}

// Round formats, in the order they appear in the dropdown. The number is how
// many players are on a team.
const FORMAT_LABELS = [
  'Individual Match Play (1)',
  'Individual Stroke Play (1)',
  'Social Event (1)',
  'Two Person Best Ball (2)',
  'Two Person Best Ball Match Play (2)',
  'Two Person Scramble (2)',
  'Two Person Scramble Match Play (2)',
  'Two Person Shamble (2)',
  'Two Person Shamble Match Play (2)',
  'Three Person Scramble (3)',
  'Four Person Best Ball (4)',
  'Four Person Celebrity Pro-Am Best Ball (4)',
  'Four Person Scramble (4)',
  'Four Person Sectional Pro-Am Best Ball (4)',
  'Four Person Shamble (4)',
  'Five Person Best Ball (5)',
  'Five Person Pro-Am Best Ball (5)',
  'Five Person Pro-Am Scramble (5)',
  'Five Person Scramble (5)',
  'Five Person Shamble (5)',
  'Six Person Scramble (6)',
]

// "Four Person Scramble (4)" -> "four-person-scramble-4"
const slug = label => label.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const ROUND_FORMATS = FORMAT_LABELS.map(label => ({ value: slug(label), label }))

// What a new round starts as, and the few the seeded tournaments cycle through.
export const DEFAULT_ROUND_FORMAT = ROUND_FORMATS.find(f => f.label === 'Four Person Scramble (4)')
export const SEED_ROUND_FORMATS = ['Four Person Scramble (4)', 'Two Person Best Ball (2)', 'Individual Stroke Play (1)', 'Two Person Scramble (2)']
  .map(label => ROUND_FORMATS.find(f => f.label === label))
