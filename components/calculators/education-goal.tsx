"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Education Goal Planner",
  description: "Plan for your child's higher education costs",
  fields: [
    { key: "cost", label: "Current Education Cost", min: 500000, max: 50000000, step: 100000, default: 5000000 },
    { key: "childAge", label: "Child's Current Age", min: 0, max: 18, step: 1, default: 5, suffix: " yrs" },
    { key: "years", label: "Years Until College", min: 1, max: 20, step: 1, default: 13, suffix: " yrs" },
    { key: "return", label: "Expected Return", min: 1, max: 15, step: 0.5, default: 12, suffix: "%" },
  ],
  calculate: (v) => {
    const inflation = 0.08
    const futureCost = v.cost * Math.pow(1 + inflation, v.years)
    const monthlyRate = v.return / 12 / 100
    const months = v.years * 12
    const monthlySip = (futureCost * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate))
    return {
      cards: [
        { label: "Future Education Cost", value: formatCurrency(Math.round(futureCost)), primary: true },
        { label: "Monthly Investment Needed", value: formatCurrency(Math.round(monthlySip)) },
        { label: "Current Cost", value: formatCurrency(v.cost) },
      ],
      breakdown: [
        { label: "Child's Current Age", value: `${v.childAge} years` },
        { label: "Years Until College", value: `${v.years} years` },
        { label: "Current Education Cost", value: formatCurrency(v.cost) },
        { label: "Future Cost (8% inflation)", value: formatCurrency(Math.round(futureCost)) },
        { label: "Monthly Investment Needed", value: formatCurrency(Math.round(monthlySip)) },
      ],
    }
  },
}

export function EducationGoalPlanner() { return <CalcShell config={config} /> }
