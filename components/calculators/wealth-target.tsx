"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Wealth Target Calculator",
  description: "Find out how long it takes to reach your wealth goal with monthly investments",
  fields: [
    { key: "target", label: "Wealth Target", min: 100000, max: 100000000, step: 100000, default: 10000000 },
    { key: "monthly", label: "Monthly Investment", min: 500, max: 500000, step: 500, default: 25000 },
    { key: "rate", label: "Expected Return", min: 1, max: 30, step: 0.5, default: 12, suffix: "%" },
  ],
  calculate: (v) => {
    const monthlyRate = v.rate / 12 / 100
    let months = 0
    let fv = 0
    const maxMonths = 600
    while (fv < v.target && months < maxMonths) {
      months++
      fv = (fv + v.monthly) * (1 + monthlyRate)
    }
    const years = Math.floor(months / 12)
    const remMonths = months % 12
    const totalInvested = v.monthly * months
    return {
      cards: [
        { label: "Wealth Target", value: formatCurrency(v.target) },
        { label: "Time Needed", value: `${years}y ${remMonths}m`, primary: true },
        { label: "Total Invested", value: formatCurrency(totalInvested) },
      ],
      breakdown: [
        { label: "Target Amount", value: formatCurrency(v.target) },
        { label: "Monthly Investment", value: formatCurrency(v.monthly) },
        { label: "Expected Return", value: `${v.rate}% p.a.` },
        { label: "Time to Reach Goal", value: `${years} years ${remMonths} months` },
        { label: "Total Amount Invested", value: formatCurrency(totalInvested) },
      ],
      trueWealth: {
        maturityValue: v.target,
        totalInvested,
        gains: Math.max(0, v.target - totalInvested),
        holdingYears: Math.max(1, years),
        taxType: "equity-ltcg",
      },
    }
  },
}

export function WealthTarget() { return <CalcShell config={config} /> }
