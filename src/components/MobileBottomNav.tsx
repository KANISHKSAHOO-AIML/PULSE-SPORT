"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Radio, Trophy, Newspaper, Star, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Live", icon: Radio, activeColor: "text-red-400", activeBg: "bg-red-500/10" },
  { href: "/ipl", label: "IPL", icon: Trophy, activeColor: "text-amber-400", activeBg: "bg-amber-500/10" },
  { href: "/news", label: "News", icon: Newspaper, activeColor: "text-blue-400", activeBg: "bg-blue-500/10" },
  { href: "/players", label: "Players", icon: Star, activeColor: "text-cyan-400", activeBg: "bg-cyan-500/10" },
  { href: "/profile", label: "Me", icon: User, activeColor: "text-green-400", activeBg: "bg-green-500/10" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-bottom-nav md:hidden" aria-label="Mobile navigation">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-bottom-nav-item ${active ? "active" : ""}`}
          >
            <div className={`mobile-bottom-nav-icon ${active ? item.activeBg : ""}`}>
              <item.icon className={`w-5 h-5 ${active ? item.activeColor : "text-zinc-500"}`} />
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="mobile-bottom-nav-indicator"
                  style={{ background: `currentColor` }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </div>
            <span className={`text-[10px] font-bold ${active ? item.activeColor : "text-zinc-600"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
