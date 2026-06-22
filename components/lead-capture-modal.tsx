"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export function LeadCaptureModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    if (hasShown) return

    // Show modal after 12 seconds of browsing
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("fscs-lead-dismissed")
      if (!dismissed) {
        setIsOpen(true)
        setHasShown(true)
      }
    }, 12000)

    // Show modal on scroll intent (50% of page)
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      if (scrollPercent > 50 && !hasShown) {
        const dismissed = sessionStorage.getItem("fscs-lead-dismissed")
        if (!dismissed) {
          setIsOpen(true)
          setHasShown(true)
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [hasShown])

  const handleDismiss = () => {
    setIsOpen(false)
    sessionStorage.setItem("fscs-lead-dismissed", "true")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const name = (formData.get("name") as string) || ""
    const email = (formData.get("email") as string) || ""
    const phone = (formData.get("phone") as string) || ""
    await api.submitLead({ source: "lead_capture_modal", name, email, phone })
    setIsSubmitted(true)
    setTimeout(() => {
      setIsOpen(false)
      sessionStorage.setItem("fscs-lead-dismissed", "true")
    }, 3000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-[60] bg-primary/60 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[50%] z-[70] mx-auto max-w-lg -translate-y-1/2 sm:inset-x-auto"
          >
            <div className="relative overflow-hidden rounded-2xl bg-card shadow-2xl">
              {/* Accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-accent" />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute right-4 top-5 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-8">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-6 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                      <CheckCircle2 className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-foreground">
                      Thank You!
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Check your email for the investment guide. Our consultant will reach out shortly.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1">
                      <Download className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                        Guide
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl text-balance">
                      Get Your 2026 Investment Planning Guide
                    </h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      Discover the top strategies across Mutual Funds, PMS, AIF & more. 
                      Curated by our experts to help you maximize returns in the current market.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <Input
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        required
                        className="h-12 bg-background"
                      />
                      <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        className="h-12 bg-background"
                      />
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="+91 XXXXX XXXXX"
                        required
                        className="h-12 bg-background"
                      />
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base cursor-pointer"
                      >
                        Download Guide
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        No spam. Unsubscribe anytime. Your data is 100% secure.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
