import { useParams } from 'react-router-dom'
import { invoices } from '../../data/mockInvoices.js'

// ─── Drop InvoiceProducts and LineItemsList in here ───
// import InvoiceProducts from '../../components/invoice/InvoiceProducts.jsx'
// import LineItemsList from '../../components/invoice/LineItemsList.jsx'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const invoice = invoices.find(inv => inv.id === id)

  if (!invoice) return <div style={{ padding: 32 }}>Invoice not found.</div>

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Invoice</div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>{invoice.id}</h1>
      </div>

      {/* Swap this placeholder out for <InvoiceProducts /> once imported */}
      <div style={{ padding: 24, background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8', color: '#aaa', fontSize: 13 }}>
        ← InvoiceProducts component goes here
      </div>
    </div>
  )
}
