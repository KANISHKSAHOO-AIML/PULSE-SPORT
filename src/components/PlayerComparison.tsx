"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase/client";

interface PlayerComparisonProps {
  sport: "cricket" | "football";
  teamA: string;
  teamB: string;
}

/* ═══════════════════════════════════════════════════════════════
   FALLBACK DATA — used ONLY when no DB data is available.
   Clearly labeled as estimates so fans know the source.
   ═══════════════════════════════════════════════════════════════ */
const FALLBACK_DATA: Record<string, Record<string, { name: string; stats: number[] }>> = {
  cricket: {
    India: { name: "V. Kohli", stats: [92, 78, 85, 60, 88] },
    Australia: { name: "S. Smith", stats: [88, 72, 90, 55, 70] },
    "Sri Lanka": { name: "K. Sangakkara", stats: [85, 65, 88, 50, 72] },
    Pakistan: { name: "B. Azam", stats: [90, 70, 82, 55, 80] },
    England: { name: "J. Root", stats: [86, 68, 92, 48, 75] },
    CSK: { name: "MS Dhoni", stats: [85, 80, 78, 70, 95] },
    MI: { name: "R. Sharma", stats: [90, 75, 80, 55, 85] },
    RCB: { name: "V. Kohli", stats: [92, 78, 85, 60, 88] },
    SRH: { name: "T. Head", stats: [86, 60, 82, 45, 78] },
    KKR: { name: "A. Russell", stats: [88, 82, 75, 40, 80] },
    DC: { name: "R. Pant", stats: [84, 72, 88, 65, 76] },
    PBKS: { name: "S. Dhawan", stats: [82, 65, 78, 50, 80] },
    GT: { name: "S. Gill", stats: [89, 68, 85, 48, 82] },
    LSG: { name: "KL Rahul", stats: [87, 70, 80, 55, 84] },
    RR: { name: "S. Samson", stats: [83, 72, 86, 60, 78] },
  },
  football: {
    "Real Madrid": { name: "Vinícius Jr", stats: [88, 82, 75, 45, 90] },
    "Man City": { name: "E. Haaland", stats: [95, 60, 70, 40, 85] },
    Arsenal: { name: "B. Saka", stats: [82, 78, 80, 55, 88] },
    Liverpool: { name: "M. Salah", stats: [90, 75, 78, 50, 86] },
    Barcelona: { name: "L. Yamal", stats: [80, 72, 82, 48, 92] },
    Bayern: { name: "H. Kane", stats: [92, 65, 75, 42, 80] },
    PSG: { name: "K. Mbappé", stats: [93, 70, 72, 38, 95] },
    Chelsea: { name: "C. Palmer", stats: [80, 75, 82, 48, 84] },
  },
};

const STAT_LABELS: Record<string, string[]> = {
  cricket: ["Batting", "Bowling", "Consistency", "Fielding", "Impact"],
  football: ["Goals", "Assists", "Dribbling", "Tackling", "Pace"],
};

