"use client"

import { useState } from "react"
import { ArrowDownToLine, BarChart3, CheckCircle2, Send, ShieldCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SliderInput } from "./slider-input"
import { formatCurrency, formatCompactRupees, InflationAwareness } from "./shared"
import { api } from "@/lib/api"

export function SwpLiveCalculator() {
  const [corpus, setCorpus] = useState(5000000) // ₹50 Lakhs
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(30000) // ₹30,000/mo
  const [expectedReturn, setExpectedReturn] = useState(10) // 10% p.a.
  const [tenure, setTenure] = useState(15) // 15 years

  // Form state
  const [leadSaved, setLeadSaved] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simulation of Month-by-Month SWP Balance
  const monthlyRate = expectedReturn / 12 / 100
  const totalMonths = tenure * 12

  let balance = corpus
  let totalWithdrawn = 0
  let totalInterestEarned = 0
  let depletedMonth: number | null = null

  for (let m = 1; m <= totalMonths; m++) {
    if (balance <= 0) {
      if (depletedMonth === null) depletedMonth = m - 1
      break
    }
    // Interest earned in the current month on active balance
    const interest = balance * monthlyRate
    totalInterestEarned += interest
    balance += interest

    // Monthly withdrawal deduction
    if (balance >= monthlyWithdrawal) {
      balance -= monthlyWithdrawal
      totalWithdrawn += monthlyWithdrawal
    } else {
      totalWithdrawn += balance
      balance = 0
      if (depletedMonth === null) depletedMonth = m
      break
    }
  }

  const finalBalance = Math.round(balance)
  const roundedTotalWithdrawn = Math.round(totalWithdrawn)
  const totalValue = roundedTotalWithdrawn + finalBalance
  const netProfit = Math.max(0, totalValue - corpus)

  const isGrowing = finalBalance >= corpus
  const isDepleted = finalBalance === 0

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) {
      setLeadSaved(true)
      return
    }
    setIsSubmitting(true)
    await api.submitLead({
      source: "swp_calculator",
      name,
      email,
      phone,
      monthly_investment: monthlyWithdrawal,
      expected_return: expectedReturn,
      tenure_years: tenure,
      projected_value: totalValue,
    })
    setIsSubmitting(false)
    setLeadSaved(true)
  }

  const withdrawnRatio = totalValue > 0 ? (roundedTotalWithdrawn / totalValue) * 100 : 0
  const remainingRatio = totalValue > 0 ? (finalBalance / totalValue) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: Inputs + CTA */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="space-y-3.5 rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-sm overflow-hidden">
            <h3 className="font-sans text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
              SWP Investment Inputs
            </h3>

            <SliderInput
              label="Total Investment Corpus"
              value={corpus}
              min={100000}
              max={50000000}
              step={50000}
              formatDisplay={(v) => formatCompactRupees(v)}
              onChange={setCorpus}
            />

            <SliderInput
              label="Monthly Withdrawal Amount"
              value={monthlyWithdrawal}
              min={1000}
              max={500000}
              step={1000}
              formatDisplay={(v) => `${formatCurrency(v)}/mo`}
              onChange={setMonthlyWithdrawal}
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

            <SliderInput
              label="Withdrawal Period"
              value={tenure}
              min={1}
              max={35}
              step={1}
              suffix=" yrs"
              formatDisplay={(v) => `${v} years`}
              onChange={setTenure}
            />

            {/* Longevity Indicator Badge */}
            <div className="pt-2 border-t border-border">
              {isGrowing ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 font-medium">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Sustainable: Your corpus is growing even while taking monthly payouts!</span>
                </div>
              ) : isDepleted ? (
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-700 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Corpus depletes in {depletedMonth ? `${Math.floor(depletedMonth / 12)}y ${depletedMonth % 12}m` : `${tenure} years`}. Consider lowering withdrawal.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary font-medium">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span>Safe Plan: Corpus easily sustains all withdrawals for {tenure} years.</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA: below inputs */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm overflow-hidden">
            {!leadSaved ? (
              <form onSubmit={handleSaveLead} className="space-y-2.5">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Get Custom SWP Retirement Plan</h4>
                  <span className="text-xs text-muted-foreground">100% Free & Secure</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                  <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                  <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                </div>
                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 cursor-pointer h-9 text-xs sm:text-sm font-semibold">
                  {isSubmitting ? "Saving..." : "Send Me Detailed SWP Plan"} <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-xs sm:text-sm font-medium">Your personalized SWP retirement report details have been saved!</p>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS PANEL (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5 min-w-0">
          
          {/* Summary Cards */}
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-3 overflow-hidden min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">Total Withdrawn</p>
              <p className="mt-1 font-sans text-base sm:text-lg font-bold text-foreground tracking-tight break-words">
                {formatCurrency(roundedTotalWithdrawn)}
              </p>
              {roundedTotalWithdrawn >= 100000 && (
                <p className="text-xs font-medium text-muted-foreground">{formatCompactRupees(roundedTotalWithdrawn)}</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-3 overflow-hidden min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 truncate">Remaining Balance</p>
              <p className="mt-1 font-sans text-base sm:text-lg font-bold text-emerald-600 tracking-tight break-words">
                {formatCurrency(finalBalance)}
              </p>
              {finalBalance >= 100000 && (
                <p className="text-xs font-medium text-emerald-600/80">{formatCompactRupees(finalBalance)}</p>
              )}
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 shadow-sm overflow-hidden min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary truncate">Total Value Generated</p>
              <p className="mt-1 font-sans text-base sm:text-lg font-bold text-primary tracking-tight break-words">
                {formatCurrency(totalValue)}
              </p>
              {totalValue >= 100000 && (
                <p className="text-xs font-medium text-primary/80">{formatCompactRupees(totalValue)}</p>
              )}
            </div>
          </div>

          {/* Inflation Awareness */}
          <InflationAwareness
            presentValue={monthlyWithdrawal}
            futureValue={totalValue}
            years={tenure}
            variant="withdrawal"
          />

          {/* Visual Ratio Bar */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2 overflow-hidden">
            <div className="flex justify-between text-xs font-medium text-muted-foreground flex-wrap gap-1">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary inline-block shrink-0" /> Total Withdrawn ({withdrawnRatio.toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shrink-0" /> Remaining Balance ({remainingRatio.toFixed(0)}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
              <div className="bg-primary transition-all duration-300 h-full" style={{ width: `${withdrawnRatio}%` }} />
              <div className="bg-emerald-500 transition-all duration-300 h-full" style={{ width: `${remainingRatio}%` }} />
            </div>
          </div>

          {/* Full Breakdown */}
          <div className="rounded-lg border border-border bg-card p-3.5 space-y-2.5 overflow-hidden">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 text-primary shrink-0" />
              SWP Cashflow Breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Initial Corpus:</span>
                <span className="font-semibold text-foreground">{formatCompactRupees(corpus)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Monthly Payout:</span>
                <span className="font-semibold text-foreground">{formatCurrency(monthlyWithdrawal)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Expected Return:</span>
                <span className="font-semibold text-foreground">{expectedReturn}% p.a.</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Net Wealth Profit:</span>
                <span className="font-semibold text-emerald-600">+{formatCompactRupees(netProfit)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
