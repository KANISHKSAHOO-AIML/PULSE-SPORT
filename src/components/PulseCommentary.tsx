"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Flame, TrendingUp, Users, BarChart2 } from "lucide-react";

interface CommentaryEvent {
  id: string;
  time: string;
  text: string;
  reactions: Record<string, number>;
  excitement: number; // 0-100
  type: "normal" | "wicket" | "boundary" | "goal" | "milestone" | "card";
}

interface PulseCommentaryProps {
  matchId: string;
  sport: string;
  teamA: string;
  teamB: string;
  isLive: boolean;
}

const REACTIONS = ["🔥", "😱", "😤", "🎉", "👏", "💔"];

// Generate mock commentary for demo
function generateMockCommentary(sport: string, teamA: string, teamB: string): CommentaryEvent[] {
  if (sport === "cricket") {
    return [
      { id: "1", time: "49.6", text: `FOUR! ${teamA} finishes with a flourish! Short ball, pulled away magnificently through midwicket. The crowd erupts!`, reactions: { "🔥": 45, "🎉": 32, "👏": 28 }, excitement: 92, type: "boundary" },
      { id: "2", time: "49.5", text: `Dot ball. Good length delivery, defended solidly. ${teamA} need 6 off the last ball.`, reactions: { "😤": 12, "😱": 8 }, excitement: 78, type: "normal" },
      { id: "3", time: "49.4", text: `SIX! MASSIVE! Over long-on! The batsman clears the front leg and launches it into the stands!`, reactions: { "🔥": 67, "🎉": 54, "👏": 41, "😱": 23 }, excitement: 98, type: "boundary" },
      { id: "4", time: "49.3", text: `Single taken. Turned to leg side. Smart running between the wickets.`, reactions: { "👏": 5 }, excitement: 35, type: "normal" },
      { id: "5", time: "49.2", text: `WICKET! Caught at deep cover! The fielder takes a stunning diving catch. ${teamB} strike at a crucial moment!`, reactions: { "😱": 78, "💔": 43, "😤": 31 }, excitement: 95, type: "wicket" },
      { id: "6", time: "49.1", text: `Wide! Down the leg side. Pressure getting to the bowler. Free run for ${teamA}.`, reactions: { "👏": 15, "🔥": 8 }, excitement: 45, type: "normal" },
      { id: "7", time: "48.6", text: `Good over comes to an end. 8 runs off it. The equation is getting tighter by the ball.`, reactions: { "😤": 10 }, excitement: 55, type: "normal" },
      { id: "8", time: "48.5", text: `FOUR! Edge flies through the gap between keeper and first slip! Lucky but it counts!`, reactions: { "🔥": 34, "👏": 22, "😱": 15 }, excitement: 82, type: "boundary" },
    ];
  }
  // Football
  return [
    { id: "1", time: "90+3'", text: `GOOOOAAAL! ${teamA} score in stoppage time! The stadium explodes! Header from a corner kick!`, reactions: { "🔥": 89, "🎉": 76, "👏": 54, "😱": 41 }, excitement: 99, type: "goal" },
    { id: "2", time: "88'", text: `${teamB} with a dangerous free kick. Curled over the wall... saved brilliantly by the keeper!`, reactions: { "😱": 45, "👏": 38 }, excitement: 85, type: "normal" },
    { id: "3", time: "82'", text: `Yellow card! Late tackle in midfield. The referee had no choice. Crowd is furious.`, reactions: { "😤": 56, "🔥": 12 }, excitement: 65, type: "card" },
    { id: "4", time: "76'", text: `Substitution for ${teamA}. Fresh legs coming on for the final push.`, reactions: { "👏": 8 }, excitement: 30, type: "normal" },
    { id: "5", time: "71'", text: `GOAL! ${teamB} equalize! Counter-attack finished with a clinical strike into the bottom corner!`, reactions: { "🔥": 72, "🎉": 58, "😱": 35, "💔": 28 }, excitement: 96, type: "goal" },
    { id: "6", time: "65'", text: `Close! Shot from distance rattles the crossbar! Inches away from a spectacular goal.`, reactions: { "😱": 43, "🔥": 21 }, excitement: 78, type: "normal" },
    { id: "7", time: "58'", text: `Good build-up play. Patient possession football. Looking for an opening.`, reactions: { "👏": 5 }, excitement: 25, type: "normal" },
    { id: "8", time: "45+2'", text: `GOAL! ${teamA} take the lead at half-time! Stunning through ball meets a first-time finish!`, reactions: { "🔥": 65, "🎉": 51, "👏": 44 }, excitement: 94, type: "goal" },
  ];
}

