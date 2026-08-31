import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'

async function ensureEventsTable(env: Env) {
  try {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        slug            TEXT    NOT NULL UNIQUE,
        title           TEXT    NOT NULL,
        subtitle        TEXT,
        description     TEXT,
        agenda          TEXT    NOT NULL DEFAULT '[]',
        venue           TEXT,
        event_date      TEXT,
        price           INTEGER NOT NULL DEFAULT 0,
        original_price  INTEGER,
        currency        TEXT    NOT NULL DEFAULT 'INR',
        cover_image     TEXT,
        gallery         TEXT    NOT NULL DEFAULT '[]',
        video_url       TEXT,
        cta_label       TEXT    NOT NULL DEFAULT 'Reserve Your Spot',
        cta_url         TEXT,
        status          TEXT    NOT NULL DEFAULT 'published',
        featured        INTEGER NOT NULL DEFAULT 0,
        max_seats       INTEGER,
        seats_sold      INTEGER NOT NULL DEFAULT 0,
        is_free         INTEGER NOT NULL DEFAULT 0,
        delivery_mode   TEXT    NOT NULL DEFAULT 'online',
        duration_mins   INTEGER,
        language        TEXT    NOT NULL DEFAULT 'English',
        timezone        TEXT    NOT NULL DEFAULT 'Asia/Kolkata',
        curriculum      TEXT    NOT NULL DEFAULT '[]',
        learn_items     TEXT    NOT NULL DEFAULT '[]',
        outcomes        TEXT    NOT NULL DEFAULT '[]',
        for_you         TEXT    NOT NULL DEFAULT '[]',
        not_for_you     TEXT    NOT NULL DEFAULT '[]',
        inside_flow     TEXT    NOT NULL DEFAULT '[]',
        tagline         TEXT,
        value_anchor_price INTEGER,
        instructor_note TEXT,
        meeting_link    TEXT,
        whatsapp_community_link TEXT,
        section_headings TEXT NOT NULL DEFAULT '{}',
        created_by      INTEGER REFERENCES admin_users(id),
        created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_events_slug   ON events(slug);
      CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
      CREATE INDEX IF NOT EXISTS idx_events_date   ON events(event_date);
      CREATE TABLE IF NOT EXISTS event_registrations (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name        TEXT    NOT NULL,
        email       TEXT    NOT NULL,
        phone       TEXT,
        status      TEXT    NOT NULL DEFAULT 'registered',
        created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );
    `)
    // migrate existing DB — add new columns if missing (idempotent)
    const adds = [
      `ALTER TABLE events ADD COLUMN is_free INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE events ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'online'`,
      `ALTER TABLE events ADD COLUMN duration_mins INTEGER`,
      `ALTER TABLE events ADD COLUMN language TEXT NOT NULL DEFAULT 'English'`,
      `ALTER TABLE events ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata'`,
      `ALTER TABLE events ADD COLUMN curriculum TEXT NOT NULL DEFAULT '[]'`,
      `ALTER TABLE events ADD COLUMN learn_items TEXT NOT NULL DEFAULT '[]'`,
      `ALTER TABLE events ADD COLUMN outcomes TEXT NOT NULL DEFAULT '[]'`,
      `ALTER TABLE events ADD COLUMN for_you TEXT NOT NULL DEFAULT '[]'`,
      `ALTER TABLE events ADD COLUMN not_for_you TEXT NOT NULL DEFAULT '[]'`,
      `ALTER TABLE events ADD COLUMN inside_flow TEXT NOT NULL DEFAULT '[]'`,
      `ALTER TABLE events ADD COLUMN tagline TEXT`,
      `ALTER TABLE events ADD COLUMN value_anchor_price INTEGER`,
      `ALTER TABLE events ADD COLUMN instructor_note TEXT`,
      `ALTER TABLE events ADD COLUMN meeting_link TEXT`,
      `ALTER TABLE events ADD COLUMN whatsapp_community_link TEXT`,
      `ALTER TABLE events ADD COLUMN section_headings TEXT NOT NULL DEFAULT '{}'`,
    ]
    for (const sql of adds) {
      try { await env.DB.exec(sql) } catch { /* column exists */ }
    }
  } catch {
    // ignore
  }
}

function parseJsonArray(value: string | null): unknown[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
function parseHeadings(value: string | null): Record<string, string> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, string>
    return {}
  } catch { return {} }
}

function isEnded(eventDate: string | null, durationMins: unknown): boolean {
  if (!eventDate) return false
  try {
    const start = new Date(eventDate)
    if (isNaN(start.getTime())) return false
    const duration = typeof durationMins === 'number' && durationMins > 0 ? durationMins : 90
    const end = new Date(start.getTime() + duration * 60 * 1000)
    return Date.now() > end.getTime()
  } catch { return false }
}

