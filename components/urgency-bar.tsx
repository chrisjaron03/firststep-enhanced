"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Award, Users } from "lucide-react";

interface UrgencyMessage {
  id: number;
  text: string;
  icon: React.ReactNode;
}

const MESSAGES: UrgencyMessage[] = [
  {
    id: 1,
    text: "Limited slots available for consultations this month",
    icon: <Calendar className="w-3.5 h-3.5" />,
  },
  {
    id: 2,
    text: "AMFI Registered Mutual Funds Consultant | 10+ Years of Excellence",
    icon: <Award className="w-3.5 h-3.5" />,
  },
  {
    id: 3,
    text: "100+ Satisfied Clients Across India & Abroad",
    icon: <Users className="w-3.5 h-3.5" />,
  },
];

interface UrgencyBarProps {
  showSolid?: boolean;
}

export function UrgencyBar({ showSolid = false }: UrgencyBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if previously dismissed
    const dismissed = sessionStorage.getItem("urgencyBarDismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Auto-rotate every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("urgencyBarDismissed", "true");
  };

  if (isDismissed) return null;

  const currentMessage = MESSAGES[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-accent/10 via-accent/15 to-[var(--gold)]/10 border-b border-accent/20 overflow-hidden"
        >
          <div className="relative flex items-center justify-center px-4 py-2">
            {/* Pulsing dot */}
            <span className="absolute left-4 lg:left-6 flex h-2 w-2 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>

            {/* Rotating message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-2 text-xs lg:text-sm font-medium pl-4 lg:pl-0 transition-colors duration-300 ${
                  showSolid ? "text-primary/80" : "text-white/95"
                }`}
              >
                <span className="text-accent">{currentMessage.icon}</span>
                <span>{currentMessage.text}</span>
              </motion.div>
            </AnimatePresence>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className={`absolute right-3 p-1 rounded-full transition-colors ${
                showSolid ? "hover:bg-primary/5 text-primary/40 hover:text-primary/70" : "hover:bg-white/10 text-white/70 hover:text-white"
              }`}
              aria-label="Dismiss urgency bar"
            >
              <X className="w-3.5 h-3.5 transition-colors" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
