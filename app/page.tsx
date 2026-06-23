import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ProductsPreview } from "@/components/products-preview"
import { ServicesPreview } from "@/components/services-preview"
import { TrustSection } from "@/components/trust-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { LeadCaptureModal } from "@/components/lead-capture-modal"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { FloatingCTA } from "@/components/floating-cta"
import { SocialProofPopup } from "@/components/social-proof-popup"
import { ExitIntentModal } from "@/components/exit-intent-modal"
import { GuideDownloadPopup } from "@/components/guide-download-popup"

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <ProductsPreview />
        <ServicesPreview />
        <TrustSection />
        <TestimonialsSection />
        <CtaBanner />
      </main>
      <Footer />
      <LeadCaptureModal />
      <WhatsAppButton />
      <FloatingCTA />
      <SocialProofPopup />
      <ExitIntentModal />
      <GuideDownloadPopup
        pdfPath="/financial-freedom-guide.pdf"
        pdfFileName="7_Steps_to_Financial_Freedom.pdf"
        guideTitle="7 Steps to Financial Freedom"
        guideBenefits={["Proven wealth-building strategies", "Investment portfolio tips", "Financial independence roadmap"]}
        source="home-page-guide"
        storageKey="home_guide_popup_seen"
      />
    </>
  )
}
