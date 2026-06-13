"use client"

import { useRef, useState, useCallback } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export function MagneticButton({
  children,
  className,
  strength = 0.4,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }

  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY

      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
      const maxDistance = 120

      if (distance < maxDistance) {
        const pullStrength = (1 - distance / maxDistance) * strength * 25
        x.set(distanceX * pullStrength * 0.05)
        y.set(distanceY * pullStrength * 0.05)
      }
    },
    [strength, x, y]
  )

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }, [x, y])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  return (
    <motion.div
      ref={buttonRef}
      className={cn("inline-block cursor-pointer", className)}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
