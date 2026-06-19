import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { PageHero } from "@/components/page-hero"
import { ContactForm } from "@/components/contact-form"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const metadata: Metadata = {
  title: "Contact Us | First Step Consultancy Services",
  description:
    "Schedule a consultation with Francis J., Principal Advisor at First Step Consultancy Services. Get expert investment guidance for Mutual Funds, PMS, AIF, and more.",
}

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main>
        <PageHero
          badge="Get in Touch"
          title="Start Your Investment Journey"
          description="Schedule a no-obligation consultation with our principal advisor. Your first step towards financial freedom begins here."
          image="/images/contact-hero.jpg"
        />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
