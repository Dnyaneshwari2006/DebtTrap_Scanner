import React, { useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './ComparePage.css';
import './Page.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function calcEMI(P, r, n) {
  if (!r) return P / n;
  const m = r / 12 / 100;
  return (P * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1);
}

function LoanInput({ label, color, data, onChange }) {
  return (
    <div className="loan-input-card" style={{ borderTopColor: color }}>
      <div className="loan-input-header" style={{ color }}>{label}</div>
      <div className="field">
        <label>Loan amount (₹)</label>
        <input type="number" placeholder="e.g. 300000" value={data.amount}
          onChange={e => onChange('amount', e.target.value)} />
      </div>
      <div className="field">
        <label>Interest rate (% p.a.)</label>
        <input type="number" placeholder="e.g. 12" value={data.rate}
          onChange={e => onChange('rate', e.target.value)} />
      </div>
      <div className="field">
        <label>Tenure (months)</label>
        <input type="number" placeholder="e.g. 24" value={data.tenure}
          onChange={e => onChange('tenure', e.target.value)} />
      </div>
      <div className="field">
        <label>Lender name (optional)</label>
        <input type="text" placeholder="e.g. HDFC Bank" value={data.name}
          onChange={e => onChange('name', e.target.value)} />
      </div>
    </div>
  );
}

function MetricRow({ label, valA, valB, winner, format }) {
  const fmt = v => format === 'currency' ? `₹${Math.round(v).toLocaleString()}` : format === 'percent' ? `${v.toFixed(2)}%` : v;
  return (
    <div className="metric-row">
      <div className="metric-row-label">{label}</div>
      <div className={`metric-row-val ${winner === 'A' ? 'win' : ''}`}>
        {fmt(valA)} {winner === 'A' && <span className="win-badge">✓ Better</span>}
      </div>
      <div className={`metric-row-val ${winner === 'B' ? 'win' : ''}`}>
        {fmt(valB)} {winner === 'B' && <span className="win-badge">✓ Better</span>}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [loanA, setLoanA] = useState({ amount: '', rate: '', tenure: '', name: 'Loan A' });
  const [loanB, setLoanB] = useState({ amount: '', rate: '', tenure: '', name: 'Loan B' });
  const [result, setResult] = useState(null);

  const updateA = (k, v) => setLoanA(p => ({ ...p, [k]: v }));
  const updateB = (k, v) => setLoanB(p => ({ ...p, [k]: v }));

  const compare = () => {
    const aAmt = parseFloat(loanA.amount), aRate = parseFloat(loanA.rate) || 0, aTenure = parseInt(loanA.tenure);
    const bAmt = parseFloat(loanB.amount), bRate = parseFloat(loanB.rate) || 0, bTenure = parseInt(loanB.tenure);
    if (!aAmt || !aTenure || !bAmt || !bTenure) { alert('Fill both loans fully.'); return; }

    const aEMI = calcEMI(aAmt, aRate, aTenure);
    const bEMI = calcEMI(bAmt, bRate, bTenure);
    const aTotal = aEMI * aTenure;
    const bTotal = bEMI * bTenure;
    const aInterest = aTotal - aAmt;
    const bInterest = bTotal - bAmt;
    const aEffRate = (aInterest / aAmt) * 100;
    const bEffRate = (bInterest / bAmt) * 100;

    const winner = aInterest <= bInterest ? 'A' : 'B';
    const saved = Math.abs(aInterest - bInterest);

    setResult({
      aEMI: Math.round(aEMI), bEMI: Math.round(bEMI),
      aTotal: Math.round(aTotal), bTotal: Math.round(bTotal),
      aInterest: Math.round(aInterest), bInterest: Math.round(bInterest),
      aEffRate, bEffRate,
      winner, saved: Math.round(saved),
      nameA: loanA.name || 'Loan A',
      nameB: loanB.name || 'Loan B',
    });
  };

  const chartData = result ? {
    labels: ['Monthly EMI', 'Total Payment', 'Total Interest'],
    datasets: [
      {
        label: result.nameA,
        data: [result.aEMI, result.aTotal, result.aInterest],
        backgroundColor: 'rgba(124,111,247,0.7)',
        borderRadius: 6,
      },
      {
        label: result.nameB,
        data: [result.bEMI, result.bTotal, result.bInterest],
        backgroundColor: 'rgba(244,114,182,0.7)',
        borderRadius: 6,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#2a2650',
        titleColor: '#a9a4d4',
        bodyColor: '#e8e6ff',
        borderColor: '#3d3875',
        borderWidth: 1,
        callbacks: { label: c => ` ₹${Math.round(c.raw).toLocaleString()}` },
      },
    },
    scales: {
      x: { ticks: { color: '#6d68a8', font: { size: 11 } }, grid: { color: 'rgba(61,56,117,0.4)' } },
      y: { ticks: { color: '#6d68a8', font: { size: 11 }, callback: v => '₹' + (v / 1000).toFixed(0) + 'k' }, grid: { color: 'rgba(61,56,117,0.4)' } },
    },
  };

  return (
    <div className="page-full compare-page">
      <div className="page-title">Loan Comparison</div>
      <div className="page-subtitle">Side-by-side — find which loan costs you less</div>

      <div className="compare-inputs">
        <LoanInput label="Loan A" color="#7c6ff7" data={loanA} onChange={updateA} />
        <div className="vs-badge">VS</div>
        <LoanInput label="Loan B" color="#f472b6" data={loanB} onChange={updateB} />
      </div>

      <button className="scan-btn compare-btn" onClick={compare}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
        </svg>
        Compare loans
      </button>

      {result && (
        <div className="compare-results">
          <div className={`winner-banner ${result.winner === 'A' ? 'purple' : 'pink'}`}>
            <div className="winner-label">🏆 Better deal</div>
            <div className="winner-name">{result.winner === 'A' ? result.nameA : result.nameB}</div>
            <div className="winner-sub">saves you ₹{result.saved.toLocaleString()} in interest</div>
          </div>

          <div className="compare-table">
            <div className="metric-row header">
              <div className="metric-row-label"></div>
              <div className="metric-row-val header-val" style={{ color: '#7c6ff7' }}>{result.nameA}</div>
              <div className="metric-row-val header-val" style={{ color: '#f472b6' }}>{result.nameB}</div>
            </div>
            <MetricRow label="Monthly EMI" valA={result.aEMI} valB={result.bEMI}
              winner={result.aEMI <= result.bEMI ? 'A' : 'B'} format="currency" />
            <MetricRow label="Total payment" valA={result.aTotal} valB={result.bTotal}
              winner={result.aTotal <= result.bTotal ? 'A' : 'B'} format="currency" />
            <MetricRow label="Total interest" valA={result.aInterest} valB={result.bInterest}
              winner={result.aInterest <= result.bInterest ? 'A' : 'B'} format="currency" />
            <MetricRow label="Effective rate" valA={result.aEffRate} valB={result.bEffRate}
              winner={result.aEffRate <= result.bEffRate ? 'A' : 'B'} format="percent" />
          </div>

          <div className="chart-card">
            <div className="chart-label-row">
              <div className="chart-label">Visual comparison</div>
              <div className="chart-legend">
                <span><span className="dot purple" />  {result.nameA}</span>
                <span><span className="dot pink" /> {result.nameB}</span>
              </div>
            </div>
            <div style={{ height: 240 }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
