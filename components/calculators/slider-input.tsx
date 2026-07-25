"use client"

import { useState, useCallback, useEffect } from "react"

interface SliderInputProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  formatDisplay?: (value: number) => string
  onChange: (value: number) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

export function SliderInput({ label, value, min, max, step, suffix, formatDisplay, onChange }: SliderInputProps) {
  const [inputValue, setInputValue] = useState(String(value))

  useEffect(() => {
    setInputValue(String(value))
  }, [value])

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setInputValue(String(v))
    onChange(v)
  }, [onChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "")
    setInputValue(raw)
    const v = Number(raw)
    if (!isNaN(v) && v >= min && v <= max) {
      onChange(v)
    }
  }, [min, max, onChange])

  const handleInputBlur = useCallback(() => {
    let v = Number(inputValue.replace(/[^0-9.]/g, ""))
    if (isNaN(v)) v = min
    v = Math.max(min, Math.min(max, v))
    setInputValue(String(v))
    onChange(v)
  }, [inputValue, min, max, onChange])

  const displayValue = formatDisplay
    ? formatDisplay(value)
    : label.toLowerCase().includes("return") || label.toLowerCase().includes("rate") || label.toLowerCase().includes("step")
      ? `${value}${suffix || "%"}`
      : `${formatCurrency(value)}${suffix || ""}`

  return (
    <div className="w-full">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
        <label className="text-xs sm:text-sm font-medium text-foreground min-w-0 shrink">{label}</label>
        <span className="text-xs font-semibold text-primary shrink-0 max-w-full truncate">{displayValue}</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="flex-1 accent-primary h-2 cursor-pointer min-w-0"
        />
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-24 sm:w-28 shrink-0 rounded-lg border border-border bg-card px-2 sm:px-3 py-1 text-xs sm:text-sm text-center font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors truncate"
        />
      </div>
      <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-1">
        <span className="truncate">{min.toLocaleString("en-IN")}</span>
        <span className="truncate">{max.toLocaleString("en-IN")}</span>
      </div>
    </div>
  )
}
