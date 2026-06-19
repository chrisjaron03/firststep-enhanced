"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView, useMotionValue, useTransform } from "framer-motion"
import {
  Globe,
  Plane,
  Landmark,
  PiggyBank,
  Shield,
  ArrowRight,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Wallet,
  FileCheck,
  Briefcase,
  ChevronRight,
  PlaneIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ParticleField } from "@/components/particle-field"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const globalRegions = [
  { region: "Middle East", cities: ["Dubai", "Abu Dhabi", "Doha", "Riyadh", "Kuwait"], count: "5,000+" },
  { region: "North America", cities: ["New York", "Toronto", "San Francisco", "Chicago"], count: "2,500+" },
  { region: "Europe", cities: ["London", "Singapore", "Frankfurt", "Paris"], count: "1,800+" },
  { region: "Asia Pacific", cities: ["Singapore", "Sydney", "Hong Kong", "Kuala Lumpur"], count: "1,200+" },
]

const nriServices = [
  {
    icon: Globe,
    title: "NRI Wealth Planning",
    description: "Comprehensive wealth management strategies designed specifically for NRIs to grow and protect their wealth across borders.",
    features: ["Multi-currency planning", "Repatriation strategy", "Estate structuring"],
  },
  {
    icon: Plane,
    title: "NRI Retirement Planning",
    description: "Plan your return to India with confidence. We help you build a retirement corpus that supports your lifestyle goals.",
    features: ["India return readiness", "Pension optimization", "Post-retirement income"],
  },
  {
    icon: Landmark,
    title: "India Investment Solutions",
    description: "Access India's best investment opportunities including Mutual Funds, PMS, AIF, Bonds, and more from anywhere in the world.",
    features: ["NRI-specific funds", "PIS & demat accounts", "Tax-efficient structures"],
  },
  {
    icon: PiggyBank,
    title: "Global Tamil Wealth Planning",
    description: "Specialized wealth management for the global Tamil community, combining cultural understanding with financial expertise.",
    features: ["Tamil-speaking support", "Family wealth planning", "Community-focused advice"],
  },
  {
    icon: Shield,
    title: "Cross-Border Financial Planning",
    description: "Navigate tax implications, currency fluctuations, and regulatory requirements across multiple jurisdictions.",
    features: ["DTAA optimization", "FEMA compliance", "Currency risk management"],
  },
]

const whyIndia = [
  { label: "GDP Growth", value: "7%+", sub: "Fastest growing major economy" },
  { label: "Market Returns", value: "12%+", sub: "Long-term equity wealth creation" },
  { label: "NRI Investors", value: "35M+", sub: "Global Indians building India wealth" },
  { label: "Remittances", value: "$125B", sub: "India receives the highest globally" },
]

const roadmap = [
  {
    step: "01",
    icon: FileCheck,
    title: "KYC & Account Setup",
    description: "Seamless NRI KYC, bank account, and demat/trading account opening support.",
  },
  {
    step: "02",
    icon: Wallet,
    title: "NRI Investment Planning",
    description: "Build a customized India-focused portfolio aligned with your goals and risk appetite.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Invest & Monitor",
    description: "Execute investments across mutual funds, PMS, AIF, bonds, and more with 24/7 tracking.",
  },
  {
    step: "04",
    icon: Briefcase,
    title: "Repatriation & Review",
    description: "Regular portfolio reviews, tax reporting, and smooth repatriation when you need it.",
  },
]

const faqs = [
  {
    question: "Can NRIs invest in Indian Mutual Funds?",
    answer: "Yes, NRIs can invest in Indian mutual funds through an NRE/NRO bank account after completing KYC. We handle the entire setup including KYC, account opening, and fund selection.",
  },
  {
    question: "What investment options are available for NRIs?",
    answer: "NRIs can invest in mutual funds, PMS, AIFs, bonds, fixed deposits, NPS, direct equity, and real estate. We tailor the mix based on your goals, risk appetite, and tax residency.",
  },
  {
    question: "Are NRI investments taxed in India?",
    answer: "Yes, capital gains and certain incomes are taxed in India. However, DTAA benefits and tax-efficient structures can significantly reduce your tax burden. We provide end-to-end tax guidance.",
  },
  {
    question: "Can I repatriate my India investment gains?",
    answer: "Absolutely. Gains from NRE account investments are fully repatriable. NRO account investments have repatriation limits subject to RBI norms, which we help you navigate.",
  },
  {
    question: "Do you support clients in the Gulf, US, UK, and Singapore?",
    answer: "Yes, we work with NRIs across the Middle East, North America, Europe, and Asia Pacific. We offer virtual consultations and secure online access to your portfolio from anywhere.",
  },
]

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
      transition={{ delay: index * 0.1 }}
      className="perspective-[800px]"
    >
      {children}
    </motion.div>
  )
}

