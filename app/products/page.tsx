import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { ProductsDetailGrid } from "@/components/products-detail-grid"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { GuideDownloadPopup } from "@/components/guide-download-popup"

export const metadata: Metadata = {
  title: "Our Products | First Step Consultancy Services",
  description:
    "Explore our comprehensive investment products including Mutual Funds, PMS, AIF, Bonds, Insurance, GIFT City Funds, and more.",
}

export default function ProductsPage() {
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
        <ProductsDetailGrid />
        <CtaBanner />
      </main>
      <Footer />
      <WhatsAppButton />
      <GuideDownloadPopup
        pdfPath="/financial-freedom-guide.pdf"
        pdfFileName="7_Steps_to_Financial_Freedom.pdf"
        guideTitle="7 Steps to Financial Freedom"
        guideBenefits={["Smart investment picks", "Tax-saving strategies", "Portfolio diversification"]}
        source="general-guide"
        storageKey="guide_popup_seen"
      />
    </>
  )
}
