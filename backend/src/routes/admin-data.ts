import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'
import { authenticateRequest, logAudit } from '../lib/auth'
import { hashIP } from '../lib/utils'
import { checkRateLimit, getRateLimitKey, validateId, validatePagination, validateLeadStatus, validateContactStatus, safelyParseJSON, sanitizeString, securityHeaders } from '../lib/security'

export async function handleAdminData(request: Request, env: Env, resource: string): Promise<Response> {
  const auth = await authenticateRequest(request, env)
  if ('error' in auth) {
    return errorResponse(auth.error, env, request, auth.status)
  }

  // API rate limiting per IP for admin data endpoints
  const rateLimitKey = getRateLimitKey(request, 'admin_api')
  const rateLimit = await checkRateLimit(env, rateLimitKey, { maxAttempts: 100, windowMs: 60 * 1000, lockoutMs: 5 * 60 * 1000 })
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Slow down.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rateLimit.retryAfterSec), ...securityHeaders() } }
    )
  }

  const { adminId } = auth
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const ipHash = await hashIP(ip)
  const url = new URL(request.url)
  const rawId = url.searchParams.get('id')
  const id = validateId(rawId)

  if (resource === 'leads') {
    return handleLeadsCRUD(request, env, adminId, ipHash, id)
  }
  if (resource === 'contacts') {
    return handleContactsCRUD(request, env, adminId, ipHash, id)
  }
  if (resource === 'audit') {
    return handleAuditLog(request, env, adminId)
  }

  return errorResponse('Unknown resource', env, request, 404)
}

async function handleLeadsCRUD(request: Request, env: Env, adminId: number, ipHash: string, id: number | null): Promise<Response> {
  if (request.method === 'GET') {
    const url = new URL(request.url)
    const { page, limit } = validatePagination(url.searchParams.get('page'), url.searchParams.get('limit'))
    const status = url.searchParams.get('status')
    const source = url.searchParams.get('source')
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM leads'
    const conditions: string[] = []
    const binds: (string | number)[] = []

    if (status) { conditions.push('status = ?'); binds.push(status) }
    if (source) { conditions.push('source = ?'); binds.push(source) }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    binds.push(limit, offset)

    const results = await env.DB.prepare(query).bind(...binds).all()
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM leads${conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''}`
    ).bind(...binds.slice(0, -2)).first<{ total: number }>()

    await logAudit(env, adminId, 'view_leads', ipHash)
    return json({ data: results.results, total: countResult?.total ?? 0, page, limit }, env, request)
  }

  if (request.method === 'PUT' && id) {
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as { status?: string; notes?: string }

    const status = body.status ? sanitizeString(body.status, 20) : null
    const notes = body.notes ? sanitizeString(body.notes, 5000) : null

    if (status && !validateLeadStatus(status)) {
      return errorResponse('Invalid status value', env, request, 400)
    }

    const result = await env.DB.prepare(
      'UPDATE leads SET status = ?, notes = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(status, notes, id).run()

    if (!result.success) return errorResponse('Failed to update lead', env, request, 500)
    await logAudit(env, adminId, 'update_lead', ipHash, 'lead', id, JSON.stringify({ status, notes: notes?.substring(0, 100) }))
    return json({ success: true }, env, request)
  }

  if (request.method === 'DELETE' && id) {
    const result = await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run()
    if (!result.success) return errorResponse('Failed to delete lead', env, request, 500)
    await logAudit(env, adminId, 'delete_lead', ipHash, 'lead', id)
    return json({ success: true }, env, request)
  }

  return errorResponse('Method not allowed', env, request, 405)
}

async function handleContactsCRUD(request: Request, env: Env, adminId: number, ipHash: string, id: number | null): Promise<Response> {
  if (request.method === 'GET') {
    const url = new URL(request.url)
    const { page, limit } = validatePagination(url.searchParams.get('page'), url.searchParams.get('limit'))
    const status = url.searchParams.get('status')
    const service = url.searchParams.get('service')
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM contacts'
    const conditions: string[] = []
    const binds: (string | number)[] = []

    if (status) { conditions.push('status = ?'); binds.push(status) }
    if (service) { conditions.push('service = ?'); binds.push(service) }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    binds.push(limit, offset)

    const results = await env.DB.prepare(query).bind(...binds).all()
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM contacts${conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''}`
    ).bind(...binds.slice(0, -2)).first<{ total: number }>()

    await logAudit(env, adminId, 'view_contacts', ipHash)
    return json({ data: results.results, total: countResult?.total ?? 0, page, limit }, env, request)
  }

  if (request.method === 'PUT' && id) {
    const parsed = await safelyParseJSON(request)
    if (!parsed.ok) return errorResponse(parsed.error, env, request, 400)
    const body = parsed.data as { status?: string; notes?: string }

    const status = body.status ? sanitizeString(body.status, 20) : null
    const notes = body.notes ? sanitizeString(body.notes, 5000) : null

    if (status && !validateContactStatus(status)) {
      return errorResponse('Invalid status value', env, request, 400)
    }

    const result = await env.DB.prepare(
      'UPDATE contacts SET status = ?, notes = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(status, notes, id).run()

    if (!result.success) return errorResponse('Failed to update contact', env, request, 500)
    await logAudit(env, adminId, 'update_contact', ipHash, 'contact', id, JSON.stringify({ status, notes: notes?.substring(0, 100) }))
    return json({ success: true }, env, request)
  }

  if (request.method === 'DELETE' && id) {
    const result = await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run()
    if (!result.success) return errorResponse('Failed to delete contact', env, request, 500)
    await logAudit(env, adminId, 'delete_contact', ipHash, 'contact', id)
    return json({ success: true }, env, request)
  }

  return errorResponse('Method not allowed', env, request, 405)
}

async function handleAuditLog(request: Request, env: Env, adminId: number): Promise<Response> {
  if (request.method !== 'GET') return errorResponse('Method not allowed', env, request, 405)

  const url = new URL(request.url)
  const { page, limit } = validatePagination(url.searchParams.get('page'), url.searchParams.get('limit'))
  const offset = (page - 1) * limit

  const results = await env.DB.prepare(
    `SELECT a.*, u.username FROM admin_audit_log a LEFT JOIN admin_users u ON a.admin_id = u.id ORDER BY a.created_at DESC LIMIT ? OFFSET ?`
  ).bind(limit, offset).all()

  return json({ data: results.results, page, limit }, env, request)
}
