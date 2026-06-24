import type { Env } from '../types'

// ─── Rate Limiting (D1-backed for durability across Worker isolates) ───

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  lockoutMs: number
}

export async function checkRateLimit(env: Env, key: string, config: RateLimitConfig): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const now = Date.now()

  const row = await env.DB.prepare(
    'SELECT count, window_start, locked_until FROM rate_limits WHERE key = ?'
  ).bind(key).first<{ count: number; window_start: number; locked_until: number | null }>()

  // Still within lockout period
  if (row?.locked_until && now < row.locked_until) {
    return { allowed: false, retryAfterSec: Math.ceil((row.locked_until - now) / 1000) }
  }

  // Window expired or first request → start fresh window
  if (!row || row.window_start + config.windowMs < now) {
    await env.DB.prepare(
      `INSERT INTO rate_limits (key, count, window_start, locked_until) VALUES (?, 1, ?, NULL)
       ON CONFLICT(key) DO UPDATE SET count = 1, window_start = ?, locked_until = NULL`
    ).bind(key, now, now).run()
    return { allowed: true, retryAfterSec: 0 }
  }

  // Within window — increment
  const newCount = row.count + 1
  if (newCount >= config.maxAttempts) {
    const lockoutUntil = now + config.lockoutMs
    await env.DB.prepare(
      'UPDATE rate_limits SET count = ?, locked_until = ? WHERE key = ?'
    ).bind(newCount, lockoutUntil, key).run()
    return { allowed: false, retryAfterSec: Math.ceil(config.lockoutMs / 1000) }
  }

  await env.DB.prepare(
    'UPDATE rate_limits SET count = ? WHERE key = ?'
  ).bind(newCount, key).run()
  return { allowed: true, retryAfterSec: 0 }
}

export async function clearRateLimit(env: Env, key: string): Promise<void> {
  await env.DB.prepare('DELETE FROM rate_limits WHERE key = ?').bind(key).run()
}

export function getRateLimitKey(request: Request, prefix: string): string {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
  return `${prefix}:${ip}`
}

// ─── Input Validation ───

export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false
  if (username.length < 3 || username.length > 32) return false
  return /^[a-zA-Z0-9_.-]+$/.test(username)
}

export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false
  if (password.length < 8 || password.length > 128) return false
  return true
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  if (email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  if (phone.length < 7 || phone.length > 20) return false
  return /^\+?[0-9\s\-()]{6,19}$/.test(phone)
}

export function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') return ''
  return input.substring(0, maxLength).replace(/\0/g, '')
}

export function validateId(id: string | null): number | null {
  if (!id) return null
  const num = parseInt(id, 10)
  if (isNaN(num) || num < 1 || num > 2147483647) return null
  return num
}

export function validatePagination(page: string | null, limit: string | null): { page: number; limit: number } {
  const p = parseInt(page || '1', 10)
  const l = parseInt(limit || '50', 10)
  return {
    page: isNaN(p) || p < 1 ? 1 : Math.min(p, 1000),
    limit: isNaN(l) || l < 1 ? 50 : Math.min(l, 200),
  }
}

const VALID_LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost']
const VALID_CONTACT_STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'lost']

export function validateLeadStatus(status: string): boolean {
  return VALID_LEAD_STATUSES.includes(status)
}

export function validateContactStatus(status: string): boolean {
  return VALID_CONTACT_STATUSES.includes(status)
}

// ─── Request Body Size Limit ───

const MAX_BODY_SIZE = 16 * 1024 // 16KB

export async function safelyParseJSON(request: Request): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  const contentLength = request.headers.get('Content-Length')
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return { ok: false, error: 'Request body too large' }
  }

  const text = await request.text()
  if (text.length > MAX_BODY_SIZE) {
    return { ok: false, error: 'Request body too large' }
  }

  try {
    const data = JSON.parse(text)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { ok: false, error: 'Invalid JSON structure' }
    }
    return { ok: true, data: data as Record<string, unknown> }
  } catch {
    return { ok: false, error: 'Invalid JSON body' }
  }
}

// ─── Security Headers ───

export function securityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '0',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}

// ─── JWT Token Sanitization ───

export function sanitizeToken(token: string): string {
  return token.replace(/[^a-zA-Z0-9_\-.]/g, '').substring(0, 2048)
}
