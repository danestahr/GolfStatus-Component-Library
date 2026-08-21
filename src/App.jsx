import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'

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
import OrdersDraft1Page from './pages/orders/OrdersDraft1Page.jsx'
import OrdersFormsHubPage from './pages/orders-forms/OrdersFormsHubPage.jsx'
import SponsorsListPage from './pages/orders-forms/SponsorsListPage.jsx'
import TeamsListPage from './pages/orders-forms/TeamsListPage.jsx'
import EventSitePackagesListPage from './pages/orders-forms/EventSitePackagesListPage.jsx'

// To add a new prototype page:
// 1. Create the file in src/pages/
// 2. Import it here
// 3. Add a <Route> and optionally a <NavLink> in the nav

// The page content lives in `main`, not the window, so the browser's own
// scroll restoration doesn't apply — without this, navigating from a
// scrolled-down page to a new one leaves the new page's content scrolled
// too, since `main` itself never unmounts across route changes.
function ScrollToTop({ containerRef }) {
  const { pathname } = useLocation()
  useEffect(() => {
    containerRef.current?.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const mainRef = useRef(null)

  return (
    <BrowserRouter>
      <ScrollToTop containerRef={mainRef} />
      <div style={{ display: 'flex', height: '100vh' }}>

        {/* Sidebar nav */}
        <nav style={{
          width: 300, background: '#111', padding: '24px 16px',
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
          <NavItem to="/orders-forms" label="Edit Form Responses" />
        </nav>

        {/* Page content */}
        <main ref={mainRef} style={{ flex: 1, background: '#f7f7f7', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
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
            <Route path="/orders-forms" element={<OrdersFormsHubPage />} />
            <Route path="/orders-forms/sponsors" element={<SponsorsListPage />} />
            <Route path="/orders-forms/teams" element={<TeamsListPage />} />
            <Route path="/orders-forms/event-site-packages" element={<EventSitePackagesListPage />} />
            <Route path="/orders-draft-1" element={<OrdersDraft1Page />} />
            <Route path="/orders-draft-1/:id" element={<OrdersDraft1Page />} />
            <Route path="/orders-draft-1/:id/responses" element={<OrdersDraft1Page />} />
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
      fontSize: 14, lineHeight: 1.2, fontWeight: 500, textDecoration: 'none',
      background: isActive ? '#ffffff18' : 'transparent',
      color: isActive ? '#fff' : '#ffffff99',
    })}>
      {label}
    </NavLink>
  )
}
