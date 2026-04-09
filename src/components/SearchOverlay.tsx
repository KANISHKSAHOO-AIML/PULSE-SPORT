"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_RESULTS = [
  { id: "mock-news-1", type: "news", sport: "football", title: "Champions League Semi-Final: Real Madrid's Dramatic Comeback" },
  { id: "mock-news-2", type: "news", sport: "cricket", title: "India's Captain Smashes Unbeaten Century" },
  { id: "mock-high-1", type: "highlight", sport: "football", title: "90th Minute Bicycle Kick Goal" },
  { id: "mock-high-2", type: "highlight", sport: "cricket", title: "Fastest T20 Century — 35 Balls" },
  { id: "mock-news-3", type: "news", sport: "football", title: "Premier League Title Race: Arsenal vs Liverpool" },
  { id: "mock-news-4", type: "news", sport: "cricket", title: "T20 Revolution: Rising Star Takes 5 Wickets" },
  { id: "mock-high-3", type: "highlight", sport: "football", title: "Hat-trick Hero: Three Goals in 7 Minutes" },
  { id: "mock-high-6", type: "highlight", sport: "cricket", title: "Last Ball Six to Win the World Cup" },
];

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      const q = query.toLowerCase();

      // Try Supabase first
      const [newsRes, highlightsRes] = await Promise.all([
        supabase.from("news").select("id, title, sport").ilike("title", `%${q}%`).limit(5),
        supabase.from("highlights").select("id, title, sport").ilike("title", `%${q}%`).limit(5),
      ]);

      const dbResults = [
        ...(newsRes.data || []).map((n: any) => ({ ...n, type: "news" })),
        ...(highlightsRes.data || []).map((h: any) => ({ ...h, type: "highlight" })),
      ];

      if (dbResults.length > 0) {
        setResults(dbResults);
      } else {
        // Fallback to mock data search
        setResults(MOCK_RESULTS.filter((r) => r.title.toLowerCase().includes(q)));
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Search Modal */}
          <motion.div
            className="relative z-10 w-full max-w-xl mx-4 glass-card-strong border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ y: -20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -20, scale: 0.95 }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
              <Search className="w-5 h-5 text-zinc-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news, highlights, matches..."
                className="flex-1 bg-transparent outline-none text-white placeholder-zinc-500 text-sm"
              />
              <div className="flex items-center gap-2 shrink-0">
                <kbd className="hidden sm:inline-block text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded font-mono border border-zinc-700">
                  ESC
                </kbd>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[40vh] overflow-y-auto">
              {query.trim() && results.length === 0 && (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  No results for &quot;{query}&quot;
                </div>
              )}

              {results.length > 0 && (
                <div className="py-2">
                  {results.map((r) => {
                    const href = r.type === "news" ? `/news/${r.id}` : `/highlights/${r.id}`;
                    const icon = r.sport === "cricket" ? "🏏" : "⚽";
                    const typeLabel = r.type === "news" ? "NEWS" : "HIGHLIGHT";
                    const typeColor = r.type === "news" ? "text-cricket" : "text-football";
                    return (
                      <Link
                        key={`${r.type}-${r.id}`}
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors group"
                      >
                        <span className="text-lg">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white">
                            {r.title}
                          </p>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                            {typeLabel}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}

              {!query.trim() && (
                <div className="py-6 px-5">
                  <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider mb-3">Quick Links</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "🏏 Cricket News", href: "/news#news-cricket" },
                      { label: "⚽ Football News", href: "/news#news-football" },
                      { label: "🎬 Highlights", href: "/highlights" },
                      { label: "📊 Live Scores", href: "/" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:text-white hover:bg-zinc-700/50 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
