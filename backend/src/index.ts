import type { Env } from './types'
import { corsHeaders, json, errorResponse, handleOptions } from './lib/cors'
import { handleLeads } from './routes/leads'
import { handleContacts } from './routes/contacts'
import { handleAnalytics } from './routes/analytics'
import { handleInsights } from './routes/insights'
import { handleAdminAuth } from './routes/admin-auth'
import { handleAdminData } from './routes/admin-data'
import { securityHeaders } from './lib/security'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleOptions(env, request)
    }

    const url = new URL(request.url)
    const path = url.pathname

    // Block path traversal attempts
    if (path.includes('..') || path.includes('//') || path.includes('\\')) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...securityHeaders() },
      })
    }

    // Validate Origin for all API requests (CSRF protection)
    const origin = request.headers.get('Origin')
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    if (origin && !allowed.includes(origin)) {
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

      if (path === '/api/insights') {
        return await handleInsights(request, env)
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

      return errorResponse('Not found', env, request, 404)
    } catch (err) {
      // Never leak internal error details
      console.error('Unhandled error:', err)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...securityHeaders() },
      })
    }
  },
} satisfies ExportedHandler<Env>
