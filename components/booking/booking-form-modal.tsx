"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Calendar,
  Clock,
  Phone,
  User,
  Mail,
  FileText,
  Loader2,
  ShieldCheck,
  Briefcase,
  AlertCircle,
} from "lucide-react"
import { createBooking, formatTime12h, type Booking, type BookingPayload } from "@/lib/booking-service"

interface BookingFormModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  startTime: string
  duration?: number
  onBookingSuccess: (booking: Booking) => void
}

const SERVICE_OPTIONS = [
  { value: "Mutual Funds & SIP", label: "Mutual Funds & SIP Investment" },
  { value: "PMS", label: "Portfolio Management Services (PMS)" },
  { value: "AIF", label: "Alternative Investment Funds (AIF)" },
  { value: "NRI Investment", label: "NRI Investment & Repatriation Guidance" },
  { value: "Comprehensive Planning", label: "Comprehensive Financial & Wealth Planning" },
  { value: "Fixed Income & Bonds", label: "Fixed Deposits, Bonds & Capital Gains" },
]

export function BookingFormModal({
  isOpen,
  onClose,
  date,
  startTime,
  duration = 30,
  onBookingSuccess,
}: BookingFormModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [service, setService] = useState(SERVICE_OPTIONS[0].value)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !date || !startTime) {
      setError("Please fill in your name and email address.")
      return
    }

    setLoading(true)
    setError("")

    const payload: BookingPayload = {
      client_name: name.trim(),
      client_email: email.trim(),
      client_phone: phone.trim() || undefined,
      date,
      start_time: startTime,
      service,
      notes: notes.trim() || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
    }

    const res = await createBooking(payload)

    if (res.success && res.booking) {
      onBookingSuccess(res.booking)
      onClose()
    } else {
      setError(res.error || "Failed to schedule appointment. Please try again.")
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-foreground z-10 my-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <ShieldCheck className="h-4 w-4" />
              <span>Step 2 of 2 — Complete Booking</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary sm:text-3xl mt-1">
              Consultation Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              One-on-one session with Francis J. (AMFI Reg. Mutual Fund Distributor)
            </p>
          </div>

          {/* Appointment Slot Summary Box */}
          <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Selected Date</p>
                <p className="font-semibold text-primary">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time & Duration</p>
                <p className="font-semibold text-primary">
                  {formatTime12h(startTime)} ({duration} mins)
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-primary/80 mb-1.5">
                Full Name <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-primary/80 mb-1.5">
                  Email Address <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-primary/80 mb-1.5">
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-primary/80 mb-1.5">
                Primary Investment Area
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-input bg-background pl-10 pr-8 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-primary/80 mb-1.5">
                Questions or Financial Goals (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <textarea
                  rows={2}
                  placeholder="e.g. Planning for retirement in 10 years, portfolio rebalancing, or NRI investment queries..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !name.trim() || !email.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-[#B91C1C] px-6 py-3.5 font-bold text-accent-foreground transition-all hover:from-[#B91C1C] hover:to-accent hover:shadow-lg hover:shadow-accent/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Confirming Appointment...</span>
                  </>
                ) : (
                  <span>Confirm Consultation ({formatTime12h(startTime)})</span>
                )}
              </button>
              <p className="text-center text-[11px] text-muted-foreground mt-2.5">
                No fee required • 100% Confidential • Instant Calendar Invite
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
