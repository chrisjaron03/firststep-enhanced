"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Retirement Planner",
  description: "Calculate the corpus needed and monthly investment for a comfortable retirement",
  fields: [
    { key: "age", label: "Current Age", min: 18, max: 55, step: 1, default: 30, suffix: " yrs" },
    { key: "expense", label: "Monthly Expense (today's value)", min: 10000, max: 500000, step: 5000, default: 50000 },
    { key: "return", label: "Pre-Retirement Return", min: 1, max: 15, step: 0.5, default: 12, suffix: "%" },
    { key: "postReturn", label: "Post-Retirement Return", min: 1, max: 10, step: 0.5, default: 7, suffix: "%" },
  ],
  calculate: (v) => {
    const retireAge = 60
    const lifeExp = 85
    const investYears = retireAge - v.age
    const retireYears = lifeExp - retireAge
    const inflation = 0.06
    const monthlyExpAtRetire = v.expense * Math.pow(1 + inflation, investYears)
    const yearlyExpAtRetire = monthlyExpAtRetire * 12
    const postRate = v.postReturn / 100
    const corpusNeeded = yearlyExpAtRetire * ((1 - Math.pow(1 + postRate, -retireYears)) / postRate)
    const monthlyRate = v.return / 12 / 100
    const months = investYears * 12
    const monthlySip = (corpusNeeded * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate))
    return {
      cards: [
        { label: "Corpus Needed at 60", value: formatCurrency(Math.round(corpusNeeded)), primary: true },
        { label: "Monthly SIP Required", value: formatCurrency(Math.round(monthlySip)) },
        { label: "Monthly Expense at 60", value: formatCurrency(Math.round(monthlyExpAtRetire)) },
      ],
      breakdown: [
        { label: "Current Age", value: `${v.age} years` },
        { label: "Retirement Age", value: "60 years" },
        { label: "Years to Retirement", value: `${investYears} years` },
        { label: "Current Monthly Expense", value: formatCurrency(v.expense) },
        { label: "Monthly Expense at Retirement (6% inflation)", value: formatCurrency(Math.round(monthlyExpAtRetire)) },
        { label: "Total Corpus Needed", value: formatCurrency(Math.round(corpusNeeded)) },
        { label: "Monthly Investment Needed", value: formatCurrency(Math.round(monthlySip)) },
      ],
    }
  },
}

export function RetirementPlanner() { return <CalcShell config={config} /> }
