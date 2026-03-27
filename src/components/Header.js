import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-dot" />
        <span className="header-logo">DebtTrap Scanner</span>
      </div>
      <span className="header-tagline">Know before you borrow</span>
    </header>
  );
}
