"use client"

import { useRef, useState, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  glowIntensity?: number
}

export function GlowCard({
  children,
  className,
  glowColor = "linear-gradient(135deg, #D4AF37, #2563eb, #D4AF37)",
  glowIntensity = 1,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current
      if (!card) return

      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })
    },
    []
  )

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setMousePosition({ x: 50, y: 50 })
  }, [])

  const glowOpacity = isHovering ? 0.8 * glowIntensity : 0

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-white shadow-lg transition-shadow duration-300",
        isHovering && "shadow-xl",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ isolation: "isolate" }}
    >
      {/* Glow border effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          background: glowColor,
          opacity: glowOpacity,
          maskImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, black 0%, transparent 60%)`,
          WebkitMaskImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, black 0%, transparent 60%)`,
          padding: "2px",
          zIndex: 1,
        }}
      />
      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
