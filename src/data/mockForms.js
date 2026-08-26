// Mock forms available under Event Site & Packages → Forms. These are the
// same forms referenced by mockOrders (Course Selection, Player Details,
// Sponsor Details) and attached to packages in mockEventSitePackages.js —
// this list is where they'd actually get created/managed.

export const forms = [
  { id: 'form-1', name: 'Player Details', createdAt: 'Jul 2, 2026' },
  { id: 'form-2', name: 'Course Selection', createdAt: 'Jul 2, 2026' },
  { id: 'form-3', name: 'Sponsor Details', createdAt: 'Jul 9, 2026' },
  // Member Number and Guest Count each carry a single question that only
  // takes a numeric answer (see NUMBER_QUESTIONS in orderUtils.js) — the
  // "responds as Number Response" case the other forms didn't exercise.
  // Member Referral is plain free text (a member's name), same as Player
  // Details' own free-text questions.
  { id: 'form-4', name: 'Member Number', createdAt: 'Aug 11, 2026' },
  { id: 'form-5', name: 'Guest Count', createdAt: 'Aug 12, 2026' },
  { id: 'form-6', name: 'Member Referral', createdAt: 'Aug 14, 2026' },
]
