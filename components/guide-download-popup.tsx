"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, BookOpen, CheckCircle2 } from "lucide-react"

interface GuideDownloadPopupProps {
  triggerDelay?: number
  scrollThreshold?: number
  pdfPath: string
  pdfFileName: string
  guideTitle: string
  guideBenefits: string[]
  source: string
  storageKey: string
  externalOpen?: boolean
}

function triggerDownload(pdfPath: string, pdfFileName: string) {
  const link = document.createElement("a")
  link.href = pdfPath
  link.download = pdfFileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function GuideDownloadPopup({
  triggerDelay = 15000,
  scrollThreshold = 0.6,
  pdfPath,
  pdfFileName,
  guideTitle,
  guideBenefits,
  source,
  storageKey,
  externalOpen,
}: GuideDownloadPopupProps) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (externalOpen) {
      setOpen(true)
    }
  }, [externalOpen])

  useEffect(() => {
    if (typeof window === "undefined" || externalOpen) return
    if (sessionStorage.getItem(storageKey)) return

    let shown = false
    const show = () => {
      if (shown) return
      shown = true
      sessionStorage.setItem(storageKey, "1")
      setOpen(true)
    }

    const timer = setTimeout(show, triggerDelay)

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (scrolled / total > scrollThreshold) {
        show()
        clearTimeout(timer)
        window.removeEventListener("scroll", onScroll)
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [triggerDelay, scrollThreshold, storageKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch("https://backend-3-wydm.onrender.com/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, source }),
      })
    } catch {
      // silently fail
    }

    setLoading(false)
    setSubmitted(true)
    triggerDownload(pdfPath, pdfFileName)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="h-2 bg-gradient-to-r from-[var(--gold)] via-accent to-primary" />

            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-full p-2 transition-colors hover:bg-primary/5"
            >
              <X className="h-5 w-5 text-primary/50" />
            </button>

            <div className="relative bg-gradient-to-br from-[var(--navy-deep)] to-primary p-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/20">
                <BookOpen className="h-7 w-7 text-[var(--gold)]" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary-foreground">
                Free Guide
              </h2>
              <p className="mt-1 text-sm text-primary-foreground/70">
                {guideTitle}
              </p>
              <ul className="mt-4 space-y-2">
                {guideBenefits.map((item) => (
                  <li key={item} className="flex items-center justify-center gap-2 text-xs text-primary-foreground/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--gold)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8">
              {submitted ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-card-foreground">
                    Thank You!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your guide is downloading now.
                  </p>
                  <button
                    onClick={() => triggerDownload(pdfPath, pdfFileName)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3 font-bold text-[var(--navy-deep)] shadow-lg shadow-[var(--gold)]/25 transition-all hover:bg-[var(--gold)]/90"
                  >
                    <Download className="h-5 w-5" />
                    Download Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3 font-bold text-[var(--navy-deep)] shadow-lg shadow-[var(--gold)]/25 transition-all hover:bg-[var(--gold)]/90 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Get Free Guide"}
                    {!loading && <Download className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full py-2 text-center text-sm text-primary/40 transition-colors hover:text-primary/70"
                  >
                    No thanks
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground">
                    No spam. We respect your privacy.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
