import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { authenticateRequest, logAudit } from '../lib/auth'
import { hashIP } from '../lib/utils'
import { checkRateLimit, getRateLimitKey, validatePagination } from '../lib/security'

export async function handleAdminRegistrations(request: Request, env: Env): Promise<Response> {
  const auth = await authenticateRequest(request, env)
  if ('error' in auth) return errorResponse(auth.error, env, request, auth.status)

  const rateLimitKey = getRateLimitKey(request, 'admin_registrations')
  const rateLimit = await checkRateLimit(env, rateLimitKey, { maxAttempts: 100, windowMs: 60 * 1000 })
  if (!rateLimit.allowed) return json({ error: 'Rate limit exceeded' }, env, request, 429)

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const ipHash = await hashIP(ip)
  const url = new URL(request.url)

  if (request.method === 'GET') {
    const { page, limit } = validatePagination(url.searchParams.get('page'), url.searchParams.get('limit'))
    const eventId = url.searchParams.get('event_id')
    const eventSlug = url.searchParams.get('event_slug')
    const search = url.searchParams.get('search')?.trim() || ''
    const offset = (page - 1) * limit

    let eventFilterId: number | null = null
    if (eventId) {
      const id = parseInt(eventId, 10)
      if (!isNaN(id) && id > 0) eventFilterId = id
    } else if (eventSlug) {
      const ev = await env.DB.prepare(`SELECT id FROM events WHERE slug = ? LIMIT 1`).bind(eventSlug).first<{ id: number }>()
      if (ev) eventFilterId = ev.id
    }

    const conditions: string[] = []
    const binds: (string | number)[] = []

    if (eventFilterId !== null) {
      conditions.push('r.event_id = ?')
      binds.push(eventFilterId)
    }

    if (search) {
      conditions.push('(r.name LIKE ? OR r.email LIKE ? OR r.phone LIKE ?)')
      const like = `%${search}%`
      binds.push(like, like, like)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT r.id, r.event_id, r.name, r.email, r.phone, r.status, r.created_at,
             e.slug as event_slug, e.title as event_title
      FROM event_registrations r
      LEFT JOIN events e ON e.id = r.event_id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `
    const countQuery = `SELECT COUNT(*) as total FROM event_registrations r ${where}`

    const dataBinds = [...binds, limit, offset]
    const countBinds = [...binds]

    const results = await env.DB.prepare(query).bind(...dataBinds).all()
    const countResult = await env.DB.prepare(countQuery).bind(...countBinds).first<{ total: number }>()

    await logAudit(env, auth.adminId, 'view_registrations', ipHash)

    // Also get event list for filter dropdown
    const eventsList = await env.DB.prepare(`SELECT id, slug, title FROM events ORDER BY updated_at DESC LIMIT 50`).all()

    return json({
      data: results.results || [],
      total: countResult?.total ?? 0,
      page,
      limit,
      events: eventsList.results || [],
    }, env, request)
  }

  if (request.method === 'DELETE') {
    const id = url.searchParams.get('id')
    const regId = parseInt(id || '', 10)
    if (!regId || isNaN(regId)) return errorResponse('Valid id required', env, request, 400)
    const existing = await env.DB.prepare(`SELECT event_id FROM event_registrations WHERE id = ?`).bind(regId).first<{ event_id: number }>()
    const result = await env.DB.prepare(`DELETE FROM event_registrations WHERE id = ?`).bind(regId).run()
    if (!result.success) return errorResponse('Failed to delete', env, request, 500)
    if (existing?.event_id) {
      await env.DB.prepare(`UPDATE events SET seats_sold = MAX(0, seats_sold - 1), updated_at = datetime('now') WHERE id = ?`).bind(existing.event_id).run()
    }
    await logAudit(env, auth.adminId, 'delete_registration', ipHash, 'event_registration', regId)
    return json({ success: true }, env, request)
  }

  return errorResponse('Method not allowed', env, request, 405)
}
