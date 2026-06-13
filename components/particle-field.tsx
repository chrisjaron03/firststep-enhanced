"use client"

import { useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  color: string
  swayPhase: number
  swaySpeed: number
  swayAmplitude: number
}

interface ParticleFieldProps {
  particleCount?: number
  className?: string
}

const COLORS = ["#D4AF37", "#FFD700", "#F4E4BC", "#E8C547", "#F0D878"]

export function ParticleField({ particleCount = 60, className }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const dimensionsRef = useRef({ width: 0, height: 0 })

  const createParticle = useCallback((width: number, height: number): Particle => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.25 + 0.05),
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      color,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.008 + 0.003,
      swayAmplitude: Math.random() * 0.3 + 0.1,
    }
  }, [])

  const initParticles = useCallback(
    (width: number, height: number) => {
      particlesRef.current = Array.from({ length: particleCount }, () =>
        createParticle(width, height)
      )
    },
    [particleCount, createParticle]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const handleResize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = parent.offsetWidth
      const height = parent.offsetHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      dimensionsRef.current = { width, height }

      // Re-initialize particles on resize
      initParticles(width, height)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    const animate = () => {
      const { width, height } = dimensionsRef.current
      ctx.clearRect(0, 0, width, height)

      const particles = particlesRef.current
      const connectionDistance = 100
      const maxConnections = 3

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Update position with sway
        p.swayPhase += p.swaySpeed
        p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmplitude
        p.y += p.vy

        // Wrap around edges
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()

        // Draw connections
        let connections = 0
        for (let j = i + 1; j < particles.length && connections < maxConnections; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const lineOpacity = (1 - dist / connectionDistance) * 0.12 * p.opacity * p2.opacity
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color
            ctx.globalAlpha = lineOpacity
            ctx.lineWidth = 0.5
            ctx.stroke()
            connections++
          }
        }
      }

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [initParticles])

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    />
  )
}
