import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'

/**
 * Google Calendar OAuth flow for the admin dashboard.
 *
 * 1. Admin visits GET /api/admin/calendar/auth → redirects to Google consent screen
 * 2. User consents → Google redirects to /api/admin/calendar/callback?code=...
 * 3. Worker exchanges code for tokens, stores them in calendar_tokens table
 */
export async function handleCalendar(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const clientId = env.GOOGLE_CLIENT_ID
  const clientSecret = env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return errorResponse('Google Calendar not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)', env, request, 400)
  }

  // GET /api/admin/calendar/auth — start OAuth
  if (url.pathname === '/api/admin/calendar/auth') {
    const redirectUri = `${url.origin}/api/admin/calendar/callback`
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')

    return Response.redirect(authUrl.toString(), 302)
  }

  // GET /api/admin/calendar/callback — handle OAuth response
  if (url.pathname === '/api/admin/calendar/callback') {
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error || !code) {
      return errorResponse(`OAuth error: ${error || 'No code provided'}`, env, request, 400)
    }

    const redirectUri = `${url.origin}/api/admin/calendar/callback`

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('Token exchange error:', err)
      return errorResponse('Failed to exchange authorization code', env, request, 500)
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }

    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString()

    // Store tokens — keep existing refresh_token if no new one returned
    const existing = await env.DB.prepare(
      `SELECT refresh_token FROM calendar_tokens ORDER BY id DESC LIMIT 1`
    ).first<{ refresh_token: string }>()

    const refreshToken = tokens.refresh_token || existing?.refresh_token

    if (!refreshToken) {
      return errorResponse('No refresh token received. Try again with prompt=consent.', env, request, 400)
    }

    await env.DB.prepare(
      `DELETE FROM calendar_tokens`
    ).run()

    await env.DB.prepare(
      `INSERT INTO calendar_tokens (access_token, refresh_token, token_expiry)
       VALUES (?, ?, ?)`
    ).bind(tokens.access_token, refreshToken, expiresAt).run()

    // Return a simple success page that the admin can close
    return new Response(
      `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Calendar Connected</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0f1c; color: #fff; text-align: center; }
.card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; max-width: 400px; }
h1 { font-size: 24px; margin: 0 0 8px; }
p { color: rgba(255,255,255,0.6); margin: 0 0 24px; }
.badge { display: inline-block; background: rgba(34,197,94,0.15); color: #22c55e; padding: 8px 20px; border-radius: 100px; font-size: 14px; font-weight: 600; }
</style></head><body>
<div class="card">
  <div class="badge">Connected</div>
  <h1>Google Calendar Linked</h1>
  <p>You can close this tab and return to the admin dashboard. New bookings will now include Google Meet links.</p>
</div>
</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  return errorResponse('Not found', env, request, 404)
}
