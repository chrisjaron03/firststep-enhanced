"use client"

import { useState } from "react"
import { TrendingUp, BarChart3, CheckCircle2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SliderInput } from "./slider-input"
import { formatCurrency, formatCompactRupees } from "./shared"
import { api } from "@/lib/api"

export function LumpsumLiveCalculator() {
  const [investmentAmount, setInvestmentAmount] = useState(100000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [tenure, setTenure] = useState(10)

  // Form state
  const [leadSaved, setLeadSaved] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Compound Interest Calculation
  const futureValue = investmentAmount * Math.pow(1 + expectedReturn / 100, tenure)
  const maturityValue = Math.round(futureValue)
  const totalInvested = Math.round(investmentAmount)
  const estimatedReturns = Math.max(0, maturityValue - totalInvested)

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) {
      setLeadSaved(true)
      return
    }
    setIsSubmitting(true)
    await api.submitLead({
      source: "lumpsum_calculator",
      name,
      email,
      phone,
      expected_return: expectedReturn,
      tenure_years: tenure,
      projected_value: maturityValue,
    })
    setIsSubmitting(false)
    setLeadSaved(true)
  }

  const gainsRatio = maturityValue > 0 ? (estimatedReturns / maturityValue) * 100 : 0
  const investedRatio = maturityValue > 0 ? (totalInvested / maturityValue) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12 items-start">
        
        {/* INPUT PANEL */}
        <div className="lg:col-span-5 space-y-3.5 rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-sm overflow-hidden">
          <h3 className="font-sans text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
            Adjust Your Inputs
          </h3>

          <SliderInput
            label="Total Lump Sum Amount"
            value={investmentAmount}
            min={5000}
            max={5000000}
            step={5000}
            onChange={setInvestmentAmount}
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
            label="Investment Tenure"
            value={tenure}
            min={1}
            max={35}
            step={1}
            suffix=" yrs"
            formatDisplay={(v) => `${v} years`}
            onChange={setTenure}
          />
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-7 space-y-3.5 min-w-0">
          
          {/* Summary Cards */}
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-3 overflow-hidden min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">Initial Deposit</p>
              <p className="mt-1 font-sans text-base sm:text-lg font-bold text-foreground tracking-tight break-words">
                {formatCurrency(totalInvested)}
              </p>
              {totalInvested >= 100000 && (
                <p className="text-xs font-medium text-muted-foreground">{formatCompactRupees(totalInvested)}</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-3 overflow-hidden min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 truncate">Est. Returns</p>
              <p className="mt-1 font-sans text-base sm:text-lg font-bold text-emerald-600 tracking-tight break-words">
                +{formatCurrency(estimatedReturns)}
              </p>
              {estimatedReturns >= 100000 && (
                <p className="text-xs font-medium text-emerald-600/80">+{formatCompactRupees(estimatedReturns)}</p>
              )}
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 shadow-sm overflow-hidden min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary truncate">Total Value</p>
              <p className="mt-1 font-sans text-base sm:text-lg font-bold text-primary tracking-tight break-words">
                {formatCurrency(maturityValue)}
              </p>
              {maturityValue >= 100000 && (
                <p className="text-xs font-medium text-primary/80">{formatCompactRupees(maturityValue)}</p>
              )}
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2 overflow-hidden">
            <div className="flex justify-between text-xs font-medium text-muted-foreground flex-wrap gap-1">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary inline-block shrink-0" /> Deposit ({investedRatio.toFixed(0)}%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shrink-0" /> Growth ({gainsRatio.toFixed(0)}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
              <div className="bg-primary transition-all duration-300 h-full" style={{ width: `${investedRatio}%` }} />
              <div className="bg-emerald-500 transition-all duration-300 h-full" style={{ width: `${gainsRatio}%` }} />
            </div>
          </div>

          {/* Full Breakdown */}
          <div className="rounded-lg border border-border bg-card p-3.5 space-y-2.5 overflow-hidden">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              Breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Lump Sum Amount:</span>
                <span className="font-semibold text-foreground">{formatCurrency(investmentAmount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Return Rate:</span>
                <span className="font-semibold text-foreground">{expectedReturn}% p.a.</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Tenure:</span>
                <span className="font-semibold text-foreground">{tenure} Years</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Multiplier Effect:</span>
                <span className="font-semibold text-emerald-600">{(maturityValue / totalInvested).toFixed(2)}x growth</span>
              </div>
            </div>
          </div>

          {/* SAVE REPORT FORM */}
          <div className="rounded-lg border border-border bg-card p-3.5 overflow-hidden">
            {!leadSaved ? (
              <form onSubmit={handleSaveLead} className="space-y-2.5">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">Save Calculation & Get Wealth Plan</h4>
                  <span className="text-xs text-muted-foreground">100% Free & Secure</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                  <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                  <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                </div>
                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 cursor-pointer h-9 text-xs sm:text-sm font-semibold">
                  {isSubmitting ? "Saving..." : "Send Me Custom Plan"} <Send className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <p className="text-xs sm:text-sm font-medium">Your lump sum calculation report has been saved!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
