import { useState } from 'react';

function calcEMI(principal, annualRate, months) {
  if (!annualRate) return principal / months;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function getMonthLabel(offsetMonths) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}

export function useDebtCalculator() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [loans, setLoans] = useState([]);
  const [newAmount, setNewAmount] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newTenure, setNewTenure] = useState('');
  const [result, setResult] = useState(null);

  const addLoan = (emi, months) => {
    if (!emi || !months) return false;
    setLoans(prev => [...prev, { emi: parseFloat(emi), months: parseInt(months) }]);
    return true;
  };

  const removeLoan = (index) => {
    setLoans(prev => prev.filter((_, i) => i !== index));
  };

  const calculate = () => {
    const inc = parseFloat(income);
    const exp = parseFloat(expenses) || 0;
    const amt = parseFloat(newAmount);
    const rate = parseFloat(newRate) || 0;
    const tenure = parseInt(newTenure);

    if (!inc || !amt || !tenure) return null;

    const newEMI = calcEMI(amt, rate, tenure);
    const existingEMI = loans.reduce((sum, l) => sum + l.emi, 0);
    const totalEMI = existingEMI + newEMI;
    const disposable = inc - exp;
    const freeCash = disposable - totalEMI;
    const dti = (totalEMI / inc) * 100;
    const totalInterest = newEMI * tenure - amt;

    // Build 36-month runway data
    const runwayData = [];
    const runwayLabels = [];
    let insolventMonth = -1;

    for (let m = 0; m <= 36; m++) {
      let burden = newEMI;
      loans.forEach(l => {
        if (m < l.months) burden += l.emi;
      });
      const bal = disposable - burden;
      runwayData.push(Math.round(bal));
      runwayLabels.push(getMonthLabel(m));
      if (bal < 0 && insolventMonth === -1) insolventMonth = m;
    }

    const level = dti > 50 ? 'danger' : dti > 35 ? 'warning' : 'safe';

    let verdictText = '';
    if (insolventMonth !== -1) {
      verdictText = `You'll go cashflow negative by <strong>${getMonthLabel(insolventMonth)}</strong> — that's just ${insolventMonth} months away.`;
    } else if (dti > 50) {
      verdictText = `Your debt-to-income is <strong>${dti.toFixed(1)}%</strong> — dangerously above the 35% safe limit.`;
    } else if (dti > 35) {
      verdictText = `Tight but survivable. One missed paycheck away from trouble — build a buffer first.`;
    } else {
      verdictText = `Your debt load is within safe limits at <strong>${dti.toFixed(1)}%</strong>. You're okay to proceed.`;
    }

    setResult({
      newEMI: Math.round(newEMI),
      totalEMI: Math.round(totalEMI),
      freeCash: Math.round(freeCash),
      dti: parseFloat(dti.toFixed(1)),
      totalInterest: Math.round(totalInterest),
      insolventMonth,
      insolventLabel: insolventMonth !== -1 ? getMonthLabel(insolventMonth) : null,
      level,
      verdictText,
      runwayData,
      runwayLabels,
    });
  };

  return {
    income, setIncome,
    expenses, setExpenses,
    loans, addLoan, removeLoan,
    newAmount, setNewAmount,
    newRate, setNewRate,
    newTenure, setNewTenure,
    result,
    calculate,
  };
}
