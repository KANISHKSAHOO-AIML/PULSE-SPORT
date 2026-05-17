"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LogOut, User, Menu, X, Search, Radio, Trophy, Newspaper, Film, Star } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import SearchOverlay from "@/components/SearchOverlay";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import NotificationCenter from "@/components/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Live", icon: Radio, emoji: "📡", accentColor: "#ef4444" },
  { href: "/ipl", label: "IPL", icon: Trophy, emoji: "🏏", accentColor: "#f59e0b", fire: true },
  { href: "/news", label: "News", icon: Newspaper, emoji: "📰", accentColor: "#3b82f6" },
  { href: "/highlights", label: "Highlights", icon: Film, emoji: "🎬", accentColor: "#8b5cf6" },
  { href: "/players", label: "Players", icon: Star, emoji: "⭐", accentColor: "#06b6d4" },
  { href: "/custom-matches", label: "Custom Matches", icon: Activity, emoji: "⚔️", accentColor: "#10b981" },
];

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [arcOpen, setArcOpen] = useState(false);
  const arcTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll-shrink effect — throttled
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const isScrolled = window.scrollY > 30;
        setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Arc menu hover handlers
  const handleArcEnter = () => {
    if (arcTimeoutRef.current) {
      clearTimeout(arcTimeoutRef.current);
      arcTimeoutRef.current = null;
    }
    setArcOpen(true);
  };

  const handleArcLeave = () => {
    arcTimeoutRef.current = setTimeout(() => {
      setArcOpen(false);
    }, 300);
  };


  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          HEADER BAR — clean, minimal (logo removed from here)
          ═══════════════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 w-full gradient-border-bottom transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0a]/95 backdrop-blur-xl py-0"
            : "bg-dark-card/80 backdrop-blur-md py-0"
        }`}
      >
        <div
          className={`container mx-auto flex items-center justify-between px-4 transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          {/* Logo in header — text only, links home */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span
              className={`font-bold tracking-tight transition-all duration-300 ${
                scrolled ? "text-lg" : "text-xl"
              }`}
            >
              Pulse<span className="text-football">Sports</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Search (press /)"
            >
              <Search className="w-4 h-4" />
            </button>
            {!loading &&
              (user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <NotificationCenter />
                  <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                    <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 hover:border-cyan-500/50 transition-colors">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <span className="hidden lg:inline-block truncate max-w-[120px] text-xs">
                      @{user.user_metadata?.username || user.email?.split("@")[0]}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:block text-xs font-bold text-black hover:opacity-90 transition-all px-5 py-2 rounded-lg"
                  style={{ background: "linear-gradient(135deg, #fff, #e0e0e0)" }}
                >
                  Login
                </Link>
              ))}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          FLOATING LOGO + FULL-HEIGHT ARC MENU
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="fixed left-0 top-0 z-[55] hidden md:flex items-center"
        style={{ height: '100vh', width: arcOpen ? 220 : 60 }}
        onMouseEnter={handleArcEnter}
        onMouseLeave={handleArcLeave}
      >
        {/* Hover trigger zone — always visible, covers left strip */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{ width: arcOpen ? 220 : 60 }}
        />

        {/* The logo hub — vertically centered */}
        <div
          className={`arc-hub ${arcOpen ? 'arc-hub-active' : ''}`}
          style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
        >
          <Activity className="w-6 h-6 text-white" />
        </div>

        {/* Full-height arc panel */}
        <AnimatePresence>
          {arcOpen && (
            <motion.div
              className="arc-full-panel"
              initial={{ clipPath: 'ellipse(0% 0% at 0% 50%)', opacity: 0 }}
              animate={{ clipPath: 'ellipse(120% 52% at 0% 50%)', opacity: 1 }}
              exit={{ clipPath: 'ellipse(0% 0% at 0% 50%)', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 28, mass: 0.8 }}
            >
              {/* Inner gradient overlay */}
              <div className="arc-panel-gradient" />

              {/* Edge glow line */}
              <div className="arc-panel-edge-glow" />

              {/* Nav items — evenly distributed vertically */}
              <div className="arc-panel-items">
                {navLinks.map((link, index) => (
                  <React.Fragment key={link.href}>
                    {/* Add a spacer in the middle so items don't hide behind the logo hub */}
                    {index === 3 && <div style={{ height: '80px', width: '100%' }} aria-hidden="true" />}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 24,
                        delay: 0.1 + index * 0.07,
                      }}
                      style={{ width: '100%' }}
                    >
                      <Link
                        href={link.href}
                        className={`arc-menu-item ${isActive(link.href) ? 'arc-item-active' : ''}`}
                        style={{ '--accent': link.accentColor } as React.CSSProperties}
                        onClick={() => setArcOpen(false)}
                      >
                        <div className="arc-item-icon">
                          <link.icon className="w-4 h-4" />
                        </div>
                        <span className="arc-item-label">{link.label}</span>
                        {link.fire && <span className="arc-item-fire">🔥</span>}
                      </Link>
                    </motion.div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[49] md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="absolute top-0 right-0 w-72 h-full bg-[#111] border-l border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pt-20 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive(link.href)
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{link.emoji}</span>
                    {link.label}
                    {link.fire && <span className="ml-auto text-xs">🔥</span>}
                  </Link>
                ))}

                <div className="h-px bg-zinc-800 my-4" />

                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>

                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-zinc-500">
                      Signed in as{" "}
                      <span className="text-white font-semibold">
                        @{user.user_metadata?.username || user.email?.split("@")[0]}
                      </span>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-bold bg-white text-black text-center hover:bg-zinc-200 transition-colors"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals for Search & Shortcuts */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <KeyboardShortcuts onSearchOpen={() => setSearchOpen(true)} />
    </>
  );
}
