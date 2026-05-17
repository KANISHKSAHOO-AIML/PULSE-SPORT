"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Brain, Zap } from "lucide-react";

interface WinProbabilityProps {
  match: {
    id?: string | number;
    sport: string;
    team_a: string;
    team_b: string;
    score_a: string;
    score_b: string;
    live: boolean;
    status: string;
  };
}

interface AIAnalysis {
  winProbability: { teamA: number; teamB: number };
  momentum: string;
  momentumReason: string;
  keyInsight: string;
  prediction: string;
  fallback?: boolean;
}

function parseScore(score: string, sport: string): number {
  const s = String(score || "");
  if (sport === "cricket") {
    const runs = parseInt(s.split("/")[0]) || 0;
    return runs;
  }
  return parseInt(s) || 0;
}

export default function WinProbability({ match }: WinProbabilityProps) {
  const [animateIn, setAnimateIn] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRequested, setAiRequested] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 200);
    return () => clearTimeout(t);
  }, []);

  const scoreA = parseScore(match.score_a, match.sport);
  const scoreB = parseScore(match.score_b, match.sport);
  const total = scoreA + scoreB || 1;

  // Use AI probabilities if available, otherwise calculate from scores
  const probA = (aiAnalysis ? aiAnalysis.winProbability.teamA : Math.max(15, Math.min(85, (scoreA / total) * 100))) || 50;
  const probB = (aiAnalysis ? aiAnalysis.winProbability.teamB : 100 - probA) || 50;

  // Generate probability curve
  const dataPoints = useMemo(() => {
    const pts: number[] = [];
    const currentProbA = probA;
    const numPoints = 20;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const base = 50 + (currentProbA - 50) * t;
      const noise = Math.sin(t * 12) * 8 * (1 - t * 0.5) + Math.cos(t * 7) * 5;
      pts.push(Math.max(10, Math.min(90, base + noise)));
    }
    return pts;
  }, [probA]);

  // Fetch AI analysis
  const fetchAIAnalysis = async () => {
    if (!match.id || aiLoading) return;
    setAiLoading(true);
    setAiRequested(true);
    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch {
      // Silently fail
    }
    setAiLoading(false);
  };

  // Auto-fetch AI analysis for live matches every 30s
  useEffect(() => {
    if (match.live && match.id) {
      fetchAIAnalysis();
      const interval = setInterval(fetchAIAnalysis, 30000);
      return () => clearInterval(interval);
    }
  }, [match.id, match.live]);

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

  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  const momentumColor = aiAnalysis?.momentum === match.team_a ? "text-blue-400" :
                         aiAnalysis?.momentum === match.team_b ? "text-red-400" : "text-zinc-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-depth-2 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Win Probability
        </h3>
        {aiAnalysis && !aiAnalysis.fallback && (
          <span className="text-[9px] font-bold bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Brain className="w-3 h-3" /> AI-Powered
          </span>
        )}
      </div>

      {/* Probability bars */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-blue-400">{match.team_a}</span>
            <span className="text-blue-400">{Math.round(probA)}%</span>
          </div>
          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
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
          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
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
          {[25, 50, 75].map((v) => (
            <line key={v} x1={0} x2={W} y1={padY + ((100 - v) / 100) * (H - padY * 2)} y2={padY + ((100 - v) / 100) * (H - padY * 2)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
          <path d={areaD} fill="url(#areaGradientA)" opacity={animateIn ? 0.3 : 0} style={{ transition: "opacity 1s ease" }} />
          <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={animateIn ? "prob-line" : ""} />
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
        <div className="absolute bottom-1 left-2 text-[9px] text-zinc-600 font-bold">Match Start</div>
        <div className="absolute bottom-1 right-2 text-[9px] text-zinc-600 font-bold">Now</div>
        <div className="absolute top-1 right-2 text-[9px] text-blue-500/50 font-bold">{match.team_a}</div>
        <div className="absolute bottom-5 right-2 text-[9px] text-red-500/50 font-bold">{match.team_b}</div>
      </div>

      {/* AI Insights Panel */}
      {aiAnalysis && !aiAnalysis.fallback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.4 }}
          className="mt-4 space-y-2"
        >
          {/* Momentum */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <TrendingUp className={`w-4 h-4 ${momentumColor}`} />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Momentum</span>
              <p className="text-xs text-zinc-300 truncate">{aiAnalysis.momentumReason}</p>
            </div>
            <span className={`text-xs font-black ${momentumColor}`}>{aiAnalysis.momentum}</span>
          </div>
          {/* Key Insight */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">AI Insight</span>
              <p className="text-xs text-zinc-300">{aiAnalysis.keyInsight}</p>
            </div>
          </div>
          {/* Prediction */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15">
            <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">AI Prediction</span>
              <p className="text-xs text-zinc-200 font-medium">{aiAnalysis.prediction}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI trigger button for non-live matches */}
      {!match.live && match.id && !aiRequested && (
        <button
          onClick={fetchAIAnalysis}
          className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Brain className="w-3.5 h-3.5" />
          Get AI Analysis
        </button>
      )}
      {aiLoading && (
        <div className="mt-3 text-center text-[10px] text-zinc-500 animate-pulse flex items-center justify-center gap-1">
          <Brain className="w-3 h-3" /> Analyzing match data...
        </div>
      )}
    </motion.div>
  );
}
