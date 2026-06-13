"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface FloatingShapesProps {
  className?: string
}

interface Shape {
  id: number
  type: "circle" | "ring" | "square" | "rounded-square"
  size: number
  x: string
  y: string
  color: string
  opacity: number
  duration: number
  delay: number
  yMovement: number
  xMovement: number
  rotate: number
}

const SHAPES: Shape[] = [
  {
    id: 1,
    type: "circle",
    size: 200,
    x: "5%",
    y: "15%",
    color: "#1a2744",
    opacity: 0.04,
    duration: 20,
    delay: 0,
    yMovement: -30,
    xMovement: 15,
    rotate: 0,
  },
  {
    id: 2,
    type: "ring",
    size: 150,
    x: "80%",
    y: "10%",
    color: "#D4AF37",
    opacity: 0.05,
    duration: 25,
    delay: 2,
    yMovement: 25,
    xMovement: -20,
    rotate: 0,
  },
  {
    id: 3,
    type: "rounded-square",
    size: 180,
    x: "60%",
    y: "60%",
    color: "#8B2332",
    opacity: 0.04,
    duration: 22,
    delay: 4,
    yMovement: -20,
    xMovement: 25,
    rotate: 45,
  },
  {
    id: 4,
    type: "circle",
    size: 120,
    x: "20%",
    y: "70%",
    color: "#D4AF37",
    opacity: 0.03,
    duration: 18,
    delay: 1,
    yMovement: 20,
    xMovement: -15,
    rotate: 0,
  },
  {
    id: 5,
    type: "square",
    size: 100,
    x: "85%",
    y: "75%",
    color: "#1a2744",
    opacity: 0.05,
    duration: 28,
    delay: 3,
    yMovement: -15,
    xMovement: -10,
    rotate: 15,
  },
  {
    id: 6,
    type: "ring",
    size: 250,
    x: "40%",
    y: "30%",
    color: "#1a2744",
    opacity: 0.03,
    duration: 30,
    delay: 5,
    yMovement: 15,
    xMovement: 20,
    rotate: 0,
  },
  {
    id: 7,
    type: "rounded-square",
    size: 140,
    x: "10%",
    y: "45%",
    color: "#8B2332",
    opacity: 0.04,
    duration: 24,
    delay: 2,
    yMovement: -25,
    xMovement: 10,
    rotate: -20,
  },
]

function ShapeElement({ shape }: { shape: Shape }) {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: shape.x,
    top: shape.y,
    width: shape.size,
    height: shape.size,
    opacity: shape.opacity,
    borderColor: shape.color,
    backgroundColor: shape.type === "ring" ? "transparent" : shape.color,
  }

  const borderWidth = shape.type === "ring" ? 2 : 0

  const getBorderRadius = () => {
    switch (shape.type) {
      case "circle":
      case "ring":
        return "50%"
      case "rounded-square":
        return "20%"
      case "square":
        return "0%"
    }
  }

  return (
    <motion.div
      style={{
        ...baseStyle,
        borderRadius: getBorderRadius(),
        borderWidth,
        borderStyle: "solid",
      }}
      animate={{
        y: [0, shape.yMovement, 0],
        x: [0, shape.xMovement, 0],
        rotate: [shape.rotate, shape.rotate + 10, shape.rotate],
      }}
      transition={{
        duration: shape.duration,
        delay: shape.delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
  )
}

export function FloatingShapes({ className }: FloatingShapesProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {SHAPES.map((shape) => (
        <ShapeElement key={shape.id} shape={shape} />
      ))}
    </div>
  )
}
