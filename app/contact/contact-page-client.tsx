"use client"

import { useState, type ReactNode } from "react"
import { GuideDownloadPopup } from "@/components/guide-download-popup"
import { Footer } from "@/components/footer"

export function ContactPageClient({ children }: { children: ReactNode }) {
  const [guideOpen, setGuideOpen] = useState(false)

  const handleDownloadClick = () => {
    setGuideOpen(true)
  }

  return (
    <>
      {children}
      <Footer onDownloadClick={handleDownloadClick} />
      <GuideDownloadPopup
        externalOpen={guideOpen}
        triggerDelay={999999}
        scrollThreshold={999}
        pdfPath="/financial-freedom-guide.pdf"
        pdfFileName="7_Steps_to_Financial_Freedom.pdf"
        guideTitle="7 Steps to Financial Freedom"
        guideBenefits={["Proven wealth-building strategies", "Investment portfolio tips", "Financial independence roadmap"]}
        source="contact-download"
        storageKey="guide_popup_contact"
      />
    </>
  )
}
