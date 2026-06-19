"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Globe, Plane, Landmark, PiggyBank, Shield, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const services = [
  {
    icon: Globe,
    title: "NRI Wealth Planning",
    description: "Comprehensive wealth management strategies designed specifically for NRIs to grow and protect their wealth across borders.",
  },
  {
    icon: Plane,
    title: "NRI Retirement Planning",
    description: "Plan your return to India with confidence. We help you build a retirement corpus that supports your lifestyle goals.",
  },
  {
    icon: Landmark,
    title: "India Investment Solutions",
    description: "Access India's best investment opportunities including Mutual Funds, PMS, AIF, Bonds, and more from anywhere in the world.",
  },
  {
    icon: PiggyBank,
    title: "Global Tamil Wealth Planning",
    description: "Specialized wealth management for the global Tamil community, combining cultural understanding with financial expertise.",
  },
  {
    icon: Shield,
    title: "Cross-Border Financial Planning",
    description: "Navigate tax implications, currency fluctuations, and regulatory requirements across multiple jurisdictions.",
  },
]

const benefits = [
  "Dedicated NRI Relationship Manager",
  "Seamless KYC & Account Opening",
  "Tax-Efficient Investment Strategies",
  "Regular Portfolio Reviews",
  "Secure Online Access 24/7",
  "Global Expertise, Local Understanding",
]

export function NriContent() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="bg-background py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            NRI Wealth Management
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Whether you are in the Gulf, North America, Europe, or Southeast Asia, we help you stay connected to India&apos;s growth story while managing your global wealth.
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
              >
                <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-secondary p-4 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="font-serif text-xl font-bold text-card-foreground">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Benefits */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-24"
        >
          <div className="mx-auto max-w-3xl">
            <motion.h3 variants={fadeInUp} className="text-center font-serif text-2xl font-bold text-foreground sm:text-3xl">
              Why NRIs Choose Us
            </motion.h3>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  variants={fadeInUp}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-lg text-muted-foreground">
            Ready to manage your wealth across borders?
          </p>
          <Link href="/contact">
            <Button size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 cursor-pointer">
              Talk to Our NRI Advisor
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
