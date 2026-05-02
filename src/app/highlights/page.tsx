"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { PlayCircle, Eye, Flame, Clapperboard } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSkeleton, VideoCardSkeleton } from "@/components/Skeletons";

const ParallaxSportScene = dynamic(
  () => import("@/components/ParallaxSportScene"),
  { ssr: false }
);

const ReelsView = dynamic(
  () => import("@/components/ReelsView"),
  { ssr: false }
);



// Video card component
function VideoCard({ video, index }: { video: any; index: number }) {
  const accent = video.sport === "cricket" ? "text-cricket" : "text-football";
  const glow = video.sport === "cricket" ? "card-glow-cricket" : "card-glow-football";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/highlights/${video.id}`} className={`group block glass-depth-2 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all ${glow}`}>
        <div className="relative aspect-video overflow-hidden">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <PlayCircle className={`w-9 h-9 ${accent}`} strokeWidth={1.5} />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono font-bold px-2 py-1 rounded backdrop-blur-sm tracking-wider">
            {video.duration}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-bold line-clamp-2 leading-snug mb-2 group-hover:text-white transition-colors">{video.title}</h3>
          <div className="flex items-center text-xs text-zinc-500 gap-2">
            <Eye className="w-3.5 h-3.5" /><span>{video.views} views</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Hero highlight
function HeroHighlight({ video, sport }: { video: any; sport: string }) {
  const accent = sport === "cricket" ? "text-cricket" : "text-football";
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-6">
      <Link href={`/highlights/${video.id}`} className="group block relative rounded-2xl overflow-hidden glass-depth-2 hover:border-zinc-600 transition-all">
        <div className="relative h-[260px] md:h-[360px] overflow-hidden">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-75" />
          <div className="hero-card-overlay absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all">
              <PlayCircle className={`w-12 h-12 ${accent}`} strokeWidth={1.5} />
            </div>
          </div>
          <div className="absolute right-4 bottom-4 px-3 py-1.5 bg-black/80 text-white font-mono text-sm font-bold tracking-widest rounded-md backdrop-blur-md">{video.duration}</div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3 ${
              sport === "cricket" ? "bg-cricket/15 text-cricket border border-cricket/30" : "bg-football/15 text-football border border-football/30"
            }`}>{sport}</span>
            <h2 className="text-xl md:text-3xl font-black text-white leading-tight mb-2 max-w-2xl">{video.title}</h2>
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <Eye className="w-4 h-4" /><span>{video.views} views</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Section for each sport
function SportHighlightSection({ sport, highlights, parallaxSport }: { sport: "cricket" | "football"; highlights: any[]; parallaxSport: "cricket" | "football" }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const h = ref.current.offsetHeight;
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (h + vh)));
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featured = highlights.find((h: any) => h.featured) || highlights[0];
  const rest = highlights.filter((h) => h !== featured);

  const isCricket = sport === "cricket";
  const accentColor = isCricket ? "text-cricket" : "text-football";
  const glowStyle = isCricket
    ? { textShadow: "0 0 30px rgba(0,255,255,0.3)" }
    : { textShadow: "0 0 30px rgba(57,255,20,0.3)" };

  return (
    <section id={`highlights-${sport}`} ref={ref} className="relative min-h-[60vh] overflow-hidden">
      <ParallaxSportScene sport={parallaxSport} scrollProgress={scrollProgress} />
      <div className="relative z-10 py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div className="mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{isCricket ? "🏏" : "⚽"}</span>
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  {isCricket ? "Cricket" : "Football"}{" "}
                  <span className={accentColor} style={glowStyle}>Highlights</span>
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  {isCricket ? "Best sixes, wickets, and unforgettable moments" : "Best goals, saves, and top plays"}
                </p>
              </div>
            </div>
          </motion.div>

          {highlights.length > 0 ? (
            <>
              {featured && <HeroHighlight video={featured} sport={sport} />}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((video, i) => (
                    <VideoCard key={video.id} video={video} index={i} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-zinc-500 text-center py-8 glass-depth-2 rounded-2xl p-6">
              No {sport} highlights right now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"cricket" | "football">("cricket");
  const [reelsOpen, setReelsOpen] = useState(false);

  useEffect(() => {
    const fetchHighlights = async () => {
      // 1. Try YouTube API route first
      try {
        const res = await fetch("/api/highlights");
        if (res.ok) {
          const json = await res.json();
          if (json.highlights && json.highlights.length > 0) {
            setHighlights(json.highlights);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 2. Try Supabase admin-curated highlights
      const { data } = await supabase.from("highlights").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setHighlights(data);
      }
      // No fake data fallback — show empty state instead
      setLoading(false);
    };
    fetchHighlights();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const fb = document.getElementById("highlights-football");
      if (fb) {
        const r = fb.getBoundingClientRect();
        setActiveSection(r.top < window.innerHeight * 0.5 ? "football" : "cricket");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cricketHighlights = highlights.filter((h) => h.sport === "cricket");
  const footballHighlights = highlights.filter((h) => h.sport === "football");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 md:pb-0">
      <Header />

      {/* Quick Nav */}
      <div className="quick-nav">
        <button
          onClick={() => document.getElementById("highlights-cricket")?.scrollIntoView({ behavior: "smooth" })}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === "cricket" ? "bg-cricket/15 text-cricket" : "text-zinc-500 hover:text-white"
          }`}
        >
          🏏 Cricket
        </button>
        <button
          onClick={() => document.getElementById("highlights-football")?.scrollIntoView({ behavior: "smooth" })}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === "football" ? "bg-football/15 text-football" : "text-zinc-500 hover:text-white"
          }`}
        >
          ⚽ Football
        </button>
      </div>

      {/* Page Title */}
      <div className="relative z-10 pt-10 pb-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-football" />
              <span className="text-football text-xs font-bold uppercase tracking-widest">Top Moments</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Video Highlights</h1>
            {/* Reels Mode Toggle */}
            <button
              onClick={() => setReelsOpen(true)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20 hover:bg-purple-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Clapperboard className="w-4 h-4" />
              Reels Mode 🔥
            </button>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className="container mx-auto px-4 max-w-6xl py-10 md:py-16">
          <HeroSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VideoCardSkeleton />
            <VideoCardSkeleton />
            <VideoCardSkeleton />
          </div>
        </div>
      ) : (
        <>
          {/* Cricket Highlights */}
          <SportHighlightSection sport="cricket" highlights={cricketHighlights} parallaxSport="cricket" />

          {/* Divider */}
          <div className="relative z-10 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          {/* Football Highlights */}
          <SportHighlightSection sport="football" highlights={footballHighlights} parallaxSport="football" />
        </>
      )}

      {/* Snackable Reels Overlay */}
      <AnimatePresence>
        {reelsOpen && highlights.length > 0 && (
          <ReelsView
            highlights={highlights.filter(h => h.video_url)}
            onClose={() => setReelsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
