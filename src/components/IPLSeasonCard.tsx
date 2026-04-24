"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, ChevronDown, ChevronUp, Award } from "lucide-react";
import { IPL_TEAMS } from "@/lib/iplTeams";
import { IPLSeason } from "@/lib/iplSeasons";
import IPLPointsTable from "./IPLPointsTable";

function teamColor(short: string) { return IPL_TEAMS[short]?.color || "#888"; }
function teamEmoji(short: string) { return IPL_TEAMS[short]?.emoji || "🏏"; }

export default function IPLSeasonCard({ season }: { season: IPLSeason }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="ipl-season-card rounded-2xl border border-white/5 bg-[#0d0d1a]/80 backdrop-blur-xl overflow-hidden hover:border-white/10 transition-all"
    >
      {/* Main card content */}
      <div className="p-5 md:p-6">
        {/* Year badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl font-black ipl-gradient-text">{season.year}</span>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm" style={{ color: teamColor(season.winner) }}>
                  {teamEmoji(season.winner)} {season.winner}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">defeated {season.runnerUp} • {season.finalVenue}</p>
            </div>
          </div>
          <span className="text-xs text-zinc-600 bg-white/5 px-2 py-1 rounded-full">{season.totalMatches} matches</span>
        </div>

        {/* Awards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
            <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1">🧡 Orange Cap</p>
            <p className="text-sm font-bold text-white">{season.orangeCap.player}</p>
            <p className="text-xs text-zinc-500">{season.orangeCap.team} • {season.orangeCap.runs} runs</p>
          </div>
          <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3">
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">💜 Purple Cap</p>
            <p className="text-sm font-bold text-white">{season.purpleCap.player}</p>
            <p className="text-xs text-zinc-500">{season.purpleCap.team} • {season.purpleCap.wickets} wkts</p>
          </div>
          <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 col-span-2 md:col-span-1">
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">⭐ MVP</p>
            <p className="text-sm font-bold text-white">{season.mvp}</p>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-white/[0.02] rounded-xl hover:bg-white/[0.05]"
        >
          {expanded ? "Hide" : "Show"} Points Table
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable points table */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/5"
          >
            <IPLPointsTable data={season.pointsTable} year={season.year} compact />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
