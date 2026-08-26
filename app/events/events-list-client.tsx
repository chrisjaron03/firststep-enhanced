"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import { eventsApi, type PublicEvent } from "@/lib/events-api"
import { EventCard } from "@/components/events/event-card"
import { Button } from "@/components/ui/button"

export function EventsListClient() {
  const [events, setEvents] = useState<PublicEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    eventsApi.list().then((r) => {
      if (cancelled) return
      if (r.ok) setEvents(r.data)
      else { setError(r.error || "Failed to load events"); setEvents([]) }
    })
    return () => { cancelled = true }
  }, [])

  if (events === null) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground py-16">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading events...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center">
          <p className="text-sm text-accent">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-dashed border-border bg-secondary/30 px-8 py-16 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--gold)]/10 border border-[var(--gold)]/20">
            <Calendar className="h-7 w-7 text-[var(--gold)]" />
          </div>
          <h2 className="mt-6 font-serif text-2xl font-bold text-foreground">No upcoming events right now</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            We’re planning the next intimate session. Leave your details and we’ll notify you first.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/contact"><Button className="bg-gradient-to-r from-accent to-[#B91C1C] text-accent-foreground gap-2">Get Notified <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/book"><Button variant="outline">Book 1:1 Consultation</Button></Link>
          </div>
        </motion.div>
      </section>
    )
  }

  const featured = events.filter((e) => e.featured)
  const rest = events.filter((e) => !e.featured)

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
      {/* trust strip */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 px-3 py-1.5 text-[var(--gold)] font-semibold"><Sparkles className="h-3.5 w-3.5" />AMFI Registered • 10+ Years • 100+ Families</span>
        <span className="hidden sm:inline text-muted-foreground">— Intimate cohorts, no recordings sold separately.</span>
      </div>

      {featured.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-xl font-bold text-foreground">Featured</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {featured.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">{featured.length ? "All Events" : "Upcoming Events"}</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(featured.length ? rest : events).map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
        </div>
        {/* when there are featured, also show them in the grid for completeness */}
        {featured.length > 0 && rest.length === 0 && null}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">Free webinars are truly free — live interactive session with direct Q&A, no recording sold separately. Paid events show GST-inclusive prices. Past attendees 4.9/5.</p>
    </section>
  )
}
