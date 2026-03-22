import React from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultPanel from './components/ResultPanel';
import { useDebtCalculator } from './hooks/useDebtCalculator';
import './App.css';

function App() {
  const {
    income, setIncome,
    expenses, setExpenses,
    loans, addLoan, removeLoan,
    newAmount, setNewAmount,
    newRate, setNewRate,
    newTenure, setNewTenure,
    result,
    calculate,
  } = useDebtCalculator();

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <InputPanel
          income={income} setIncome={setIncome}
          expenses={expenses} setExpenses={setExpenses}
          loans={loans} addLoan={addLoan} removeLoan={removeLoan}
          newAmount={newAmount} setNewAmount={setNewAmount}
          newRate={newRate} setNewRate={setNewRate}
          newTenure={newTenure} setNewTenure={setNewTenure}
          onCalculate={calculate}
        />
        <ResultPanel result={result} />
      </div>
    </div>
  );
}

export default App;
