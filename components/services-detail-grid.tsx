"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  Umbrella,
  GraduationCap,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Globe,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeInUp, staggerContainer } from "@/lib/animations"

interface ServiceItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
  highlights: string[]
  tag: string
}

const services: ServiceItem[] = [
  {
    id: "retirement-planning",
    icon: Umbrella,
    title: "Retirement Planning",
    description:
      "Build a stress-free retirement with tailored income plans, pension solutions, and corpus creation strategies that ensure financial independence in your golden years.",
    highlights: [
      "Retirement Income Planning",
      "Stress-Free Retirement Planning",
      "Financial Freedom Planning",
      "Pension & Retirement Solutions",
      "Retirement Corpus Creation",
      "Secure Retirement Blueprint",
      "Dream Retirement Planning",
    ],
    tag: "Secure Future",
  },
  {
    id: "children-education",
    icon: GraduationCap,
    title: "Children's Education Fund",
    description:
      "Plan ahead for your child's education with smart savings and investment strategies that cover schooling, higher education, and study abroad goals.",
    highlights: [
      "Children's Education Planning",
      "Future Education Fund",
      "Child Wealth Creation Plan",
      "Higher Education Planning",
      "Study Abroad Fund Planning",
      "Smart Parent Financial Planning",
      "Children's Future Security Plan",
      "Education Corpus Creation",
    ],
    tag: "Future Ready",
  },
  {
    id: "legacy-creation",
    icon: Landmark,
    title: "Legacy Creation",
    description:
      "Create generational wealth with structured estate planning, succession strategies, and wealth transfer solutions that preserve your family legacy.",
    highlights: [
      "Legacy Creation Planning",
      "Generational Wealth Planning",
      "Wealth Transfer Planning",
      "Family Legacy Planning",
      "Estate & Succession Planning",
      "Family Wealth Preservation",
      "Leave a Legacy, Not Just Assets",
      "Multi-Generational Wealth Planning",
    ],
    tag: "Generational",
  },
  {
    id: "protection-planning",
    icon: ShieldCheck,
    title: "Protection Planning",
    description:
      "Safeguard your family and income with comprehensive protection planning covering health, life, income, and wealth risks.",
    highlights: [
      "Family Protection Planning",
      "Health Insurance Planning",
      "Income Protection Planning",
      "Financial Risk Management",
      "Wealth Protection Strategies",
    ],
    tag: "Safety First",
  },
  {
    id: "wealth-creation",
    icon: TrendingUp,
    title: "Wealth Creation",
    description:
      "Grow your wealth with disciplined, goal-based investment strategies including long-term planning, SIP building, and financial independence roadmaps.",
    highlights: [
      "Goal-Based Wealth Creation",
      "Long-Term Wealth Planning",
      "SIP Wealth Building",
      "Investment Planning",
      "Financial Independence Planning",
    ],
    tag: "Growth",
  },
  {
    id: "nri-services",
    icon: Globe,
    title: "NRI Services",
    description:
      "Specialized wealth planning for NRIs and global Tamils, covering India investments, retirement planning, and cross-border financial solutions.",
    highlights: [
      "NRI Wealth Planning",
      "NRI Retirement Planning",
      "India Investment Solutions for NRIs",
      "Global Tamil Wealth Planning",
      "Cross-Border Financial Planning",
    ],
    tag: "Global",
  },
]

function ServiceCard({ service, index }: { service: ServiceItem; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      id={service.id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/20"
    >
      {/* Tag */}
      <span className="absolute top-6 right-6 rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
        {service.tag}
      </span>

      {/* Icon */}
      <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-secondary p-4 transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
        <service.icon className="h-6 w-6 text-primary group-hover:text-accent-foreground" />
      </div>

      {/* Title & Description */}
      <h3 className="font-serif text-xl font-bold text-card-foreground lg:text-2xl">
        {service.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {service.description}
      </p>

      {/* Highlights */}
      <div className="mt-5 flex flex-wrap gap-2">
        {service.highlights.map((h) => (
          <span
            key={h}
            className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            {h}
          </span>
        ))}
      </div>

      {/* CTA */}
      <Link href="/contact" className="mt-6 flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80">
        Enquire Now <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  )
}

export function ServicesDetailGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="bg-gradient-to-br from-[#f0f7ff] to-[#d4e6ff] py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Intro */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Comprehensive Financial Services
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Goal-based financial planning services designed to help you retire well, educate your children, protect your family, create wealth, and leave a lasting legacy.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-muted-foreground">
            Need a personalized financial plan?
          </p>
          <Link href="/contact">
            <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 cursor-pointer">
              Talk to Our Consultant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
