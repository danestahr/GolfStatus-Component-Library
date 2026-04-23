# GolfStatus Prototypes

A single Vite + React project for building and sharing GolfStatus prototype screens.

---

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Adding your existing components

Drop component files into the right folder:

| What it is | Where it goes |
|---|---|
| Generic UI (Button, Input, Toggle) | `src/components/ui/` |
| Invoice-specific components | `src/components/invoice/` |
| Any new feature components | `src/components/<feature>/` |

Then import them into the relevant page:
```jsx
import InvoiceProducts from '../../components/invoice/InvoiceProducts.jsx'
```

---

## Adding a new prototype page

1. Create a file in `src/pages/<section>/YourPage.jsx`
2. Open `src/App.jsx`
3. Import the page and add a `<Route>` and `<NavLink>`

---

## File structure

```
src/
├── components/
│   ├── ui/           ← Generic, reusable primitives (Button, Input, etc.)
│   └── invoice/      ← Invoice-specific components (drop yours in here)
│
├── pages/
│   ├── invoices/     ← InvoiceListPage, InvoiceDetailPage
│   ├── tournaments/  ← TournamentsPage
│   └── settings/     ← SettingsPage
│
├── data/
│   ├── mockProducts.js   ← Fake product catalog
│   └── mockInvoices.js   ← Fake invoice data
│
└── styles/
    └── global.css
```

---

## Connecting real data later

When you're ready to pull from Supabase:
1. `npm install @supabase/supabase-js`
2. Create `src/lib/supabaseClient.js`
3. Replace mock data imports with hook calls

The components themselves won't need to change.
