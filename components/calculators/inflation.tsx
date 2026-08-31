"use client"

import { useState } from "react"
import { TrendingDown, TrendingUp, Info, IndianRupee, CalendarRange } from "lucide-react"
import { SliderInput } from "./slider-input"
import { formatCurrency, formatCompactRupees } from "./shared"

const INFLATION_RATE = 6

function futureValueNeeded(present: number, years: number, inflation: number): number {
  return Math.round(present * Math.pow(1 + inflation / 100, years))
}

function presentValueDecay(present: number, years: number, inflation: number): number {
  return Math.round(present / Math.pow(1 + inflation / 100, years))
}

export function InflationCalculator() {
  const [mode, setMode] = useState<"decay" | "need">("decay")
  const [amount, setAmount] = useState(100000)
  const [years, setYears] = useState(10)
  const [inflation, setInflation] = useState(INFLATION_RATE)

  const decayValue = presentValueDecay(amount, years, inflation)
  const needValue = futureValueNeeded(amount, years, inflation)
  const loss = amount - decayValue
  const extraNeeded = needValue - amount
  const lossPercent = amount > 0 ? ((loss / amount) * 100).toFixed(1) : "0"
  const needPercent = amount > 0 ? ((extraNeeded / amount) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("decay")}
          aria-pressed={mode === "decay"}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
            mode === "decay"
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <TrendingDown className="h-4 w-4 shrink-0" />
          <span className="text-left leading-tight">
            Value of ₹ Today
            <span className="block text-xs font-normal opacity-80">after {years} years (decays)</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("need")}
          aria-pressed={mode === "need"}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
            mode === "need"
              ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
              : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <TrendingUp className="h-4 w-4 shrink-0" />
          <span className="text-left leading-tight">
            Need in Future
            <span className="block text-xs font-normal opacity-80">for ₹1L today (grows)</span>
          </span>
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-12 items-start">
        {/* Left: Inputs */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-sm space-y-3.5">
            <h3 className="font-sans text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
              Adjust Inputs
            </h3>

            <SliderInput
              label={mode === "decay" ? "Amount Today (₹)" : "Amount Needed Today (₹)"}
              value={amount}
              min={10000}
              max={10000000}
              step={10000}
              formatDisplay={(v) => formatCompactRupees(v)}
              onChange={setAmount}
            />

            <SliderInput
              label="Time Horizon"
              value={years}
              min={1}
              max={40}
              step={1}
              suffix=" yrs"
              formatDisplay={(v) => `${v} years`}
              onChange={setYears}
            />

            <SliderInput
              label="Inflation Rate (p.a.)"
              value={inflation}
              min={1}
              max={15}
              step={0.5}
              suffix="%"
              formatDisplay={(v) => `${v}% per year`}
              onChange={setInflation}
            />

            <div className="rounded-lg border border-amber-200 bg-amber-500/5 px-3 py-2.5 flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <p className="text-xs leading-snug text-muted-foreground">
                Default inflation is <strong className="text-foreground">{INFLATION_RATE}%</strong> — the long-term average CPI in India. You can adjust it to see different scenarios.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7 space-y-3.5 min-w-0">
          {mode === "decay" ? (
            <>
              {/* Decay hero */}
              <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4 sm:p-5 shadow-sm overflow-hidden">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4" />
                  Purchasing Power After {years} Years
                </p>
                <p className="mt-2 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">
                  {formatCurrency(decayValue)}
                </p>
                <p className="text-xs font-medium text-amber-700/80">{formatCompactRupees(decayValue)} in today&apos;s value</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-card border border-border px-3 py-1 font-medium">
                    Today: <strong>{formatCurrency(amount)}</strong>
                  </span>
                  <span className="rounded-full bg-amber-500/15 border border-amber-200 px-3 py-1 font-semibold text-amber-700">
                    Loss: {formatCurrency(loss)} ({lossPercent}%)
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  At <strong className="text-foreground">{inflation}% inflation</strong>, what costs <strong className="text-foreground">{formatCurrency(amount)}</strong> today will feel like only{" "}
                  <strong className="text-amber-700">{formatCurrency(decayValue)}</strong> in {years} years — inflation erodes purchasing power exponentially.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">You Keep (Real Value)</p>
                  <p className="mt-1 font-sans text-lg font-bold text-foreground">{formatCurrency(decayValue)}</p>
                  <p className="text-xs text-muted-foreground">{((decayValue / amount) * 100).toFixed(1)}% of today</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-500/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Eroded by Inflation</p>
                  <p className="mt-1 font-sans text-lg font-bold text-amber-700">-{formatCurrency(loss)}</p>
                  <p className="text-xs text-amber-700/70">-{lossPercent}%</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Need hero */}
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 sm:p-5 shadow-sm overflow-hidden">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Amount You&apos;ll Need After {years} Years
                </p>
                <p className="mt-2 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700 break-words">
                  {formatCurrency(needValue)}
                </p>
                <p className="text-xs font-medium text-emerald-700/80">{formatCompactRupees(needValue)} to match today&apos;s {formatCompactRupees(amount)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-card border border-border px-3 py-1 font-medium">
                    Today: <strong>{formatCurrency(amount)}</strong>
                  </span>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-200 px-3 py-1 font-semibold text-emerald-700">
                    Extra needed: +{formatCurrency(extraNeeded)} (+{needPercent}%)
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  To buy what <strong className="text-foreground">{formatCurrency(amount)}</strong> buys today, you will need{" "}
                  <strong className="text-emerald-700">{formatCurrency(needValue)}</strong> in {years} years at{" "}
                  <strong className="text-foreground">{inflation}% inflation</strong> — plan your corpus accordingly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today&apos;s Value</p>
                  <p className="mt-1 font-sans text-lg font-bold text-foreground">{formatCurrency(amount)}</p>
                  <p className="text-xs text-muted-foreground">Baseline</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-500/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Future Need</p>
                  <p className="mt-1 font-sans text-lg font-bold text-emerald-700">+{formatCurrency(extraNeeded)}</p>
                  <p className="text-xs text-emerald-700/70">+{needPercent}% more</p>
                </div>
              </div>
            </>
          )}

          {/* Common explainer + year table */}
          <div className="rounded-lg border border-border bg-card p-3.5 space-y-3 overflow-hidden">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm">
              <CalendarRange className="h-4 w-4 text-primary shrink-0" />
              Year-by-Year at {inflation}% Inflation
            </div>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-2 py-1.5 text-left font-semibold">Year</th>
                    <th className="px-2 py-1.5 text-right font-semibold">Real Value (₹{amount.toLocaleString("en-IN")} →)</th>
                    <th className="px-2 py-1.5 text-right font-semibold">Need for ₹{amount.toLocaleString("en-IN")} →</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(years, 12) }, (_, i) => {
                    const y = i + 1
                    // For table we show yearly progression; extend beyond 12 with last row as final
                    const actualYear = years <= 12 ? y : i === 11 ? years : y
                    const dv = presentValueDecay(amount, actualYear, inflation)
                    const nv = futureValueNeeded(amount, actualYear, inflation)
                    const isLast = (years <= 12 && y === years) || (years > 12 && i === 11)
                    return (
                      <tr key={actualYear} className={`border-b border-border/50 ${isLast ? "bg-primary/5 font-semibold" : ""}`}>
                        <td className="px-2 py-1.5">{actualYear}y</td>
                        <td className="px-2 py-1.5 text-right">{formatCurrency(dv)}</td>
                        <td className="px-2 py-1.5 text-right text-emerald-700">{formatCurrency(nv)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {years > 12 && (
                <p className="mt-1.5 text-[11px] text-muted-foreground text-center">Showing years 1–11 and final year {years}.</p>
              )}
            </div>
            <div className="rounded-md bg-secondary/50 border border-border px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Formula:</strong> Real Value = Amount ÷ (1 + {inflation}%)<sup>{years}</sup> &nbsp;•&nbsp; Future Need = Amount × (1 + {inflation}%)<sup>{years}</sup>. Inflation compounds — the gap widens every year, so starting early and investing above inflation is critical.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
