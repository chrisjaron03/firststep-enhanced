"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { ParticleField } from "@/components/particle-field"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const testimonials = [
  {
    name: "Rajesh Krishnamurthy",
    role: "Business Owner, Chennai",
    quote:
      "First Step Consultancy has been instrumental in diversifying my portfolio across PMS and AIF strategies. Francis Ji's deep understanding of the market and personalized approach has helped me achieve consistent returns well above my expectations.",
    rating: 5,
  },
  {
    name: "Dr. Priya Venkatesh",
    role: "Senior Surgeon, Coimbatore",
    quote:
      "As a medical professional with limited time for financial planning, I needed a trustworthy consultant. FSCS manages my investments across mutual funds, bonds, and insurance seamlessly. Their comprehensive approach gives me complete peace of mind.",
    rating: 5,
  },
  {
    name: "Arun Sundararajan",
    role: "IT Director, Bangalore",
    quote:
      "The access to unlisted shares and pre-IPO opportunities through First Step has been a game-changer. Francis Sir's insights into GIFT City funds helped me diversify internationally with tax efficiency. Truly exceptional service.",
    rating: 5,
  },
  {
    name: "Meera & Karthik Raman",
    role: "NRI Clients, Dubai",
    quote:
      "Managing investments from abroad was always challenging until we found FSCS. Their LRS and global investing solutions through Kristal, combined with Indian market expertise, made cross-border investing smooth and profitable for our family.",
    rating: 5,
  },
  {
    name: "V. Srinivasan",
    role: "Retired Bank Manager, Madurai",
    quote:
      "After retirement, I was looking for safe yet rewarding investment options. The FD recommendations and bond portfolio curated by First Step provide me steady income with capital safety. Their attention to detail is remarkable.",
    rating: 5,
  },
]

const AUTO_ADVANCE_INTERVAL = 6000

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const next = useCallback(() => {
    setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1))
    setProgress(0)
  }, [])

  const prev = () => {
    setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1))
    setProgress(0)
  }

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(next, AUTO_ADVANCE_INTERVAL)
    return () => clearInterval(timer)
  }, [next])

  // Progress bar animation
  useEffect(() => {
    setProgress(0)
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const p = Math.min((elapsed / AUTO_ADVANCE_INTERVAL) * 100, 100)
      setProgress(p)
      if (p >= 100) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [current])

  /* Dramatic slide + scale + blur variants */
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.92,
      filter: "blur(8px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.92,
      filter: "blur(8px)",
    }),
  }

  return (
    <section className="relative bg-gradient-to-br from-[var(--navy-deep)] via-primary to-[var(--navy-mid)] py-24 lg:py-32 overflow-hidden" ref={ref}>
      {/* Subtle particle field overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-20">
        <ParticleField
          particleCount={30}
        />
      </div>

      {/* Decorative large quote marks as background elements */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden select-none">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.06 } : {}}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="absolute -top-16 left-8 font-serif text-[28rem] leading-none text-chart-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          &ldquo;
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.06 } : {}}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="absolute -bottom-40 right-8 font-serif text-[28rem] leading-none text-chart-1 rotate-180"
          style={{ fontFamily: "Georgia, serif" }}
        >
          &ldquo;
        </motion.span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-chart-1">
            Testimonials
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl text-balance">
            Trusted by Clients Across India
          </motion.h2>
        </motion.div>

        {/* Testimonial Card */}
        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* Active decorative quote icon */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Quote className="mb-6 h-12 w-12 text-chart-1/30" />
          </motion.div>

          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={current}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.35 },
                scale: { duration: 0.35 },
                filter: { duration: 0.35 },
              }}
              className="min-h-[200px]"
            >
              <p className="text-xl leading-relaxed text-primary-foreground/90 lg:text-2xl font-light">
                {`"${testimonials[current].quote}"`}
              </p>

              {/* Stars */}
              <div className="mt-8 flex gap-1">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300 }}
                  >
                    <Star className="h-5 w-5 fill-chart-1 text-chart-1" />
                  </motion.div>
                ))}
              </div>

              {/* Author */}
              <div className="mt-4">
                <p className="text-lg font-bold text-primary-foreground">
                  {testimonials[current].name}
                </p>
                <p className="text-sm text-primary-foreground/60">
                  {testimonials[current].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground transition-colors hover:bg-primary-foreground/10 cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setProgress(0) }}
                  className={`relative h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                    i === current
                      ? "w-8 bg-chart-1/30"
                      : "w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                >
                  {/* Progress bar fill */}
                  {i === current && (
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-chart-1"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground transition-colors hover:bg-primary-foreground/10 cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
