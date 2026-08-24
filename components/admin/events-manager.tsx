"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Trash2, Edit2, X, Check, Loader2, RefreshCw,
  Calendar, Eye, ExternalLink, Search, Image as ImageIcon, Video,
  Save, AlertCircle, Sparkles, GraduationCap, Target, Users, BookOpen, Layers
} from "lucide-react"
import { adminApi } from "@/lib/admin-api"

interface AdminEvent {
  id: number
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  agenda: string
  curriculum: string
  learn_items: string
  outcomes: string
  for_you: string
  not_for_you: string
  inside_flow: string
  venue: string | null
  event_date: string | null
  price: number
  original_price: number | null
  value_anchor_price: number | null
  currency: string
  cover_image: string | null
  gallery: string
  video_url: string | null
  cta_label: string
  cta_url: string | null
  status: string
  featured: number
  max_seats: number | null
  seats_sold: number
  is_free: number
  delivery_mode: string
  duration_mins: number | null
  language: string
  timezone: string
  tagline: string | null
  instructor_note: string | null
  meeting_link: string | null
  whatsapp_community_link: string | null
  created_at: string
  updated_at: string
}

type GalleryItem = { type: "image" | "video"; url: string; alt?: string }
type CurriculumModule = { title: string; lessons: string[] }
type Pillar = { title: string; desc: string }

function parseJsonArray(raw: string | null): string[] {
  try { const v = JSON.parse(raw || "[]"); return Array.isArray(v) ? v : [] } catch { return [] }
}
function parseCurriculum(raw: string | null): CurriculumModule[] {
  try {
    const v = JSON.parse(raw || "[]")
    if (!Array.isArray(v)) return []
    return v.map((m: unknown) => {
      if (typeof m === "string") return { title: m as string, lessons: [] }
      if (m && typeof m === "object") {
        const o = m as Record<string, unknown>
        return { title: String(o.title || ""), lessons: Array.isArray(o.lessons) ? (o.lessons as string[]).map(String) : [] }
      }
      return { title: "", lessons: [] }
    }).filter((m: CurriculumModule) => m.title)
  } catch { return [] }
}
function parseGallery(raw: string): GalleryItem[] {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : [] } catch { return [] }
}
function parseAgenda(raw: string): string[] {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : [] } catch { return [] }
}
function pillarsFromStrings(raw: string[]): Pillar[] {
  return raw.map((s) => {
    const stripped = s.replace(/^[0-9]+\s*[—\-–]+\s*/, "").trim()
    // split on first — or - with spaces
    const sepIdx = stripped.search(/\s[—\-–]\s/)
    if (sepIdx > 0) {
      const title = stripped.slice(0, sepIdx).trim()
      const desc = stripped.slice(sepIdx + 1).replace(/^[—\-–]\s*/, "").trim()
      return { title, desc }
    }
    // try split by — without spaces or fallback
    const parts = stripped.split("—")
    if (parts.length >= 2) return { title: parts[0].trim(), desc: parts.slice(1).join("—").trim() }
    return { title: stripped, desc: "" }
  })
}
function pillarsToStrings(pillars: Pillar[]): string[] {
  return pillars.map((p) => {
    const t = p.title.trim()
    const d = p.desc.trim()
    if (!t) return ""
    return d ? `${t} — ${d}` : t
  }).filter(Boolean)
}

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft: "bg-white/10 text-white/60 border-white/20",
  archived: "bg-red-500/10 text-red-400 border-red-500/30",
}

