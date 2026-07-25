"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Mutual Fund Returns",
  description: "Estimate returns on your mutual fund investment based on amount and expected rate",
  fields: [
    { key: "investment", label: "Total Investment", min: 5000, max: 5000000, step: 5000, default: 100000 },
    { key: "rate", label: "Expected Return", min: 1, max: 25, step: 0.5, default: 12, suffix: "%" },
    { key: "years", label: "Investment Horizon", min: 1, max: 25, step: 1, default: 5, suffix: " yrs" },
  ],
  calculate: (v) => {
    const rate = v.rate / 100
    const maturity = v.investment * Math.pow(1 + rate, v.years)
    const returns = Math.round(maturity - v.investment)
    const cagr = v.rate
    return {
      cards: [
        { label: "Amount Invested", value: formatCurrency(v.investment) },
        { label: "Estimated Returns", value: formatCurrency(returns), primary: true },
        { label: "Maturity Value", value: formatCurrency(Math.round(maturity)) },
      ],
      breakdown: [
        { label: "Investment Amount", value: formatCurrency(v.investment) },
        { label: "Expected CAGR", value: `${cagr}%` },
        { label: "Investment Horizon", value: `${v.years} years` },
        { label: "Estimated Returns", value: formatCurrency(returns) },
        { label: "Maturity Value", value: formatCurrency(Math.round(maturity)) },
      ],
      trueWealth: {
        maturityValue: Math.round(maturity),
        totalInvested: v.investment,
        gains: returns,
        holdingYears: v.years,
        taxType: v.years >= 1 ? "equity-ltcg" : "equity-stcg",
      },
    }
  },
}

export function MutualFundReturns() { return <CalcShell config={config} /> }
