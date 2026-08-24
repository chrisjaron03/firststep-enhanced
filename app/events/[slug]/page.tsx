import EventDetailClient from "./event-detail-client"

// Cloudflare Pages static export requires generateStaticParams for dynamic routes.
// We pre-render a placeholder; at runtime Cloudflare Pages serves it for any /events/*
// via public/_redirects, and the client component reads the real slug from window.location.
export async function generateStaticParams() {
  return [{ slug: "placeholder" }]
}

export default function Page() {
  return <EventDetailClient />
}
