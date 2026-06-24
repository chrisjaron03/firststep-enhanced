import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { hashIP } from '../lib/utils'
import { safelyParseJSON, sanitizeString, validateEmail, validatePhone, checkRateLimit, getRateLimitKey, securityHeaders } from '../lib/security'

const VALID_SERVICES = ['mf', 'pms', 'aif', 'unlisted', 'lrs', 'gift', 'demat', 'fd', 'bonds', 'insurance', 'nps', 'comprehensive']
const VALID_RANGES = ['under5', '5to25', '25to50', '50to1cr', '1to5cr', 'above5cr']

export async function handleContacts(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', env, request, 405)
  }

  // Rate limit: 5 contact submissions per IP per hour
  const rateLimitKey = getRateLimitKey(request, 'contacts')
  const rateLimit = await checkRateLimit(env, rateLimitKey, { maxAttempts: 5, windowMs: 60 * 60 * 1000, lockoutMs: 60 * 60 * 1000 })
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many submissions. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rateLimit.retryAfterSec), ...securityHeaders() } }
    )
  }

  const parsed = await safelyParseJSON(request)
  if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
  const body = parsed.data as Record<string, unknown>

  // Honeypot: if the hidden "website" field is filled, silently reject (bot trap)
  const honeypot = sanitizeString(String(body.website || ''), 500)
  if (honeypot) {
    return json({ success: true, id: 0 }, env, request, 201)
  }

  const firstName = sanitizeString(String(body.first_name || ''), 100)
  const lastName = sanitizeString(String(body.last_name || ''), 100)
  const email = sanitizeString(String(body.email || ''), 254)
  const phone = sanitizeString(String(body.phone || ''), 20)

  if (!firstName || !lastName || !email || !phone) {
    return errorResponse('Missing required fields: first_name, last_name, email, phone', env, request, 400)
  }

  if (!validateEmail(email)) {
    return errorResponse('Invalid email address', env, request, 400)
  }

  if (!validatePhone(phone)) {
    return errorResponse('Invalid phone number', env, request, 400)
  }

  const investmentRange = body.investment_range ? sanitizeString(String(body.investment_range), 20) : null
  const service = body.service ? sanitizeString(String(body.service), 20) : null
  const message = body.message ? sanitizeString(String(body.message), 5000) : null

  if (investmentRange && !VALID_RANGES.includes(investmentRange)) {
    return errorResponse('Invalid investment range', env, request, 400)
  }
  if (service && !VALID_SERVICES.includes(service)) {
    return errorResponse('Invalid service', env, request, 400)
  }

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
  const ipHash = await hashIP(ip)
  const userAgent = sanitizeString(request.headers.get('User-Agent') || '', 500)
  const sessionId = sanitizeString(request.headers.get('X-Session-Id') || '', 64) || null
  const pageUrl = body.page_url ? sanitizeString(String(body.page_url), 2048) : null
  const referrer = body.referrer ? sanitizeString(String(body.referrer), 2048) : null

  const result = await env.DB.prepare(
    `INSERT INTO contacts (first_name, last_name, email, phone, investment_range, service, message, page_url, referrer, user_agent, ip_hash, session_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    firstName, lastName, email, phone,
    investmentRange, service, message,
    pageUrl, referrer, userAgent, ipHash, sessionId
  ).run()

  if (!result.success) {
    return errorResponse('Failed to store contact', env, request, 500)
  }

  return json({ success: true, id: result.meta.last_row_id }, env, request, 201)
}
