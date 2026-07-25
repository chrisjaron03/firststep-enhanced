"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Goal Planner",
  description: "Calculate the monthly investment needed to reach your financial goal",
  fields: [
    { key: "target", label: "Target Amount", min: 100000, max: 100000000, step: 50000, default: 5000000 },
    { key: "rate", label: "Expected Return", min: 1, max: 30, step: 0.5, default: 12, suffix: "%" },
    { key: "years", label: "Time Horizon", min: 1, max: 40, step: 1, default: 10, suffix: " yrs" },
  ],
  calculate: (v) => {
    const monthlyRate = v.rate / 12 / 100
    const months = v.years * 12
    const monthly = (v.target * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate))
    const totalInvested = monthly * months
    return {
      cards: [
        { label: "Monthly Investment Needed", value: formatCurrency(Math.round(monthly)) },
        { label: "Total Amount Invested", value: formatCurrency(Math.round(totalInvested)) },
        { label: "Target Maturity Value", value: formatCurrency(v.target), primary: true },
      ],
      breakdown: [
        { label: "Target Goal", value: formatCurrency(v.target) },
        { label: "Monthly SIP Required", value: formatCurrency(Math.round(monthly)) },
        { label: "Investment Duration", value: `${v.years} years` },
        { label: "Expected Return", value: `${v.rate}% p.a.` },
      ],
    }
  },
}

export function GoalPlanner() { return <CalcShell config={config} /> }
