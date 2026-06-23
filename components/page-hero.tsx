"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations"

interface PageHeroProps {
  badge: string
  title: string
  description: string
  image: string
}

export function PageHero({ badge, title, description, image }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background */}
      <div className="absolute inset-0">
        <Image src={image} alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[var(--navy-deep)]/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-mid)]/60 to-[var(--navy-deep)]/95" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--gold)]/[0.03] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center rounded-full border border-[var(--gold)]/25 bg-white/[0.08] px-4 py-1.5 text-sm font-medium text-card/90 backdrop-blur-md shadow-sm shadow-[var(--gold)]/10">
              {badge}
            </span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-card sm:text-5xl lg:text-6xl text-balance"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg leading-relaxed text-card/80 lg:text-xl"
          >
            {description}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
