"use client";

import Link from "next/link";
import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-dark-border bg-[#0a0a0a]">
      {/* Gradient top border */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #00FFFF, #39FF14, transparent)",
        }}
      />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6 text-foreground logo-glow" />
              <span className="text-xl font-bold tracking-tight">
                Pulse<span className="text-football">Sports</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Your ultimate real-time platform for Cricket and Football. Live
              scores, breaking news, highlights, and fan debates — all in one
              place.
            </p>
            <p className="text-zinc-600 text-xs mt-4 font-medium">
              Made with 🏏 and ⚽ for sports fans everywhere
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Live Scores" },
                { href: "/news", label: "Sports News" },
                { href: "/highlights", label: "Highlights" },
                { href: "/players", label: "Player Stats" },
                { href: "/profile", label: "My Profile" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-500 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">
              Sports
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-cricket text-sm font-medium">🏏 Cricket</span>
              </li>
              <li>
                <span className="text-football text-sm font-medium">⚽ Football</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} PulseSports. Built for the fans.
          </p>
          <div className="flex items-center gap-4 text-zinc-600 text-xs">
            <span>Powered by Next.js</span>
            <span>•</span>
            <span>Real-time via Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
