"use client"

import { useState } from "react"
import { Target, BarChart3, CheckCircle2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SliderInput } from "./slider-input"
import { formatCurrency, formatCompactRupees, InflationAwareness } from "./shared"
import { api } from "@/lib/api"

export function RetirementLiveCalculator() {
  const [targetAmount, setTargetAmount] = useState(10000000) // ₹1 Crore
  const [tenure, setTenure] = useState(15) // 15 years
  const [expectedReturn, setExpectedReturn] = useState(12) // 12% p.a.

  // Form state
  const [leadSaved, setLeadSaved] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Goal calculation logic (inverse SIP compounding)
  const monthlyRate = expectedReturn / 12 / 100
  const totalMonths = tenure * 12
  const fvFactor = ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  
  const requiredMonthlySip = Math.round(targetAmount / fvFactor)
  const totalInvested = requiredMonthlySip * totalMonths
  const estimatedReturns = Math.max(0, targetAmount - totalInvested)

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) {
      setLeadSaved(true)
      return
    }
    setIsSubmitting(true)
    await api.submitLead({
      source: "retirement_calculator",
      name,
      email,
      phone,
      monthly_investment: requiredMonthlySip,
      expected_return: expectedReturn,
      tenure_years: tenure,
      projected_value: targetAmount,
    })
    setIsSubmitting(false)
    setLeadSaved(true)
  }

  const gainsRatio = targetAmount > 0 ? (estimatedReturns / targetAmount) * 100 : 0
  const investedRatio = targetAmount > 0 ? (totalInvested / targetAmount) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: Goal Setter + CTA */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="space-y-3.5 rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-sm overflow-hidden">
            <h3 className="font-sans text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
              Set Your Target Goal
            </h3>

            <SliderInput
              label="Target Wealth Goal (₹)"
              value={targetAmount}
              min={1000000}
              max={100000000}
              step={500000}
              formatDisplay={(v) => formatCompactRupees(v)}
              onChange={setTargetAmount}
            />

            <SliderInput
              label="Time Horizon (Years)"
              value={tenure}
              min={1}
              max={35}
              step={1}
              suffix=" yrs"
              formatDisplay={(v) => `${v} years`}
              onChange={setTenure}
            />

            <SliderInput
              label="Expected Return Rate (p.a.)"
              value={expectedReturn}
              min={1}
              max={30}
              step={0.5}
              suffix="%"
              formatDisplay={(v) => `${v}%`}
              onChange={setExpectedReturn}
            />
          </div>

          {/* CTA: below goal setter */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm overflow-hidden">
            {!leadSaved ? (
              <form onSubmit={handleSaveLead} className="space-y-2.5">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Get Goal Portfolio Roadmap</h4>
                  <span className="text-xs text-muted-foreground">100% Free & Secure</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                  <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                  <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                </div>
                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 cursor-pointer h-9 text-xs sm:text-sm font-semibold">
                  {isSubmitting ? "Saving..." : "Send Me Goal Plan"} <Send className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <p className="text-xs sm:text-sm font-medium">Your goal plan details have been saved!</p>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-7 space-y-3.5 min-w-0">
          
          {/* Main Primary Highlight Card */}
          <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-emerald-500/5 p-4 text-center space-y-1.5 overflow-hidden min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-1.5 truncate">
              <Target className="h-4 w-4 shrink-0" aria-hidden="true" /> Required Monthly Investment
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-primary tracking-tight break-words">
              {formatCurrency(requiredMonthlySip)} <span className="text-sm font-normal text-muted-foreground">/ mo</span>
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Invest <strong className="text-foreground font-semibold">{formatCurrency(requiredMonthlySip)}</strong>/mo for {tenure} yrs at {expectedReturn}% p.a. to reach <strong className="text-primary font-bold">{formatCompactRupees(targetAmount)}</strong>.
            </p>
          </div>

          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-3 overflow-hidden min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">Total Capital Invested</p>
              <p className="mt-1 font-sans text-base sm:text-lg font-bold text-foreground tracking-tight break-words">
                {formatCurrency(totalInvested)}
              </p>
              {totalInvested >= 100000 && (
                <p className="text-xs font-medium text-muted-foreground">{formatCompactRupees(totalInvested)}</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-3 overflow-hidden min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 truncate">Wealth Generated</p>
              <p className="mt-1 font-sans text-base sm:text-lg font-bold text-emerald-600 tracking-tight break-words">
                +{formatCurrency(estimatedReturns)}
              </p>
              {estimatedReturns >= 100000 && (
                <p className="text-xs font-medium text-emerald-600/80">+{formatCompactRupees(estimatedReturns)}</p>
              )}
            </div>
          </div>

          {/* Inflation Awareness */}
          <InflationAwareness
            presentValue={totalInvested}
            futureValue={targetAmount}
            years={tenure}
            variant="goal"
          />

          {/* Visual Ratio Bar */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2 overflow-hidden">
            <div className="flex justify-between text-xs font-medium text-muted-foreground flex-wrap gap-1">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary inline-block shrink-0" /> Your Out-of-Pocket ({investedRatio.toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shrink-0" /> Interest Growth ({gainsRatio.toFixed(0)}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
              <div className="bg-primary transition-all duration-300 h-full" style={{ width: `${investedRatio}%` }} />
              <div className="bg-emerald-500 transition-all duration-300 h-full" style={{ width: `${gainsRatio}%` }} />
            </div>
          </div>

          {/* Goal Breakdown */}
          <div className="rounded-lg border border-border bg-card p-3.5 space-y-2.5 overflow-hidden">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              Goal Breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Target Goal:</span>
                <span className="font-semibold text-foreground">{formatCompactRupees(targetAmount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Time Horizon:</span>
                <span className="font-semibold text-foreground">{tenure} Yrs ({totalMonths}m)</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Return Rate:</span>
                <span className="font-semibold text-foreground">{expectedReturn}% p.a.</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Required Monthly SIP:</span>
                <span className="font-semibold text-primary">{formatCurrency(requiredMonthlySip)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
