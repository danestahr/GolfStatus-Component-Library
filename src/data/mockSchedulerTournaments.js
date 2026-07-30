// ── Shared hole + team mock data for the Hole Assignments prototype ────────────

export const HOLE_DATA = [
  { number: 1, par: 4 }, { number: 2, par: 3 }, { number: 3, par: 5 }, { number: 4, par: 4 },
  { number: 5, par: 4 }, { number: 6, par: 3 }, { number: 7, par: 4 }, { number: 8, par: 5 },
  { number: 9, par: 4 }, { number: 10, par: 4 }, { number: 11, par: 3 }, { number: 12, par: 4 },
  { number: 13, par: 5 }, { number: 14, par: 4 }, { number: 15, par: 3 }, { number: 16, par: 4 },
  { number: 17, par: 5 }, { number: 18, par: 4 },
]

const TEAM_DATA = [
  { name: 'Team 1', handicap: 12, players: 'Mike Johnson (8), Sarah Williams (15), Tom Chen (10), Lisa Davis (16)', flight: 'Flight A' },
  { name: 'Team 2', handicap: 18, players: 'Robert Smith (12), Jennifer Brown (22), David Wilson (14), Amanda Taylor (24)', flight: 'Flight B' },
  { name: 'Team 3', handicap: 9, players: 'James Miller (6), Patricia Garcia (11), Christopher Rodriguez (8), Barbara Martinez (12)', flight: 'Flight A' },
  { name: 'Team 4', handicap: 21, players: 'William Anderson (18), Mary Thomas (25), Joseph Jackson (19), Susan White (22)', flight: 'Flight C' },
  { name: 'Team 5', handicap: 15, players: 'Richard Harris (13), Linda Clark (17), Charles Lewis (14), Nancy Walker (16)', flight: 'Flight B' },
  { name: 'Team 6', handicap: 7, players: 'Mark Hall (5), Betty Allen (9), Daniel Young (6), Karen King (8)', flight: 'Flight A' },
  { name: 'Team 7', handicap: 24, players: 'Paul Wright (20), Helen Lopez (28), Steven Hill (22), Donna Scott (26)', flight: 'Flight C' },
  { name: 'Team 8', handicap: 13, players: 'Anthony Green (11), Carol Adams (15), Matthew Baker (12), Ruth Nelson (14)', flight: 'Flight B' },
  { name: 'Team 9', handicap: 16, players: 'Kevin Murphy (14), Lisa Chen (18), Brian Wilson (15), Sarah Parker (17)', flight: 'Flight B' },
  { name: 'Team 10', handicap: 11, players: 'Alex Thompson (9), Maria Rodriguez (13), Jack Sullivan (10), Emma Davis (12)', flight: 'Flight A' },
  { name: 'Team 11', handicap: 19, players: 'Rob Foster (17), Jenny Kim (21), Steve Martinez (18), Amy Cooper (20)', flight: 'Flight C' },
  { name: 'Team 12', handicap: 8, players: 'Tyler Brooks (6), Rachel Green (10), Josh Taylor (7), Katie Brown (9)', flight: 'Flight A' },
  { name: 'Team 13', handicap: 22, players: 'Sam Peterson (20), Nicole White (24), Chris Adams (21), Megan Jones (23)', flight: 'Flight C' },
  { name: 'Team 14', handicap: 14, players: 'Dan Mitchell (12), Laura Wilson (16), Mark Garcia (13), Julie Smith (15)', flight: 'Flight B' },
  { name: 'Team 15', handicap: 10, players: 'Ryan Clark (8), Ashley Lee (12), Ben Johnson (9), Chloe Davis (11)', flight: 'Flight A' },
  { name: 'Team 16', handicap: 17, players: 'Luke Anderson (15), Sophia Martinez (19), Nathan Brown (16), Olivia Taylor (18)', flight: 'Flight B' },
  { name: 'Team 17', handicap: 20, players: 'Ethan Miller (18), Grace Thompson (22), Jacob Wilson (19), Zoe Garcia (21)', flight: 'Flight C' },
  { name: 'Team 18', handicap: 12, players: 'Connor Davis (10), Hannah Moore (14), Ian Rodriguez (11), Lily Johnson (13)', flight: 'Flight A' },
  { name: 'Team 19', handicap: 25, players: 'Owen Thompson (23), Ava Williams (27), Mason Lee (24), Isabella Clark (26)', flight: 'Flight C' },
  { name: 'Team 20', handicap: 6, players: 'Lucas Brown (4), Emma Wilson (8), Noah Martinez (5), Sophia Anderson (7)', flight: 'Flight A' },
]

