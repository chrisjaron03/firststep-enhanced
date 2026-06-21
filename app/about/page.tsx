import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { AboutContent } from "@/components/about-content"
import { ProcessTimeline } from "@/components/process-timeline"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const metadata: Metadata = {
  title: "About Us | First Step Consultancy Services",
  description:
    "Learn about First Step Consultancy Services, led by Francis J., AMFI Registered Mutual Funds Consultant with 10+ years of wealth management excellence.",
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
    </>
  )
}
