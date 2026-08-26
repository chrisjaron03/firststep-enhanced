"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import type { PublicEvent } from "@/lib/events-api"

function formatDate(d: string | null) {
  if (!d) return null
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return d
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch { return d }
}

function discountPct(ev: PublicEvent): number | null {
  if (!ev.original_price || ev.original_price <= ev.price) return null
  return Math.round(((ev.original_price - ev.price) / ev.original_price) * 100)
}

export function EventCard({ event, index = 0 }: { event: PublicEvent; index?: number }) {
  const isFree = Boolean((event as PublicEvent & { is_free?: boolean }).is_free)
  const pct = isFree ? null : discountPct(event)
  const curriculum = (event as unknown as { curriculum?: unknown[] }).curriculum
  const totalLessons = Array.isArray(curriculum) ? curriculum.reduce((n: number, m: unknown) => n + (((m as { lessons?: unknown[] })?.lessons?.length) || 0), 0) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <Link
        href={`/events/${event.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--gold)]/30"
      >
        {/* cover */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {event.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.cover_image}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy-mid)] to-accent/20">
              <Calendar className="h-10 w-10 text-card/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {event.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--navy-deep)] shadow">Featured</span>
          )}
          {isFree ? (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow">FREE</span>
          ) : pct !== null ? (
            <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground shadow">{pct}% OFF</span>
          ) : null}
          {isFree && totalLessons > 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-xs font-semibold text-white border border-white/20">{(curriculum as unknown[]).length} Modules • {totalLessons} Lessons</span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-serif text-lg font-bold leading-tight text-foreground line-clamp-2 group-hover:text-accent transition-colors">{event.title}</h3>
          {event.subtitle && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{event.subtitle}</p>}

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {event.event_date && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2.5 py-1">
                <Calendar className="h-3 w-3 text-[var(--gold)]" />{formatDate(event.event_date)}
              </span>
            )}
            {event.venue && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2.5 py-1">
                <MapPin className="h-3 w-3 text-[var(--gold)]" />{event.venue}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-4">
            <div>
              {isFree ? (
                <>
                  <div className="flex items-baseline gap-2"><span className="text-xl font-bold text-emerald-600">FREE</span>{(event as unknown as { value_anchor_price?: number | null }).value_anchor_price ? <span className="text-sm text-muted-foreground line-through">₹{(event as unknown as { value_anchor_price?: number }).value_anchor_price!.toLocaleString("en-IN")}</span> : null}</div>
                  <span className="text-xs text-muted-foreground">Live webinar • {(event as unknown as { duration_mins?: number | null }).duration_mins || 90} mins + Q&A</span>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-foreground">₹{event.price.toLocaleString("en-IN")}</span>
                    {event.original_price && event.original_price > event.price && (
                      <span className="text-sm text-muted-foreground line-through">₹{event.original_price.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{event.original_price && event.original_price > event.price ? "Early bird price" : "Per person"}</span>
                </>
              )}
            </div>
            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2 transition-all ${isFree ? "text-emerald-600" : "text-accent"}`}>View <ArrowRight className="h-4 w-4" /></span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
