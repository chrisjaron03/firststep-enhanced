"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  Phone,
  Mail,
  Clock,
  Sparkles,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { BookingCalendarWidget } from "@/components/booking/booking-calendar-widget"
import { BookingFormModal } from "@/components/booking/booking-form-modal"
import { BookingSuccessCard } from "@/components/booking/booking-success-card"
import type { Booking } from "@/lib/booking-service"

export default function BookPage() {
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string
    time: string
    duration: number
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)

  const handleSelectSlot = (date: string, time: string, duration: number) => {
    setSelectedSlot({ date, time, duration })
    setIsModalOpen(true)
  }

  const handleBookingSuccess = (booking: Booking) => {
    setConfirmedBooking(booking)
    setSelectedSlot(null)
  }

  const handleReset = () => {
    setConfirmedBooking(null)
    setSelectedSlot(null)
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      <Navigation />

      <main>
        {/* Brand Page Hero */}
        <PageHero
          badge="Schedule Consultation"
          title="Book Your Financial Advisory Session"
          description="Schedule a 1-on-1 consultation with Francis J., AMFI Registered Mutual Fund Distributor. Select your preferred date and time from the live availability below."
          image="/images/contact-hero.jpg"
        />

        {/* Booking Module Section */}
        <section className="relative py-12 lg:py-20 bg-section-warm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left/Main Column: Calendar & Booking Card */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {confirmedBooking ? (
                    <BookingSuccessCard
                      key="success"
                      booking={confirmedBooking}
                      onReset={handleReset}
                    />
                  ) : (
                    <motion.div
                      key="calendar"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <BookingCalendarWidget onSelectSlot={handleSelectSlot} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Consultant Profile & Highlights */}
              <div className="lg:col-span-4 space-y-6">
                {/* Consultant Card */}
                <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#B91C1C] text-white font-serif font-bold text-2xl shadow-md shadow-accent/20">
                      FJ
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary">Francis J.</h3>
                      <p className="text-xs text-accent font-semibold">
                        AMFI Registered Mutual Fund Distributor
                      </p>
                      <p className="text-[11px] text-muted-foreground">First Step Consultancy Services</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pb-4 border-b border-border">
                    Over 15+ years guiding retail, HNI, and NRI investors in mutual fund portfolios, PMS, AIF, and structured wealth compounding.
                  </p>

                  <div className="pt-4 space-y-2.5 text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      <span>AMFI Certified & Regulatory Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      <span>Direct 1-on-1 personalized advisory session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      <span>Zero upfront advisory fees</span>
                    </div>
                  </div>
                </div>

                {/* What We Discuss */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-lg space-y-4">
                  <h4 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-accent" />
                    What to Expect in Your Call
                  </h4>
                  <div className="space-y-3 text-xs text-muted-foreground">
                    <div className="rounded-xl border border-border bg-secondary/50 p-3">
                      <p className="font-semibold text-primary">1. Portfolio Diagnostics</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Analyzing risk overlap, underperforming funds, and asset allocation gaps.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/50 p-3">
                      <p className="font-semibold text-primary">2. Goal Alignment</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Structuring SIPs, lumpsum, or PMS strategies mapped to your timeframe.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/50 p-3">
                      <p className="font-semibold text-primary">3. Actionable Next Steps</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Clear recommendations on fund selection and execution with zero lock-in pressure.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Phone / Assistance */}
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 text-center space-y-2 text-xs">
                  <p className="text-muted-foreground font-medium">Need immediate assistance or have urgent queries?</p>
                  <p className="text-sm font-bold text-accent flex items-center justify-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    +91 98400 00000
                  </p>
                  <p className="text-muted-foreground text-[11px]">Mon – Sat • 9:30 AM – 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Booking Form Modal */}
      {selectedSlot && (
        <BookingFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedSlot.date}
          startTime={selectedSlot.time}
          duration={selectedSlot.duration}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
