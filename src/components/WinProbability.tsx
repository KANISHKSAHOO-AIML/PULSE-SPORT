"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface WinProbabilityProps {
  match: {
    sport: string;
    team_a: string;
    team_b: string;
    score_a: string;
    score_b: string;
    live: boolean;
    status: string;
  };
}

function parseScore(score: string, sport: string): number {
  if (sport === "cricket") {
    const runs = parseInt(score.split("/")[0]) || 0;
    return runs;
  }
  return parseInt(score) || 0;
}

export default function WinProbability({ match }: WinProbabilityProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 200);
    return () => clearTimeout(t);
  }, []);

  const scoreA = parseScore(match.score_a, match.sport);
  const scoreB = parseScore(match.score_b, match.sport);
  const total = scoreA + scoreB || 1;

  // Generate probability curve based on current score state
  const dataPoints = useMemo(() => {
    const pts: number[] = [];
    const currentProbA = Math.max(15, Math.min(85, (scoreA / total) * 100));
    const numPoints = 20;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      // Start at 50%, trend toward current probability with some randomness
      const base = 50 + (currentProbA - 50) * t;
      const noise = Math.sin(t * 12) * 8 * (1 - t * 0.5) + Math.cos(t * 7) * 5;
      pts.push(Math.max(10, Math.min(90, base + noise)));
    }
    return pts;
  }, [scoreA, scoreB, total]);

  const probA = dataPoints[dataPoints.length - 1];
  const probB = 100 - probA;

  // SVG chart dimensions
  const W = 500;
  const H = 160;
  const padX = 0;
  const padY = 10;

  const pathD = dataPoints
    .map((val, i) => {
      const x = padX + (i / (dataPoints.length - 1)) * (W - padX * 2);
      const y = padY + ((100 - val) / 100) * (H - padY * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Area fill path
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl border border-dark-border p-5"
    >
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Win Probability
      </h3>

      {/* Probability bars */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-blue-400">{match.team_a}</span>
            <span className="text-blue-400">{Math.round(probA)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              initial={{ width: "50%" }}
              animate={{ width: `${probA}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>
        <span className="text-zinc-600 text-xs font-bold">VS</span>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-red-400">{match.team_b}</span>
            <span className="text-red-400">{Math.round(probB)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
              initial={{ width: "50%" }}
              animate={{ width: `${probB}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden bg-zinc-900/50 border border-zinc-800">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[25, 50, 75].map((v) => (
            <line key={v} x1={0} x2={W} y1={padY + ((100 - v) / 100) * (H - padY * 2)} y2={padY + ((100 - v) / 100) * (H - padY * 2)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}

          {/* 50% center line */}
          <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Area fill below line (Team A) */}
          <path d={areaD} fill="url(#areaGradientA)" opacity={animateIn ? 0.3 : 0} style={{ transition: "opacity 1s ease" }} />

          {/* The probability line */}
          <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={animateIn ? "prob-line" : ""} />

          {/* Current point dot */}
          {animateIn && (
            <circle cx={W} cy={padY + ((100 - probA) / 100) * (H - padY * 2)} r="4" fill="#3b82f6">
              <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
            </circle>
          )}

          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="areaGradientA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="absolute bottom-1 left-2 text-[9px] text-zinc-600 font-bold">Match Start</div>
        <div className="absolute bottom-1 right-2 text-[9px] text-zinc-600 font-bold">Now</div>
        <div className="absolute top-1 right-2 text-[9px] text-blue-500/50 font-bold">{match.team_a}</div>
        <div className="absolute bottom-5 right-2 text-[9px] text-red-500/50 font-bold">{match.team_b}</div>
      </div>
    </motion.div>
  );
}
