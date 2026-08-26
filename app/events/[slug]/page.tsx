import EventDetailClient from "./event-detail-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://firststep-backend.chrisjaron99.workers.dev"

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/events`, { cache: "no-store" })
    const { data } = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      return data.map((e: { slug: string }) => ({ slug: e.slug }))
    }
  } catch {}
  return [{ slug: "placeholder" }]
}

export default function Page() {
  return <EventDetailClient />
}
