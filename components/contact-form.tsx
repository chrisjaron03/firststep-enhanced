"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Mail, MapPin, Clock, CheckCircle2, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MagneticButton } from "@/components/magnetic-button"
import { fadeInLeft, fadeInRight } from "@/lib/animations"
import { api } from "@/lib/api"

/* ─── Floating label input wrapper ─── */
function FloatingInput({
  id,
  label,
  type = "text",
  required,
  placeholder,
}: {
  id: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const isFloating = focused || hasValue

  return (
    <div className="relative space-y-0">
      <motion.label
        htmlFor={id}
        animate={{
          y: isFloating ? -24 : 14,
          scale: isFloating ? 0.82 : 1,
          color: focused ? "#DC2626" : "rgba(26, 39, 68, 0.6)",
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-3 z-10 origin-left pointer-events-none text-primary/60 bg-card px-1"
      >
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </motion.label>
      <Input
        id={id}
        type={type}
        required={required}
        placeholder={isFloating ? placeholder : ""}
        className="h-12 bg-background pt-3"
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false)
          setHasValue(e.target.value.length > 0)
        }}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
      />
    </div>
  )
}

/* ─── Floating label select wrapper ─── */
function FloatingSelect({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const isFloating = focused || hasValue

  return (
    <div className="relative space-y-0">
      <motion.label
        htmlFor={id}
        animate={{
          y: isFloating ? -24 : 14,
          scale: isFloating ? 0.82 : 1,
          color: focused ? "#DC2626" : "rgba(26, 39, 68, 0.6)",
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-3 z-10 origin-left pointer-events-none text-primary/60 bg-card px-1"
      >
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </motion.label>
      <select
        id={id}
        required={required}
        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pt-3 text-sm ring-offset-card file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false)
          setHasValue(e.target.value.length > 0)
        }}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
      >
        {children}
      </select>
    </div>
  )
}

/* ─── Floating label textarea wrapper ─── */
function FloatingTextarea({
  id,
  label,
  placeholder,
}: {
  id: string
  label: string
  placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const isFloating = focused || hasValue

  return (
    <div className="relative space-y-0">
      <motion.label
        htmlFor={id}
        animate={{
          y: isFloating ? -24 : 14,
          scale: isFloating ? 0.82 : 1,
          color: focused ? "#DC2626" : "rgba(26, 39, 68, 0.6)",
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-3 z-10 origin-left pointer-events-none text-primary/60 bg-card px-1"
      >
        {label}
      </motion.label>
      <Textarea
        id={id}
        placeholder={isFloating ? placeholder : ""}
        rows={4}
        className="bg-background pt-3 resize-none"
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false)
          setHasValue(e.target.value.length > 0)
        }}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
      />
    </div>
  )
}

/* ─── Animated background pattern ─── */
function AnimatedPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

