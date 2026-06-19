import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { SipCalculator } from "@/components/sip-calculator"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const metadata: Metadata = {
  title: "SIP Calculator | First Step Consultancy Services",
  description:
    "Plan your investments with our SIP calculator. Calculate potential returns on your monthly mutual fund investments and get a personalized wealth plan.",
}

export default function SipCalculatorPage() {
  return (
    <>
      <Navigation />
      <main className="pt-20">
        <SipCalculator />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
