"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Calculator, ArrowRight, Download, CheckCircle2, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fadeInUp } from "@/lib/animations"

export function SipCalculator() {
  const [showForm, setShowForm] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [tenure, setTenure] = useState(10)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const totalInvestment = monthlyInvestment * 12 * tenure
  const monthlyRate = expectedReturn / 12 / 100
  const totalMonths = tenure * 12
  const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  const estimatedReturns = Math.round(futureValue - totalInvestment)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setShowForm(false)
      setShowResults(true)
    }, 800)
  }

  const handleDownload = () => {
    window.open("/contact", "_self")
  }

  return (
    <section className="bg-gradient-to-br from-secondary via-background to-secondary py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Tool</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            SIP Calculator
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Find out how much your monthly investments can grow over time. Enter your details to get a personalized plan.
          </motion.p>
        </motion.div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm lg:p-10">
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="font-serif text-xl font-bold text-card-foreground text-center">
                    Enter Your Details to See Results
                  </h3>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Your Name</label>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 bg-card"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-card"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Monthly Investment ({formatCurrency(monthlyInvestment)})
                      </label>
                      <input
                        type="range"
                        min="500"
                        max="100000"
                        step="500"
                        value={monthlyInvestment}
                        onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>500</span>
                        <span>1,00,000</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Expected Return ({expectedReturn}%)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="0.5"
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1%</span>
                        <span>30%</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Tenure ({tenure} years)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1 yr</span>
                        <span>30 yrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12 bg-card"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 cursor-pointer h-12 text-base"
                      >
                        Calculate My Wealth
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    We value your privacy. Your information is 100% secure and will never be shared.
                  </p>
                </form>
              </motion.div>
            )}

            {isSubmitted && !showResults && (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <span className="text-lg font-semibold text-foreground">Calculating your wealth plan...</span>
                </motion.div>
              </div>
            )}

            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Wealth Projection</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-card-foreground">
                    Your {formatCurrency(monthlyInvestment)}/month SIP could grow to
                  </h3>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-secondary p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                    <p className="mt-2 font-serif text-2xl font-bold text-foreground">
                      {formatCurrency(totalInvestment)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-primary/5 p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Estimated Returns</p>
                    <p className="mt-2 font-serif text-2xl font-bold text-primary">
                      {formatCurrency(estimatedReturns)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="mt-2 font-serif text-2xl font-bold text-foreground">
                      {formatCurrency(Math.round(futureValue))}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-secondary p-6">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground">Breakdown</h4>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>Monthly SIP: {formatCurrency(monthlyInvestment)}</li>
                        <li>Duration: {tenure} years</li>
                        <li>Expected Return: {expectedReturn}% p.a.</li>
                        <li>Total Investment: {formatCurrency(totalInvestment)}</li>
                        <li>Estimated Returns: {formatCurrency(estimatedReturns)}</li>
                        <li>Maturity Value: {formatCurrency(Math.round(futureValue))}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 cursor-pointer"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                    Get Personalized Plan
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setShowForm(true)
                      setShowResults(false)
                      setIsSubmitted(false)
                    }}
                  >
                    Recalculate
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Mutual Fund investments are subject to market risks. This calculator provides only an estimate and does not guarantee future returns.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
