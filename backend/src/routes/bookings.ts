import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { safelyParseJSON, sanitizeString, validateEmail } from '../lib/security'
import { createCalendarEvent } from '../lib/calendar'

const SLOT_DURATION = 30
const MAX_SLOTS_DAYS_AHEAD = 30

function generateTimeSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let mins = sh * 60 + sm
  const endMins = eh * 60 + em
  while (mins + duration <= endMins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0')
    const m = (mins % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    mins += duration
  }
  return slots
}

export async function handleBooking(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)

  // GET /api/bookings/slots?date=YYYY-MM-DD
  if (request.method === 'GET' && url.pathname === '/api/bookings/slots') {
    const date = url.searchParams.get('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse('Invalid date (use YYYY-MM-DD)', env, request, 400)
    }

    const requested = new Date(date + 'T00:00:00')
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (requested < today) {
      return json({ slots: [], date }, env, request)
    }

    const dayOfWeek = requested.getDay()

    const [availRow, bookedRows, blockedRow] = await Promise.all([
      env.DB.prepare(
        `SELECT start_time, end_time, slot_duration FROM availability WHERE day_of_week = ? AND is_active = 1 LIMIT 1`
      ).bind(dayOfWeek).first<{ start_time: string; end_time: string; slot_duration: number }>(),

      env.DB.prepare(
        `SELECT start_time FROM appointments WHERE date = ? AND status = 'confirmed'`
      ).bind(date).all<{ start_time: string }>(),

      env.DB.prepare(
        `SELECT id FROM blocked_dates WHERE date = ?`
      ).bind(date).first<{ id: number }>(),
    ])

    if (!availRow || blockedRow) {
      return json({ slots: [], date }, env, request)
    }

    const duration = availRow.slot_duration || SLOT_DURATION
    const allSlots = generateTimeSlots(availRow.start_time, availRow.end_time, duration)
    const bookedTimes = new Set(bookedRows.results?.map((r) => r.start_time) || [])

    // For today, filter out past slots
    const slots = allSlots.filter((s) => {
      if (bookedTimes.has(s)) return false
      if (requested.getTime() === today.getTime()) {
        const [sh, sm] = s.split(':').map(Number)
        const slotMins = sh * 60 + sm
        const nowMins = now.getHours() * 60 + now.getMinutes()
        if (slotMins <= nowMins) return false
      }
      return true
    })

    return json({ slots, date }, env, request)
  }

  // POST /api/bookings — create a booking
  if (request.method === 'POST') {
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as Record<string, unknown>

    const clientName = sanitizeString(String(body.client_name || ''), 100)
    const clientEmail = sanitizeString(String(body.client_email || ''), 254)
    const clientPhone = sanitizeString(String(body.client_phone || ''), 20) || null
    const date = sanitizeString(String(body.date || ''), 10)
    const startTime = sanitizeString(String(body.start_time || ''), 5)
    const timezone = sanitizeString(String(body.timezone || 'Asia/Kolkata'), 50)

    if (!clientName || !clientEmail || !date || !startTime) {
      return errorResponse('Missing required fields: client_name, client_email, date, start_time', env, request, 400)
    }
    if (!validateEmail(clientEmail)) {
      return errorResponse('Invalid email address', env, request, 400)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse('Invalid date format', env, request, 400)
    }
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return errorResponse('Invalid time format', env, request, 400)
    }

    // Get slot duration and compute end time
    const dayOfWeek = new Date(date + 'T00:00:00').getDay()
    const availRow = await env.DB.prepare(
      `SELECT start_time, end_time, slot_duration FROM availability WHERE day_of_week = ? AND is_active = 1 LIMIT 1`
    ).bind(dayOfWeek).first<{ start_time: string; end_time: string; slot_duration: number }>()

    if (!availRow) {
      return errorResponse('No availability on this date', env, request, 400)
    }

    const duration = availRow.slot_duration || SLOT_DURATION
    const [sh, sm] = startTime.split(':').map(Number)
    const startMins = sh * 60 + sm
    const endMins = startMins + duration
    const endHour = Math.floor(endMins / 60).toString().padStart(2, '0')
    const endMin = (endMins % 60).toString().padStart(2, '0')
    const endTime = `${endHour}:${endMin}`

    // Check slot is valid within availability
    const allSlots = generateTimeSlots(availRow.start_time, availRow.end_time, duration)
    if (!allSlots.includes(startTime)) {
      return errorResponse('Selected time slot is not available', env, request, 400)
    }

    // Check not double-booked
    const existing = await env.DB.prepare(
      `SELECT id FROM appointments WHERE date = ? AND start_time = ? AND status = 'confirmed'`
    ).bind(date, startTime).first<{ id: number }>()

    if (existing) {
      return errorResponse('This time slot is already booked', env, request, 409)
    }

    // Insert appointment
    const result = await env.DB.prepare(
      `INSERT INTO appointments (client_name, client_email, client_phone, date, start_time, end_time, timezone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(clientName, clientEmail, clientPhone, date, startTime, endTime, timezone).run()

    if (!result.success) {
      return errorResponse('Failed to create booking', env, request, 500)
    }

    const appointmentId = result.meta.last_row_id

    // Try to create a Google Calendar event with Meet link (non-blocking)
    let meetLink: string | null = null
    try {
      meetLink = await createCalendarEvent(env, {
        summary: `Consultation: ${clientName}`,
        description: `Booking #${appointmentId}\nClient: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone || 'N/A'}`,
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`,
        timezone,
        attendees: [{ email: clientEmail, name: clientName }],
      })

      if (meetLink) {
        await env.DB.prepare(
          `UPDATE appointments SET meet_link = ? WHERE id = ?`
        ).bind(meetLink, appointmentId).run()
      }
    } catch {
      // Calendar integration is optional; booking still succeeds
    }

    return json({
      success: true,
      id: appointmentId,
      meet_link: meetLink,
      date,
      start_time: startTime,
      end_time: endTime,
    }, env, request, 201)
  }

  return errorResponse('Method not allowed', env, request, 405)
}
