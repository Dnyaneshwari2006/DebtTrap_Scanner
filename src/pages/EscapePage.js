import React, { useState, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './EscapePage.css';
import './Page.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

function calcEMI(P, r, n) {
  if (!r) return P / n;
  const m = r / 12 / 100;
  return (P * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1);
}

function getMonthLabel(offset) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}

function simulatePayoff(principal, annualRate, emi, extraMonthly, lumpSum) {
  let balance = principal - lumpSum;
  if (balance <= 0) return { months: 0, totalInterest: 0, labels: [], data: [] };
  const r = annualRate / 12 / 100;
  let months = 0;
  let totalInterest = 0;
  const labels = [getMonthLabel(0)];
  const data = [Math.round(balance)];

  while (balance > 0 && months < 600) {
    const interest = balance * r;
    totalInterest += interest;
    const payment = Math.min(emi + extraMonthly, balance + interest);
    balance = balance + interest - payment;
    months++;
    if (months % 3 === 0 || balance <= 0) {
      labels.push(getMonthLabel(months));
      data.push(Math.max(0, Math.round(balance)));
    }
  }
  return { months, totalInterest: Math.round(totalInterest), labels, data };
}

export default function EscapePage() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [extraEMI, setExtraEMI] = useState(0);
  const [lumpSum, setLumpSum] = useState(0);
  const [result, setResult] = useState(null);

  const analyze = useCallback(() => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) || 0;
    const n = parseInt(tenure);
    if (!P || !n) { alert('Enter loan amount and tenure.'); return; }

    const emi = calcEMI(P, r, n);
    const original = simulatePayoff(P, r, emi, 0, 0);
    const optimized = simulatePayoff(P, r, emi, extraEMI, lumpSum);

    const monthsSaved = original.months - optimized.months;
    const interestSaved = original.totalInterest - optimized.totalInterest;

    setResult({
      emi: Math.round(emi),
      original, optimized,
      monthsSaved, interestSaved,
      P, r, n,
    });
  }, [principal, rate, tenure, extraEMI, lumpSum]);

  const chartData = result ? {
    labels: result.original.labels,
    datasets: [
      {
        label: 'Original',
        data: result.original.data,
        borderColor: '#f87171',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: 'rgba(248,113,113,0.08)',
        tension: 0.3,
      },
      {
        label: 'With prepayment',
        data: (() => {
          const optimizedMap = {};
          result.optimized.labels.forEach((l, i) => { optimizedMap[l] = result.optimized.data[i]; });
          return result.original.labels.map(l => optimizedMap[l] ?? null);
        })(),
        borderColor: '#34d399',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        backgroundColor: 'rgba(52,211,153,0.1)',
        tension: 0.3,
        spanGaps: true,
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
        callbacks: { label: c => ` ₹${Math.round(c.raw || 0).toLocaleString()} remaining` },
      },
    },
    scales: {
      x: { ticks: { color: '#6d68a8', font: { size: 10 }, maxTicksLimit: 10 }, grid: { color: 'rgba(61,56,117,0.4)' } },
      y: { ticks: { color: '#6d68a8', font: { size: 10 }, callback: v => '₹' + (v / 1000).toFixed(0) + 'k' }, grid: { color: 'rgba(61,56,117,0.4)' } },
    },
  };

  return (
    <div className="page-full escape-page">
      <div className="page-title">Escape Plan</div>
      <div className="page-subtitle">Simulate prepayment — see exactly how much faster you can escape</div>

      <div className="escape-layout">
        <div className="escape-left">
          <div className="escape-section-label">Your current loan</div>
          <div className="field">
            <label>Outstanding balance (₹)</label>
            <input type="number" placeholder="e.g. 400000" value={principal}
              onChange={e => setPrincipal(e.target.value)} />
          </div>
          <div className="field">
            <label>Interest rate (% p.a.)</label>
            <input type="number" placeholder="e.g. 14" value={rate}
              onChange={e => setRate(e.target.value)} />
          </div>
          <div className="field">
            <label>Remaining tenure (months)</label>
            <input type="number" placeholder="e.g. 36" value={tenure}
              onChange={e => setTenure(e.target.value)} />
          </div>

          <div className="escape-section-label" style={{ marginTop: '1.5rem' }}>Prepayment options</div>

          <div className="slider-field">
            <div className="slider-top">
              <label>Extra monthly payment (₹)</label>
              <span className="slider-val">₹{extraEMI.toLocaleString()}</span>
            </div>
            <input type="range" min="0" max="50000" step="500" value={extraEMI}
              onChange={e => setExtraEMI(parseInt(e.target.value))}
              className="escape-slider purple-slider" />
            <div className="slider-hints"><span>₹0</span><span>₹50,000</span></div>
          </div>

          <div className="slider-field">
            <div className="slider-top">
              <label>One-time lump sum (₹)</label>
              <span className="slider-val">₹{lumpSum.toLocaleString()}</span>
            </div>
            <input type="range" min="0" max="500000" step="5000" value={lumpSum}
              onChange={e => setLumpSum(parseInt(e.target.value))}
              className="escape-slider pink-slider" />
            <div className="slider-hints"><span>₹0</span><span>₹5,00,000</span></div>
          </div>

          <button className="scan-btn escape-btn" onClick={analyze}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            Calculate escape plan
          </button>
        </div>

        <div className="escape-right">
          {!result ? (
            <div className="escape-empty">
              <div className="escape-empty-icon">📈</div>
              <div className="escape-empty-text">Enter your loan details<br />and adjust the sliders<br />to see your escape plan</div>
            </div>
          ) : (
            <>
              <div className="escape-metrics">
                <div className="escape-metric green">
                  <div className="escape-metric-label">Months saved</div>
                  <div className="escape-metric-value">{result.monthsSaved}</div>
                  <div className="escape-metric-sub">
                    {result.optimized.months}mo vs {result.original.months}mo original
                  </div>
                </div>
                <div className="escape-metric teal">
                  <div className="escape-metric-label">Interest saved</div>
                  <div className="escape-metric-value">₹{result.interestSaved.toLocaleString()}</div>
                  <div className="escape-metric-sub">total savings on this loan</div>
                </div>
                <div className="escape-metric purple">
                  <div className="escape-metric-label">Debt-free by</div>
                  <div className="escape-metric-value">{getMonthLabel(result.optimized.months)}</div>
                  <div className="escape-metric-sub">originally {getMonthLabel(result.original.months)}</div>
                </div>
                <div className="escape-metric neutral">
                  <div className="escape-metric-label">Monthly EMI</div>
                  <div className="escape-metric-value">₹{(result.emi + extraEMI).toLocaleString()}</div>
                  <div className="escape-metric-sub">base ₹{result.emi.toLocaleString()} + extra ₹{extraEMI.toLocaleString()}</div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-label-row">
                  <div className="chart-label">Outstanding balance over time</div>
                  <div className="chart-legend">
                    <span><span className="dot red" /> Original path</span>
                    <span><span className="dot green" /> With prepayment</span>
                  </div>
                </div>
                <div style={{ height: 240 }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {result.monthsSaved > 0 && (
                <div className="escape-tip">
                  <div className="escape-tip-icon">💡</div>
                  <div className="escape-tip-text">
                    By paying ₹{(extraEMI + lumpSum).toLocaleString()} extra, you'll be debt-free <strong>{result.monthsSaved} months earlier</strong> and save <strong>₹{result.interestSaved.toLocaleString()}</strong> in interest. That's money back in your pocket.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
