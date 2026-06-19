"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";

interface SocialProofMessage {
  id: number;
  name: string;
  location: string;
  action: string;
}

const MESSAGES: SocialProofMessage[] = [
  {
    id: 1,
    name: "Rajesh",
    location: "Chennai",
    action: "just booked an introductory call",
  },
  {
    id: 2,
    name: "Dr. Priya",
    location: "Coimbatore",
    action: "just downloaded the investment guide",
  },
  {
    id: 3,
    name: "Arun",
    location: "Bangalore",
    action: "just enquired about PMS products",
  },
  {
    id: 4,
    name: "Meera",
    location: "Dubai",
    action: "just scheduled a call with Francis J.",
  },
  {
    id: 5,
    name: "V. Srinivasan",
    location: "Madurai",
    action: "just invested in Mutual Funds",
  },
  {
    id: 6,
    name: "Karthik",
    location: "Hyderabad",
    action: "just requested a portfolio review",
  },
];

export function SocialProofPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const showNotification = useCallback(() => {
    // Pick a random message different from current
    setCurrentIndex((prev) => {
      let next = Math.floor(Math.random() * MESSAGES.length);
      if (next === prev) {
        next = (next + 1) % MESSAGES.length;
      }
      return next;
    });
    setIsVisible(true);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    // Initial delay before starting the cycle (8 seconds)
    const initialTimer = setTimeout(() => {
      setHasStarted(true);
      showNotification();
    }, 8000);

    return () => clearTimeout(initialTimer);
  }, [showNotification]);

  useEffect(() => {
    if (!hasStarted) return;

    // Set up recurring notifications every 20-30 seconds
    const scheduleNext = () => {
      const delay = 20000 + Math.random() * 10000; // 20-30 seconds
      return setTimeout(() => {
        showNotification();
      }, delay + 5000); // Add 5s for the display duration
    };

    const timer = scheduleNext();
    return () => clearTimeout(timer);
  }, [hasStarted, isVisible, showNotification]);

  const message = MESSAGES[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -320, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -320, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-28 lg:bottom-6 left-4 z-40 max-w-[300px] lg:max-w-[320px]"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
            {/* Avatar */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#1a2744]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#1a2744]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1a2744] leading-snug">
                <span className="font-semibold">{message.name}</span>{" "}
                <span className="text-[#1a2744]/70">from {message.location}</span>{" "}
                <span className="text-[#1a2744]/80">{message.action}</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-green-600 font-medium">Just now</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
