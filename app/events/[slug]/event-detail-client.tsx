"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, MapPin, Clock, Users, Check, ShieldCheck,
  ArrowRight, Loader2, AlertCircle, Play, Image as ImageIcon, Star,
  Timer, Award, MessageCircle, PiggyBank, Shield, TrendingUp, Wallet,
  Target, BookOpen, GraduationCap, XCircle, ChevronRight, Download, Lightbulb, Lock,
  Video, Sparkles, Quote, HelpCircle, ExternalLink, Copy, CheckCircle2, Gift, Zap, Eye
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { CountdownTimer } from "@/components/events/countdown-timer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { eventsApi, type PublicEvent, downloadIcs } from "@/lib/events-api"
import { api } from "@/lib/api"

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

const TESTIMONIALS = [
  { name: "S.R., Pune", role: "IT Manager, 2 kids", quote: "Finally an event that didn’t sell me anything — just gave me a clear plan. The 5 decisions framework is what we use for every money talk at home now.", stars: 5 },
  { name: "Ananya M.", role: "Doctor, Coimbatore", quote: "Protected first, then invested. Realised my old ULIP was costing me lakhs. This one session saved me years of wrong decisions.", stars: 5 },
  { name: "Vikram & Priya", role: "NRI Couple, Dubai", quote: "GIFT City + NRE/NRO clarity alone was worth it. Education-first, no pushing. Booked the follow-up clarity session same day.", stars: 5 },
]

