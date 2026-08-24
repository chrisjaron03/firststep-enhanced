"use client"

import { useEffect, useState } from "react"

function getRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return null
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s }
}

export function CountdownTimer({ targetDate, onEnded }: { targetDate: string; onEnded?: () => void }) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate))

  useEffect(() => {
    const id = setInterval(() => {
      const r = getRemaining(targetDate)
      setRemaining(r)
      if (!r) {
        clearInterval(id)
        onEnded?.()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [targetDate, onEnded])

  if (!remaining) return <span className="text-sm text-muted-foreground">Event has started</span>

  const Box = ({ v, label }: { v: number; label: string }) => (
    <div className="flex flex-col items-center rounded-xl border border-[var(--gold)]/20 bg-card px-3 py-2 shadow-sm min-w-[56px]">
      <span className="font-mono text-xl font-bold text-foreground">{String(v).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  )

  return (
    <div className="flex gap-2">
      <Box v={remaining.d} label="Days" />
      <Box v={remaining.h} label="Hours" />
      <Box v={remaining.m} label="Min" />
      <Box v={remaining.s} label="Sec" />
    </div>
  )
}
