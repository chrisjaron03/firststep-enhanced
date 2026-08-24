"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Sun,
  Sunset,
  Sunrise,
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  Globe,
} from "lucide-react"
import {
  fetchPublicAvailability,
  fetchAvailableSlots,
  categorizeSlots,
  formatTime12h,
  DAY_SHORT_NAMES,
  MONTH_NAMES,
  type DaySchedule,
  type BlockedDate,
} from "@/lib/booking-service"

interface BookingCalendarWidgetProps {
  onSelectSlot: (date: string, time: string, duration: number) => void
  selectedDate?: string
  selectedTime?: string
}

export function BookingCalendarWidget({
  onSelectSlot,
  selectedDate: initialDate,
  selectedTime: initialTime,
}: BookingCalendarWidgetProps) {
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || "")
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || "")
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [availability, setAvailability] = useState<{ activeDays: DaySchedule[]; blockedDates: BlockedDate[] }>({
    activeDays: [],
    blockedDates: [],
  })
  const [timezone, setTimezone] = useState("Asia/Kolkata")

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata")
    } catch {
      setTimezone("Asia/Kolkata")
    }
  }, [])

  // Load public availability schedule & blocked dates
  useEffect(() => {
    fetchPublicAvailability().then((res) => {
      setAvailability(res)
    })
  }, [])

  // Fetch slots whenever selectedDate changes
  const loadSlots = useCallback(async (dateStr: string) => {
    if (!dateStr) {
      setSlots([])
      return
    }
    setLoadingSlots(true)
    const available = await fetchAvailableSlots(dateStr)
    setSlots(available)
    setLoadingSlots(false)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate)
    }
  }, [selectedDate, loadSlots])

  // Calendar math for grid
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const numDays = new Date(year, month + 1, 0).getDate()
    const firstDayIndex = new Date(year, month, 1).getDay()

    const days: {
      dateStr: string
      dayNum: number
      isCurrentMonth: boolean
      isPast: boolean
      isToday: boolean
      isBlocked: boolean
      isAvailableDay: boolean
      blockedReason?: string | null
    }[] = []

    // Empty padding days before start of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateStr: "",
        dayNum: 0,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
        isBlocked: false,
        isAvailableDay: false,
      })
    }

    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`

    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`
      const dateObj = new Date(year, month, d)
      const dayOfWeek = dateObj.getDay()

      const isPast = dateStr < todayStr
      const isToday = dateStr === todayStr

      const blockedObj = availability.blockedDates.find((b) => b.date === dateStr)
      const isBlocked = !!blockedObj

      const sched = availability.activeDays.find((s) => s.day_of_week === dayOfWeek)
      const isAvailableDay = sched ? Boolean(sched.is_active) : dayOfWeek !== 0

      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isPast,
        isToday,
        isBlocked,
        isAvailableDay: isAvailableDay && !isPast && !isBlocked,
        blockedReason: blockedObj?.reason,
      })
    }

    return days
  }, [currentMonth, availability, today])

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    if (prev.getFullYear() < today.getFullYear() || (prev.getFullYear() === today.getFullYear() && prev.getMonth() < today.getMonth())) {
      return
    }
    setCurrentMonth(prev)
  }

  const canGoPrev = useMemo(() => {
    return !(
      currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth()
    )
  }, [currentMonth, today])

  const handleDayClick = (dateStr: string, isAvailable: boolean) => {
    if (!isAvailable || !dateStr) return
    setSelectedDate(dateStr)
    setSelectedTime("")
  }

  const handleTimeSelect = (timeStr: string) => {
    setSelectedTime(timeStr)
    const dayOfWeek = new Date(selectedDate + "T00:00:00").getDay()
    const sched = availability.activeDays.find((s) => s.day_of_week === dayOfWeek)
    const duration = sched?.slot_duration || 30
    onSelectSlot(selectedDate, timeStr, duration)
  }

  const categorized = useMemo(() => categorizeSlots(slots), [slots])

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return ""
    const d = new Date(selectedDate + "T00:00:00")
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }, [selectedDate])

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Consultant Live Availability
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl mt-1">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition-all hover:border-accent hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition-all hover:border-accent hover:text-accent cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {DAY_SHORT_NAMES.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {daysInMonth.map((day, idx) => {
          if (!day.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="h-12 sm:h-14" />
          }

          const isSelected = selectedDate === day.dateStr
          const isClickable = day.isAvailableDay

          return (
            <motion.button
              key={day.dateStr}
              type="button"
              whileHover={isClickable ? { scale: 1.05 } : undefined}
              whileTap={isClickable ? { scale: 0.96 } : undefined}
              onClick={() => handleDayClick(day.dateStr, isClickable)}
              disabled={!isClickable}
              className={`relative flex flex-col items-center justify-center h-12 sm:h-14 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-accent bg-gradient-to-r from-accent to-[#B91C1C] text-white font-bold shadow-lg shadow-accent/25 ring-2 ring-accent/30"
                  : day.isToday
                    ? "border-accent/40 bg-accent/10 text-accent font-bold"
                    : isClickable
                      ? "border-border bg-background text-primary hover:border-accent hover:bg-accent/5"
                      : day.isBlocked
                        ? "border-transparent bg-red-50 text-muted-foreground/40 cursor-not-allowed"
                        : "border-transparent text-muted-foreground/30 bg-muted/20 cursor-not-allowed"
              }`}
            >
              <span className="text-sm sm:text-base font-semibold">
                {day.dayNum}
              </span>

              {/* Status indicators */}
              {isClickable && !isSelected && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-500" />
              )}
              {isSelected && (
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-white" />
              )}
              {day.isBlocked && (
                <span className="text-[9px] text-red-500 font-medium leading-none">Off</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Expandable Times Section */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 28 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[var(--gold)]/40 bg-gradient-to-b from-[#faf8f5] to-card p-5 sm:p-6 shadow-lg relative">
              {/* Top info bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-primary">
                      {formattedSelectedDate}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select your preferred consultation time below
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border w-fit">
                  <Globe className="h-3.5 w-3.5 text-accent" />
                  <span>{timezone} (Standard IST)</span>
                </div>
              </div>

              {/* Time slots rendering */}
              <div className="pt-5 space-y-5">
                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-accent" />
                    <p className="text-sm">Loading available consultation slots...</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2 opacity-90" />
                    <p className="font-semibold text-primary">No available slots for this date</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      All slots are either booked or the consultant is unavailable. Please select another date.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Morning Slots */}
                    {categorized.morning.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                          <Sunrise className="h-4 w-4 text-amber-500" />
                          <span>Morning Slots ({categorized.morning.length})</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                          {categorized.morning.map((slot) => {
                            const isSlotActive = selectedTime === slot
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleTimeSelect(slot)}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                                  isSlotActive
                                    ? "border-accent bg-gradient-to-r from-accent to-[#B91C1C] text-white font-bold shadow-md shadow-accent/25 scale-[1.02]"
                                    : "border-border bg-card text-primary hover:border-accent hover:bg-accent/5"
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <Clock className={`h-3.5 w-3.5 ${isSlotActive ? "text-white" : "text-muted-foreground"}`} />
                                  {formatTime12h(slot)}
                                </span>
                                {isSlotActive && <Check className="h-4 w-4 text-white" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Afternoon Slots */}
                    {categorized.afternoon.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider text-orange-700">
                          <Sun className="h-4 w-4 text-orange-500" />
                          <span>Afternoon Slots ({categorized.afternoon.length})</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                          {categorized.afternoon.map((slot) => {
                            const isSlotActive = selectedTime === slot
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleTimeSelect(slot)}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                                  isSlotActive
                                    ? "border-accent bg-gradient-to-r from-accent to-[#B91C1C] text-white font-bold shadow-md shadow-accent/25 scale-[1.02]"
                                    : "border-border bg-card text-primary hover:border-accent hover:bg-accent/5"
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <Clock className={`h-3.5 w-3.5 ${isSlotActive ? "text-white" : "text-muted-foreground"}`} />
                                  {formatTime12h(slot)}
                                </span>
                                {isSlotActive && <Check className="h-4 w-4 text-white" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Evening Slots */}
                    {categorized.evening.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider text-primary">
                          <Sunset className="h-4 w-4 text-accent" />
                          <span>Evening Slots ({categorized.evening.length})</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                          {categorized.evening.map((slot) => {
                            const isSlotActive = selectedTime === slot
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleTimeSelect(slot)}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                                  isSlotActive
                                    ? "border-accent bg-gradient-to-r from-accent to-[#B91C1C] text-white font-bold shadow-md shadow-accent/25 scale-[1.02]"
                                    : "border-border bg-card text-primary hover:border-accent hover:bg-accent/5"
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <Clock className={`h-3.5 w-3.5 ${isSlotActive ? "text-white" : "text-muted-foreground"}`} />
                                  {formatTime12h(slot)}
                                </span>
                                {isSlotActive && <Check className="h-4 w-4 text-white" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend / Info Footer */}
      <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available Day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Unavailable / Past
          </span>
        </div>
        <div className="flex items-center gap-1 text-accent font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Click any open day to expand available consultation times</span>
        </div>
      </div>
    </div>
  )
}
