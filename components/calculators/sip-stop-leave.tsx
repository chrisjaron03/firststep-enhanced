"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, BarChart3, Calculator, ArrowRight, CheckCircle2, PauseCircle, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { SliderInput } from "./slider-input"

export function SipStopLeaveCalculator() {
  const [stage, setStage] = useState<"input" | "results" | "done">("input")
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [investYears, setInvestYears] = useState(10)
  const [growYears, setGrowYears] = useState(10)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [honeypot, setHoneypot] = useState("")

  const monthlyRate = expectedReturn / 12 / 100
  const annualRate = expectedReturn / 100
  const investMonths = investYears * 12

  const corpusAtStop = monthlyInvestment * ((Math.pow(1 + monthlyRate, investMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  const finalCorpus = corpusAtStop * Math.pow(1 + annualRate, growYears)
  const totalInvested = monthlyInvestment * investMonths
  const growthAfterStop = Math.round(finalCorpus - corpusAtStop)
  const estimatedReturns = Math.round(finalCorpus - totalInvested)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)

  const handleCalculate = () => setStage("results")

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) { setStage("done"); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    await api.submitLead({
      source: "sip_calculator",
      name, email, phone,
      monthly_investment: monthlyInvestment,
      expected_return: expectedReturn,
      tenure_years: investYears + growYears,
      projected_value: Math.round(finalCorpus),
    })
    setStage("done")
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 text-center">
        <h2 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">SIP Stop & Leave</h2>
        <p className="mt-2 text-muted-foreground">Invest for a set period, then stop and let your corpus grow further</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm lg:p-10">
        <AnimatePresence mode="wait">
          {stage === "input" && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
              <form onSubmit={(e) => { e.preventDefault(); handleCalculate() }} className="space-y-6">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />

                <SliderInput
                  label="Monthly Investment"
                  value={monthlyInvestment}
                  min={500}
                  max={100000}
                  step={500}
                  onChange={setMonthlyInvestment}
                />

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

                <div className="grid gap-6 sm:grid-cols-2">
                  <SliderInput
                    label="Investment Period"
                    value={investYears}
                    min={1}
                    max={30}
                    step={1}
                    suffix=" yrs"
                    formatDisplay={(v) => `${v} years`}
                    onChange={setInvestYears}
                  />
                  <SliderInput
                    label="Growth Period (after stopping)"
                    value={growYears}
                    min={0}
                    max={30}
                    step={1}
                    suffix=" yrs"
                    formatDisplay={(v) => `${v} years`}
                    onChange={setGrowYears}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gap-2 cursor-pointer h-12 text-base">
                  Calculate My Wealth <Calculator className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          )}

          {stage === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Wealth Journey</span>
                </div>
                <h3 className="font-sans text-2xl font-bold text-card-foreground">Your {formatCurrency(monthlyInvestment)}/month SIP could grow to</h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-secondary p-6 text-center">
                  <p className="text-sm font-medium text-primary/80">Total Invested</p>
                  <p className="mt-2 font-sans text-2xl font-bold text-foreground">{formatCurrency(totalInvested)}</p>
                </div>
                <div className="rounded-xl border border-border bg-primary/5 p-6 text-center">
                  <p className="text-sm font-medium text-primary/80">Corpus When You Stopped</p>
                  <p className="mt-2 font-sans text-2xl font-bold text-primary">{formatCurrency(Math.round(corpusAtStop))}</p>
                  <p className="text-xs text-primary/60 mt-1">After {investYears} years of investing</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary p-6 text-center">
                  <p className="text-sm font-medium text-primary/80">Final Corpus</p>
                  <p className="mt-2 font-sans text-2xl font-bold text-foreground">{formatCurrency(Math.round(finalCorpus))}</p>
                  <p className="text-xs text-muted-foreground mt-1">After {growYears} years of growth</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary p-6">
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">Full Breakdown</h4>
                    <ul className="mt-2 space-y-1 text-sm text-primary/80">
                      <li>Monthly SIP: {formatCurrency(monthlyInvestment)}</li>
                      <li>Investment Period: {investYears} years</li>
                      <li>Growth Period (no contributions): {growYears} years</li>
                      <li>Total Time: {investYears + growYears} years</li>
                      <li>Expected Return: {expectedReturn}% p.a.</li>
                      <li>Total Invested: {formatCurrency(totalInvested)}</li>
                      <li>Value When Stopped: {formatCurrency(Math.round(corpusAtStop))}</li>
                      <li>Growth After Stopping: {formatCurrency(growthAfterStop)}</li>
                      <li>Final Value: {formatCurrency(Math.round(finalCorpus))}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Visual timeline */}
              <div className="rounded-xl border border-border bg-secondary p-6">
                <h4 className="font-semibold text-foreground mb-4">Your Investment Timeline</h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20" />
                  <div className="space-y-6">
                    <div className="relative pl-10">
                      <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-primary" />
                      <p className="text-sm font-medium text-foreground">Start Investing</p>
                      <p className="text-xs text-muted-foreground">₹{formatCurrency(monthlyInvestment)}/month for {investYears} years</p>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-amber-500" />
                      <div className="flex items-center gap-2">
                        <PauseCircle className="h-4 w-4 text-amber-500" />
                        <p className="text-sm font-medium text-foreground">Stop Investing</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Corpus: {formatCurrency(Math.round(corpusAtStop))} — Let it grow</p>
                    </div>
                    <div className="relative pl-10">
                      <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-green-500" />
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-medium text-foreground">Maturity</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Final Corpus: {formatCurrency(Math.round(finalCorpus))}</p>
                    </div>
                  </div>
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