// Fill out the roster to 72 teams total so there are enough teams to fully
// populate any round's 36 slots.
const FILLER_FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery',
  'Cameron', 'Drew', 'Reese', 'Harper', 'Quinn', 'Skyler', 'Peyton', 'Rowan',
]
const FILLER_LAST_NAMES = [
  'Bennett', 'Coleman', 'Foster', 'Griffin', 'Hayes', 'Ingram', 'Jennings', 'Kirby',
  'Lambert', 'Mercer', 'Nolan', 'Osborne', 'Prescott', 'Quincy', 'Sawyer', 'Tanner',
]
const FILLER_FLIGHTS = ['Flight A', 'Flight B', 'Flight C']
const TOTAL_TEAM_COUNT = 72

for (let i = TEAM_DATA.length; i < TOTAL_TEAM_COUNT; i++) {
  const players = Array.from({ length: 4 }, (_, p) => {
    const first = FILLER_FIRST_NAMES[(i * 4 + p) % FILLER_FIRST_NAMES.length]
    const last = FILLER_LAST_NAMES[(i * 7 + p * 3) % FILLER_LAST_NAMES.length]
    const handicap = 4 + ((i + p * 5) % 26)
    return `${first} ${last} (${handicap})`
  }).join(', ')

  TEAM_DATA.push({
    name: `Team ${i + 1}`,
    handicap: 4 + (i % 26),
    players,
    flight: FILLER_FLIGHTS[i % FILLER_FLIGHTS.length],
  })
}

export { TEAM_DATA }

export const SORTED_TEAMS = [...TEAM_DATA].sort((a, b) => (
  parseInt(a.name.replace(/\D/g, ''), 10) - parseInt(b.name.replace(/\D/g, ''), 10)
))

// Putt Putt For Puppies fields a 54-team roster; Round RED starts with a third of
// that field (18 teams) already assigned, filling holes 1–9's A/B slots.
const PUTT_PUTT_TEAM_COUNT = 54
const puttPuttRedAssignments = {}
for (let hole = 1; hole <= PUTT_PUTT_TEAM_COUNT / 3 / 2; hole++) {
  puttPuttRedAssignments[`${hole}-A`] = SORTED_TEAMS[(hole - 1) * 2].name
  puttPuttRedAssignments[`${hole}-B`] = SORTED_TEAMS[(hole - 1) * 2 + 1].name
}

// Ridgeline Fall Classic mirrors Putt Putt For Puppies' setup — same 54-team
// roster and three-round shape, with its first round likewise starting a third
// assigned — as an alternate event for trying out variations on that concept.
const RIDGELINE_TEAM_COUNT = 54
const ridgelineRound1Assignments = {}
for (let hole = 1; hole <= RIDGELINE_TEAM_COUNT / 3 / 2; hole++) {
  ridgelineRound1Assignments[`${hole}-A`] = SORTED_TEAMS[(hole - 1) * 2].name
  ridgelineRound1Assignments[`${hole}-B`] = SORTED_TEAMS[(hole - 1) * 2 + 1].name
}