export default function PulseCommentary({ matchId, sport, teamA, teamB, isLive }: PulseCommentaryProps) {
  const [events, setEvents] = useState<CommentaryEvent[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEvents(generateMockCommentary(sport, teamA, teamB));
  }, [matchId, sport, teamA, teamB]);

  const handleReact = (eventId: string, emoji: string) => {
    if (userReactions[eventId]) return;
    setUserReactions(prev => ({ ...prev, [eventId]: emoji }));
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        reactions: {
          ...e.reactions,
          [emoji]: (e.reactions[emoji] || 0) + 1,
        },
      };
    }));
  };

  const getEventStyle = (event: CommentaryEvent) => {
    switch (event.type) {
      case "wicket": return "border-l-4 border-l-red-500 bg-red-500/5";
      case "boundary": return "border-l-4 border-l-cyan-500 bg-cyan-500/5";
      case "goal": return "border-l-4 border-l-green-500 bg-green-500/5";
      case "milestone": return "border-l-4 border-l-yellow-500 bg-yellow-500/5";
      case "card": return "border-l-4 border-l-yellow-500 bg-yellow-500/5";
      default: return "border-l-4 border-l-zinc-700";
    }
  };

  const getExcitementColor = (level: number) => {
    if (level >= 80) return "text-red-400";
    if (level >= 60) return "text-orange-400";
    if (level >= 40) return "text-yellow-400";
    return "text-zinc-500";
  };

  const getExcitementBg = (level: number) => {
    if (level >= 80) return "bg-red-500/10";
    if (level >= 60) return "bg-orange-500/10";
    if (level >= 40) return "bg-yellow-500/10";
    return "bg-zinc-800/50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-depth-2 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Mic className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Pulse Commentary
              {isLive && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold animate-pulse">LIVE</span>}
            </h3>
            <span className="text-[9px] text-zinc-500">AI-Enhanced • Fan Reactions</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Users className="w-3.5 h-3.5" />
          <span className="font-mono">{events.reduce((sum, e) => sum + Object.values(e.reactions).reduce((s, v) => s + v, 0), 0)} reactions</span>
        </div>
      </div>

      {/* Events List */}
      <div ref={scrollRef} className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {events.map((event, i) => {
          const totalReactions = Object.values(event.reactions).reduce((s, v) => s + v, 0);
          const voted = userReactions[event.id];

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`px-5 py-3 border-b border-zinc-800/50 ${getEventStyle(event)} transition-all`}
            >
              <div className="flex items-start gap-3">
                {/* Time badge */}
                <div className="shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                    {event.time}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 leading-relaxed">{event.text}</p>

                  {/* Reactions row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Excitement meter */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${getExcitementBg(event.excitement)} ${getExcitementColor(event.excitement)}`}>
                      <BarChart2 className="w-3 h-3" />
                      {event.excitement}%
                    </div>

                    {/* Existing reactions */}
                    {Object.entries(event.reactions).sort(([,a],[,b]) => b - a).slice(0, 4).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(event.id, emoji)}
                        disabled={!!voted}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-all ${
                          voted === emoji
                            ? "bg-white/10 border-white/20 scale-105"
                            : "bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-500 hover:scale-105"
                        }`}
                      >
                        {emoji} <span className="font-bold text-zinc-400">{count}</span>
                      </button>
                    ))}

                    {/* Add reaction */}
                    {!voted && (
                      <div className="flex gap-0.5">
                        {REACTIONS.filter(r => !event.reactions[r]).slice(0, 2).map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReact(event.id, emoji)}
                            className="w-6 h-6 rounded-full bg-zinc-800/30 border border-zinc-700/30 flex items-center justify-center text-xs hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] text-zinc-600 ml-auto">{totalReactions} reactions</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer with excitement summary */}
      <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-zinc-400">
              Average Excitement: {Math.round(events.reduce((s, e) => s + e.excitement, 0) / events.length)}%
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-zinc-600">
            <TrendingUp className="w-3 h-3" />
            Top moment: {events.sort((a, b) => b.excitement - a.excitement)[0]?.time}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