function getPlayerForTeam(sport: string, team: string, dbPlayers: any[]) {
  // First check DB players
  if (dbPlayers.length > 0) {
    const dbPlayer = dbPlayers.find((p: any) => {
      const t = (p.team || "").toLowerCase();
      return t === team.toLowerCase() || team.toLowerCase().includes(t) || t.includes(team.toLowerCase());
    });
    if (dbPlayer) {
      return {
        name: dbPlayer.name,
        stats: dbPlayer.stats || [75, 70, 72, 65, 68],
        fromDB: true,
      };
    }
  }

  // Fallback to hardcoded
  const sportData = FALLBACK_DATA[sport] || {};
  const found = sportData[team];
  if (found) return { ...found, fromDB: false };

  // Try partial match
  const lowerTeam = team.toLowerCase();
  for (const [key, val] of Object.entries(sportData)) {
    if (lowerTeam.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTeam)) {
      return { ...val, fromDB: false };
    }
  }
  
  return { name: "Star Player", stats: [75, 70, 72, 65, 68], fromDB: false };
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function PlayerComparison({ sport, teamA, teamB }: PlayerComparisonProps) {
  const [showB, setShowB] = useState(false);
  const [dbPlayers, setDbPlayers] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<"database" | "estimates">("estimates");

  // Fetch players from Supabase
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await supabase
          .from("players")
          .select("*")
          .in("sport", [sport]);
        
        if (data && data.length > 0) {
          setDbPlayers(data);
          setDataSource("database");
        }
      } catch {
        // Table might not exist — use fallback silently
      }
    };
    fetchPlayers();
  }, [sport]);

  useEffect(() => {
    const t = setTimeout(() => setShowB(true), 800);
    return () => clearTimeout(t);
  }, []);

  const playerA = getPlayerForTeam(sport, teamA, dbPlayers);
  const playerB = getPlayerForTeam(sport, teamB, dbPlayers);
  const labels = STAT_LABELS[sport] || STAT_LABELS.cricket;

  // Update data source based on whether players came from DB
  const isFromDB = playerA.fromDB || playerB.fromDB;

  const cx = 150, cy = 150, maxR = 110;
  const numStats = 5;
  const angleStep = 360 / numStats;

  const buildPath = (stats: number[]) => {
    return stats
      .map((val, i) => {
        const r = (val / 100) * maxR;
        const p = polarToCartesian(cx, cy, r, i * angleStep);
        return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
      })
      .join(" ") + " Z";
  };

  const gridRings = [25, 50, 75, 100];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-2xl border border-dark-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          ⚡ Player Head-to-Head
        </h3>
        {!isFromDB && (
          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-500/20">
            Estimates
          </span>
        )}
      </div>

      {/* Player names */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs font-bold text-blue-400">
            {playerA.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-blue-400">{playerA.name}</p>
            <p className="text-[10px] text-zinc-500">{teamA}</p>
          </div>
        </div>
        <span className="text-zinc-600 text-xs font-bold">VS</span>
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-bold text-red-400 text-right">{playerB.name}</p>
            <p className="text-[10px] text-zinc-500 text-right">{teamB}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-xs font-bold text-red-400">
            {playerB.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="flex justify-center">
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
          {/* Grid rings */}
          {gridRings.map((pct) => {
            const r = (pct / 100) * maxR;
            return (
              <polygon
                key={pct}
                points={Array.from({ length: numStats }, (_, i) => {
                  const p = polarToCartesian(cx, cy, r, i * angleStep);
                  return `${p.x},${p.y}`;
                }).join(" ")}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {/* Axes */}
          {labels.map((_, i) => {
            const p = polarToCartesian(cx, cy, maxR, i * angleStep);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
          })}

          {/* Player A area */}
          <motion.path
            d={buildPath(playerA.stats)}
            fill="rgba(59,130,246,0.15)"
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="radar-line"
          />

          {/* Player B area */}
          {showB && (
            <motion.path
              d={buildPath(playerB.stats)}
              fill="rgba(239,68,68,0.12)"
              stroke="#ef4444"
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="radar-line"
            />
          )}

          {/* Stat labels */}
          {labels.map((label, i) => {
            const p = polarToCartesian(cx, cy, maxR + 22, i * angleStep);
            return (
              <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill="#666" fontSize="10" fontWeight="600">
                {label}
              </text>
            );
          })}

          {/* Stat value dots Player A */}
          {playerA.stats.map((val: number, i: number) => {
            const r = (val / 100) * maxR;
            const p = polarToCartesian(cx, cy, r, i * angleStep);
            return <circle key={`a-${i}`} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />;
          })}

          {/* Stat value dots Player B */}
          {showB &&
            playerB.stats.map((val: number, i: number) => {
              const r = (val / 100) * maxR;
              const p = polarToCartesian(cx, cy, r, i * angleStep);
              return <circle key={`b-${i}`} cx={p.x} cy={p.y} r="3" fill="#ef4444" />;
            })}
        </svg>
      </div>

      {/* Stat comparison bars */}
      <div className="space-y-2 mt-4">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="w-12 text-right text-blue-400 font-bold">{playerA.stats[i]}</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
              <div className="bg-blue-500/60 h-full transition-all duration-700" style={{ width: `${playerA.stats[i] / 2}%` }} />
              <div className="bg-red-500/60 h-full transition-all duration-700 ml-auto" style={{ width: `${playerB.stats[i] / 2}%` }} />
            </div>
            <span className="w-12 text-red-400 font-bold">{playerB.stats[i]}</span>
          </div>
        ))}
      </div>

      {/* Data source note */}
      <p className="text-[9px] text-zinc-600 text-center mt-3">
        Stats rated 0–100 • {isFromDB ? "From database" : "Based on career performance estimates"}
      </p>
    </motion.div>
  );
}