// Twin Fairways Shootout: a 36-hole facility running its North and South courses
// as two independent 18-hole rounds at the same time. Each round only fields half
// the event's teams — the North and South rosters are disjoint (non-overlapping
// SORTED_TEAMS slices, via each round's own teamCount + rosterOffset) — modeling
// the "large event, only some of the field plays this round" pain point instead of
// pooling every team in the tournament into every round's Unassigned list.
const TWIN_FAIRWAYS_NORTH_COUNT = 32
const TWIN_FAIRWAYS_SOUTH_COUNT = 28

// ── Facilities (Create Round form's Facility/Round Course pickers) ─────────────
// Course names intentionally echo the ones already used across TOURNAMENTS above,
// so a facility search in the Add Round form feels continuous with the rest of
// the mock data rather than introducing an unrelated naming scheme.
export const FACILITIES = [
  {
    id: 'heritage-golf-club',
    name: 'Heritage Golf Club',
    location: 'Austin, TX, USA',
    courses: [
      { id: 'heritage-championship', name: 'Championship Course', status: 'Active', holes: 18 },
      { id: 'heritage-executive', name: 'Executive Course', status: 'Active', holes: 9 },
    ],
  },
  {
    id: 'cedar-ridge-golf-club',
    name: 'Cedar Ridge Golf Club',
    location: 'Denver, CO, USA',
    courses: [
      { id: 'cedar-ridge-course', name: 'Cedar Ridge Course', status: 'Active', holes: 18 },
    ],
  },
  {
    id: 'ridgeline-golf-club',
    name: 'Ridgeline Golf Club',
    location: 'Boise, ID, USA',
    courses: [
      { id: 'ridgeline-red', name: 'Red Course', status: 'Active', holes: 18 },
      { id: 'ridgeline-blue', name: 'Blue Course', status: 'Active', holes: 18 },
      { id: 'ridgeline-backwoods', name: 'Backwoods Course', status: 'Active', holes: 18 },
    ],
  },
  {
    id: 'twin-fairways-golf-complex',
    name: 'Twin Fairways Golf Complex',
    location: 'Scottsdale, AZ, USA',
    courses: [
      { id: 'twin-fairways-north', name: 'North Course', status: 'Active', holes: 18 },
      { id: 'twin-fairways-south', name: 'South Course', status: 'Active', holes: 18 },
    ],
  },
  {
    id: 'adventure-golf-course',
    name: 'Adventure Golf Course',
    location: 'Nashville, TN, USA',
    courses: [
      { id: 'adventure-red', name: 'Red Course', status: 'Active', holes: 18 },
      { id: 'adventure-blue', name: 'Blue Course', status: 'Active', holes: 18 },
      { id: 'adventure-backwoods', name: 'Backwoods Course', status: 'Draft', holes: 18 },
    ],
  },
]

// ── Tournaments ─────────────────────────────────────────────────────────────────
// Each tournament owns its own round metadata. Rounds are keyed by round number;
// the Filter panel (for hiding teams already assigned in another round) only
// makes sense once a tournament has 2+ rounds to cross-reference.

