import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { authenticateRequest, logAudit } from '../lib/auth'
import { hashIP } from '../lib/utils'
import {
  checkRateLimit,
  getRateLimitKey,
  validateId,
  validatePagination,
  validateEventStatus,
  validateDeliveryMode,
  validateSlug,
  slugify,
  safelyParseJSON,
  sanitizeString,
  parseCurriculum,
} from '../lib/security'

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
    for (const sql of adds) { try { await env.DB.exec(sql) } catch { } }
  } catch { }
}

async function generateUniqueSlug(env: Env, base: string, excludeId?: number): Promise<string> {
  let slug = slugify(base)
  if (!validateSlug(slug)) slug = 'event-' + Date.now().toString(36)
  let candidate = slug
  let counter = 2
  while (true) {
    const existing = await env.DB.prepare(`SELECT id FROM events WHERE slug = ?`).bind(candidate).first<{ id: number }>()
    if (!existing || (excludeId && existing.id === excludeId)) return candidate
    candidate = `${slug}-${counter}`
    counter++
    if (counter > 100) return `${slug}-${Date.now().toString(36)}`
  }
}

function parseAgenda(input: unknown): string {
  if (Array.isArray(input)) {
    const cleaned = input.map((v) => sanitizeString(String(v), 500)).filter(Boolean).slice(0, 50)
    return JSON.stringify(cleaned)
  }
  return '[]'
}

function parseGallery(input: unknown): string {
  if (Array.isArray(input)) {
    const cleaned = input
      .map((item: unknown) => {
        if (typeof item === 'string') return { type: 'image', url: sanitizeString(item, 2048) }
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>
          const url = sanitizeString(String(o.url || ''), 2048)
          if (!url) return null
          const type = o.type === 'video' ? 'video' : 'image'
          const alt = sanitizeString(String(o.alt || ''), 200)
          return { type, url, alt }
        }
        return null
      })
      .filter(Boolean)
      .slice(0, 20)
    return JSON.stringify(cleaned)
  }
  return '[]'
}

function parseStringArray(input: unknown, maxItems: number, maxLen: number): string {
  if (!Array.isArray(input)) return '[]'
  const cleaned = input.map((v) => sanitizeString(String(v), maxLen)).filter(Boolean).slice(0, maxItems)
  return JSON.stringify(cleaned)
}
function parseHeadings(input: unknown): string {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "{}"
  const allowed = ["pillars_kicker","pillars_title","pillars_desc","outcomes_heading","for_you_heading","not_for_heading","flow_heading","curriculum_heading","problem_kicker","problem_title","instructor_kicker","instructor_title","testimonials_kicker","testimonials_title","faq_heading","final_kicker","final_title","final_desc","trust_heading"]
  const out: Record<string, string> = {}
  for (const k of allowed) {
    const v = (input as Record<string, unknown>)[k]
    if (typeof v === "string" && v.trim()) out[k] = sanitizeString(v.trim(), 300)
  }
  return JSON.stringify(out)
}

