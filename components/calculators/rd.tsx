"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "RD Calculator",
  description: "Calculate Recurring Deposit maturity for monthly deposits",
  fields: [
    { key: "monthly", label: "Monthly Deposit", min: 100, max: 100000, step: 100, default: 5000 },
    { key: "rate", label: "Interest Rate", min: 1, max: 10, step: 0.25, default: 6.5, suffix: "%" },
    { key: "years", label: "Tenure", min: 1, max: 10, step: 1, default: 5, suffix: " yrs" },
  ],
  calculate: (v) => {
    const months = v.years * 12
    const monthlyRate = v.rate / 12 / 100
    const maturity = v.monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    const totalInvested = v.monthly * months
    const interest = Math.round(maturity - totalInvested)
    return {
      cards: [
        { label: "Total Deposited", value: formatCurrency(totalInvested) },
        { label: "Interest Earned", value: formatCurrency(interest), primary: true },
        { label: "Maturity Amount", value: formatCurrency(Math.round(maturity)) },
      ],
      breakdown: [
        { label: "Monthly Deposit", value: formatCurrency(v.monthly) },
        { label: "Interest Rate", value: `${v.rate}% p.a.` },
        { label: "Tenure", value: `${v.years} years` },
        { label: "Total Deposited", value: formatCurrency(totalInvested) },
        { label: "Maturity Value", value: formatCurrency(Math.round(maturity)) },
      ],
      trueWealth: {
        maturityValue: Math.round(maturity),
        totalInvested,
        gains: interest,
        holdingYears: v.years,
        taxType: "bank-fd",
      },
    }
  },
}

export function RdCalculator() { return <CalcShell config={config} /> }
