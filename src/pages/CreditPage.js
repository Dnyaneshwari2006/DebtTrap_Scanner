import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, RadialLinearScale } from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import './CreditPage.css';
import './Page.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, RadialLinearScale);

function calcEMI(P, r, n) {
  if (!r) return P / n;
  const m = r / 12 / 100;
  return (P * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1);
}

function getScoreLabel(score) {
  if (score >= 750) return { label: 'Excellent', color: '#34d399' };
  if (score >= 700) return { label: 'Good', color: '#7c6ff7' };
  if (score >= 650) return { label: 'Fair', color: '#fbbf24' };
  if (score >= 600) return { label: 'Poor', color: '#f97316' };
  return { label: 'Very Poor', color: '#f87171' };
}

function ScoreGauge({ score }) {
  const pct = ((score - 300) / 600) * 100;
  const { label, color } = getScoreLabel(score);
  const circumference = 2 * Math.PI * 54;
  const dash = (pct / 100) * circumference;
  return (
    <div className="gauge-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          transform="rotate(-90 70 70)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="gauge-inner">
        <div className="gauge-score" style={{ color }}>{score}</div>
        <div className="gauge-label" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

export default function CreditPage() {
  const [currentScore, setCurrentScore] = useState(700);
  const [income, setIncome] = useState('');
  const [existingEMI, setExistingEMI] = useState('');
  const [newLoanAmt, setNewLoanAmt] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newTenure, setNewTenure] = useState('');
  const [missedPayments, setMissedPayments] = useState(0);
  const [result, setResult] = useState(null);

  const simulate = () => {
    const inc = parseFloat(income) || 0;
    const existEMI = parseFloat(existingEMI) || 0;
    const amt = parseFloat(newLoanAmt) || 0;
    const rate = parseFloat(newRate) || 0;
    const tenure = parseInt(newTenure) || 0;
    if (!inc || !amt || !tenure) { alert('Fill in income, loan amount and tenure.'); return; }

    const newEMI = calcEMI(amt, rate, tenure);
    const totalEMI = existEMI + newEMI;
    const dti = (totalEMI / inc) * 100;

    let projected = currentScore;
    const factors = [];

    // Hard inquiry hit
    projected -= 8;
    factors.push({ label: 'Hard inquiry', impact: -8, desc: 'Every new loan application triggers a hard pull' });

    // New account age hit
    projected -= 10;
    factors.push({ label: 'New account', impact: -10, desc: 'New accounts lower average credit age' });

    // DTI impact
    if (dti > 50) { projected -= 40; factors.push({ label: 'High DTI (>50%)', impact: -40, desc: 'Debt-to-income over 50% severely hurts score' }); }
    else if (dti > 35) { projected -= 20; factors.push({ label: 'Elevated DTI (>35%)', impact: -20, desc: 'DTI above safe limit signals stress to lenders' }); }
    else { projected += 5; factors.push({ label: 'Healthy DTI', impact: +5, desc: 'Your debt-to-income is within safe range' }); }

    // Credit mix
    projected += 8;
    factors.push({ label: 'Credit mix', impact: +8, desc: 'Adding an instalment loan diversifies credit mix' });

    // Missed payments
    if (missedPayments > 0) {
      const hit = missedPayments * 45;
      projected -= hit;
      factors.push({ label: `${missedPayments} missed payment(s)`, impact: -hit, desc: 'Missed payments are the single biggest score killer' });
    }

    // On-time payment recovery (12 months)
    const recovery12 = Math.min(35, Math.max(0, missedPayments === 0 ? 25 : 10));
    const projectedAfter12 = Math.min(850, Math.max(300, projected + recovery12));
    const projectedAfter24 = Math.min(850, Math.max(300, projectedAfter12 + (missedPayments === 0 ? 20 : 15)));

    projected = Math.min(850, Math.max(300, projected));

    // Timeline data
    const timelineLabels = ['Now', 'Month 1', 'Month 3', 'Month 6', 'Month 12', 'Month 24'];
    const timelineData = [
      currentScore,
      projected,
      Math.round(projected + (projectedAfter12 - projected) * 0.2),
      Math.round(projected + (projectedAfter12 - projected) * 0.5),
      projectedAfter12,
      projectedAfter24,
    ];

    setResult({ projected, projectedAfter12, projectedAfter24, factors, dti, newEMI: Math.round(newEMI), timelineLabels, timelineData });
  };

  const chartData = result ? {
    labels: result.timelineLabels,
    datasets: [
      {
        label: 'Score',
        data: result.timelineData,
        borderColor: '#7c6ff7',
        borderWidth: 2.5,
        pointBackgroundColor: result.timelineData.map(v => getScoreLabel(v).color),
        pointRadius: 5,
        fill: true,
        backgroundColor: 'rgba(124,111,247,0.1)',
        tension: 0.4,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: '#2a2650', titleColor: '#a9a4d4', bodyColor: '#e8e6ff',
      borderColor: '#3d3875', borderWidth: 1,
      callbacks: { label: c => ` Score: ${Math.round(c.raw)}` },
    }},
    scales: {
      x: { ticks: { color: '#6d68a8', font: { size: 11 } }, grid: { color: 'rgba(61,56,117,0.4)' } },
      y: { min: 300, max: 850, ticks: { color: '#6d68a8', font: { size: 11 } }, grid: { color: 'rgba(61,56,117,0.4)' } },
    },
  };

  return (
    <div className="page-full credit-page">
      <div className="page-title">Credit Score Simulator</div>
      <div className="page-subtitle">See how this loan impacts your CIBIL score before you apply</div>

      <div className="credit-layout">
        <div className="credit-left">
          <div className="score-section">
            <div className="escape-section-label">Your current score</div>
            <div className="slider-field">
              <div className="slider-top">
                <label>CIBIL / Credit Score</label>
                <span className="slider-val" style={{ color: getScoreLabel(currentScore).color }}>{currentScore}</span>
              </div>
              <input type="range" min="300" max="850" step="5" value={currentScore}
                onChange={e => setCurrentScore(parseInt(e.target.value))}
                className="escape-slider purple-slider" />
              <div className="slider-hints"><span>300 (Poor)</span><span>850 (Excellent)</span></div>
            </div>
          </div>

          <div className="escape-section-label" style={{ marginTop: '1.25rem' }}>Your finances</div>
          <div className="field"><label>Monthly income (₹)</label>
            <input type="number" placeholder="e.g. 55000" value={income} onChange={e => setIncome(e.target.value)} /></div>
          <div className="field"><label>Existing EMI obligations (₹)</label>
            <input type="number" placeholder="e.g. 8000" value={existingEMI} onChange={e => setExistingEMI(e.target.value)} /></div>

          <div className="escape-section-label" style={{ marginTop: '1.25rem' }}>New loan details</div>
          <div className="field"><label>Loan amount (₹)</label>
            <input type="number" placeholder="e.g. 200000" value={newLoanAmt} onChange={e => setNewLoanAmt(e.target.value)} /></div>
          <div className="credit-grid2">
            <div className="field"><label>Interest rate (%)</label>
              <input type="number" placeholder="e.g. 14" value={newRate} onChange={e => setNewRate(e.target.value)} /></div>
            <div className="field"><label>Tenure (months)</label>
              <input type="number" placeholder="e.g. 24" value={newTenure} onChange={e => setNewTenure(e.target.value)} /></div>
          </div>

          <div className="escape-section-label" style={{ marginTop: '1.25rem' }}>Payment history</div>
          <div className="slider-field">
            <div className="slider-top">
              <label>Expected missed payments</label>
              <span className="slider-val" style={{ color: missedPayments > 0 ? '#f87171' : '#34d399' }}>{missedPayments}</span>
            </div>
            <input type="range" min="0" max="6" step="1" value={missedPayments}
              onChange={e => setMissedPayments(parseInt(e.target.value))}
              className="escape-slider pink-slider" />
            <div className="slider-hints"><span>0 (perfect)</span><span>6 missed</span></div>
          </div>

          <button className="scan-btn" style={{ width: '100%', marginTop: '0.5rem' }} onClick={simulate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
            </svg>
            Simulate impact
          </button>
        </div>

        <div className="credit-right">
          {!result ? (
            <div className="escape-empty">
              <div className="escape-empty-icon">📊</div>
              <div className="escape-empty-text">Fill in your details<br />to simulate how this loan<br />affects your credit score</div>
            </div>
          ) : (
            <>
              <div className="score-comparison">
                <div className="score-box">
                  <div className="score-box-label">Current score</div>
                  <ScoreGauge score={currentScore} />
                </div>
                <div className="score-arrow">→</div>
                <div className="score-box">
                  <div className="score-box-label">After taking loan</div>
                  <ScoreGauge score={result.projected} />
                </div>
                <div className="score-arrow">→</div>
                <div className="score-box">
                  <div className="score-box-label">After 24mo on-time</div>
                  <ScoreGauge score={result.projectedAfter24} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-label-row">
                  <div className="chart-label">Score trajectory over 24 months</div>
                </div>
                <div style={{ height: 200 }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className="factors-card">
                <div className="chart-label" style={{ marginBottom: '12px' }}>Score impact breakdown</div>
                {result.factors.map((f, i) => (
                  <div key={i} className="factor-row">
                    <div className="factor-left">
                      <div className="factor-label">{f.label}</div>
                      <div className="factor-desc">{f.desc}</div>
                    </div>
                    <div className={`factor-impact ${f.impact > 0 ? 'positive' : 'negative'}`}>
                      {f.impact > 0 ? '+' : ''}{f.impact}
                    </div>
                  </div>
                ))}
                <div className="factor-total">
                  <div className="factor-label" style={{ fontWeight: 600 }}>Net change</div>
                  <div className={`factor-impact ${result.projected - currentScore >= 0 ? 'positive' : 'negative'}`} style={{ fontSize: '16px' }}>
                    {result.projected - currentScore >= 0 ? '+' : ''}{result.projected - currentScore}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
