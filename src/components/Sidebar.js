import React from 'react';
import './Sidebar.css';

const nav = [
  {
    id: 'scanner', label: 'Debt Scanner', sub: 'Analyze your loan',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  },
  {
    id: 'compare', label: 'Loan Compare', sub: 'Bank A vs Bank B',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
  },
  {
    id: 'escape', label: 'Escape Plan', sub: 'Prepayment sim',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  },
  {
    id: 'credit', label: 'Credit Score', sub: 'Impact simulator',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>,
  },
  {
    id: 'ai', label: 'AI Advisor', sub: 'Claude-powered',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💡</div>
        <div>
          <div className="sidebar-logo-name">DebtTrap</div>
          <div className="sidebar-logo-sub">Scanner</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map((item, idx) => (
          <button
            key={item.id}
            className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
            style={{ animationDelay: `${idx * 0.07}s` }}
          >
            {activePage === item.id && <div className="sidebar-active-bar" />}
            <div className="sidebar-icon">{item.icon}</div>
            <div className="sidebar-text">
              <div className="sidebar-label">{item.label}</div>
              <div className="sidebar-sublabel">{item.sub}</div>
            </div>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">know before you borrow</div>
      </div>
    </div>
  );
}