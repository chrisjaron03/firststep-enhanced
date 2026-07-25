"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "PPF Calculator",
  description: "Calculate Public Provident Fund maturity after 15 years",
  fields: [
    { key: "yearly", label: "Yearly Deposit", min: 500, max: 150000, step: 500, default: 50000 },
    { key: "rate", label: "PPF Interest Rate", min: 5, max: 10, step: 0.1, default: 7.1, suffix: "%" },
  ],
  calculate: (v) => {
    const rate = v.rate / 100
    const years = 15
    let maturity = 0
    for (let i = 0; i < years; i++) {
      maturity = (maturity + v.yearly) * (1 + rate)
    }
    const totalInvested = v.yearly * years
    const interest = Math.round(maturity - totalInvested)
    return {
      cards: [
        { label: "Total Invested (15 yrs)", value: formatCurrency(totalInvested) },
        { label: "Interest Earned", value: formatCurrency(interest), primary: true },
        { label: "Maturity Amount", value: formatCurrency(Math.round(maturity)) },
      ],
      breakdown: [
        { label: "Yearly Investment", value: formatCurrency(v.yearly) },
        { label: "Interest Rate", value: `${v.rate}% p.a.` },
        { label: "Tenure", value: "15 years (locked-in)" },
        { label: "Total Invested", value: formatCurrency(totalInvested) },
        { label: "Maturity Value", value: formatCurrency(Math.round(maturity)) },
      ],
      trueWealth: {
        maturityValue: Math.round(maturity),
        totalInvested,
        gains: interest,
        holdingYears: years,
        taxType: "tax-free",
      },
    }
  },
}

export function PpfCalculator() { return <CalcShell config={config} /> }
