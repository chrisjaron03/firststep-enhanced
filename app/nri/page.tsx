import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { NriContent } from "@/components/nri-content"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const metadata: Metadata = {
  title: "NRI Wealth Management | First Step Consultancy Services",
  description:
    "Specialized NRI wealth management: India investment solutions, retirement planning, cross-border tax planning, and global Tamil wealth planning for NRIs worldwide.",
}

export default function NRIPage() {
  return (
    <>
      <Navigation />
      <main>
        <PageHero
          badge="NRI Wealth Management"
          title="Invest in India. Grow Globally."
          description="End-to-end cross-border financial planning for NRIs — from India investment accounts to retirement, repatriation, and generational wealth transfer."
          image="/images/contact-hero.jpg"
        />
        <NriContent />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
