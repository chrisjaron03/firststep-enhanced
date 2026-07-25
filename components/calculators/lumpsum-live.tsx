"use client"

import { useState } from "react"
import { TrendingUp, BarChart3, AlertTriangle, Zap, CheckCircle2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SliderInput } from "./slider-input"
import { computeTrueWealth, formatCurrency, formatCompactRupees, type TrueWealth } from "./shared"
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

  const trueWealthData: TrueWealth = {
    maturityValue,
    totalInvested,
    gains: estimatedReturns,
    holdingYears: tenure,
    taxType: tenure >= 1 ? "equity-ltcg" : "equity-stcg",
  }

  const tw = computeTrueWealth(trueWealthData)

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
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
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
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">Initial Deposit</p>
              <p className="mt-0.5 font-sans text-sm sm:text-base font-bold text-foreground tracking-tight break-words">
                {formatCurrency(totalInvested)}
              </p>
              {totalInvested >= 100000 && (
                <p className="text-[10px] font-medium text-muted-foreground">{formatCompactRupees(totalInvested)}</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-3 overflow-hidden min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 truncate">Est. Returns</p>
              <p className="mt-0.5 font-sans text-sm sm:text-base font-bold text-emerald-600 tracking-tight break-words">
                +{formatCurrency(estimatedReturns)}
              </p>
              {estimatedReturns >= 100000 && (
                <p className="text-[10px] font-medium text-emerald-600/80">+{formatCompactRupees(estimatedReturns)}</p>
              )}
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 shadow-sm overflow-hidden min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary truncate">Total Value</p>
              <p className="mt-0.5 font-sans text-sm sm:text-base font-bold text-primary tracking-tight break-words">
                {formatCurrency(maturityValue)}
              </p>
              {maturityValue >= 100000 && (
                <p className="text-[10px] font-medium text-primary/80">{formatCompactRupees(maturityValue)}</p>
              )}
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="rounded-lg border border-border bg-card p-2.5 space-y-1.5 overflow-hidden">
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground flex-wrap gap-1">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary inline-block shrink-0" /> Deposit ({investedRatio.toFixed(0)}%)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block shrink-0" /> Growth ({gainsRatio.toFixed(0)}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden flex">
              <div className="bg-primary transition-all duration-300 h-full" style={{ width: `${investedRatio}%` }} />
              <div className="bg-emerald-500 transition-all duration-300 h-full" style={{ width: `${gainsRatio}%` }} />
            </div>
          </div>

          {/* SIDE-BY-SIDE BREAKDOWN & REALITY CHECK */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            
            {/* Full Breakdown */}
            <div className="rounded-lg border border-border bg-card p-3 space-y-2 overflow-hidden">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <BarChart3 className="h-3.5 w-3.5 text-primary shrink-0" />
                Breakdown
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                <div className="text-muted-foreground truncate">Lump Sum Amount:</div>
                <div className="font-semibold text-right text-foreground truncate">{formatCurrency(investmentAmount)}</div>
                <div className="text-muted-foreground truncate">Return Rate:</div>
                <div className="font-semibold text-right text-foreground truncate">{expectedReturn}% p.a.</div>
                <div className="text-muted-foreground truncate">Tenure:</div>
                <div className="font-semibold text-right text-foreground truncate">{tenure} Years</div>
                <div className="text-muted-foreground truncate">Multiplier Effect:</div>
                <div className="font-semibold text-right text-emerald-600 truncate">{(maturityValue / totalInvested).toFixed(2)}x growth</div>
              </div>
            </div>

            {/* REALITY CHECK */}
            <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-red-500/5 p-3 space-y-2 overflow-hidden">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                Reality Check (Inflation & Tax)
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Nominal:</span>
                  <span className="font-semibold text-foreground">{formatCompactRupees(maturityValue)}</span>
                </div>
                <div className="flex justify-between items-center bg-primary/10 px-2 py-0.5 rounded text-primary font-semibold">
                  <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> Real Power:</span>
                  <span>{formatCompactRupees(tw.purchasingPower)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-right leading-tight">
                  After 6% inflation & LTCG Tax
                </p>
              </div>
            </div>

          </div>

          {/* SAVE REPORT FORM */}
          <div className="rounded-lg border border-border bg-card p-3 overflow-hidden">
            {!leadSaved ? (
              <form onSubmit={handleSaveLead} className="space-y-2">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] h-px w-px opacity-0" />
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-xs text-foreground">Save Calculation & Get Wealth Plan</h4>
                  <span className="text-[10px] text-muted-foreground">100% Free & Secure</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-[11px] outline-none focus:border-primary" />
                  <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-[11px] outline-none focus:border-primary" />
                  <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-[11px] outline-none focus:border-primary" />
                </div>
                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 cursor-pointer h-8 text-[11px] font-semibold">
                  {isSubmitting ? "Saving..." : "Send Me Custom Plan"} <Send className="h-3 w-3" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-md">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <p className="text-xs font-medium">Your lump sum calculation report has been saved!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
