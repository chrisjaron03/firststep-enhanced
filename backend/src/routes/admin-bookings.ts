import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { safelyParseJSON, sanitizeString } from '../lib/security'
import { authenticateRequest } from '../lib/auth'

export async function handleAdminBooking(request: Request, env: Env): Promise<Response> {
  const auth = await authenticateRequest(request, env)
  if ('error' in auth) {
    return errorResponse(auth.error, env, request, auth.status)
  }
  const admin = auth

  const url = new URL(request.url)
  const method = request.method

  // GET /api/admin/bookings — list all bookings
  if (method === 'GET') {
    const status = url.searchParams.get('status') || ''
    const date = url.searchParams.get('date') || ''

    let query = `SELECT a.*, u.username AS created_by_name
                 FROM appointments a
                 LEFT JOIN admin_users u ON u.id = ?`
    const params: (string | number)[] = [admin.adminId]
    const conditions: string[] = []

    if (status) {
      conditions.push(`a.status = ?`)
      params.push(status)
    }
    if (date) {
      conditions.push(`a.date = ?`)
      params.push(date)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    query += ` ORDER BY a.date DESC, a.start_time DESC LIMIT 100`

    const result = await env.DB.prepare(query).bind(...params).all()
    return json({ data: result.results ?? [] }, env, request)
  }

  // PUT /api/admin/bookings — update booking status
  if (method === 'PUT') {
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as Record<string, unknown>

    const id = Number(body.id)
    const status = sanitizeString(String(body.status || ''), 20)
    const notes = body.notes !== undefined ? sanitizeString(String(body.notes), 1000) : undefined

    if (!id || !['confirmed', 'cancelled', 'completed'].includes(status)) {
      return errorResponse('Invalid id or status', env, request, 400)
    }

    if (notes !== undefined) {
      await env.DB.prepare(
        `UPDATE appointments SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(status, notes, id).run()
    } else {
      await env.DB.prepare(
        `UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(status, id).run()
    }

    // Log to audit
    await env.DB.prepare(
      `INSERT INTO admin_audit_log (admin_id, action, resource_type, resource_id, details)
       VALUES (?, 'update_status', 'appointment', ?, ?)`
    ).bind(admin.adminId, id, JSON.stringify({ status, notes })).run()

    return json({ success: true }, env, request)
  }

  // DELETE /api/admin/bookings — delete booking
  if (method === 'DELETE') {
    const id = Number(url.searchParams.get('id'))
    if (!id) return errorResponse('Missing id', env, request, 400)

    await env.DB.prepare(`DELETE FROM appointments WHERE id = ?`).bind(id).run()

    await env.DB.prepare(
      `INSERT INTO admin_audit_log (admin_id, action, resource_type, resource_id)
       VALUES (?, 'delete', 'appointment', ?)`
    ).bind(admin.adminId, id).run()

    return json({ success: true }, env, request)
  }

  return errorResponse('Method not allowed', env, request, 405)
}
