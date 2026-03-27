import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ScannerPage from './pages/ScannerPage';
import ComparePage from './pages/ComparePage';
import EscapePage from './pages/EscapePage';
import CreditPage from './pages/CreditPage';
import AIAdvisorPage from './pages/AIAdvisorPage';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState('scanner');

  return (
    <div className="app">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="app-content">
        {activePage === 'scanner' && <ScannerPage />}
        {activePage === 'compare' && <ComparePage />}
        {activePage === 'escape' && <EscapePage />}
        {activePage === 'credit' && <CreditPage />}
        {activePage === 'ai' && <AIAdvisorPage />}
      </div>
    </div>
  );
}
