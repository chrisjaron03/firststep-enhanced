import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { ServicesDetailGrid } from "@/components/services-detail-grid"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { GuideDownloadPopup } from "@/components/guide-download-popup"

export const metadata: Metadata = {
  title: "Our Services | First Step Consultancy Services",
  description:
    "Discover our goal-based financial planning services: Retirement Planning, Children's Education Fund, Legacy Creation, Protection Planning, Wealth Creation, and NRI Services.",
}

export default function ServicesPage() {
  return (
    <>
      <Navigation />
      <main>
        <PageHero
          badge="Our Services"
          title="Financial Planning for Every Life Goal"
          description="From retirement planning to children's education, legacy creation, and NRI wealth management — we provide personalized services to help you achieve every milestone."
          image="/images/services-hero.jpg"
        />
        <ServicesDetailGrid />
        <CtaBanner />
      </main>
      <Footer />
      <WhatsAppButton />
      <GuideDownloadPopup
        pdfPath="/financial-freedom-guide.pdf"
        pdfFileName="7_Steps_to_Financial_Freedom.pdf"
        guideTitle="7 Steps to Financial Freedom"
        guideBenefits={["Investment strategies that work", "Debt management blueprint", "Wealth preservation tips"]}
        source="general-guide"
        storageKey="guide_popup_seen"
      />
    </>
  )
}
