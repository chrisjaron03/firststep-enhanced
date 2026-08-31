"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, PiggyBank, Target, Calculator, ArrowDownToLine, ChevronRight, IndianRupee } from "lucide-react"
import { SipStepUpLiveCalculator } from "@/components/calculators/sip-stepup-live"
import { LumpsumLiveCalculator } from "@/components/calculators/lumpsum-live"
import { RetirementLiveCalculator } from "@/components/calculators/retirement-live"
import { SwpLiveCalculator } from "@/components/calculators/swp-live"
import { InflationCalculator } from "@/components/calculators/inflation"

type CalcId = "sip" | "lumpsum" | "retirement" | "swp" | "inflation"

interface CalcItem {
  id: CalcId
  title: string
  subtitle: string
  badge: string
  icon: typeof TrendingUp
}

const CALCULATORS: CalcItem[] = [
  {
    id: "sip",
    title: "SIP & Step-Up",
    subtitle: "Monthly SIP with annual increase (% or ₹)",
    badge: "Popular",
    icon: TrendingUp,
  },
  {
    id: "lumpsum",
    title: "Lump Sum",
    subtitle: "One-time investment growth multiplier",
    badge: "Growth",
    icon: PiggyBank,
  },
  {
    id: "retirement",
    title: "Goal & Retirement",
    subtitle: "Calculate monthly SIP for target wealth",
    badge: "Target",
    icon: Target,
  },
  {
    id: "swp",
    title: "SWP (Withdrawal)",
    subtitle: "Systematic monthly income & longevity",
    badge: "Income",
    icon: ArrowDownToLine,
  },
  {
    id: "inflation",
    title: "Inflation Impact",
    subtitle: "₹1 Lakh today vs future — 6% inflation",
    badge: "New",
    icon: IndianRupee,
  },
]

export function CalculatorsHub() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const paramCalc = searchParams.get("calc") as CalcId
  const [activeCalc, setActiveCalc] = useState<CalcId>(
    paramCalc && CALCULATORS.some(c => c.id === paramCalc) ? paramCalc : "sip"
  )

  useEffect(() => {
    const calc = searchParams.get("calc") as CalcId
    if (calc && CALCULATORS.some(c => c.id === calc)) {
      setActiveCalc(calc)
    }
  }, [searchParams])

  const selectCalc = (id: CalcId) => {
    setActiveCalc(id)
    router.push(`/calculators?calc=${id}`, { scroll: false })
  }

  return (
    <section className="bg-[var(--section-warm)] pt-4 pb-8 lg:pt-6 lg:pb-8" aria-label="Financial Calculators Hub">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-4">
        
        {/* COMPACT TOP BAR */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
                Financial Calculators
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Tweak investment inputs live with real-time projections
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card border border-border/60 px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" /> Live Projections
          </div>
        </div>

        {/* MAIN LAYOUT WITH SIDEBAR */}
        <div className="grid gap-3 lg:grid-cols-12 items-start">
          
          {/* DESKTOP & MOBILE SIDEBAR (3 Cols on lg screen) */}
          <aside className="lg:col-span-4 xl:col-span-3" aria-label="Calculator Selection">
            <div className="bg-card rounded-xl border border-border p-2 sm:p-3 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1.5 sm:gap-2">
                {CALCULATORS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeCalc === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => selectCalc(item.id)}
                      aria-pressed={isActive}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-center gap-2.5 relative group ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-xs text-foreground ring-1 ring-primary/20"
                          : "border-border/60 bg-background/50 hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full hidden lg:block"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}

                      <div className={`p-2 rounded-md shrink-0 transition-colors ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-foreground"
                      }`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-semibold text-xs sm:text-sm truncate ${isActive ? "text-primary font-bold" : "text-foreground"}`}>
                            {item.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 hidden lg:block">
                          {item.subtitle}
                        </p>
                      </div>

                      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform hidden lg:block ${
                        isActive ? "text-primary translate-x-0.5" : "text-muted-foreground/30 group-hover:text-muted-foreground"
                      }`} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* MAIN CALCULATOR CONTENT (9 Cols on lg screen) */}
          <main className="lg:col-span-8 xl:col-span-9 bg-card rounded-xl border border-border p-3 sm:p-4 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCalc}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {activeCalc === "sip" && <SipStepUpLiveCalculator />}
                {activeCalc === "lumpsum" && <LumpsumLiveCalculator />}
                {activeCalc === "retirement" && <RetirementLiveCalculator />}
                {activeCalc === "swp" && <SwpLiveCalculator />}
                {activeCalc === "inflation" && <InflationCalculator />}
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </section>
  )
}

