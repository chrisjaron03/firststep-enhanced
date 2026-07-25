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
  { id: 1, name: "Rajesh", location: "Chennai", action: "just booked an introductory call" },
  { id: 2, name: "Dr. Priya", location: "Coimbatore", action: "just downloaded the investment guide" },
  { id: 3, name: "Arun", location: "Bangalore", action: "just enquired about PMS products" },
  { id: 4, name: "Meera", location: "Dubai", action: "just scheduled a call with Francis J." },
  { id: 5, name: "V. Srinivasan", location: "Madurai", action: "just invested in Mutual Funds" },
  { id: 6, name: "Karthik", location: "Hyderabad", action: "just requested a portfolio review" },
  { id: 7, name: "Lakshmi Narayanan", location: "Mumbai", action: "just downloaded the tax planning guide" },
  { id: 8, name: "Ananya Sharma", location: "Pune", action: "just booked a financial consultation" },
  { id: 9, name: "Suresh Babu", location: "Singapore", action: "just enquired about NRI investment options" },
  { id: 10, name: "Deepa Menon", location: "Kochi", action: "just subscribed to the wealth newsletter" },
  { id: 11, name: "Mohammed Irfan", location: "Abu Dhabi", action: "just requested a portfolio review" },
  { id: 12, name: "Kavitha Raman", location: "Mysore", action: "just downloaded the retirement planning guide" },
  { id: 13, name: "Prakash Jha", location: "Delhi", action: "just enquired about PMS strategies" },
  { id: 14, name: "Nisha Agarwal", location: "Kolkata", action: "just booked a call with the advisory team" },
  { id: 15, name: "Ravi Shankar", location: "Vizag", action: "just started a SIP in Equity Funds" },
  { id: 16, name: "Shruthi Nair", location: "Thiruvananthapuram", action: "just downloaded the NRI wealth guide" },
  { id: 17, name: "Sanjay Patil", location: "Nagpur", action: "just invested in a PMS strategy" },
  { id: 18, name: "Fatima Begum", location: "Hyderabad", action: "just scheduled a review with Francis J." },
  { id: 19, name: "Ganesh Iyer", location: "Coimbatore", action: "just downloaded the insurance planning guide" },
  { id: 20, name: "Divya Kapoor", location: "Chandigarh", action: "just enquired about AIF opportunities" },
  { id: 21, name: "Venkata Reddy", location: "Bangalore", action: "just requested a tax-saving consultation" },
  { id: 22, name: "Aarti Singh", location: "Jaipur", action: "just downloaded the investment guide" },
  { id: 23, name: "Kumaravel", location: "Madurai", action: "just booked a retirement planning session" },
  { id: 24, name: "Pooja Deshmukh", location: "Aurangabad", action: "just started a SIP via LRS" },
  { id: 25, name: "Balaji Krishnamurthy", location: "Chennai", action: "just enquired about GIFT City investments" },
  { id: 26, name: "Zara Ahmed", location: "Sharjah", action: "just downloaded the wealth management guide" },
  { id: 27, name: "Raghavendra Rao", location: "Mangalore", action: "just invested in Hybrid Mutual Funds" },
  { id: 28, name: "Swathi Gupta", location: "Lucknow", action: "just scheduled a call with Francis J." },
  { id: 29, name: "Dinesh Nambiar", location: "Dubai", action: "just enquired about portfolio rebalancing" },
  { id: 30, name: "Revathi Subramanian", location: "Trichy", action: "just downloaded the child education planning guide" },
  { id: 31, name: "Amit Bose", location: "Kolkata", action: "just requested a financial health check" },
  { id: 32, name: "Nandini Shetty", location: "Bangalore", action: "just booked a wealth advisory session" },
  { id: 33, name: "Arjun Mehta", location: "Mumbai", action: "just invested in Debt Mutual Funds" },
  { id: 34, name: "Lavanya Prasad", location: "Mysore", action: "just downloaded the estate planning guide" },
  { id: 35, name: "Ibrahim Khan", location: "Riyadh", action: "just enquired about NRI tax benefits" },
  { id: 36, name: "Manju Sundaram", location: "Trichy", action: "just started a SIP for his daughter's education" },
  { id: 37, name: "Tanya Fernandez", location: "Goa", action: "just booked a portfolio review call" },
  { id: 38, name: "Nitin Verma", location: "Indore", action: "just downloaded the PMS comparison guide" },
  { id: 39, name: "Sita Lakshmi", location: "Vellore", action: "just invested in Balanced Advantage Funds" },
  { id: 40, name: "Faisal Mohammed", location: "Doha", action: "just requested a wealth transfer consultation" },
  { id: 41, name: "Bharathi Rajan", location: "Pondicherry", action: "just downloaded the gold investment guide" },
  { id: 42, name: "Rohit Malhotra", location: "Delhi", action: "just enquired about AIF strategies" },
  { id: 43, name: "Geeta Devi", location: "Patna", action: "just scheduled a call with the advisory team" },
  { id: 44, name: "Ashwin Krishnan", location: "Chennai", action: "just invested in ELSS Funds for tax saving" },
  { id: 45, name: "Pavitra Bhat", location: "Manipal", action: "just downloaded the fixed income guide" },
  { id: 46, name: "Rajiv Menon", location: "Kochi", action: "just requested a holistic financial plan" },
  { id: 47, name: "Anjali Kulkarni", location: "Pune", action: "just booked an NRI investment consultation" },
  { id: 48, name: "Yusuf Ali", location: "Kuwait City", action: "just downloaded the LRS investment guide" },
  { id: 49, name: "Padmavathi Raman", location: "Salem", action: "just started a SIP in Index Funds" },
  { id: 50, name: "Vikram Choudhary", location: "Ahmedabad", action: "just enquired about health insurance planning" },
];

const TIME_LABELS = ["Just now", "1 min ago", "2 min ago", "3 min ago", "5 min ago"];

function getRandomTime(): string {
  return TIME_LABELS[Math.floor(Math.random() * TIME_LABELS.length)];
}

function getRandomMessage(prevIndex: number): number {
  let next = Math.floor(Math.random() * MESSAGES.length);
  if (next === prevIndex) {
    next = (next + 1) % MESSAGES.length;
  }
  return next;
}

export function SocialProofPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLabel, setTimeLabel] = useState("Just now");
  const [hasStarted, setHasStarted] = useState(false);

  const showNotification = useCallback(() => {
    setCurrentIndex((prev) => getRandomMessage(prev));
    setTimeLabel(getRandomTime());
    setIsVisible(true);

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
          <div className="bg-white rounded-xl shadow-2xl shadow-primary/10 border border-border/60 p-4 flex items-start gap-3">
            {/* Avatar */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--gold)]/12 flex items-center justify-center border border-[var(--gold)]/20">
              <User className="w-5 h-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary leading-snug">
                <span className="font-semibold">{message.name}</span>{" "}
                <span className="text-primary/60">from {message.location}</span>{" "}
                <span className="text-primary/70">{message.action}</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
                </span>
                <span className="text-xs text-[#22C55E] font-medium">{timeLabel}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
