"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, Clock, Users } from "lucide-react";

interface TrustBadge {
  id: number;
  label: string;
  icon: React.ReactNode;
}

const BADGES: TrustBadge[] = [
  {
    id: 1,
    label: "SEBI Compliant",
    icon: <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5" />,
  },
  {
    id: 2,
    label: "AMFI Registered",
    icon: <BadgeCheck className="w-4 h-4 lg:w-5 lg:h-5" />,
  },
  {
    id: 3,
    label: "10+ Years",
    icon: <Clock className="w-4 h-4 lg:w-5 lg:h-5" />,
  },
  {
    id: 4,
    label: "500+ Clients",
    icon: <Users className="w-4 h-4 lg:w-5 lg:h-5" />,
  },
];

interface TrustBadgesProps {
  variant?: "light" | "dark";
  className?: string;
}

export function TrustBadges({ variant = "light", className = "" }: TrustBadgesProps) {
  const isLight = variant === "light";

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 lg:gap-4 ${className}`}>
      {BADGES.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className={`inline-flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium border transition-all hover:shadow-md ${
            isLight
              ? "bg-white/80 border-[#1a2744]/10 text-[#1a2744]/80 hover:border-[#D4AF37]/50 hover:shadow-[#D4AF37]/10"
              : "bg-[#1a2744]/50 border-white/10 text-white/80 hover:border-[#D4AF37]/50 hover:shadow-[#D4AF37]/10"
          }`}
        >
          <span className={isLight ? "text-[#C53030]" : "text-[#D4AF37]"}>
            {badge.icon}
          </span>
          <span>{badge.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
