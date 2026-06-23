"use client"

import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="relative bg-gradient-to-br from-[var(--navy-deep)] via-accent to-[#B91C1C] py-20 lg:py-24 overflow-hidden" ref={ref}>
      {/* Animated gradient orbs in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/[0.08] blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-white/[0.07] blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-[var(--gold)]/[0.08] blur-3xl"
        />
      </div>

      {/* Background dot pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8"
      >
        <h2 className="font-serif text-3xl font-bold tracking-tight text-accent-foreground sm:text-4xl lg:text-5xl text-balance">
          Ready to Take the First Step?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-accent-foreground/80">
          Join hundreds of satisfied clients who trust First Step Consultancy
          Services for their wealth management needs. Your consultation is one click away.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* CTA button with pulse + shimmer */}
          <Link href="/contact">
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Shimmer sweep overlay */}
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg"
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                    width: "40%",
                  }}
                  animate={{ x: ["-200%", "300%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                />
              </motion.div>
              <Button
                size="lg"
                className="relative bg-white text-[var(--navy-deep)] hover:bg-white/90 gap-2 px-8 text-base cursor-pointer shadow-xl shadow-black/20 font-bold"
              >
                Book Introductory Call
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </Link>

        </div>
      </motion.div>
    </section>
  )
}
