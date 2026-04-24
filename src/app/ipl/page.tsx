"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Calendar, BarChart3, History, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import IPLLiveCard from "@/components/IPLLiveCard";
import IPLPointsTable from "@/components/IPLPointsTable";
import IPLSeasonCard from "@/components/IPLSeasonCard";
import IPLSchedule from "@/components/IPLSchedule";
import { IPL_SEASONS } from "@/lib/iplSeasons";
import Footer from "@/components/Footer";

export default function IPLPage() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"live" | "schedule" | "table" | "history">("live");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Fetch live IPL matches
  useEffect(() => {
    const fetchIPL = async () => {
      try {
        const res = await fetch("/api/ipl");
        const data = await res.json();
        setLiveMatches(data.matches || []);
      } catch {}
      setLoading(false);
    };
    fetchIPL();
    const interval = setInterval(fetchIPL, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentSeason = IPL_SEASONS.find(s => s.year === 2025);
  const historicalSeasons = [...IPL_SEASONS].reverse();
  const years = historicalSeasons.map(s => s.year);

  const tabs = [
    { id: "live" as const, label: "Today's Match", icon: Zap },
    { id: "schedule" as const, label: "2026 Schedule", icon: Calendar },
    { id: "table" as const, label: "Points Table", icon: BarChart3 },
    { id: "history" as const, label: "All Seasons", icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <Header />

      {/* ═══ IPL HERO ═══ */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16">
        {/* Animated background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-[#6b21a8] ipl-aurora-1" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-15 bg-[#d97706] ipl-aurora-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 bg-[#ec4899] ipl-aurora-3" />
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm">🏏</span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Indian Premier League</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
              <span className="ipl-gradient-text">IPL</span>
              <span className="text-white"> 2026</span>
            </h1>
            <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto">
              Live scores, complete points table & 18 seasons of IPL history — all in one place
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { label: "Seasons", value: "19", icon: "🏆" },
                { label: "Matches", value: "1200+", icon: "🏏" },
                { label: "Teams", value: "10", icon: "⚡" },
                { label: "Since", value: "2008", icon: "📅" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl px-5 py-3 text-center min-w-[100px]">
                  <span className="text-lg">{stat.icon}</span>
                  <p className="text-xl font-black text-white mt-1">{stat.value}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="sticky top-14 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimatePresence mode="wait">
            {/* ──── LIVE TAB ──── */}
            {activeTab === "live" && (
              <motion.div key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                    <Flame className="w-6 h-6 text-orange-500" />
                    Today&apos;s Match
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">SRH vs CSK • April 18, 2026 • 7:30 PM IST</p>
                </div>

                {/* Featured live card */}
                <IPLLiveCard matchData={liveMatches[0]} fallback />

                {/* Other IPL matches */}
                {liveMatches.length > 1 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-zinc-300 mb-4">Other IPL Matches</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {liveMatches.slice(1).map((m: any, i: number) => (
                        <IPLLiveCard key={m.id || i} matchData={m} fallback={false} />
                      ))}
                    </div>
                  </div>
                )}

                {!loading && liveMatches.length === 0 && (
                  <div className="mt-6 text-center text-zinc-500 bg-white/[0.02] rounded-2xl p-8 border border-white/5">
                    <p className="text-lg mb-2">🏏 Match hasn&apos;t started yet</p>
                    <p className="text-sm">The CSK vs SRH live card above will auto-update with scores once the match begins at 7:30 PM IST</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ──── SCHEDULE TAB ──── */}
            {activeTab === "schedule" && (
              <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-black flex justify-center items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-400" />
                    IPL 2026 Schedule
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">Full match fixtures and results for the current season</p>
                </div>
                <IPLSchedule />
              </motion.div>
            )}

            {/* ──── POINTS TABLE TAB ──── */}
            {activeTab === "table" && (
              <motion.div key="table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                    Points Table
                  </h2>

                  {/* Year selector */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {years.map((y) => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          (selectedYear || years[0]) === y
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "text-zinc-500 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-transparent"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const season = IPL_SEASONS.find(s => s.year === (selectedYear || years[0]));
                  return season ? <IPLPointsTable data={season.pointsTable} year={season.year} /> : null;
                })()}
              </motion.div>
            )}

            {/* ──── HISTORY TAB ──── */}
            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    IPL Season Archives
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">18 glorious seasons of the Indian Premier League</p>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {historicalSeasons.map((season) => (
                    <IPLSeasonCard key={season.year} season={season} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