const FAQS = [
  { q: "Is this really FREE? What’s the catch?", a: "100% free, no card required. No stock tips, no guaranteed returns, no single-product pitch. We teach the system. If you want us to implement it (MF / PMS / AIF / GIFT City), you can book an optional 1:1 Money Clarity Session after — no obligation." },
  { q: "I can’t attend live — will there be a replay?", a: "We prioritise live attendees. Replay is not guaranteed and is shared only with registered members for 48 hours if available. Register & join the WhatsApp community to get the link and updates." },
  { q: "Is it for beginners or already-invested families?", a: "Both. If you earn but drift without a system, or you have SIPs/FDs/insurance but they’re not goal-mapped — this connects the dots." },
  { q: "Zoom or Google Meet? How do I join?", a: "We use Zoom / Google Meet (link shown on the next screen after you register + sent to your WhatsApp & email within 15 mins). Join the WhatsApp community to never miss the link or reminders." },
  { q: "Will you sell insurance / ULIPs?", a: "No. We are AMFI-registered MFD + wealth advisors. We explain why protection ≠ investment and expose endowment/ULIP traps. Protection first, then wealth — transparently." },
  { q: "What should I keep ready?", a: "Just 90 mins, a notebook, and rough idea of income / EMI / SIP / insurance you already have. Optional: past policy statements for the live gap scan." },
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
function getMeetingLabel(link: string | null) {
  if (!link) return "Join Live"
  if (link.includes("zoom")) return "Join on Zoom"
  if (link.includes("meet.google.com")) return "Join on Google Meet"
  if (link.includes("teams")) return "Join on Teams"
  return "Join Live Session"
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
  const [copied, setCopied] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const [viewed, setViewed] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const registerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    eventsApi.getBySlug(slug).then((r) => {
      if (cancelled) return
      if (r.ok && r.data) setEvent(r.data as PublicEvent)
      else setError(r.error || "Event not found")
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 600)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  useEffect(() => {
    if (!event) return
    try { if (typeof window !== "undefined" && localStorage.getItem(`fscs_unlocked_${event.slug}`)) setUnlocked(true) } catch {}
    const base = event.seats_sold + 38 + Math.floor(Math.random() * 9)
    setViewed(base)
    const id = setInterval(() => setViewed((v) => v + (Math.random() > 0.6 ? 2 : 1)), 6500)
    return () => clearInterval(id)
  }, [event?.seats_sold])

  const scrollToRegister = () => registerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!name.trim() || !email.trim()) { setFormError("Name and email are required."); return }
    if (!phone.trim()) { setFormError("WhatsApp number is required — we send the joining link there."); return }
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
    setSuccess("You’re in! Your joining links are below — join the WhatsApp community first so you never miss the reminder.")
    setSubmitting(false)
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
  const gallery = Array.isArray(event.gallery) ? event.gallery as { type: "image" | "video"; url: string; alt?: string }[] : []
  const curriculum = (event.curriculum && event.curriculum.length ? event.curriculum : (isFree ? FALLBACK_CURRICULUM : [])) as { title: string; lessons: string[] }[]
  const learnItems = event.learn_items.length ? event.learn_items : (isFree ? FALLBACK_LEARN : [])
  const outcomes = event.outcomes.length ? event.outcomes : (isFree ? FALLBACK_OUTCOMES : [])
  const forYou = event.for_you.length ? event.for_you : (isFree ? FALLBACK_FOR_YOU : [])
  const notForYou = event.not_for_you.length ? event.not_for_you : (isFree ? FALLBACK_NOT_FOR : [])
  const insideFlow = event.inside_flow.length ? event.inside_flow : (isFree ? FALLBACK_FLOW : [])
  const totalLessons = curriculum.reduce((n, m) => n + (m.lessons?.length || 0), 0)
  const meetingLink = (event as unknown as { meeting_link?: string | null }).meeting_link || "https://meet.google.com/firststep-blueprint"
  const waLink = (event as unknown as { whatsapp_community_link?: string | null }).whatsapp_community_link || "https://chat.whatsapp.com/FIRSTSTEP_MONEY_BLUEPRINT"
  const ctaHref = isSoldOut ? "/contact" : (event.cta_url || "#register")
  const ctaLabel = isSoldOut ? "Join Waitlist" : event.cta_label
  const pillDate = event.event_date ? formatDateShort(event.event_date) + (formatTimeIST(event.event_date, event.timezone) ? " • " + formatTimeIST(event.event_date, event.timezone) : "") : "TBA"
  const heroBadge = isFree ? "FREE LIVE WEBINAR" : "LIVE EVENT"

  return (
    <>
      <Navigation />
      <main className="pb-24">
        {/* URGENCY BAR */}
        <div className="sticky top-[64px] z-30 border-b border-white/10 bg-[var(--navy-deep)] text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-2.5 lg:px-8 text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 font-bold text-white shadow"><Zap className="h-3 w-3" /> LIVE</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-white/80"><Calendar className="h-3.5 w-3.5 text-[var(--gold)]" /> {event.event_date ? formatDateLong(event.event_date) : "TBA"} • {formatTimeIST(event.event_date, event.timezone) || "7:00 PM IST"}</span>
              {remaining !== null && <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-semibold backdrop-blur"><Users className="h-3.5 w-3.5" /> {isSoldOut ? "Sold out — waitlist open" : remaining + " seats left"}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-white/60">Worth ₹{(event.value_anchor_price || 1999).toLocaleString("en-IN")} <span className="text-emerald-400 font-bold">FREE today</span> • No card • No spam</span>
              <button onClick={scrollToRegister} className="rounded-full bg-emerald-500 px-4 py-1.5 font-bold text-white hover:bg-emerald-600 transition">Reserve My Seat →</button>
            </div>
          </div>
        </div>

        {/* spacer between LIVE bar and hero */}
        <div className="h-4 bg-[#0d1528] lg:h-5" aria-hidden />

        {/* HERO — split landing */}
        <section className="relative overflow-hidden bg-[var(--navy-deep)] border-t border-white/[0.04]">
          <div className="absolute inset-0">
            {event.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.cover_image} alt="" className="h-full w-full object-cover opacity-30" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[var(--navy-deep)] via-[#1a2744] to-accent/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy-deep)] via-[var(--navy-deep)]/90 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--gold)]/[0.12] via-transparent to-transparent" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-12 lg:px-8 lg:pt-16 lg:pb-16">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] items-start">
              {/* LEFT */}
              <div className="pt-8">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">{heroBadge}</span>
                  {event.featured && <span className="rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--navy-deep)]">Featured</span>}
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur">Worth ₹{(event.value_anchor_price || 1999).toLocaleString("en-IN")} — FREE Today</span>
                  {!isFree && pct !== null && <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">{pct}% Early Bird</span>}
                </div>

                <p className="mt-3 text-sm font-semibold tracking-[0.18em] text-[var(--gold)] uppercase">{event.tagline || "Earn. Protect. Grow. Build."}</p>
                <h1 className="mt-2 font-serif text-[2rem] font-extrabold leading-[1.05] text-white sm:text-4xl lg:text-[3rem] text-balance">{event.title}</h1>
                {event.subtitle && <p className="mt-4 text-lg font-semibold text-white sm:text-xl lg:text-2xl leading-snug">{event.subtitle}</p>}
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85">In 90 mins, understand the <span className="text-white font-semibold">5 money decisions</span> that move you from earning & saving to managing money with purpose — live, practical, no jargon.</p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur border border-white/15 text-sm text-white/90"><Calendar className="h-4 w-4 text-[var(--gold)]" />{event.event_date ? formatDateLong(event.event_date) + " • " + (formatTimeIST(event.event_date, event.timezone) || "7 PM IST") : "Date TBA"}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur border border-white/15 text-sm text-white/90"><Clock className="h-4 w-4 text-[var(--gold)]" />{event.duration_mins || 90} Mins • {event.language || "English"} • Live Q&A</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur border border-white/15 text-sm text-white/90"><Video className="h-4 w-4 text-emerald-400" />{meetingLink.includes("zoom") ? "Zoom" : meetingLink.includes("meet.google") ? "Google Meet" : "Live Online"} • Link after registration</span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/70">
                  <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-[var(--gold)] fill-[var(--gold)]" /> 4.9/5 from 200+ families</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="inline-flex items-center gap-1.5"><Award className="h-4 w-4 text-[var(--gold)]" /> AMFI ARN-335677 • 10+ Years</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> No selling • Education first</span>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <div className="flex -space-x-2">
                    {["/images/francis-j.jpeg","/images/about-team.jpg","/images/services-hero.jpg"].map((s,i)=>(
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={s} alt="" className="h-8 w-8 rounded-full border-2 border-[var(--navy-deep)] object-cover" />
                    ))}
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--navy-deep)] bg-[var(--gold)] text-xs font-bold text-[var(--navy-deep)]">+{event.seats_sold}</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">{event.seats_sold} registered • Only {remaining} seats left</p>
                    <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-emerald-500 transition-all" style={{ width: event.max_seats ? Math.round((event.seats_sold / event.max_seats)*100)+"%" : "73%" }} /></div>
                  </div>
                  <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-white/60">Replay not guaranteed • Live only</div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={scrollToRegister} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-base font-bold text-white shadow-lg hover:bg-emerald-600">Reserve My Free Seat <ArrowRight className="h-4 w-4" /></button>
                  <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white shadow hover:bg-[#20bd5a]"><MessageCircle className="h-5 w-5" /> Join WhatsApp Community</a>
                </div>
                <p className="mt-2 text-xs text-white/50">No card required • Zoom/Meet link via WhatsApp & email within 15 mins after registration.</p>

                {event.event_date && new Date(event.event_date).getTime() > Date.now() && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-widest text-white/60 mb-2 flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" /> Starts in</p>
                    <CountdownTimer targetDate={event.event_date} />
                  </div>
                )}
              </div>

              {/* RIGHT — sticky registration */}
              <div ref={registerRef} id="register" className="lg:sticky lg:top-32 h-fit">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                  <div className="bg-gradient-to-r from-[var(--navy-deep)] to-[#1a2744] px-6 py-4 text-white">
                    <p className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Secure Your Live Seat • Free</p>
                    <h3 className="font-serif text-xl font-bold leading-tight mt-1">{isSoldOut ? "Join Waitlist" : "Reserve My Free Seat"}</h3>
                    <p className="text-xs text-white/70 mt-1">{isSoldOut ? "We’ll notify you if a seat opens." : "Zoom/Meet link sent instantly + calendar invite. No spam."}</p>
                  </div>
                  <div className="p-6">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <div className="flex items-baseline gap-2"><span className="text-2xl font-extrabold text-emerald-600">FREE</span>{event.value_anchor_price && <><span className="text-sm line-through text-muted-foreground">₹{event.value_anchor_price.toLocaleString("en-IN")}</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">Worth ₹{event.value_anchor_price.toLocaleString("en-IN")}</span></>}<span className="ml-auto hidden sm:inline text-xs font-semibold text-emerald-700">{remaining} seats left • {pillDate}</span></div>
                      <p className="mt-1 text-xs text-muted-foreground">Pay ₹0 today. Live session + Q&A. Join via {meetingLink.includes("zoom")?"Zoom":"Google Meet"} on any device.</p>
                    </div>

                    {success ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-800">
                          <p className="font-bold flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> {success}</p>
                          <p className="mt-1 text-xs text-emerald-700">We’ve also queued your link on WhatsApp/email. Add to calendar so you don’t miss it.</p>
                        </div>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setUnlocked(true)
                            try { localStorage.setItem(`fscs_unlocked_${event.slug}`, "1") } catch {}
                          }}
                          className="flex items-center justify-between rounded-2xl bg-[#25D366] px-5 py-4 text-white shadow-lg hover:bg-[#1fbc58] ring-2 ring-white/20"
                        >
                          <span className="flex items-center gap-3"><MessageCircle className="h-6 w-6" /><span className="text-left leading-tight"><span className="block font-extrabold">1. Join WhatsApp Community — Unlock Meeting Link</span><span className="text-xs opacity-90">Tap to join • Meeting link appears after</span></span></span>
                          <ArrowRight className="h-5 w-5 shrink-0" />
                        </a>

                        {unlocked ? (
                          <>
                            <a href={meetingLink} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-5 py-4 shadow hover:bg-emerald-100">
                              <span className="flex items-center gap-3 text-emerald-800"><Video className="h-6 w-6" /><span className="text-left leading-tight"><span className="block font-extrabold">{getMeetingLabel(meetingLink)} — Ready to Join</span><span className="text-xs text-emerald-700">Unlocked after WhatsApp • Opens in Zoom / Google Meet</span></span></span>
                              <ExternalLink className="h-5 w-5 shrink-0 text-emerald-700" />
                            </a>
                            <button onClick={()=>copyLink(meetingLink)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs hover:bg-emerald-500/15 text-emerald-700">{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy meeting link"} • Keep handy</button>
                          </>
                        ) : (
                          <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 px-5 py-5 text-center">
                            <p className="text-sm font-bold flex items-center justify-center gap-2 text-muted-foreground"><Lock className="h-4 w-4" /> Meeting link locked</p>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Join the WhatsApp community above to unlock your personal meeting link. This is how we ensure you get reminders, slides & last-minute updates.</p>
                            <p className="mt-2 text-[11px] font-semibold text-emerald-600">👆 Tap “Join WhatsApp Community” — link unlocks instantly</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <Button onClick={() => event && downloadIcs(event)} variant="outline" className="w-full gap-2"><Download className="h-4 w-4" /> Add to Calendar</Button>
                          <a href={"https://wa.me/?text="+encodeURIComponent("Join THE MONEY BLUEPRINT free live webinar — " + (typeof window!=="undefined"?window.location.href:""))} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-secondary gap-1.5"><MessageCircle className="h-4 w-4 text-[#25D366]" /> Share</a>
                        </div>

                        <div className="rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 p-3 text-xs leading-relaxed">
                          <span className="font-bold flex items-center gap-1.5"><Gift className="h-4 w-4 text-[var(--gold)]" /> What happens next?</span>
                          Zoom/Meet link + WhatsApp invite on this screen + sent to <span className="font-mono bg-white border px-1 rounded">{email || "your email"}</span> & WA in 15 mins. Join the community now — that’s where last-minute links go.
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleRegister} className="mt-5 space-y-3">
                        <div><label className="text-xs font-semibold">Full name *</label><input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your full name" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-[var(--gold)]" required /></div>
                        <div><label className="text-xs font-semibold">Email *</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@email.com" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-[var(--gold)]" required /></div>
                        <div><label className="text-xs font-semibold">WhatsApp number *</label><input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+91 98xxxxxxxx" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-[var(--gold)]" required /><p className="mt-1 text-[11px] text-muted-foreground">We send the {meetingLink.includes("zoom")?"Zoom":"Google Meet"} link + community invite here.</p></div>
                        {formError && <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent border border-accent/20">{formError}</p>}
                        <Button type="submit" disabled={submitting || isSoldOut} className="w-full gap-2 py-6 text-base shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-4 w-4" /> {ctaLabel}</>}
                        </Button>
                        <p className="text-center text-[11px] text-muted-foreground">No card • No spam • Takes 20 secs • <a href={waLink} target="_blank" rel="noreferrer" className="underline text-emerald-600">Join WhatsApp community</a> after booking</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-1"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure & private. Your details are never shared.</div>
                      </form>
                    )}
                  </div>
                  <div className="border-t border-border bg-secondary/30 px-6 py-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {viewed || event.seats_sold + 38} people viewed this today</span>
                    <span className="font-semibold text-[var(--navy-deep)] flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" /> 4.9/5 (187 reviews)</span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold flex items-center gap-1.5"><Gift className="h-4 w-4 text-[var(--gold)]" /> You’ll get after joining</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5" /> Instant {meetingLink.includes("zoom")?"Zoom":"Google Meet"} link + calendar invite</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5" /> WhatsApp community — reminders, slides, replay (if available)</li>
                    <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5" /> Live gap scan + personal Money Check</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-y border-border bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-6 py-4 text-xs lg:px-8">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Award className="h-4 w-4 text-[var(--gold)]" /> AMFI ARN-335677 • 10+ Years • 100+ Families</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Star className="h-4 w-4 text-[var(--gold)] fill-[var(--gold)]" /> 4.9/5 trust</span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> No selling • Education first • No dark patterns</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.65fr_0.85fr] lg:gap-12">
            <div className="space-y-10">
              <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm">
                <p className="text-xs font-bold tracking-widest text-accent uppercase">The Real Problem</p>
                <h2 className="mt-1 font-serif text-2xl font-bold leading-tight flex items-center gap-2"><Lightbulb className="h-6 w-6 text-[var(--gold)]" /> You earn money. But do you have a <span className="text-accent">money system</span>?</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Salary comes in. Bills go out. Some into FD, some into insurance, some into SIPs, some stays in bank. But is everything <span className="font-semibold text-foreground">working together</span>? Most families earn well yet drift without a coordinated system.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm">
                  {["Money scattered across FD, insurance, SIPs, bank — no single view","Protection confused with investment (endowment / ULIP traps)","Inflation silently eroding what you save"].map((t)=>(
                    <div key={t} className="flex gap-2 rounded-2xl border border-accent/10 bg-accent/5 p-4"><XCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" /><span className="leading-snug">{t}</span></div>
                  ))}
                </div>
                {event.description && <div className="mt-5 rounded-2xl bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap border border-border">{event.description}</div>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button onClick={scrollToRegister} className="rounded-xl bg-[var(--navy-deep)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">Fix my money system — Reserve free seat →</button>
                  <a href={waLink} target="_blank" rel="noreferrer" className="rounded-xl border border-[#25D366] bg-[#25D366]/10 px-5 py-2.5 text-sm font-bold text-[#1f8a4d] hover:bg-[#25D366]/15 inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Get reminder on WhatsApp</a>
                </div>
              </div>

              {learnItems.length > 0 && (
                <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
                  <p className="text-xs font-bold tracking-widest text-[var(--gold)] uppercase">In 90 Minutes, You’ll Learn</p>
                  <h2 className="mt-2 font-serif text-2xl font-bold lg:text-[1.75rem]">What You’ll Learn — The 4 Money Pillars</h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-2xl">Four pillars, one system — each pillar is editable from Admin → Events → 4 Money Pillars.</p>
                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    {learnItems.map((raw, i) => {
                      const icons = [PiggyBank, Shield, TrendingUp, Wallet]
                      const Icon = icons[i % icons.length]
                      const fallbackDesc = ["Income, savings, needs vs wants, how much emergency fund you really need.","Term + health insurance — how much cover is enough, protection gap scan.","Inflation’s bite, compounding’s magic, cost of waiting 5 years.","FD vs gold vs real estate vs mutual funds — SIP vs lumpsum, demystified."]
                      const parsed = typeof raw === "object" && raw !== null && "title" in (raw as Record<string, unknown>)
                        ? { title: String((raw as Record<string, unknown>).title || ""), desc: String((raw as Record<string, unknown>).desc || "") }
                        : (() => {
                            const s = String(raw)
                            const stripped = s.replace(/^[0-9]+\s*[—\-–]+\s*/, "")
                            const sep = stripped.search(/\s[—\-–]\s/)
                            if (sep > 0) return { title: stripped.slice(0, sep).trim(), desc: stripped.slice(sep + 1).replace(/^[—\-–]\s*/, "").trim() }
                            const parts = stripped.split("—")
                            if (parts.length >= 2) return { title: parts[0].trim(), desc: parts.slice(1).join("—").trim() }
                            return { title: stripped, desc: fallbackDesc[i] || "" }
                          })()
                      return (
                        <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-6 flex flex-col">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--navy-deep)] text-white shrink-0"><Icon className="h-5 w-5" /></span>
                            <span className="rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 px-2.5 py-1 text-xs font-bold text-[var(--gold)]">0{i + 1}</span>
                            <span className="ml-auto hidden sm:inline text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">Pillar 0{i + 1}</span>
                          </div>
                          <h3 className="mt-4 text-[15px] font-bold leading-snug">{parsed.title || `Pillar ${i+1}`}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{parsed.desc || fallbackDesc[i] || ""}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {curriculum.length > 0 && (
                <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-serif text-2xl font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-[var(--gold)]" /> Inside the Webinar — {curriculum.length} Modules • {totalLessons} Lessons</h2>
                    <span className="rounded-full bg-secondary border border-border px-3 py-1 text-xs">Earn → Protect → Time → Invest → Goals → Wealth → Action</span>
                  </div>
                  <Accordion type="single" collapsible className="mt-5 w-full">
                    {curriculum.map((mod, i) => (
                      <AccordionItem key={i} value={`m-${i}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--navy-deep)] text-xs font-bold text-white">{String(i + 1).padStart(2, "0")}</span>
                            <span className="font-semibold text-sm">{mod.title}</span>
                            <span className="rounded-full bg-secondary border border-border px-2 py-0.5 text-xs text-muted-foreground">{mod.lessons.length} lessons</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ol className="ml-11 space-y-1.5">
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

              {vid ? (
                <div className="overflow-hidden rounded-3xl border border-border bg-black shadow">
                  <div className="aspect-video"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${vid}`} title="Event video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                </div>
              ) : event.video_url ? (
                <div className="overflow-hidden rounded-3xl border border-border bg-black shadow"><video controls src={event.video_url} className="w-full aspect-video object-contain bg-black" /></div>
              ) : null}

              {outcomes.length > 0 && (
                <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm">
                  <h2 className="font-serif text-2xl font-bold flex items-center gap-2"><Target className="h-5 w-5 text-[var(--gold)]" /> Walk away with</h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {outcomes.map((o, i) => (
                      <li key={i} className="flex gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm"><Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" /><span>{o}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {(forYou.length > 0 || notForYou.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {forYou.length > 0 && (
                    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                      <h3 className="font-bold text-emerald-700 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> This webinar is for you if…</h3>
                      <ul className="mt-3 space-y-2 text-sm">
                        {forYou.map((t, i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /><span>{t}</span></li>)}
                      </ul>
                    </div>
                  )}
                  {notForYou.length > 0 && (
                    <div className="rounded-3xl border border-accent/15 bg-accent/5 p-6">
                      <h3 className="font-bold text-accent flex items-center gap-2"><XCircle className="h-5 w-5" /> This is NOT for you if…</h3>
                      <ul className="mt-3 space-y-2 text-sm">
                        {notForYou.map((t, i) => <li key={i} className="flex gap-2"><XCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" /><span>{t}</span></li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-3xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-6 sm:p-8">
                <p className="text-xs font-bold tracking-widest text-[var(--gold)] uppercase">Your Guide</p>
                <h3 className="font-serif text-xl font-bold flex items-center gap-2 mt-1"><Award className="h-5 w-5 text-[var(--gold)]" /> Led by Francis J. — Your Money Guide</h3>
                <div className="mt-4 flex gap-4">
                  <Image src="/images/francis-j.jpeg" alt="Francis J." width={80} height={80} className="h-20 w-20 shrink-0 rounded-2xl border border-[var(--gold)]/20 object-cover" />
                  <div className="text-sm">
                    <p className="font-bold">AMFI-Registered MFD (ARN-335677) • 10+ Years • 100+ Families</p>
                    <p className="mt-1 text-muted-foreground leading-relaxed">Institution-grade guidance, translated for individuals. No jargon, no product push — just a clear system you can act on.</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white border border-border px-2.5 py-1">Mutual Funds</span>
                      <span className="rounded-full bg-white border border-border px-2.5 py-1">PMS / AIF</span>
                      <span className="rounded-full bg-white border border-border px-2.5 py-1">GIFT City</span>
                      <span className="rounded-full bg-white border border-border px-2.5 py-1">NRI</span>
                    </div>
                  </div>
                </div>
                {(event.instructor_note || isFree) && (
                  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
                    <p className="font-bold text-emerald-700 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Why is this FREE?</p>
                    <p className="mt-1 leading-relaxed text-muted-foreground">{event.instructor_note || "We teach the system free."}</p>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm">
                <p className="text-xs font-bold tracking-widest text-[var(--gold)] uppercase">Loved by families</p>
                <h2 className="mt-1 font-serif text-2xl font-bold flex items-center gap-2"><Quote className="h-5 w-5 text-[var(--gold)]" /> What attendees say</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {TESTIMONIALS.map((t,i)=>(
                    <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-5">
                      <div className="flex gap-1">{Array.from({length:t.stars}).map((_,k)=><Star key={k} className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />)}</div>
                      <p className="mt-3 text-sm leading-relaxed">“{t.quote}”</p>
                      <p className="mt-3 text-xs font-bold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-bold flex items-center gap-2"><HelpCircle className="h-5 w-5 text-[var(--gold)]" /> FAQ</h2>
                <Accordion type="single" collapsible className="mt-4">
                  {FAQS.map((f,i)=>(
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="rounded-3xl bg-[var(--navy-deep)] p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--gold)]/15 via-transparent to-transparent" />
                <div className="relative">
                  <p className="text-xs font-bold tracking-widest text-[var(--gold)] uppercase flex items-center gap-2"><Sparkles className="h-4 w-4" /> Final Call</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold leading-tight">Stop earning & saving. Start managing money with a system.</h3>
                  <p className="mt-2 text-sm text-white/70">90 mins live. 8 modules. Worth ₹{event.value_anchor_price||1999} — free for this batch only. {remaining} seats left.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={scrollToRegister} className="rounded-xl bg-emerald-500 px-7 py-3 font-bold text-white hover:bg-emerald-600 inline-flex items-center gap-2">Reserve My Free Seat — 20 sec <ArrowRight className="h-4 w-4" /></button>
                    <a href={waLink} target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur hover:bg-white/15 inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Join WhatsApp First</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block space-y-8 h-fit lg:sticky lg:top-32">
              <div className="rounded-3xl border border-[#25D366]/20 bg-[#25D366]/5 p-5">
                <h4 className="font-bold flex items-center gap-2 text-[#1f8a4d]"><MessageCircle className="h-5 w-5" /> Never miss the link</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">The <span className="font-semibold text-foreground">WhatsApp community</span> is where the link, reminders & replay are shared.</p>
                <a href={waLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#20bd5a]">Join WhatsApp Community <ExternalLink className="h-4 w-4" /></a>
              </div>
              <div className="rounded-3xl border border-border bg-secondary/30 p-5">
                <h4 className="text-sm font-bold">Event details</h4>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Date</dt><dd className="font-medium">{formatDateLong(event.event_date)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Time</dt><dd className="font-medium">{formatTimeIST(event.event_date, event.timezone) || "TBA"}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Duration</dt><dd className="font-medium">{event.duration_mins ? event.duration_mins + " mins + Q&A" : "90 mins"}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Mode</dt><dd className="font-medium capitalize">{event.delivery_mode} • {meetingLink.includes("zoom")?"Zoom": meetingLink.includes("meet.google")?"Google Meet":"Live"}</dd></div>
                </dl>
                <Button variant="outline" className="mt-4 w-full gap-2" onClick={() => event && downloadIcs(event)}><Calendar className="h-4 w-4" /> Add to Calendar</Button>
                {unlocked ? (
                  <a href={meetingLink} target="_blank" rel="noreferrer" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100"><Video className="h-4 w-4" /> {getMeetingLabel(meetingLink)}</a>
                ) : (
                  <div className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 px-4 py-3 text-xs font-semibold text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Join WhatsApp to unlock</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSticky && !success && (
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] lg:hidden">
              <div className="mx-auto flex max-w-7xl items-center gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-none truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{remaining} seats left • {formatTimeIST(event.event_date, event.timezone)}</p>
                </div>
                <button onClick={scrollToRegister} className="ml-auto shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow">Reserve Free Seat</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mx-auto mt-4 max-w-7xl px-6 text-center text-xs text-muted-foreground lg:px-8">We show real scarcity and honest value only — no dark patterns, no fake urgency. FREE means FREE.</p>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

