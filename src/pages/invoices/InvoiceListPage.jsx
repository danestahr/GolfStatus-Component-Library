import { Link } from 'react-router-dom'
import { invoices } from '../../data/mockInvoices.js'

// ─── Drop your invoice list components in here as you build them ───

export default function InvoiceListPage() {
  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Invoices</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {invoices.map(inv => (
          <Link key={inv.id} to={`/invoices/${inv.id}`} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', background: '#fff', borderRadius: 8,
            border: '1px solid #e8e8e8', textDecoration: 'none', color: 'inherit',
          }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.2 }}>{inv.id}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{inv.createdAt}</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              background: inv.status === 'draft' ? '#f0f0f0' : inv.status === 'sent' ? '#e0f0ff' : '#e0fae0',
              color: inv.status === 'draft' ? '#666' : inv.status === 'sent' ? '#1a6fb5' : '#187a18',
            }}>
              {inv.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