export const TOURNAMENTS = [
  {
    id: 'putt-putt-for-puppies',
    name: '2026 Putt Putt For Puppies',
    courseName: 'Adventure Golf Course',
    teamCount: PUTT_PUTT_TEAM_COUNT,
    initialAssignments: { 1: puttPuttRedAssignments },
    // Keeps the original per-round Unassigned Filter panel instead of the newer
    // Rounds & Scorecards Settings toggle.
    legacyFilter: true,
    rounds: {
      1: { name: 'Round RED', course: 'Red Course', format: 'Two-Person Scramble', dateTime: '8:00 AM on Mon Jun 15, 2026', startType: 'Shotgun Start', facilityName: 'Adventure Golf Course', holes: 18, status: 'Ready' },
      2: { name: 'Round BLU', course: 'Blue Course', format: 'Four-Person Scramble', dateTime: '1:00 PM on Mon Jun 15, 2026', startType: 'Tee Time Start', facilityName: 'Adventure Golf Course', holes: 18, status: 'Ready' },
      3: { name: 'Round BWD', course: 'Backwoods Course', format: 'Individual Stroke Play', dateTime: '8:00 AM on Tue Jun 16, 2026', startType: 'Shotgun Start', facilityName: 'Adventure Golf Course', holes: 18, status: 'Draft' },
    },
  },
  {
    id: 'cedar-ridge-member-guest',
    name: 'Cedar Ridge Member-Guest',
    courseName: 'Cedar Ridge',
    // Keeps the original per-round Unassigned Filter panel instead of the newer
    // Rounds & Scorecards Settings toggle.
    legacyFilter: true,
    rounds: {
      1: { format: 'Two-Person Scramble', dateTime: '9:00 AM on Sat Jul 18, 2026', startType: 'Shotgun Start', facilityName: 'Cedar Ridge Golf Club', holes: 18, status: 'Ready' },
    },
  },
  {
    id: 'ridgeline-fall-classic',
    name: '2026 Ridgeline Fall Classic',
    courseName: 'Ridgeline Golf Club',
    teamCount: RIDGELINE_TEAM_COUNT,
    initialAssignments: { 1: ridgelineRound1Assignments },
    rounds: {
      1: { name: 'Round RED', course: 'Red Course', format: 'Two-Person Scramble', dateTime: '8:00 AM on Fri Sep 11, 2026', startType: 'Shotgun Start', facilityName: 'Ridgeline Golf Club', holes: 18, status: 'Ready' },
      2: { name: 'Round BLU', course: 'Blue Course', format: 'Four-Person Scramble', dateTime: '1:00 PM on Fri Sep 11, 2026', startType: 'Tee Time Start', facilityName: 'Ridgeline Golf Club', holes: 18, status: 'Ready' },
      3: { name: 'Round BWD', course: 'Backwoods Course', format: 'Individual Stroke Play', dateTime: '8:00 AM on Sat Sep 12, 2026', startType: 'Shotgun Start', facilityName: 'Ridgeline Golf Club', holes: 18, status: 'Draft' },
    },
  },
  // A deeper build-out than the others: starts with zero rounds so setup can be
  // prototyped from scratch (adding rounds, courses, etc.) rather than seeded.
  {
    id: 'heritage-classic-invitational',
    name: '2026 Heritage Classic Invitational',
    courseName: 'Heritage Golf Club',
    rounds: {},
    // Prototyping ground for the expanded Round Setup summary banner, which is
    // taking over surfacing roster completion — the orange "Teams Assigned
    // Across All Rounds" banner and each round card's own "X/Y Teams Assigned"
    // count would just be duplicating it here.
    hideRosterOverview: true,
    hideSettingsButton: true,
  },
  // Prototyping the multi-round/multi-wave pain point: a 36-hole facility running
  // two simultaneous 18-hole rounds, each with its own (disjoint) team roster
  // rather than the whole event's field.
  {
    id: 'twin-fairways-shootout',
    name: '2026 Twin Fairways Shootout',
    courseName: 'Twin Fairways Golf Complex',
    rounds: {
      1: {
        name: 'North Round', course: 'North Course', format: 'Four-Person Scramble',
        dateTime: '8:00 AM on Sat Oct 3, 2026', startType: 'Shotgun Start',
        facilityName: 'Twin Fairways Golf Complex', holes: 18, status: 'Ready',
        teamCount: TWIN_FAIRWAYS_NORTH_COUNT, rosterOffset: 0,
      },
      2: {
        name: 'South Round', course: 'South Course', format: 'Four-Person Scramble',
        dateTime: '8:00 AM on Sat Oct 3, 2026', startType: 'Shotgun Start',
        facilityName: 'Twin Fairways Golf Complex', holes: 18, status: 'Ready',
        teamCount: TWIN_FAIRWAYS_SOUTH_COUNT, rosterOffset: TWIN_FAIRWAYS_NORTH_COUNT,
      },
    },
  },
]
