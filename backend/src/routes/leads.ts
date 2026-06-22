import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { hashIP } from '../lib/utils'
import { safelyParseJSON, sanitizeString, validateEmail, checkRateLimit, getRateLimitKey, securityHeaders } from '../lib/security'

const VALID_SOURCES = ['lead_capture_modal', 'exit_intent_modal', 'sip_calculator']

export async function handleLeads(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', env, request, 405)
  }

  // Rate limit: 10 lead submissions per IP per hour
  const rateLimitKey = getRateLimitKey(request, 'leads')
  const rateLimit = checkRateLimit(rateLimitKey, { maxAttempts: 10, windowMs: 60 * 60 * 1000, lockoutMs: 60 * 60 * 1000 })
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many submissions. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rateLimit.retryAfterSec), ...securityHeaders() } }
    )
  }

  const parsed = await safelyParseJSON(request)
  if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
  const body = parsed.data as Record<string, unknown>

  const name = sanitizeString(String(body.name || ''), 100)
  const email = sanitizeString(String(body.email || ''), 254)
  const phone = sanitizeString(String(body.phone || ''), 20)
  const source = sanitizeString(String(body.source || ''), 30)

  if (!name || !email || !phone || !source) {
    return errorResponse('Missing required fields: name, email, phone, source', env, request, 400)
  }

  if (!validateEmail(email)) {
    return errorResponse('Invalid email address', env, request, 400)
  }

  if (!VALID_SOURCES.includes(source)) {
    return errorResponse('Invalid source', env, request, 400)
  }

  const monthlyInvestment = typeof body.monthly_investment === 'number' && body.monthly_investment >= 0 && body.monthly_investment <= 10000000 ? body.monthly_investment : null
  const expectedReturn = typeof body.expected_return === 'number' && body.expected_return >= 0 && body.expected_return <= 100 ? body.expected_return : null
  const tenureYears = typeof body.tenure_years === 'number' && body.tenure_years >= 0 && body.tenure_years <= 50 ? body.tenure_years : null
  const projectedValue = typeof body.projected_value === 'number' && body.projected_value >= 0 && body.projected_value <= 10000000000 ? body.projected_value : null

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
  const ipHash = await hashIP(ip)
  const userAgent = sanitizeString(request.headers.get('User-Agent') || '', 500)
  const sessionId = sanitizeString(request.headers.get('X-Session-Id') || '', 64) || null
  const pageUrl = body.page_url ? sanitizeString(String(body.page_url), 2048) : null
  const referrer = body.referrer ? sanitizeString(String(body.referrer), 2048) : null

  const result = await env.DB.prepare(
    `INSERT INTO leads (source, name, email, phone, monthly_investment, expected_return, tenure_years, projected_value, page_url, referrer, user_agent, ip_hash, session_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    source, name, email, phone,
    monthlyInvestment, expectedReturn, tenureYears, projectedValue,
    pageUrl, referrer, userAgent, ipHash, sessionId
  ).run()

  if (!result.success) {
    return errorResponse('Failed to store lead', env, request, 500)
  }

  return json({ success: true, id: result.meta.last_row_id }, env, request, 201)
}
