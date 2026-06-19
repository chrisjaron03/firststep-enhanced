"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { MessageSquare, Search, Target, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Discovery Call",
    description:
      "We start with a no-obligation consultation to understand your financial goals, risk appetite, investment horizon, and current portfolio.",
  },
  {
    icon: Search,
    step: "02",
    title: "In-Depth Analysis",
    description:
      "Our team performs a thorough analysis of your existing investments and identifies gaps and opportunities for wealth optimization.",
  },
  {
    icon: Target,
    step: "03",
    title: "Tailored Strategy",
    description:
      "We craft a personalized investment strategy leveraging our comprehensive product suite of 12+ options across MF, PMS, AIF, Bonds & more.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Ongoing Management",
    description:
      "Regular portfolio reviews, rebalancing, and proactive recommendations to ensure your investments stay aligned with your evolving goals.",
  },
]

export function ProcessTimeline() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="bg-secondary py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-accent">
            Our Process
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            How We Work With You
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A proven four-step process designed to transform your financial aspirations into reality.
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 bottom-0 hidden w-px bg-border lg:left-1/2 lg:block" />

          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isEven = i % 2 === 0
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-16 ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isEven ? "lg:text-right" : "lg:text-left"}`}>
                    <div className={`rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg ${isEven ? "lg:ml-auto lg:mr-0" : "lg:mr-auto lg:ml-0"} max-w-lg`}>
                      <span className="text-xs font-bold uppercase tracking-widest text-accent">
                        Step {step.step}
                      </span>
                      <h3 className="mt-2 font-serif text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center icon */}
                  <div className="absolute left-0 hidden h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-accent text-accent-foreground lg:relative lg:left-auto lg:flex lg:shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Spacer */}
                  <div className="hidden flex-1 lg:block" />
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <Link href="/contact">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 cursor-pointer">
              Start Your Journey Today
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
