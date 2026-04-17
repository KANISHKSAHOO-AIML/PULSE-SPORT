"use client";

import { useState, useEffect, useRef } from "react";
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

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"cricket" | "football">("cricket");
  const [cricketScroll, setCricketScroll] = useState(0);
  const [footballScroll, setFootballScroll] = useState(0);

  const cricketRef = useRef<HTMLDivElement>(null);
  const footballRef = useRef<HTMLDivElement>(null);

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("live", { ascending: false });
      if (error) {
        console.error("Error fetching matches:", error);
      } else {
        setMatches(data || []);
      }
      setLoading(false);
    };
    fetchMatches();

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
        {/* Parallax background scene */}
        <ParallaxSportScene sport="cricket" scrollProgress={cricketScroll} />

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
                    <div className="text-zinc-500 col-span-2 text-center py-8 glass-card rounded-2xl p-6">
                      No cricket matches right now.
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
        {/* Parallax background scene */}
        <ParallaxSportScene sport="football" scrollProgress={footballScroll} />

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
                    <div className="text-zinc-500 col-span-2 text-center py-8 glass-card rounded-2xl p-6">
                      No football matches right now.
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

      {/* Footer spacer */}
      <div className="h-24" />
    </div>
  );
}
