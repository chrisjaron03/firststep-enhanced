import type { Env } from '../types'
import { sanitizeToken } from './security'

const PBKDF2_ITERATIONS = 100000
const KEY_LENGTH = 32
const DUMMY_SALT = '00000000000000000000000000000000'
const DUMMY_HASH = '0000000000000000000000000000000000000000000000000000000000000000'

export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = hexToBytes(saltHex)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH * 8
  )
  return bytesToHex(new Uint8Array(bits))
}

export async function verifyPassword(password: string, saltHex: string, expectedHash: string): Promise<boolean> {
  const hash = await hashPassword(password, saltHex)
  return constantTimeCompare(hash, expectedHash)
}

export async function dummyPasswordCheck(): Promise<void> {
  await hashPassword('dummy', DUMMY_SALT)
}

export function generateSalt(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return bytesToHex(arr)
}

interface JWTPayload {
  sub: number
  username: string
  role: string
  jti: string
  iat: number
  exp: number
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>, secret: string, expiresInHours = 24): Promise<{ token: string; jti: string; exp: number }> {
  const now = Math.floor(Date.now() / 1000)
  const jti = crypto.randomUUID()
  const fullPayload: JWTPayload = {
    ...payload,
    jti,
    iat: now,
    exp: now + expiresInHours * 3600,
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const data = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))

  return { token: `${data}.${encodedSignature}`, jti, exp: fullPayload.exp }
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  const sanitized = sanitizeToken(token)
  const parts = sanitized.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedPayload, encodedSignature] = parts

  // Verify header algorithm to prevent alg confusion attacks
  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader))
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null
  } catch {
    return null
  }

  const data = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const signatureBytes = new Uint8Array(
    base64UrlDecode(encodedSignature).split('').map((c) => c.charCodeAt(0))
  )

  const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(data))
  if (!valid) return null

  let payload: JWTPayload
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload))
  } catch {
    return null
  }

  // Validate payload structure
  if (typeof payload.sub !== 'number' || typeof payload.exp !== 'number' || typeof payload.jti !== 'string') {
    return null
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) return null

  return payload
}

export async function isTokenRevoked(env: Env, jti: string): Promise<boolean> {
  const session = await env.DB.prepare(
    'SELECT revoked, expires_at FROM admin_sessions WHERE token_id = ?'
  ).bind(jti).first<{ revoked: number; expires_at: string }>()
  if (!session) return true
  if (session.revoked === 1) return true
  // Check if session has expired
  const expiresAt = new Date(session.expires_at + 'Z').getTime()
  if (Date.now() > expiresAt) return true
  return false
}

export async function createSession(env: Env, jti: string, adminId: number, ipHash: string, userAgent: string, exp: number): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO admin_sessions (token_id, admin_id, ip_hash, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(jti, adminId, ipHash, userAgent, new Date(exp * 1000).toISOString()).run()
}

export async function revokeSession(env: Env, jti: string): Promise<void> {
  await env.DB.prepare(
    'UPDATE admin_sessions SET revoked = 1 WHERE token_id = ?'
  ).bind(jti).run()
}

export async function logAudit(env: Env, adminId: number | null, action: string, ipHash: string, resourceType?: string, resourceId?: number, details?: string): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO admin_audit_log (admin_id, action, resource_type, resource_id, ip_hash, details) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(adminId, action, resourceType ?? null, resourceId ?? null, ipHash, details ?? null).run()
}

export async function authenticateRequest(request: Request, env: Env): Promise<{ payload: JWTPayload; adminId: number } | { error: string; status: number }> {
  let token: string | null = null

  // Preferred: read token from HttpOnly cookie (not accessible to XSS)
  const cookieHeader = request.headers.get('Cookie') || ''
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)fscs_admin_token=([^;]+)/)
  if (cookieMatch) {
    token = sanitizeToken(cookieMatch[1])
  }

  // Fallback: Authorization Bearer header (for API clients / backward compat)
  if (!token) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = sanitizeToken(authHeader.substring(7))
    }
  }

  if (!token) {
    return { error: 'Missing or invalid authentication', status: 401 }
  }

  const payload = await verifyJWT(token, env.JWT_SECRET)
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 }
  }

  if (await isTokenRevoked(env, payload.jti)) {
    return { error: 'Token has been revoked', status: 401 }
  }

  return { payload, adminId: payload.sub }
}

// ─── Helpers ───

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4
  return atob(pad ? padded + '='.repeat(4 - pad) : padded)
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
