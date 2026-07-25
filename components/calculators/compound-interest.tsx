"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Compound Interest Calculator",
  description: "See how your money grows with compound interest over time",
  fields: [
    { key: "principal", label: "Principal Amount", min: 1000, max: 10000000, step: 1000, default: 100000 },
    { key: "rate", label: "Interest Rate", min: 1, max: 30, step: 0.5, default: 12, suffix: "%" },
    { key: "years", label: "Time Period", min: 1, max: 30, step: 1, default: 10, suffix: " yrs" },
    { key: "frequency", label: "Compounding per Year", min: 1, max: 365, step: 1, default: 12, suffix: "x" },
  ],
  calculate: (v) => {
    const fv = v.principal * Math.pow(1 + (v.rate / 100) / v.frequency, v.frequency * v.years)
    const interest = Math.round(fv - v.principal)
    return {
      cards: [
        { label: "Principal", value: formatCurrency(v.principal) },
        { label: "Interest Earned", value: formatCurrency(interest), primary: true },
        { label: "Total Value", value: formatCurrency(Math.round(fv)) },
      ],
      breakdown: [
        { label: "Principal Amount", value: formatCurrency(v.principal) },
        { label: "Interest Rate", value: `${v.rate}% p.a.` },
        { label: "Compounding Frequency", value: `${v.frequency}x per year` },
        { label: "Time Period", value: `${v.years} years` },
        { label: "Interest Earned", value: formatCurrency(interest) },
        { label: "Maturity Value", value: formatCurrency(Math.round(fv)) },
      ],
      trueWealth: {
        maturityValue: Math.round(fv),
        totalInvested: v.principal,
        gains: interest,
        holdingYears: v.years,
        taxType: "equity-ltcg",
      },
    }
  },
}

export function CompoundInterestCalculator() { return <CalcShell config={config} /> }
