import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import StatusPage from './pages/StatusPage';
import StaffPortal from './pages/StaffPortal';
import LiveQueue from './pages/LiveQueue';
import LeaveManagement from './pages/LeaveManagement';
import { Heart } from 'lucide-react';

function App() {
  const location = useLocation();
  const isStaff = location.pathname.startsWith('/staff');

  return (
    <div className="app-shell">
      <nav className="glass" style={{ margin: '20px', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', position: 'sticky', top: '20px', zIndex: 100 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '700', fontSize: '1.2rem' }} className="h-font">
          <Heart size={24} color="var(--accent-primary)" fill="var(--accent-primary)" />
          QuickOPD
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ color: !isStaff ? 'white' : 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '600', transition: 'color 0.3s' }}>Patient Portal</Link>
          <Link to="/staff" style={{ color: isStaff ? 'white' : 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '600', transition: 'color 0.3s' }}>Staff Portal</Link>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/status/:tokenNumber" element={<StatusPage />} />
          <Route path="/staff" element={<StaffPortal />} />
          <Route path="/staff/queue/:sessionId" element={<LiveQueue />} />
          <Route path="/staff/leave" element={<LeaveManagement />} />
          <Route path="*" element={<div className="container flex-center" style={{ padding: '100px', color: 'var(--text-dim)' }}>404 | Page Not Found</div>} />
        </Routes>
      </main>

      <footer style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <p>&copy; 2026 QuickOPD • Built for Hackathon MVP</p>
        <p style={{ marginTop: '8px', opacity: 0.5 }}>Trust the backend. Feel the gravity.</p>
      </footer>
    </div>
  );
}

export default App;
