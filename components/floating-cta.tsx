"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

const WHATSAPP_NUMBER = "919894163796";
const PHONE_NUMBER = "+91 98941 63796";

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed this session
    const dismissed = sessionStorage.getItem("floatingCtaDismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after 2 second delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("floatingCtaDismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-[#1a2744]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] px-4 py-3">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-[#1a2744]/60" />
              </button>

              {/* WhatsApp Button */}
              <Link
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors shadow-lg"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>

              {/* Main CTA Button */}
              <Link
                href="/contact"
                className="flex-1 flex items-center justify-center gap-2 bg-[#C53030] hover:bg-[#a02828] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-[#C53030]/20"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">Get Free Consultation</span>
              </Link>
            </div>

            {/* Phone number */}
            <a
              href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
              className="block text-center text-xs text-[#1a2744]/60 mt-2 hover:text-[#C53030] transition-colors"
            >
              {PHONE_NUMBER}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
