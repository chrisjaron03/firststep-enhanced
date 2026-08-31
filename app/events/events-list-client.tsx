"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ArrowRight, Sparkles, Loader2, Clock3 } from "lucide-react"
import { eventsApi, isEventEnded, type PublicEvent } from "@/lib/events-api"
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

  const upcoming = events.filter((e) => !isEventEnded(e))
  const ended = events.filter((e) => isEventEnded(e))
  const featuredUpcoming = upcoming.filter((e) => e.featured)
  const restUpcoming = upcoming.filter((e) => !e.featured)

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
      {/* trust strip */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 px-3 py-1.5 text-[var(--gold)] font-semibold"><Sparkles className="h-3.5 w-3.5" />AMFI Registered • 10+ Years • 100+ Families</span>
        <span className="hidden sm:inline text-muted-foreground">— Intimate cohorts, no recordings sold separately.</span>
      </div>

      {upcoming.length === 0 && ended.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <Clock3 className="h-4 w-4" /> All current batches have ended — next dates will be announced soon. You can still view past events below.
        </div>
      )}

      {featuredUpcoming.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-xl font-bold text-foreground">Featured</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {featuredUpcoming.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">{featuredUpcoming.length ? "Upcoming Events" : upcoming.length ? "Upcoming Events" : "Upcoming Events"}</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No upcoming batches open right now. Past events are shown below.</p>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(featuredUpcoming.length ? restUpcoming : upcoming).map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        )}
      </div>

      {ended.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2"><Clock3 className="h-5 w-5 text-zinc-500" /> Past Events • Ended</h2>
          <p className="mt-1 text-sm text-muted-foreground">These batches have completed. Registrations are closed — view details for recordings/slides if shared.</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ended.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">Free webinars are truly free — live interactive session with direct Q&A, no recording sold separately. Paid events show GST-inclusive prices. Past attendees 4.9/5.</p>
    </section>
  )
}
