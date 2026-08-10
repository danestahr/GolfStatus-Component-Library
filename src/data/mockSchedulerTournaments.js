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
    // Hidden from the list while round-setup riffing happens on the
    // playground events below — flip off (or delete) to bring it back.
    hidden: true,
    name: '2026 Putt Putt For Puppies',
    courseName: 'Adventure Golf Course',
    teamCount: PUTT_PUTT_TEAM_COUNT,
    initialAssignments: { 1: puttPuttRedAssignments },
    // Keeps the original per-round Unassigned Filter panel instead of the newer
    // Rounds & Scorecards Settings toggle.
    legacyFilter: true,
    rounds: {
      1: { name: 'Round RED', course: 'Red Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Mon Jun 15, 2026', startType: 'Shotgun Start', facilityName: 'Adventure Golf Course', holes: 18 },
      2: { name: 'Round BLU', course: 'Blue Course', format: 'Four-Person Scramble', dateTime: '1:00 PM on Mon Jun 15, 2026', startType: 'Tee Time Start', facilityName: 'Adventure Golf Course', holes: 18 },
      3: { name: 'Round BWD', course: 'Backwoods Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Tue Jun 16, 2026', startType: 'Shotgun Start', facilityName: 'Adventure Golf Course', holes: 18 },
    },
  },
  {
    id: 'cedar-ridge-member-guest',
    hidden: true,
    name: 'Cedar Ridge Member-Guest',
    courseName: 'Cedar Ridge',
    // Keeps the original per-round Unassigned Filter panel instead of the newer
    // Rounds & Scorecards Settings toggle.
    legacyFilter: true,
    rounds: {
      1: { format: 'Four-Person Scramble', dateTime: '9:00 AM on Sat Jul 18, 2026', startType: 'Shotgun Start', facilityName: 'Cedar Ridge Golf Club', holes: 18 },
    },
  },
  {
    id: 'ridgeline-fall-classic',
    hidden: true,
    name: '2026 Ridgeline Fall Classic',
    courseName: 'Ridgeline Golf Club',
    teamCount: RIDGELINE_TEAM_COUNT,
    initialAssignments: { 1: ridgelineRound1Assignments },
    rounds: {
      1: { name: 'Round RED', course: 'Red Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Fri Sep 11, 2026', startType: 'Shotgun Start', facilityName: 'Ridgeline Golf Club', holes: 18 },
      2: { name: 'Round BLU', course: 'Blue Course', format: 'Four-Person Scramble', dateTime: '1:00 PM on Fri Sep 11, 2026', startType: 'Tee Time Start', facilityName: 'Ridgeline Golf Club', holes: 18 },
      3: { name: 'Round BWD', course: 'Backwoods Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Sep 12, 2026', startType: 'Shotgun Start', facilityName: 'Ridgeline Golf Club', holes: 18 },
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
    // taking over surfacing roster completion — each round card's own "X/Y
    // Teams Assigned" count would just be duplicating it here.
    hideRosterCount: true,
    hideSettingsButton: true,
  },
  // Round Number linking's own ready-made example (no savedRoundFormat, so
  // roundLinkingEnabled is true) — three rounds all sharing roundNumber: 1,
  // to exercise a single 3-way linked group without building one by hand
  // (drag-reordering the three, naming the group via its header's edit
  // pencil, etc.).
  {
    id: 'heritage-classic-invitational-3-linked',
    name: '2026 Heritage Classic Invitational (3 Rounds Linked)',
    courseName: 'Heritage Golf Club',
    rounds: {
      1: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18, roundNumber: 1, roundLetter: 'A' },
      2: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18, roundNumber: 1, roundLetter: 'B' },
      3: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Aug 15, 2026', startType: 'Tee Time Start', facilityName: 'Heritage Golf Club', holes: 18, roundNumber: 1, roundLetter: 'C' },
    },
    hideRosterCount: true,
    hideSettingsButton: true,
  },
  // Round Number linking's other ready-made example — two separate 2-way
  // linked groups (Round Numbers 1 and 2, two rounds apiece) rather than one
  // 3-way group, to exercise multiple linked groups side by side in the same
  // tournament (the Linked/Unlinked target grid choosing between them, each
  // group's own header/label, etc.).
  {
    id: 'heritage-classic-invitational-2x2-linked',
    name: '2026 Heritage Classic Invitational (2x2 Linked)',
    courseName: 'Heritage Golf Club',
    rounds: {
      1: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18, roundNumber: 1, roundLetter: 'A' },
      2: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18, roundNumber: 1, roundLetter: 'B' },
      3: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '1:00 PM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18, roundNumber: 2, roundLetter: 'A' },
      4: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '1:00 PM on Sat Aug 15, 2026', startType: 'Tee Time Start', facilityName: 'Heritage Golf Club', holes: 18, roundNumber: 2, roundLetter: 'B' },
    },
    hideRosterCount: true,
    hideSettingsButton: true,
  },
  // Sequence's own ready-made example — no waves, no Round Number linking,
  // just three plain rounds in a row — to exercise the Change Round nav's
  // remaining fallback case (see showPlainRoundNav in
  // TournamentSchedulerPage.jsx), the one shape that never had a Round
  // Setup path left to build one by hand from scratch.
  {
    id: 'heritage-classic-invitational-sequence',
    name: '2026 Heritage Classic Invitational (Sequence)',
    courseName: 'Heritage Golf Club',
    savedRoundFormat: 'rounds',
    rounds: {
      1: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18 },
      2: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '1:00 PM on Sat Aug 15, 2026', startType: 'Tee Time Start', facilityName: 'Heritage Golf Club', holes: 18 },
      3: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sun Aug 16, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18 },
    },
    hideRosterCount: true,
    hideSettingsButton: true,
  },
  // Single Round's own ready-made example — one round, nothing left to add
  // (see the Add Round button dropping out once hasRounds is true for this
  // format) and nothing to switch between on its Hole Assignments page
  // either, since Change Round only ever shows once there's a second round
  // somewhere to switch to.
  {
    id: 'heritage-classic-invitational-single',
    name: '2026 Heritage Classic Invitational (Single Round)',
    courseName: 'Heritage Golf Club',
    savedRoundFormat: 'single',
    rounds: {
      1: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18 },
    },
    hideRosterCount: true,
    hideSettingsButton: true,
  },
  // Defaults to Waves already set up (2 waves, 2 rounds each) as a ready-made
  // example for the wave-scoped Hole Assignments nav — WaveRoundNav.jsx — to
  // exercise the >=2-waves-with-rounds case without building it by hand.
  {
    id: 'heritage-classic-invitational-copy',
    hidden: true,
    name: '2026 Heritage Classic Invitational (Copy)',
    courseName: 'Heritage Golf Club',
    rounds: {
      1: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '8:00 AM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18 },
      2: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '11:00 AM on Sat Aug 15, 2026', startType: 'Tee Time Start', facilityName: 'Heritage Golf Club', holes: 18 },
      3: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '1:00 PM on Sat Aug 15, 2026', startType: 'Shotgun Start', facilityName: 'Heritage Golf Club', holes: 18 },
      4: { course: 'Championship Course', format: 'Four-Person Scramble', dateTime: '4:00 PM on Sat Aug 15, 2026', startType: 'Tee Time Start', facilityName: 'Heritage Golf Club', holes: 18 },
    },
    savedRoundFormat: 'waves',
    waves: [
      { id: 1, name: 'Morning', roundIds: [1, 2] },
      { id: 2, name: 'Afternoon', roundIds: [3, 4] },
    ],
    // Prototyping ground for the expanded Round Setup summary banner, which is
    // taking over surfacing roster completion — each round card's own "X/Y
    // Teams Assigned" count would just be duplicating it here.
    hideRosterCount: true,
    hideSettingsButton: true,
  },
  // Same shape/behavior as heritage-classic-invitational-copy just above (Waves
  // format, hides roster count/settings) but starts completely empty — no
  // savedRoundFormat, no rounds, no waves — so it has to be built from scratch
  // through the Round Setup flow (Single vs Multiple Rounds, then
  // Sequence/Wave/Hybrid Wave) instead of landing pre-seeded.
  {
    id: 'heritage-classic-invitational-wave-setup',
    hidden: true,
    name: '2026 Heritage Classic Invitational (Wave Setup)',
    courseName: 'Heritage Golf Club',
    rounds: {},
    hideRosterCount: true,
    hideSettingsButton: true,
  },
]
