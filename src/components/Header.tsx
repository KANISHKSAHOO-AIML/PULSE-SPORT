"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LogOut, User, Menu, X, Search } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import SearchOverlay from "@/components/SearchOverlay";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import NotificationCenter from "@/components/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Live", icon: "📡", accentColor: "#ef4444" },
  { href: "/ipl", label: "IPL", icon: "🏏", accentColor: "#f59e0b", fire: true },
  { href: "/news", label: "News", icon: "📰", accentColor: "#3b82f6" },
  { href: "/highlights", label: "Highlights", icon: "🎬", accentColor: "#8b5cf6" },
  { href: "/players", label: "Players", icon: "⭐", accentColor: "#06b6d4" },
];

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  // Scroll-shrink effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
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

  return (
    <>
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Activity className="h-5 w-5 text-foreground logo-glow" />
            <span
              className={`font-bold tracking-tight transition-all duration-300 ${
                scrolled ? "text-lg" : "text-xl"
              }`}
            >
              Pulse<span className="text-football">Sports</span>
            </span>
          </Link>

          {/* Desktop Nav — Icon-Enhanced Pill Container */}
          <nav className="hidden md:flex items-center nav-pill-container">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative"
              >
                <motion.div
                  className="relative group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors z-10"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="text-base group-hover:scale-125 transition-transform duration-200">
                    {link.icon}
                  </span>
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      isActive(link.href)
                        ? "text-white"
                        : "text-zinc-400 group-hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                  {"fire" in link && link.fire && (
                    <span className="ipl-fire-icon absolute -top-2 -right-0.5 text-xs pointer-events-none">🔥</span>
                  )}
                </motion.div>

                {/* Animated indicator — slides between active tabs */}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      boxShadow: `0 0 20px ${link.accentColor}15, 0 0 40px ${link.accentColor}08`,
                    }}
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.5,
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

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
                  {/* Notification Center */}
                  <NotificationCenter />
                  {/* Profile Link */}
                  <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                    <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 hover:border-cyan-500/50 transition-colors">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <span className="hidden lg:inline-block truncate max-w-[120px] text-xs">
                      @
                      {user.user_metadata?.username ||
                        user.email?.split("@")[0]}
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
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

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
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                    {"fire" in link && link.fire && <span className="ml-auto text-xs">🔥</span>}
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
                        @
                        {user.user_metadata?.username ||
                          user.email?.split("@")[0]}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
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
