"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { CheckCircle2, Award, Users, Target, TrendingUp } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from "@/lib/animations"

const values = [
  {
    icon: Target,
    title: "Client-Centric Approach",
    description:
      "Every strategy we recommend is tailored to your unique financial goals, risk appetite, and investment horizon.",
  },
  {
    icon: Award,
    title: "AMFI Registered",
    description:
      "Fully compliant with AMFI guidelines, ensuring transparent and ethical consultancy practices.",
  },
  {
    icon: Users,
    title: "Personalized Guidance",
    description:
      "One-on-one consultations with our consultant to craft bespoke investment strategies for your portfolio.",
  },
  {
    icon: TrendingUp,
    title: "Diverse Product Range",
    description:
      "Access 60+ PMS, 60+ AIFs, global funds, unlisted shares, bonds, insurance, and more from a single window.",
  },
]

const checkpoints = [
  "AMFI Registered Mutual Funds Consultancy Practices",
  "Access to 60+ PMS Strategies",
  "Access to 60+ Alternative Investment Funds",
  "Comprehensive Insurance Solutions",
  "Global Investment Access via LRS & GIFT City",
  "Personalized One-on-One Guidance",
]

export function AboutContent() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const valuesRef = useRef(null)
  const valuesInView = useInView(valuesRef, { once: true, margin: "-80px" })

  return (
    <section className="bg-gradient-to-tr from-[var(--section-warm)] via-white to-[var(--section-navy-soft)] py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Top Section: Text + Image */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: Text */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Our Story
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Building Wealth, One First Step at a Time
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Led by <strong className="text-foreground">Francis J.</strong>, Principal Consultant, First Step Consultancy Services has been guiding
              clients through the complex world of financial markets for over a decade.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              We believe that the right first step in investing can transform your financial
              future. Our mission is to democratize access to premium investment products
              and provide institutional-grade consultancy to individual clients.
            </p>

            {/* Checkpoints */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {checkpoints.map((point, i) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm font-medium text-foreground">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/francis-j.jpeg"
                alt="Francis J., Principal Consultant at First Step Consultancy Services"
                fill
                priority
                className="object-cover"
              />
            </div>
            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 rounded-xl border border-[var(--gold)]/20 bg-white p-5 shadow-xl shadow-[var(--gold)]/10"
            >
              <p className="font-serif text-3xl font-bold text-foreground">
                <AnimatedCounter end={10} suffix="+" />
              </p>
              <p className="text-sm text-primary/80">Years of Excellence</p>
            </motion.div>
            {/* Second floating card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1 }}
              className="absolute -top-4 -right-4 rounded-xl border border-[var(--gold)]/20 bg-white p-5 shadow-xl shadow-[var(--gold)]/10"
            >
              <p className="font-serif text-3xl font-bold text-foreground">
                <AnimatedCounter end={100} suffix="+" />
              </p>
              <p className="text-sm text-primary/80">Happy Clients</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <motion.div
          ref={valuesRef}
          variants={staggerContainer}
          initial="hidden"
          animate={valuesInView ? "visible" : "hidden"}
          className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {values.map((value) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-border/50 bg-white p-8 text-center transition-all duration-500 hover:shadow-lg hover:shadow-[var(--gold)]/8 hover:border-[var(--gold)]/20"
              >
                <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-full bg-primary p-4">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary/80">
                  {value.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
