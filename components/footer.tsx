"use client"

import Image from "next/image"
import Link from "next/link"
import { Mail, MapPin } from "lucide-react"

const footerLinks = {
  Products: [
    { label: "Mutual Funds", href: "/products#mutual-funds" },
    { label: "PMS", href: "/products#pms" },
    { label: "AIF", href: "/products#aif" },
    { label: "Unlisted & Pre-IPO", href: "/products#unlisted" },
    { label: "LRS & Global", href: "/products#lrs" },
    { label: "GIFT City Funds", href: "/products#gift-city" },
  ],
  Services: [
    { label: "Retirement Planning", href: "/services#retirement-planning" },
    { label: "Children's Education", href: "/services#children-education" },
    { label: "Legacy Creation", href: "/services#legacy-creation" },
    { label: "Protection Planning", href: "/services#protection-planning" },
    { label: "Wealth Creation", href: "/services#wealth-creation" },
    { label: "NRI Services", href: "/services#nri-services" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Services", href: "/services" },
    { label: "Our Products", href: "/products" },
    { label: "NRI", href: "/nri" },
    { label: "Contact", href: "/contact" },
  ],
}

export function Footer({ onDownloadClick }: { onDownloadClick?: () => void }) {
  return (
    <footer className="bg-gradient-to-b from-primary to-[var(--navy-deep)] text-primary-foreground">
      {/* Lead magnet strip */}
      <div className="border-b border-[var(--gold)]/15 bg-[var(--gold)]/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="font-serif text-lg font-bold text-primary-foreground">
                Get Your Investment Guide
              </p>
              <p className="text-sm text-primary-foreground/60">
                Discover top strategies for 2026 -- curated by our experts.
              </p>
            </div>
            {onDownloadClick ? (
              <button
                onClick={onDownloadClick}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 cursor-pointer"
              >
                Download Now
              </button>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
              >
                Download Now
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/logo.jpg"
                alt="First Step Consultancy Services"
                width={40}
                height={40}
                className="rounded-sm"
              />
              <div>
                <p className="font-serif text-lg font-bold leading-tight text-primary-foreground">
                  First Step
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
                  Consultancy Services
                </p>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              Unlock the full power of investing. Your trusted partner for
              comprehensive wealth management, from mutual funds to alternative
              investments and beyond.
            </p>
            <div className="mt-6 space-y-3">
              <a
                href="mailto:francis@firststepcs.com"
                className="flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                <Mail className="h-4 w-4" />
                francis@firststepcs.com
              </a>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                Coimbatore, Tamil Nadu, India
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/40">
                {title}
              </p>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-[var(--gold)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 sm:flex-row">
          <p className="text-xs text-primary-foreground/50">
            {`© ${new Date().getFullYear()} First Step Consultancy Services. All rights reserved.`}
          </p>
          <p className="text-xs text-primary-foreground/50">
            Francis J., AMFI Registered Mutual Fund Distributor (ARN-335677)
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-lg border border-[var(--gold)]/10 bg-primary-foreground/[0.04] p-4">
          <p className="text-xs leading-relaxed text-primary-foreground/40">
            <strong className="text-primary-foreground/60">Disclaimer:</strong>{" "}
            Mutual Fund investments are subject to market risks. Please read the
            scheme information document carefully before investing. Past performance
            is not indicative of future returns. The information provided here is for
            general purposes only and should not be considered as investment consultation.
            Please consult your financial consultant before making any investment
            decisions.
          </p>
        </div>
      </div>
    </footer>
  )
}
