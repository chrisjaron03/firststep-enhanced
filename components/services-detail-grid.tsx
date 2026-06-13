"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  TrendingUp,
  BarChart3,
  Landmark,
  Globe,
  Building2,
  CreditCard,
  Banknote,
  Shield,
  Briefcase,
  PiggyBank,
  FileText,
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
  providers: string[]
  tag: string
}

const services: ServiceItem[] = [
  {
    id: "mutual-funds",
    icon: TrendingUp,
    title: "Mutual Funds",
    description:
      "Access all AMC schemes available across equity, debt, hybrid, and thematic categories. We help you select the right fund aligned with your risk profile and financial goals through SIP or lumpsum investments.",
    highlights: ["All AMC Schemes", "SIP & Lumpsum", "Goal-Based Planning", "Tax Saving (ELSS)"],
    providers: ["All major AMC houses available"],
    tag: "Popular",
  },
  {
    id: "pms",
    icon: BarChart3,
    title: "Portfolio Management Services (PMS)",
    description:
      "Professionally managed portfolios from India's top-tier PMS providers. Access strategies with proven track records and experienced fund managers who actively manage your wealth.",
    highlights: ["60+ PMS Strategies", "Top Fund Managers", "Customized Portfolios", "Active Management"],
    providers: [
      "Buoyant Capital (SI: 21.80%)",
      "Negen Capital (SI: 18.55%)",
      "Carnelian Shift (SI: 36.04%)",
      "Burman Capital (SI: 30.10%)",
      "Abakkus (SI: 30.26%)",
      "ICICI Prudential (SI: 13.05%)",
      "Abakkus All Cap (SI: 25.03%)",
    ],
    tag: "Premium",
  },
  {
    id: "aif",
    icon: Briefcase,
    title: "Alternative Investment Funds (AIF)",
    description:
      "Diversify into high-return alternative strategies through Category I, II & III AIFs. Access exclusive funds not available to retail investors, managed by India's best alternative fund managers.",
    highlights: ["60+ AIF Access", "Category I, II & III", "Exclusive Opportunities", "High Alpha"],
    providers: [
      "Carnelian Bharat Amritkaal",
      "Buoyant Capital Opportunities",
      "Motilal Oswal Founders Strategy",
      "Bharat Value Fund Series IV",
      "Transition VC Fund",
      "Mosaic Multiyield Fund Series I",
      "Neo Special Credit Opportunities",
    ],
    tag: "Exclusive",
  },
  {
    id: "unlisted",
    icon: Landmark,
    title: "Unlisted & Pre-IPO Shares",
    description:
      "Get early access to promising companies before they list on the stock exchange. Invest in proven businesses with strong fundamentals at pre-listing valuations for significant wealth creation.",
    highlights: ["Pre-IPO Shares", "Unlisted Equities", "High Growth Potential", "Early Access"],
    providers: [
      "SBI AMC",
      "InCred Holdings",
      "ORBIS",
      "Parag Parikh Financial Advisory Services",
      "NSE",
      "Cochin International Airport Ltd.",
    ],
    tag: "Growth",
  },
  {
    id: "lrs",
    icon: Globe,
    title: "LRS & Global Investing",
    description:
      "Diversify globally through the Liberalised Remittance Scheme. Access international markets with global hedge funds, ETFs, and arbitrage strategies through the Kristal platform.",
    highlights: ["Global Hedge Funds", "International ETFs", "Kristal Platform", "Currency Diversification"],
    providers: [
      "Abans Global Arbitrage Fund",
      "Aravali Global Arbitrage Fund",
      "FengHe Asia (UTSE) Fund",
      "Ginkgo AGT Global Growth Fund",
      "Many more through Kristal",
    ],
    tag: "Global",
  },
  {
    id: "gift-city",
    icon: Building2,
    title: "GIFT City Funds",
    description:
      "Both inbound and outbound investment opportunities through India's premier International Financial Services Centre in GIFT City, Gujarat. Tax-efficient access to global and India-focused strategies.",
    highlights: ["Inbound & Outbound", "Tax Efficient", "Global Exposure", "IFSC Advantage"],
    providers: [
      "Alchemy India Long Term Gift Fund",
      "Carnelian India Amritkaal Gift City Fund",
      "Sage One SCP Gift City Fund",
      "UNIFI India Rangoli Gift City Fund",
      "DSP Global Equity Fund",
      "Ionic Global Innovation Fund",
    ],
    tag: "Tax Smart",
  },
  {
    id: "demat",
    icon: CreditCard,
    title: "Demat & Trading",
    description:
      "Complete demat account and trading services for direct equity investment, IPO applications, pre-IPO investments, and access to Sovereign Gold Bonds and National Pension Scheme.",
    highlights: ["IPO & Pre-IPO", "Sovereign Gold Bonds", "NPS", "Equity Trading"],
    providers: ["Trading", "Depository", "IPO", "Pre-IPO", "Sovereign Gold Bonds", "National Pension Scheme"],
    tag: "Essential",
  },
  {
    id: "fds",
    icon: PiggyBank,
    title: "Fixed Deposits",
    description:
      "Attractive fixed deposit rates from top NBFCs and Small Finance Banks. Secure your capital while earning competitive interest rates higher than traditional bank FDs.",
    highlights: ["Corporate FDs", "Bank FDs", "High Returns", "Capital Safety"],
    providers: [
      "Shriram Finance Limited",
      "LIC Housing Finance",
      "PNB Housing Finance",
      "ICICI Home Finance",
      "Bajaj Finance Limited",
      "Mahindra & Mahindra Financial Services",
      "Suryoday & Unity Small Finance Banks",
    ],
    tag: "Stable",
  },
  {
    id: "bonds",
    icon: FileText,
    title: "Bonds",
    description:
      "Invest in high-quality corporate bonds offering attractive yields with varying maturity profiles. Choose from secured and unsecured options based on your risk appetite and income needs.",
    highlights: ["Up to 10% Returns", "Secured Options", "Regular Income", "Rated Issuers"],
    providers: [
      "NAVI Finserv (10.00%, Mar 2027)",
      "Vivriti Capital (9.86%, Apr 2027)",
      "Oxyzo Financial (9.75%, Feb 2027)",
      "AYE Finance (10.25%, Jun 2027)",
      "Telangana State Infrastructure (9.35%)",
      "Andhra Pradesh Mineral Dev Corp (9.30%)",
    ],
    tag: "Income",
  },
  {
    id: "insurance",
    icon: Shield,
    title: "Insurance Solutions",
    description:
      "Comprehensive insurance solutions covering every aspect of your life and business. From term plans to group covers, we ensure complete financial protection for you and your family.",
    highlights: ["Life & Health", "Business Insurance", "Group Plans", "Personal Accident"],
    providers: [
      "All Life Insurance Products",
      "All Health Insurance Products",
      "All General Insurance Products",
      "Group Health Insurance",
      "Group Term Insurance",
      "Group Personal Accident Insurance",
      "Business Insurance Sec 37(1)",
    ],
    tag: "Protection",
  },
  {
    id: "sgb",
    icon: Banknote,
    title: "Sovereign Gold Bonds",
    description:
      "Government-backed gold investment offering the dual benefit of gold price appreciation and a guaranteed interest of 2.5% per annum. Capital gains exemption on maturity after 8 years.",
    highlights: ["Government Backed", "2.5% Interest", "Capital Gains Exempt", "Sovereign Safety"],
    providers: ["Reserve Bank of India issued", "Available through Demat"],
    tag: "Safe Haven",
  },
  {
    id: "nps",
    icon: BarChart3,
    title: "National Pension Scheme",
    description:
      "Secure your retirement with NPS offering excellent tax benefits under Section 80C and 80CCD(1B), professional fund management, and flexible investment choices across equity and debt.",
    highlights: ["Tax Benefits", "Retirement Security", "Flexible Options", "Professional Management"],
    providers: ["All NPS fund managers available", "Tier I & Tier II accounts"],
    tag: "Retirement",
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

      {/* Providers */}
      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Key Partners / Options
        </p>
        <ul className="space-y-1.5">
          {service.providers.slice(0, 4).map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {p}
            </li>
          ))}
          {service.providers.length > 4 && (
            <li className="text-xs font-medium text-accent">
              + {service.providers.length - 4} more available
            </li>
          )}
        </ul>
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
    <section className="bg-background py-24 lg:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Intro */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <motion.h2 variants={fadeInUp} className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Complete Range of Services
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Every service is backed by our deep market expertise and partnerships with India's leading fund houses, NBFCs, and insurance providers.
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
            {"Can't find what you're looking for?"}
          </p>
          <Link href="/contact">
            <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90 gap-2 cursor-pointer">
              Talk to Our Advisor
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
