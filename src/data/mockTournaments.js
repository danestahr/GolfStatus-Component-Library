// Mock tournaments for the Tournaments list page. The first row is the
// Quick Start prospect (Pat Open) so a freshly created tournament has a
// familiar spot in the list.
export const TOURNAMENT_STATUSES = [
  { id: 'active', label: 'Active', buttonType: 'status active' },
  { id: 'draft', label: 'Draft', buttonType: 'status inactive' },
  { id: 'completed', label: 'Complete', buttonType: 'black' },
]

export const statusMeta = id => TOURNAMENT_STATUSES.find(s => s.id === id) ?? TOURNAMENT_STATUSES[0]

export const TOURNAMENTS = [
  { id: 't1', startISO: '2026-11-05', name: 'Pat Open', organization: 'Pat Open Foundation', dates: 'Nov 5, 2026', course: 'Pine Valley', status: 'active', rounds: 4, players: 112, hasBanner: true },
  { id: 't2', startISO: '2026-04-18', name: 'Spring Scramble', organization: 'Rotary Club of Austin', dates: 'Apr 18, 2026 - Apr 23, 2026', course: 'Barton Creek', status: 'completed', rounds: 6, teams: 36, hasBanner: true },
  { id: 't3', startISO: '2027-06-12', name: 'Charity Classic', organization: 'Hope Together', dates: 'Jun 12, 2027', course: 'Oak Hollow', status: 'draft', rounds: 0, players: 0, hasBanner: false },
  { id: 't4', startISO: '2026-08-07', name: 'Member-Guest Invitational', organization: 'Cedar Ridge Country Club', dates: 'Aug 7, 2026 - Aug 9, 2026', course: 'Cedar Ridge', status: 'completed', rounds: 3, teams: 48, hasBanner: true },
  { id: 't5', startISO: '2026-10-03', name: 'Fall Fore Kids', organization: 'Eastside Youth League', dates: 'Oct 3, 2026', course: 'Lakeview Municipal', status: 'completed', rounds: 1, teams: 24, hasBanner: false },
  { id: 't6', startISO: '2027-05-21', name: 'Annual Golf Outing', organization: 'Summit Insurance Group', dates: 'May 21, 2027', course: 'Pine Valley', status: 'draft', rounds: 0, players: 0, hasBanner: false },
]

// Tournaments created through Quick Start live in createdTournaments.js
// (in memory) and are listed ahead of these.
export const findTournament = id => TOURNAMENTS.find(t => t.id === id)
