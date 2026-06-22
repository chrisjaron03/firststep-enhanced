import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { hashPassword, verifyPassword, generateSalt, signJWT, verifyJWT, createSession, revokeSession, logAudit, dummyPasswordCheck } from '../lib/auth'
import { hashIP } from '../lib/utils'
import { checkRateLimit, clearRateLimit, getRateLimitKey, validateUsername, validatePassword, safelyParseJSON, sanitizeToken, sanitizeString, securityHeaders } from '../lib/security'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export async function handleAdminAuth(request: Request, env: Env, action: string): Promise<Response> {
  if (action === 'login') return handleLogin(request, env)
  if (action === 'logout') return handleLogout(request, env)
  if (action === 'verify') return handleVerify(request, env)
  return errorResponse('Unknown auth action', env, request, 404)
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return errorResponse('Method not allowed', env, request, 405)

  // IP-based rate limiting (prevents brute force from single IP across multiple usernames)
  const rateLimitKey = getRateLimitKey(request, 'login')
  const rateLimit = checkRateLimit(rateLimitKey, { maxAttempts: 10, windowMs: 15 * 60 * 1000, lockoutMs: 30 * 60 * 1000 })
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: `Too many login attempts from this IP. Try again in ${Math.ceil(rateLimit.retryAfterSec / 60)} minutes.` }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rateLimit.retryAfterSec), ...securityHeaders() } }
    )
  }

  // Safe JSON parsing with size limit
  const parsed = await safelyParseJSON(request)
  if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)

  const body = parsed.data as { username?: string; password?: string }
  const username = sanitizeString(body.username || '', 32)
  const password = body.password || ''

  // Input validation
  if (!validateUsername(username) || !validatePassword(password)) {
    return errorResponse('Invalid credentials', env, request, 401)
  }

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
  const ipHash = await hashIP(ip)
  const userAgent = sanitizeString(request.headers.get('User-Agent') || '', 500)

  const admin = await env.DB.prepare(
    'SELECT * FROM admin_users WHERE username = ?'
  ).bind(username).first<{
    id: number
    username: string
    email: string
    password_hash: string
    password_salt: string
    role: string
    failed_attempts: number
    locked_until: string | null
  }>()

  // Timing-safe: if user doesn't exist, run a dummy PBKDF2 hash so response time is identical
  if (!admin) {
    await dummyPasswordCheck()
    await logAudit(env, null, 'login_failed', ipHash, undefined, undefined, JSON.stringify({ username, reason: 'user_not_found' }))
    return errorResponse('Invalid credentials', env, request, 401)
  }

  // Check lockout
  if (admin.locked_until) {
    const lockedUntil = new Date(admin.locked_until + 'Z').getTime()
    if (Date.now() < lockedUntil) {
      await logAudit(env, admin.id, 'login_failed', ipHash, undefined, undefined, JSON.stringify({ reason: 'account_locked' }))
      return errorResponse(`Account locked. Try again in ${Math.ceil((lockedUntil - Date.now()) / 60000)} minutes.`, env, request, 423)
    }
  }

  // Check placeholder password (not yet seeded)
  if (admin.password_hash === 'PLACEHOLDER_RUN_SEED_SCRIPT') {
    return errorResponse('Admin password not set. Run: npm run db:seed-admin', env, request, 500)
  }

  const valid = await verifyPassword(password, admin.password_salt, admin.password_hash)
  if (!valid) {
    const newAttempts = admin.failed_attempts + 1
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS
    await env.DB.prepare(
      'UPDATE admin_users SET failed_attempts = ?, locked_until = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(
      newAttempts,
      shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString().replace('T', ' ').substring(0, 19) : null,
      admin.id
    ).run()

    await logAudit(env, admin.id, 'login_failed', ipHash, undefined, undefined, JSON.stringify({ reason: 'wrong_password', attempts: newAttempts }))
    return errorResponse(
      shouldLock ? `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` : 'Invalid credentials',
      env, request,
      shouldLock ? 423 : 401
    )
  }

  // Reset failed attempts and clear IP rate limit on successful login
  await env.DB.prepare(
    'UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?'
  ).bind(admin.id).run()
  clearRateLimit(rateLimitKey)

  // Create JWT with short lifetime (8 hours)
  const { token, jti, exp } = await signJWT(
    { sub: admin.id, username: admin.username, role: admin.role },
    env.JWT_SECRET,
    8
  )

  await createSession(env, jti, admin.id, ipHash, userAgent, exp)
  await logAudit(env, admin.id, 'login_success', ipHash)

  return json({
    success: true,
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
    expires_at: new Date(exp * 1000).toISOString(),
  }, env, request)
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return errorResponse('Method not allowed', env, request, 405)

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('No token provided', env, request, 401)
  }

  const token = sanitizeToken(authHeader.substring(7))
  const payload = await verifyJWT(token, env.JWT_SECRET)
  if (payload) {
    await revokeSession(env, payload.jti)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    await logAudit(env, payload.sub, 'logout', await hashIP(ip))
  }

  return json({ success: true }, env, request)
}

async function handleVerify(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return errorResponse('Method not allowed', env, request, 405)

  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('No token provided', env, request, 401)
  }

  const token = sanitizeToken(authHeader.substring(7))
  const payload = await verifyJWT(token, env.JWT_SECRET)
  if (!payload) {
    return errorResponse('Invalid or expired token', env, request, 401)
  }

  // Check if revoked or expired
  const session = await env.DB.prepare(
    'SELECT revoked, expires_at FROM admin_sessions WHERE token_id = ?'
  ).bind(payload.jti).first<{ revoked: number; expires_at: string }>()

  if (!session || session.revoked === 1) {
    return errorResponse('Token has been revoked', env, request, 401)
  }

  const expiresAt = new Date(session.expires_at + 'Z').getTime()
  if (Date.now() > expiresAt) {
    return errorResponse('Token has expired', env, request, 401)
  }

  return json({
    valid: true,
    admin: {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    },
    expires_at: new Date(payload.exp * 1000).toISOString(),
  }, env, request)
}
