"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Circle, Flame } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MatchCardProps {
  sport: "cricket" | "football";
  index?: number;
  match: {
    id: number;
    title: string;
    teamA: string;
    teamB: string;
    scoreA: string;
    scoreB: string;
    status: string;
    live: boolean;
  };
}

export default function MatchCard({ sport, index = 0, match }: MatchCardProps) {
  const accentColor = sport === "cricket" ? "text-cricket" : "text-football";
  const bgAccentColor = sport === "cricket" ? "bg-cricket/10" : "bg-football/10";
  const borderAccentColor = sport === "cricket" ? "border-cricket/30" : "border-football/30";
  
  // Simple basic hover removed 3D Parallax due to poor browser GPU performance
  
  // Cheer State
  const [cheersA, setCheersA] = useState(0);
  const [cheersB, setCheersB] = useState(0);

  // Poll for cheers if match is live
  useEffect(() => {
    if (!match.live) return;

    const fetchCheers = async () => {
      try {
        const res = await fetch(`/api/cheer?matchId=${match.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setCheersA(data.teamA || 0);
        setCheersB(data.teamB || 0);
      } catch (err) {
        // Ignore fetch errors to keep console clean
      }
    };

    fetchCheers();
    const interval = setInterval(fetchCheers, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [match.id, match.live]);

  const handleCheer = async (team: "A" | "B") => {
    // Optimistic UI update
    if (team === "A") setCheersA(prev => prev + 1);
    else setCheersB(prev => prev + 1);

    // Fire & forget to Redis API
    try {
      await fetch('/api/cheer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match.id, team })
      });
    } catch (e) {
      console.error("Failed to cheer");
    }
  };

  const totalCheers = cheersA + cheersB;
  const percentageA = totalCheers === 0 ? 50 : (cheersA / totalCheers) * 100;
  const percentageB = totalCheers === 0 ? 50 : (cheersB / totalCheers) * 100;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`p-5 rounded-2xl match-card-animated-border card-${sport} border ${borderAccentColor} shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col gap-4 relative overflow-hidden z-10`}
    >
      {/* Background glow for the winning team */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-transparent transition-all duration-500 ease-out" 
        style={{ width: `${percentageA}%`, opacity: totalCheers > 0 ? 1 : 0 }} 
      />
      <div 
        className="absolute bottom-0 right-0 h-1 bg-gradient-to-l from-red-500 to-transparent transition-all duration-500 ease-out" 
        style={{ width: `${percentageB}%`, opacity: totalCheers > 0 ? 1 : 0 }} 
      />

      {/* Header */}
      <div className="flex justify-between items-center text-sm font-medium text-zinc-400">
        <span className="truncate">{match.title}</span>
        <div className="flex items-center gap-2">
          {match.live && (
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${accentColor} ${bgAccentColor} px-2.5 py-1 rounded-full live-pulse-ring`}>
              <Circle className="w-2.5 h-2.5 fill-current animate-pulse" />
              LIVE
            </span>
          )}
          <button className="hover:text-zinc-200 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="flex flex-col gap-4">
        {/* Team A */}
        <div className="flex justify-between items-center group">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs font-bold text-blue-400">
                {match.teamA.charAt(0)}
              </div>
              <span className="font-semibold text-lg">{match.teamA}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleCheer("A")}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold"
              title={`Cheer for ${match.teamA}`}
            >
              <Flame className="w-3.5 h-3.5 text-blue-400" />
              {cheersA}
            </button>
            <span className="font-bold text-xl min-w-[3rem] text-right">{match.scoreA}</span>
          </div>
        </div>
        
        {/* Team B */}
        <div className="flex justify-between items-center group">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-xs font-bold text-red-400">
                {match.teamB.charAt(0)}
              </div>
              <span className="font-semibold text-lg">{match.teamB}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleCheer("B")}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold"
              title={`Cheer for ${match.teamB}`}
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              {cheersB}
            </button>
            <span className="font-bold text-xl min-w-[3rem] text-right">{match.scoreB}</span>
          </div>
        </div>
      </div>

      {/* Fan Meter UI (Only shows when there's interaction) */}
      {totalCheers > 0 && (
        <div className="mt-2 text-center text-xs text-zinc-500 font-bold tracking-widest uppercase">
          Fan Cheer Meter
        </div>
      )}

      {/* Status Footer */}
      <div className="pt-3 border-t border-dark-border text-sm text-zinc-400 flex items-center justify-between">
        <span>{match.status}</span>
        <Link href={`/matches/${match.id}`} className={`text-xs font-semibold ${accentColor} hover:underline`}>
          {match.live ? "View Fan Space" : "Let's Debate"}
        </Link>
      </div>
    </motion.div>
  );
}
