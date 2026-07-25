"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "SWP Calculator",
  description: "Plan systematic withdrawals from your investment corpus",
  fields: [
    { key: "corpus", label: "Investment Corpus", min: 100000, max: 50000000, step: 50000, default: 5000000 },
    { key: "withdrawal", label: "Monthly Withdrawal", min: 1000, max: 500000, step: 1000, default: 25000 },
    { key: "rate", label: "Expected Return", min: 1, max: 30, step: 0.5, default: 10, suffix: "%" },
  ],
  calculate: (v) => {
    const monthlyRate = v.rate / 12 / 100
    let corpus = v.corpus
    let months = 0
    while (corpus > 0 && months < 1200) {
      corpus = corpus * (1 + monthlyRate) - v.withdrawal
      months++
      if (corpus <= 0) break
    }
    const years = Math.floor(months / 12)
    const remMonths = months % 12
    const totalWithdrawn = v.withdrawal * months
    return {
      cards: [
        { label: "Withdrawal Amount", value: formatCurrency(v.withdrawal) + "/mo" },
        { label: "Corpus Lasts", value: `${years}y ${remMonths}m` },
        { label: "Total Withdrawn", value: formatCurrency(totalWithdrawn), primary: true },
      ],
      breakdown: [
        { label: "Initial Corpus", value: formatCurrency(v.corpus) },
        { label: "Monthly Withdrawal", value: formatCurrency(v.withdrawal) },
        { label: "Expected Return", value: `${v.rate}% p.a.` },
        { label: "Corpus Depletes In", value: `${years} years ${remMonths} months` },
        { label: "Total Withdrawn Over Period", value: formatCurrency(totalWithdrawn) },
      ],
      trueWealth: {
        maturityValue: totalWithdrawn,
        totalInvested: v.corpus,
        gains: Math.max(0, totalWithdrawn - v.corpus),
        holdingYears: Math.max(1, years),
        taxType: "equity-ltcg",
      },
    }
  },
}

export function SwpCalculator() { return <CalcShell config={config} /> }
