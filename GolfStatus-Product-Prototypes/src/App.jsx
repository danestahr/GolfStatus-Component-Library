import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
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

        {/* Main content */}
        <main style={{ flex: 1, background: '#f7f7f7', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Placeholder title="Invoices" />} />
            <Route path="/invoices" element={<Placeholder title="Invoices" />} />
            <Route path="/tournaments" element={<Placeholder title="Tournaments" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
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

function Placeholder({ title }) {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{title}</h1>
      <div style={{ padding: 24, background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8', color: '#aaa', fontSize: 13 }}>
        Components go here
      </div>
    </div>
  )
}