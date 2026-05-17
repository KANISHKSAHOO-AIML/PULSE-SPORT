"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, MapPin, Clock, Trophy, Zap, MessageCircle, Flame, ThumbsUp, ThumbsDown, Users, Megaphone } from "lucide-react";
import { IPL_TEAMS } from "@/lib/iplTeams";
import Link from "next/link";
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

  // Match scores to the correct teams based on the inning string
  let score1 = null;
  let score2 = null;

  if (scores.length > 0) {
    score1 = scores.find((s: any) => s.inning && s.inning.includes(team1Name)) || (scores.length === 2 ? scores[0] : null);
    score2 = scores.find((s: any) => s.inning && s.inning.includes(team2Name)) || (scores.length === 2 ? scores[1] : null);
    
    // If we couldn't match by name but we have 1 score, assume it belongs to whoever is batting (CricAPI usually puts the batting first team at index 0)
    if (!score1 && !score2 && scores.length === 1) {
      if (scores[0].inning && scores[0].inning.includes(team2Name)) {
        score2 = scores[0];
      } else {
        score1 = scores[0];
      }
    }
  }

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
    const interval = setInterval(pollForScores, 120000); // Poll every 2 minutes
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
            {score1 ? (
              <p className="mt-2 text-2xl md:text-3xl font-black text-white">
                {score1.r}/{score1.w}
                <span className="text-sm text-zinc-400 ml-1">({score1.o})</span>
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
            {score2 ? (
              <p className="mt-2 text-2xl md:text-3xl font-black text-white">
                {score2.r}/{score2.w}
                <span className="text-sm text-zinc-400 ml-1">({score2.o})</span>
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

        {/* ═══ FAN SPACE — Quick Reactions & Live Poll ═══ */}
        <div className="relative z-10 mt-5 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fan Space</span>
          </div>

          {/* Quick Reactions */}
          <FanReactions matchId={match.id} />

          {/* Live Fan Poll — Who will win? */}
          <FanPoll team1={team1Name} team2={team2Name} short1={short1} short2={short2} color1={color1} color2={color2} />
        </div>

        {/* ═══ DEBATE — Hot Take Voting ═══ */}
        <div className="relative z-10 mt-4 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Let&apos;s Debate</span>
          </div>
          <DebateWidget team1={short1} team2={short2} isLive={!!isLive} />
        </div>

        {/* Action Links */}
        <div className="relative z-10 mt-4 flex items-center justify-center gap-3 flex-wrap">
          {/* Predict 11 CTA — most prominent */}
          {!isLive && !isCompleted && (
            <Link href={`/matches/${match.id}`} className="flex items-center gap-1.5 text-xs font-bold text-black hover:text-black transition-all bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02]">
              <Trophy className="w-3.5 h-3.5" /> Predict Playing 11
            </Link>
          )}
          <Link href={`/matches/${match.id}`} className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/15 px-4 py-2 rounded-xl border border-purple-500/20">
            <MessageCircle className="w-3.5 h-3.5" /> Fan Space
          </Link>
          <Link href={`/matches/${match.id}`} className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/15 px-4 py-2 rounded-xl border border-amber-500/20">
            <Megaphone className="w-3.5 h-3.5" /> Full Debate
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAN REACTIONS — Emoji quick-reaction buttons
   ═══════════════════════════════════════════════════════════════ */
function FanReactions({ matchId }: { matchId: string }) {
  const reactions = [
    { emoji: "🔥", label: "Fire" },
    { emoji: "😱", label: "Shocked" },
    { emoji: "🎉", label: "Celebrate" },
    { emoji: "😤", label: "Angry" },
    { emoji: "👏", label: "Clap" },
    { emoji: "💔", label: "Heartbreak" },
  ];
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    reactions.forEach(r => init[r.emoji] = Math.floor(Math.random() * 80) + 5);
    return init;
  });
  const [reacted, setReacted] = useState<string | null>(null);

  const handleReact = (emoji: string) => {
    if (reacted === emoji) return;
    setCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setReacted(emoji);
  };

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {reactions.map(r => (
        <button
          key={r.emoji}
          onClick={() => handleReact(r.emoji)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            reacted === r.emoji
              ? "bg-white/10 border border-white/20 scale-105"
              : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:scale-105"
          }`}
          title={r.label}
        >
          <span className="text-sm">{r.emoji}</span>
          <span className="text-zinc-400 tabular-nums text-[10px]">{counts[r.emoji]}</span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAN POLL — Who will win?
   ═══════════════════════════════════════════════════════════════ */
function FanPoll({ team1, team2, short1, short2, color1, color2 }: {
  team1: string; team2: string; short1: string; short2: string; color1: string; color2: string;
}) {
  const [votes, setVotes] = useState({ a: Math.floor(Math.random() * 300) + 100, b: Math.floor(Math.random() * 300) + 100 });
  const [voted, setVoted] = useState<"a" | "b" | null>(null);
  const total = votes.a + votes.b;
  const pctA = total > 0 ? Math.round((votes.a / total) * 100) : 50;
  const pctB = 100 - pctA;

  const handleVote = (team: "a" | "b") => {
    if (voted) return;
    setVotes(prev => ({ ...prev, [team]: prev[team] + 1 }));
    setVoted(team);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 text-center">
        🗳️ Who wins today?
      </p>
      <div className="flex gap-2">
        <button onClick={() => handleVote("a")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all ${voted === "a" ? "ring-2 ring-white/30 scale-[1.02]" : "hover:scale-[1.02]"}`} style={{ background: `${color1}20`, borderColor: `${color1}30`, border: "1px solid" }}>
          <span style={{ color: color1 }}>{short1}</span>
          {voted && <span className="block text-[10px] text-zinc-400 mt-1 tabular-nums">{pctA}%</span>}
        </button>
        <button onClick={() => handleVote("b")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all ${voted === "b" ? "ring-2 ring-white/30 scale-[1.02]" : "hover:scale-[1.02]"}`} style={{ background: `${color2}20`, borderColor: `${color2}30`, border: "1px solid" }}>
          <span style={{ color: color2 }}>{short2}</span>
          {voted && <span className="block text-[10px] text-zinc-400 mt-1 tabular-nums">{pctB}%</span>}
        </button>
      </div>
      {voted && (
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className="mt-2 h-1.5 rounded-full overflow-hidden bg-zinc-800 flex">
          <div className="h-full transition-all duration-700" style={{ width: `${pctA}%`, background: color1 }} />
          <div className="h-full transition-all duration-700" style={{ width: `${pctB}%`, background: color2 }} />
        </motion.div>
      )}
      <p className="text-[9px] text-zinc-600 text-center mt-1.5 tabular-nums">{total.toLocaleString()} fans voted</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DEBATE WIDGET — Hot take with agree/disagree
   ═══════════════════════════════════════════════════════════════ */
const HOT_TAKES_LIVE = [
  "The chasing team has the edge tonight 🏏",
  "This pitch will favor the spinners 🌀",
  "We'll see a 200+ total today 💥",
  "The toss winner will win this match 🪙",
  "Expect a super over tonight! ⚡",
];

const HOT_TAKES_PRE = [
  "The team batting first will dominate 🏏",
  "This will be decided in the powerplay ⚡",
  "Today's match will go down to the wire 🔥",
  "The underdog has a real chance today 💪",
  "We'll see a century today 💯",
];

function DebateWidget({ team1, team2, isLive }: { team1: string; team2: string; isLive: boolean }) {
  const takes = isLive ? HOT_TAKES_LIVE : HOT_TAKES_PRE;
  const [takeIndex] = useState(() => Math.floor(Math.random() * takes.length));
  const [agree, setAgree] = useState(Math.floor(Math.random() * 200) + 50);
  const [disagree, setDisagree] = useState(Math.floor(Math.random() * 200) + 50);
  const [myVote, setMyVote] = useState<"agree" | "disagree" | null>(null);

  const total = agree + disagree;
  const agreePct = total > 0 ? Math.round((agree / total) * 100) : 50;

  const handleVote = (vote: "agree" | "disagree") => {
    if (myVote) return;
    if (vote === "agree") setAgree(p => p + 1);
    else setDisagree(p => p + 1);
    setMyVote(vote);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <p className="text-sm font-bold text-zinc-200 mb-3 leading-snug">
        &ldquo;{takes[takeIndex]}&rdquo;
      </p>
      <div className="flex gap-2">
        <button onClick={() => handleVote("agree")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${myVote === "agree" ? "bg-green-500/20 border-green-500/40 text-green-400 scale-[1.02]" : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-green-400 hover:bg-green-500/10"} border`}>
          <ThumbsUp className="w-3.5 h-3.5" /> Agree {myVote && <span className="tabular-nums text-[10px]">({agreePct}%)</span>}
        </button>
        <button onClick={() => handleVote("disagree")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${myVote === "disagree" ? "bg-red-500/20 border-red-500/40 text-red-400 scale-[1.02]" : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"} border`}>
          <ThumbsDown className="w-3.5 h-3.5" /> Disagree {myVote && <span className="tabular-nums text-[10px]">({100 - agreePct}%)</span>}
        </button>
      </div>
      {myVote && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 h-1.5 rounded-full overflow-hidden bg-zinc-800 flex">
          <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${agreePct}%` }} />
          <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${100 - agreePct}%` }} />
        </motion.div>
      )}
      <p className="text-[9px] text-zinc-600 text-center mt-1.5 tabular-nums">{total.toLocaleString()} fans debating</p>
    </div>
  );
}
