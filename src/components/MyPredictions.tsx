"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shield, Clock, ArrowRight, CheckCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface SavedPrediction {
  matchId: string;
  team: string;
  players: string[];
  savedAt: string;
}

function loadAllPredictions(): SavedPrediction[] {
  if (typeof window === "undefined") return [];
  const predictions: SavedPrediction[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("pulse_predict_") && !key.includes("_team_")) {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        if (data.players?.length > 0) {
          // Extract matchId and team from key: pulse_predict_62_PBKS
          const parts = key.replace("pulse_predict_", "").split("_");
          const matchId = parts[0];
          const team = parts.slice(1).join("_");
          predictions.push({
            matchId,
            team,
            players: data.players,
            savedAt: data.savedAt || new Date().toISOString(),
          });
        }
      }
    }
  } catch {}

  return predictions.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export default function MyPredictions() {
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPredictions(loadAllPredictions());
  }, []);

  if (!mounted) return null;
  if (predictions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-depth-2 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="relative p-5 pb-4 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-cyan-500/5" />
        <div className="relative flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            My Predictions
          </h3>
          <span className="text-[10px] bg-cyan-500/15 text-cyan-400 px-2 py-1 rounded-full font-bold">
            {predictions.length} {predictions.length === 1 ? "prediction" : "predictions"}
          </span>
        </div>
      </div>

      {/* Predictions List */}
      <div className="p-4 space-y-2">
        {predictions.map((pred) => {
          const isExpanded = expanded === `${pred.matchId}_${pred.team}`;
          const timeAgo = getTimeAgo(pred.savedAt);

          return (
            <motion.div
              key={`${pred.matchId}_${pred.team}`}
              layout
              className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all"
            >
              {/* Collapsed row */}
              <button
                onClick={() => setExpanded(isExpanded ? null : `${pred.matchId}_${pred.team}`)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">
                    Match {pred.matchId} — {pred.team}
                  </p>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {timeAgo}
                    <span className="mx-1">•</span>
                    <CheckCircle className="w-2.5 h-2.5 text-green-500" /> 11 players locked
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 border-t border-white/5 pt-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-3">
                        {pred.players.map((name, i) => (
                          <div
                            key={name}
                            className="bg-white/[0.03] border border-white/5 rounded-lg px-2 py-1.5 text-center"
                          >
                            <div className="w-5 h-5 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center text-[8px] font-bold text-cyan-400 mb-0.5">
                              {name.charAt(0)}
                            </div>
                            <p className="text-[8px] font-semibold text-zinc-400 truncate">
                              {name.split(" ").pop()}
                            </p>
                          </div>
                        ))}
                      </div>
                      <Link
                        href={`/matches/${pred.matchId}`}
                        className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 hover:bg-cyan-500/15 px-4 py-2 rounded-xl border border-cyan-500/20 w-full"
                      >
                        View Match <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