/* ─── Urgency text with pulsing dot ─── */
function UrgencyText() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/10 px-4 py-3 mb-6">
      <motion.div
        className="relative flex h-2.5 w-2.5 shrink-0"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
      </motion.div>
      <p className="text-sm font-medium text-accent">
        Only 3 consultation slots remaining this week
      </p>
    </div>
  )
}

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    await api.submitContact({
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      investment_range: formData.get("investmentRange") as string,
      service: formData.get("service") as string,
      message: formData.get("message") as string,
    })
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <section id="schedule" className="relative bg-gradient-to-br from-[var(--section-navy-soft)] via-[var(--section-warm)] to-[var(--section-cool)] py-24 lg:py-32 overflow-hidden" ref={ref}>
      <AnimatedPattern />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Info */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:col-span-2"
          >
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
              {"Let's Talk Investments"}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Whether you are starting your investment journey or looking to optimize an existing portfolio,
              our team is here to guide you every step of the way.
            </p>

            <div className="mt-8 space-y-6">
              {/* WhatsApp */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="flex gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-accent-foreground">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">WhatsApp</p>
                  <a
                    href="https://wa.me/919894163796?text=Hi%2C%20I%27m%20interested%20in%20your%20investment%20consultancy."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-muted-foreground transition-colors hover:text-accent"
                  >
                    Chat with us instantly
                  </a>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="flex gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <a
                    href="mailto:francis@firststepcs.com"
                    className="mt-1 text-muted-foreground transition-colors hover:text-accent"
                  >
                    francis@firststepcs.com
                  </a>
                </div>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="flex gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Office</p>
                  <p className="mt-1 text-muted-foreground">Coimbatore, Tamil Nadu, India</p>
                </div>
              </motion.div>

              {/* Hours */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.7 }}
                className="flex gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Business Hours</p>
                  <p className="mt-1 text-muted-foreground">Mon - Sat: 9:00 AM - 6:00 PM</p>
                </div>
              </motion.div>
            </div>

            {/* Consultant Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="mt-10 rounded-xl border border-border bg-card p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">
                AMFI Registered Mutual Fund Distributor (ARN-335677)
              </p>
              <p className="mt-2 font-serif text-xl font-bold text-card-foreground">
                Francis J.
              </p>
              <p className="mt-1 text-sm text-primary/80">
                AMFI Registered Mutual Fund Distributor (ARN-335677)
              </p>
              <div className="mt-4 rounded-lg bg-secondary p-3">
                <p className="text-xs leading-relaxed text-primary/80">
                  With extensive experience in financial markets, Francis J. provides
                  personalized investment strategies across equity, debt, alternatives,
                  and insurance to help clients achieve their financial goals.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border border-border/50 bg-white p-8 shadow-lg shadow-primary/5 lg:p-10 relative overflow-hidden">
              {/* Gold top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--gold)]/60 via-accent to-[var(--gold)]/60" />
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10"
                  >
                    <CheckCircle2 className="h-10 w-10 text-accent" />
                  </motion.div>
                  <h3 className="font-serif text-3xl font-bold text-card-foreground">
                    Thank You!
                  </h3>
                  <p className="mt-3 max-w-sm text-muted-foreground leading-relaxed">
                    Your message has been received successfully. Our consultant Francis J. will
                    get back to you within 24 hours.
                  </p>
                  <a
                    href="https://wa.me/919894163796?text=Hi%2C%20I%20just%20submitted%20a%20form%20on%20your%20website."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-[#20bd5a]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Or chat on WhatsApp now
                  </a>
                </motion.div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="font-serif text-2xl font-bold text-card-foreground">
                      Schedule Your Introductory Call
                    </h3>
                    <p className="mt-2 text-sm text-primary/80">
                      Fill in your details and our consultant will reach out within 24 hours.
                    </p>
                  </div>

                  {/* Urgency text */}
                  <UrgencyText />

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FloatingInput
                        id="firstName"
                        label="First Name"
                        required
                        placeholder="Enter your first name"
                      />
                      <FloatingInput
                        id="lastName"
                        label="Last Name"
                        required
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FloatingInput
                        id="email"
                        label="Email"
                        type="email"
                        required
                        placeholder="your@email.com"
                      />
                      <FloatingInput
                        id="phone"
                        label="Phone"
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <FloatingSelect id="investmentRange" label="Investment Amount (Approx)">
                      <option value="">Select approximate amount</option>
                      <option value="under5">Under 5 Lakhs</option>
                      <option value="5to25">5 - 25 Lakhs</option>
                      <option value="25to50">25 - 50 Lakhs</option>
                      <option value="50to1cr">50 Lakhs - 1 Crore</option>
                      <option value="1to5cr">1 - 5 Crores</option>
                      <option value="above5cr">Above 5 Crores</option>
                    </FloatingSelect>

                    <FloatingSelect id="service" label="Interested In" required>
                      <option value="">Select a product</option>
                      <option value="mf">Mutual Funds</option>
                      <option value="pms">Portfolio Management (PMS)</option>
                      <option value="aif">Alternative Investment Funds</option>
                      <option value="unlisted">Unlisted & Pre-IPO</option>
                      <option value="lrs">LRS & Global Investing</option>
                      <option value="gift">GIFT City Funds</option>
                      <option value="demat">Demat & Trading</option>
                      <option value="fd">Fixed Deposits</option>
                      <option value="bonds">Bonds</option>
                      <option value="insurance">Insurance</option>
                      <option value="nps">National Pension Scheme</option>
                      <option value="comprehensive">Comprehensive Wealth Management</option>
                    </FloatingSelect>

                    <FloatingTextarea
                      id="message"
                      label="Message (Optional)"
                      placeholder="Tell us about your investment goals..."
                    />

                    <MagneticButton strength={0.25} className="w-full">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 cursor-pointer h-12 text-base"
                      >
                        {isSubmitting ? (
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            Sending...
                          </motion.span>
                        ) : (
                          <>
                            Book Introductory Call
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </MagneticButton>

                    <div className="flex items-center justify-center gap-4 pt-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-primary/60">or</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <a
                      href="https://wa.me/919894163796?text=Hi%2C%20I%27m%20interested%20in%20your%20investment%20consultancy."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      <MessageCircle className="h-4 w-4 text-[#25D366]" />
                      Chat on WhatsApp Instead
                    </a>

                    <p className="text-center text-xs text-primary/60">
                      Your information is 100% secure and will never be shared with third parties.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