export async function handleAdminEvents(request: Request, env: Env): Promise<Response> {
  await ensureEventsTable(env)

  const auth = await authenticateRequest(request, env)
  if ('error' in auth) return errorResponse(auth.error, env, request, auth.status)

  const rateLimitKey = getRateLimitKey(request, 'admin_api_events')
  const rateLimit = await checkRateLimit(env, rateLimitKey, { maxAttempts: 100, windowMs: 60 * 1000, lockoutMs: 5 * 60 * 1000 })
  if (!rateLimit.allowed) return json({ error: 'Rate limit exceeded. Slow down.' }, env, request, 429, { 'Retry-After': String(rateLimit.retryAfterSec) })

  const { adminId } = auth
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const ipHash = await hashIP(ip)
  const url = new URL(request.url)

  if (request.method === 'GET') {
    const { page, limit } = validatePagination(url.searchParams.get('page'), url.searchParams.get('limit'))
    const status = url.searchParams.get('status')
    const featured = url.searchParams.get('featured')
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM events'
    const conditions: string[] = []
    const binds: (string | number)[] = []

    if (status && validateEventStatus(status)) { conditions.push('status = ?'); binds.push(status) }
    if (featured === '1' || featured === '0') { conditions.push('featured = ?'); binds.push(Number(featured)) }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY updated_at DESC, created_at DESC LIMIT ? OFFSET ?'
    binds.push(limit, offset)

    const results = await env.DB.prepare(query).bind(...binds).all()
    const countQuery = `SELECT COUNT(*) as total FROM events${conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''}`
    const countBinds = binds.slice(0, -2)
    const countResult = await env.DB.prepare(countQuery).bind(...countBinds).first<{ total: number }>()

    await logAudit(env, adminId, 'view_events', ipHash)
    return json({ data: results.results, total: countResult?.total ?? 0, page, limit }, env, request)
  }

  if (request.method === 'POST') {
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as Record<string, unknown>

    const title = sanitizeString(String(body.title || ''), 200)
    if (!title || title.length < 3) return errorResponse('Title is required (min 3 chars)', env, request, 400)

    const rawSlug = body.slug ? sanitizeString(String(body.slug), 64) : ''
    const slugBase = rawSlug && validateSlug(rawSlug) ? rawSlug : title
    const slug = await generateUniqueSlug(env, slugBase)

    const subtitle = body.subtitle ? sanitizeString(String(body.subtitle), 300) : null
    const description = body.description ? sanitizeString(String(body.description), 20000) : null
    const agenda = parseAgenda(body.agenda)
    const curriculum = parseCurriculum(body.curriculum)
    const learn_items = parseStringArray(body.learn_items, 10, 500)
    const outcomes = parseStringArray(body.outcomes, 20, 400)
    const for_you = parseStringArray(body.for_you, 20, 400)
    const not_for_you = parseStringArray(body.not_for_you, 20, 400)
    const inside_flow = parseStringArray(body.inside_flow, 12, 300)
    const venue = body.venue ? sanitizeString(String(body.venue), 300) : null
    const eventDate = body.event_date ? sanitizeString(String(body.event_date), 30) : null
    const is_free = body.is_free ? 1 : 0
    const price = is_free ? 0 : Math.max(0, Math.min(Number(body.price) || 0, 100000000))
    const originalPriceRaw = body.original_price
    const originalPrice = !is_free && originalPriceRaw !== undefined && originalPriceRaw !== null && originalPriceRaw !== ''
      ? Math.max(0, Math.min(Number(originalPriceRaw), 100000000))
      : null
    const valueAnchor = is_free && body.value_anchor_price !== undefined && body.value_anchor_price !== null && body.value_anchor_price !== ''
      ? Math.max(0, Math.min(Number(body.value_anchor_price as number), 100000000))
      : null
    const currency = sanitizeString(String(body.currency || 'INR'), 10) || 'INR'
    const coverImage = body.cover_image ? sanitizeString(String(body.cover_image), 2048) : null
    const gallery = parseGallery(body.gallery)
    const videoUrl = body.video_url ? sanitizeString(String(body.video_url), 2048) : null
    const ctaLabel = body.cta_label ? sanitizeString(String(body.cta_label), 100) : (is_free ? 'Reserve My Free Seat' : 'Reserve Your Spot')
    const ctaUrl = body.cta_url ? sanitizeString(String(body.cta_url), 2048) : null
    const status = body.status ? sanitizeString(String(body.status), 20) : 'published'
    if (status && !validateEventStatus(status)) return errorResponse('Invalid status', env, request, 400)
    const deliveryMode = body.delivery_mode ? sanitizeString(String(body.delivery_mode), 20) : 'online'
    if (deliveryMode && !validateDeliveryMode(deliveryMode)) return errorResponse('Invalid delivery_mode', env, request, 400)
    const durationMins = body.duration_mins !== undefined && body.duration_mins !== null && body.duration_mins !== ''
      ? Math.max(15, Math.min(Number(body.duration_mins as number), 1440))
      : null
    const language = body.language ? sanitizeString(String(body.language), 30) : 'English'
    const timezone = body.timezone ? sanitizeString(String(body.timezone), 50) : 'Asia/Kolkata'
    const tagline = body.tagline ? sanitizeString(String(body.tagline), 300) : null
    const instructorNote = body.instructor_note ? sanitizeString(String(body.instructor_note), 5000) : null
    const meetingLink = body.meeting_link ? sanitizeString(String(body.meeting_link), 2048) : null
    const whatsappCommunityLink = body.whatsapp_community_link ? sanitizeString(String(body.whatsapp_community_link), 2048) : null
    const sectionHeadings = parseHeadings(body.section_headings)
    const featured = body.featured ? 1 : 0
    const maxSeats = body.max_seats !== undefined && body.max_seats !== null && body.max_seats !== ''
      ? Math.max(1, Math.min(Number(body.max_seats), 100000))
      : null

    const result = await env.DB.prepare(
      `INSERT INTO events (slug, title, subtitle, description, agenda, curriculum, learn_items, outcomes, for_you, not_for_you, inside_flow, venue, event_date, price, original_price, value_anchor_price, currency, cover_image, gallery, video_url, cta_label, cta_url, status, featured, max_seats, is_free, delivery_mode, duration_mins, language, timezone, tagline, instructor_note, meeting_link, whatsapp_community_link, section_headings, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(slug, title, subtitle, description, agenda, curriculum, learn_items, outcomes, for_you, not_for_you, inside_flow, venue, eventDate, price, originalPrice, valueAnchor, currency, coverImage, gallery, videoUrl, ctaLabel, ctaUrl, status, featured, maxSeats, is_free, deliveryMode, durationMins, language, timezone, tagline, instructorNote, meetingLink, whatsappCommunityLink, sectionHeadings, adminId).run()

    if (!result.success) return errorResponse('Failed to create event', env, request, 500)
    const id = result.meta.last_row_id
    await logAudit(env, adminId, 'create_event', ipHash, 'event', Number(id), JSON.stringify({ slug, title }))
    const created = await env.DB.prepare(`SELECT * FROM events WHERE id = ?`).bind(id).first()
    return json({ success: true, data: created }, env, request, 201)
  }

  if (request.method === 'PUT') {
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as Record<string, unknown>
    const rawId = url.searchParams.get('id') || String(body.id || '')
    const id = validateId(rawId)
    if (!id) return errorResponse('Valid id required', env, request, 400)

    const existing = await env.DB.prepare(`SELECT * FROM events WHERE id = ?`).bind(id).first<Record<string, unknown>>()
    if (!existing) return errorResponse('Event not found', env, request, 404)

    const updates: string[] = []
    const binds: (string | number | null)[] = []
    const setIf = (col: string, val: unknown) => { updates.push(`${col} = ?`); binds.push(val as string | number | null) }

    if (body.title !== undefined) {
      const title = sanitizeString(String(body.title), 200)
      if (!title || title.length < 3) return errorResponse('Title must be at least 3 chars', env, request, 400)
      setIf('title', title)
    }
    if (body.slug !== undefined) {
      const raw = sanitizeString(String(body.slug), 64)
      if (raw) {
        if (!validateSlug(raw)) return errorResponse('Invalid slug format', env, request, 400)
        const unique = await generateUniqueSlug(env, raw, id)
        setIf('slug', unique)
      }
    }
    if (body.subtitle !== undefined) setIf('subtitle', body.subtitle ? sanitizeString(String(body.subtitle), 300) : null)
    if (body.description !== undefined) setIf('description', body.description ? sanitizeString(String(body.description), 20000) : null)
    if (body.agenda !== undefined) setIf('agenda', parseAgenda(body.agenda))
    if (body.curriculum !== undefined) setIf('curriculum', parseCurriculum(body.curriculum))
    if (body.learn_items !== undefined) setIf('learn_items', parseStringArray(body.learn_items, 10, 500))
    if (body.outcomes !== undefined) setIf('outcomes', parseStringArray(body.outcomes, 20, 400))
    if (body.for_you !== undefined) setIf('for_you', parseStringArray(body.for_you, 20, 400))
    if (body.not_for_you !== undefined) setIf('not_for_you', parseStringArray(body.not_for_you, 20, 400))
    if (body.inside_flow !== undefined) setIf('inside_flow', parseStringArray(body.inside_flow, 12, 300))
    if (body.venue !== undefined) setIf('venue', body.venue ? sanitizeString(String(body.venue), 300) : null)
    if (body.event_date !== undefined) setIf('event_date', body.event_date ? sanitizeString(String(body.event_date), 30) : null)
    if (body.is_free !== undefined) {
      const v = body.is_free ? 1 : 0
      setIf('is_free', v)
      if (v === 1) setIf('price', 0)
    }
    if (body.price !== undefined) setIf('price', Math.max(0, Math.min(Number(body.price) || 0, 100000000)))
    if (body.original_price !== undefined) {
      const v = body.original_price === '' || body.original_price === null ? null : Math.max(0, Math.min(Number(body.original_price as number), 100000000))
      setIf('original_price', v)
    }
    if (body.value_anchor_price !== undefined) {
      const v = body.value_anchor_price === '' || body.value_anchor_price === null ? null : Math.max(0, Math.min(Number(body.value_anchor_price as number), 100000000))
      setIf('value_anchor_price', v)
    }
    if (body.currency !== undefined) setIf('currency', sanitizeString(String(body.currency), 10) || 'INR')
    if (body.cover_image !== undefined) setIf('cover_image', body.cover_image ? sanitizeString(String(body.cover_image), 2048) : null)
    if (body.gallery !== undefined) setIf('gallery', parseGallery(body.gallery))
    if (body.video_url !== undefined) setIf('video_url', body.video_url ? sanitizeString(String(body.video_url), 2048) : null)
    if (body.cta_label !== undefined) setIf('cta_label', body.cta_label ? sanitizeString(String(body.cta_label), 100) : 'Reserve Your Spot')
    if (body.cta_url !== undefined) setIf('cta_url', body.cta_url ? sanitizeString(String(body.cta_url), 2048) : null)
    if (body.status !== undefined) {
      const s = sanitizeString(String(body.status), 20)
      if (!validateEventStatus(s)) return errorResponse('Invalid status', env, request, 400)
      setIf('status', s)
    }
    if (body.delivery_mode !== undefined) {
      const d = sanitizeString(String(body.delivery_mode), 20)
      if (!validateDeliveryMode(d)) return errorResponse('Invalid delivery_mode', env, request, 400)
      setIf('delivery_mode', d)
    }
    if (body.duration_mins !== undefined) {
      const v = body.duration_mins === '' || body.duration_mins === null ? null : Math.max(15, Math.min(Number(body.duration_mins as number), 1440))
      setIf('duration_mins', v)
    }
    if (body.language !== undefined) setIf('language', body.language ? sanitizeString(String(body.language), 30) : null)
    if (body.timezone !== undefined) setIf('timezone', body.timezone ? sanitizeString(String(body.timezone), 50) : null)
    if (body.tagline !== undefined) setIf('tagline', body.tagline ? sanitizeString(String(body.tagline), 300) : null)
    if (body.instructor_note !== undefined) setIf('instructor_note', body.instructor_note ? sanitizeString(String(body.instructor_note), 5000) : null)
    if (body.meeting_link !== undefined) setIf('meeting_link', body.meeting_link ? sanitizeString(String(body.meeting_link), 2048) : null)
    if (body.whatsapp_community_link !== undefined) setIf('whatsapp_community_link', body.whatsapp_community_link ? sanitizeString(String(body.whatsapp_community_link), 2048) : null)
    if (body.section_headings !== undefined) setIf('section_headings', parseHeadings(body.section_headings))
    if (body.featured !== undefined) setIf('featured', body.featured ? 1 : 0)
    if (body.max_seats !== undefined) {
      const v = body.max_seats === '' || body.max_seats === null ? null : Math.max(1, Math.min(Number(body.max_seats as number), 100000))
      setIf('max_seats', v)
    }
    if (body.seats_sold !== undefined) setIf('seats_sold', Math.max(0, Math.min(Number(body.seats_sold as number) || 0, 1000000)))

    if (updates.length === 0) return errorResponse('No fields to update', env, request, 400)
    updates.push(`updated_at = datetime('now')`)
    binds.push(id)

    const result = await env.DB.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run()
    if (!result.success) return errorResponse('Failed to update event', env, request, 500)
    await logAudit(env, adminId, 'update_event', ipHash, 'event', id, JSON.stringify({ fields: Object.keys(body as object).slice(0, 10) }))
    const updated = await env.DB.prepare(`SELECT * FROM events WHERE id = ?`).bind(id).first()
    return json({ success: true, data: updated }, env, request)
  }

  if (request.method === 'DELETE') {
    const rawId = url.searchParams.get('id')
    const id = validateId(rawId)
    if (!id) return errorResponse('Valid id required', env, request, 400)
    const result = await env.DB.prepare(`DELETE FROM events WHERE id = ?`).bind(id).run()
    if (!result.success) return errorResponse('Failed to delete event', env, request, 500)
    await logAudit(env, adminId, 'delete_event', ipHash, 'event', id)
    return json({ success: true }, env, request)
  }

  return errorResponse('Method not allowed', env, request, 405)
}
