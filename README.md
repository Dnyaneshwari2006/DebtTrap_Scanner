# 🔴 DebtTrap Scanner

> Know before you borrow — visualize your debt spiral and exact financial runway.

Most young borrowers don't realize they're in a debt spiral until it's too late. DebtTrap Scanner lets you paste your loan details and instantly see your real debt-to-income ratio, your 36-month cash flow runway, and the exact month you go cashflow negative.

## ✨ Features

- **EMI Calculator** — accurate formula-based EMI computation
- **Debt-to-Income Ratio** — visual bar with safe/warning/danger thresholds
- **36-Month Runway Chart** — animated line chart showing when free cash hits zero
- **Insolvency Detection** — exact month you go cashflow negative
- **Multi-loan stacking** — add existing loans + new loan and see combined impact
- **Zero APIs** — runs entirely in the browser, no backend needed

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/debttrap-scanner.git
cd debttrap-scanner

# Install dependencies
npm install

# Start dev server
npm start
```

App runs at `http://localhost:3000`

## 🛠 Tech Stack

- **React 18** — UI framework
- **Chart.js + react-chartjs-2** — runway visualization
- **Pure JS math** — no external APIs needed
- **CSS Variables** — dark purple/pink theme

## 📦 Build for Production

```bash
npm run build
```

Deploy the `/build` folder to Vercel, Netlify, or GitHub Pages.

## 🎯 Demo Data

Try this to see the debt trap in action:
- Monthly income: `45000`
- Monthly expenses: `18000`
- Add existing loan: EMI `8000`, 18 months left
- New loan: `200000` at `16%` for `24` months
- Hit **Scan** → watch the chart go red

## 📋 Roadmap

- [ ] Loan comparison mode (Bank A vs Bank B)
- [ ] Escape plan generator (prepayment simulator)
- [ ] AI-powered loan advice via Claude API
- [ ] UPI transaction import for auto-filling EMI data
- [ ] PDF financial health report export

## 🏆 Built for

Submitted to hackathons on Devpost. Finance + Social Impact category.

---

Made with ❤️ to help young borrowers avoid the debt spiral.
