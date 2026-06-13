"use client"

import { useRef, type ReactNode } from "react"
import { motion, useInView, type Variants, type Transition } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimationVariant = "fade-up" | "fade-left" | "fade-right" | "scale" | "blur"

interface ScrollRevealProps {
  children: ReactNode
  variant?: AnimationVariant
  delay?: number
  duration?: number
  className?: string
  staggerChildren?: number
  once?: boolean
  margin?: string
}

const getVariants = (variant: AnimationVariant): Variants => {
  const variants: Record<AnimationVariant, Variants> = {
    "fade-up": {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    "fade-left": {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0 },
    },
    "fade-right": {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.85 },
      visible: { opacity: 1, scale: 1 },
    },
    blur: {
      hidden: { opacity: 0, filter: "blur(8px)", y: 20 },
      visible: { opacity: 1, filter: "blur(0px)", y: 0 },
    },
  }

  return variants[variant]
}

interface ScrollRevealChildProps {
  children: ReactNode
  variant?: AnimationVariant
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  margin?: string
}

export function ScrollRevealChild({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.7,
  className,
  once = true,
  margin = "-80px",
}: ScrollRevealChildProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin })

  const variants = getVariants(variant)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.7,
  className,
  staggerChildren = 0,
  once = true,
  margin = "-80px",
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin })

  const variants = getVariants(variant)

  const transition: Transition = {
    duration,
    delay,
    ease: [0.22, 1, 0.36, 1],
  }

  if (staggerChildren > 0) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren,
              delayChildren: delay,
            },
          },
        }}
        className={cn(staggerChildren > 0 && "contents", className)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScrollRevealItem({
  children,
  variant = "fade-up",
  className,
}: {
  children: ReactNode
  variant?: AnimationVariant
  className?: string
}) {
  const variants = getVariants(variant)

  return (
    <motion.div
      variants={variants}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
