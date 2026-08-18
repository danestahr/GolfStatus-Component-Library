import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'

// Pages
import InvoiceListPage from './pages/invoices/InvoiceListPage.jsx'
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage.jsx'
import TournamentsPage from './pages/tournaments/TournamentsPage.jsx'
import SettingsPage from './pages/settings/SettingsPage.jsx'
import ScorecardListPage from './pages/scorecards/ScorecardListPage.jsx'
import ScorecardDetailPage from './pages/scorecards/ScorecardDetailPage.jsx'
import ComparisonPage from './pages/compare/ComparisonPage.jsx'
import InfiniteListPage from './pages/infinite-list/InfiniteListPage.jsx'
import ExclusionPage from './pages/exclusion/ExclusionPage.jsx'
import ExclusionPageV2 from './pages/exclusion/ExclusionPageV2.jsx'
import TournamentSchedulerListPage from './pages/scheduler/TournamentSchedulerListPage.jsx'
import TournamentSchedulerPage from './pages/scheduler/TournamentSchedulerPage.jsx'
import MessageDraftPage from './pages/messaging/MessageDraftPage.jsx'
import OrdersHubPage from './pages/orders/OrdersHubPage.jsx'
import OrderListPage from './pages/orders/OrderListPage.jsx'
import OrdersDraft1Page from './pages/orders/OrdersDraft1Page.jsx'
import OrdersDraft2Page from './pages/orders/OrdersDraft2Page.jsx'

// To add a new prototype page:
// 1. Create the file in src/pages/
// 2. Import it here
// 3. Add a <Route> and optionally a <NavLink> in the nav

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh' }}>

        {/* Sidebar nav */}
        <nav style={{
          width: 220, background: '#111', padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 20, letterSpacing: '0.05em' }}>
            GOLFSTATUS
          </div>
          <NavItem to="/invoices" label="Invoices" />
          <NavItem to="/scorecards" label="Scorecards" />
          <NavItem to="/tournaments" label="Tournaments" />
          <NavItem to="/settings" label="Settings" />
          <NavItem to="/compare" label="Compare" />
          <NavItem to="/infinite-list" label="Infinite List" />
          <NavItem to="/exclusion" label="Exclusion V1" />
          <NavItem to="/exclusion-v2" label="Exclusion V2" />
          <NavItem to="/scheduler" label="Hole Assignments" />
          <NavItem to="/messaging" label="Message Draft" />
          <NavItem to="/orders" label="Orders & Payouts" />
        </nav>

        {/* Page content */}
        <main style={{ flex: 1, background: '#f7f7f7', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<InvoiceListPage />} />
            <Route path="/invoices" element={<InvoiceListPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/scorecards" element={<ScorecardListPage />} />
            <Route path="/scorecards/:id" element={<ScorecardDetailPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/infinite-list" element={<InfiniteListPage />} />
            <Route path="/exclusion" element={<ExclusionPage />} />
            <Route path="/exclusion-v2" element={<ExclusionPageV2 />} />
            <Route path="/scheduler" element={<TournamentSchedulerListPage />} />
            <Route path="/scheduler/:tournamentId" element={<TournamentSchedulerPage />} />
            <Route path="/messaging" element={<MessageDraftPage />} />
            <Route path="/orders" element={<OrdersHubPage />} />
            <Route path="/orders/original" element={<OrderListPage />} />
            <Route path="/orders/original/:id" element={<OrderListPage />} />
            <Route path="/orders-draft-1" element={<OrdersDraft1Page />} />
            <Route path="/orders-draft-1/:id" element={<OrdersDraft1Page />} />
            <Route path="/orders-draft-1/:id/responses" element={<OrdersDraft1Page />} />
            <Route path="/orders-draft-2" element={<OrdersDraft2Page />} />
            <Route path="/orders-draft-2/:id" element={<OrdersDraft2Page />} />
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
