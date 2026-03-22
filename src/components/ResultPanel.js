import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ResultPanel.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

function MetricCard({ label, value, sub, colorClass, variant }) {
  return (
    <div className={`metric-card ${variant || ''}`}>
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${colorClass || ''}`}>{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function DTIBar({ dti, level }) {
  const color = level === 'danger' ? '#f87171' : level === 'warning' ? '#fbbf24' : '#34d399';
  return (
    <div className="dti-bar-wrap">
      <div className="dti-bar-fill" style={{ width: `${Math.min(dti, 100)}%`, background: color }} />
      <div className="dti-safe-marker" title="Safe limit: 35%" />
    </div>
  );
}

export default function ResultPanel({ result }) {
  if (!result) {
    return (
      <div className="result-panel">
        <div className="empty-state">
          <div className="empty-blob">🔍</div>
          <div className="empty-text">
            Fill in your details<br />
            and hit Scan<br />
            to see your runway
          </div>
        </div>
      </div>
    );
  }

  const { newEMI, totalEMI, freeCash, dti, totalInterest, level, verdictText, runwayData, runwayLabels, insolventMonth } = result;

  const freeCashLevel = freeCash < 0 ? 'danger' : freeCash < 5000 ? 'warning' : 'safe';
  const badgeText = level === 'danger' ? '⚠ Debt trap detected' : level === 'warning' ? '◉ High risk zone' : '✓ Manageable';

  const pointColors = runwayData.map(v => v < 0 ? '#f87171' : '#34d399');

  const chartData = {
    labels: runwayLabels,
    datasets: [{
      label: 'Free cash',
      data: runwayData,
      borderColor: '#7c6ff7',
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
        gradient.addColorStop(0, 'rgba(167, 139, 250, 0.3)');
        gradient.addColorStop(0.6, 'rgba(244, 114, 182, 0.12)');
        gradient.addColorStop(1, 'rgba(244, 114, 182, 0)');
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
        backgroundColor: '#2a2650',
        titleColor: '#a9a4d4',
        bodyColor: '#e8e6ff',
        borderColor: '#3d3875',
        borderWidth: 1,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => ` ₹${Math.round(ctx.raw).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#6d68a8', font: { size: 10 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 },
        grid: { color: 'rgba(61,56,117,0.5)' },
      },
      y: {
        ticks: {
          color: '#6d68a8',
          font: { size: 10 },
          callback: v => '₹' + (v / 1000).toFixed(0) + 'k',
        },
        grid: { color: 'rgba(61,56,117,0.5)' },
      },
    },
    animation: { duration: 1000, easing: 'easeInOutQuart' },
  };

  return (
    <div className="result-panel">
      <div className={`verdict ${level}`}>
        <div className="verdict-badge">{badgeText}</div>
        <div className="verdict-text" dangerouslySetInnerHTML={{ __html: verdictText }} />
      </div>

      <div className="metrics-grid">
        <MetricCard label="New EMI" value={`₹${newEMI.toLocaleString()}`} sub="per month" variant="purple" colorClass="purple" />
        <MetricCard label="Total burden" value={`₹${totalEMI.toLocaleString()}`} sub="all loans" variant="pink" colorClass={level} />
        <MetricCard label="Free cash" value={`₹${freeCash.toLocaleString()}`} sub="after EMIs" variant="blue" colorClass={freeCashLevel} />
        <div className={`metric-card mint`}>
          <div className="metric-label">Debt-to-income</div>
          <div className={`metric-value ${level}`}>{dti}%</div>
          <div className="metric-sub">safe limit: 35%</div>
          <DTIBar dti={dti} level={level} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-label">36-month free cash runway</div>
        <div className="chart-wrap">
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
    </div>
  );
}
