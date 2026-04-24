"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import SportToggle from "@/components/SportToggle";
import MatchCard from "@/components/MatchCard";
import Loader3D from "@/components/Loader3D";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import TrendingWidget from "@/components/TrendingWidget";
import Leaderboard from "@/components/Leaderboard";
import HeroSection from "@/components/HeroSection";
import SectionDivider from "@/components/SectionDivider";

// Dynamic import — no SSR to prevent hydration mismatch from scroll-dependent styles
const ParallaxSportScene = dynamic(
  () => import("@/components/ParallaxSportScene"),
  { ssr: false }
);

// Zero-friction 3D fallback — renders instantly as CSS shimmer
function Scene3DFallback({ sport }: { sport: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 opacity-20 ${
        sport === 'cricket'
          ? 'bg-gradient-to-br from-cyan-900/30 via-transparent to-cyan-500/10'
          : 'bg-gradient-to-br from-green-900/30 via-transparent to-green-500/10'
      }`}>
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
    </div>
  );
}

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"cricket" | "football">("cricket");
  const [cricketScroll, setCricketScroll] = useState(0);
  const [footballScroll, setFootballScroll] = useState(0);

  const cricketRef = useRef<HTMLDivElement>(null);
  const footballRef = useRef<HTMLDivElement>(null);

  // Fetch matches from unified API (CricAPI + Football-Data.org + Supabase)
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Primary: Use the unified API route that merges real APIs + Supabase
        const res = await fetch("/api/live-matches");
        if (res.ok) {
          const json = await res.json();
          if (json.matches && json.matches.length > 0) {
            // Normalize API matches to match Supabase format for MatchCard
            const normalized = json.matches.map((m: any) => ({
              id: m.id,
              sport: m.sport,
              title: m.title,
              team_a: m.teamA,
              team_b: m.teamB,
              score_a: m.scoreA,
              score_b: m.scoreB,
              status: m.status,
              live: m.live,
              source: m.source,
            }));
            setMatches(normalized);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to Supabase
      }
      
      // Fallback: Direct Supabase query
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("live", { ascending: false });
      if (!error && data) {
        setMatches(data);
      }
      setLoading(false);
    };
    fetchMatches();

    // Poll for live score updates every 60s (Supabase real-time handles instant updates)
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/live-matches");
        if (res.ok) {
          const json = await res.json();
          if (json.matches && json.matches.length > 0) {
            const normalized = json.matches.map((m: any) => ({
              id: m.id,
              sport: m.sport,
              title: m.title,
              team_a: m.teamA,
              team_b: m.teamB,
              score_a: m.scoreA,
              score_b: m.scoreB,
              status: m.status,
              live: m.live,
              source: m.source,
            }));
            setMatches(normalized);
          }
        }
      } catch {}
    }, 60000);

    // Also listen for Supabase real-time updates
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        (payload) => {
          setMatches((curr) =>
            curr.map((m) =>
              m.id === payload.new.id ? { ...m, ...payload.new } : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Track scroll progress for each section
  useEffect(() => {
    const handleScroll = () => {
      // Cricket section scroll progress
      if (cricketRef.current) {
        const rect = cricketRef.current.getBoundingClientRect();
        const sectionHeight = cricketRef.current.offsetHeight;
        const viewH = window.innerHeight;
        const visibleStart = viewH - rect.top;
        const totalTravel = sectionHeight + viewH;
        const progress = Math.max(0, Math.min(1, visibleStart / totalTravel));
        setCricketScroll(progress);
      }

      // Football section scroll progress
      if (footballRef.current) {
        const rect = footballRef.current.getBoundingClientRect();
        const sectionHeight = footballRef.current.offsetHeight;
        const viewH = window.innerHeight;
        const visibleStart = viewH - rect.top;
        const totalTravel = sectionHeight + viewH;
        const progress = Math.max(0, Math.min(1, visibleStart / totalTravel));
        setFootballScroll(progress);
      }

      // Active section for quick nav
      if (footballRef.current) {
        const r = footballRef.current.getBoundingClientRect();
        setActiveSection(r.top < window.innerHeight * 0.5 ? "football" : "cricket");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cricketMatches = matches.filter((m) => m.sport === "cricket");
  const footballMatches = matches.filter((m) => m.sport === "football");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <Header />

      {/* Floating Quick Nav */}
      <SportToggle sport={activeSection} mode="quicknav" />

      {/* ══════════════════════════════════════════════════════════════
          CINEMATIC HERO SECTION
          ══════════════════════════════════════════════════════════════ */}
      <HeroSection />

      {/* ══════════════════════════════════════════════════════════════
          CRICKET SECTION — Animation plays BEHIND the match cards
          ══════════════════════════════════════════════════════════════ */}
      <section
        id="section-cricket"
        ref={cricketRef}
        className="relative min-h-screen overflow-hidden"
      >
        {/* Parallax background scene — lazy loaded with zero-friction fallback */}
        <Suspense fallback={<Scene3DFallback sport="cricket" />}>
          <ParallaxSportScene sport="cricket" scrollProgress={cricketScroll} />
        </Suspense>

        {/* Content layer — on top of the animation */}
        <div className="relative z-10 py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Section Title — Enhanced */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl">🏏</span>
                <div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                    Cricket{" "}
                    <span className="gradient-text-cricket">
                      Live
                    </span>
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base mt-1 font-medium">
                    Scroll through scores — watch the batsman play
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Match Cards */}
            {loading ? (
              <div className="py-10 flex w-full justify-center">
                <Loader3D sport="cricket" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {cricketMatches.length > 0 ? (
                    cricketMatches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.12,
                          ease: "easeOut",
                        }}
                      >
                        <MatchCard
                          sport="cricket"
                          index={index}
                          match={{
                            id: match.id,
                            title: match.title,
                            teamA: match.team_a,
                            teamB: match.team_b,
                            scoreA: match.score_a,
                            scoreB: match.score_b,
                            status: match.status,
                            live: match.live,
                          }}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-zinc-500 col-span-2 text-center py-12 glass-card rounded-2xl p-8">
                      <span className="text-4xl mb-3 block">🏏</span>
                      <p className="text-lg font-bold text-zinc-300 mb-2">No cricket matches right now</p>
                      <p className="text-sm text-zinc-500 mb-4">Check back during match hours or explore highlights</p>
                      <a href="/highlights" className="inline-flex items-center gap-2 text-cricket text-xs font-bold hover:underline">
                        Browse Highlights →
                      </a>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ⚡ Energy Section Divider */}
      <SectionDivider />

      {/* ══════════════════════════════════════════════════════════════
          FOOTBALL SECTION — Animation plays BEHIND the match cards
          ══════════════════════════════════════════════════════════════ */}
      <section
        id="section-football"
        ref={footballRef}
        className="relative min-h-screen overflow-hidden"
      >
        {/* Parallax background scene — lazy loaded with zero-friction fallback */}
        <Suspense fallback={<Scene3DFallback sport="football" />}>
          <ParallaxSportScene sport="football" scrollProgress={footballScroll} />
        </Suspense>

        {/* Content layer */}
        <div className="relative z-10 py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Section Title — Enhanced */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl">⚽</span>
                <div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                    Football{" "}
                    <span className="gradient-text-football">
                      Live
                    </span>
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base mt-1 font-medium">
                    Scroll through scores — watch the striker kick
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Match Cards */}
            {loading ? (
              <div className="py-10 flex w-full justify-center">
                <Loader3D sport="football" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {footballMatches.length > 0 ? (
                    footballMatches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.12,
                          ease: "easeOut",
                        }}
                      >
                        <MatchCard
                          sport="football"
                          index={index}
                          match={{
                            id: match.id,
                            title: match.title,
                            teamA: match.team_a,
                            teamB: match.team_b,
                            scoreA: match.score_a,
                            scoreB: match.score_b,
                            status: match.status,
                            live: match.live,
                          }}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-zinc-500 col-span-2 text-center py-12 glass-card rounded-2xl p-8">
                      <span className="text-4xl mb-3 block">⚽</span>
                      <p className="text-lg font-bold text-zinc-300 mb-2">No football matches right now</p>
                      <p className="text-sm text-zinc-500 mb-4">Check back during match hours or read the latest news</p>
                      <a href="/news" className="inline-flex items-center gap-2 text-football text-xs font-bold hover:underline">
                        Read Sports News →
                      </a>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SIDEBAR WIDGETS — Trending + Leaderboard
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">🔥</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                What&apos;s{" "}
                <span className="text-football" style={{ textShadow: "0 0 30px rgba(57,255,20,0.3)" }}>Hot</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TrendingWidget />
              <Leaderboard />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          COMING SOON — More Sports
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">🚀</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Coming{" "}
                <span className="animated-gradient-text">Soon</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { sport: "Basketball", emoji: "🏀", color: "from-orange-500/10 to-orange-500/5", border: "border-orange-500/15", text: "text-orange-400", desc: "NBA, EuroLeague & more" },
                { sport: "Tennis", emoji: "🎾", color: "from-lime-500/10 to-lime-500/5", border: "border-lime-500/15", text: "text-lime-400", desc: "Grand Slams & ATP/WTA" },
                { sport: "Formula 1", emoji: "🏎️", color: "from-red-500/10 to-red-500/5", border: "border-red-500/15", text: "text-red-400", desc: "Race results & standings" },
              ].map((item, i) => (
                <motion.div
                  key={item.sport}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border ${item.border} bg-gradient-to-br ${item.color} p-6 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform`}
                >
                  <div className="absolute top-2 right-3 text-[9px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-white/5">
                    Coming Soon
                  </div>
                  <span className="text-5xl block mb-3 group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <h3 className={`text-lg font-black ${item.text} mb-1`}>{item.sport}</h3>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-24" />
    </div>
  );
}
