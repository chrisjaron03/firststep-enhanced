"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, Loader2, Video } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://firststep-backend.chrisjaron99.workers.dev"

function generateDates(daysAhead: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split("T")[0])
  }
  return dates
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hh = h % 12 || 12
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`
}

export default function BookPage() {
  const [dates] = useState(() => generateDates(14))
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState("")
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [meetLink, setMeetLink] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")

  // Set default selected date to tomorrow if available
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const ts = tomorrow.toISOString().split("T")[0]
    if (dates.includes(ts)) {
      setSelectedDate(ts)
    } else if (dates.length > 0) {
      setSelectedDate(dates[0])
    }
  }, [dates])

  const fetchSlots = useCallback(async () => {
    if (!selectedDate) return
    setLoading(true)
    setSelectedSlot("")
    try {
      const res = await fetch(`${API_BASE}/api/bookings/slots?date=${selectedDate}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch {
      setSlots([])
    }
    setLoading(false)
  }, [selectedDate])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !selectedSlot) return
    setBooking(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: name,
          client_email: email,
          client_phone: phone || undefined,
          date: selectedDate,
          start_time: selectedSlot,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Booking failed")
      } else {
        setBooked(true)
        if (data.meet_link) setMeetLink(data.meet_link)
      }
    } catch {
      setError("Network error. Please try again.")
    }
    setBooking(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c]">
      <Navigation />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-28 lg:pb-32 lg:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-accent">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Book a Consultation
            </h1>
            <p className="mt-2 text-white/60">
              Schedule a free call with our financial advisors
            </p>
          </div>

          <AnimatePresence mode="wait">
            {booked ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white">Booking Confirmed!</h2>
                <p className="mt-2 text-white/60">
                  {formatDate(selectedDate)} at {formatTime(selectedSlot)}
                </p>
                {meetLink && (
                  <a
                    href={meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3 font-bold text-[var(--navy-deep)] transition-opacity hover:opacity-90"
                  >
                    <Video className="h-5 w-5" />
                    Join Google Meet
                  </a>
                )}
                <p className="mt-4 text-sm text-white/40">
                  A confirmation email has been sent to {email}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="booking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
              >
                {/* Date selector */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-white/70">Select a Date</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {dates.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`shrink-0 rounded-xl border px-4 py-3 text-center text-sm transition-all ${
                          selectedDate === d
                            ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                            : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                        }`}
                      >
                        <div className="text-xs opacity-60">
                          {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}
                        </div>
                        <div className="mt-0.5 text-base font-semibold">
                          {new Date(d + "T00:00:00").getDate()}
                        </div>
                        <div className="text-xs opacity-60">
                          {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slots */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-white/70">Select a Time</label>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="py-8 text-center text-sm text-white/40">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSlot(s)}
                          className={`rounded-xl border px-3 py-2.5 text-center text-sm transition-all ${
                            selectedSlot === s
                              ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                              : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                          }`}
                        >
                          <Clock className="mx-auto mb-1 h-3.5 w-3.5 opacity-60" />
                          {formatTime(s)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booking form */}
                <form onSubmit={handleBook} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  />
                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={booking || !selectedSlot || !name || !email}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3 font-bold text-[var(--navy-deep)] transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {booking ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
