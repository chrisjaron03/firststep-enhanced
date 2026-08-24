"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Sparkles,
  UserCheck,
} from "lucide-react"
import {
  getGoogleCalendarUrl,
  downloadIcsFile,
  formatTime12h,
  type Booking,
} from "@/lib/booking-service"

interface BookingSuccessCardProps {
  booking: Booking
  onReset: () => void
}

export function BookingSuccessCard({ booking, onReset }: BookingSuccessCardProps) {
  const formattedDate = new Date(booking.date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const googleCalUrl = getGoogleCalendarUrl(booking)

  const handleDownloadIcs = () => {
    downloadIcsFile(booking)
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Francis, I have scheduled a consultation on ${formattedDate} at ${formatTime12h(booking.start_time)} for ${booking.service || "Financial Advisory"}. (Client: ${booking.client_name})`
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-2xl text-foreground relative"
    >
      {/* Background subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/5 blur-3xl pointer-events-none rounded-full" />

      {/* Success Badge */}
      <div className="text-center mb-8 relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-300 shadow-xl shadow-emerald-500/10"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </motion.div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Appointment Confirmed</span>
        </div>
        <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">
          You&apos;re All Set, {booking.client_name.split(" ")[0]}!
        </h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto text-sm">
          Your consultation slot has been reserved with Francis J. (AMFI Registered MFD).
        </p>
      </div>

      {/* Appointment Details Grid */}
      <div className="rounded-2xl border border-border bg-secondary/50 p-5 sm:p-7 mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="font-semibold text-primary text-base">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Time Slot</p>
              <p className="font-semibold text-primary text-base">
                {formatTime12h(booking.start_time)} – {formatTime12h(booking.end_time)} (IST)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Consultant</p>
            <p className="font-semibold text-primary mt-0.5">Francis J.</p>
            <p className="text-xs text-accent font-medium">AMFI Registered MFD • First Step Consultancy</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Service Focus</p>
            <p className="font-semibold text-primary mt-0.5">{booking.service || "Comprehensive Advisory"}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground text-center uppercase tracking-wider mb-2">
          Save Appointment to Your Calendar:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-[#B91C1C] px-5 py-3 text-sm font-semibold text-accent-foreground shadow-md shadow-accent/20 hover:from-[#B91C1C] hover:to-accent transition-all cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            Add to Google Calendar
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-5 py-3 text-sm font-semibold text-primary hover:bg-muted transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-accent" />
            Download iCal / Outlook (.ics)
          </button>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`https://wa.me/919840000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Need to reschedule or have questions? WhatsApp us
          </a>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium"
          >
            Book Another Consultation
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
