"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
  speed?: number
}

export function TextShimmer({ children, className, speed = 3 }: TextShimmerProps) {
  useEffect(() => {
    const id = "text-shimmer-keyframes"
    if (document.getElementById(id)) return

    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      @keyframes text-shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      .text-shimmer-animated {
        background-size: 200% auto;
        animation: text-shimmer var(--shimmer-speed, 3s) linear infinite;
      }
    `
    document.head.appendChild(style)

    return () => {
      const existing = document.getElementById(id)
      if (existing) existing.remove()
    }
  }, [])

  return (
    <span
      className={cn(
        "relative inline align-baseline bg-gradient-to-r from-[#D4AF37] via-[#F4E4BC] to-[#FFD700] bg-clip-text text-transparent text-shimmer-animated",
        className
      )}
      style={{ "--shimmer-speed": `${speed}s` } as React.CSSProperties}
    >
      {children}
    </span>
  )
}
