import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { ContactForm } from "@/components/contact-form"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { ContactPageClient } from "./contact-page-client"

export const metadata: Metadata = {
  title: "Contact Us | First Step Consultancy Services",
  description:
    "Schedule a consultation with Francis J., AMFI Registered Mutual Fund Distributor at First Step Consultancy Services. Get expert investment guidance for Mutual Funds, PMS, AIF, and more.",
}

export default function ContactPage() {
  return (
    <ContactPageClient>
      <Navigation />
      <main>
        <PageHero
          badge="Get in Touch"
          title="Start Your Investment Journey"
          description="Schedule a no-obligation consultation with our consultant. Your first step towards wealth creation begins here."
          image="/images/contact-hero.jpg"
        />
        <ContactForm />
      </main>
      <WhatsAppButton />
    </ContactPageClient>
  )
}
