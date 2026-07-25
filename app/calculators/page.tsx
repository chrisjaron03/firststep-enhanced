import type { Metadata } from "next"
import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { CalculatorsHub } from "@/components/calculators-hub"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const metadata: Metadata = {
  title: "Financial Calculators | First Step Consultancy Services",
  description:
    "Plan your investments with our free financial calculators. Calculate SIP returns, step-up SIP, lump sum growth, and yearly investment projections.",
}

export default function CalculatorsPage() {
  return (
    <>
      <Navigation />
      <main className="pt-20">
        <Suspense>
          <CalculatorsHub />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
