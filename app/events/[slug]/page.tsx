import EventDetailClient from "./event-detail-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://firststep-backend.chrisjaron99.workers.dev"

export async function generateStaticParams() {
  // Always include "placeholder" so the _redirects rewrite target exists.
  // This lets Cloudflare Pages serve /events/placeholder for unknown slugs
  // and for URLs with query parameters (e.g. UTM tracking from social media).
  const params = [{ slug: "placeholder" }]
  try {
    const res = await fetch(`${API_BASE}/api/events`, { cache: "no-store" })
    const { data } = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      for (const e of data as { slug: string }[]) {
        if (e.slug !== "placeholder") params.push({ slug: e.slug })
      }
    }
  } catch {}
  return params
}

export default function Page() {
  return <EventDetailClient />
}
