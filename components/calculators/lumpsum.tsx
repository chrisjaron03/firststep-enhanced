"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PiggyBank, BarChart3, Calculator, ShieldCheck, TrendingDown, AlertTriangle, Zap, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { computeTrueWealth, type TrueWealth } from "./shared"
import { SliderInput } from "./slider-input"

export function LumpsumCalculator() {
  const [stage, setStage] = useState<"input" | "results" | "done">("input")
  const [investment, setInvestment] = useState(100000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [tenure, setTenure] = useState(10)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [honeypot, setHoneypot] = useState("")

  const rate = expectedReturn / 100
  const futureValue = investment * Math.pow(1 + rate, tenure)
  const estimatedReturns = Math.round(futureValue - investment)
  const totalInvestment = investment

  const trueWealthData: TrueWealth = {
    maturityValue: Math.round(futureValue),
    totalInvested: totalInvestment,
    gains: estimatedReturns,
    holdingYears: tenure,
    taxType: tenure >= 1 ? "equity-ltcg" : "equity-stcg",
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)

  const handleCalculate = () => setStage("results")

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) { setStage("done"); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    await api.submitLead({
      source: "sip_calculator",
      name, email, phone,
      projected_value: Math.round(futureValue),
    })
    setStage("done")
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const tw = trueWealthData
  const t = computeTrueWealth(tw)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 text-center">
        <h2 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">Lump Sum Calculator</h2>
        <p className="mt-2 text-muted-foreground">See how a one-time investment can grow over time</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm lg:p-10">
        <AnimatePresence mode="wait">
          {stage === "input" && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={(e) => { e.preventDefault(); handleCalculate() }} className="space-y-6">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />

                <SliderInput
                  label="Lump Sum Investment"
                  value={investment}
                  min={10000}
                  max={10000000}
                  step={10000}
                  onChange={setInvestment}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <SliderInput
                    label="Expected Return"
                    value={expectedReturn}
                    min={1}
                    max={30}
                    step={0.5}
                    suffix="%"
                    formatDisplay={(v) => `${v}%`}
                    onChange={setExpectedReturn}
                  />
                  <SliderInput
                    label="Tenure"
                    value={tenure}
                    min={1}
                    max={30}
                    step={1}
                    suffix=" yrs"
                    formatDisplay={(v) => `${v} years`}
                    onChange={setTenure}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gap-2 cursor-pointer h-12 text-base">
                  Calculate <Calculator className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          )}

          {stage === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Wealth Projection</span>
                </div>
                <h3 className="font-sans text-2xl font-bold text-card-foreground">Your Lump Sum could grow to</h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-secondary p-6 text-center">
                  <p className="text-sm font-medium text-primary/80">Invested</p>
                  <p className="mt-2 font-sans text-2xl font-bold text-foreground">{formatCurrency(totalInvestment)}</p>
                </div>
                <div className="rounded-xl border border-border bg-primary/5 p-6 text-center">
                  <p className="text-sm font-medium text-primary/80">Estimated Returns</p>
                  <p className="mt-2 font-sans text-2xl font-bold text-primary">{formatCurrency(estimatedReturns)}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary p-6 text-center">
                  <p className="text-sm font-medium text-primary/80">Total Value</p>
                  <p className="mt-2 font-sans text-2xl font-bold text-foreground">{formatCurrency(Math.round(futureValue))}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary p-6">
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">Full Breakdown</h4>
                    <ul className="mt-2 space-y-1 text-sm text-primary/80">
                      <li>One-time Investment: {formatCurrency(investment)}</li>
                      <li>Duration: {tenure} years</li>
                      <li>Expected Return: {expectedReturn}% p.a.</li>
                      <li>Maturity Value: {formatCurrency(Math.round(futureValue))}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* TRUE WEALTH */}
              <div className="rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-red-500/5 p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-500/10 p-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="w-full">
                    <h4 className="font-sans text-xl font-bold text-foreground">The Reality Check</h4>
                    <p className="mt-1 text-sm text-muted-foreground">The calculator shows you one number. Here&apos;s what your money <em>actually</em> buys.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-secondary/50 border border-border p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">What the calculator says</p>
                    <p className="font-sans text-3xl font-bold text-foreground">{formatCurrency(tw.maturityValue)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t.nominalReturn}% total return on {formatCurrency(tw.totalInvested)}</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3"><Zap className="inline h-3 w-3 mr-1" />What it&apos;s actually worth</p>
                    <p className="font-sans text-3xl font-bold text-primary">{formatCurrency(t.purchasingPower)}</p>
                    <p className="mt-1 text-xs text-primary/70">Real return: {t.realReturn}% after tax & inflation</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-red-600">{t.taxLabel}</p>
                        <p className="text-xs text-red-500/70">{t.taxNote}</p>
                      </div>
                      <p className="font-sans text-lg font-bold text-red-600">-{formatCurrency(t.taxPaid)}</p>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-amber-500/5 border border-amber-500/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-amber-600"><TrendingDown className="inline h-3 w-3 mr-1" />Inflation Erosion (6% p.a.)</p>
                        <p className="text-xs text-amber-500/70">Purchasing power lost over {tw.holdingYears}yr</p>
                      </div>
                      <p className="font-sans text-lg font-bold text-amber-600">-{formatCurrency(Math.round(tw.maturityValue - t.purchasingPower))}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 p-5 text-center">
                  <p className="text-sm text-muted-foreground">{t.whatCouldBuy}</p>
                  <p className="mt-2 font-sans text-xs text-muted-foreground/80">That&apos;s {t.lossPercent}% of your maturity value lost to the combined effect of taxes and rising prices.</p>
                </div>
              </div>

              {/* Contact form */}
              <div className="rounded-xl border border-border bg-secondary p-6 space-y-4">
                <div className="text-center">
                  <h4 className="font-sans text-lg font-bold text-foreground">Want the full personalized plan?</h4>
                  <p className="mt-1 text-sm text-muted-foreground">Enter your details to save this calculation and get a detailed report on your phone.</p>
                </div>
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary" />
                    <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary" />
                    <input type="tel" placeholder="+91 XXXXX XXXXX" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary" />
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2 cursor-pointer h-12 text-base">
                    Save My Results <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-center text-xs text-primary/60">We value your privacy. Your information is 100% secure and will never be shared.</p>
                </form>
              </div>

              <Button size="lg" className="w-full" variant="outline" onClick={() => setStage("input")}>
                Recalculate
              </Button>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="font-sans text-2xl font-bold text-foreground">Thank You!</h3>
              <p className="text-muted-foreground">Your results have been saved. We will contact you for a detailed wealth plan.</p>
              <Button size="lg" variant="outline" onClick={() => setStage("input")} className="mt-4">Calculate Again</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