function toPublicEvent(row: Record<string, unknown>) {
  const durationMins = row.duration_mins as number | null
  const eventDate = row.event_date as string | null
  const ended = isEnded(eventDate, durationMins)
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? null,
    description: row.description ?? null,
    agenda: parseJsonArray(row.agenda as string | null),
    venue: row.venue ?? null,
    event_date: row.event_date ?? null,
    price: row.price,
    original_price: row.original_price ?? null,
    currency: row.currency,
    cover_image: row.cover_image ?? null,
    gallery: parseJsonArray(row.gallery as string | null),
    video_url: row.video_url ?? null,
    cta_label: row.cta_label,
    cta_url: row.cta_url ?? null,
    status: row.status,
    // derived: mark ended when end-time has passed (event_date + duration)
    is_ended: ended,
    featured: Boolean(row.featured),
    max_seats: row.max_seats ?? null,
    seats_sold: row.seats_sold,
    is_free: Boolean(row.is_free),
    delivery_mode: (row.delivery_mode as string) || 'online',
    duration_mins: durationMins,
    language: (row.language as string) || 'English',
    timezone: (row.timezone as string) || 'Asia/Kolkata',
    curriculum: parseJsonArray(row.curriculum as string | null),
    learn_items: parseJsonArray(row.learn_items as string | null),
    outcomes: parseJsonArray(row.outcomes as string | null),
    for_you: parseJsonArray(row.for_you as string | null),
    not_for_you: parseJsonArray(row.not_for_you as string | null),
    inside_flow: parseJsonArray(row.inside_flow as string | null),
    tagline: row.tagline ?? null,
    value_anchor_price: row.value_anchor_price ?? null,
    instructor_note: row.instructor_note ?? null,
    meeting_link: row.meeting_link ?? null,
    whatsapp_community_link: row.whatsapp_community_link ?? null,
    section_headings: parseHeadings(row.section_headings as string | null),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function handleEvents(request: Request, env: Env): Promise<Response> {
  await ensureEventsTable(env)
  const url = new URL(request.url)
  const pathname = url.pathname

  // GET /api/events — public list (only published by default)
  // Returns all published, with derived is_ended. Frontend splits upcoming vs past.
  if (request.method === 'GET' && pathname === '/api/events') {
    const limitParam = url.searchParams.get('limit')
    const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 100)

    const rows = await env.DB.prepare(
      `SELECT * FROM events WHERE status = 'published' ORDER BY featured DESC, event_date ASC, created_at DESC LIMIT ?`
    ).bind(limit).all()

    const all = (rows.results || []).map((r) => toPublicEvent(r as Record<string, unknown>))
    // Show upcoming first, then ended — preserves featured priority within each group
    const upcoming = all.filter((e: any) => !e.is_ended)
    const ended = all.filter((e: any) => e.is_ended)
    const data = [...upcoming, ...ended]
    return json({ data, total: data.length }, env, request)
  }

  // GET /api/events/:slug — public detail (slug after /api/events/)
  if (request.method === 'GET' && pathname.startsWith('/api/events/')) {
    const slug = pathname.replace('/api/events/', '').split('/')[0]?.trim()
    if (!slug || slug.length < 2) {
      return errorResponse('Invalid event slug', env, request, 400)
    }
    // allow placeholder to be fetched for pre-render
    const row = await env.DB.prepare(
      `SELECT * FROM events WHERE slug = ? AND status = 'published' LIMIT 1`
    ).bind(slug).first<Record<string, unknown>>()

    if (!row) {
      return errorResponse('Event not found', env, request, 404)
    }
    return json({ data: toPublicEvent(row) }, env, request)
  }

  // POST /api/events/register — optional lightweight registration (public)
  if (request.method === 'POST' && pathname === '/api/events/register') {
    const { safelyParseJSON, sanitizeString, validateEmail } = await import('../lib/security')
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as Record<string, unknown>
    const eventId = Number(body.event_id)
    const name = sanitizeString(String(body.name || ''), 100)
    const email = sanitizeString(String(body.email || ''), 254)
    const phone = sanitizeString(String(body.phone || ''), 20)

    if (!eventId || !name || !email) return errorResponse('Missing name, email or event_id', env, request, 400)
    if (!validateEmail(email)) return errorResponse('Invalid email', env, request, 400)

    const event = await env.DB.prepare(`SELECT id, max_seats, seats_sold, status, event_date, duration_mins FROM events WHERE id = ?`).bind(eventId).first<{ id: number; max_seats: number | null; seats_sold: number; status: string; event_date: string | null; duration_mins: number | null }>()
    if (!event || event.status !== 'published') return errorResponse('Event not available', env, request, 404)
    if (isEnded(event.event_date, event.duration_mins)) return errorResponse('This event has ended — registrations are closed.', env, request, 410)
    if (event.max_seats !== null && event.seats_sold >= event.max_seats) return errorResponse('Event is fully booked', env, request, 400)

    await env.DB.prepare(`INSERT INTO event_registrations (event_id, name, email, phone) VALUES (?, ?, ?, ?)`).bind(eventId, name, email, phone || null).run()
    await env.DB.prepare(`UPDATE events SET seats_sold = seats_sold + 1, updated_at = datetime('now') WHERE id = ?`).bind(eventId).run()

    // ── Email notifications (best-effort) ──
    try {
      const { sendEventRegistrationCustomerEmail, sendAdminEventRegistrationEmail } = await import('../lib/email')
      const from = env.RESEND_FROM_EMAIL
      const eventRow = await env.DB.prepare(`SELECT title, event_date, meeting_link FROM events WHERE id = ?`).bind(eventId).first<{ title: string; event_date: string | null; meeting_link: string | null }>()
      const customerPromise = sendEventRegistrationCustomerEmail(env.RESEND_API_KEY, {
        to: email,
        name,
        eventTitle: eventRow?.title || `Event #${eventId}`,
        eventDate: eventRow?.event_date || null,
        meetingLink: eventRow?.meeting_link || null,
      }, from)
      const adminPromise = sendAdminEventRegistrationEmail(env.RESEND_API_KEY, {
        eventTitle: eventRow?.title || `Event #${eventId}`,
        name,
        email,
        phone: phone || null,
      }, from)
      await Promise.allSettled([customerPromise, adminPromise])
    } catch (e) {
      console.error('[events/register] email error', e)
    }

    return json({ success: true, message: 'Registered successfully' }, env, request, 201)
  }

  return errorResponse('Not found', env, request, 404)
}
