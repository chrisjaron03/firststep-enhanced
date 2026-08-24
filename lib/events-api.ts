export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://firststep-backend.chrisjaron99.workers.dev'

export interface CurriculumModule {
  title: string
  lessons: string[]
}

export interface PublicEvent {
  id: number
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  agenda: unknown[]
  venue: string | null
  event_date: string | null
  price: number
  original_price: number | null
  currency: string
  cover_image: string | null
  gallery: { type: 'image' | 'video'; url: string; alt?: string }[]
  video_url: string | null
  cta_label: string
  cta_url: string | null
  status: string
  featured: boolean
  max_seats: number | null
  seats_sold: number
  is_free: boolean
  delivery_mode: string
  duration_mins: number | null
  language: string
  timezone: string
  curriculum: CurriculumModule[]
  learn_items: string[]
  outcomes: string[]
  for_you: string[]
  not_for_you: string[]
  inside_flow: string[]
  tagline: string | null
  value_anchor_price: number | null
  instructor_note: string | null
  meeting_link: string | null
  whatsapp_community_link: string | null
  section_headings: Record<string, string>
  created_at: string
  updated_at: string
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'fscs_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

async function getJSON<T>(path: string): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'X-Session-Id': getSessionId() },
      cache: 'no-store',
    })
    const j = await res.json().catch(() => null) as { data?: T; error?: string } | null
    if (!res.ok) return { ok: false, error: (j as { error?: string })?.error || 'Request failed' }
    return { ok: true, data: (j as { data: T })?.data ?? (j as T) }
  } catch {
    return { ok: false, error: 'Network error' }
  }
}

const MOCK_BLUEPRINT: PublicEvent = {
  id: 1,
  slug: "the-money-blueprint",
  title: "THE MONEY BLUEPRINT",
  subtitle: "5 Money Decisions Every Family Should Get Right",
  description: "You earn money. But do you have a money system?\nSalary comes in. Bills go out. Some money goes into FD, some into insurance, some into SIPs and some stays in the bank. But is everything working together?\n\nTHE MONEY BLUEPRINT is a practical financial foundation workshop for working individuals and families who want a clear framework for managing, protecting and investing their money.\n\nPrimary promise: In one practical live session, understand the five money decisions that help you move from simply earning and saving to managing money with purpose.",
  agenda: [],
  venue: "Online — Live on Zoom (link shared on WhatsApp after registration)",
  event_date: "2026-08-30T13:30:00.000Z",
  price: 0,
  original_price: null,
  currency: "INR",
  cover_image: "/images/services-hero.jpg",
  gallery: [],
  video_url: null,
  cta_label: "RESERVE MY FREE SEAT",
  cta_url: null,
  status: "published",
  featured: true,
  max_seats: 200,
  seats_sold: 147,
  is_free: true,
  delivery_mode: "online",
  duration_mins: 90,
  language: "English",
  timezone: "Asia/Kolkata",
  curriculum: [
    { title: "Module 1: Money Foundations", lessons: ["What is money, income vs wealth", "Needs vs wants — budgeting basics", "Cash flow: income, expenses, savings", "Emergency fund — why and how much"] },
    { title: "Module 2: Understanding Risk & Protection First", lessons: ["Why protection comes before investment", "Term insurance — the foundation", "Health insurance — protecting your savings", "Common mistakes: mixing insurance with investment (endowment/ULIP traps)"] },
    { title: "Module 3: The Time Value of Money", lessons: ["Inflation — the silent wealth killer", "Power of compounding (with real number examples)", "Why starting early beats investing more later"] },
    { title: "Module 4: Understanding Investment Options", lessons: ["Fixed deposits, gold, real estate — traditional options and their limits", "What is a mutual fund — demystified", "Equity vs debt — risk and return basics", "SIP vs lumpsum — which suits whom"] },
    { title: "Module 5: Goal-Based Investing", lessons: ["Setting financial goals (short/medium/long term)", "Matching investments to goals (child education, retirement, house)", "Asset allocation basics"] },
    { title: "Module 6: Going Deeper", lessons: ["Types of mutual funds (large cap, mid cap, hybrid, debt)", "Understanding risk profiling", "Tax-efficient investing (ELSS, LTCG/STCG basics)", "NRI-specific: NRE/NRO, DTAA, repatriation basics"] },
    { title: "Module 7: Advanced/Wealth Stage", lessons: ["PMS and AIF — when you outgrow mutual funds", "GIFT City — global investment access for NRIs", "Retirement corpus planning — building your income machine"] },
    { title: "Module 8: Action", lessons: ["How to start — practical first steps", "Common behavioral mistakes (panic selling, chasing returns)", "Q&A / building your personal financial plan"] },
  ],
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
    "You want a stock tip or next multibagger",
    "You want a single investment product to solve everything",
    "You expect a one-size-fits-all portfolio",
  ],
  inside_flow: [
    "Money structure — Cash flow & emergency",
    "Protection — Term & health shield",
    "Time — Inflation & compounding",
    "Investment choices — Mutual funds, equity/debt, SIP vs lumpsum",
    "Goal-based investing — Align money to goals",
    "Personal Money Check — Live gap scan",
    "Q&A — Build your personal plan + optional Money Clarity Session",
  ],
  tagline: "Earn. Protect. Grow. Build.",
  value_anchor_price: 1999,
  instructor_note: "Why FREE? This is education-first. We teach the system free — no stock tips, no guaranteed returns, no single-product pitch. If you want us to implement it for you (Mutual Funds / PMS / AIF / GIFT City), you can book a 1:1 Money Clarity Session after — no obligation, education first. Led by Francis J., AMFI-Registered MFD (ARN-335677), 10+ years guiding 100+ families.",
  meeting_link: "https://meet.google.com/firststep-blueprint",
  whatsapp_community_link: "https://chat.whatsapp.com/FIRSTSTEP_MONEY_BLUEPRINT",
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
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function isMockMode(): boolean {
  // Mock if explicitly forced or when running without remote data (user said mock link)
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    // Use mock fallback on localhost OR when API was unreachable — handled in catch
    if (host === "localhost" || host === "127.0.0.1") return true
  }
  return false
}

