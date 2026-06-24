import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { AboutContent } from "@/components/about-content"
import { ProcessTimeline } from "@/components/process-timeline"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { GuideDownloadPopup } from "@/components/guide-download-popup"

export const metadata: Metadata = {
  title: "About Us | First Step Consultancy Services",
  description:
    "Learn about First Step Consultancy Services, led by Francis J., AMFI Registered Mutual Fund Distributor with 10+ years of wealth management excellence.",
}

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main>
        <PageHero
          badge="About Us"
          title="Your Trusted Partner in Wealth Creation"
          description="Led by Francis J., we bring institutional-grade consultancy to individual clients with a comprehensive suite of 12+ investment products."
          image="/images/francis-j.jpeg"
        />
        <AboutContent />
        <ProcessTimeline />
        <TestimonialsSection />
        <CtaBanner />
      </main>
      <Footer />
      <WhatsAppButton />
      <GuideDownloadPopup
        pdfPath="/financial-freedom-guide.pdf"
        pdfFileName="7_Steps_to_Financial_Freedom.pdf"
        guideTitle="7 Steps to Financial Freedom"
        guideBenefits={["Proven wealth-building framework", "Financial independence roadmap", "Expert-backed strategies"]}
        source="general-guide"
        storageKey="guide_popup_seen"
      />
    </>
  )
}
