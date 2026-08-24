import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { CtaBanner } from "@/components/cta-banner"
import { EventsListClient } from "./events-list-client"

export const metadata: Metadata = {
  title: "Events | First Step Consultancy Services",
  description:
    "Join First Step Consultancy live events, masterclasses and workshops on mutual funds, retirement, wealth creation and NRI investing. Reserve your seat today.",
}

export default function EventsPage() {
  return (
    <>
      <Navigation />
      <main>
        <PageHero
          badge="Live Events & Masterclasses"
          title="Learn. Invest. Grow."
          description="Intimate, high-signal sessions hosted by Francis J. — limited seats, real Q&A, and actionable wealth blueprints you can use immediately."
          image="/images/services-hero.jpg"
        />
        <EventsListClient />
        <CtaBanner />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
