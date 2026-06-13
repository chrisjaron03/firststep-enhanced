"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface AnimatedGradientBgProps {
  className?: string
  variant?: "navy" | "warm" | "subtle"
}

const variantStyles = {
  navy: {
    blob1: "bg-[#1a2744]",
    blob2: "bg-[#2a4060]",
    blob3: "bg-[#3d5a80]",
    blob4: "bg-[#1a2744]",
  },
  warm: {
    blob1: "bg-[#8B2332]",
    blob2: "bg-[#D4AF37]",
    blob3: "bg-[#1a2744]",
    blob4: "bg-[#C53030]",
  },
  subtle: {
    blob1: "bg-[#1a2744]",
    blob2: "bg-[#D4AF37]",
    blob3: "bg-[#8B2332]",
    blob4: "bg-[#1a2744]",
  },
}

export function AnimatedGradientBg({ className, variant = "navy" }: AnimatedGradientBgProps) {
  const colors = variantStyles[variant]

  useEffect(() => {
    // Inject keyframes if not already present
    const keyframesId = "animated-gradient-keyframes"
    if (document.getElementById(keyframesId)) return

    const style = document.createElement("style")
    style.id = keyframesId
    style.textContent = `
      @keyframes blob-1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(60px, -40px) scale(1.1); }
        66% { transform: translate(-30px, 30px) scale(0.9); }
      }
      @keyframes blob-2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-50px, 40px) scale(1.15); }
        66% { transform: translate(40px, -30px) scale(0.85); }
      }
      @keyframes blob-3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(40px, 50px) scale(0.9); }
        66% { transform: translate(-50px, -20px) scale(1.1); }
      }
      @keyframes blob-4 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-40px, -50px) scale(1.05); }
        66% { transform: translate(30px, 30px) scale(0.95); }
      }
      .animate-blob-1 { animation: blob-1 18s ease-in-out infinite; }
      .animate-blob-2 { animation: blob-2 22s ease-in-out infinite; }
      .animate-blob-3 { animation: blob-3 20s ease-in-out infinite; }
      .animate-blob-4 { animation: blob-4 24s ease-in-out infinite; }
    `
    document.head.appendChild(style)

    return () => {
      const existing = document.getElementById(keyframesId)
      if (existing) existing.remove()
    }
  }, [])

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div
        className={cn(
          "animate-blob-1 absolute -top-[100px] -left-[100px] h-[400px] w-[400px] rounded-full opacity-[0.07] blur-[80px]",
          colors.blob1
        )}
      />
      <div
        className={cn(
          "animate-blob-2 absolute top-[30%] -right-[100px] h-[350px] w-[350px] rounded-full opacity-[0.06] blur-[70px]",
          colors.blob2
        )}
      />
      <div
        className={cn(
          "animate-blob-3 absolute -bottom-[80px] left-[20%] h-[450px] w-[450px] rounded-full opacity-[0.05] blur-[90px]",
          colors.blob3
        )}
      />
      <div
        className={cn(
          "animate-blob-4 absolute top-[60%] right-[10%] h-[300px] w-[300px] rounded-full opacity-[0.06] blur-[75px]",
          colors.blob4
        )}
      />
    </div>
  )
}
