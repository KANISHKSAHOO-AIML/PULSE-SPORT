"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MoreVertical, Flame, Share2, Volume2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ShareButtons from "@/components/ShareButtons";
import { IPL_TEAMS } from "@/lib/iplTeams";

function getTeamLogo(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (lower.includes(t.short.toLowerCase()) || lower.includes(t.city.toLowerCase()) || lower.includes(t.name.toLowerCase())) return t.logo;
  }
  
  // Basic hardcoded football logos for major teams
  const fbLogos: Record<string, string> = {
    "real madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    "barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    "manchester united": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    "manchester city": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    "man city": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    "arsenal": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    "liverpool": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    "chelsea": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    "bayern munich": "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    "psg": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    "juventus": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg",
    "ac milan": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg"
  };
  
  for (const [key, url] of Object.entries(fbLogos)) {
    if (lower.includes(key)) return url;
  }
  
  return undefined;
}

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
  
  // Score flash tracking
  const prevScoreA = useRef(match.scoreA);
  const prevScoreB = useRef(match.scoreB);
  const [flashA, setFlashA] = useState(false);
  const [flashB, setFlashB] = useState(false);

  useEffect(() => {
    if (match.scoreA !== prevScoreA.current) {
      setFlashA(true);
      prevScoreA.current = match.scoreA;
      const t = setTimeout(() => setFlashA(false), 900);
      return () => clearTimeout(t);
    }
  }, [match.scoreA]);

  useEffect(() => {
    if (match.scoreB !== prevScoreB.current) {
      setFlashB(true);
      prevScoreB.current = match.scoreB;
      const t = setTimeout(() => setFlashB(false), 900);
      return () => clearTimeout(t);
    }
  }, [match.scoreB]);
  
  // Cheer State
  const [cheersA, setCheersA] = useState(0);
  const [cheersB, setCheersB] = useState(0);

  // Hype Score State
  const [hypeScore, setHypeScore] = useState(0);
  const [hypeWaveform, setHypeWaveform] = useState<number[]>(Array(24).fill(3));

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
        
        // Calculate hype from total cheers velocity (simple approach)
        const totalNow = (data.teamA || 0) + (data.teamB || 0);
        setHypeScore(prev => {
          const diff = totalNow - prev;
          // Hype decays toward 0, spikes when cheers flow in
          const newHype = Math.min(100, Math.max(0, diff > 0 ? Math.min(100, diff * 8) : Math.max(0, prev - 3)));
          return newHype;
        });
      } catch (err) {
        // Ignore fetch errors to keep console clean
      }
    };

    fetchCheers();
    const interval = setInterval(fetchCheers, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [match.id, match.live]);

  // Animate hype waveform
  useEffect(() => {
    if (!match.live) return;
    const interval = setInterval(() => {
      setHypeWaveform(prev => 
        prev.map(() => Math.max(3, Math.random() * (hypeScore / 100) * 28 + 3))
      );
    }, 200);
    return () => clearInterval(interval);
  }, [hypeScore, match.live]);

  const handleCheer = async (team: "A" | "B") => {
    // Optimistic UI update
    if (team === "A") setCheersA(prev => prev + 1);
    else setCheersB(prev => prev + 1);

    // Bump hype score immediately
    setHypeScore(prev => Math.min(100, prev + 12));

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

  const hypeLabel = hypeScore > 80 ? '🔥 ROARING' : hypeScore > 50 ? '📢 LOUD' : hypeScore > 20 ? '👏 BUZZING' : '😶 QUIET';
  const hypeBarClass = hypeScore > 80 ? 'hype-bar-roaring' : hypeScore > 50 ? 'hype-bar-loud' : hypeScore > 20 ? 'hype-bar-buzzing' : 'hype-bar-quiet';
  const hypeLabelColor = hypeScore > 80 ? 'text-red-400 animate-pulse' : hypeScore > 50 ? 'text-orange-400' : hypeScore > 20 ? 'text-yellow-400' : 'text-zinc-500';

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{
        y: -6,
        scale: 1.015,
        boxShadow: sport === "cricket"
          ? "0 24px 80px -20px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,255,0.06)"
          : "0 24px 80px -20px rgba(0,0,0,0.6), 0 0 40px rgba(57,255,20,0.06)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`p-5 rounded-2xl glass-depth-2 match-card-animated-border card-${sport} border ${borderAccentColor} flex flex-col gap-4 relative overflow-hidden z-10`}
    >
      {/* Bottom cheer bar indicators */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-transparent transition-all duration-500 ease-out pointer-events-none" 
        style={{ width: `${percentageA}%`, opacity: totalCheers > 0 ? 1 : 0 }} 
      />
      <div 
        className="absolute bottom-0 right-0 h-1 bg-gradient-to-l from-red-500 to-transparent transition-all duration-500 ease-out pointer-events-none" 
        style={{ width: `${percentageB}%`, opacity: totalCheers > 0 ? 1 : 0 }} 
      />

      {/* Header */}
      <div className="flex justify-between items-center text-sm font-medium text-zinc-400">
        <span className="truncate">{match.title}</span>
        <div className="flex items-center gap-2">
          {match.live && (
            <span className="relative flex items-center gap-1.5 text-xs font-black tracking-[0.15em] uppercase px-3 py-1 rounded-md bg-red-500/20 text-red-400 live-badge-glow">
              <span className="live-badge-dot" />
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
              <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-white/5 border border-white/10">
                {getTeamLogo(match.teamA) ? (
                  <img src={getTeamLogo(match.teamA)} alt={match.teamA} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-xs font-bold text-blue-400">{match.teamA.charAt(0)}</span>
                )}
              </div>
              <span className="font-semibold text-lg">{match.teamA}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleCheer("A")}
              className="opacity-0 group-hover:opacity-100 transition-opacity glass-depth-3 text-zinc-300 p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold hover:scale-105 active:scale-95"
              title={`Cheer for ${match.teamA}`}
            >
              <Flame className="w-3.5 h-3.5 text-blue-400" />
              {cheersA}
            </button>
            <span className={`font-black text-2xl min-w-[4rem] text-right tabular-nums tracking-tight ${flashA ? `score-updated-${sport}` : ''}`}>
              {match.scoreA}
            </span>
          </div>
        </div>
        
        {/* Team B */}
        <div className="flex justify-between items-center group">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-white/5 border border-white/10">
                {getTeamLogo(match.teamB) ? (
                  <img src={getTeamLogo(match.teamB)} alt={match.teamB} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-xs font-bold text-red-400">{match.teamB.charAt(0)}</span>
                )}
              </div>
              <span className="font-semibold text-lg">{match.teamB}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleCheer("B")}
              className="opacity-0 group-hover:opacity-100 transition-opacity glass-depth-3 text-zinc-300 p-1.5 rounded-lg flex items-center gap-1 text-xs font-bold hover:scale-105 active:scale-95"
              title={`Cheer for ${match.teamB}`}
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              {cheersB}
            </button>
            <span className={`font-black text-2xl min-w-[4rem] text-right tabular-nums tracking-tight ${flashB ? `score-updated-${sport}` : ''}`}>
              {match.scoreB}
            </span>
          </div>
        </div>
      </div>

      {/* Fan Cheer Meter (Only shows when there's interaction) */}
      {totalCheers > 0 && (
        <div className="mt-1 text-center text-xs text-zinc-500 font-bold tracking-widest uppercase">
          Fan Cheer Meter
        </div>
      )}

      {/* ⚡ Hype Score / Crowd Noise Visualizer — Only on live matches */}
      {match.live && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Crowd Noise
            </span>
            <span className={`text-[10px] font-black ${hypeLabelColor}`}>
              {hypeLabel}
            </span>
          </div>
          {/* Audio waveform bars */}
          <div className="flex items-end gap-[2px] h-7 rounded-lg overflow-hidden bg-zinc-900/50 px-1 py-1">
            {hypeWaveform.map((barH, i) => (
              <motion.div
                key={i}
                className={`flex-1 hype-bar ${hypeBarClass}`}
                animate={{ height: barH }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="pt-3 border-t border-dark-border text-sm text-zinc-400 flex items-center justify-between relative z-20">
        <span>{match.status}</span>
        <div className="flex items-center gap-3">
          <ShareButtons title={`${match.teamA} ${match.scoreA} vs ${match.scoreB} ${match.teamB} — PulseSports`} url={typeof window !== 'undefined' ? `${window.location.origin}/matches/${match.id}` : undefined} />
          <Link href={`/matches/${match.id}`} className={`text-xs font-semibold ${accentColor} hover:underline`}>
            {match.live ? "View Fan Space" : "Let's Debate"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
