"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useSpring, useMotionValue, motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CountUpTimerProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  formatNumber?: boolean
  className?: string
}

function formatIndianNumber(num: number): string {
  if (num < 1000) return num.toString()

  const numStr = Math.floor(num).toString()
  const length = numStr.length

  if (length <= 3) return numStr

  // For Indian numbering system
  let result = ""
  let remaining = numStr

  // Last 3 digits
  result = remaining.slice(-3)
  remaining = remaining.slice(0, -3)

  // Rest in pairs of 2
  while (remaining.length > 0) {
    const chunk = remaining.slice(-2)
    result = chunk + "," + result
    remaining = remaining.slice(0, -2)
  }

  return result
}

export function CountUpTimer({
  end,
  suffix = "",
  prefix = "",
  duration = 2,
  formatNumber = true,
  className,
}: CountUpTimerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasStarted = useRef(false)

  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
    duration: duration * 1000,
  })

  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView || hasStarted.current) return
    hasStarted.current = true

    motionValue.set(end)
  }, [isInView, end, motionValue])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return unsubscribe
  }, [springValue])

  const formattedValue = formatNumber
    ? formatIndianNumber(displayValue)
    : displayValue.toString()

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block tabular-nums", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  )
}
