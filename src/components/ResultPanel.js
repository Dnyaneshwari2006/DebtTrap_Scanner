import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ResultPanel.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

function MetricCard({ label, value, sub, colorClass, variant, delay }) {
  return (
    <div className={`metric-card ${variant || ''}`} style={{ animationDelay: `${delay || 0}s` }}>
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${colorClass || ''}`}>{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function DTIBar({ dti, level }) {
  const color = level === 'danger' ? '#ff6b6b' : level === 'warning' ? '#f59e0b' : '#00d4aa';
  return (
    <div className="dti-bar-wrap">
      <div className="dti-bar-fill" style={{ width: `${Math.min(dti, 100)}%`, background: color }} />
      <div className="dti-safe-marker" title="Safe limit: 35%" />
    </div>
  );
}

function ShareButton({ result }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    const text = `📊 DebtTrap Scanner Results\n━━━━━━━━━━━━━━━━━━━\n💰 New EMI: ₹${result.newEMI.toLocaleString()}/mo\n📈 Total EMI Burden: ₹${result.totalEMI.toLocaleString()}/mo\n💵 Free Cash After EMIs: ₹${result.freeCash.toLocaleString()}/mo\n📉 Debt-to-Income Ratio: ${result.dti}%\n⚠️ Risk Level: ${result.level === 'danger' ? 'HIGH RISK — Debt Trap Detected' : result.level === 'warning' ? 'MODERATE — High Risk Zone' : 'SAFE — Manageable'}\n${result.insolventMonth !== -1 ? `🔴 Cashflow goes negative in ${result.insolventMonth} months` : '✅ Cashflow stays positive for 36 months'}\n━━━━━━━━━━━━━━━━━━━\nAnalyzed with DebtTrap Scanner — Know before you borrow`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="share-btn" onClick={handleCopy}>
      {copied ? (
        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
      ) : (
        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Results</>
      )}
    </button>
  );
}

export default function ResultPanel({ result }) {
  if (!result) {
    return (
      <div className="result-panel">
        <div className="empty-state">
          <div className="empty-blob">🔍</div>
          <div className="empty-text">Fill in your details<br />and hit Scan<br />to see your runway</div>
        </div>
      </div>
    );
  }

  const { newEMI, totalEMI, freeCash, dti, totalInterest, level, verdictText, runwayData, runwayLabels, insolventMonth } = result;
  const freeCashLevel = freeCash < 0 ? 'danger' : freeCash < 5000 ? 'warning' : 'safe';
  const badgeText = level === 'danger' ? '⚠ Debt trap detected' : level === 'warning' ? '◉ High risk zone' : '✓ Manageable';
  const pointColors = runwayData.map(v => v < 0 ? '#ff6b6b' : '#00d4aa');

  const chartData = {
    labels: runwayLabels,
    datasets: [{
      label: 'Free cash',
      data: runwayData,
      borderColor: '#00d4aa',
      borderWidth: 2.5,
      pointRadius: 3,
      pointBackgroundColor: pointColors,
      pointBorderColor: 'transparent',
      fill: true,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return 'transparent';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(0,212,170,0.22)');
        gradient.addColorStop(0.5, 'rgba(56,189,248,0.08)');
        gradient.addColorStop(1, 'rgba(0,212,170,0)');
        return gradient;
      },
      tension: 0.38,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#141f2e',
        titleColor: '#6a9ab0',
        bodyColor: '#dff0f8',
        borderColor: '#1e3048',
        borderWidth: 1,
        cornerRadius: 10,
        callbacks: { label: (ctx) => ` ₹${Math.round(ctx.raw).toLocaleString()}` },
      },
    },
    scales: {
      x: {
        ticks: { color: '#2e5060', font: { size: 10 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 },
        grid: { color: 'rgba(30,48,72,0.6)' },
      },
      y: {
        ticks: { color: '#2e5060', font: { size: 10 }, callback: v => '₹' + (v / 1000).toFixed(0) + 'k' },
        grid: { color: 'rgba(30,48,72,0.6)' },
      },
    },
    animation: { duration: 1200, easing: 'easeInOutQuart' },
  };

  return (
    <div className="result-panel">
      <div className={`verdict ${level}`}>
        <div className="verdict-badge">{badgeText}</div>
        <div className="verdict-text" dangerouslySetInnerHTML={{ __html: verdictText }} />
      </div>

      <div className="metrics-grid">
        <MetricCard label="New EMI"      value={`₹${newEMI.toLocaleString()}`}   sub="per month"  variant="purple" colorClass="purple" delay={0.05} />
        <MetricCard label="Total burden" value={`₹${totalEMI.toLocaleString()}`} sub="all loans"  variant="pink"   colorClass={level}  delay={0.1}  />
        <MetricCard label="Free cash"    value={`₹${freeCash.toLocaleString()}`} sub="after EMIs" variant="blue"   colorClass={freeCashLevel} delay={0.15} />
        <div className="metric-card mint" style={{ animationDelay: '0.2s' }}>
          <div className="metric-label">Debt-to-income</div>
          <div className={`metric-value ${level}`}>{dti}%</div>
          <div className="metric-sub">safe limit: 35%</div>
          <DTIBar dti={dti} level={level} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-label">36-month free cash runway</div>
        <div style={{ height: 200 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="summary-card">
        <div className="chart-label">Loan summary</div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-key">Total interest paid</span>
            <span className="summary-val">₹{totalInterest.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-key">Cashflow goes negative</span>
            <span className={`summary-val ${insolventMonth !== -1 ? 'danger-text' : 'safe-text'}`}>
              {insolventMonth !== -1 ? `Month ${insolventMonth}` : 'Never (in 36mo)'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-key">Risk level</span>
            <span className={`summary-val ${level}-text`}>
              {level === 'danger' ? 'High Risk' : level === 'warning' ? 'Moderate' : 'Safe'}
            </span>
          </div>
        </div>
      </div>
      <ShareButton result={result} />
    </div>
  );
}