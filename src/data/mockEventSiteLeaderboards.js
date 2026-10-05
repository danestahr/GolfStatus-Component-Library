// Mock leaderboards for the public Event Site's Leaderboards page (Figma
// "Leaderboards"). Entries are already in rank order.
const TEAMS = [
  ['Mitchell Foursome', 'Mitchell / Osei / Park / Alvarez'],
  ['Fairway Fanatics', 'Callahan / Holloway / Reyes / Nguyen'],
  ['Birdie Brigade', 'Okafor / Lindqvist / Shaw / Brandt'],
  ['Green Machine', 'Patel / Kim / Duarte / Sloan'],
  ['Par-Tee Animals', 'Whitfield / Carter / Hughes / Vega'],
  ['Sand Trappers', 'Moreno / Tran / Foster / Bell'],
  ['Short Game Heroes', 'Anand / Chandler / Ruiz / Cole'],
  ['Slice & Dice', 'Ward / Price / Nakamura / Bauer'],
]

const STROKES = [60, 61, 62, 62, 64, 65, 66, 68]

const teamEntries = type =>
  TEAMS.map(([team, players], i) => {
    const strokes = STROKES[i] + (type === 'Net' ? -6 : 0)
    const total = strokes - 72
    return {
      id: `${type}-${i}`,
      rank: i > 0 && STROKES[i] === STROKES[i - 1] ? `T${i}` : `${i + 1}`,
      name: players,
      team,
      total: total === 0 ? 'E' : total > 0 ? `+${total}` : `${total}`,
      thru: i % 4 === 3 ? '14' : 'F',
      strokes,
      points: 100 - i * 6,
    }
  })

export const eventSiteLeaderboards = [
  { id: 'team-gross', title: 'Team (Gross) Leaderboard', updated: 'Aug 24, 2026 at 2:15 PM', entries: teamEntries('Gross') },
  { id: 'team-net', title: 'Team (Net) Leaderboard', updated: 'Aug 24, 2026 at 2:15 PM', entries: teamEntries('Net') },
]
