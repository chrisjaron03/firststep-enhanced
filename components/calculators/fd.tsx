"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "FD Calculator",
  description: "Calculate fixed deposit maturity amount and interest earned",
  fields: [
    { key: "deposit", label: "Deposit Amount", min: 1000, max: 5000000, step: 1000, default: 100000 },
    { key: "rate", label: "Interest Rate", min: 1, max: 12, step: 0.25, default: 7, suffix: "%" },
    { key: "years", label: "Tenure", min: 1, max: 10, step: 1, default: 3, suffix: " yrs" },
  ],
  calculate: (v) => {
    const rate = v.rate / 100
    const maturity = v.deposit * Math.pow(1 + rate, v.years)
    const interest = Math.round(maturity - v.deposit)
    return {
      cards: [
        { label: "Deposit Amount", value: formatCurrency(v.deposit) },
        { label: "Interest Earned", value: formatCurrency(interest), primary: true },
        { label: "Maturity Amount", value: formatCurrency(Math.round(maturity)) },
      ],
      breakdown: [
        { label: "Principal", value: formatCurrency(v.deposit) },
        { label: "Interest Rate", value: `${v.rate}% p.a.` },
        { label: "Tenure", value: `${v.years} years` },
        { label: "Interest Earned", value: formatCurrency(interest) },
        { label: "Maturity Value", value: formatCurrency(Math.round(maturity)) },
      ],
      trueWealth: {
        maturityValue: Math.round(maturity),
        totalInvested: v.deposit,
        gains: interest,
        holdingYears: v.years,
        taxType: "bank-fd",
      },
    }
  },
}

export function FdCalculator() { return <CalcShell config={config} /> }
