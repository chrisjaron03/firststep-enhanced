import type { Env } from './types'
import { corsHeaders, json, errorResponse, handleOptions } from './lib/cors'
import { handleLeads } from './routes/leads'
import { handleContacts } from './routes/contacts'
import { handleAnalytics } from './routes/analytics'
import { handleInsights } from './routes/insights'
import { handleAdminAuth } from './routes/admin-auth'
import { handleAdminData } from './routes/admin-data'
import { handleBooking } from './routes/bookings'
import { handleAdminBooking } from './routes/admin-bookings'
import { handleCalendar } from './routes/calendar'
import { handleAdminAvailability } from './routes/admin-availability'
import { handleEvents } from './routes/events'
import { handleAdminEvents } from './routes/admin-events'
import { securityHeaders } from './lib/security'
import { authenticateRequest } from './lib/auth'

const MIN_JWT_SECRET_LENGTH = 32

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Guard: ensure JWT_SECRET is configured and strong enough
    if (!env.JWT_SECRET || env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(env, request) },
      })
    }

    if (request.method === 'OPTIONS') {
      return handleOptions(env, request)
    }

    const url = new URL(request.url)
    const path = url.pathname

    // Block path traversal attempts
    if (path.includes('..') || path.includes('//') || path.includes('\\')) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(env, request) },
      })
    }

    // Validate Origin for all API requests (CSRF protection).
    // For state-changing requests (POST/PUT/DELETE/PATCH) the Origin header
    // MUST be present AND allowlisted. GET requests are allowed without an
    // Origin header (browsers don't send Origin on same-origin GETs).
    const origin = request.headers.get('Origin')
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)

    if (isMutation) {
      if (!origin || !allowed.includes(origin)) {
        return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...securityHeaders() },
        })
      }
    } else if (origin && !allowed.includes(origin)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...securityHeaders() },
      })
    }

    try {
      if (path === '/' || path === '/health') {
        return json({ status: 'ok', service: 'firststep-backend' }, env, request)
      }

      // Public API routes
      if (path === '/api/leads') {
        return await handleLeads(request, env)
      }

      if (path === '/api/contacts') {
        return await handleContacts(request, env)
      }

      if (path === '/api/analytics') {
        return await handleAnalytics(request, env)
      }

      // Public booking routes
      if (path === '/api/bookings' || path === '/api/bookings/slots') {
        return await handleBooking(request, env)
      }

      if (path === '/api/availability/public') {
        return await handleAdminAvailability(request, env)
      }

      // Admin auth routes
      if (path === '/api/admin/login') {
        return await handleAdminAuth(request, env, 'login')
      }

      if (path === '/api/admin/logout') {
        return await handleAdminAuth(request, env, 'logout')
      }

      if (path === '/api/admin/verify') {
        return await handleAdminAuth(request, env, 'verify')
      }

      // Admin protected data routes
      if (path === '/api/admin/leads') {
        return await handleAdminData(request, env, 'leads')
      }

      if (path === '/api/admin/contacts') {
        return await handleAdminData(request, env, 'contacts')
      }

      if (path === '/api/admin/audit') {
        return await handleAdminData(request, env, 'audit')
      }

      // Admin booking routes
      if (path === '/api/admin/bookings') {
        return await handleAdminBooking(request, env)
      }

      // Admin availability routes
      if (path === '/api/admin/availability' || path === '/api/admin/blocked-dates') {
        return await handleAdminAvailability(request, env)
      }

      // Calendar OAuth routes
      if (path === '/api/admin/calendar/auth' || path === '/api/admin/calendar/callback') {
        return await handleCalendar(request, env)
      }

      // Public events — list, detail, register
      if (path === '/api/events' || path.startsWith('/api/events/')) {
        return await handleEvents(request, env)
      }

      // Admin events CRUD
      if (path === '/api/admin/events') {
        return await handleAdminEvents(request, env)
      }

      // Insights — admin-only (business analytics must not be public)
      if (path === '/api/insights') {
        const auth = await authenticateRequest(request, env)
        if ('error' in auth) {
          return errorResponse(auth.error, env, request, auth.status)
        }
        return await handleInsights(request, env)
      }

      return errorResponse('Not found', env, request, 404)
    } catch (err) {
      // Never leak internal error details — log a sanitized message only
      console.error('Unhandled error:', err instanceof Error ? err.message : 'unknown error')
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(env, request) },
      })
    }
  },
} satisfies ExportedHandler<Env>
