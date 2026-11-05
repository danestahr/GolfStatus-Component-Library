// Event checklist for the Tournament Overview. A starter template of the
// tasks it takes to run a successful event, grouped by phase and dated
// relative to the tournament start. Items are either:
//   - auto:   completed by the tournament's own data (`auto` names the rule in
//             AUTO_RULES) — not checkable by hand
//   - manual: checked off by whoever owns it
// Edits live in memory per tournament for the session, like createdTournaments.

export const PHASES = [
  { id: 'plan', label: 'Plan' },
  { id: 'setup', label: 'Set up' },
  { id: 'promote', label: 'Promote' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'event', label: 'Event day' },
  { id: 'wrap', label: 'Wrap up' },
]

export const ASSIGNEES = ['Dane Stahr', 'Pat Smith', 'Jordan Lee', 'Casey Morgan']
export const ME = 'Dane Stahr'

// `to` may contain `:id`, replaced with the tournament's id when followed.

// Rules that decide an auto item is done, from the tournament record.
const AUTO_RULES = {
  hasCourse: t => Boolean(t.course),
  hasRounds: t => (t.rounds ?? 0) > 0,
  siteLive: t => Boolean(t.hasBanner),
  hasPlayers: t => (t.players ?? t.teams ?? 0) > 0,
}

// `due` = days before (negative) or after (positive) the start date.
const TEMPLATE = [
  { phase: 'plan', title: 'Choose a date and course', why: 'Everything else — permits, sponsors, volunteers — hangs on a confirmed date and venue.', auto: 'hasCourse', due: -120 },
  { phase: 'plan', title: 'Set a budget and fundraising goal', why: 'Knowing what you need to clear tells you how many players and sponsors to aim for.', due: -110 },
  { phase: 'plan', title: 'Recruit a volunteer committee', why: 'Successful events split the work: registration, sponsors, on-course, and prizes each need an owner.', due: -100 },
  { phase: 'setup', title: 'Create rounds and format', why: 'Format and tee times drive hole assignments, scorecards, and what players see on the site.', auto: 'hasRounds', due: -90, to: '/scheduler' },
  { phase: 'setup', title: 'Publish your event website', why: 'The site is where players register and sponsors find you. Publish early so you can start promoting.', auto: 'siteLive', due: -85, to: '/tournaments/:id/event-site-packages' },
  { phase: 'setup', title: 'Create registration packages', why: 'Player, foursome, and add-on packages (mulligans, raffle) are your biggest revenue lines.', due: -80, to: '/tournaments/:id/event-site-packages' },
  { phase: 'setup', title: 'Add sponsorship packages', why: 'Sponsors typically cover event costs. Give them clear levels and deadlines.', due: -75, to: '/sponsors' },
  { phase: 'promote', title: 'Announce the event to past players', why: 'Past players are your warmest audience; most registrations come from the first email.', due: -70, to: '/messaging' },
  { phase: 'promote', title: 'Register your first players', why: 'Early registrations build momentum and show you whether your pricing is right.', auto: 'hasPlayers', due: -60, to: '/teams' },
  { phase: 'promote', title: 'Share the site on social and with partners', why: 'A link in the right newsletter or Facebook group can double sign-ups.', due: -45 },
  { phase: 'promote', title: 'Confirm sponsor logos and signage', why: 'Logos show on the site and mobile scorecards; signage needs lead time to print.', due: -30, to: '/sponsors' },
  { phase: 'prepare', title: 'Confirm headcount, carts, and meals with the course', why: 'Most courses need a final count 7–10 days out; changes after that cost money.', due: -10 },
  { phase: 'prepare', title: 'Assign holes and finalize pairings', why: 'Players check the app for their starting hole — lock it before you message them.', due: -7, to: '/scheduler' },
  { phase: 'prepare', title: 'Send final details email to players', why: 'Arrival time, parking, format reminders and how to use live scoring cut day-of questions.', due: -5, to: '/messaging' },
  { phase: 'prepare', title: 'Gather prizes, swag, and signage', why: 'Check everything is in hand and labeled so setup morning is quick.', due: -3 },
  { phase: 'event', title: 'Check teams in', why: 'Check-in confirms who showed up and catches no-shows before the shotgun.', due: 0 },
  { phase: 'event', title: 'Start rounds and monitor scoring', why: 'Watch live scoring for missing cards so the leaderboard is right when players finish.', due: 0 },
  { phase: 'event', title: 'Announce winners and thank sponsors', why: 'Recognition is what brings sponsors and players back next year.', due: 0 },
  { phase: 'wrap', title: 'Send a thank-you message', why: 'Within 48 hours — include photos, results, and the date of next year\'s event.', due: 2, to: '/messaging' },
  { phase: 'wrap', title: 'Reconcile orders and payouts', why: 'Match registrations and sponsorships to what you expected and settle with the course.', due: 7, to: '/orders' },
  { phase: 'wrap', title: 'Export reports for your records', why: 'Player lists and financials make next year\'s planning much faster.', due: 10 },
]

const addDays = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

let nextId = 1
export const newItemId = () => `custom-${nextId++}`

const buildChecklist = tournament =>
  TEMPLATE.map((item, i) => ({
    id: `task-${i + 1}`,
    phase: item.phase,
    title: item.title,
    why: item.why,
    auto: item.auto ?? null,
    to: item.to ?? null,
    dueISO: addDays(tournament.startISO, item.due),
    assignee: i % 5 === 0 ? 'Pat Smith' : i % 7 === 0 ? 'Jordan Lee' : ME,
    notes: '',
    done: false,
  }))

const store = new Map()

export const getChecklist = tournament => {
  if (!store.has(tournament.id)) store.set(tournament.id, buildChecklist(tournament))
  return store.get(tournament.id)
}

export const saveChecklist = (tournament, items) => store.set(tournament.id, items)

export const isDone = (item, tournament) => (item.auto ? AUTO_RULES[item.auto](tournament) : item.done)

const todayISO = () => {
  const now = new Date()
  return addDays(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`, 0)
}

export const isOverdue = (item, tournament) => !isDone(item, tournament) && item.dueISO < todayISO()

// "2026-11-05" -> "Nov 5"
export const shortDue = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// The next thing to do: earliest-due incomplete items.
export const nextUp = (items, tournament, count = 2) =>
  items
    .filter(i => !isDone(i, tournament))
    .sort((a, b) => a.dueISO.localeCompare(b.dueISO))
    .slice(0, count)

// "2026-11-05" -> "Thu, Nov 5, 2026" (the checklist page's "Due ..." line)
export const longDue = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// Tasks we suggest adding that aren't in the starter template. Adding one
// creates a normal manual task in the given phase, due `due` days from start.
export const SUGGESTIONS = [
  { key: 'sponsor-kit', phase: 'plan', title: 'Create Sponsor Media Kit', why: 'A one-page kit with audience, packages and pricing makes sponsor asks quick to send.', due: -105 },
  { key: 'promo-plan', phase: 'plan', title: 'Determine Promotional Plan', why: 'Decide channels and dates for email, social and partner promotion before registration opens.', due: -95 },
  { key: 'photographer', phase: 'prepare', title: 'Confirm Photographer', why: 'Photos power next year\'s promotion and sponsor thank-yous.', due: -14 },
  { key: 'insurance', phase: 'prepare', title: 'Confirm Event Insurance', why: 'Many courses require proof of coverage before the event.', due: -21 },
]
