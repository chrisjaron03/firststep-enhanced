"use client"

import { CalcShell, formatCurrency, type CalcConfig } from "./shared"

const config: CalcConfig = {
  title: "Capital Gains Calculator",
  description: "Calculate long-term and short-term capital gains tax on investments",
  fields: [
    { key: "buyPrice", label: "Purchase Price", min: 1000, max: 10000000, step: 1000, default: 100000 },
    { key: "sellPrice", label: "Selling Price", min: 1000, max: 10000000, step: 1000, default: 200000 },
    { key: "holdYears", label: "Holding Period", min: 0, max: 10, step: 1, default: 3, suffix: " yrs" },
  ],
  calculate: (v) => {
    const gains = Math.max(0, v.sellPrice - v.buyPrice)
    const isLtcg = v.holdYears >= 3
    const taxRate = isLtcg ? 0.1 : (v.holdYears < 1 ? 0.15 : 0.1)
    const exemption = isLtcg ? 100000 : 0
    const taxableGains = Math.max(0, gains - exemption)
    const tax = Math.round(taxableGains * taxRate)
    const netProceeds = v.sellPrice - tax
    return {
      cards: [
        { label: "Total Capital Gains", value: formatCurrency(gains), primary: true },
        { label: "Tax Payable", value: formatCurrency(tax) },
        { label: "Net Proceeds", value: formatCurrency(netProceeds) },
      ],
      breakdown: [
        { label: "Purchase Price", value: formatCurrency(v.buyPrice) },
        { label: "Selling Price", value: formatCurrency(v.sellPrice) },
        { label: "Holding Period", value: v.holdYears >= 1 ? `${v.holdYears} years` : `${v.holdYears * 12} months` },
        { label: "Type", value: isLtcg ? "Long Term" : "Short Term" },
        { label: "Tax Rate", value: `${Math.round(taxRate * 100)}%` },
        { label: "Tax Exemption", value: formatCurrency(exemption) },
        { label: "Taxable Gains", value: formatCurrency(taxableGains) },
        { label: "Tax Payable", value: formatCurrency(tax) },
      ],
    }
  },
}

export function CapitalGainsCalculator() { return <CalcShell config={config} /> }
