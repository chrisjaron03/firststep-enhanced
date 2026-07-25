"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Lump Sum vs SIP",
  description: "Compare one-time investment vs monthly SIP for the same total outlay",
  fields: [
    { key: "amount", label: "Total Investment Amount", min: 10000, max: 5000000, step: 10000, default: 500000 },
    { key: "rate", label: "Expected Return", min: 1, max: 30, step: 0.5, default: 12, suffix: "%" },
    { key: "years", label: "Investment Period", min: 1, max: 30, step: 1, default: 10, suffix: " yrs" },
  ],
  calculate: (v) => {
    const rate = v.rate / 100
    const monthlyRate = v.rate / 12 / 100
    const months = v.years * 12
    const monthlySip = v.amount / months
    const lumpsumFV = v.amount * Math.pow(1 + rate, v.years)
    const sipFV = monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
    const diff = Math.abs(sipFV - lumpsumFV)
    const better = lumpsumFV > sipFV ? "Lump Sum" : "SIP"
    return {
      cards: [
        { label: "Lump Sum Maturity", value: formatCurrency(Math.round(lumpsumFV)) },
        { label: "SIP Maturity", value: formatCurrency(Math.round(sipFV)), primary: true },
        { label: "Difference", value: formatCurrency(Math.round(diff)) },
      ],
      breakdown: [
        { label: "Total Investment", value: formatCurrency(v.amount) },
        { label: "Lump Sum at Maturity", value: formatCurrency(Math.round(lumpsumFV)) },
        { label: "SIP (" + formatCurrency(Math.round(monthlySip)) + "/mo) at Maturity", value: formatCurrency(Math.round(sipFV)) },
        { label: "Better Strategy", value: better },
        { label: "Return Difference", value: formatCurrency(Math.round(diff)) },
      ],
      trueWealth: {
        maturityValue: Math.round(Math.max(lumpsumFV, sipFV)),
        totalInvested: v.amount,
        gains: Math.round(Math.max(lumpsumFV, sipFV) - v.amount),
        holdingYears: v.years,
        taxType: "equity-ltcg",
      },
    }
  },
}

export function SipVsLumpsum() { return <CalcShell config={config} /> }
