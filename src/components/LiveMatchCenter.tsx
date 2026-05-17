"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shield, Users, CheckCircle, XCircle, Clock, Zap, Star, Lock, Timer, Sparkles } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { scorePredictor, PREDICTOR_BADGES, type SquadPlayer, type PlayerLiveStat, type PredictorResult } from "@/lib/predictorEngine";

// ════════════════════════════════════════════════════════════════
// REAL DATA FUNCTIONS — Real IPL 2026 squads + CricAPI playing XI
// ════════════════════════════════════════════════════════════════

import { getTeamSquad } from "@/lib/iplSquads2026";

/** Fetch the full squad for a team (real IPL 2026 data) */
async function fetchTeamSquad(teamName: string): Promise<SquadPlayer[]> {
  const squad = getTeamSquad(teamName);
  if (squad.length > 0) {
    return squad.map((p, i) => ({
      id: `${teamName}-${i}`,
      name: p.name,
      role: p.role,
    }));
  }
  // Fallback: generic squad for non-IPL teams
  const roles: SquadPlayer["role"][] = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
  return Array.from({ length: 15 }, (_, i) => ({
    id: `${teamName}-${i}`,
    name: `Player ${i + 1}`,
    role: roles[i % 4],
  }));
}

/** Fetch the confirmed Playing 11 once the match starts (CricAPI + squad fallback) */
async function fetchActualPlaying11(matchId: string, teamName: string): Promise<string[]> {
  // Try CricAPI match_info for real playing XI
  try {
    const res = await fetch(`/api/ipl/playing11?matchId=${matchId}&team=${teamName}`);
    if (res.ok) {
      const data = await res.json();
      if (data.playing11 && data.playing11.length === 11) {
        return data.playing11;
      }
    }
  } catch {}

  // Fallback: first 11 from squad (capped players first for realism)
  const squad = getTeamSquad(teamName);
  if (squad.length >= 11) {
    // Prioritize capped players (more likely to play)
    const sorted = [...squad].sort((a, b) => {
      if (a.isCapped && !b.isCapped) return -1;
      if (!a.isCapped && b.isCapped) return 1;
      return 0;
    });
    // Ensure max 4 overseas players (IPL rule)
    const selected: typeof sorted = [];
    let overseasCount = 0;
    for (const p of sorted) {
      if (selected.length >= 11) break;
      if (p.isOverseas) {
        if (overseasCount < 4) { selected.push(p); overseasCount++; }
      } else {
        selected.push(p);
      }
    }
    return selected.map(p => p.name);
  }

  return squad.slice(0, 11).map(p => p.name);
}

/** Fetch live player stats (placeholder — wire to CricAPI) */
async function fetchLivePlayerStats(matchId: string): Promise<PlayerLiveStat[]> {
  return [];
}

/** localStorage key for predictions */
function predictionKey(matchId: string, team: string) {
  return `pulse_predict_${matchId}_${team}`;
}

/** Save prediction — localStorage always, Supabase when table exists */
async function savePrediction(userId: string, matchId: string, teamName: string, players: string[]) {
  // 1. Always save to localStorage (instant, reliable)
  try {
    localStorage.setItem(predictionKey(matchId, teamName), JSON.stringify({
      userId, players, savedAt: new Date().toISOString(),
    }));
  } catch {}

  // 2. Try Supabase as backup (may fail if table doesn't exist yet)
  try {
    await supabase.from("match_predictions").upsert({
      user_id: userId, match_id: matchId, team: teamName,
      predicted_players: players, created_at: new Date().toISOString(),
    }, { onConflict: "user_id,match_id,team" });
  } catch {}
}

/** Load existing prediction — try localStorage first, then Supabase */
async function loadPrediction(userId: string, matchId: string, teamName: string): Promise<string[] | null> {
  // 1. Check localStorage first (fastest)
  try {
    const stored = localStorage.getItem(predictionKey(matchId, teamName));
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.players && Array.isArray(parsed.players) && parsed.players.length > 0) {
        return parsed.players;
      }
    }
  } catch {}

  // 2. Fallback to Supabase
  try {
    const { data } = await supabase.from("match_predictions")
      .select("predicted_players").eq("user_id", userId).eq("match_id", matchId).eq("team", teamName).maybeSingle();
    if (data?.predicted_players) {
      // Sync to localStorage for future fast loads
      try {
        localStorage.setItem(predictionKey(matchId, teamName), JSON.stringify({
          userId, players: data.predicted_players, savedAt: new Date().toISOString(),
        }));
      } catch {}
      return data.predicted_players;
    }
  } catch {}

  return null;
}

