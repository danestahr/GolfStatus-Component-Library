// Mock product catalog — mirrors the Supabase `products` table.
// When you're ready to connect real data, replace these imports
// with a useProducts() hook and the components won't need to change.

export const products = [
  { id: 'tech',   name: 'Technology Sponsorship', basePrice: 899.00 },
  { id: 'flags',  name: 'Flags',                  basePrice: 899.00 },
  { id: 'hio',    name: 'Hole In One Insurance',  basePrice: 199.00 },
  { id: 'signs',  name: 'Hole Signs',             basePrice: 25.00  },
]

// Auto-add rules — mirrors the `product_auto_adds` table.
export const productAutoAdds = {
  tech: [{ name: 'Invoicing & Discounts', price: 0 }],
}
