import type { Env } from '../types'

// ─── Rate Limiting ───

interface RateLimitEntry {
  count: number
  firstAttempt: number
  lockedUntil: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const LOGIN_RATE_LIMIT = { maxAttempts: 10, windowMs: 15 * 60 * 1000, lockoutMs: 30 * 60 * 1000 }
const API_RATE_LIMIT = { maxAttempts: 100, windowMs: 60 * 1000, lockoutMs: 5 * 60 * 1000 }

export function checkRateLimit(key: string, config: typeof LOGIN_RATE_LIMIT): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (entry && entry.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000) }
  }

  if (!entry || entry.firstAttempt + config.windowMs < now) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now, lockedUntil: 0 })
    return { allowed: true, retryAfterSec: 0 }
  }

  entry.count++
  if (entry.count >= config.maxAttempts) {
    entry.lockedUntil = now + config.lockoutMs
    return { allowed: false, retryAfterSec: Math.ceil(config.lockoutMs / 1000) }
  }

  return { allowed: true, retryAfterSec: 0 }
}

export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key)
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
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}

// ─── JWT Token Sanitization ───

export function sanitizeToken(token: string): string {
  return token.replace(/[^a-zA-Z0-9_\-.]/g, '').substring(0, 2048)
}
