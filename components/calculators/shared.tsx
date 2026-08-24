"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SliderInput } from "./slider-input"
import { Calculator, BarChart3, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

export interface CalcField {
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  suffix?: string
}

export interface CalcCard {
  label: string
  value: string
  primary?: boolean
}

export interface CalcBreakdown {
  label: string
  value: string
}

export interface TrueWealth {
  maturityValue: number
  totalInvested: number
  gains: number
  holdingYears: number
  taxType: "equity-ltcg" | "equity-stcg" | "bank-fd" | "tax-free"
}

export interface CalcConfig {
  title: string
  description: string
  fields: CalcField[]
  calculate: (values: Record<string, number>) => { cards: CalcCard[]; breakdown: CalcBreakdown[]; trueWealth?: TrueWealth }
}

export function computeTrueWealth(tw: TrueWealth) {
  const INFLATION = 0.06
  const years = Math.max(1, tw.holdingYears)

  let taxRate = 0
  let exemption = 0
  let taxLabel = ""
  let taxNote = ""

  if (tw.taxType === "equity-ltcg") {
    taxRate = 0.125
    exemption = 125000
    taxLabel = "Capital Gains Tax (LTCG @12.5%)"
    taxNote = "Equity held 1+ year"
  } else if (tw.taxType === "equity-stcg") {
    taxRate = years < 1 ? 0.2 : 0.15
    exemption = 0
    taxLabel = `Capital Gains Tax (STCG @${years < 1 ? "20" : "15"}%)`
    taxNote = "Equity held <1 year"
  } else if (tw.taxType === "bank-fd") {
    taxRate = 0.3
    exemption = 0
    taxLabel = "Income Tax on Interest (30% slab)"
    taxNote = "FD/RD interest taxed as income"
  } else if (tw.taxType === "tax-free") {
    taxLabel = "Tax-Free Investment"
    taxNote = "PPF returns are exempt from tax"
  }

  const taxableGains = Math.max(0, tw.gains - exemption)
  const taxPaid = Math.round(taxableGains * taxRate)
  const afterTax = tw.maturityValue - taxPaid
  const inflationFactor = Math.pow(1 + INFLATION, years)
  const purchasingPower = Math.round(afterTax / inflationFactor)
  const realLoss = tw.maturityValue - purchasingPower
  const lossPercent = tw.maturityValue > 0 ? ((realLoss / tw.maturityValue) * 100).toFixed(1) : "0"
  const realReturn = tw.totalInvested > 0 ? (((purchasingPower / tw.totalInvested) - 1) * 100).toFixed(1) : "0"
  const nominalReturn = tw.totalInvested > 0 ? (((tw.maturityValue / tw.totalInvested) - 1) * 100).toFixed(0) : "0"

  const whatCouldBuy = purchasingPower > tw.totalInvested
    ? `Your ₹${(tw.totalInvested / 100000).toFixed(1)}L investment grew, but inflation ate ${lossPercent}% of your gains.`
    : `After tax and inflation, your money hasn't really grown in purchasing power.`

  return { taxPaid, afterTax, purchasingPower, realLoss, inflationFactor, lossPercent, realReturn, nominalReturn, taxLabel, taxNote, whatCouldBuy }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

function formatCompactRupees(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`
  }
  return formatCurrency(value)
}

export { formatCurrency, formatCompactRupees }

export function CalcShell({ config }: { config: CalcConfig }) {
  const [stage, setStage] = useState<"input" | "results" | "contact" | "done">("input")
  const [vals, setVals] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    config.fields.forEach((f) => { init[f.key] = f.default })
    return init
  })
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [honeypot, setHoneypot] = useState("")

  const result = config.calculate(vals)

  const handleCalculate = () => {
    setStage("results")
  }

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) {
      setStage("done")
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const projected = result.cards.find((c) => c.label.toLowerCase().includes("value") || c.label.toLowerCase().includes("maturity") || c.label.toLowerCase().includes("corpus"))
    const parsed = projected?.value ? Number(projected.value.replace(/[^0-9]/g, "")) : undefined
    await api.submitLead({
      source: "sip_calculator",
      name, email, phone,
      projected_value: parsed || undefined,
    })
    setStage("done")
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const setVal = (key: string, v: number) => setVals((prev) => ({ ...prev, [key]: v }))

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 text-center">
        <h2 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">{config.title}</h2>
        <p className="mt-2 text-muted-foreground">{config.description}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm lg:p-10">

        {/* STAGE 1: Input sliders only */}
        <AnimatePresence mode="wait">
          {stage === "input" && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />
              <div className={`grid gap-6 ${config.fields.length > 2 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
                {config.fields.map((f) => (
                  <SliderInput
                    key={f.key}
                    label={f.label}
                    value={vals[f.key]}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    suffix={f.suffix}
                    onChange={(v) => setVal(f.key, v)}
                  />
                ))}
              </div>
              <Button size="lg" className="w-full gap-2 cursor-pointer h-12 text-base" onClick={handleCalculate}>
                Calculate My Wealth <Calculator className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* STAGE 2: Results */}
          {stage === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Results</span>
                </div>
                <h3 className="font-sans text-2xl font-bold text-card-foreground">Here&apos;s What Your Investment Grows To</h3>
              </div>

              <div className={`grid gap-6 ${result.cards.length > 1 ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
                {result.cards.map((c) => (
                  <div key={c.label} className={`rounded-xl border ${c.primary ? "border-primary/20 bg-primary/5" : "border-border bg-secondary"} p-6 text-center`}>
                    <p className="text-sm font-medium text-primary/80">{c.label}</p>
                    <p className={`mt-2 font-sans text-2xl font-bold ${c.primary ? "text-primary" : "text-foreground"}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              {result.breakdown.length > 0 && (
                <div className="rounded-xl border border-border bg-secondary p-6">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground">Full Breakdown</h4>
                      <ul className="mt-2 space-y-1 text-sm text-primary/80">
                        {result.breakdown.map((b) => <li key={b.label}>{b.label}: {b.value}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA: Save Results */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="rounded-xl border border-border bg-secondary p-6 space-y-4">
                  <div className="text-center">
                    <h4 className="font-sans text-lg font-bold text-foreground">Want the full personalized plan?</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enter your details below to save this calculation and get a detailed report on your phone.
                    </p>
                  </div>
                  <form onSubmit={handleSaveResults} className="space-y-4">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary" />
                      <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary" />
                      <input type="tel" placeholder="+91 XXXXX XXXXX" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary" />
                    </div>
                    <Button type="submit" size="lg" className="w-full gap-2 cursor-pointer h-12 text-base">
                      Save My Results <ArrowRight className="h-4 w-4" />
                    </Button>
                    <p className="text-center text-xs text-primary/60">
                      We value your privacy. Your information is 100% secure and will never be shared.
                    </p>
                  </form>
                </div>
              </motion.div>

              <Button size="lg" className="w-full" variant="outline" onClick={() => setStage("input")}>
                Recalculate
              </Button>
            </motion.div>
          )}

          {/* STAGE: Done */}
          {stage === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="font-sans text-2xl font-bold text-foreground">Thank You!</h3>
              <p className="text-muted-foreground">Your results have been saved. We will contact you for a detailed wealth plan.</p>
              <Button size="lg" variant="outline" onClick={() => setStage("input")} className="mt-4">
                Calculate Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
