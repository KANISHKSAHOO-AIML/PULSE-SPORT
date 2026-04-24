"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface LeaderboardEntry {
  username: string;
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { username: "CricketGod99", total_points: 450, correct_predictions: 15, total_predictions: 20 },
  { username: "GoalMachine", total_points: 380, correct_predictions: 12, total_predictions: 18 },
  { username: "PredictorKing", total_points: 340, correct_predictions: 11, total_predictions: 16 },
  { username: "SportsFanatic", total_points: 290, correct_predictions: 9, total_predictions: 15 },
  { username: "AnalystPro", total_points: 250, correct_predictions: 8, total_predictions: 14 },
  { username: "MatchWizard", total_points: 220, correct_predictions: 7, total_predictions: 12 },
  { username: "TopScorer11", total_points: 180, correct_predictions: 6, total_predictions: 11 },
];

const RANK_ICONS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["text-yellow-400", "text-zinc-300", "text-amber-600"];

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data: leaderboardData, error } = await supabase
          .from("leaderboard")
          .select("*")
          .limit(7);
        
        if (leaderboardData && leaderboardData.length > 0) {
          const entries: LeaderboardEntry[] = leaderboardData.map(p => ({
            username: p.username || "Anonymous",
            total_points: p.total_points || 0,
            correct_predictions: p.correct_predictions || 0,
            total_predictions: p.total_predictions || 0,
          }));
          setData(entries);
        }
      } catch {
        // Keep mock data on error
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 60px -15px rgba(0,0,0,0.5), 0 0 30px rgba(234,179,8,0.05)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="glass-depth-2 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pulse Leaderboard</h3>
        <span className="ml-auto text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full font-bold">
          Top Predictors
        </span>
      </div>

      {/* Entries */}
      <div className="divide-y divide-zinc-800/50">
        {data.slice(0, 7).map((entry, i) => {
          const accuracy = entry.total_predictions > 0
            ? Math.round((entry.correct_predictions / entry.total_predictions) * 100)
            : 0;

          return (
            <motion.div
              key={entry.username}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
            >
              {/* Rank */}
              <div className={`w-6 text-center font-bold text-sm ${i < 3 ? RANK_COLORS[i] : "text-zinc-500"}`}>
                {i < 3 ? RANK_ICONS[i] : `#${i + 1}`}
              </div>

              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                i === 0 ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400" :
                i === 1 ? "bg-zinc-500/15 border-zinc-400/30 text-zinc-300" :
                i === 2 ? "bg-amber-500/15 border-amber-500/30 text-amber-500" :
                "bg-zinc-800 border-zinc-700 text-zinc-400"
              }`}>
                {entry.username.charAt(0).toUpperCase()}
              </div>

              {/* Name & Stats */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate">@{entry.username}</p>
                <p className="text-[10px] text-zinc-600">
                  {entry.correct_predictions}/{entry.total_predictions} correct • {accuracy}% accuracy
                </p>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="text-sm font-bold text-white">{entry.total_points}</p>
                <p className="text-[9px] text-zinc-600 uppercase tracking-wider">pts</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-600 flex items-center justify-center gap-1">
          <TrendingUp className="w-3 h-3" /> Predict matches to climb the leaderboard!
        </p>
      </div>
    </motion.div>
  );
}
