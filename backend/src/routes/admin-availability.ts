import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { safelyParseJSON, sanitizeString } from '../lib/security'
import { authenticateRequest } from '../lib/auth'

export interface AvailabilityRow {
  id?: number
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration: number
  is_active: number | boolean
}

export interface BlockedDateRow {
  id?: number
  date: string
  reason?: string | null
}

async function ensureBookingTables(env: Env) {
  try {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name     TEXT    NOT NULL,
        client_email    TEXT    NOT NULL,
        client_phone    TEXT,
        date            TEXT    NOT NULL,
        start_time      TEXT    NOT NULL,
        end_time        TEXT    NOT NULL,
        timezone        TEXT    NOT NULL DEFAULT 'Asia/Kolkata',
        meet_link       TEXT,
        calendar_event_id TEXT,
        status          TEXT    NOT NULL DEFAULT 'confirmed',
        notes           TEXT,
        reminder_sent   INTEGER NOT NULL DEFAULT 0,
        created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS availability (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        day_of_week INTEGER NOT NULL UNIQUE,
        start_time  TEXT    NOT NULL,
        end_time    TEXT    NOT NULL,
        slot_duration INTEGER NOT NULL DEFAULT 30,
        is_active   INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        date    TEXT NOT NULL UNIQUE,
        reason  TEXT
      );
      INSERT OR IGNORE INTO availability (day_of_week, start_time, end_time, slot_duration, is_active)
      VALUES
        (1, '09:30', '18:00', 30, 1),
        (2, '09:30', '18:00', 30, 1),
        (3, '09:30', '18:00', 30, 1),
        (4, '09:30', '18:00', 30, 1),
        (5, '09:30', '18:00', 30, 1),
        (6, '10:00', '14:00', 30, 1),
        (0, '10:00', '14:00', 30, 0);
    `)
  } catch {
    // ignore
  }
}

export async function handleAdminAvailability(request: Request, env: Env): Promise<Response> {
  await ensureBookingTables(env)
  const url = new URL(request.url)
  const method = request.method

  // Public summary endpoint
  if (method === 'GET' && url.pathname === '/api/availability/public') {
    const [availRows, blockedRows] = await Promise.all([
      env.DB.prepare(`SELECT day_of_week, start_time, end_time, slot_duration FROM availability WHERE is_active = 1`).all<{
        day_of_week: number
        start_time: string
        end_time: string
        slot_duration: number
      }>(),
      env.DB.prepare(`SELECT date, reason FROM blocked_dates`).all<{ date: string; reason?: string }>(),
    ])

    return json({
      active_days: availRows.results || [],
      blocked_dates: blockedRows.results || [],
    }, env, request)
  }

  // Admin-only endpoints
  const auth = await authenticateRequest(request, env)
  if ('error' in auth) {
    return errorResponse(auth.error, env, request, auth.status)
  }
  const admin = auth

  // GET /api/admin/availability — get all availability rows and blocked dates
  if (method === 'GET' && url.pathname === '/api/admin/availability') {
    const [availRows, blockedRows] = await Promise.all([
      env.DB.prepare(`SELECT * FROM availability ORDER BY day_of_week ASC`).all<AvailabilityRow>(),
      env.DB.prepare(`SELECT * FROM blocked_dates ORDER BY date ASC`).all<BlockedDateRow>(),
    ])

    return json({
      schedule: availRows.results || [],
      blocked_dates: blockedRows.results || [],
    }, env, request)
  }

  // PUT /api/admin/availability — update weekly availability schedule
  if (method === 'PUT' && url.pathname === '/api/admin/availability') {
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as { schedule?: AvailabilityRow[] }

    if (!Array.isArray(body.schedule)) {
      return errorResponse('Invalid schedule payload: expected array', env, request, 400)
    }

    for (const item of body.schedule) {
      const day = Number(item.day_of_week)
      const startTime = sanitizeString(item.start_time, 5)
      const endTime = sanitizeString(item.end_time, 5)
      const duration = Number(item.slot_duration) || 30
      const isActive = item.is_active ? 1 : 0

      if (day < 0 || day > 6 || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
        continue
      }

      await env.DB.prepare(`
        INSERT INTO availability (day_of_week, start_time, end_time, slot_duration, is_active)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(day_of_week) DO UPDATE SET
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          slot_duration = excluded.slot_duration,
          is_active = excluded.is_active
      `).bind(day, startTime, endTime, duration, isActive).run()
    }

    // Audit log
    await env.DB.prepare(
      `INSERT INTO admin_audit_log (admin_id, action, resource_type, details)
       VALUES (?, 'update_schedule', 'availability', ?)`
    ).bind(admin.adminId, JSON.stringify(body.schedule)).run()

    return json({ success: true, message: 'Schedule updated' }, env, request)
  }

  // POST /api/admin/blocked-dates — block a specific date
  if (method === 'POST' && url.pathname === '/api/admin/blocked-dates') {
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as { date?: string; reason?: string }

    const date = sanitizeString(String(body.date || ''), 10)
    const reason = body.reason ? sanitizeString(String(body.reason), 200) : null

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse('Invalid date format (use YYYY-MM-DD)', env, request, 400)
    }

    await env.DB.prepare(`
      INSERT INTO blocked_dates (date, reason)
      VALUES (?, ?)
      ON CONFLICT(date) DO UPDATE SET reason = excluded.reason
    `).bind(date, reason).run()

    // Audit log
    await env.DB.prepare(
      `INSERT INTO admin_audit_log (admin_id, action, resource_type, details)
       VALUES (?, 'block_date', 'blocked_dates', ?)`
    ).bind(admin.adminId, JSON.stringify({ date, reason })).run()

    return json({ success: true, date, reason }, env, request, 201)
  }

  // DELETE /api/admin/blocked-dates — unblock a date
  if (method === 'DELETE' && url.pathname === '/api/admin/blocked-dates') {
    const date = url.searchParams.get('date')
    const id = url.searchParams.get('id')

    if (date) {
      await env.DB.prepare(`DELETE FROM blocked_dates WHERE date = ?`).bind(date).run()
    } else if (id) {
      await env.DB.prepare(`DELETE FROM blocked_dates WHERE id = ?`).bind(Number(id)).run()
    } else {
      return errorResponse('Missing date or id parameter', env, request, 400)
    }

    // Audit log
    await env.DB.prepare(
      `INSERT INTO admin_audit_log (admin_id, action, resource_type, details)
       VALUES (?, 'unblock_date', 'blocked_dates', ?)`
    ).bind(admin.adminId, JSON.stringify({ date, id })).run()

    return json({ success: true, message: 'Date unblocked' }, env, request)
  }

  return errorResponse('Not found', env, request, 404)
}
