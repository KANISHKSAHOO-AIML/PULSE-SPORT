"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface PulsePredictorProps {
  match: {
    id: string;
    team_a: string;
    team_b: string;
    sport: string;
    live: boolean;
    status: string;
  };
}

export default function PulsePredictor({ match }: PulsePredictorProps) {
  const [user, setUser] = useState<any>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [communityVotes, setCommunityVotes] = useState({ teamA: 0, teamB: 0, draw: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // Load prediction from localStorage (fallback if no DB table)
  useEffect(() => {
    const stored = localStorage.getItem(`prediction-${match.id}`);
    if (stored) {
      const data = JSON.parse(stored);
      setPrediction(data.pick);
      setSubmitted(true);
    }

    // Load community votes from localStorage
    const votes = JSON.parse(localStorage.getItem(`votes-${match.id}`) || '{"teamA":0,"teamB":0,"draw":0}');
    setCommunityVotes(votes);
  }, [match.id]);

  const submitPrediction = (pick: string) => {
    if (submitted) return;
    
    setPrediction(pick);
    setSubmitted(true);

    // Store locally
    localStorage.setItem(`prediction-${match.id}`, JSON.stringify({ pick, matchId: match.id, timestamp: Date.now() }));

    // Update community votes
    const newVotes = { ...communityVotes };
    if (pick === match.team_a) newVotes.teamA++;
    else if (pick === match.team_b) newVotes.teamB++;
    else newVotes.draw++;
    setCommunityVotes(newVotes);
    localStorage.setItem(`votes-${match.id}`, JSON.stringify(newVotes));

    // Brief confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // Try Supabase insert (fails gracefully if table doesn't exist)
    if (user) {
      supabase.from("predictions").insert({
        user_id: user.id,
        match_id: match.id,
        predicted_winner: pick,
      }).then(() => {});
    }
  };

  const totalVotes = communityVotes.teamA + communityVotes.teamB + communityVotes.draw;
  const pctA = totalVotes ? Math.round((communityVotes.teamA / totalVotes) * 100) : 33;
  const pctB = totalVotes ? Math.round((communityVotes.teamB / totalVotes) * 100) : 33;
  const pctDraw = totalVotes ? 100 - pctA - pctB : 34;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card rounded-2xl border border-dark-border p-5 relative overflow-hidden"
    >
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                background: ['#00FFFF', '#39FF14', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'][i % 6],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-500" />
        Pulse Predictor
        {submitted && (
          <span className="ml-auto text-[10px] bg-green-500/15 text-green-400 px-2 py-1 rounded-full font-bold">
            ✓ Prediction Locked
          </span>
        )}
      </h3>

      {!submitted ? (
        <>
          <p className="text-zinc-400 text-sm mb-4">Who do you think will win?</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => submitPrediction(match.team_a)}
              className="group p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/15 hover:border-blue-500/40 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm mx-auto mb-2 group-hover:scale-110 transition-transform">
                {match.team_a.charAt(0)}
              </div>
              <p className="text-xs font-bold text-blue-400 truncate">{match.team_a}</p>
            </button>

            <button
              onClick={() => submitPrediction("Draw")}
              className="group p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 hover:border-zinc-600 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center text-zinc-400 font-bold text-sm mx-auto mb-2 group-hover:scale-110 transition-transform">
                =
              </div>
              <p className="text-xs font-bold text-zinc-400">Draw</p>
            </button>

            <button
              onClick={() => submitPrediction(match.team_b)}
              className="group p-3 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/40 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-sm mx-auto mb-2 group-hover:scale-110 transition-transform">
                {match.team_b.charAt(0)}
              </div>
              <p className="text-xs font-bold text-red-400 truncate">{match.team_b}</p>
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm mb-3">
            Your pick: <span className="font-bold text-white">{prediction}</span>
          </p>

          {/* Community votes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 font-bold w-20 truncate">{match.team_a}</span>
              <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pctA}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="text-xs text-blue-400 font-bold w-8 text-right">{pctA}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-bold w-20">Draw</span>
              <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pctDraw}%` }}
                  transition={{ duration: 1, delay: 0.1 }}
                />
              </div>
              <span className="text-xs text-zinc-400 font-bold w-8 text-right">{pctDraw}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 font-bold w-20 truncate">{match.team_b}</span>
              <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pctB}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              <span className="text-xs text-red-400 font-bold w-8 text-right">{pctB}%</span>
            </div>
          </div>

          <p className="text-[10px] text-zinc-600 mt-3 flex items-center gap-1">
            <Users className="w-3 h-3" /> {totalVotes} predictions so far
          </p>
        </>
      )}
    </motion.div>
  );
}
