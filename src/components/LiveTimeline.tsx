"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Target, AlertTriangle, Trophy, Clock, ChevronDown } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface TimelineEvent {
  id: string;
  time: string;        // "14.3" for cricket (over.ball), "45'" for football
  type: "wicket" | "boundary" | "six" | "goal" | "card" | "save" | "milestone" | "dot" | "run" | "normal";
  title: string;
  description: string;
  emoji: string;
  impact: "high" | "medium" | "low";
}

interface LiveTimelineProps {
  matchId: string;
  sport: "cricket" | "football";
  teamA: string;
  teamB: string;
  isLive: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   EVENT STYLING
   ═══════════════════════════════════════════════════════════════ */
const EVENT_STYLES: Record<string, { bg: string; border: string; icon: string; glow?: string }> = {
  wicket:    { bg: "bg-red-500/10", border: "border-red-500/30", icon: "🔴", glow: "shadow-red-500/20" },
  boundary:  { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "4️⃣" },
  six:       { bg: "bg-purple-500/10", border: "border-purple-500/30", icon: "6️⃣", glow: "shadow-purple-500/20" },
  goal:      { bg: "bg-green-500/10", border: "border-green-500/30", icon: "⚽", glow: "shadow-green-500/20" },
  card:      { bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "🟨" },
  save:      { bg: "bg-cyan-500/10", border: "border-cyan-500/30", icon: "🧤" },
  milestone: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "🏆", glow: "shadow-yellow-500/20" },
  dot:       { bg: "bg-zinc-800/50", border: "border-zinc-700/30", icon: "⚫" },
  run:       { bg: "bg-zinc-800/50", border: "border-zinc-700/30", icon: "🏃" },
  normal:    { bg: "bg-zinc-800/50", border: "border-zinc-700/30", icon: "📌" },
};



/* ═══════════════════════════════════════════════════════════════
   FAN EMOTION BAR
   ═══════════════════════════════════════════════════════════════ */
function FanEmotionMeter({ events, teamA, teamB }: { events: TimelineEvent[]; teamA: string; teamB: string }) {
  // Calculate "excitement level" based on recent events
  const recentHigh = events.slice(0, 5).filter(e => e.impact === "high").length;
  const excitement = Math.min(100, 30 + recentHigh * 20);
  
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
      <span className="text-lg">{excitement > 70 ? "🔥" : excitement > 40 ? "⚡" : "😌"}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Fan Excitement</span>
          <span className="text-[10px] text-white font-bold">{excitement}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: excitement > 70
                ? "linear-gradient(90deg, #ff6b35, #ff0000)"
                : excitement > 40
                  ? "linear-gradient(90deg, #00ffff, #39ff14)"
                  : "linear-gradient(90deg, #555, #888)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${excitement}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIVE TIMELINE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function LiveTimeline({ matchId, sport, teamA, teamB, isLive }: LiveTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"live" | "none">("none");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch timeline events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Try to fetch from timeline_events table
        const { data, error } = await supabase
          .from("timeline_events")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const mapped: TimelineEvent[] = data.map((e: any) => ({
            id: e.id,
            time: e.event_time || e.time || "—",
            type: e.event_type || e.type || "normal",
            title: e.title,
            description: e.description || "",
            emoji: e.emoji || EVENT_STYLES[e.event_type || e.type || "normal"]?.icon || "📌",
            impact: e.impact || "low",
          }));
          setEvents(mapped);
          setDataSource("live");
        } else {
          // Try to check if match has a timeline_events JSONB column
          const { data: matchData } = await supabase
            .from("matches")
            .select("timeline_events")
            .eq("id", matchId)
            .single();

          if (matchData?.timeline_events && Array.isArray(matchData.timeline_events) && matchData.timeline_events.length > 0) {
            setEvents(matchData.timeline_events);
            setDataSource("live");
          } else {
            // No data available
            setEvents([]);
            setDataSource("none");
          }
        }
      } catch {
        // Table might not exist — show empty state
        setEvents([]);
        setDataSource("none");
      }
      setLoading(false);
    };

    fetchEvents();

    // For live matches, poll every 10s
    if (isLive) {
      const interval = setInterval(fetchEvents, 10000);
      return () => clearInterval(interval);
    }
  }, [matchId, sport, isLive]);

  // Real-time subscription for live matches
  useEffect(() => {
    if (!isLive) return;
    
    const channel = supabase
      .channel(`timeline_${matchId}`)
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "timeline_events",
        filter: `match_id=eq.${matchId}` 
      }, (payload) => {
        const e = payload.new as any;
        const mapped: TimelineEvent = {
          id: e.id,
          time: e.event_time || e.time || "—",
          type: e.event_type || e.type || "normal",
          title: e.title,
          description: e.description || "",
          emoji: e.emoji || EVENT_STYLES[e.event_type || e.type || "normal"]?.icon || "📌",
          impact: e.impact || "low",
        };
        setEvents(prev => [mapped, ...prev]);
        setDataSource("live");
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId, isLive]);

  const displayEvents = showAll ? events : events.slice(0, 5);
  const isCricket = sport === "cricket";

  if (loading) {
    return (
      <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="px-5 py-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-4 h-4 bg-zinc-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-dark-border overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCricket ? "bg-cyan-500/10" : "bg-green-500/10"}`}>
            <Activity className={`w-4 h-4 ${isCricket ? "text-cyan-400" : "text-green-400"}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {isCricket ? "Ball-by-Ball" : "Match Timeline"}
              {isLive && (
                <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Live
                </span>
              )}
            </h3>
            <p className="text-[10px] text-zinc-600">{teamA} vs {teamB}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">

          <span className="text-[10px] text-zinc-600 font-mono">{events.length} events</span>
        </div>
      </div>

      {/* Emotion Meter */}
      <div className="px-5 py-3 border-b border-zinc-800/50">
        <FanEmotionMeter events={events} teamA={teamA} teamB={teamB} />
      </div>

      {/* Timeline Events */}
      <div ref={scrollRef} className="px-5 py-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800" />

          <AnimatePresence>
            {displayEvents.map((event, i) => {
              const style = EVENT_STYLES[event.type] || EVENT_STYLES.normal;
              const isHighImpact = event.impact === "high";

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative pl-12 pb-4 ${i === 0 && isLive ? "animate-pulse-subtle" : ""}`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-3 top-1 w-4 h-4 rounded-full border-2 ${
                    isHighImpact
                      ? `${style.border} ${style.bg}`
                      : "border-zinc-700 bg-zinc-800"
                  } flex items-center justify-center z-10`}>
                    {isHighImpact && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        event.type === "wicket" || event.type === "goal" ? "bg-red-400" :
                        event.type === "six" ? "bg-purple-400" :
                        "bg-yellow-400"
                      }`} />
                    )}
                  </div>

                  {/* Event Card */}
                  <div className={`rounded-xl border p-3 transition-all ${
                    isHighImpact
                      ? `${style.bg} ${style.border} ${style.glow || ""} shadow-lg`
                      : "bg-zinc-900/30 border-zinc-800/50"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {event.time}
                      </span>
                      <span className="text-sm">{event.emoji}</span>
                      <span className={`text-xs font-bold ${isHighImpact ? "text-white" : "text-zinc-400"}`}>
                        {event.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Show More */}
        {events.length > 5 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-800 transition-all flex items-center justify-center gap-1"
          >
            <ChevronDown className="w-3 h-3" />
            Show {events.length - 5} more events
          </button>
        )}

        {/* No events state */}
        {events.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm font-medium">No timeline events yet</p>
            <p className="text-zinc-600 text-xs mt-1">Events will appear here as the match progresses</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
