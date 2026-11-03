// Mock facility directory for Quick Start's course search (round details).
export const FACILITIES = [
  { id: 'f1', name: 'Pine Valley Golf Course', city: 'Pine Valley', state: 'NJ', country: 'USA' },
  { id: 'f2', name: 'Pine Valley Golf Club', city: 'Dallas', state: 'TX', country: 'USA' },
  { id: 'f3', name: 'Pine Valley Resort', city: 'Pinehurst', state: 'NC', country: 'USA' },
  { id: 'f4', name: 'Pine Valley Country Club', city: 'Austin', state: 'TX', country: 'USA' },
  { id: 'f9', name: 'Pine Valley Highlands', city: 'Toronto', state: 'ON', country: 'CAN' },
  { id: 'f8', name: 'Pine Valley Three Lakes', city: 'Madison', state: 'WI', country: 'USA' },
]

// Every facility has one or more courses; a round is played on one of them,
// from one or more of its tees.
export const TEES = [
  { id: 'oak', label: 'Oak - 75.3/143' },
  { id: 'championship', label: 'Championship - 73/133' },
  { id: 'pine', label: 'Pine - 70/123' },
  { id: 'red', label: 'Red - 71/118' },
]
// Every tee is selected by default.
export const ALL_TEE_IDS = TEES.map(t => t.id)
export const HOLE_OPTIONS = [
  { value: 'all', label: 'All Holes' },
  { value: 'front', label: 'Front Nine' },
  { value: 'back', label: 'Back Nine' },
]
// A course is 9 or 18 holes, never more. A facility can have a 9-hole course,
// an 18-hole course, a 9 and an 18, or two 18s.
export const MAX_COURSE_HOLES = 18

// What can be played from a course: an 18-hole course offers All / Front /
// Back; a 9-hole course is just its nine.
export const holeOptionsFor = course =>
  course && course.holes <= 9 ? HOLE_OPTIONS.slice(0, 1) : HOLE_OPTIONS

const shortName = f => f.name.replace(/ (Golf Club|Golf Course|Country Club|Resort)$/, '')

// A facility with just one course (9 or 18 holes). There's no course to pick:
// the facility card stands in for it. On a 9-hole one a 9-hole round plays it
// once and an 18-hole round twice; on an 18-hole one a 18-hole round is the
// full course and a 9-hole round is the front or the back nine.
export const soleCourse = facility => {
  const courses = coursesFor(facility)
  return courses.length === 1 ? courses[0] : null
}

// A facility made of three 9-hole courses. A 9-hole round plays one of them; an
// 18-hole round plays two (holes 1-9, then 10-18), the same one twice if they like.
export const isNineHoleTrio = facility => {
  const courses = coursesFor(facility)
  return courses.length === 3 && courses.every(c => c.holes === 9)
}

// A facility with one 9-hole and one 18-hole course. A 9-hole round plays the
// nine, or the front or back of the 18; an 18-hole round plays the nine twice
// or the 18 in full.
export const isNineAndEighteen = facility => {
  const courses = coursesFor(facility)
  return courses.length === 2 && courses.some(c => c.holes === 9) && courses.some(c => c.holes === 18)
}

// Mock course layouts, as hole counts, by facility; any facility not listed has one 18.
const COURSE_HOLES = {
  f2: [9, 18],
  f3: [18, 18],
  f4: [9],
  f8: [9, 9, 9],
}

// Course names for facilities whose courses can't be told apart by size.
const COURSE_NAMES = {
  f8: ['Red Nine', 'White Nine', 'Blue Nine'],
}

export const coursesFor = facility => {
  if (!facility) return []
  const base = shortName(facility)
  const layout = COURSE_HOLES[facility.id] ?? [18]
  return layout.map((holes, i) => ({
    id: `${facility.id}-c${i + 1}`,
    name: COURSE_NAMES[facility.id] ? `${base} ${COURSE_NAMES[facility.id][i]}` : layout.length === 1 ? base : `${base} ${holes === 9 ? '9-Hole' : layout.filter(h => h === 18).length > 1 ? (i === 0 ? 'North' : 'South') : '18-Hole'}`,
    status: 'Active',
    holes,
  }))
}

// Countries the search covers. USA facilities are narrowed by state, Canadian
// ones by province.
export const COUNTRIES = [
  { value: 'USA', label: 'USA', regionLabel: 'State' },
  { value: 'CAN', label: 'Canada', regionLabel: 'Province' },
]

// State / province choices for the search, by country (value is the abbreviation
// facilities are matched on).
const regions = list => list.split(',').map(entry => { const [value, label] = entry.split(':'); return { value, label } })
export const REGIONS = {
  USA: regions('AL:Alabama,AK:Alaska,AZ:Arizona,AR:Arkansas,CA:California,CO:Colorado,CT:Connecticut,DE:Delaware,DC:District of Columbia,FL:Florida,GA:Georgia,HI:Hawaii,ID:Idaho,IL:Illinois,IN:Indiana,IA:Iowa,KS:Kansas,KY:Kentucky,LA:Louisiana,ME:Maine,MD:Maryland,MA:Massachusetts,MI:Michigan,MN:Minnesota,MS:Mississippi,MO:Missouri,MT:Montana,NE:Nebraska,NV:Nevada,NH:New Hampshire,NJ:New Jersey,NM:New Mexico,NY:New York,NC:North Carolina,ND:North Dakota,OH:Ohio,OK:Oklahoma,OR:Oregon,PA:Pennsylvania,RI:Rhode Island,SC:South Carolina,SD:South Dakota,TN:Tennessee,TX:Texas,UT:Utah,VT:Vermont,VA:Virginia,WA:Washington,WV:West Virginia,WI:Wisconsin,WY:Wyoming'),
  CAN: regions('AB:Alberta,BC:British Columbia,MB:Manitoba,NB:New Brunswick,NL:Newfoundland and Labrador,NS:Nova Scotia,NT:Northwest Territories,NU:Nunavut,ON:Ontario,PE:Prince Edward Island,QC:Quebec,SK:Saskatchewan,YT:Yukon'),
}

// Name is a contains-match, state/province (optional) an exact abbreviation match,
// within one country (USA unless told otherwise).
export const searchFacilities = (name, state, country = 'USA') => {
  const n = name.trim().toLowerCase()
  const s = state.trim().toLowerCase()
  if (!n && !s) return []
  return FACILITIES.filter(f =>
    f.country === country && (!n || f.name.toLowerCase().includes(n)) && (!s || f.state.toLowerCase() === s)
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

// Most formats are just a label; the default also carries a note shown under it.
const FORMAT_NOTES = { 'Four Person Scramble (4)': 'Most Common' }
export const ROUND_FORMATS = FORMAT_LABELS.map(label => ({
  value: slug(label),
  label,
  ...(FORMAT_NOTES[label] ? { subLabel: FORMAT_NOTES[label] } : {}),
}))

// What a new round starts as, and the few the seeded tournaments cycle through.
export const DEFAULT_ROUND_FORMAT = ROUND_FORMATS.find(f => f.label === 'Four Person Scramble (4)')
export const SEED_ROUND_FORMATS = ['Four Person Scramble (4)', 'Two Person Best Ball (2)', 'Individual Stroke Play (1)', 'Two Person Scramble (2)']
  .map(label => ROUND_FORMATS.find(f => f.label === label))