/** Save selected team choice to localStorage */
function saveSelectedTeam(matchId: string, team: string) {
  try { localStorage.setItem(`pulse_predict_team_${matchId}`, team); } catch {}
}

/** Load selected team choice from localStorage */
function loadSelectedTeam(matchId: string): string | null {
  try { return localStorage.getItem(`pulse_predict_team_${matchId}`); } catch { return null; }
}

// ════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ════════════════════════════════════════════════════════════════

function CountdownTimer({ matchTime }: { matchTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = matchTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
      setIsUrgent(diff < 30 * 60 * 1000); // last 30 min
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [matchTime]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const totalSec = timeLeft.h * 3600 + timeLeft.m * 60 + timeLeft.s;

  if (totalSec <= 0) return (
    <div className="text-center">
      <p className="text-lg font-black text-green-400 animate-pulse">🏏 Match Starting Now!</p>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2">
      {[{ val: timeLeft.h, label: "HRS" }, { val: timeLeft.m, label: "MIN" }, { val: timeLeft.s, label: "SEC" }].map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2">
          <div className={`relative overflow-hidden rounded-xl px-3 py-2 min-w-[52px] text-center border ${
            isUrgent ? "bg-red-500/10 border-red-500/30" : "bg-white/[0.04] border-white/10"
          }`}>
            <motion.span
              key={unit.val}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`block text-2xl font-black tabular-nums ${isUrgent ? "text-red-400" : "text-white"}`}
            >
              {pad(unit.val)}
            </motion.span>
            <span className={`text-[8px] font-bold uppercase tracking-widest ${
              isUrgent ? "text-red-500/60" : "text-zinc-600"
            }`}>{unit.label}</span>
          </div>
          {i < 2 && <span className={`text-xl font-black ${isUrgent ? "text-red-500/40 animate-pulse" : "text-zinc-700"}`}>:</span>}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PREDICTION RECAP CARD (after locking prediction)
// ════════════════════════════════════════════════════════════════

function PredictionRecap({ picks, team, matchTime }: { picks: string[]; team: string; matchTime: Date }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-green-500/5 via-emerald-500/3 to-cyan-500/5 border border-green-500/20 rounded-2xl p-5 mb-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-green-400">Prediction Locked! ✅</p>
          <p className="text-[10px] text-zinc-500">Your {team} Playing 11 is saved</p>
        </div>
        <Sparkles className="w-4 h-4 text-amber-400" />
      </div>

      {/* Countdown to reveal */}
      <div className="bg-black/30 rounded-xl p-3 mb-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center mb-2 font-bold">⏱️ Reveal in</p>
        <CountdownTimer matchTime={matchTime} />
      </div>

      {/* Your picks grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
        {picks.slice(0, 11).map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white/[0.03] border border-white/5 rounded-lg px-2 py-1.5 text-center"
          >
            <div className="w-6 h-6 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 mb-0.5">
              {name.charAt(0)}
            </div>
            <p className="text-[9px] font-semibold text-zinc-300 truncate">{name.split(" ").pop()}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-zinc-600 text-center mt-3">When the match starts, your picks will be compared against the actual Playing 11</p>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
// TYPES & HELPERS
// ════════════════════════════════════════════════════════════════

type MatchState = "pre-match" | "reveal" | "live";

interface LiveMatchCenterProps {
  matchId: string;
  teamA: string;
  teamB: string;
  matchTime: Date;
  isLive: boolean;
  isCompleted: boolean;
}

function getMatchState(matchTime: Date, isLive: boolean): MatchState {
  const now = new Date();
  const diff = matchTime.getTime() - now.getTime();
  const oneHour = 60 * 60 * 1000;
  if (isLive) return "live";
  if (diff <= oneHour && diff > 0) return "pre-match";
  if (diff <= 0) return "live";
  return "pre-match";
}

// ════════════════════════════════════════════════════════════════
// ACHIEVEMENT MODAL
// ════════════════════════════════════════════════════════════════

function AchievementModal({ result, onClose }: { result: PredictorResult; onClose: () => void }) {
  const badge = result.badge;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="relative glass-depth-2 rounded-3xl p-8 max-w-md w-full text-center border border-white/10 overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Particle stars */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute text-yellow-400 pointer-events-none" style={{
            left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%`,
            animation: `starFloat ${1 + Math.random()}s ease-out ${Math.random() * 0.5}s forwards`,
            fontSize: `${10 + Math.random() * 14}px`,
          }}>✦</div>
        ))}

        {/* Score */}
        <div className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-bold">Your Score</p>
          <div className="score-count">
            <span className="text-6xl font-black text-white tabular-nums">{result.score}</span>
            <span className="text-2xl text-zinc-500 font-bold">/110</span>
          </div>
          <p className="text-sm text-zinc-400 mt-2">{result.correctCount} of 11 players correct</p>
        </div>

        {/* Badge */}
        {badge && (
          <div className="mb-6">
            <div className={`w-24 h-24 mx-auto rounded-full badge-reveal badge-burst bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4`}
              style={{ boxShadow: `0 0 40px ${badge.glowColor}` }}>
              <span className="text-4xl">{badge.icon}</span>
            </div>
            <div className="badge-shimmer rounded-full px-4 py-1 inline-block">
              <p className="text-lg font-black text-white">{badge.name}</p>
            </div>
            <p className="text-sm text-zinc-400 mt-2">{badge.description}</p>
          </div>
        )}

        {!badge && (
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3">
              <span className="text-3xl">🏏</span>
            </div>
            <p className="text-sm text-zinc-400">Keep trying! You need 50+ points for a badge.</p>
          </div>
        )}

        {/* Correct / Missed breakdown */}
        <div className="grid grid-cols-2 gap-3 text-left mb-6">
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-green-400 font-bold mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Correct
            </p>
            <div className="space-y-0.5">
              {result.correctPicks.length > 0 ? result.correctPicks.map(p => (
                <p key={p} className="text-xs text-green-300 truncate">{p}</p>
              )) : <p className="text-xs text-zinc-600">None</p>}
            </div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Missed
            </p>
            <div className="space-y-0.5">
              {result.missedPicks.length > 0 ? result.missedPicks.map(p => (
                <p key={p} className="text-xs text-red-300 truncate">{p}</p>
              )) : <p className="text-xs text-zinc-600">None</p>}
            </div>
          </div>
        </div>

        <button onClick={onClose}
          className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors">
          Continue to Live Match →
        </button>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
// SQUAD PICKER (Pre-Match State)
// ════════════════════════════════════════════════════════════════

function SquadPicker({ team, matchId, userId, onSubmitted }: {
  team: string; matchId: string; userId: string | null;
  onSubmitted: (picks: string[]) => void;
}) {
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [savedPicks, setSavedPicks] = useState<string[] | null>(null);

  useEffect(() => {
    fetchTeamSquad(team).then(s => { setSquad(s); setLoading(false); });
    // Load saved prediction (localStorage works even without login)
    const uid = userId || "anon";
    loadPrediction(uid, matchId, team).then(picks => {
      if (picks && picks.length > 0) {
        setSavedPicks(picks);
        setSelected(new Set(picks));
        setSubmitted(true);
        onSubmitted(picks); // sync parent state
      }
    });
  }, [team, matchId, userId]);

  const toggle = (name: string) => {
    if (submitted) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else if (next.size < 11) next.add(name);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size !== 11) return;
    const picks = Array.from(selected);
    setSubmitted(true); setSavedPicks(picks);
    await savePrediction(userId || "anon", matchId, team, picks);
    onSubmitted(picks);
  };

  const roleIcon: Record<string, string> = { Batsman: "🏏", Bowler: "🎳", "All-Rounder": "⚡", "Wicket-Keeper": "🧤" };

  if (loading) return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 bg-zinc-800/50 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" /> {team} Squad
        </h4>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          selected.size === 11 ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-500"
        }`}>{selected.size}/11 selected</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {squad.map(p => (
          <button key={p.id} onClick={() => toggle(p.name)} disabled={submitted}
            className={`player-pick-card flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left w-full ${
              selected.has(p.name)
                ? "selected border-cyan-500/50 bg-cyan-500/8"
                : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60"
            } ${submitted ? "opacity-70 cursor-default" : "cursor-pointer"}`}>
            <span className="text-base">{roleIcon[p.role] || "🏏"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{p.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{p.role}</p>
            </div>
            {selected.has(p.name) && <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />}
          </button>
        ))}
      </div>

      {!submitted && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleSubmit} disabled={selected.size !== 11}
          className="w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/20">
          🔒 Lock in My Predicted 11
        </motion.button>
      )}

      {submitted && (
        <div className="mt-3 flex items-center gap-2 text-green-400 text-xs font-bold bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          <CheckCircle className="w-4 h-4" /> Prediction locked! Awaiting match start for reveal.
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LIVE PLAYER GRID (Live State)
// ════════════════════════════════════════════════════════════════

function LivePlayerGrid({ matchId, players }: { matchId: string; players: string[] }) {
  const [stats, setStats] = useState<PlayerLiveStat[]>([]);

  useEffect(() => {
    const poll = async () => {
      const s = await fetchLivePlayerStats(matchId);
      if (s.length) setStats(s);
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [matchId]);

  return (
    <div>
      <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" /> Confirmed Playing 11
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {players.map((name, i) => {
          const stat = stats.find(s => s.name === name);
          return (
            <motion.div key={name} initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-depth-3 rounded-xl p-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-400 mb-2">
                {name.charAt(0)}
              </div>
              <p className="text-xs font-bold text-white truncate">{name}</p>
              {stat && (
                <div className="mt-1 text-[10px] text-zinc-500">
                  {stat.runs !== undefined && <span className="text-cyan-400">{stat.runs}({stat.balls})</span>}
                  {stat.wickets !== undefined && <span className="text-purple-400 ml-1">{stat.wickets}w</span>}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════

export default function LiveMatchCenter({ matchId, teamA, teamB, matchTime, isLive, isCompleted }: LiveMatchCenterProps) {
  const [user, setUser] = useState<any>(null);
  const [matchState, setMatchState] = useState<MatchState>(() => getMatchState(matchTime, isLive));
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [predictedPicks, setPredictedPicks] = useState<string[]>([]);
  const [actualPlaying11, setActualPlaying11] = useState<string[]>([]);
  const [scoringResult, setScoringResult] = useState<PredictorResult | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // Restore saved team selection & predictions from localStorage on mount
  useEffect(() => {
    const savedTeam = loadSelectedTeam(matchId);
    if (savedTeam && (savedTeam === teamA || savedTeam === teamB)) {
      setSelectedTeam(savedTeam);
      // Try to load prediction for the saved team
      const tryLoad = async () => {
        const userId = (await supabase.auth.getUser()).data.user?.id || "anon";
        const picks = await loadPrediction(userId, matchId, savedTeam);
        if (picks && picks.length > 0) {
          setPredictedPicks(picks);
        }
      };
      tryLoad();
    } else {
      setSelectedTeam(null);
    }
  }, [matchId, teamA, teamB]);

  // Update match state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMatchState(getMatchState(matchTime, isLive));
    }, 30000);
    return () => clearInterval(interval);
  }, [matchTime, isLive]);

  // Update if isLive prop changes
  useEffect(() => {
    if (isLive) setMatchState("live");
  }, [isLive]);

  // When entering live state — fetch actual 11, score prediction
  const handleReveal = useCallback(async () => {
    if (!selectedTeam || predictedPicks.length === 0 || revealDone) return;
    const actual = await fetchActualPlaying11(matchId, selectedTeam);
    setActualPlaying11(actual);
    const result = scorePredictor(predictedPicks, actual);
    setScoringResult(result);
    setShowAchievement(true);
    setRevealDone(true);

    if (user?.id) {
      try {
        // 1. Log XP
        await supabase.from("xp_log").insert({
          user_id: user.id,
          action: "prediction",
          xp_earned: result.points
        });

        // 2. Add Notification
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "prediction_result",
          title: "Prediction Results Are In!",
          body: `You scored ${result.points} points for your ${selectedTeam} Playing 11 prediction!`,
          icon: "🎯",
          href: `/ipl`,
          read: false
        });

        // 3. Insert into general 'predictions' table for profile view
        await supabase.from("predictions").insert({
          user_id: user.id,
          match_id: matchId,
          predicted_winner: selectedTeam,
          is_correct: result.accuracy === 100,
          points_earned: result.points
        });

        // 4. Update specific 'match_predictions'
        await supabase.from("match_predictions").update({
          score: result.points,
          badge: result.badge?.id || null
        }).eq("user_id", user.id).eq("match_id", matchId).eq("team", selectedTeam);

        // 5. Add Badge if unlocked
        if (result.badge) {
          await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_id: result.badge.id
          });
          await supabase.from("notifications").insert({
            user_id: user.id,
            type: "badge_earned",
            title: `Badge Unlocked: ${result.badge.name}!`,
            body: `You earned a new badge for your stellar prediction!`,
            icon: result.badge.icon,
            href: `/profile`,
            read: false
          });
        }
      } catch (err) {
        console.error("Failed to save gamification stats:", err);
      }
    }
  }, [selectedTeam, predictedPicks, matchId, revealDone, user?.id]);

  // Auto-trigger reveal when switching to live
  useEffect(() => {
    if (matchState === "live" && predictedPicks.length > 0 && !revealDone) {
      handleReveal();
    }
  }, [matchState, handleReveal, predictedPicks.length, revealDone]);

  // Fetch actual 11 when going live without prediction
  useEffect(() => {
    if (matchState === "live" && selectedTeam && predictedPicks.length === 0 && actualPlaying11.length === 0) {
      fetchActualPlaying11(matchId, selectedTeam).then(setActualPlaying11);
    }
  }, [matchState, selectedTeam, matchId, predictedPicks.length, actualPlaying11.length]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }} className="glass-depth-2 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="relative p-5 pb-4 border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
        <div className="relative flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            {matchState === "pre-match" ? "Playing 11 Predictor" : matchState === "reveal" ? "Reveal Time!" : "Live Match Center"}
          </h3>
          {matchState === "pre-match" && (
            <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Match starting soon
            </span>
          )}
          {matchState === "live" && (
            <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-1 rounded-full font-bold animate-pulse flex items-center gap-1">
              <Zap className="w-3 h-3" /> LIVE
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <AnimatePresence mode="wait">

          {/* ─── STATE 1: Pre-Match Predictor ─── */}
          {matchState === "pre-match" && (
            <motion.div key="pre-match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Show recap if prediction already locked */}
              {predictedPicks.length > 0 && selectedTeam ? (
                <PredictionRecap picks={predictedPicks} team={selectedTeam} matchTime={matchTime} />
              ) : (
                /* Banner with countdown */
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-5 text-center">
                  <p className="text-lg font-black text-white mb-2">🏟️ Match About to Begin!</p>
                  <CountdownTimer matchTime={matchTime} />
                  <p className="text-xs text-zinc-400 mt-3">Pick your Predicted Playing 11 and earn points when the actual team is announced.</p>
                </div>
              )}

              {!user ? (
                <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <Lock className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400 mb-3">Log in to predict your Playing 11</p>
                  <a href="/login" className="inline-block bg-white text-black font-bold py-2 px-6 rounded-xl text-sm hover:bg-zinc-200 transition-colors">
                    Log In
                  </a>
                </div>
              ) : !selectedTeam ? (
                <div className="text-center py-6">
                  <p className="text-sm text-zinc-400 mb-4 flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" /> Which team's 11 do you want to predict?
                  </p>
                  <div className="flex gap-3 justify-center">
                    {[teamA, teamB].map(t => (
                      <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedTeam(t); saveSelectedTeam(matchId, t); }}
                        className="px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-cyan-500/40 hover:bg-cyan-500/5 text-white font-bold text-sm transition-all">
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <SquadPicker team={selectedTeam} matchId={matchId} userId={user?.id}
                  onSubmitted={picks => setPredictedPicks(picks)} />
              )}
            </motion.div>
          )}

          {/* ─── STATE 3: Live Match Tracking ─── */}
          {matchState === "live" && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Score summary if prediction was made */}
              {scoringResult && !showAchievement && (
                <div className="mb-4 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  {scoringResult.badge && <span className="text-2xl">{scoringResult.badge.icon}</span>}
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Your Predictor Score</p>
                    <p className="text-lg font-black text-white">{scoringResult.score}<span className="text-zinc-600 text-sm">/110</span></p>
                  </div>
                  {scoringResult.badge && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-gradient-to-r ${scoringResult.badge.color} text-black`}>
                      {scoringResult.badge.name}
                    </span>
                  )}
                </div>
              )}

              {/* If no team selected for prediction, let them pick to view */}
              {!selectedTeam ? (
                <div className="text-center py-4 mb-4">
                  <p className="text-sm text-zinc-400 mb-3">Select a team to view Playing 11</p>
                  <div className="flex gap-3 justify-center">
                    {[teamA, teamB].map(t => (
                      <button key={t} onClick={() => { setSelectedTeam(t); }}
                        className="px-5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold text-sm hover:border-cyan-500/40 transition-all">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : actualPlaying11.length > 0 ? (
                <LivePlayerGrid matchId={matchId} players={actualPlaying11} />
              ) : (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading confirmed Playing 11...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Achievement Modal Overlay */}
      <AnimatePresence>
        {showAchievement && scoringResult && (
          <AchievementModal result={scoringResult} onClose={() => setShowAchievement(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
