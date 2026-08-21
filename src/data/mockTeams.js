// Mock data for the Teams tile's roster view — everyone who registered a
// team, grouped the way the Figma "Players & Teams" file lays it out:
// players waiting on a team, entries waiting on an open slot, and teams
// that are fully registered for the tournament.

export const unassignedPlayers = [
  {
    id: 'up-2001',
    name: 'Derek Holloway',
    email: 'derek.holloway@email.com',
    phone: '(555) 214-7783',
  },
  {
    id: 'up-2002',
    name: 'Priya Anand',
    email: 'priya.anand@email.com',
    phone: '(555) 908-3341',
  },
]

export const waitlistEntries = [
  {
    id: 'wl-2001',
    name: 'Colin Whitfield',
    email: 'colin.whitfield@email.com',
    phone: '(555) 447-1029',
    entryType: 'Individual',
  },
  {
    id: 'wl-2002',
    name: 'Reyes Foursome',
    email: 'marta.reyes@email.com',
    phone: '(555) 662-9938',
    entryType: 'Team',
  },
  {
    id: 'wl-2003',
    name: 'Owen Baptiste',
    email: 'owen.baptiste@email.com',
    phone: '(555) 331-5567',
    entryType: 'Individual',
  },
  {
    id: 'wl-2004',
    name: 'Night Owls',
    email: 'jasmine.cole@email.com',
    phone: '(555) 774-2210',
    entryType: 'Team',
  },
]

export const registeredTeams = [
  {
    id: 'tm-2001',
    orderId: 'ord-1001',
    teamName: 'Mitchell Foursome',
    code: 'XT9XFQQ4',
    round: 'Round 1',
    checkedIn: true,
    disqualified: false,
    contactName: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '(555) 219-4482',
    players: [
      { id: 'pl-30011', name: 'Sarah Mitchell', email: 'sarah.mitchell@email.com', handicap: 8.4, note: 'Requests a cart with GPS' },
      { id: 'pl-30012', name: 'Danny Osei', email: 'danny.osei@email.com', handicap: 12.1 },
      { id: 'pl-30013', name: 'Renee Park', email: 'renee.park@email.com', handicap: 15.6 },
      { id: 'pl-30014', name: 'Tomas Alvarez', email: 'tomas.alvarez@email.com', handicap: 10.2 },
    ],
  },
  {
    id: 'tm-2002',
    orderId: 'ord-1015',
    teamName: 'Fairway Fanatics',
    code: 'QP2LMN81',
    round: 'Round 1',
    checkedIn: false,
    disqualified: false,
    contactName: 'Marcus Bell',
    email: 'marcus.bell@bellmfg.com',
    phone: '(555) 762-0918',
    players: [
      { id: 'pl-30021', name: 'Marcus Bell', email: 'marcus.bell@bellmfg.com', handicap: 6.9, note: 'Walking, no cart needed' },
      { id: 'pl-30022', name: 'Julia Ferreira', email: 'julia.ferreira@email.com', handicap: 14.3 },
      { id: 'pl-30023', name: 'Wes Callahan', email: 'wes.callahan@email.com', handicap: 9.8 },
      { id: 'pl-30024', name: 'Nora Kim', email: 'nora.kim@email.com', handicap: 11.5 },
    ],
  },
  {
    id: 'tm-2003',
    orderId: 'ord-1021',
    teamName: 'Birdie Brigade',
    code: 'RT7VXC29',
    round: 'Round 1',
    checkedIn: false,
    disqualified: true,
    contactName: 'Ana Ruiz',
    email: 'ana.ruiz@email.com',
    phone: '(402) 671-3390',
    players: [
      { id: 'pl-30031', name: 'Ana Ruiz', email: 'ana.ruiz@email.com', handicap: 13.0 },
      { id: 'pl-30032', name: 'Hassan Ali', email: 'hassan.ali@email.com', handicap: 17.4 },
      { id: 'pl-30033', name: 'Ben Torres', email: 'ben.torres@email.com', handicap: 10.9 },
    ],
  },
  {
    id: 'tm-2004',
    orderId: 'ord-1022',
    teamName: 'Sand Trap Squad',
    code: 'JK4DWH56',
    round: 'Round 2',
    checkedIn: false,
    disqualified: false,
    contactName: 'Tom Nguyen',
    email: 'tom.nguyen@email.com',
    phone: '(402) 884-2201',
    players: [
      { id: 'pl-30041', name: 'Tom Nguyen', email: 'tom.nguyen@email.com', handicap: 7.7, note: 'Arriving 30 minutes late' },
      { id: 'pl-30042', name: 'Elise Byrne', email: 'elise.byrne@email.com', handicap: 16.2 },
      { id: 'pl-30043', name: 'Grace Kim', email: 'grace.kim@email.com', handicap: 12.8 },
      { id: 'pl-30044', name: 'Ivan Petrov', email: 'ivan.petrov@email.com', handicap: 9.1 },
    ],
  },
]
