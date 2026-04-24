"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Target, AlertTriangle, Trophy, Clock, ChevronDown } from "lucide-react";

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
   DEMO EVENTS (used when no real API is connected)
   ═══════════════════════════════════════════════════════════════ */
const CRICKET_DEMO: TimelineEvent[] = [
  { id: "c1", time: "19.6", type: "six", title: "SIX! Over the stands!", emoji: "6️⃣", description: "Massive hit over long-on! The crowd goes wild!", impact: "high" },
  { id: "c2", time: "19.5", type: "boundary", title: "FOUR through covers", emoji: "4️⃣", description: "Elegant drive through the off-side gap", impact: "medium" },
  { id: "c3", time: "19.4", type: "dot", title: "Dot ball", emoji: "⚫", description: "Good yorker, defended back to the bowler", impact: "low" },
  { id: "c4", time: "19.3", type: "wicket", title: "WICKET! Caught behind!", emoji: "🔴", description: "Edge found! Keeper takes a sharp catch diving right", impact: "high" },
  { id: "c5", time: "19.2", type: "run", title: "Single taken", emoji: "🏃", description: "Pushed to mid-on for a quick single", impact: "low" },
  { id: "c6", time: "19.1", type: "boundary", title: "FOUR! Pulled away!", emoji: "4️⃣", description: "Short ball dispatched to the square leg boundary", impact: "medium" },
  { id: "c7", time: "18.6", type: "milestone", title: "50 up! Half-century!", emoji: "🏆", description: "Brilliant knock under pressure. 50 off 32 balls", impact: "high" },
  { id: "c8", time: "18.5", type: "six", title: "SIX! Into the second tier!", emoji: "6️⃣", description: "Stepped out and lofted over long-off. Incredible power!", impact: "high" },
  { id: "c9", time: "18.4", type: "run", title: "Two runs", emoji: "🏃", description: "Worked to deep midwicket, good running between the wickets", impact: "low" },
  { id: "c10", time: "18.3", type: "dot", title: "Dot ball — beaten!", emoji: "⚫", description: "Outside off, swinging away. Close to the edge!", impact: "low" },
];

const FOOTBALL_DEMO: TimelineEvent[] = [
  { id: "f1", time: "89'", type: "goal", title: "GOOOAL!! Late winner!", emoji: "⚽", description: "Header from the corner! The substitute makes an instant impact!", impact: "high" },
  { id: "f2", time: "82'", type: "card", title: "Yellow Card", emoji: "🟨", description: "Late tackle from behind. Lucky not to see red", impact: "medium" },
  { id: "f3", time: "76'", type: "save", title: "Amazing save!", emoji: "🧤", description: "Point-blank save! The keeper denies what seemed a certain goal", impact: "high" },
  { id: "f4", time: "68'", type: "normal", title: "Substitution", emoji: "🔄", description: "Fresh legs brought on to change the game", impact: "low" },
  { id: "f5", time: "55'", type: "goal", title: "GOAL! Equalizer!", emoji: "⚽", description: "Brilliant counter-attack! Cool finish into the bottom corner", impact: "high" },
  { id: "f6", time: "45'", type: "normal", title: "Half Time", emoji: "⏸️", description: "End of the first half. Tactical battle so far", impact: "low" },
  { id: "f7", time: "38'", type: "save", title: "Double save!", emoji: "🧤", description: "First shot saved, rebound blocked too! Incredible reflexes", impact: "medium" },
  { id: "f8", time: "23'", type: "goal", title: "GOAL! Opening the scoring!", emoji: "⚽", description: "Curling free-kick from 25 yards! Top corner, no chance for the keeper", impact: "high" },
  { id: "f9", time: "15'", type: "card", title: "Yellow Card", emoji: "🟨", description: "Professional foul to stop a dangerous counter-attack", impact: "medium" },
  { id: "f10", time: "1'", type: "normal", title: "Kick Off!", emoji: "📣", description: "And we're underway! The atmosphere is electric!", impact: "low" },
];

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load demo events (replace with real API in Phase 5)
  useEffect(() => {
    const demo = sport === "cricket" ? CRICKET_DEMO : FOOTBALL_DEMO;
    setEvents(demo);
  }, [sport]);

  const displayEvents = showAll ? events : events.slice(0, 5);
  const isCricket = sport === "cricket";

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
        <span className="text-[10px] text-zinc-600 font-mono">{events.length} events</span>
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
      </div>
    </motion.div>
  );
}
