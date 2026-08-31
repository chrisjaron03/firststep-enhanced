"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight, ChevronDown, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UrgencyBar } from "@/components/urgency-bar"
import { fetchEventsForNav, type PublicEvent } from "@/lib/events-api"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Calculators", href: "/calculators" },
  { label: "NRI", href: "/nri" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

const eventsNavBase = { label: "Events", href: "/events" } as const

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isEventsOpen, setIsEventsOpen] = useState(false)
  const [isMobileEventsOpen, setIsMobileEventsOpen] = useState(false)
  const [eventsNav, setEventsNav] = useState<PublicEvent[]>([])
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    let cancelled = false
    fetchEventsForNav().then((list) => {
      if (!cancelled) setEventsNav(list)
    })
    return () => { cancelled = true }
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  const showSolid = isScrolled || !isHome

  /* Backdrop blur intensity increases on scroll */
  const backdropClass = showSolid
    ? isScrolled
      ? "bg-card/[0.97] backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-[var(--gold)]/10"
      : "bg-card/95 backdrop-blur-md shadow-lg border-b border-border"
    : "bg-transparent"

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${backdropClass}`}
    >
      {isHome && <UrgencyBar showSolid={showSolid} />}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Image
            src="/images/logo.jpg"
            alt="First Step Consultancy Services Logo"
            width={38}
            height={38}
            className="rounded-sm transition-transform duration-300 group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <p
              className={`font-serif text-base font-bold leading-tight tracking-tight transition-colors duration-300 ${
                showSolid ? "text-primary" : "text-card"
              }`}
            >
              First Step
            </p>
            <p
              className={`text-[10px] font-medium uppercase tracking-[0.15em] transition-colors duration-300 ${
                showSolid ? "text-muted-foreground" : "text-card/70"
              }`}
            >
              Consultancy Services
            </p>
          </div>
        </Link>

        {/* Desktop Nav - centered */}
        <div className="hidden items-center gap-1 xl:gap-2 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative rounded-md px-3 xl:px-4 py-2 text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  showSolid
                    ? isActive
                      ? "text-accent"
                      : "text-foreground hover:text-accent"
                    : isActive
                      ? "text-card"
                      : "text-card/80 hover:text-card"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
                      boxShadow: "0 0 10px rgba(212,175,55,0.5), 0 0 24px rgba(212,175,55,0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}

          {/* Events with dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsEventsOpen(true)}
            onMouseLeave={() => setIsEventsOpen(false)}
          >
            <Link
              href={eventsNavBase.href}
              className={`relative inline-flex items-center gap-1 rounded-md px-3 xl:px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                pathname.startsWith("/events")
                  ? showSolid ? "text-accent" : "text-card"
                  : showSolid ? "text-foreground hover:text-accent" : "text-card/80 hover:text-card"
              }`}
            >
              {eventsNavBase.label}
              {eventsNav.length > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                  {eventsNav.length}
                </span>
              )}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isEventsOpen ? "rotate-180" : ""} ${eventsNav.length === 0 ? "opacity-40" : ""}`} />
              {pathname.startsWith("/events") && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
                    boxShadow: "0 0 10px rgba(212,175,55,0.5), 0 0 24px rgba(212,175,55,0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>

            <AnimatePresence>
              {isEventsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 top-full z-50 mt-2 w-[360px] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
                >
                  <div className="border-b border-border bg-secondary/40 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" /> Upcoming Events</p>
                  </div>
                  <div className="max-h-[380px] overflow-auto p-2">
                    {eventsNav.length === 0 ? (
                      <div className="px-3 py-8 text-center">
                        <Calendar className="mx-auto h-6 w-6 text-muted-foreground/40" />
                        <p className="mt-2 text-sm font-medium text-foreground">No events yet</p>
                        <p className="text-xs text-muted-foreground">New masterclasses will appear here automatically.</p>
                        <Link href="/events" className="mt-3 inline-flex text-xs font-semibold text-accent underline">View events page</Link>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {eventsNav.map((ev) => (
                          <Link
                            key={ev.slug}
                            href={`/events/${ev.slug}`}
                            className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-secondary transition-colors"
                          >
                            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {ev.cover_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={ev.cover_image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--navy-deep)] to-accent/20">
                                  <Calendar className="h-5 w-5 text-white/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold leading-tight text-foreground">{ev.title}</p>
                              <p className="truncate text-xs text-muted-foreground">{ev.subtitle || (ev.event_date ? new Date(ev.event_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "TBA")} {ev.venue ? `• ${ev.venue}` : ""}</p>
                              <p className="text-xs font-bold text-foreground">₹{ev.price.toLocaleString("en-IN")} {ev.original_price && ev.original_price > ev.price && <span className="font-normal text-muted-foreground line-through ml-1">₹{ev.original_price.toLocaleString("en-IN")}</span>}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border bg-secondary/30 px-3 py-2 flex justify-between">
                    <Link href="/events" className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1">All events <ArrowRight className="h-3 w-3" /></Link>
                    <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground">Get notified</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop CTA - glowing */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/book">
            <Button size="sm" className="btn-glow bg-gradient-to-r from-accent to-[#B91C1C] text-accent-foreground hover:from-[#B91C1C] hover:to-accent gap-1.5 cursor-pointer text-sm px-4">
              Book Consultation
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`rounded-md p-2 lg:hidden transition-colors cursor-pointer ${
            showSolid ? "text-foreground" : "text-card"
          }`}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden"
          >
            <div className="bg-card/98 backdrop-blur-md border-t border-border px-6 py-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`block rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "text-accent bg-accent/5"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Events disclosure */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="mt-1"
              >
                <button
                  onClick={() => setIsMobileEventsOpen((v) => !v)}
                  className={`flex w-full items-center justify-between rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                    pathname.startsWith("/events") ? "text-accent bg-accent/5" : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--gold)]" />
                    Events {eventsNav.length > 0 && <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground">{eventsNav.length}</span>}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileEventsOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isMobileEventsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                        <Link
                          href="/events"
                          className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                        >
                          All Events
                        </Link>
                        {eventsNav.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-muted-foreground">No events yet — check back soon.</p>
                        ) : (
                          eventsNav.map((ev) => (
                            <Link
                              key={ev.slug}
                              href={`/events/${ev.slug}`}
                              className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
                            >
                              <span className="font-medium text-foreground line-clamp-1">{ev.title}</span>
                              <span className="text-xs text-muted-foreground">₹{ev.price.toLocaleString("en-IN")} {ev.original_price && ev.original_price > ev.price ? <span className="line-through">₹{ev.original_price.toLocaleString("en-IN")}</span> : null}</span>
                            </Link>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                <Link href="/book">
                  <Button className="btn-glow bg-gradient-to-r from-accent to-[#B91C1C] text-accent-foreground hover:from-[#B91C1C] hover:to-accent w-full gap-2 cursor-pointer">
                    Book Consultation
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