export const eventsApi = {
  list: async (): Promise<{ ok: boolean; data: PublicEvent[]; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, { cache: 'no-store' })
      const j = await res.json() as { data?: PublicEvent[]; error?: string }
      if (!res.ok) {
        // Mock fallback for demo / offline
        if (j.error && String(j.error).includes("Not found")) {
          return { ok: true, data: [MOCK_BLUEPRINT] }
        }
        return { ok: true, data: [MOCK_BLUEPRINT] }
      }
      const data = j.data
      if (Array.isArray(data) && data.length > 0) return { ok: true, data }
      // Empty DB → show mock Blueprint so it sells in mock mode
      return { ok: true, data: [MOCK_BLUEPRINT] }
    } catch {
      return { ok: true, data: [MOCK_BLUEPRINT] }
    }
  },

  getBySlug: async (slug: string): Promise<{ ok: boolean; data?: PublicEvent; error?: string }> => {
    // Instant mock for blueprint slug — avoids network roundtrip
    if (slug === "the-money-blueprint" || slug === "the-money-blueprint-2" || slug === "placeholder") {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(slug)}`, { cache: 'no-store' })
        const j = await res.json().catch(() => null) as { data?: PublicEvent; error?: string } | null
        if (res.ok && j) {
          const data = (j as { data: PublicEvent })?.data ?? (j as unknown as PublicEvent)
          if (data && (data as PublicEvent).slug) return { ok: true, data: data as PublicEvent }
        }
      } catch {}
      return { ok: true, data: MOCK_BLUEPRINT }
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(slug)}`, { cache: 'no-store' })
      const j = await res.json().catch(() => null) as { data?: PublicEvent; error?: string } | null
      if (!res.ok) return { ok: false, error: j?.error || 'Not found' }
      const data = (j as { data: PublicEvent })?.data ?? (j as unknown as PublicEvent)
      return { ok: true, data: data as PublicEvent }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  },

  register: async (payload: { event_id: number; name: string; email: string; phone?: string }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => null) as { error?: string } | null
      if (!res.ok) return { ok: false, error: j?.error || 'Failed to register' }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  },
}

// Simple in-memory + sessionStorage cache for nav dropdown to avoid flicker
let navCache: PublicEvent[] | null = null
let navCacheTime = 0
export async function fetchEventsForNav(): Promise<PublicEvent[]> {
  if (navCache && Date.now() - navCacheTime < 60_000) return navCache
  const r = await eventsApi.list()
  if (r.ok) {
    navCache = r.data
    navCacheTime = Date.now()
    try { sessionStorage.setItem('fscs_events_nav', JSON.stringify(navCache)) } catch {}
    return navCache
  }
  try {
    const raw = sessionStorage.getItem('fscs_events_nav')
    if (raw) return JSON.parse(raw) as PublicEvent[]
  } catch {}
  return []
}

export function generateCalendarIcs(event: PublicEvent): string {
  const title = event.title.replace(/,/g, '\\,')
  const start = event.event_date ? new Date(event.event_date) : new Date(Date.now() + 86400000)
  const duration = event.duration_mins || 90
  const end = new Date(start.getTime() + duration * 60000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const venue = event.delivery_mode === 'online' ? 'Online Live Webinar (Zoom link shared after registration)' : (event.venue || '')
  const desc = `Join ${event.title} — ${event.tagline || ''}. Reserve link: ${typeof window !== 'undefined' ? window.location.href : ''}`.replace(/,/g, '\\,').replace(/\n/g, '\\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FirstStep CS//Event//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${venue.replace(/,/g, '\\,')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcs(event: PublicEvent) {
  const ics = generateCalendarIcs(event)
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.slug}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
