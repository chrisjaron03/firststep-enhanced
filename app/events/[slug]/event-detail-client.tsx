"use client"

import { useEffect, useState } from "react"
import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Calendar, MapPin, Clock, Users, Check, ShieldCheck,
  ArrowRight, Loader2, AlertCircle, Play, Image as ImageIcon, Star,
  Timer, Award, MessageCircle, PiggyBank, Shield, TrendingUp, Wallet,
  Target, BookOpen, GraduationCap, XCircle, ChevronRight, Download, Lightbulb
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { CountdownTimer } from "@/components/events/countdown-timer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { eventsApi, type PublicEvent, downloadIcs } from "@/lib/events-api"
import { api } from "@/lib/api"

// Fallbacks matching MONEY_BLUEPRINT_TEMPLATE for when admin leaves structured fields empty
const FALLBACK_LEARN = [
  "01 — Master Your Money — Income, savings, needs/wants, emergency fund",
  "02 — Protect Before You Grow — Term, health insurance, protection gap",
  "03 — Use the Power of Time — Inflation, compounding, cost of delay",
  "04 — Know Where Your Money Belongs — FD, gold, real estate, mutual funds, SIP/lumpsum",
]
const FALLBACK_OUTCOMES = [
  "A simple framework to separate income, savings and wealth creation",
  "A clearer way to think about emergency reserves and protection",
  "A practical understanding of inflation and compounding",
  "A framework for comparing investment categories by purpose, time and risk",
  "A starting point for connecting investments to short-, medium- and long-term goals",
  "A personal checklist of areas that may need review",
]
const FALLBACK_FOR_YOU = [
  "You earn a regular income but do not have a structured financial plan",
  "You invest but are unsure whether everything is properly allocated",
  "You have insurance but are unsure about the adequacy of protection",
  "You have SIPs or FDs without clearly defined goals",
  "You are building wealth for family, education or retirement",
]
const FALLBACK_NOT_FOR = [
  "You want guaranteed returns",
  "You want a stock tip or “next multibagger”",
  "You want a single investment product to solve everything",
  "You expect a one-size-fits-all portfolio",
]
const FALLBACK_FLOW = [
  "Money structure → Cash flow & emergency",
  "Protection → Term & health shield",
  "Time → Inflation & compounding",
  "Investment choices → Mutual funds, equity/debt, SIP vs lumpsum",
  "Goal-based investing → Align money to goals",
  "Personal Money Check → Live gap scan",
  "Q&A → Build your personal plan + optional Money Clarity Session",
]
const FALLBACK_CURRICULUM: { title: string; lessons: string[] }[] = [
  { title: "Module 1: Money Foundations", lessons: ["What is money, income vs wealth", "Needs vs wants — budgeting basics", "Cash flow: income, expenses, savings", "Emergency fund — why and how much"] },
  { title: "Module 2: Understanding Risk & Protection First", lessons: ["Why protection comes before investment", "Term insurance — the foundation", "Health insurance — protecting your savings", "Common mistakes: mixing insurance with investment (endowment/ULIP traps)"] },
  { title: "Module 3: The Time Value of Money", lessons: ["Inflation — the silent wealth killer", "Power of compounding (with real number examples)", "Why starting early beats investing more later"] },
  { title: "Module 4: Understanding Investment Options", lessons: ["Fixed deposits, gold, real estate — traditional options and their limits", "What is a mutual fund — demystified", "Equity vs debt — risk and return basics", "SIP vs lumpsum — which suits whom"] },
  { title: "Module 5: Goal-Based Investing", lessons: ["Setting financial goals (short/medium/long term)", "Matching investments to goals (child education, retirement, house)", "Asset allocation basics"] },
  { title: "Module 6: Going Deeper", lessons: ["Types of mutual funds (large cap, mid cap, hybrid, debt)", "Understanding risk profiling", "Tax-efficient investing (ELSS, LTCG/STCG basics)", "NRI-specific: NRE/NRO, DTAA, repatriation basics"] },
  { title: "Module 7: Advanced/Wealth Stage", lessons: ["PMS and AIF — when you outgrow mutual funds", "GIFT City — global investment access for NRIs", "Retirement corpus planning — building your income machine"] },
  { title: "Module 8: Action", lessons: ["How to start — practical first steps", "Common behavioral mistakes (panic selling, chasing returns)", "Q&A / building your personal financial plan"] },
]

