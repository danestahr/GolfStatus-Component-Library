// Mock invoices — mirrors the Supabase `invoices` + `invoice_line_items` tables.

export const invoices = [
  {
    id: 'inv-001',
    status: 'draft',
    createdAt: '2026-04-01',
    lineItems: [
      {
        id: 'li-001',
        groupId: 'g-001',
        autoAdded: false,
        name: 'Technology Sponsorship',
        unitPrice: 899,
        quantity: 1,
        priceOverridden: false,
        notes: [],
      },
      {
        id: 'li-002',
        groupId: 'g-001',
        autoAdded: true,
        name: 'Invoicing & Discounts',
        unitPrice: 0,
        quantity: 1,
        notes: [],
      },
    ],
  },
  {
    id: 'inv-002',
    status: 'sent',
    createdAt: '2026-04-10',
    lineItems: [
      {
        id: 'li-003',
        groupId: 'g-002',
        autoAdded: false,
        name: 'Flags',
        unitPrice: 1198,
        quantity: 2,
        priceOverridden: false,
        notes: ['Rush Order'],
      },
    ],
  },
]
