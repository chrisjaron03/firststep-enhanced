"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "EMI Calculator",
  description: "Calculate monthly loan EMI, total interest and total payment",
  fields: [
    { key: "loan", label: "Loan Amount", min: 10000, max: 50000000, step: 10000, default: 500000 },
    { key: "rate", label: "Interest Rate", min: 1, max: 20, step: 0.25, default: 8.5, suffix: "%" },
    { key: "years", label: "Loan Tenure", min: 1, max: 30, step: 1, default: 20, suffix: " yrs" },
  ],
  calculate: (v) => {
    const months = v.years * 12
    const monthlyRate = v.rate / 12 / 100
    const emi = (v.loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    const totalPayment = emi * months
    const totalInterest = totalPayment - v.loan
    return {
      cards: [
        { label: "Monthly EMI", value: formatCurrency(Math.round(emi)), primary: true },
        { label: "Total Interest", value: formatCurrency(Math.round(totalInterest)) },
        { label: "Total Payment", value: formatCurrency(Math.round(totalPayment)) },
      ],
      breakdown: [
        { label: "Loan Amount", value: formatCurrency(v.loan) },
        { label: "Interest Rate", value: `${v.rate}% p.a.` },
        { label: "Loan Tenure", value: `${v.years} years (${months} months)` },
        { label: "Monthly EMI", value: formatCurrency(Math.round(emi)) },
        { label: "Total Interest Payable", value: formatCurrency(Math.round(totalInterest)) },
        { label: "Total Payment", value: formatCurrency(Math.round(totalPayment)) },
      ],
    }
  },
}

export function EmiCalculator() { return <CalcShell config={config} /> }
