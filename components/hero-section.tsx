"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, TrendingUp, Shield, Award, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedCounter } from "@/components/animated-counter"
import { ParticleField } from "@/components/particle-field"
import { FloatingShapes } from "@/components/floating-shapes"
import { MagneticButton } from "@/components/magnetic-button"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { useRef } from "react"

const stats = [
  { label: "PMS Strategies", value: 60, suffix: "+" },
  { label: "AIF Access", value: 60, suffix: "+" },
  { label: "Product Categories", value: 12, suffix: "+" },
  { label: "Years of Trust", value: 10, suffix: "+" },
]

/* ─── Text shimmer component for the word "Investing" ─── */
function TextShimmer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.4) 50%, transparent 100%)",
          mixBlendMode: "overlay",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
      />
    </span>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  /* Parallax transforms for background layers */
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const orbY1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"])
  const orbY2 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"])
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Image with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-primary/95" />
      </motion.div>

      {/* Particle field overlay */}
      <div className="absolute inset-0 z-[1]">
        <ParticleField
          className="opacity-40"
          particleCount={60}
        />
      </div>

      {/* Floating geometric shapes behind content */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        <FloatingShapes className="opacity-60" />
      </div>

      {/* Animated background orbs with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[3]">
        <motion.div
          style={{ y: orbY1 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl"
        />
        <motion.div
          style={{ y: orbY2 }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-chart-1/5 blur-3xl"
        />
      </div>

      {/* Content with parallax */}
      <motion.div
        style={{ y: contentY, opacity: opacityFade }}
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-24 pb-20 lg:px-8"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Headline with TextShimmer on "Investing" */}
          <motion.h1
            variants={fadeInUp}
            className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-card sm:text-5xl lg:text-7xl"
          >
            Unlock the Full{" "}
            <br className="hidden sm:block" />
            Power of{" "}
            <span className="relative inline-block">
              <TextShimmer className="italic text-chart-1">
                Investing
              </TextShimmer>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-1 left-0 h-1 bg-chart-1/40 rounded-full"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-card/80 lg:text-xl"
          >
            Comprehensive wealth management spanning Insurance, Mutual Funds, PMS,
            AIF, Bonds & beyond — your trusted partner for building
            generational wealth.
          </motion.p>

          {/* CTAs - with magnetic button effect */}
          <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/contact">
              <MagneticButton strength={0.3}>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-8 text-base cursor-pointer w-full sm:w-auto"
                >
                  Book Introductory Call
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </MagneticButton>
            </Link>
            <Link href="/services">
              <MagneticButton strength={0.2}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-card/30 bg-card/10 text-card hover:bg-card/20 gap-2 px-8 text-base backdrop-blur-sm cursor-pointer w-full sm:w-auto"
                >
                  <Play className="h-4 w-4" />
                  Explore Products
                </Button>
              </MagneticButton>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-wrap items-center gap-6 text-card/70"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-chart-1" />
              <span className="text-sm font-medium">SEBI Compliant</span>
            </div>
            <div className="hidden h-4 w-px bg-card/30 sm:block" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-1" />
              <span className="text-sm font-medium">Proven Track Record</span>
            </div>
            <div className="hidden h-4 w-px bg-card/30 sm:block" />
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-chart-1" />
              <span className="text-sm font-medium">500+ Happy Clients</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Bar - Glassmorphism cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="group rounded-xl border border-white/10 bg-white/[0.07] px-6 py-5 backdrop-blur-xl shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white/[0.12] hover:border-chart-1/30 hover:shadow-xl hover:shadow-chart-1/5"
            >
              <p className="font-serif text-3xl font-bold text-card lg:text-4xl">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-card/60">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-card/30 p-1">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1.5 w-1 rounded-full bg-card/60"
          />
        </div>
      </motion.div>
    </section>
  )
}
