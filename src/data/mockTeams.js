// Mock data for the Teams tile's roster view — everyone who registered a
// team, grouped the way the Figma "Players & Teams" file lays it out:
// players waiting on a team, entries waiting on an open slot, and teams
// that are fully registered for the tournament.

// Derek Holloway (see his own comment on Fairway Fanatics below) has already
// been manually added to a team's open slot, so he's no longer waiting here.
export const unassignedPlayers = [
  {
    id: 'up-2002',
    name: 'Priya Anand',
    email: 'priya.anand@email.com',
    phone: '(555) 908-3341',
  },
  // Still waiting on a team, unlike Derek — carries the same shape his own
  // unassigned entry used to (own `orderId`/`packageName`, see ord-1025 in
  // mockOrders.js), so the Order Details icon on his card has an order to
  // link to (see TeamRosterCard.jsx's `person.orderId` check).
  {
    id: 'up-2003',
    name: 'Miles Chandler',
    email: 'miles.chandler@email.com',
    phone: '(555) 902-4471',
    orderId: 'ord-1025',
    packageName: 'Individual Registration',
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
    packageName: 'Team Registration',
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
  // Wes Callahan's old slot was manually filled by Derek Holloway, who'd
  // bought his own Individual Registration (ord-1024, see mockOrders.js)
  // rather than paying into this team's own Team Registration order
  // (ord-1015 above) — the two orders stay entirely separate even though
  // he's now on the roster, which is exactly the case the Team Overview
  // player card's Order Details icon (and its "pick which order" list, once
  // a team carries more than one) exists to handle.
  {
    id: 'tm-2002',
    orderId: 'ord-1015',
    packageName: 'Team Registration',
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
      { id: 'pl-30023', name: 'Derek Holloway', email: 'derek.holloway@email.com', handicap: 13.4, orderId: 'ord-1024' },
      { id: 'pl-30024', name: 'Nora Kim', email: 'nora.kim@email.com', handicap: 11.5 },
    ],
  },
  {
    id: 'tm-2003',
    orderId: 'ord-1021',
    packageName: 'Team Registration',
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
    packageName: 'Team Registration',
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
  // tm-2005 onward: every remaining order in mockOrders.js that carries a
  // team/player-fillLevel form (a "Team Registration" or "Premium Hole
  // Sponsor (Includes a Team)" package) gets its own registered team here,
  // matched by that order's `orderId` (plus `packageName` when more than one
  // team shares an order — see the ord-1005 comment below) — otherwise that
  // order's "View Team" link (see viewEntityAcrossOrders in
  // TeamsListPage.jsx, SponsorsListPage.jsx, and OrdersDraft1Page.jsx) has no
  // team to resolve to and falls back to a bare list instead of opening Team
  // Overview. Each roster's player names mirror that order's Player Details
  // respondents exactly, same as tm-2001 through tm-2004 above.
  {
    id: 'tm-2005',
    orderId: 'ord-1003',
    packageName: 'Team Registration',
    teamName: "Nguyen Family Four",
    code: 'MN5RQP17',
    round: 'Round 1',
    checkedIn: false,
    disqualified: false,
    contactName: 'Emily Nguyen',
    email: 'emily.nguyen@email.com',
    phone: '(555) 340-7765',
    players: [
      { id: 'pl-30051', name: 'Emily Nguyen', email: 'emily.nguyen@email.com', handicap: 11.4 },
      { id: 'pl-30052', name: 'Marcus Nguyen', email: 'marcus.nguyen@email.com', handicap: 9.6 },
      { id: 'pl-30053', name: 'Alicia Rowe', email: 'alicia.rowe@email.com', handicap: 18.1, note: 'Gluten-free at the turn stand' },
      { id: 'pl-30054', name: 'Tom Rowe', email: 'tom.rowe@email.com', handicap: 13.9 },
    ],
  },
  {
    id: 'tm-2006',
    orderId: 'ord-1004',
    packageName: 'Premium Hole Sponsor (Includes a Team)',
    teamName: 'Alvarez All-Stars',
    code: 'WB8TZL42',
    round: 'Round 1',
    checkedIn: false,
    disqualified: false,
    contactName: 'Robert Alvarez',
    email: 'r.alvarez@email.com',
    phone: '(555) 774-3320',
    players: [
      { id: 'pl-30061', name: 'Robert Alvarez', email: 'r.alvarez@email.com', handicap: 6.3 },
      { id: 'pl-30062', name: 'Diane Foster', email: 'diane.foster@email.com', handicap: 14.7 },
      { id: 'pl-30063', name: 'Carl Nguyen', email: 'carl.nguyen@email.com', handicap: 10.5 },
      { id: 'pl-30064', name: 'Beth Ramirez', email: 'beth.ramirez@email.com', handicap: 16.8 },
    ],
  },
  // ord-1005 bundles two separate teams in one order — Team Registration
  // (Linda Park's own foursome) plus a second team included with the
  // Premium Hole Sponsor package (captained by Owen Park). Both share the
  // same orderId since that's how the order itself is modeled; each team's
  // own `packageName` is what lets the "View Team" link tell them apart
  // (see viewEntityAcrossOrders in TeamsListPage.jsx/SponsorsListPage.jsx/
  // OrdersDraft1Page.jsx, which fall back to matching by orderId alone for
  // any single-team order that doesn't pass a packageName through).
  {
    id: 'tm-2007',
    orderId: 'ord-1005',
    packageName: 'Team Registration',
    teamName: 'Park Family Foursome',
    code: 'HD3GXN65',
    round: 'Round 1',
    checkedIn: false,
    disqualified: false,
    contactName: 'Linda Park',
    email: 'linda.park@email.com',
    phone: '(555) 610-9924',
    players: [
      { id: 'pl-30071', name: 'Linda Park', email: 'linda.park@email.com', handicap: 15.2 },
      { id: 'pl-30072', name: 'George Park', email: 'george.park@email.com', handicap: 8.9 },
      { id: 'pl-30073', name: 'Nina Osei', email: 'nina.osei@email.com', handicap: 12.4, note: 'Vegetarian at the turn stand' },
      { id: 'pl-30074', name: 'Kevin Osei', email: 'kevin.osei@email.com', handicap: 17.6 },
    ],
  },
  {
    id: 'tm-2008',
    orderId: 'ord-1005',
    packageName: 'Premium Hole Sponsor (Includes a Team)',
    teamName: 'Eagle Hunters',
    code: 'FQ6PWJ91',
    round: 'Round 2',
    checkedIn: false,
    disqualified: false,
    contactName: 'Owen Park',
    email: 'owen.park@email.com',
    phone: '(555) 610-9931',
    players: [
      { id: 'pl-30081', name: 'Owen Park', email: 'owen.park@email.com', handicap: 9.3 },
      { id: 'pl-30082', name: 'Rachel Kim', email: 'rachel.kim@email.com', handicap: 13.5, note: 'Gluten-free at the turn stand' },
      { id: 'pl-30083', name: 'Derek Silva', email: 'derek.silva@email.com', handicap: 7.8 },
      { id: 'pl-30084', name: 'Maya Chen', email: 'maya.chen@email.com', handicap: 14.0 },
    ],
  },
  {
    id: 'tm-2009',
    orderId: 'ord-1006',
    packageName: 'Premium Hole Sponsor (Includes a Team)',
    teamName: 'Auto Body Aces',
    code: 'RS2KVD73',
    round: 'Round 2',
    checkedIn: false,
    disqualified: false,
    contactName: 'Michael Torres',
    email: 'mtorres@email.com',
    phone: '(555) 488-2210',
    players: [
      { id: 'pl-30091', name: 'Michael Torres', email: 'mtorres@email.com', handicap: 11.1, note: 'Gluten-free at the turn stand' },
      { id: 'pl-30092', name: 'Jason Kim', email: 'jason.kim@email.com', handicap: 15.9 },
      { id: 'pl-30093', name: 'Paul Diaz', email: 'paul.diaz@email.com', handicap: 10.3 },
      { id: 'pl-30094', name: 'Chris Boyd', email: 'chris.boyd@email.com', handicap: 12.7 },
    ],
  },
  // tm-2010 and tm-2011: the shirt-size support-ticket practice scenario
  // (see the ord-1007/1008/1009 comment in mockOrders.js) — the two open
  // "TBD" slots are unfilled roster spots, not a real duplicate player.
  {
    id: 'tm-2010',
    orderId: 'ord-1007',
    packageName: 'Team Registration',
    teamName: 'Nacrelli Foursome',
    code: 'LT9CBH24',
    round: 'Round 1',
    checkedIn: false,
    disqualified: false,
    contactName: 'Tim Nacrelli',
    email: 'tim.nacrelli@email.com',
    phone: '(555) 349-2201',
    players: [
      { id: 'pl-30101', name: 'Tim Nacrelli', email: 'tim.nacrelli@email.com', handicap: 10.0 },
      { id: 'pl-30102', name: 'Eric Sporre', email: 'eric.sporre@email.com', handicap: 14.4 },
      { id: 'pl-30103', name: 'TBD', email: '', handicap: 0 },
      { id: 'pl-30104', name: 'TBD', email: '', handicap: 0 },
    ],
  },
  {
    id: 'tm-2011',
    orderId: 'ord-1008',
    packageName: 'Team Registration',
    teamName: 'Hood Foursome',
    code: 'VN4XPS86',
    round: 'Round 1',
    checkedIn: false,
    disqualified: false,
    contactName: 'Jane Hood',
    email: 'jane.hood@email.com',
    phone: '(555) 762-4489',
    players: [
      { id: 'pl-30111', name: 'Jane Hood', email: 'jane.hood@email.com', handicap: 13.2 },
      { id: 'pl-30112', name: 'Brendan Carroll', email: 'brendan.carroll@email.com', handicap: 9.7, note: 'Vegetarian at the turn stand' },
      { id: 'pl-30113', name: 'TBD', email: '', handicap: 0 },
      { id: 'pl-30114', name: 'TBD', email: '', handicap: 0 },
    ],
  },
  {
    id: 'tm-2012',
    orderId: 'ord-1009',
    packageName: 'Team Registration',
    teamName: 'Graves Foursome',
    code: 'YK7MDW38',
    round: 'Round 2',
    checkedIn: true,
    disqualified: false,
    contactName: 'Gerald Graves',
    email: 'gerald.graves@email.com',
    phone: '(555) 810-3376',
    players: [
      { id: 'pl-30121', name: 'Gerald Graves', email: 'gerald.graves@email.com', handicap: 12.9 },
      { id: 'pl-30122', name: 'Griffin Graves', email: 'griffin.graves@email.com', handicap: 16.5 },
      { id: 'pl-30123', name: 'Brad Blyth', email: 'brad.blyth@email.com', handicap: 8.2, note: 'Gluten-free at the turn stand' },
      { id: 'pl-30124', name: 'Halle Miller', email: 'halle.miller@email.com', handicap: 11.6 },
    ],
  },
  {
    id: 'tm-2013',
    orderId: 'ord-1011',
    packageName: 'Premium Hole Sponsor (Includes a Team)',
    teamName: 'Whitfield Foursome',
    code: 'CJ1RGZ59',
    round: 'Round 1',
    checkedIn: false,
    disqualified: false,
    contactName: 'Dan Whitfield',
    email: 'dan@whitfieldlaw.com',
    phone: '(555) 812-3390',
    players: [
      { id: 'pl-30131', name: 'Dan Whitfield', email: 'dan@whitfieldlaw.com', handicap: 9.9 },
      { id: 'pl-30132', name: 'Colleen Whitfield', email: 'colleen.whitfield@email.com', handicap: 15.3, note: 'Vegetarian at the turn stand' },
      { id: 'pl-30133', name: 'Ryan Sato', email: 'ryan.sato@email.com', handicap: 7.4 },
      { id: 'pl-30134', name: 'Nadia Brooks', email: 'nadia.brooks@email.com', handicap: 13.0 },
    ],
  },
  {
    id: 'tm-2014',
    orderId: 'ord-1018',
    packageName: 'Team Registration',
    teamName: 'Kim Orthodontics Crew',
    code: 'PX6HLA47',
    round: 'Round 2',
    checkedIn: false,
    disqualified: false,
    contactName: 'Grace Kim',
    email: 'grace.kim@kimortho.com',
    phone: '(555) 903-6641',
    players: [
      { id: 'pl-30141', name: 'Grace Kim', email: 'grace.kim@kimortho.com', handicap: 12.2 },
      { id: 'pl-30142', name: 'Owen Fitzgerald', email: 'owen.fitzgerald@email.com', handicap: 16.9, note: 'Vegan at the turn stand' },
      { id: 'pl-30143', name: 'Maritza Lopez', email: 'maritza.lopez@email.com', handicap: 10.8 },
      { id: 'pl-30144', name: 'Caleb Dunn', email: 'caleb.dunn@email.com', handicap: 14.5 },
    ],
  },
  // ord-1023 bundles two separate teams in one order, same as ord-1005
  // above — Team Registration (Nathan Cole's own foursome) plus a second
  // team included with the Premium Hole Sponsor package (captained by Priya
  // Sharma). This order also carries two sponsors (see the ord-1006/ord-1023
  // comment in mockOrders.js) — teams and sponsors are tracked in separate
  // files/lists, so each just needs its own packageName-disambiguated record
  // here, independent of how many sponsors share the same order.
  {
    id: 'tm-2015',
    orderId: 'ord-1023',
    packageName: 'Team Registration',
    teamName: 'Cole Crew',
    code: 'NT8FJQ52',
    round: 'Round 1',
    checkedIn: false,
    disqualified: false,
    contactName: 'Nathan Cole',
    email: 'nathan.cole@coleassociates.com',
    phone: '(555) 227-6640',
    players: [
      { id: 'pl-30151', name: 'Nathan Cole', email: 'nathan.cole@coleassociates.com', handicap: 10.6 },
      { id: 'pl-30152', name: 'Wendy Cole', email: 'wendy.cole@email.com', handicap: 15.8, note: 'Vegetarian at the turn stand' },
      { id: 'pl-30153', name: 'Bruce Lam', email: 'bruce.lam@email.com', handicap: 8.7 },
      { id: 'pl-30154', name: 'Sofia Vance', email: 'sofia.vance@email.com', handicap: 12.9 },
    ],
  },
  {
    id: 'tm-2016',
    orderId: 'ord-1023',
    packageName: 'Premium Hole Sponsor (Includes a Team)',
    teamName: 'Sharma Squad',
    code: 'PS3WGK84',
    round: 'Round 2',
    checkedIn: false,
    disqualified: false,
    contactName: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '(555) 227-6651',
    players: [
      { id: 'pl-30161', name: 'Priya Sharma', email: 'priya.sharma@email.com', handicap: 9.5 },
      { id: 'pl-30162', name: 'Marcus Diehl', email: 'marcus.diehl@email.com', handicap: 13.7, note: 'Gluten-free at the turn stand' },
      { id: 'pl-30163', name: 'Tara Whitmore', email: 'tara.whitmore@email.com', handicap: 16.1 },
      { id: 'pl-30164', name: 'Leo Bianchi', email: 'leo.bianchi@email.com', handicap: 7.2, note: 'Vegan at the turn stand' },
    ],
  },
]
