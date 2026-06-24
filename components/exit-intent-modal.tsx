"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, User, Mail, Phone, Gift, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

interface FormData {
  name: string;
  email: string;
  phone: string;
  website: string;
}

export function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    website: "",
  });

  // Detect exit intent: mouse moving toward top of browser
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      // Only trigger if mouse moves to the top of the viewport (above 10px)
      if (e.clientY <= 10 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    },
    [hasShown]
  );

  useEffect(() => {
    // Check if already shown this session
    const shown = sessionStorage.getItem("exitIntentShown");
    if (shown) {
      setHasShown(true);
      return;
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) {
      setIsSubmitted(true);
      setTimeout(() => { setIsVisible(false); }, 3000);
      return;
    }
    const { website, ...leadData } = formData;
    await api.submitLead({ source: "exit_intent_modal", ...leadData });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Gradient accent bar at top */}
            <div className="h-2 bg-gradient-to-r from-[var(--gold)] via-accent to-primary" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/5 transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-primary/50" />
            </button>

            {!isSubmitted ? (
              <div className="p-6 lg:p-8">
                {/* Gift icon */}
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 ring-4 ring-accent/5">
                  <Gift className="w-7 h-7 text-accent" />
                </div>

                {/* Headline */}
                <h2 className="text-xl lg:text-2xl font-bold text-primary mb-2 leading-tight">
                  Wait! Don&apos;t Miss Out on Expert Investment Guidance
                </h2>

                {/* Subheadline */}
                <p className="text-primary/60 mb-6">
                  Get your consultation + 2026 Investment Planning Guide
                </p>

                {/* Benefits */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Mutual Fund Strategies", "PMS Insights", "Tax Planning Tips"].map(
                    (benefit) => (
                      <span
                        key={benefit}
                        className="inline-flex items-center gap-1 text-xs bg-[var(--gold)]/10 text-primary/80 px-2.5 py-1 rounded-full border border-[var(--gold)]/15"
                      >
                        <Download className="w-3 h-3 text-[var(--gold)]" />
                        {benefit}
                      </span>
                    )
                  )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" onChange={handleInputChange} className="absolute left-[-9999px] h-px w-px opacity-0" />
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/35" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm bg-background"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/35" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm bg-background"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/35" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm bg-background"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-[#B91C1C] hover:from-[#B91C1C] hover:to-accent text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-accent/20 mt-4"
                  >
                    <span>Get Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full text-center text-sm text-primary/40 hover:text-primary/70 py-2 transition-colors"
                  >
                    No, I&apos;ll pass
                  </button>
                </form>

                {/* Disclaimer */}
                <p className="text-[10px] text-primary/35 text-center mt-4 leading-relaxed">
                  Mutual Fund investments are subject to market risks. Read all scheme-related
                  documents carefully. Past performance is not indicative of future returns.
                  By submitting, you agree to be contacted by First Step Consultancy Services.
                </p>
              </div>
            ) : (
              /* Success State */
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 ring-4 ring-accent/5"
                >
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Thank You!
                </h3>
                <p className="text-primary/60 text-sm">
                  Your 2026 Investment Planning Guide has been sent to your email.
                  Our team will contact you shortly for your consultation.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