function formatDateLong(d: string | null) {
  if (!d) return "Date to be announced"
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return d
    return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  } catch { return d || "" }
}
function formatDateShort(d: string | null) {
  if (!d) return "TBA"
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return d
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch { return d || "" }
}
function formatTimeIST(d: string | null, tz: string) {
  if (!d) return ""
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return ""
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: tz || "Asia/Kolkata" }) + " IST"
  } catch { return "" }
}
function youtubeId(url: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] || null
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v")
  } catch {}
  return null
}

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>()
  const pathname = usePathname()
  const rawSlug = (params?.slug as string) || ""
  const pathSlug = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : ""
  const pathnameSlug = pathname ? pathname.split("/").pop() || "" : ""
  const slug = rawSlug && rawSlug !== "placeholder" ? rawSlug : (pathnameSlug && pathnameSlug !== "placeholder" ? pathnameSlug : pathSlug)
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    eventsApi.getBySlug(slug).then((r) => {
      if (cancelled) return
      if (r.ok && r.data) setEvent(r.data)
      else setError(r.error || "Event not found")
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [slug])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!name.trim() || !email.trim()) { setFormError("Name and email are required."); return }
    setSubmitting(true)
    if (event) {
      const reg = await eventsApi.register({ event_id: event.id, name: name.trim(), email: email.trim(), phone: phone.trim() || undefined })
      if (!reg.ok) {
        await api.submitLead({ source: "general-guide", name: name.trim(), email: email.trim(), phone: phone.trim(), page_url: typeof window !== "undefined" ? window.location.href : undefined })
        if (reg.error?.toLowerCase().includes("fully booked")) {
          setFormError(reg.error)
          setSubmitting(false)
          return
        }
      } else {
        api.submitLead({ source: "general-guide", name: name.trim(), email: email.trim(), phone: phone.trim(), page_url: typeof window !== "undefined" ? window.location.href : undefined })
      }
    } else {
      await api.submitLead({ source: "general-guide", name: name.trim(), email: email.trim(), phone: phone.trim(), page_url: typeof window !== "undefined" ? window.location.href : undefined })
    }
    setSuccess(event?.is_free ? "You’re in! Zoom link + calendar invite on the next screen. We’ll also send the link to your WhatsApp/email within 15 minutes." : "You’re in! We’ve reserved your seat — confirmation on WhatsApp/email shortly.")
    setSubmitting(false)
    setName(""); setEmail(""); setPhone("")
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading event...</div>
        <Footer />
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Navigation />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-accent/60" />
          <h1 className="mt-4 font-serif text-2xl font-bold">Event not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error || "This event may have been removed or is no longer published."}</p>
          <Link href="/events" className="mt-6 inline-flex"><Button variant="outline">Back to Events</Button></Link>
        </div>
        <Footer />
      </>
    )
  }

  const isFree = Boolean(event.is_free)
  const pct = event.original_price && event.original_price > event.price ? Math.round(((event.original_price - event.price) / event.original_price) * 100) : null
  const remaining = event.max_seats !== null ? Math.max(0, event.max_seats - event.seats_sold) : null
  const isSoldOut = remaining !== null && remaining <= 0
  const vid = youtubeId(event.video_url)
  const agenda = Array.isArray(event.agenda) ? (event.agenda as string[]).filter(Boolean) : []
  const gallery = Array.isArray(event.gallery) ? event.gallery : [] as { type: 'image' | 'video'; url: string; alt?: string }[]
  const curriculum = (event.curriculum && event.curriculum.length ? event.curriculum : (isFree ? FALLBACK_CURRICULUM : [])) as { title: string; lessons: string[] }[]
  const learnItems = event.learn_items.length ? event.learn_items : (isFree ? FALLBACK_LEARN : [])
  const outcomes = event.outcomes.length ? event.outcomes : (isFree ? FALLBACK_OUTCOMES : [])
  const forYou = event.for_you.length ? event.for_you : (isFree ? FALLBACK_FOR_YOU : [])
  const notForYou = event.not_for_you.length ? event.not_for_you : (isFree ? FALLBACK_NOT_FOR : [])
  const insideFlow = event.inside_flow.length ? event.inside_flow : (isFree ? FALLBACK_FLOW : [])
  const totalLessons = curriculum.reduce((n, m) => n + (m.lessons?.length || 0), 0)

  const ctaHref = isSoldOut ? "/contact" : (event.cta_url || "#register")
  const ctaLabel = isSoldOut ? "Join Waitlist" : event.cta_label

  const pillDate = `${formatDateShort(event.event_date)}${formatTimeIST(event.event_date, event.timezone) ? ` • ${formatTimeIST(event.event_date, event.timezone)}` : ""}`
  const heroBadge = isFree ? "FREE LIVE WEBINAR" : "LIVE EVENT"
  const metaPills = [
    { icon: Calendar, text: event.event_date ? `${formatDateLong(event.event_date)} • ${formatTimeIST(event.event_date, event.timezone) || "Online Live"}` : "Date to be announced" },
    { icon: Clock, text: event.duration_mins ? `${event.duration_mins} Mins • ${event.language || "English"}` : (event.delivery_mode === "online" ? "Live Online" : event.venue || "Live") },
    { icon: MapPin, text: event.delivery_mode === "online" ? "Online — Zoom (link after registration)" : (event.venue || "Venue TBA") },
  ]

  return (
    <>
      <Navigation />
      <main className="pb-16">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            {event.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.cover_image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[var(--navy-deep)] via-[#1a2744] to-accent/20" />
            )}
            <div className="absolute inset-0 bg-[var(--navy-deep)]/85" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--gold)]/[0.08] via-transparent to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-10 lg:px-8 lg:pt-36 lg:pb-12">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${isFree ? "bg-emerald-500 text-white shadow" : "bg-accent text-white shadow"}`}>{heroBadge}</span>
                {event.featured && <span className="rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--navy-deep)]">Featured</span>}
                {isFree && event.value_anchor_price ? <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur">Worth ₹{event.value_anchor_price.toLocaleString("en-IN")} — FREE Today</span> : null}
                {!isFree && pct !== null && <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">{pct}% Early Bird</span>}
              </div>

              <p className="mt-3 text-sm font-semibold tracking-[0.18em] text-[var(--gold)] uppercase">{event.tagline || (isFree ? "Earn. Protect. Grow. Build." : "")}</p>
              <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl text-balance">{event.title}</h1>
              {event.subtitle && <p className="mt-3 text-lg font-medium text-white sm:text-xl">{event.subtitle}</p>}
              {isFree && !event.subtitle && <p className="mt-3 text-lg text-white/85">Earn Better. Protect Better. Invest Better. Plan Better.</p>}

              <div className="mt-5 flex flex-wrap gap-2">
                {metaPills.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur border border-white/15 text-sm text-white/90">
                    <p.icon className="h-4 w-4 text-[var(--gold)]" />{p.text}
                  </span>
                ))}
                {remaining !== null && <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold border backdrop-blur text-sm ${remaining <= 20 ? "bg-accent text-white border-accent" : "bg-white/10 text-white border-white/15"}`}><Users className="h-4 w-4" />{isSoldOut ? "Sold out — waitlist open" : `${remaining} seats left`}</span>}
              </div>

              {isFree ? (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-2xl bg-emerald-500 px-5 py-2.5 text-lg font-bold text-white shadow">FREE</span>
                  {event.value_anchor_price && <span className="text-white/60 line-through text-sm">Worth ₹{event.value_anchor_price.toLocaleString("en-IN")}</span>}
                  <span className="text-xs text-white/60">No card required • No product push — education first • Live Q&A</span>
                </div>
              ) : (
                <div className="mt-6 inline-flex items-baseline gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur">
                  <span className="text-3xl font-bold text-white">₹{event.price.toLocaleString("en-IN")}</span>
                  {event.original_price && event.original_price > event.price && (
                    <>
                      <span className="text-base text-white/60 line-through">₹{event.original_price.toLocaleString("en-IN")}</span>
                      <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">Save ₹{(event.original_price - event.price).toLocaleString("en-IN")}</span>
                    </>
                  )}
                </div>
              )}
              <p className="mt-2 text-xs text-white/60">{isFree ? "100% free, limited live seats on Zoom. Replay not guaranteed." : "Transparent pricing. No hidden fees. GST included where applicable."}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={ctaHref.startsWith("#") ? ctaHref : ctaHref}><Button size="lg" className={`${isFree ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gradient-to-r from-accent to-[#B91C1C] hover:from-[#B91C1C] hover:to-accent"} text-white gap-2 shadow-lg px-7`}>{ctaLabel} <ArrowRight className="h-4 w-4" /></Button></a>
                <Link href="/contact"><Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur">Talk to Advisor</Button></Link>
              </div>

              {isFree && curriculum.length > 0 && <p className="mt-4 inline-flex items-center gap-2 text-xs text-white/70"><GraduationCap className="h-4 w-4 text-[var(--gold)]" /> {curriculum.length} Modules • {totalLessons} Lessons • {event.duration_mins || 90} Mins live + Q&A</p>}

              {event.event_date && new Date(event.event_date).getTime() > Date.now() && (
                <div className="mt-8">
                  <p className="text-xs uppercase tracking-widest text-white/60 mb-2 flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" /> Event starts in</p>
                  <CountdownTimer targetDate={event.event_date} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* trust strip */}
        <div className="border-y border-border bg-secondary/40">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-6 py-3 text-xs lg:px-8">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Award className="h-4 w-4 text-[var(--gold)]" /> AMFI ARN-335677 • 10+ Years</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Star className="h-4 w-4 text-[var(--gold)] fill-[var(--gold)]" /> 4.9/5 from past attendees</span>
            <span className="hidden sm:inline text-border">•</span>
            {isFree ? <span className="inline-flex items-center gap-1.5 text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> No selling • Education first</span> : <span className="inline-flex items-center gap-1.5 text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Refundable within 7 days</span>}
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:px-8 lg:grid-cols-[1.65fr_0.85fr]">
          <div className="space-y-8">
            {/* scarcity honest */}
            {remaining !== null && remaining > 0 && remaining <= 25 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-4 ${isFree ? "border-emerald-500/20 bg-emerald-500/5" : "border-accent/20 bg-accent/5"}`}>
                <p className={`text-sm font-semibold flex items-center gap-2 ${isFree ? "text-emerald-700" : "text-accent"}`}><Users className="h-4 w-4" /> Only {remaining} seats left {isFree ? "on live Zoom" : "at early-bird price"}</p>
                <div className={`mt-2 h-2 rounded-full overflow-hidden ${isFree ? "bg-emerald-500/15" : "bg-accent/15"}`}><div className={`h-full transition-all ${isFree ? "bg-emerald-500" : "bg-accent"}`} style={{ width: `${event.max_seats ? Math.round((event.seats_sold / event.max_seats) * 100) : 50}%` }} /></div>
                <p className="mt-1.5 text-xs text-muted-foreground">{event.seats_sold} registered • {event.max_seats} capacity • First-come live. No fake urgency.</p>
              </motion.div>
            )}

            {/* Problem section */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-[var(--gold)]" /> You earn money. But do you have a money system?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Salary comes in. Bills go out. Some money goes into FD, some into insurance, some into SIPs and some stays in the bank. But is everything working together? Most families earn well yet drift without a coordinated system for earning, protecting, and building wealth.</p>
              <div className="mt-4 grid gap-2 text-sm">
                {["Money scattered across FD, insurance, SIPs, bank — no single view", "Protection confused with investment (endowment/ULIP traps)", "Inflation quietly eroding what you save"].map((t) => (
                  <span key={t} className="flex items-start gap-2"><XCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" /><span>{t}</span></span>
                ))}
              </div>
              {event.description && <div className="mt-4 rounded-xl bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap border border-border">{event.description}</div>}
            </div>

            {/* What you'll learn 01-04 */}
            {learnItems.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold">What You&apos;ll Learn</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {learnItems.map((item, i) => {
                    const icons = [PiggyBank, Shield, TrendingUp, Wallet]
                    const Icon = icons[i % icons.length]
                    return (
                      <div key={i} className="rounded-xl border border-border bg-secondary/30 p-4">
                        <Icon className="h-6 w-6 text-[var(--gold)]" />
                        <p className="mt-2 text-sm font-semibold leading-snug">{item.replace(/^[0-9]+[—\-–]+\s*/, "")}</p>
                        <span className="mt-1 inline-flex rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 px-2 py-0.5 text-xs font-bold text-[var(--gold)]">0{i + 1}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Curriculum accordion */}
            {curriculum.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-serif text-xl font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-[var(--gold)]" /> Inside the Webinar — {curriculum.length} Modules • {totalLessons} Lessons</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Earn → Protect → Time → Investment → Goals → Deeper → Wealth → Action</p>
                <Accordion type="single" collapsible className="mt-4 w-full">
                  {curriculum.map((mod, i) => (
                    <AccordionItem key={i} value={`m-${i}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="flex items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--navy-deep)] text-xs font-bold text-white">{String(i + 1).padStart(2, "0")}</span>
                          <span className="font-semibold text-sm">{mod.title}</span>
                          <span className="rounded-full bg-secondary border border-border px-2 py-0.5 text-xs text-muted-foreground">{mod.lessons.length} lessons</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="ml-10 space-y-1.5">
                          {mod.lessons.map((ls, j) => (
                            <li key={j} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /><span>{ls}</span></li>
                          ))}
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* fallback agenda if no curriculum and not free */}
            {curriculum.length === 0 && agenda.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-[var(--gold)]" /> Agenda</h2>
                <ol className="mt-4 space-y-3">
                  {agenda.map((item, i) => (
                    <li key={i} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-xs font-bold text-[var(--navy-deep)]">{i + 1}</span><span className="pt-0.5 text-sm leading-relaxed">{item}</span></li>
                  ))}
                </ol>
              </div>
            )}

            {/* video */}
            {vid ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-black shadow">
                <div className="aspect-video"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${vid}`} title="Event video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
              </div>
            ) : event.video_url ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-black shadow"><video controls src={event.video_url} className="w-full aspect-video object-contain bg-black" /></div>
            ) : null}

            {/* Outcomes */}
            {outcomes.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold flex items-center gap-2"><Target className="h-5 w-5 text-[var(--gold)]" /> What you will walk away with</h2>
                <ul className="mt-4 space-y-2">
                  {outcomes.map((o, i) => (
                    <li key={i} className="flex gap-3 text-sm"><Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" /><span>{o}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* For you / Not for you */}
            {(forYou.length > 0 || notForYou.length > 0) && (
              <div className="grid gap-4 md:grid-cols-2">
                {forYou.length > 0 && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                    <h3 className="font-semibold text-emerald-700 flex items-center gap-2"><Users className="h-4 w-4" /> This webinar is for you if…</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {forYou.map((t, i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /><span>{t}</span></li>)}
                    </ul>
                  </div>
                )}
                {notForYou.length > 0 && (
                  <div className="rounded-2xl border border-accent/15 bg-accent/5 p-6">
                    <h3 className="font-semibold text-accent flex items-center gap-2"><XCircle className="h-4 w-4" /> This is NOT for you if…</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {notForYou.map((t, i) => <li key={i} className="flex gap-2"><XCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" /><span>{t}</span></li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Inside flow */}
            {insideFlow.length > 0 && (
              <div className="rounded-2xl border border-border bg-secondary/30 p-6">
                <h2 className="font-serif text-lg font-bold flex items-center gap-2"><GraduationCap className="h-5 w-5 text-[var(--gold)]" /> What is inside the webinar?</h2>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {insideFlow.map((step, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      <span className="rounded-full bg-[var(--navy-deep)] px-3 py-1.5 text-xs font-semibold text-white">{step}</span>
                      {i < insideFlow.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Flow: Money structure → Protection → Time → Investment choices → Goal-based investing → Personal Money Check → Q&A → optional Money Clarity Session</p>
              </div>
            )}

            {/* gallery */}
            {gallery.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-[var(--gold)]" /> Gallery</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {gallery.map((m, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-border bg-muted">
                      {m.type === "video" ? (
                        m.url.includes("youtube") || m.url.includes("youtu.be") ? (
                          (() => { const id = youtubeId(m.url); return id ? <iframe className="aspect-video w-full" src={`https://www.youtube.com/embed/${id}`} title={m.alt || `Video ${i+1}`} allowFullScreen /> : <video controls src={m.url} className="w-full aspect-video" /> })()
                        ) : (
                          <video controls src={m.url} className="w-full aspect-video object-contain bg-black" />
                        )
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt={m.alt || event.title} className="w-full aspect-video object-cover" loading="lazy" />
                      )}
                      {m.alt && <p className="px-3 py-2 text-xs text-muted-foreground">{m.alt}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* instructor + why free */}
            <div className="rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-6">
              <h3 className="font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-[var(--gold)]" /> Led by Francis J. — Your Money Guide</h3>
              <div className="mt-4 flex gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--gold)]/20 bg-white">
                  <Image src="/images/francis-j.jpeg" alt="Francis J." width={64} height={64} className="h-full w-full object-cover" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold">AMFI-Registered Mutual Fund Distributor (ARN-335677) • 10+ Years • 100+ Families</p>
                  <p className="mt-1 text-muted-foreground leading-relaxed">Institution-grade guidance translated for individuals. No jargon, no product push — just a clear system you can act on. Positioning: {event.tagline || "Earn. Protect. Grow. Build."}</p>
                </div>
              </div>
              {(event.instructor_note || isFree) && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
                  <p className="font-semibold text-emerald-700 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Why is this FREE?</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{event.instructor_note || "We teach the system free — no stock tips, no guaranteed returns, no single-product pitch. If you want us to implement it for you (Mutual Funds / PMS / AIF / GIFT City), you can book a 1:1 Money Clarity Session after — no obligation, education first."}</p>
                </div>
              )}
              <blockquote className="mt-4 border-l-2 border-[var(--gold)] pl-4 text-sm italic text-muted-foreground">“Finally an event that didn’t sell me anything — just gave me a clear plan. Worth every rupee.” — S.R., Pune</blockquote>
            </div>
          </div>

          {/* RIGHT sticky */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            <div id="register" className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <h3 className="font-serif text-lg font-bold">{isSoldOut ? "Join Waitlist" : isFree ? "Reserve My Free Seat" : "Reserve your seat"}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{isSoldOut ? "We’ll notify you if a seat opens." : isFree ? "Zoom link sent instantly + calendar invite. No spam, no card." : "Secure checkout — pay at venue or via link shared after confirmation."}</p>

              <div className={`mt-4 rounded-xl border p-4 ${isFree ? "border-emerald-500/20 bg-emerald-500/5" : "border-[var(--gold)]/20 bg-[var(--gold)]/5"}`}>
                {isFree ? (
                  <div className="flex items-baseline gap-2"><span className="text-2xl font-bold text-emerald-600">FREE</span>{event.value_anchor_price && <><span className="text-sm text-muted-foreground line-through">₹{event.value_anchor_price.toLocaleString("en-IN")}</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">Worth ₹{event.value_anchor_price.toLocaleString("en-IN")}</span></>}<span className="ml-auto text-xs font-semibold text-emerald-700">Limited live seats</span></div>
                ) : (
                  <div className="flex items-baseline gap-2"><span className="text-2xl font-bold">₹{event.price.toLocaleString("en-IN")}</span>{event.original_price && event.original_price > event.price && <><span className="text-sm text-muted-foreground line-through">₹{event.original_price.toLocaleString("en-IN")}</span><span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">{pct}% OFF</span></>}</div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{isFree ? "Free live webinar — replay not guaranteed." : "One-time fee. Includes materials & refreshments where applicable."}</p>
                {remaining !== null && <p className={`mt-2 text-xs font-semibold ${isFree ? "text-emerald-600" : "text-accent"}`}>{isSoldOut ? "Sold out" : `${remaining} seats remaining • ${pillDate}`}</p>}
              </div>

              {success ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700">
                    <p className="font-semibold flex items-center gap-2"><Check className="h-4 w-4" /> {success}</p>
                  </div>
                  <Button onClick={() => event && downloadIcs(event)} variant="outline" className="w-full gap-2"><Download className="h-4 w-4" /> Add to Calendar (.ics)</Button>
                  <a href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi, I registered for ${event.title} — please share the Zoom link. Email: ${email || "my email"}`)}`} target="_blank" rel="noreferrer" className="block text-center text-xs text-muted-foreground hover:text-foreground">Need help? WhatsApp us →</a>
                  <Link href="/events" className="block text-center text-xs font-semibold underline">Browse more events</Link>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="mt-5 space-y-3">
                  <div><label className="text-xs font-medium">Full name *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" required /></div>
                  <div><label className="text-xs font-medium">Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" required /></div>
                  <div><label className="text-xs font-medium">Phone (WhatsApp for Zoom link) *</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                  {formError && <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent border border-accent/20">{formError}</p>}
                  <Button type="submit" disabled={submitting} className={`w-full gap-2 py-6 text-base shadow-md ${isFree ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gradient-to-r from-accent to-[#B91C1C] text-accent-foreground"}`}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4" /> {ctaLabel}</>}
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">{isFree ? "No card • No spam • Zoom link via WhatsApp/email in ~15 mins." : "No spam. Refund within 7 days if you change your mind."}</p>
                  {ctaHref && !ctaHref.startsWith("#") && <a href={ctaHref} target="_blank" rel="noreferrer" className="block text-center text-xs text-accent underline">Or pay directly →</a>}
                </form>
              )}
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-4"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure & private. Your details are never shared.</div>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-5">
              <h4 className="text-sm font-semibold">Event details</h4>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-medium">{formatDateLong(event.event_date)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Time</dt><dd className="font-medium">{formatTimeIST(event.event_date, event.timezone) || "TBA"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Duration</dt><dd className="font-medium">{event.duration_mins ? `${event.duration_mins} mins` : "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Mode</dt><dd className="font-medium capitalize">{event.delivery_mode}</dd></div>
                {event.venue && <div className="flex justify-between"><dt className="text-muted-foreground">Venue</dt><dd className="font-medium text-right max-w-[150px]">{event.venue}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted-foreground">Language</dt><dd className="font-medium">{event.language}</dd></div>
              </dl>
              <Button variant="outline" className="mt-4 w-full gap-2" onClick={() => event && downloadIcs(event)}><Calendar className="h-4 w-4" /> Add to Calendar</Button>
              <Link href="/contact" className="mt-3 block text-center text-xs font-semibold text-accent underline">Questions? Contact us</Link>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-7xl px-6 text-center text-xs text-muted-foreground lg:px-8">We show real scarcity and honest value only — no dark patterns, no fake urgency. FREE means FREE.</p>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
