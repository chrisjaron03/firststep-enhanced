import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { hashIP, parseDevice, parseBrowser, getPath } from '../lib/utils'
import { safelyParseJSON, sanitizeString, checkRateLimit, getRateLimitKey, securityHeaders } from '../lib/security'

const VALID_EVENT_TYPES = ['pageview', 'click', 'scroll', 'custom']

export async function handleAnalytics(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', env, request, 405)
  }

  // Rate limit: 200 analytics events per IP per minute
  const rateLimitKey = getRateLimitKey(request, 'analytics')
  const rateLimit = await checkRateLimit(env, rateLimitKey, { maxAttempts: 200, windowMs: 60 * 1000, lockoutMs: 5 * 60 * 1000 })
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rateLimit.retryAfterSec), ...securityHeaders() } }
    )
  }

  const parsed = await safelyParseJSON(request)
  if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
  const body = parsed.data as Record<string, unknown>

  const sessionId = sanitizeString(String(body.session_id || ''), 64)
  const type = sanitizeString(String(body.type || ''), 20)
  const pageUrl = sanitizeString(String(body.page_url || ''), 2048)

  if (!sessionId || !type || !pageUrl) {
    return errorResponse('Missing required fields: session_id, type, page_url', env, request, 400)
  }

  if (!VALID_EVENT_TYPES.includes(type)) {
    return errorResponse('Invalid event type', env, request, 400)
  }

  // Reject analytics for admin routes — admin traffic must not be tracked
  const pagePath = body.page_path ? sanitizeString(String(body.page_path), 500) : getPath(pageUrl)
  if (pagePath.startsWith('/admin')) {
    return json({ success: true, ignored: true }, env, request, 201)
  }

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
  const ipHash = await hashIP(ip)
  const userAgent = sanitizeString(request.headers.get('User-Agent') || '', 500)
  const country = request.headers.get('CF-IPCountry') || null
  const city = request.headers.get('CF-IPCity') || null
  const device = parseDevice(userAgent)
  const browser = parseBrowser(userAgent)

  const scrollDepth = typeof body.scroll_depth === 'number' && body.scroll_depth >= 0 && body.scroll_depth <= 100 ? body.scroll_depth : null

  const result = await env.DB.prepare(
    `INSERT INTO analytics_events
     (session_id, type, page_url, page_path, referrer, element_id, element_class, element_text, element_href, scroll_depth, event_name, event_data, user_agent, ip_hash, country, city, device, browser)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    sessionId, type, pageUrl, pagePath,
    body.referrer ? sanitizeString(String(body.referrer), 2048) : null,
    body.element_id ? sanitizeString(String(body.element_id), 200) : null,
    body.element_class ? sanitizeString(String(body.element_class), 200) : null,
    body.element_text ? sanitizeString(String(body.element_text), 200) : null,
    body.element_href ? sanitizeString(String(body.element_href), 2048) : null,
    scrollDepth,
    body.event_name ? sanitizeString(String(body.event_name), 100) : null,
    body.event_data ? sanitizeString(String(body.event_data), 2000) : null,
    userAgent, ipHash, country, city, device, browser
  ).run()

  if (!result.success) {
    return errorResponse('Failed to store analytics event', env, request, 500)
  }

  await updateSession(env, {
    session_id: sessionId,
    page_url: pageUrl,
    page_path: pagePath,
    type: type,
    referrer: body.referrer ? sanitizeString(String(body.referrer), 2048) : undefined,
    ip_hash: ipHash,
    country,
    city,
    device,
    browser,
  })

  return json({ success: true, id: result.meta.last_row_id }, env, request, 201)
}

async function updateSession(
  env: Env,
  data: {
    session_id: string
    page_url: string
    page_path: string
    type: string
    referrer?: string
    ip_hash: string
    country: string | null
    city: string | null
    device: string
    browser: string
  }
): Promise<void> {
  const existing = await env.DB.prepare(
    `SELECT id FROM analytics_sessions WHERE session_id = ?`
  ).bind(data.session_id).first<{ id: number }>()

  if (existing) {
    const isPageview = data.type === 'pageview'
    const isClick = data.type === 'click'
    await env.DB.prepare(
      `UPDATE analytics_sessions
       SET last_page = ?, last_active = datetime('now'),
           page_count = page_count + ?,
           click_count = click_count + ?
       WHERE session_id = ?`
    ).bind(
      data.page_path,
      isPageview ? 1 : 0,
      isClick ? 1 : 0,
      data.session_id
    ).run()
  } else {
    await env.DB.prepare(
      `INSERT INTO analytics_sessions
       (session_id, first_page, last_page, page_count, click_count, country, city, device, browser, referrer, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      data.session_id,
      data.page_path,
      data.page_path,
      data.type === 'pageview' ? 1 : 0,
      data.type === 'click' ? 1 : 0,
      data.country,
      data.city,
      data.device,
      data.browser,
      data.referrer ?? null,
      data.ip_hash
    ).run()
  }
}
