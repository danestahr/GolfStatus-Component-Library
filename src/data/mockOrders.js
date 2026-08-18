// Mock orders — mirrors the Supabase `orders` table for the Orders & Payouts page.

export const availableFunds = {
  amount: 7702.00,
  asOf: '2:14 PM on Aug 13, 2026',
}

export const orderStats = [
  { key: 'net-revenue', label: 'Net Revenue', value: '$10,000.00', count: '14 Orders' },
  { key: 'pending-revenue', label: 'Pending Revenue', value: '$2,000.00', count: '2 Orders' },
  { key: 'paid-out', label: 'Paid Out', value: '$0.00', count: '0 Payouts' },
  { key: 'refunds', label: 'Refunds', value: '$750.00', count: '1 Refund' },
  { key: 'products', label: 'GolfStatus Products', value: '$2,298.00', count: '2 Invoices' },
]

// Package catalog for this tournament:
//   Team Registration            — Course Selection (by team, 1 response) +
//                                   Player Details (by player, 4 responses)
//   Premium Hole Sponsor         — the same team forms, plus Sponsor Details
//   (Includes a Team)              (by sponsor, 1 response)
//   Basic Hole Sponsor           — Sponsor Details only (by sponsor, 1 response)
//
// Orders below cover both solo purchases and every pairwise combo of the
// three, since a buyer can register a team and separately sponsor a hole in
// the same order.
export const orders = [
  {
    id: 'ord-1001',
    buyerName: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '(555) 219-4482',
    paymentType: 'Credit Card',
    date: '2026-08-12',
    dateTime: '10:42 AM on Aug 12, 2026',
    orderType: 'Online Order',
    packages: ['Team Registration'],
    lineItems: [
      { name: 'Team Registration', unitPrice: 800.0, quantity: 1 },
    ],
    fee: 50.0,
    amount: 850.0,
    status: 'paid',
    formResponses: [
      {
        formName: 'Course Selection',
        packageName: 'Team Registration',
        question: 'Which course do you want to play?',
        fillLevel: 'team',
        answers: [{ respondent: 'Sarah Mitchell', value: 'Course 1' }],
      },
      {
        formName: 'Player Details',
        packageName: 'Team Registration',
        question: 'What is your shirt size?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Sarah Mitchell', value: 'L' },
          { respondent: 'Dan Whitfield', value: 'M' },
          { respondent: 'Lisa Chen', value: 'S' },
          { respondent: 'Mark Reyes', value: '' },
        ],
      },
      {
        formName: 'Player Details',
        packageName: 'Team Registration',
        question: 'Do you have any dietary restrictions?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Sarah Mitchell', value: 'None' },
          { respondent: 'Dan Whitfield', value: 'Vegetarian' },
          { respondent: 'Lisa Chen', value: 'None' },
          { respondent: 'Mark Reyes', value: 'None' },
        ],
      },
    ],
  },
  {
    id: 'ord-1002',
    buyerName: 'James Carter',
    businessName: 'Carter Insurance Group',
    email: 'jcarter@email.com',
    phone: '(555) 902-1187',
    paymentType: 'Credit Card',
    date: '2026-08-12',
    dateTime: '9:15 AM on Aug 12, 2026',
    orderType: 'Online Order',
    packages: ['Basic Hole Sponsor'],
    lineItems: [
      { name: 'Basic Hole Sponsor', unitPrice: 150.0, quantity: 1 },
    ],
    fee: 15.0,
    amount: 165.0,
    status: 'pending',
    formResponses: [
      {
        formName: 'Sponsor Details',
        packageName: 'Basic Hole Sponsor',
        question: 'Are you planning on coming to the Sponsor Happy Hour?',
        fillLevel: 'sponsor',
        answers: [{ respondent: 'James Carter', value: 'Yes' }],
      },
    ],
  },
  {
    id: 'ord-1003',
    buyerName: 'Emily Nguyen',
    businessName: 'Nguyen Family Dentistry',
    email: 'emily.nguyen@email.com',
    phone: '(555) 340-7765',
    paymentType: 'Check',
    date: '2026-08-11',
    dateTime: '4:03 PM on Aug 11, 2026',
    orderType: 'Online Order',
    packages: ['Team Registration', 'Basic Hole Sponsor'],
    lineItems: [
      { name: 'Team Registration', unitPrice: 800.0, quantity: 1 },
      { name: 'Basic Hole Sponsor', unitPrice: 150.0, quantity: 1 },
    ],
    fee: 50.0,
    amount: 1000.0,
    status: 'paid',
    formResponses: [
      {
        formName: 'Course Selection',
        packageName: 'Team Registration',
        question: 'Which course do you want to play?',
        fillLevel: 'team',
        answers: [{ respondent: 'Emily Nguyen', value: 'Course 1' }],
      },
      {
        formName: 'Player Details',
        packageName: 'Team Registration',
        question: 'What is your shirt size?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Emily Nguyen', value: 'S' },
          { respondent: 'Marcus Nguyen', value: 'L' },
          { respondent: 'Alicia Rowe', value: 'S' },
          { respondent: 'Tom Rowe', value: 'XL' },
        ],
      },
      {
        formName: 'Player Details',
        packageName: 'Team Registration',
        question: 'Do you have any dietary restrictions?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Emily Nguyen', value: 'None' },
          { respondent: 'Marcus Nguyen', value: 'None' },
          { respondent: 'Alicia Rowe', value: 'Gluten-Free' },
          { respondent: 'Tom Rowe', value: 'None' },
        ],
      },
      {
        formName: 'Sponsor Details',
        packageName: 'Basic Hole Sponsor',
        question: 'Are you planning on coming to the Sponsor Happy Hour?',
        fillLevel: 'sponsor',
        answers: [{ respondent: 'Emily Nguyen', value: '' }],
      },
    ],
  },
  {
    id: 'ord-1004',
    buyerName: 'Robert Alvarez',
    businessName: 'Alvarez Construction',
    email: 'r.alvarez@email.com',
    phone: '(555) 774-3320',
    paymentType: 'Credit Card',
    date: '2026-08-10',
    dateTime: '11:58 AM on Aug 10, 2026',
    orderType: 'Online Order',
    packages: ['Premium Hole Sponsor (Includes a Team)'],
    lineItems: [
      { name: 'Premium Hole Sponsor (Includes a Team)', unitPrice: 1200.0, quantity: 1 },
    ],
    fee: 25.0,
    amount: 1225.0,
    status: 'refunded',
    formResponses: [
      {
        formName: 'Course Selection',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Which course do you want to play?',
        fillLevel: 'team',
        answers: [{ respondent: 'Robert Alvarez', value: 'Course 3' }],
      },
      {
        formName: 'Player Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'What is your shirt size?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Robert Alvarez', value: 'L' },
          { respondent: 'Diane Foster', value: 'M' },
          { respondent: 'Carl Nguyen', value: 'XL' },
          { respondent: 'Beth Ramirez', value: 'S' },
        ],
      },
      {
        formName: 'Player Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Do you have any dietary restrictions?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Robert Alvarez', value: 'None' },
          { respondent: 'Diane Foster', value: 'None' },
          { respondent: 'Carl Nguyen', value: 'Vegan' },
          { respondent: 'Beth Ramirez', value: '' },
        ],
      },
      {
        formName: 'Sponsor Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Are you planning on coming to the Sponsor Happy Hour?',
        fillLevel: 'sponsor',
        answers: [{ respondent: 'Robert Alvarez', value: '' }],
      },
    ],
  },
  {
    id: 'ord-1005',
    buyerName: 'Linda Park',
    businessName: 'Park Legal Group',
    email: 'linda.park@email.com',
    phone: '(555) 610-9924',
    paymentType: 'Credit Card',
    date: '2026-08-09',
    dateTime: '8:27 AM on Aug 9, 2026',
    orderType: 'Online Order',
    packages: ['Team Registration', 'Premium Hole Sponsor (Includes a Team)'],
    lineItems: [
      { name: 'Team Registration', unitPrice: 800.0, quantity: 1 },
      { name: 'Premium Hole Sponsor (Includes a Team)', unitPrice: 1200.0, quantity: 1 },
    ],
    fee: 50.0,
    amount: 2050.0,
    status: 'void',
    formResponses: [
      {
        formName: 'Course Selection',
        packageName: 'Team Registration',
        question: 'Which course do you want to play?',
        fillLevel: 'team',
        answers: [{ respondent: 'Linda Park', value: 'Course 2' }],
      },
      {
        formName: 'Player Details',
        packageName: 'Team Registration',
        question: 'What is your shirt size?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Linda Park', value: 'M' },
          { respondent: 'George Park', value: 'XL' },
          { respondent: 'Nina Osei', value: 'S' },
          { respondent: 'Kevin Osei', value: 'L' },
        ],
      },
      {
        formName: 'Player Details',
        packageName: 'Team Registration',
        question: 'Do you have any dietary restrictions?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Linda Park', value: 'None' },
          { respondent: 'George Park', value: 'None' },
          { respondent: 'Nina Osei', value: 'Vegetarian' },
          { respondent: 'Kevin Osei', value: '' },
        ],
      },
      {
        formName: 'Course Selection',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Which course do you want to play?',
        fillLevel: 'team',
        answers: [{ respondent: 'Owen Park', value: 'Course 2' }],
      },
      {
        formName: 'Player Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'What is your shirt size?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Owen Park', value: 'L' },
          { respondent: 'Rachel Kim', value: 'S' },
          { respondent: 'Derek Silva', value: 'XL' },
          { respondent: 'Maya Chen', value: 'M' },
        ],
      },
      {
        formName: 'Player Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Do you have any dietary restrictions?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Owen Park', value: 'None' },
          { respondent: 'Rachel Kim', value: 'Gluten-Free' },
          { respondent: 'Derek Silva', value: 'None' },
          { respondent: 'Maya Chen', value: 'None' },
        ],
      },
      {
        formName: 'Sponsor Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Are you planning on coming to the Sponsor Happy Hour?',
        fillLevel: 'sponsor',
        answers: [{ respondent: 'Linda Park', value: 'Yes' }],
      },
    ],
  },
  {
    id: 'ord-1006',
    buyerName: 'Michael Torres',
    businessName: 'Torres Auto Body',
    email: 'mtorres@email.com',
    phone: '(555) 488-2210',
    paymentType: 'Credit Card',
    date: '2026-08-08',
    dateTime: '2:51 PM on Aug 8, 2026',
    orderType: 'Online Order',
    packages: ['Basic Hole Sponsor', 'Premium Hole Sponsor (Includes a Team)'],
    lineItems: [
      { name: 'Basic Hole Sponsor', unitPrice: 150.0, quantity: 1 },
      { name: 'Premium Hole Sponsor (Includes a Team)', unitPrice: 1200.0, quantity: 1 },
    ],
    fee: 25.0,
    amount: 1375.0,
    status: 'paid',
    formResponses: [
      {
        formName: 'Sponsor Details',
        packageName: 'Basic Hole Sponsor',
        question: 'Are you planning on coming to the Sponsor Happy Hour?',
        fillLevel: 'sponsor',
        answers: [{ respondent: 'Michael Torres', value: 'Yes' }],
      },
      {
        formName: 'Course Selection',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Which course do you want to play?',
        fillLevel: 'team',
        answers: [{ respondent: 'Michael Torres', value: '' }],
      },
      {
        formName: 'Player Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'What is your shirt size?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Michael Torres', value: 'XL' },
          { respondent: 'Jason Kim', value: '' },
          { respondent: 'Paul Diaz', value: '' },
          { respondent: 'Chris Boyd', value: '' },
        ],
      },
      {
        formName: 'Player Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Do you have any dietary restrictions?',
        fillLevel: 'player',
        answers: [
          { respondent: 'Michael Torres', value: 'Gluten-Free' },
          { respondent: 'Jason Kim', value: 'None' },
          { respondent: 'Paul Diaz', value: 'None' },
          { respondent: 'Chris Boyd', value: 'None' },
        ],
      },
      {
        formName: 'Sponsor Details',
        packageName: 'Premium Hole Sponsor (Includes a Team)',
        question: 'Are you planning on coming to the Sponsor Happy Hour?',
        fillLevel: 'sponsor',
        answers: [{ respondent: 'Michael Torres', value: 'No' }],
      },
    ],
  },
]

export const STATUS_LABEL = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
  void: 'Void',
}
