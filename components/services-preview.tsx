"use client"

import Link from "next/link"
import { motion, useInView, useMotionValue, useTransform } from "framer-motion"
import { useRef, type MouseEvent } from "react"
import {
  Umbrella,
  GraduationCap,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Globe,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/glow-card"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const services = [
  {
    icon: Umbrella,
    title: "Retirement Planning",
    description: "Build a stress-free retirement with tailored income plans, pension solutions, and corpus creation.",
    tag: "Secure Future",
  },
  {
    icon: GraduationCap,
    title: "Children's Education Fund",
    description: "Plan ahead for your child's education with smart savings and investment strategies.",
    tag: "Future Ready",
  },
  {
    icon: Landmark,
    title: "Legacy Creation",
    description: "Create generational wealth with structured estate planning and succession strategies.",
    tag: "Generational",
  },
  {
    icon: ShieldCheck,
    title: "Protection Planning",
    description: "Safeguard your family and income with comprehensive protection planning.",
    tag: "Safety First",
  },
  {
    icon: TrendingUp,
    title: "Wealth Creation",
    description: "Grow your wealth with disciplined, goal-based investment strategies.",
    tag: "Growth",
  },
  {
    icon: Globe,
    title: "NRI Services",
    description: "Specialized wealth planning for NRIs and global Tamils across borders.",
    tag: "Global",
  },
]

/* ─── 3D tilt wrapper for service cards ─── */
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

export function ServicesPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-[var(--section-cool)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-accent">
            Our Services
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            Goal-Based Financial Planning
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg leading-relaxed text-muted-foreground">
            From retirement planning to children's education, legacy creation, and NRI wealth management — we help you plan every life goal.
          </motion.p>
        </motion.div>

        {/* Services Grid with GlowCard and 3D tilt */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <TiltCard key={service.title} index={i}>
                <GlowCard
                  className="group relative cursor-pointer rounded-xl border border-border/60 bg-white p-7 transition-all duration-500 hover:border-[var(--gold)]/40 hover:shadow-xl hover:shadow-[var(--gold)]/8 h-full"
                  glowColor="rgba(212,175,55,0.18)"
                  glowIntensity={14}
                >
                  {/* Tag */}
                  <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest text-accent/60">
                    {service.tag}
                  </span>
                  {/* Icon with gold hover effect */}
                  <div className="mb-5 inline-flex items-center justify-center rounded-lg bg-[var(--section-navy-soft)] p-3 transition-all duration-500 group-hover:bg-[var(--gold)]/10 group-hover:text-[var(--gold)] group-hover:shadow-sm group-hover:shadow-[var(--gold)]/10">
                    <Icon className="h-5 w-5 text-primary transition-colors duration-500 group-hover:text-[var(--gold)]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-card-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary/80">
                    {service.description}
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
          <Link href="/services">
            <Button variant="outline" size="lg" className="gap-2 cursor-pointer border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              View All Services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
