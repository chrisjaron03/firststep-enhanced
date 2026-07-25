"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const nriTestimonials = [
  {
    name: "Samuel Ratnam",
    designation: "Medical Coder",
    location: "Dubai, UAE",
    quote:
      "I have been investing through Mr. Francis for the past 9 months. He is a very professional and knowledgeable mutual fund advisor. He always motivates and guides me with patience, helping me understand investment decisions clearly. His positive attitude, excellent communication, and genuine concern for his clients make him stand out. I would highly recommend Mr. Francis to anyone looking for a trustworthy and encouraging financial advisor.",
    rating: 5,
  },
  {
    name: "Valanarasu",
    designation: "",
    location: "ISS M&E PTE LTD, Singapore",
    image: "/valanarasu.jpeg",
    quote:
      "Fantastic experience with Mr. Francis J. As an NRI, I was worried about managing Indian investments and navigating taxes. He and his team handled all the documentation smoothly and consistently delivered excellent portfolio growth. Highly professional, ethical, and always available to answer questions. I would definitely recommend FSCS to my colleagues.",
    rating: 5,
  },
  {
    name: "Richard Amuthan",
    designation: "Senior System Engineer",
    location: "Emircom, Riyadh, Saudi Arabia",
    image: "/richard-arumugam.jpeg",
    quote:
      "I sincerely thank Mr. Francis of First Step Consultancy Service for his exceptional financial guidance and professional support. His expertise has given me greater confidence in planning my financial future and renewed my hope for achieving my long-term goals. I highly recommend his consultancy services to anyone seeking trustworthy and reliable financial advice.",
    rating: 5,
  },
  {
    name: "Jamshid",
    designation: "Country Manager",
    location: "Paricott Trading, Qatar",
    image: "/jamshid.jpeg",
    quote:
      "I've had an excellent experience with First Step Consultancy, especially with Mr. Francis. His professionalism, transparency, and genuine commitment to helping clients build wealth through smart financial planning are truly commendable. I highly recommend First Step Consultancy and Mr. Francis to anyone looking for reliable financial services.",
    rating: 5,
  },
]

export function NriTestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)

    const cardWidth = el.children[0]?.getBoundingClientRect().width || 0
    if (cardWidth > 0) {
      const idx = Math.round(el.scrollLeft / (cardWidth + 24))
      setActiveIndex(Math.min(idx, nriTestimonials.length - 1))
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  const scrollTo = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth || 350
    const gap = 24
    const scrollAmount = direction === "left" ? -(cardWidth + gap) : cardWidth + gap
    el.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth || 350
    const gap = 24
    el.scrollTo({ left: index * (cardWidth + gap), behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1a30] to-[#1a2744] py-20 lg:py-28">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center px-6 lg:px-8"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-widest text-chart-1">
            NRI Client Voices
          </motion.p>
          <motion.h2 variants={fadeInUp} className="mt-3 font-serif text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
            What Our Global Clients Say
          </motion.h2>
        </motion.div>

        {/* Desktop: Horizontal scroll with arrows */}
        <div className="mt-14 relative">
          {/* Navigation arrows - hidden on mobile */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTo("left")}
              className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary-foreground/20 hover:border-[var(--gold)]/30 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scrollTo("right")}
              className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary-foreground/20 hover:border-[var(--gold)]/30 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 pt-2 px-6 lg:px-8 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {nriTestimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="snap-start shrink-0 w-[85vw] sm:w-[70vw] md:w-[420px] lg:w-[440px]"
              >
                <div className="relative flex h-full flex-col rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-[var(--gold)]/25 hover:bg-primary-foreground/8 hover:shadow-2xl hover:shadow-chart-1/5">
                  <Quote className="h-9 w-9 text-chart-1/40 shrink-0" />
                  <p className="mt-5 flex-1 text-[15px] leading-relaxed text-primary-foreground/80 line-clamp-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-5 flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-chart-1 text-chart-1" />
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    {"image" in testimonial && testimonial.image && (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className="h-14 w-14 shrink-0 rounded-full border-2 border-chart-1/30 object-cover shadow-lg"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-base font-bold text-primary-foreground truncate">{testimonial.name}</p>
                      {testimonial.designation && (
                        <p className="text-sm text-chart-1/80 truncate">{testimonial.designation}</p>
                      )}
                      <p className="text-sm text-primary-foreground/60 truncate">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-6 md:hidden">
            {nriTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? "w-7 bg-chart-1"
                    : "w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Desktop dot indicators */}
          <div className="hidden md:flex items-center justify-center gap-2 mt-4">
            {nriTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? "w-6 bg-chart-1"
                    : "w-1.5 bg-primary-foreground/25 hover:bg-primary-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
