import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { NriContent } from "@/components/nri-content"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const metadata: Metadata = {
  title: "NRI | First Step Consultancy Services",
  description:
    "Specialized wealth management solutions for NRIs including NRI wealth planning, retirement planning, India investment solutions, and cross-border financial planning.",
}

export default function NRIPage() {
  return (
    <>
      <Navigation />
      <main>
        <PageHero
          badge="NRI"
          title="Wealth Management Solutions for NRIs"
          description="Comprehensive cross-border financial planning and India investment solutions tailored for Non-Resident Indians worldwide."
          image="/images/contact-hero.jpg"
        />
        <NriContent />
        <CtaBanner />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
