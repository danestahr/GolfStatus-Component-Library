// Mock packages sold on the event site — the Event Site & Packages tile on
// the Orders and Forms hub is where these packages (and the forms attached
// to them, e.g. Course Selection / Player Details / Sponsor Details) get
// created and managed. `remaining: null` means the package has no inventory
// cap (e.g. add-ons anyone can buy any number of times).

export const eventSitePackages = [
  {
    id: 'pkg-1',
    name: 'Team Registration',
    category: 'Registration Package',
    price: 800.0,
    formsCount: 2,
    purchased: 14,
    remaining: 61,
    updatedAt: 'Updated Aug 5, 2026',
    status: 'active',
  },
  {
    id: 'pkg-2',
    name: 'Premium Hole Sponsor',
    category: 'Sponsorship Package',
    price: 1200.0,
    formsCount: 2,
    purchased: 3,
    remaining: 12,
    updatedAt: 'Updated Aug 3, 2026',
    status: 'active',
  },
  {
    id: 'pkg-3',
    name: 'Basic Hole Sponsor',
    category: 'Sponsorship Package',
    price: 500.0,
    formsCount: 1,
    purchased: 8,
    remaining: 4,
    updatedAt: 'Updated Jul 28, 2026',
    status: 'active',
  },
  {
    id: 'pkg-4',
    name: 'Technology Sponsorship',
    category: 'Sponsorship Package',
    price: 899.0,
    formsCount: 0,
    purchased: 0,
    remaining: 1,
    updatedAt: 'Updated Jul 20, 2026',
    status: 'draft',
  },
  {
    id: 'pkg-5',
    name: 'Hole In One Insurance',
    category: 'Add-on Package',
    price: 199.0,
    formsCount: 0,
    purchased: 22,
    remaining: null,
    updatedAt: 'Updated Jul 15, 2026',
    status: 'active',
  },
  {
    id: 'pkg-6',
    name: 'Hole Signs',
    category: 'Add-on Package',
    price: 25.0,
    formsCount: 0,
    purchased: 40,
    remaining: null,
    updatedAt: 'Updated Jul 15, 2026',
    status: 'inactive',
  },
]
