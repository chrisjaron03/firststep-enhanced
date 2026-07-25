import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'

export async function handleInsights(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', env, request, 405)
  }

  const url = new URL(request.url)
  const range = url.searchParams.get('range') || '7d'
  const startDate = url.searchParams.get('start_date')
  const endDate = url.searchParams.get('end_date')

  let whereSql: string
  let bindParams: string[]

  if (startDate) {
    whereSql = endDate
      ? `created_at >= ? AND created_at <= ?`
      : `created_at >= ?`
    bindParams = endDate ? [startDate, endDate] : [startDate]
  } else {
    const now = new Date()
    let cutoff: Date
    if (range === 'today') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else {
      const days = range === '30d' ? 30 : range === '90d' ? 90 : 7
      cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }
    whereSql = `created_at >= ?`
    bindParams = [cutoff.toISOString()]
  }

  const sessionWhere = whereSql.replace(/created_at/g, 'started_at')

  const [pageviews, clicks, leads, contacts, topPages, topClicks, byCountry, byDevice, leadsBySource, contactsByService] = await Promise.all([
    env.DB.prepare(
      `SELECT COUNT(*) as count FROM analytics_events WHERE type = 'pageview' AND ${whereSql}`
    ).bind(...bindParams).first<{ count: number }>(),

    env.DB.prepare(
      `SELECT COUNT(*) as count FROM analytics_events WHERE type = 'click' AND ${whereSql}`
    ).bind(...bindParams).first<{ count: number }>(),

    env.DB.prepare(
      `SELECT COUNT(*) as count FROM leads WHERE ${whereSql}`
    ).bind(...bindParams).first<{ count: number }>(),

    env.DB.prepare(
      `SELECT COUNT(*) as count FROM contacts WHERE ${whereSql}`
    ).bind(...bindParams).first<{ count: number }>(),

    env.DB.prepare(
      `SELECT page_path, COUNT(*) as views FROM analytics_events WHERE type = 'pageview' AND ${whereSql} GROUP BY page_path ORDER BY views DESC LIMIT 10`
    ).bind(...bindParams).all<{ page_path: string; views: number }>(),

    env.DB.prepare(
      `SELECT element_text, element_id, COUNT(*) as clicks FROM analytics_events WHERE type = 'click' AND ${whereSql} GROUP BY element_text, element_id ORDER BY clicks DESC LIMIT 10`
    ).bind(...bindParams).all<{ element_text: string; element_id: string; clicks: number }>(),

    env.DB.prepare(
      `SELECT country, COUNT(*) as count FROM analytics_events WHERE country IS NOT NULL AND ${whereSql} GROUP BY country ORDER BY count DESC LIMIT 10`
    ).bind(...bindParams).all<{ country: string; count: number }>(),

    env.DB.prepare(
      `SELECT device, COUNT(*) as count FROM analytics_events WHERE ${whereSql} GROUP BY device ORDER BY count DESC`
    ).bind(...bindParams).all<{ device: string; count: number }>(),

    env.DB.prepare(
      `SELECT source, COUNT(*) as count FROM leads WHERE ${whereSql} GROUP BY source ORDER BY count DESC`
    ).bind(...bindParams).all<{ source: string; count: number }>(),

    env.DB.prepare(
      `SELECT service, COUNT(*) as count FROM contacts WHERE ${whereSql} GROUP BY service ORDER BY count DESC`
    ).bind(...bindParams).all<{ service: string; count: number }>(),
  ])

  const sessions = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM analytics_sessions WHERE ${sessionWhere}`
  ).bind(...bindParams).first<{ count: number }>()

  return json({
    range: range !== 'today' ? range : 'today',
    summary: {
      pageviews: pageviews?.count ?? 0,
      clicks: clicks?.count ?? 0,
      sessions: sessions?.count ?? 0,
      leads: leads?.count ?? 0,
      contacts: contacts?.count ?? 0,
    },
    top_pages: topPages.results ?? [],
    top_clicks: topClicks.results ?? [],
    by_country: byCountry.results ?? [],
    by_device: byDevice.results ?? [],
    leads_by_source: leadsBySource.results ?? [],
    contacts_by_service: contactsByService.results ?? [],
  }, env, request)
}
