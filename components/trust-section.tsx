"use client"

import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Users, Award, Target, Clock, CheckCircle2 } from "lucide-react"
import { fadeInUp, staggerContainer, fadeInLeft } from "@/lib/animations"

const metrics = [
  { icon: Users, value: 500, suffix: "+", label: "Happy Clients" },
  { icon: Award, value: 10, suffix: "+", label: "Years Experience" },
  { icon: Target, value: 120, suffix: "+", label: "Investment Products" },
  { icon: Clock, value: 24, suffix: "hr", label: "Response Time" },
]

const reasons = [
  "AMFI-Registered Mutual Fund Distributor",
  "SEBI Compliant Advisory Practices",
  "Access to 60+ PMS & 60+ AIF Strategies",
  "Global Investment Access via LRS & GIFT City",
  "Comprehensive Insurance Solutions",
  "Personalized One-on-One Guidance",
]

/* ─── Count-up with spring physics ─── */
function SpringCounter({ end, suffix, isInView }: { end: number; suffix: string; isInView: boolean }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!isInView) return
    const controls = animate(count, end, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
    })
    const unsubscribe = rounded.on("change", (v) => setDisplay(String(v)))
    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [isInView, end, count, rounded])

  return <span>{display}{suffix}</span>
}

/* ─── Animated gradient background ─── */
function AnimatedGradientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          background: [
            "radial-gradient(ellipse 80% 50% at 20% 50%, rgba(212,175,55,0.06) 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 50% at 80% 50%, rgba(197,48,48,0.04) 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 50% at 50% 80%, rgba(212,175,55,0.06) 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 50% at 20% 50%, rgba(212,175,55,0.06) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-background opacity-80" />
    </div>
  )
}

/* ─── Glassmorphism metric card with animated border ─── */
function GlassMetricCard({ metric, index, isInView }: { metric: typeof metrics[0]; index: number; isInView: boolean }) {
  const Icon = metric.icon
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="relative flex flex-col items-center rounded-2xl border border-border/60 bg-white/[0.04] backdrop-blur-xl p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:border-chart-1/30 overflow-hidden group"
    >
      {/* Animated border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, transparent 50%, rgba(197,48,48,0.1) 100%)",
        }}
      />
      <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 p-3">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <p className="font-serif text-4xl font-bold text-foreground">
        <SpringCounter end={metric.value} suffix={metric.suffix} isInView={isInView} />
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">
        {metric.label}
      </p>
    </motion.div>
  )
}

/* ─── Pulsing check icon ─── */
function PulsingCheck({ index, isInView }: { index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      </motion.div>
    </motion.div>
  )
}

export function TrustSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="relative bg-secondary py-24 lg:py-32 overflow-hidden" ref={ref}>
      <AnimatedGradientBg />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          {/* Left - Metrics + Reasons */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Why Choose Us
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              A Trusted Name in Wealth Management
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Led by Francis J., we bring institutional-grade advisory to individual
              investors with a comprehensive suite of investment products.
            </p>

            {/* Checkpoints with pulsing check icons */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {reasons.map((point, i) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <PulsingCheck index={i} isInView={isInView} />
                  <span className="text-sm font-medium text-foreground">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Stats grid with glassmorphism cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-2 gap-6"
          >
            {metrics.map((metric, i) => (
              <GlassMetricCard key={metric.label} metric={metric} index={i} isInView={isInView} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
