"use client"

import Link from "next/link"
import { motion, useInView, useMotionValue, useTransform } from "framer-motion"
import { useRef, type MouseEvent } from "react"
import {
  TrendingUp,
  BarChart3,
  Landmark,
  Globe,
  Building2,
  Shield,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/glow-card"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const products = [
  {
    icon: TrendingUp,
    title: "Mutual Funds",
    description: "All AMC schemes across equity, debt, hybrid & thematic categories with goal-based planning.",
    tag: "Popular",
  },
  {
    icon: BarChart3,
    title: "PMS",
    description: "60+ professionally managed portfolio strategies from top-tier PMS providers in India.",
    tag: "Premium",
  },
  {
    icon: Landmark,
    title: "AIF",
    description: "Access 60+ Alternative Investment Funds across Category I, II & III for diversification.",
    tag: "Exclusive",
  },
  {
    icon: Globe,
    title: "Global Investing",
    description: "International markets through LRS, GIFT City, global hedge funds & ETFs via Kristal.",
    tag: "Global",
  },
  {
    icon: Building2,
    title: "Bonds & FDs",
    description: "High-yield corporate bonds up to 10% returns and fixed deposits from top NBFCs.",
    tag: "Stable",
  },
  {
    icon: Shield,
    title: "Insurance",
    description: "Life, health, general, group & business insurance solutions for complete protection.",
    tag: "Protection",
  },
]

/* ─── 3D tilt wrapper for product cards ─── */
function TiltCard({ children, index }: { children: React.ReactNode; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [6, -6])
  const rotateY = useTransform(x, [-100, 100], [-6, 6])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      variants={fadeInUp}
      transition={{ delay: index * 0.12 }}
      className="perspective-[800px]"
    >
      {children}
    </motion.div>
  )
}

export function ProductsPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-[var(--section-warm)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-accent">
            What We Offer
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Comprehensive Investment Solutions
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg leading-relaxed text-muted-foreground">
            From mutual funds to alternative investments, we offer end-to-end wealth
            management tailored to your financial aspirations.
          </motion.p>
        </motion.div>

        {/* Products Grid with GlowCard and 3D tilt */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product, i) => {
            const Icon = product.icon
            return (
              <TiltCard key={product.title} index={i}>
                <GlowCard
                  className="group relative cursor-pointer rounded-xl border border-border/60 bg-white p-7 transition-all duration-500 hover:border-[var(--gold)]/40 hover:shadow-xl hover:shadow-[var(--gold)]/8 h-full"
                  glowColor="rgba(212,175,55,0.18)"
                  glowIntensity={14}
                >
                  {/* Tag */}
                  <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest text-accent/60">
                    {product.tag}
                  </span>
                  {/* Icon with gold hover effect */}
                  <div className="mb-5 inline-flex items-center justify-center rounded-lg bg-[var(--section-navy-soft)] p-3 transition-all duration-500 group-hover:bg-[var(--gold)]/10 group-hover:text-[var(--gold)] group-hover:shadow-sm group-hover:shadow-[var(--gold)]/10">
                    <Icon className="h-5 w-5 text-primary transition-colors duration-500 group-hover:text-[var(--gold)]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-card-foreground">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary/80">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </GlowCard>
              </TiltCard>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Link href="/products">
            <Button variant="outline" size="lg" className="gap-2 cursor-pointer border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              View All 12 Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
