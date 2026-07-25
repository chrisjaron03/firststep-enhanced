"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Insurance Need Analysis",
  description: "Calculate the life insurance cover you need using the human life value approach",
  fields: [
    { key: "income", label: "Annual Income", min: 100000, max: 5000000, step: 50000, default: 600000 },
    { key: "years", label: "Working Years Remaining", min: 1, max: 40, step: 1, default: 25, suffix: " yrs" },
    { key: "expenses", label: "Annual Family Expenses", min: 50000, max: 3000000, step: 50000, default: 360000 },
    { key: "liabilities", label: "Outstanding Liabilities", min: 0, max: 5000000, step: 100000, default: 500000 },
  ],
  calculate: (v) => {
    const futureIncome = v.income * v.years
    const familyNeed = v.expenses * v.years
    const coverNeeded = Math.max(0, futureIncome - familyNeed) + v.liabilities
    const termPremium = Math.round(coverNeeded * 0.008)
    return {
      cards: [
        { label: "Life Cover Needed", value: formatCurrency(Math.round(coverNeeded)), primary: true },
        { label: "Estimated Annual Premium", value: formatCurrency(termPremium) },
        { label: "Future Income Potential", value: formatCurrency(futureIncome) },
      ],
      breakdown: [
        { label: "Annual Income", value: formatCurrency(v.income) },
        { label: "Working Years Remaining", value: `${v.years} years` },
        { label: "Future Income Potential", value: formatCurrency(futureIncome) },
        { label: "Family Expenses Over Period", value: formatCurrency(familyNeed) },
        { label: "Outstanding Liabilities", value: formatCurrency(v.liabilities) },
        { label: "Recommended Cover", value: formatCurrency(Math.round(coverNeeded)) },
        { label: "Estimated Term Premium (~0.8%)", value: formatCurrency(termPremium) + "/yr" },
      ],
    }
  },
}

export function InsuranceNeedCalculator() { return <CalcShell config={config} /> }
