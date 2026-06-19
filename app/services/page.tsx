import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { ServicesDetailGrid } from "@/components/services-detail-grid"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const metadata: Metadata = {
  title: "Our Products | First Step Consultancy Services",
  description:
    "Explore our comprehensive investment solutions including Mutual Funds, PMS, AIF, Bonds, Insurance, GIFT City Funds, and more.",
}

export default function ServicesPage() {
  return (
    <>
      <Navigation />
      <main>
        <PageHero
          badge="Our Products"
          title="Investment Solutions Tailored to Your Goals"
          description="From wealth creation to wealth protection, we offer a comprehensive suite of 12+ financial products backed by top-tier fund houses and institutions."
          image="/images/services-hero.jpg"
        />
        <ServicesDetailGrid />
        <CtaBanner />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
