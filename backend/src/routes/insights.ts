import type { Env } from '../types'
import { json, errorResponse } from '../lib/cors'

export async function handleInsights(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', env, request, 405)
  }

  const url = new URL(request.url)
  const range = url.searchParams.get('range') || '7d'

  const days = range === '30d' ? 30 : range === '90d' ? 90 : 7
  // Bind as a parameter to avoid any string interpolation into SQL
  const daysBinding = `-${days} days`

  const [pageviews, clicks, leads, contacts, topPages, topClicks, byCountry, byDevice, leadsBySource, contactsByService] = await Promise.all([
    env.DB.prepare(
      `SELECT COUNT(*) as count FROM analytics_events WHERE type = 'pageview' AND created_at >= datetime('now', ?)`
    ).bind(daysBinding).first<{ count: number }>(),

    env.DB.prepare(
      `SELECT COUNT(*) as count FROM analytics_events WHERE type = 'click' AND created_at >= datetime('now', ?)`
    ).bind(daysBinding).first<{ count: number }>(),

    env.DB.prepare(
      `SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', ?)`
    ).bind(daysBinding).first<{ count: number }>(),

    env.DB.prepare(
      `SELECT COUNT(*) as count FROM contacts WHERE created_at >= datetime('now', ?)`
    ).bind(daysBinding).first<{ count: number }>(),

    env.DB.prepare(
      `SELECT page_path, COUNT(*) as views FROM analytics_events WHERE type = 'pageview' AND created_at >= datetime('now', ?) GROUP BY page_path ORDER BY views DESC LIMIT 10`
    ).bind(daysBinding).all<{ page_path: string; views: number }>(),

    env.DB.prepare(
      `SELECT element_text, element_id, COUNT(*) as clicks FROM analytics_events WHERE type = 'click' AND created_at >= datetime('now', ?) GROUP BY element_text, element_id ORDER BY clicks DESC LIMIT 10`
    ).bind(daysBinding).all<{ element_text: string; element_id: string; clicks: number }>(),

    env.DB.prepare(
      `SELECT country, COUNT(*) as count FROM analytics_events WHERE country IS NOT NULL AND created_at >= datetime('now', ?) GROUP BY country ORDER BY count DESC LIMIT 10`
    ).bind(daysBinding).all<{ country: string; count: number }>(),

    env.DB.prepare(
      `SELECT device, COUNT(*) as count FROM analytics_events WHERE created_at >= datetime('now', ?) GROUP BY device ORDER BY count DESC`
    ).bind(daysBinding).all<{ device: string; count: number }>(),

    env.DB.prepare(
      `SELECT source, COUNT(*) as count FROM leads WHERE created_at >= datetime('now', ?) GROUP BY source ORDER BY count DESC`
    ).bind(daysBinding).all<{ source: string; count: number }>(),

    env.DB.prepare(
      `SELECT service, COUNT(*) as count FROM contacts WHERE created_at >= datetime('now', ?) GROUP BY service ORDER BY count DESC`
    ).bind(daysBinding).all<{ service: string; count: number }>(),
  ])

  const sessions = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM analytics_sessions WHERE started_at >= datetime('now', ?)`
  ).bind(daysBinding).first<{ count: number }>()

  return json({
    range: `${days}d`,
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