const MONEY_BLUEPRINT_TEMPLATE = {
  title: "THE MONEY BLUEPRINT",
  subtitle: "5 Money Decisions Every Family Should Get Right",
  tagline: "Earn. Protect. Grow. Build.",
  description: `You earn money. But do you have a money system?
Salary comes in. Bills go out. Some money goes into FD, some into insurance, some into SIPs and some stays in the bank. But is everything working together?

THE MONEY BLUEPRINT is a practical financial foundation workshop for working individuals and families who want a clear framework for managing, protecting and investing their money.

Primary promise: In one practical live session, understand the five money decisions that help you move from simply earning and saving to managing money with purpose.`,
  is_free: true,
  delivery_mode: "online",
  duration_mins: 90,
  language: "English",
  timezone: "Asia/Kolkata",
  venue: "Online — Live on Zoom (link shared on WhatsApp after registration)",
  price: 0,
  value_anchor_price: 1999,
  cta_label: "RESERVE MY FREE SEAT",
  curriculum: [
    { title: "Module 1: Money Foundations", lessons: ["What is money, income vs wealth", "Needs vs wants — budgeting basics", "Cash flow: income, expenses, savings", "Emergency fund — why and how much"] },
    { title: "Module 2: Understanding Risk & Protection First", lessons: ["Why protection comes before investment", "Term insurance — the foundation", "Health insurance — protecting your savings", "Common mistakes: mixing insurance with investment (endowment/ULIP traps)"] },
    { title: "Module 3: The Time Value of Money", lessons: ["Inflation — the silent wealth killer", "Power of compounding (with real number examples)", "Why starting early beats investing more later"] },
    { title: "Module 4: Understanding Investment Options", lessons: ["Fixed deposits, gold, real estate — traditional options and their limits", "What is a mutual fund — demystified", "Equity vs debt — risk and return basics", "SIP vs lumpsum — which suits whom"] },
    { title: "Module 5: Goal-Based Investing", lessons: ["Setting financial goals (short/medium/long term)", "Matching investments to goals (child education, retirement, house)", "Asset allocation basics"] },
    { title: "Module 6: Going Deeper", lessons: ["Types of mutual funds (large cap, mid cap, hybrid, debt)", "Understanding risk profiling", "Tax-efficient investing (ELSS, LTCG/STCG basics)", "NRI-specific: NRE/NRO, DTAA, repatriation basics (if audience includes NRIs)"] },
    { title: "Module 7: Advanced/Wealth Stage", lessons: ["PMS and AIF — when you outgrow mutual funds", "GIFT City — global investment access for NRIs", "Retirement corpus planning — building your income machine"] },
    { title: "Module 8: Action", lessons: ["How to start — practical first steps", "Common behavioral mistakes (panic selling, chasing returns)", "Q&A / building your personal financial plan"] },
  ] as CurriculumModule[],
  learn_items: [
    "01 — Master Your Money — Income, savings, needs/wants, emergency fund",
    "02 — Protect Before You Grow — Term, health insurance, protection gap",
    "03 — Use the Power of Time — Inflation, compounding, cost of delay",
    "04 — Know Where Your Money Belongs — FD, gold, real estate, mutual funds, SIP/lumpsum",
  ],
  outcomes: [
    "A simple framework to separate income, savings and wealth creation",
    "A clearer way to think about emergency reserves and protection",
    "A practical understanding of inflation and compounding",
    "A framework for comparing investment categories by purpose, time and risk",
    "A starting point for connecting investments to short-, medium- and long-term goals",
    "A personal checklist of areas that may need review",
  ],
  for_you: [
    "You earn a regular income but do not have a structured financial plan",
    "You invest but are unsure whether everything is properly allocated",
    "You have insurance but are unsure about the adequacy of protection",
    "You have SIPs or FDs without clearly defined goals",
    "You are building wealth for family, education or retirement",
  ],
  not_for_you: [
    "You want guaranteed returns",
    "You want a stock tip or “next multibagger”",
    "You want a single investment product to solve everything",
    "You expect a one-size-fits-all portfolio",
  ],
  inside_flow: [
    "Money structure → Cash flow & emergency",
    "Protection → Term & health shield",
    "Time → Inflation & compounding",
    "Investment choices → Mutual funds, equity/debt, SIP vs lumpsum",
    "Goal-based investing → Align money to goals",
    "Personal Money Check → Live gap scan",
    "Q&A → Build your personal plan + optional Money Clarity Session",
  ],
  instructor_note: "Why FREE? This is education-first. We teach the system free — no stock tips, no guaranteed returns, no product push. If you want us to implement it for you (Mutual Funds / PMS / AIF / GIFT City), you can book a 1:1 Money Clarity Session after. No obligation. Led by Francis J., AMFI-Registered MFD (ARN-335677), 10+ years guiding 100+ families.",
  meeting_link: "https://meet.google.com/firststep-blueprint",
  whatsapp_community_link: "https://chat.whatsapp.com/FIRSTSTEP_MONEY_BLUEPRINT",
}

function emptyForm() {
  return {
    title: "",
    slug: "",
    subtitle: "",
    tagline: "",
    description: "",
    agenda: [""] as string[],
    curriculum: [] as CurriculumModule[],
    learn_items: [{ title: "", desc: "" }] as Pillar[],
    outcomes: [""] as string[],
    for_you: [""] as string[],
    not_for_you: [""] as string[],
    inside_flow: [""] as string[],
    venue: "Online — Live on Zoom",
    event_date: "",
    is_free: true,
    price: 0,
    original_price: "" as string | number,
    value_anchor_price: 1999 as string | number,
    currency: "INR",
    cover_image: "",
    gallery: [] as GalleryItem[],
    video_url: "",
    cta_label: "RESERVE MY FREE SEAT",
    cta_url: "",
    status: "published",
    delivery_mode: "online",
    duration_mins: 90 as string | number,
    language: "English",
    timezone: "Asia/Kolkata",
    instructor_note: MONEY_BLUEPRINT_TEMPLATE.instructor_note,
    meeting_link: MONEY_BLUEPRINT_TEMPLATE.meeting_link,
    whatsapp_community_link: MONEY_BLUEPRINT_TEMPLATE.whatsapp_community_link,
    section_headings: {
      pillars_kicker: "In 90 Minutes, You’ll Learn",
      pillars_title: "What You’ll Learn — The 4 Money Pillars",
      pillars_desc: "Four pillars, one system — each pillar is editable from Admin → Events → 4 Money Pillars.",
      outcomes_heading: "Walk away with",
      for_you_heading: "This webinar is for you if…",
      not_for_heading: "This is NOT for you if…",
      flow_heading: "What’s inside the 90 mins?",
      curriculum_heading: "Inside the Webinar",
      problem_kicker: "The Real Problem",
      problem_title: "You earn money. But do you have a money system?",
      instructor_kicker: "Your Guide",
      instructor_title: "Led by Francis J. — Your Money Guide",
      testimonials_kicker: "Loved by families",
      testimonials_title: "What attendees say",
      faq_heading: "FAQ",
      final_kicker: "Final Call",
      final_title: "Stop earning & saving. Start managing money with a system.",
    } as Record<string, string>,
    featured: true,
    max_seats: 100 as string | number,
  }
}

