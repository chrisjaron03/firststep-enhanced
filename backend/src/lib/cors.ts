import type { Env } from '../types'
import { securityHeaders } from './security'

export function corsHeaders(env: Env, request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || ''
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s: string) => s.trim())
  const allowedOrigin = allowed.includes(origin) ? origin : ''

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Id',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    ...securityHeaders(),
  }

  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin
    headers['Access-Control-Allow-Credentials'] = 'true'
  }

  return headers
}

export function json(data: unknown, env: Env, request: Request, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env, request),
      ...extraHeaders,
    },
  })
}

export function errorResponse(message: string, env: Env, request: Request, status = 400): Response {
  return json({ error: message }, env, request, status)
}

export async function handleOptions(env: Env, request: Request): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(env, request),
  })
}
