"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Circle, MapPin, Clock, Trophy, Zap } from "lucide-react";
import { IPL_TEAMS } from "@/lib/iplTeams";
import TeamLogo from "@/components/TeamLogo";

interface Props {
  matchData?: any;
  fallback?: boolean; // show static CSK vs SRH card when no API data
}

function getTeamColor(name: string): string {
  const lower = name.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (lower.includes(t.short.toLowerCase()) || lower.includes(t.city.toLowerCase()) || lower.includes(t.name.toLowerCase())) return t.color;
  }
  return "#888";
}

function getTeamShort(name: string): string {
  const lower = name.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (lower.includes(t.short.toLowerCase()) || lower.includes(t.city.toLowerCase()) || lower.includes(t.name.toLowerCase())) return t.short;
  }
  return name.substring(0, 3).toUpperCase();
}

function getTeamEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (lower.includes(t.short.toLowerCase()) || lower.includes(t.city.toLowerCase()) || lower.includes(t.name.toLowerCase())) return t.emoji;
  }
  return "🏏";
}

function getTeamLogo(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (lower.includes(t.short.toLowerCase()) || lower.includes(t.city.toLowerCase()) || lower.includes(t.name.toLowerCase())) return t.logo;
  }
  return undefined;
}

export default function IPLLiveCard({ matchData, fallback = true }: Props) {
  const [countdown, setCountdown] = useState("");
  const [liveData, setLiveData] = useState<any>(matchData || null);
  const [pulse, setPulse] = useState(false);
  const [countdownDone, setCountdownDone] = useState(false);

  // If no match data is passed, we just don't render.
  const match = liveData || matchData;

  const team1Name = match?.teams?.[0] || match?.team1 || "TBA";
  const team2Name = match?.teams?.[1] || match?.team2 || "TBA";
  const isLive = match?.matchStarted && !match?.matchEnded;
  const isCompleted = match?.matchEnded;
  const scores = match?.score || [];

  // Countdown timer — when it hits 0, set countdownDone to trigger polling
  useEffect(() => {
    if (!match || isLive || isCompleted) return;
    const targetTime = new Date(match.date).getTime();
    if (isNaN(targetTime)) return;
    
    // If match time already passed, immediately mark countdown as done
    if (Date.now() >= targetTime) {
      setCountdown("Match Starting!");
      setCountdownDone(true);
      return;
    }
    
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setCountdown("Match Starting!");
        setCountdownDone(true);
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive, isCompleted, match?.date]);

  // Poll for live updates — triggers when match is live OR countdown has finished
  useEffect(() => {
    if (!isLive && !countdownDone) return;

    const pollForScores = async () => {
      try {
        const res = await fetch("/api/ipl");
        const data = await res.json();
        if (data.matches?.length > 0) {
          // Try to find the exact match by ID or team names
          const updatedMatch = data.matches.find((m: any) => 
            m.id === match?.id || 
            (m.teams && match?.teams && m.teams[0] === match.teams[0] && m.teams[1] === match.teams[1])
          ) || data.matches[0];
          
          setLiveData(updatedMatch);
          setPulse(true);
          setTimeout(() => setPulse(false), 500);
        }
      } catch {}
    };

    // Poll immediately, then every 30s
    pollForScores();
    const interval = setInterval(pollForScores, 30000);
    return () => clearInterval(interval);
  }, [isLive, countdownDone, match?.id]);

  if (!match) return null;

  const color1 = getTeamColor(team1Name);
  const color2 = getTeamColor(team2Name);
  const short1 = getTeamShort(team1Name);
  const short2 = getTeamShort(team2Name);
  const emoji1 = getTeamEmoji(team1Name);
  const emoji2 = getTeamEmoji(team2Name);
  const logo1 = getTeamLogo(team1Name);
  const logo2 = getTeamLogo(team2Name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`ipl-live-card relative overflow-hidden rounded-3xl p-1 ${pulse ? "ipl-score-pulse" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${color1}40, #1a1a2e, ${color2}40)`,
      }}
    >
      <div className="relative rounded-[22px] bg-[#0d0d1a]/90 backdrop-blur-xl p-6 md:p-8 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-[100px] opacity-30" style={{ background: color1 }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-[100px] opacity-30" style={{ background: color2 }} />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              IPL 2026 • Match {match.matchNo || 27}
            </span>
          </div>
          {isLive ? (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 ipl-live-badge">
              <Circle className="w-2 h-2 fill-red-500 animate-pulse" /> LIVE
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400">
              <Trophy className="w-3 h-3" /> COMPLETED
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Clock className="w-3 h-3" /> {countdown || "TODAY"}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Team 1 */}
          <div className="flex-1 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center text-4xl md:text-5xl mb-3 border-2 overflow-hidden transition-transform hover:scale-110 bg-white/5" style={{ borderColor: color1 + "60" }}>
              <TeamLogo src={logo1} alt={short1} fallback={emoji1} className="w-full h-full object-contain p-2" />
            </div>
            <h3 className="font-black text-xl md:text-2xl" style={{ color: color1 }}>{short1}</h3>
            <p className="text-xs text-zinc-500 mt-1">{team1Name}</p>
            {scores[0] ? (
              <p className="mt-2 text-2xl md:text-3xl font-black text-white">
                {scores[0].r}/{scores[0].w}
                <span className="text-sm text-zinc-400 ml-1">({scores[0].o})</span>
              </p>
            ) : (isLive || countdownDone) ? (
              <p className="mt-2 text-sm text-zinc-500 animate-pulse">Awaiting scores...</p>
            ) : null}
          </div>

          {/* VS */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl md:text-3xl font-black text-zinc-600 ipl-vs-glow">VS</div>
            {!isLive && !isCompleted && countdown && (
              <div className="text-center">
                <p className="text-xs text-zinc-500">Starts in</p>
                <p className="text-lg font-bold text-amber-400 tabular-nums">{countdown}</p>
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center text-4xl md:text-5xl mb-3 border-2 overflow-hidden transition-transform hover:scale-110 bg-white/5" style={{ borderColor: color2 + "60" }}>
              <TeamLogo src={logo2} alt={short2} fallback={emoji2} className="w-full h-full object-contain p-2" />
            </div>
            <h3 className="font-black text-xl md:text-2xl" style={{ color: color2 }}>{short2}</h3>
            <p className="text-xs text-zinc-500 mt-1">{team2Name}</p>
            {scores[1] ? (
              <p className="mt-2 text-2xl md:text-3xl font-black text-white">
                {scores[1].r}/{scores[1].w}
                <span className="text-sm text-zinc-400 ml-1">({scores[1].o})</span>
              </p>
            ) : (isLive || countdownDone) ? (
              <p className="mt-2 text-sm text-zinc-500 animate-pulse">Awaiting scores...</p>
            ) : null}
          </div>
        </div>

        {/* Status / Result */}
        {match.status && (
          <div className="relative z-10 mt-6 text-center">
            <p className="text-sm font-semibold text-zinc-300 bg-white/5 rounded-xl px-4 py-2 inline-block border border-white/5">
              {match.status}
            </p>
          </div>
        )}

        {/* Venue */}
        <div className="relative z-10 mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <MapPin className="w-3 h-3" />
          <span>{match.venue || "TBA"}</span>
        </div>
      </div>
    </motion.div>
  );
}
