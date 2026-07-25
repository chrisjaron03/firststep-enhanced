"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "NPS Calculator",
  description: "Estimate your NPS pension corpus and monthly pension at retirement",
  fields: [
    { key: "age", label: "Current Age", min: 18, max: 60, step: 1, default: 30, suffix: " yrs" },
    { key: "monthly", label: "Monthly Contribution", min: 500, max: 100000, step: 500, default: 5000 },
    { key: "return", label: "Expected Return", min: 1, max: 15, step: 0.5, default: 10, suffix: "%" },
    { key: "annuity", label: "Annuity Rate", min: 1, max: 10, step: 0.25, default: 6, suffix: "%" },
  ],
  calculate: (v) => {
    const retireAge = 60
    const investYears = retireAge - v.age
    const months = investYears * 12
    const monthlyRate = v.return / 12 / 100
    const corpus = v.monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
    const annuityCorpus = corpus * 0.4
    const monthlyPension = (annuityCorpus * (v.annuity / 100)) / 12
    const lumpSum = corpus * 0.6
    const totalInvested = v.monthly * months
    return {
      cards: [
        { label: "Total Corpus at 60", value: formatCurrency(Math.round(corpus)), primary: true },
        { label: "Lump Sum (60%)", value: formatCurrency(Math.round(lumpSum)) },
        { label: "Monthly Pension", value: formatCurrency(Math.round(monthlyPension)) },
      ],
      breakdown: [
        { label: "Monthly Contribution", value: formatCurrency(v.monthly) },
        { label: "Investment Period", value: `${investYears} years` },
        { label: "Total Corpus", value: formatCurrency(Math.round(corpus)) },
        { label: "Lump Sum Withdrawal (60%)", value: formatCurrency(Math.round(lumpSum)) },
        { label: "Annuity Invested (40%)", value: formatCurrency(Math.round(annuityCorpus)) },
        { label: "Estimated Monthly Pension", value: formatCurrency(Math.round(monthlyPension)) },
      ],
      trueWealth: {
        maturityValue: Math.round(corpus),
        totalInvested,
        gains: Math.round(corpus - totalInvested),
        holdingYears: investYears,
        taxType: "equity-ltcg",
      },
    }
  },
}

export function NpsCalculator() { return <CalcShell config={config} /> }
