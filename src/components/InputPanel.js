import React, { useState } from 'react';
import './InputPanel.css';

function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>;
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export default function InputPanel({
  income, setIncome, expenses, setExpenses,
  loans, addLoan, removeLoan,
  newAmount, setNewAmount, newRate, setNewRate, newTenure, setNewTenure,
  onCalculate,
}) {
  const [addEmi, setAddEmi] = useState('');
  const [addMonths, setAddMonths] = useState('');

  const handleAddLoan = () => {
    const ok = addLoan(addEmi, addMonths);
    if (ok) { setAddEmi(''); setAddMonths(''); }
  };

  return (
    <div className="input-panel">
      <div className="section">
        <SectionLabel>Your income</SectionLabel>
        <Field label="Monthly income (₹)">
          <input type="number" placeholder="e.g. 45000" value={income} onChange={e => setIncome(e.target.value)} />
        </Field>
        <Field label="Monthly expenses (₹)">
          <input type="number" placeholder="e.g. 20000" value={expenses} onChange={e => setExpenses(e.target.value)} />
        </Field>
      </div>

      <div className="section">
        <SectionLabel>Existing loans</SectionLabel>
        <div className="loan-tags">
          {loans.map((l, i) => (
            <span key={i} className="loan-tag">
              ₹{l.emi.toLocaleString()}/mo · {l.months}mo
              <span className="loan-tag-rm" onClick={() => removeLoan(i)}>✕</span>
            </span>
          ))}
        </div>
        <div className="mini-grid">
          <input className="mini-input" type="number" placeholder="EMI amount (₹)" value={addEmi} onChange={e => setAddEmi(e.target.value)} />
          <input className="mini-input" type="number" placeholder="Months left" value={addMonths} onChange={e => setAddMonths(e.target.value)} />
        </div>
        <button className="add-btn" onClick={handleAddLoan}>+ Add existing loan</button>
      </div>

      <div className="section">
        <SectionLabel>New loan you're considering</SectionLabel>
        <Field label="Loan amount (₹)">
          <input type="number" placeholder="e.g. 200000" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
        </Field>
        <div className="grid2">
          <Field label="Interest rate (% p.a.)">
            <input type="number" placeholder="e.g. 14" value={newRate} onChange={e => setNewRate(e.target.value)} />
          </Field>
          <Field label="Tenure (months)">
            <input type="number" placeholder="e.g. 24" value={newTenure} onChange={e => setNewTenure(e.target.value)} />
          </Field>
        </div>
      </div>

      <button className="scan-btn" onClick={onCalculate}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        Scan my debt trap
      </button>
    </div>
  );
}