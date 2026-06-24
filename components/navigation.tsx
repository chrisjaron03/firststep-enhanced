"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UrgencyBar } from "@/components/urgency-bar"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "NRI", href: "/nri" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

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
        </div>

        {/* Desktop CTA - compact */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/contact#schedule">
            <Button size="sm" className="bg-gradient-to-r from-accent to-[#B91C1C] text-accent-foreground hover:from-[#B91C1C] hover:to-accent gap-1.5 cursor-pointer text-sm px-4 shadow-md shadow-accent/20">
              Introductory Call
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
              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                <Link href="/contact#schedule">
                  <Button className="bg-gradient-to-r from-accent to-[#B91C1C] text-accent-foreground hover:from-[#B91C1C] hover:to-accent w-full gap-2 cursor-pointer shadow-md shadow-accent/20">
                    Introductory Call
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
