"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Tax Savings Calculator",
  description: "Estimate tax savings under Section 80C and other deductions",
  fields: [
    { key: "income", label: "Annual Income", min: 250000, max: 50000000, step: 50000, default: 1200000 },
    { key: "80c", label: "80C Investments (ELSS, PPF, etc.)", min: 0, max: 150000, step: 1000, default: 150000 },
    { key: "nps", label: "Additional NPS (80CCD(1B))", min: 0, max: 50000, step: 1000, default: 50000 },
    { key: "medical", label: "Health Insurance (80D)", min: 0, max: 100000, step: 1000, default: 25000 },
  ],
  calculate: (v) => {
    const standardDeduction = 50000
    const totalDeductions = v["80c"] + v.nps + v.medical + standardDeduction
    const taxableIncome = Math.max(0, v.income - totalDeductions)

    const oldTax = (() => {
      let t = 0, left = taxableIncome
      const slabs = [[250000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]]
      let prev = 0
      for (const [limit, rate] of slabs) {
        if (left > 0) {
          const slice = Math.min(left, limit - prev)
          t += slice * rate
          left -= slice
          prev = limit
        }
      }
      return t
    })()

    const newTax = (() => {
      let t = 0, left = taxableIncome
      const slabs = [[300000, 0], [600000, 0.05], [900000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]]
      let prev = 0
      for (const [limit, rate] of slabs) {
        if (left > 0) {
          const slice = Math.min(left, limit - prev)
          t += slice * rate
          left -= slice
          prev = limit
        }
      }
      return t
    })()

    const saving = Math.round(oldTax - newTax)
    const cess = 0.04
    const oldTaxCess = Math.round(oldTax * (1 + cess))
    const newTaxCess = Math.round(newTax * (1 + cess))
    const savingCess = oldTaxCess - newTaxCess

    return {
      cards: [
        { label: "Taxable Income", value: formatCurrency(taxableIncome) },
        { label: "Old Regime Tax (with cess)", value: formatCurrency(oldTaxCess) },
        { label: "New Regime Tax (with cess)", value: formatCurrency(newTaxCess), primary: true },
      ],
      breakdown: [
        { label: "Annual Income", value: formatCurrency(v.income) },
        { label: "Total Deductions", value: formatCurrency(totalDeductions) },
        { label: "Taxable Income", value: formatCurrency(taxableIncome) },
        { label: "Old Regime Tax", value: formatCurrency(oldTaxCess) },
        { label: "New Regime Tax", value: formatCurrency(newTaxCess) },
        { label: "You Save", value: formatCurrency(savingCess) },
      ],
    }
  },
}

export function TaxSavingCalculator() { return <CalcShell config={config} /> }
