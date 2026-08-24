"use client"

import { CalcShell, formatCurrency, formatCompactRupees, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "SWP Calculator",
  description: "Plan systematic withdrawals from your investment corpus and track remaining wealth",
  fields: [
    { key: "corpus", label: "Investment Corpus", min: 100000, max: 50000000, step: 50000, default: 5000000 },
    { key: "withdrawal", label: "Monthly Withdrawal", min: 1000, max: 500000, step: 1000, default: 30000 },
    { key: "rate", label: "Expected Return Rate", min: 1, max: 30, step: 0.5, default: 10, suffix: "%" },
    { key: "years", label: "Withdrawal Tenure", min: 1, max: 35, step: 1, default: 15, suffix: " yrs" },
  ],
  calculate: (v) => {
    const monthlyRate = v.rate / 12 / 100
    const totalMonths = v.years * 12
    let balance = v.corpus
    let totalWithdrawn = 0
    let depletedMonth: number | null = null

    for (let m = 1; m <= totalMonths; m++) {
      if (balance <= 0) {
        if (depletedMonth === null) depletedMonth = m - 1
        break
      }
      const interest = balance * monthlyRate
      balance += interest

      if (balance >= v.withdrawal) {
        balance -= v.withdrawal
        totalWithdrawn += v.withdrawal
      } else {
        totalWithdrawn += balance
        balance = 0
        if (depletedMonth === null) depletedMonth = m
        break
      }
    }

    const finalBalance = Math.round(balance)
    const roundedTotalWithdrawn = Math.round(totalWithdrawn)
    const totalValue = roundedTotalWithdrawn + finalBalance

    return {
      cards: [
        { label: "Total Withdrawn", value: formatCurrency(roundedTotalWithdrawn) },
        { label: "Remaining Balance", value: formatCurrency(finalBalance), primary: true },
        { label: "Total Value Generated", value: formatCurrency(totalValue) },
      ],
      breakdown: [
        { label: "Initial Investment", value: formatCurrency(v.corpus) },
        { label: "Monthly Withdrawal", value: formatCurrency(v.withdrawal) + "/mo" },
        { label: "Expected Return", value: `${v.rate}% p.a.` },
        { label: "Withdrawal Period", value: `${v.years} years` },
        { label: "Total Payouts Received", value: formatCurrency(roundedTotalWithdrawn) },
        { label: "Final Corpus Remaining", value: formatCurrency(finalBalance) },
        { label: "Corpus Status", value: finalBalance >= v.corpus ? "Corpus Growing" : finalBalance > 0 ? "Fully Sustained" : `Depleted in ${depletedMonth ? `${Math.floor(depletedMonth / 12)}y ${depletedMonth % 12}m` : 'N/A'}` },
      ],
      trueWealth: {
        maturityValue: totalValue,
        totalInvested: v.corpus,
        gains: Math.max(0, totalValue - v.corpus),
        holdingYears: v.years,
        taxType: "equity-ltcg",
      },
    }
  },
}

export function SwpCalculator() { return <CalcShell config={config} /> }