export function EventsManager() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState(emptyForm())
  const [galleryUrl, setGalleryUrl] = useState("")
  const [galleryType, setGalleryType] = useState<"image" | "video">("image")

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const res = await adminApi.getEvents({ limit: 100, status: filter || undefined })
    if (res.ok && res.data) {
      const d = res.data as { data: AdminEvent[]; total: number }
      setEvents(d.data || [])
      setTotal(d.total || 0)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const applyBlueprintTemplate = () => {
    const t = MONEY_BLUEPRINT_TEMPLATE
    setForm((f) => ({
      ...f,
      title: t.title,
      subtitle: t.subtitle,
      tagline: t.tagline,
      description: t.description,
      curriculum: t.curriculum,
      learn_items: pillarsFromStrings(t.learn_items),
      outcomes: t.outcomes,
      for_you: t.for_you,
      not_for_you: t.not_for_you,
      inside_flow: t.inside_flow,
      is_free: t.is_free,
      delivery_mode: t.delivery_mode,
      duration_mins: t.duration_mins,
      language: t.language,
      timezone: t.timezone,
      venue: t.venue,
      price: t.price,
      value_anchor_price: t.value_anchor_price,
      cta_label: t.cta_label,
      slug: "the-money-blueprint",
      featured: true,
      max_seats: 200,
      meeting_link: t.meeting_link,
      whatsapp_community_link: t.whatsapp_community_link,
    }))
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setError("")
    setSuccess("")
    setModalOpen(true)
  }

  const openEdit = (ev: AdminEvent) => {
    setEditing(ev)
    const agenda = parseAgenda(ev.agenda)
    const curriculum = parseCurriculum(ev.curriculum)
    setForm({
      title: ev.title,
      slug: ev.slug,
      subtitle: ev.subtitle || "",
      tagline: ev.tagline || "",
      description: ev.description || "",
      agenda: agenda.length ? agenda : [""],
      curriculum: curriculum.length ? curriculum : [],
      learn_items: (() => {
        try {
          const raw = JSON.parse(ev.learn_items || "[]")
          if (!Array.isArray(raw) || raw.length === 0) return [{ title: "", desc: "" }]
          if (typeof raw[0] === "object" && raw[0] !== null && "title" in (raw[0] as Record<string, unknown>)) {
            return (raw as Array<Record<string, unknown>>).map((p) => ({ title: String((p as Record<string, unknown>).title || ""), desc: String((p as Record<string, unknown>).desc || "") }))
          }
          return pillarsFromStrings(raw as string[])
        } catch { return [{ title: "", desc: "" }] }
      })(),
      outcomes: parseJsonArray(ev.outcomes).length ? parseJsonArray(ev.outcomes) : [""],
      for_you: parseJsonArray(ev.for_you).length ? parseJsonArray(ev.for_you) : [""],
      not_for_you: parseJsonArray(ev.not_for_you).length ? parseJsonArray(ev.not_for_you) : [""],
      inside_flow: parseJsonArray(ev.inside_flow).length ? parseJsonArray(ev.inside_flow) : [""],
      venue: ev.venue || "",
      event_date: ev.event_date ? ev.event_date.slice(0, 16) : "",
      is_free: Boolean(ev.is_free),
      price: ev.price,
      original_price: ev.original_price ?? "",
      value_anchor_price: ev.value_anchor_price ?? 1999,
      currency: ev.currency || "INR",
      cover_image: ev.cover_image || "",
      gallery: parseGallery(ev.gallery),
      video_url: ev.video_url || "",
      cta_label: ev.cta_label || (ev.is_free ? "RESERVE MY FREE SEAT" : "Reserve Your Spot"),
      cta_url: ev.cta_url || "",
      status: ev.status,
      delivery_mode: ev.delivery_mode || "online",
      duration_mins: ev.duration_mins ?? 90,
      language: ev.language || "English",
      timezone: ev.timezone || "Asia/Kolkata",
      instructor_note: ev.instructor_note || MONEY_BLUEPRINT_TEMPLATE.instructor_note,
      meeting_link: (ev as unknown as { meeting_link?: string | null }).meeting_link || MONEY_BLUEPRINT_TEMPLATE.meeting_link,
      whatsapp_community_link: (ev as unknown as { whatsapp_community_link?: string | null }).whatsapp_community_link || MONEY_BLUEPRINT_TEMPLATE.whatsapp_community_link,
      section_headings: (() => {
        try {
          const raw = JSON.parse((ev as unknown as { section_headings?: string }).section_headings || "{}")
          if (raw && typeof raw === "object" && !Array.isArray(raw)) return { ...(emptyForm().section_headings as Record<string,string>), ...(raw as Record<string,string>) }
        } catch {}
        return { ...(emptyForm().section_headings as Record<string,string>) }
      })(),
      featured: Boolean(ev.featured),
      max_seats: ev.max_seats ?? 100,
    })
    setError("")
    setSuccess("")
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event? Registrations will be removed.")) return
    const res = await adminApi.deleteEvent(id)
    if (res.ok) {
      setSuccess("Event deleted.")
      fetchEvents()
      setTimeout(() => setSuccess(""), 3000)
    } else {
      alert(res.error || "Failed to delete")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      subtitle: form.subtitle.trim() || null,
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      agenda: form.agenda.map((a) => a.trim()).filter(Boolean),
      curriculum: form.curriculum.filter((m) => m.title.trim()).map((m) => ({ title: m.title.trim(), lessons: m.lessons.map((l) => l.trim()).filter(Boolean) })),
      learn_items: pillarsToStrings(form.learn_items as unknown as Pillar[]),
      outcomes: form.outcomes.map((a) => a.trim()).filter(Boolean),
      for_you: form.for_you.map((a) => a.trim()).filter(Boolean),
      not_for_you: form.not_for_you.map((a) => a.trim()).filter(Boolean),
      inside_flow: form.inside_flow.map((a) => a.trim()).filter(Boolean),
      venue: form.venue.trim() || null,
      event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      is_free: form.is_free,
      price: form.is_free ? 0 : Number(form.price) || 0,
      original_price: form.is_free ? null : (form.original_price === "" ? null : Number(form.original_price)),
      value_anchor_price: form.is_free ? (form.value_anchor_price === "" ? null : Number(form.value_anchor_price)) : null,
      currency: form.currency || "INR",
      cover_image: form.cover_image.trim() || null,
      gallery: form.gallery,
      video_url: form.video_url.trim() || null,
      cta_label: form.cta_label.trim() || (form.is_free ? "RESERVE MY FREE SEAT" : "Reserve Your Spot"),
      cta_url: form.cta_url.trim() || null,
      meeting_link: (form as unknown as { meeting_link: string }).meeting_link?.trim() || null,
      whatsapp_community_link: (form as unknown as { whatsapp_community_link: string }).whatsapp_community_link?.trim() || null,
      section_headings: (form as unknown as { section_headings: Record<string,string> }).section_headings,
      status: form.status,
      delivery_mode: form.delivery_mode,
      duration_mins: form.duration_mins === "" ? null : Number(form.duration_mins),
      language: form.language || "English",
      timezone: form.timezone || "Asia/Kolkata",
      instructor_note: form.instructor_note.trim() || null,
      featured: form.featured,
      max_seats: form.max_seats === "" ? null : Number(form.max_seats),
    }
    if (!payload.title || String(payload.title).length < 3) {
      setError("Title must be at least 3 characters.")
      setSaving(false)
      return
    }
    const res = editing ? await adminApi.updateEvent(editing.id, payload) : await adminApi.createEvent(payload)
    setSaving(false)
    if (res.ok) {
      setModalOpen(false)
      setSuccess(editing ? "Event updated." : "Event created — now live in Events nav & /events.")
      fetchEvents()
      setTimeout(() => setSuccess(""), 4000)
    } else {
      setError(res.error || "Failed to save event")
    }
  }

  const filtered = events.filter((ev) => {
    if (!search) return true
    const q = search.toLowerCase()
    return ev.title.toLowerCase().includes(q) || ev.slug.toLowerCase().includes(q) || (ev.subtitle || "").toLowerCase().includes(q)
  })

  // helpers
  const addAgenda = () => setForm((f) => ({ ...f, agenda: [...f.agenda, ""] }))
  const removeAgenda = (i: number) => setForm((f) => ({ ...f, agenda: f.agenda.filter((_, idx) => idx !== i) }))
  const updateAgenda = (i: number, v: string) => setForm((f) => ({ ...f, agenda: f.agenda.map((a, idx) => idx === i ? v : a) }))

  const addCurriculumModule = () => setForm((f) => ({ ...f, curriculum: [...f.curriculum, { title: "", lessons: [""] }] }))
  const removeCurriculum = (i: number) => setForm((f) => ({ ...f, curriculum: f.curriculum.filter((_, idx) => idx !== i) }))
  const updateCurriculumTitle = (i: number, v: string) => setForm((f) => ({ ...f, curriculum: f.curriculum.map((m, idx) => idx === i ? { ...m, title: v } : m) }))
  const addLesson = (mi: number) => setForm((f) => ({ ...f, curriculum: f.curriculum.map((m, idx) => idx === mi ? { ...m, lessons: [...m.lessons, ""] } : m) }))
  const removeLesson = (mi: number, li: number) => setForm((f) => ({ ...f, curriculum: f.curriculum.map((m, idx) => idx === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m) }))
  const updateLesson = (mi: number, li: number, v: string) => setForm((f) => ({ ...f, curriculum: f.curriculum.map((m, idx) => idx === mi ? { ...m, lessons: m.lessons.map((l, j) => j === li ? v : l) } : m) }))

  const addToList = (key: "outcomes" | "for_you" | "not_for_you" | "inside_flow") => setForm((f) => ({ ...f, [key]: [...(f[key] as string[]), ""] } as never))
  const removeFromList = (key: "outcomes" | "for_you" | "not_for_you" | "inside_flow", i: number) => setForm((f) => ({ ...f, [key]: (f[key] as string[]).filter((_, idx) => idx !== i) } as never))
  const updateList = (key: "outcomes" | "for_you" | "not_for_you" | "inside_flow", i: number, v: string) => setForm((f) => ({ ...f, [key]: (f[key] as string[]).map((a, idx) => idx === i ? v : a) } as never))
  const addPillar = () => setForm((f) => ({ ...f, learn_items: [...(f.learn_items as unknown as Pillar[]), { title: "", desc: "" }] } as never))
  const removePillar = (i: number) => setForm((f) => ({ ...f, learn_items: (f.learn_items as unknown as Pillar[]).filter((_, idx) => idx !== i) } as never))
  const updatePillar = (i: number, field: "title" | "desc", v: string) => setForm((f) => ({ ...f, learn_items: (f.learn_items as unknown as Pillar[]).map((p, idx) => idx === i ? { ...p, [field]: v } : p) } as never))
  const updateHeading = (key: string, v: string) => setForm((f) => ({ ...f, section_headings: { ...(f as unknown as { section_headings: Record<string, string> }).section_headings, [key]: v } } as never))

  const addGalleryItem = () => {
    if (!galleryUrl.trim()) return
    setForm((f) => ({ ...f, gallery: [...f.gallery, { type: galleryType, url: galleryUrl.trim(), alt: "" }] }))
    setGalleryUrl("")
  }
  const removeGallery = (i: number) => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, idx) => idx !== i) }))

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">Events <span className="rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 px-2.5 py-0.5 text-xs text-[var(--gold)]">{total} total</span></h2>
          <p className="text-xs text-white/50 mt-1">Blueprint-ready: free toggle, 8-module curriculum, structured funnel blocks. Each published event auto-appears in Events nav.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-[var(--gold)] px-4 py-2.5 text-xs font-bold text-[var(--navy-deep)] hover:opacity-90 shadow-md shadow-[var(--gold)]/20">
            <Plus className="h-4 w-4" /> New Event
          </button>
          <button onClick={fetchEvents} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/70 hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or slug..." className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-[var(--gold)]" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 focus:outline-none [&>option]:bg-[#0a0f1c]">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {success && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400"><Check className="h-4 w-4" />{success}</div>}
      {loading && <div className="flex items-center gap-2 text-sm text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Loading events...</div>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Seats</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={7} className="px-6 py-16 text-center">
                <Calendar className="mx-auto h-8 w-8 text-white/20" />
                <p className="mt-2 text-sm font-medium text-white/60">No events yet</p>
                <p className="text-xs text-white/40">Create Blueprint or any event — it auto-appears under Events in the nav.</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={openCreate} className="rounded-xl bg-[var(--gold)] px-4 py-2 text-xs font-bold text-[var(--navy-deep)]">Create Event</button>
                  <button onClick={() => { setForm({ ...emptyForm(), ...{ title: MONEY_BLUEPRINT_TEMPLATE.title } }); setModalOpen(true); setTimeout(applyBlueprintTemplate, 50) }} className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 text-xs font-semibold text-[var(--gold)]">Load Blueprint Template</button>
                </div>
              </td></tr>
            )}
            {filtered.map((ev) => {
              const isFree = Boolean(ev.is_free)
              const curriculum = parseCurriculum(ev.curriculum)
              const priceLabel = isFree ? "FREE" : `₹${ev.price.toLocaleString("en-IN")}`
              return (
                <tr key={ev.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5 border border-white/10">
                        {ev.cover_image ? <img src={ev.cover_image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-5 w-5 text-white/20" /></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white line-clamp-1 flex items-center gap-1.5">{ev.title} {ev.featured ? <Sparkles className="h-3 w-3 text-[var(--gold)]" /> : null} {isFree && <span className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold">FREE</span>}</p>
                        <p className="text-xs text-white/50 line-clamp-1">{ev.tagline || ev.subtitle || "—"}</p>
                        <p className="text-[11px] text-white/30">{ev.event_date ? new Date(ev.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"} • {ev.delivery_mode} {ev.duration_mins ? `• ${ev.duration_mins}min` : ""} {curriculum.length ? `• ${curriculum.length} modules` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><a href={`/events/${ev.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--gold)] hover:underline">/events/{ev.slug} <ExternalLink className="h-3 w-3" /></a><div className="text-[11px] text-white/30">ID #{ev.id}</div></td>
                  <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs ${isFree ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/60"}`}>{isFree ? "Webinar Free" : "Paid"}</span></td>
                  <td className="px-4 py-3"><div className={`text-sm font-bold ${isFree ? "text-emerald-400" : "text-white"}`}>{priceLabel}</div>{!isFree && ev.original_price && ev.original_price > ev.price && <div className="text-xs text-white/40 line-through">₹{ev.original_price.toLocaleString("en-IN")}</div>}{isFree && ev.value_anchor_price && <div className="text-xs text-white/40">Worth ₹{ev.value_anchor_price.toLocaleString("en-IN")}</div>}</td>
                  <td className="px-4 py-3"><span className={`rounded-md border px-2 py-1 text-xs uppercase font-semibold ${STATUS_COLORS[ev.status] || STATUS_COLORS.draft}`}>{ev.status}</span></td>
                  <td className="px-4 py-3 text-xs text-white/60">{ev.max_seats ? `${ev.seats_sold}/${ev.max_seats}` : `${ev.seats_sold} sold`}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2"><a href={`/events/${ev.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white"><Eye className="h-4 w-4" /></a><button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-[var(--gold)]"><Edit2 className="h-4 w-4" /></button><button onClick={() => handleDelete(ev.id)} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="my-8 w-full max-w-4xl rounded-3xl border border-white/15 bg-gradient-to-b from-[#101c30] to-[#0a0f1c] p-6 sm:p-8 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-xl font-bold flex items-center gap-2"><GraduationCap className="h-5 w-5 text-[var(--gold)]" />{editing ? "Edit Event" : "Create New Event"}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              {!editing && <button type="button" onClick={applyBlueprintTemplate} className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2.5 text-xs font-bold text-[var(--gold)] hover:bg-[var(--gold)]/15"><Sparkles className="h-4 w-4" /> Load THE MONEY BLUEPRINT Template (8 Modules • 28 Lessons • Free Webinar)</button>}
              {error && <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300"><AlertCircle className="h-4 w-4" />{error}</div>}

              <form onSubmit={handleSave} className="space-y-6">
                {/* Identity */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-[var(--gold)]">Headings & Identity</h4>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Event Title *</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="THE MONEY BLUEPRINT" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Slug / URL</label>
                      <div className="flex"><span className="rounded-l-xl border border-r-0 border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/40">/events/</span><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="the-money-blueprint" className="flex-1 rounded-r-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                    </div>
                    <div><label className="block text-xs text-white/60 mb-1">Tagline</label><input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Earn. Protect. Grow. Build." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                  </div>
                  <div><label className="block text-xs text-white/60 mb-1">Subtitle / Hook</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="5 Money Decisions Every Family Should Get Right" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                  <div><label className="block text-xs text-white/60 mb-1">Description (Problem + Promise)</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="You earn money. But do you have a money system? ..." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)] resize-none" /></div>
                </div>

                {/* Webinar config */}
                <div className="rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-[var(--gold)] flex items-center gap-2"><Target className="h-4 w-4" /> Webinar Setup</h4>
                  <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked, cta_label: e.target.checked ? "RESERVE MY FREE SEAT" : "Reserve Your Spot", price: e.target.checked ? 0 : 999 })} className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500" />
                    <span className="text-sm font-semibold flex items-center gap-2">{form.is_free ? <span className="rounded-full bg-emerald-500 text-white px-2 py-0.5 text-xs">FREE WEBINAR</span> : <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Paid Event</span>} {form.is_free ? "This is a free live webinar (hides price, shows Worth badge)" : "Paid event (shows price + strike)"}</span>
                  </label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><label className="block text-xs text-white/60 mb-1">Delivery Mode</label><select value={form.delivery_mode} onChange={(e) => setForm({ ...form, delivery_mode: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)] [&>option]:bg-[#0a0f1c]"><option value="online">Online — Live Webinar</option><option value="offline">Offline — In Person</option><option value="hybrid">Hybrid</option></select></div>
                    <div><label className="block text-xs text-white/60 mb-1">Duration (mins)</label><input type="number" value={form.duration_mins} onChange={(e) => setForm({ ...form, duration_mins: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="90" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                    <div><label className="block text-xs text-white/60 mb-1">Language</label><input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className="block text-xs text-white/60 mb-1">Date & Time *</label><input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)] [color-scheme:dark]" /></div>
                    <div><label className="block text-xs text-white/60 mb-1">Venue / Platform</label><input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Online — Live on Zoom" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className="block text-xs text-white/60 mb-1">Timezone</label><input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                    <div><label className="block text-xs text-white/60 mb-1">Max Seats (Zoom cap)</label><input type="number" value={form.max_seats} onChange={(e) => setForm({ ...form, max_seats: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="200 — empty unlimited" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-[var(--gold)]">{form.is_free ? "Free Webinar Pricing" : "Pricing"}</h4>
                  {form.is_free ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div><label className="block text-xs text-white/60 mb-1">Worth / Value Anchor (₹) — shows as Worth ₹1,999</label><input type="number" value={form.value_anchor_price} onChange={(e) => setForm({ ...form, value_anchor_price: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="1999" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /><p className="text-[11px] text-white/30 mt-1">Displayed as FREE, badge “Worth ₹{String(form.value_anchor_price || 1999)}” — ethical value anchor.</p></div>
                      <div><label className="block text-xs text-white/60 mb-1">CTA Label</label><input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                    </div>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div><label className="block text-xs text-white/60 mb-1">Price (₹)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                        <div><label className="block text-xs text-white/60 mb-1">Original Price (strike)</label><input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value === "" ? "" : Number(e.target.value) })} placeholder="2999" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                        <div><label className="block text-xs text-white/60 mb-1">Currency</label><input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3"><div><label className="block text-xs text-white/60 mb-1">CTA Label</label><input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div><div><label className="block text-xs text-white/60 mb-1">CTA Link (Razorpay)</label><input value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="https:// razorpay link" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div></div>
                    </>
                  )}
                  {form.is_free && <div><label className="block text-xs text-white/60 mb-1">CTA Link (optional — Zoom link if known)</label><input value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="Leave blank — Zoom link sent after registration" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>}
                </div>

                {/* Meeting + WhatsApp — revenue critical */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 space-y-4">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">🔗 Meeting & WhatsApp Community — After Registration</h4>
                  <p className="text-xs text-white/50">Meeting link = Zoom / Google Meet shared after registration. WhatsApp Community link is **mandatory** — users auto-join after booking.</p>
                  <div><label className="block text-xs text-white/60 mb-1">Meeting Link (Zoom / Google Meet) *</label><input value={(form as unknown as { meeting_link: string }).meeting_link || ""} onChange={(e) => setForm({ ...form, meeting_link: e.target.value } as never)} placeholder="https://zoom.us/j/...  or  https://meet.google.com/xxx-xxxx-xxx" className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></div>
                  <div><label className="block text-xs text-white/60 mb-1">WhatsApp Community Link *</label><input value={(form as unknown as { whatsapp_community_link: string }).whatsapp_community_link || ""} onChange={(e) => setForm({ ...form, whatsapp_community_link: e.target.value } as never)} placeholder="https://chat.whatsapp.com/..." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /><p className="text-[11px] text-white/30 mt-1">Shown as big green CTA after registration. Also used in confirmation email/WA.</p></div>
                </div>

                {/* Curriculum */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-[var(--gold)] flex items-center gap-2"><Layers className="h-4 w-4" /> Curriculum — 8 Modules</h4><button type="button" onClick={addCurriculumModule} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"><Plus className="h-3 w-3 inline mr-1" />Add Module</button></div>
                  {form.curriculum.length === 0 && <p className="text-xs text-white/40">No modules yet — Blueprint has 8. Add modules or load template.</p>}
                  <div className="space-y-4">
                    {form.curriculum.map((mod, mi) => (
                      <div key={mi} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                        <div className="flex gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)] text-xs font-bold text-[var(--navy-deep)]">{mi + 1}</span>
                          <input value={mod.title} onChange={(e) => updateCurriculumTitle(mi, e.target.value)} placeholder={`Module ${mi + 1} Title — e.g. Module 1: Money Foundations`} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" />
                          <button type="button" onClick={() => removeCurriculum(mi)} className="p-2 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="ml-11 space-y-1.5">
                          {mod.lessons.map((ls, li) => (
                            <div key={li} className="flex gap-2">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">{mi + 1}.{li + 1}</span>
                              <input value={ls} onChange={(e) => updateLesson(mi, li, e.target.value)} placeholder={`Lesson ${li + 1}`} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs outline-none focus:border-[var(--gold)]" />
                              <button type="button" onClick={() => removeLesson(mi, li)} className="p-1 text-white/30 hover:text-red-400"><X className="h-4 w-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addLesson(mi)} className="text-xs text-[var(--gold)] hover:underline">+ Add Lesson</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4 Money Pillars — structured */}
                <div className="rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/[0.04] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[var(--gold)] flex items-center gap-2"><Target className="h-4 w-4" /> 4 Money Pillars — What You&apos;ll Learn</h4>
                    <button type="button" onClick={addPillar} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"><Plus className="h-3 w-3 inline mr-1" />Add Pillar</button>
                  </div>
                  <p className="text-xs text-white/40">Each pillar has a Title + short description. They render as the 4 cards (“Master Your Money” etc.) on the landing page. Numbering 01–04 is automatic.</p>
                  <div className="space-y-3">
                    {(form.learn_items as unknown as Pillar[]).map((p, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--gold)] text-xs font-bold text-[var(--navy-deep)]">0{i + 1}</span>
                          <input value={p.title} onChange={(e) => updatePillar(i, "title", e.target.value)} placeholder={`Pillar ${i + 1} Title — e.g. Master Your Money`} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" />
                          {(form.learn_items as unknown as Pillar[]).length > 1 && <button type="button" onClick={() => removePillar(i)} className="p-2 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>}
                        </div>
                        <input value={p.desc} onChange={(e) => updatePillar(i, "desc", e.target.value)} placeholder="Short description — e.g. Income, savings, needs/wants, emergency fund" className="ml-10 w-[calc(100%-2.5rem)] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-[var(--gold)]" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2"><BookOpen className="h-4 w-4 text-[var(--gold)]" />Outcomes — 6 Checks</h4>
                  <div className="space-y-2">
                    {(form.outcomes as string[]).map((v, i) => (
                      <div key={i} className="flex gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">{i + 1}</span><input value={v} onChange={(e) => updateList("outcomes", i, e.target.value)} placeholder="A simple framework …" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-[var(--gold)]" />{(form.outcomes as string[]).length > 1 && <button type="button" onClick={() => removeFromList("outcomes", i)} className="p-1 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>}</div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addToList("outcomes")} className="text-xs text-[var(--gold)] hover:underline">+ Add</button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {([
                    ["for_you", "This is for you if… ✅", "You earn a regular income…", Users] as const,
                    ["not_for_you", "Not for you if… ❌", "You want guaranteed returns", Users] as const,
                  ]).map(([key, label, placeholder, Icon]) => (
                    <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                      <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2"><Icon className="h-4 w-4 text-[var(--gold)]" />{label}</h4>
                      <div className="space-y-2">{(form[key] as string[]).map((v, i) => (<div key={i} className="flex gap-2"><input value={v} onChange={(e) => updateList(key, i, e.target.value)} placeholder={placeholder} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-[var(--gold)]" /><button type="button" onClick={() => removeFromList(key, i)} className="p-1 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>))}</div>
                      <button type="button" onClick={() => addToList(key)} className="text-xs text-[var(--gold)] hover:underline">+ Add</button>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white/80">Inside the Webinar — 7 Steps Flow</h4>
                  <div className="space-y-2">{form.inside_flow.map((v, i) => (<div key={i} className="flex gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-xs font-bold text-[var(--navy-deep)]">{i + 1}</span><input value={v} onChange={(e) => updateList("inside_flow", i, e.target.value)} placeholder="Money structure → …" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-[var(--gold)]" /><button type="button" onClick={() => removeFromList("inside_flow", i)} className="p-1 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>))}</div>
                  <button type="button" onClick={() => addToList("inside_flow")} className="text-xs text-[var(--gold)] hover:underline">+ Add Step</button>
                </div>

                {/* All Headings — editable */}
                <div className="rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/[0.04] p-5 space-y-4">
                  <h4 className="text-sm font-bold text-[var(--gold)] flex items-center gap-2">✏️ All Headings — Editable</h4>
                  <p className="text-xs text-white/40">Every heading on the landing page is editable here. Leave blank to use defaults. The “4 Money Pillars” title you highlighted is <span className="text-white font-semibold">pillars_title</span>.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      ["pillars_kicker", "Pillars kicker (small label)"],
                      ["pillars_title", "4 Money Pillars — What You’ll Learn *"],
                      ["pillars_desc", "Pillars description"],
                      ["outcomes_heading", "Walk away with"],
                      ["for_you_heading", "This webinar is for you if…"],
                      ["not_for_heading", "This is NOT for you if…"],
                      ["flow_heading", "What’s inside the 90 mins?"],
                      ["curriculum_heading", "Inside the Webinar heading"],
                      ["problem_kicker", "The Real Problem kicker"],
                      ["problem_title", "You earn money. But do you have a money system?"],
                      ["instructor_kicker", "Your Guide kicker"],
                      ["instructor_title", "Led by Francis J. — Your Money Guide"],
                      ["testimonials_kicker", "Loved by families kicker"],
                      ["testimonials_title", "What attendees say"],
                      ["faq_heading", "FAQ heading"],
                      ["final_kicker", "Final Call kicker"],
                      ["final_title", "Final CTA title"],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-[11px] text-white/50 mb-1">{label}</label>
                        <input
                          value={(form as unknown as { section_headings: Record<string, string> }).section_headings?.[key] || ""}
                          onChange={(e) => updateHeading(key, e.target.value)}
                          placeholder={label}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-[var(--gold)] placeholder:text-white/20"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-white/80">Why FREE / Instructor Note</h4>
                  <textarea value={form.instructor_note} onChange={(e) => setForm({ ...form, instructor_note: e.target.value })} rows={3} placeholder="Why FREE? Education first..." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)] resize-none" />
                </div>

                {/* Simple agenda fallback */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                  <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-white/60">Simple Agenda Fallback (legacy — used if curriculum empty)</h4><button type="button" onClick={addAgenda} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">+ Add</button></div>
                  <div className="space-y-2">{form.agenda.map((a, i) => (<div key={i} className="flex gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">{i + 1}</span><input value={a} onChange={(e) => updateAgenda(i, e.target.value)} placeholder={`Agenda ${i + 1}`} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-[var(--gold)]" /><button type="button" onClick={() => removeAgenda(i)} className="p-1 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>))}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-[var(--gold)] flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Media — Optional</h4>
                  <div><label className="block text-xs text-white/60 mb-1">Cover Image URL</label><input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" />{form.cover_image && <div className="mt-2 overflow-hidden rounded-xl border border-white/10"><img src={form.cover_image} alt="Cover preview" className="w-full max-h-48 object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} /></div>}</div>
                  <div><label className="block text-xs text-white/60 mb-1">Video URL (YouTube or mp4)</label><input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]" /></div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
                    <p className="text-xs font-semibold text-white/70">Gallery</p>
                    <div className="flex gap-2"><select value={galleryType} onChange={(e) => setGalleryType(e.target.value as "image" | "video")} className="rounded-xl border border-white/10 bg-[#0a0f1c] px-3 py-2.5 text-xs text-white"><option value="image">Image</option><option value="video">Video</option></select><input value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} placeholder="https://..." className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs outline-none focus:border-[var(--gold)]" /><button type="button" onClick={addGalleryItem} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/15"><Plus className="h-4 w-4" /></button></div>
                    {form.gallery.length > 0 && <div className="grid gap-2">{form.gallery.map((g, i) => (<div key={i} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"><span className={`rounded-md px-2 py-1 text-[11px] font-bold ${g.type === "video" ? "bg-accent/20 text-accent" : "bg-[var(--gold)]/20 text-[var(--gold)]"}`}>{g.type}</span><span className="flex-1 truncate text-white/70">{g.url}</span><button type="button" onClick={() => removeGallery(i)} className="text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>))}</div>}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-white/20 bg-white/5 text-[var(--gold)]" /><span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-[var(--gold)]" /> Featured — pins to top</span></label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)] [&>option]:bg-[#0a0f1c]"><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
                </div>

                <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:text-white">Cancel</button><button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-2.5 text-sm font-bold text-[var(--navy-deep)] hover:opacity-90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editing ? "Update Event" : "Create Event"}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
