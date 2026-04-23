import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'

// Pages
import InvoiceListPage from './pages/invoices/InvoiceListPage.jsx'
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage.jsx'
import TournamentsPage from './pages/tournaments/TournamentsPage.jsx'
import SettingsPage from './pages/settings/SettingsPage.jsx'

// To add a new prototype page:
// 1. Create the file in src/pages/
// 2. Import it here
// 3. Add a <Route> and optionally a <NavLink> in the nav

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

        {/* Sidebar nav */}
        <nav style={{
          width: 220, background: '#111', padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 20, letterSpacing: '0.05em' }}>
            GOLFSTATUS
          </div>
          <NavItem to="/invoices" label="Invoices" />
          <NavItem to="/tournaments" label="Tournaments" />
          <NavItem to="/settings" label="Settings" />
        </nav>

        {/* Page content */}
        <main style={{ flex: 1, background: '#f7f7f7', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<InvoiceListPage />} />
            <Route path="/invoices" element={<InvoiceListPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

function NavItem({ to, label }) {
  return (
    <NavLink to={to} style={({ isActive }) => ({
      display: 'block', padding: '8px 12px', borderRadius: 6,
      fontSize: 14, fontWeight: 500, textDecoration: 'none',
      background: isActive ? '#ffffff18' : 'transparent',
      color: isActive ? '#fff' : '#ffffff99',
    })}>
      {label}
    </NavLink>
  )
}
