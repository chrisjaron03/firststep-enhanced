import type { Env } from '../types'

interface CalendarEventInput {
  summary: string
  description: string
  startTime: string    // ISO
  endTime: string      // ISO
  timezone: string
  attendees: { email: string; name: string }[]
}

/**
 * Create a Google Calendar event with a Google Meet link.
 *
 * Pre-requisites:
 *   1. Google Cloud project with Calendar API enabled
 *   2. OAuth 2.0 credentials (client ID + secret) stored as Worker secrets:
 *      - GOOGLE_CLIENT_ID
 *      - GOOGLE_CLIENT_SECRET
 *   3. Admin has gone through the OAuth flow at /api/admin/calendar/auth
 *      to grant access and store a refresh_token in the calendar_tokens table.
 *
 * If tokens aren't configured, this silently returns null (no Meet link).
 */
export async function createCalendarEvent(env: Env, event: CalendarEventInput): Promise<string | null> {
  const clientId = env.GOOGLE_CLIENT_ID
  const clientSecret = env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) return null

  // Get stored tokens
  const tokenRow = await env.DB.prepare(
    `SELECT access_token, refresh_token, token_expiry, calendar_id FROM calendar_tokens ORDER BY id DESC LIMIT 1`
  ).first<{ access_token: string | null; refresh_token: string; token_expiry: string | null; calendar_id: string | null }>()

  if (!tokenRow) return null

  let accessToken = tokenRow.access_token
  const now = Date.now()

  // Refresh if expired
  if (tokenRow.token_expiry && new Date(tokenRow.token_expiry).getTime() < now + 60000) {
    const refreshed = await refreshAccessToken(clientId, clientSecret, tokenRow.refresh_token)
    if (!refreshed) return null
    accessToken = refreshed.access_token
    await env.DB.prepare(
      `UPDATE calendar_tokens SET access_token = ?, token_expiry = ?, updated_at = datetime('now') WHERE id = (SELECT id FROM calendar_tokens ORDER BY id DESC LIMIT 1)`
    ).bind(accessToken, refreshed.expires_at).run()
  }

  if (!accessToken) return null

  const calendarId = tokenRow.calendar_id || 'primary'

  // Create event with Google Meet
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.startTime,
          timeZone: event.timezone,
        },
        end: {
          dateTime: event.endTime,
          timeZone: event.timezone,
        },
        attendees: event.attendees.map((a) => ({ email: a.email, displayName: a.name })),
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      }),
    }
  )

  if (!response.ok) {
    const errBody = await response.text()
    console.error('Calendar API error:', response.status, errBody)
    return null
  }

  const data = (await response.json()) as { hangoutLink?: string; id?: string }

  // Store the event ID so we can update/cancel later
  if (data.id) {
    await env.DB.prepare(
      `UPDATE appointments SET calendar_event_id = ? WHERE meet_link IS NULL ORDER BY id DESC LIMIT 1`
    ).bind(data.id).run().catch(() => {})
  }

  return data.hangoutLink || null
}

async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<{ access_token: string; expires_at: string } | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) return null

    const data = (await res.json()) as { access_token: string; expires_in: number }
    const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString()
    return { access_token: data.access_token, expires_at: expiresAt }
  } catch {
    return null
  }
}