export function NriContent() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <div ref={ref}>
      {/* Global Presence Strip */}
      <section className="relative overflow-hidden bg-primary py-16 lg:py-20">
        <div className="absolute inset-0 opacity-20">
          <ParticleField particleCount={40} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-center"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-chart-1">
              Trusted Worldwide
            </motion.p>
            <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
              Serving NRIs Across the Globe
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {globalRegions.map((region, i) => (
              <motion.div
                key={region.region}
                variants={fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-chart-1/30 hover:bg-primary-foreground/10"
              >
                <p className="font-serif text-3xl font-bold text-chart-1">{region.count}</p>
                <p className="mt-1 text-lg font-semibold text-primary-foreground">{region.region}</p>
                <p className="mt-2 text-xs leading-relaxed text-primary-foreground/60">
                  {region.cities.join(" • ")}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gradient-to-bl from-[#eef6ff] to-[#d4e6ff] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-accent">
              Our Services
            </motion.p>
            <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              NRI Wealth Management
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Whether you are in the Gulf, North America, Europe, or Southeast Asia, we help you stay connected to India&apos;s growth story while managing your global wealth.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {nriServices.map((service, i) => {
              const Icon = service.icon
              return (
                <TiltCard key={service.title} index={i}>
                  <div className="group h-full rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
                    <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-secondary p-4 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-card-foreground">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                    <ul className="mt-5 space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs font-medium text-foreground">
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Why India Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1a30] to-[#1a2744] py-24 lg:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-chart-1">
              Why India Now
            </motion.p>
            <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
              The India Growth Story
            </motion.h2>
            <motion.p variants={fadeInUp} className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/70">
              India is one of the world&apos;s most attractive investment destinations. NRIs are uniquely positioned to participate in this growth.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {whyIndia.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-chart-1/30"
              >
                <p className="font-serif text-4xl font-bold text-chart-1">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-primary-foreground">{stat.label}</p>
                <p className="mt-1 text-xs text-primary-foreground/60">{stat.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="bg-gradient-to-tr from-[#e6f0ff] to-[#bfdbfe] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-accent">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Your NRI Investment Roadmap
            </motion.h2>
          </motion.div>

          <div className="relative mt-16">
            <div className="absolute left-1/2 top-0 hidden h-full w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent lg:block" />
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="relative space-y-12 lg:space-y-0"
            >
              {roadmap.map((item, i) => {
                const Icon = item.icon
                const isLeft = i % 2 === 0
                return (
                  <motion.div
                    key={item.step}
                    variants={fadeInUp}
                    transition={{ delay: i * 0.15 }}
                    className={`relative flex flex-col items-center gap-8 lg:flex-row ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                  >
                    <div className={`flex-1 ${isLeft ? "lg:text-right" : "lg:text-left"}`}>
                      <div className={`inline-block rounded-2xl border border-border bg-card p-6 shadow-sm ${isLeft ? "lg:ml-auto" : ""}`}>
                        <p className="font-serif text-4xl font-bold text-accent/20">{item.step}</p>
                        <h3 className="mt-2 font-serif text-xl font-bold text-card-foreground">{item.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#e6f0ff] bg-accent text-accent-foreground shadow-lg">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 hidden lg:block" />
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-br from-[#f0f7ff] to-[#d4e6ff] py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-accent">
              Common Questions
            </motion.p>
            <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              NRI Investment FAQ
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.2 }}
            className="mt-12 rounded-2xl border border-border bg-card p-2 shadow-sm"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b last:border-b-0 px-4">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a2744] to-[#0f1a30] py-24 lg:py-32">
        <div className="absolute inset-0 opacity-20">
          <ParticleField particleCount={50} />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-chart-1/20">
              <PlaneIcon className="h-8 w-8 text-chart-1" />
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl text-balance">
              Ready to Build Your India Wealth?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/70">
              Book a one-on-one consultation with our NRI specialist. We will design a cross-border wealth plan that works for you — wherever you are.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/contact">
                <Button size="lg" className="bg-chart-1 text-primary-foreground hover:bg-chart-1/90 gap-2 px-8 cursor-pointer">
                  Book NRI Consultation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a
                href="https://wa.me/919894163796?text=Hi%2C%20I%27m%20an%20NRI%20interested%20in%20India%20investment%20consultancy."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 gap-2 px-8 cursor-pointer">
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
