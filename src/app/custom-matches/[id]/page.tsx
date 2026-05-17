"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft, Save, Play, CheckCircle2, Users, MapPin, Clock,
  Edit3, Trophy, Loader2, AlertCircle, Trash2
} from "lucide-react";

export interface CustomPlayer {
  name: string;
  runs?: string;
  balls?: string;
  fours?: string;
  sixes?: string;
  status?: string;
}

interface CustomMatch {
  id: string;
  user_id: string;
  match_name: string;
  sport: string;
  team_a: string;
  team_b: string;
  players_a: any[];
  players_b: any[];
  score_a: string;
  score_b: string;
  overs_a: string;
  overs_b: string;
  status: "upcoming" | "live" | "completed";
  toss_winner: string;
  toss_decision: string;
  result: string;
  venue: string;
  match_date: string;
  created_at: string;
}

export default function CustomMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<any>(null);
  const [match, setMatch] = useState<CustomMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  // Edit form
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [oversA, setOversA] = useState("");
  const [oversB, setOversB] = useState("");
  const [status, setStatus] = useState<"upcoming" | "live" | "completed">("upcoming");
  const [result, setResult] = useState("");
  const [tossWinner, setTossWinner] = useState("");
  const [tossDecision, setTossDecision] = useState("");
  const [playersA, setPlayersA] = useState<CustomPlayer[]>([]);
  const [playersB, setPlayersB] = useState<CustomPlayer[]>([]);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch match
  useEffect(() => {
    const fetchMatch = async () => {
      const { data } = await supabase.from("custom_matches").select("*").eq("id", id).single();
      if (data) {
        const m = data as CustomMatch;
        setMatch(m);
        setScoreA(m.score_a || "");
        setScoreB(m.score_b || "");
        setOversA(m.overs_a || "");
        setOversB(m.overs_b || "");
        setStatus(m.status);
        setResult(m.result || "");
        setTossWinner(m.toss_winner || "");
        setTossDecision(m.toss_decision || "");
        const parsePlayers = (arr: any[]): CustomPlayer[] => {
          if (!arr) return [];
          return arr.map(p => typeof p === "string" ? { name: p, runs: "", balls: "", fours: "", sixes: "", status: "Not Out" } : p);
        };
        setPlayersA(parsePlayers(m.players_a));
        setPlayersB(parsePlayers(m.players_b));
      }
      setLoading(false);
    };
    fetchMatch();

    // Real-time updates
    const channel = supabase
      .channel(`custom-match-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "custom_matches", filter: `id=eq.${id}` }, (payload) => {
        const m = payload.new as CustomMatch;
        setMatch(m);
        if (!editMode) {
          setScoreA(m.score_a || "");
          setScoreB(m.score_b || "");
          setOversA(m.overs_a || "");
          setOversB(m.overs_b || "");
          setStatus(m.status);
          setResult(m.result || "");
          const parsePlayers = (arr: any[]): CustomPlayer[] => {
            if (!arr) return [];
            return arr.map(p => typeof p === "string" ? { name: p, runs: "", balls: "", fours: "", sixes: "", status: "Not Out" } : p);
          };
          setPlayersA(parsePlayers(m.players_a));
          setPlayersB(parsePlayers(m.players_b));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, editMode]);

  const isOwner = user?.id === match?.user_id;

  // Save score update
  const handleSave = async () => {
    if (!match) return;
    setSaving(true);
    await supabase.from("custom_matches").update({
      score_a: scoreA,
      score_b: scoreB,
      overs_a: oversA,
      overs_b: oversB,
      status,
      result,
      toss_winner: tossWinner,
      toss_decision: tossDecision,
      players_a: playersA,
      players_b: playersB,
      updated_at: new Date().toISOString(),
    }).eq("id", match.id);
    setSaving(false);
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Quick status change
  const handleStatusChange = async (newStatus: "upcoming" | "live" | "completed") => {
    if (!match) return;
    setStatus(newStatus);
    await supabase.from("custom_matches").update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", match.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#050510]">
        <Header />
        <div className="max-w-3xl mx-auto px-4 pt-24 text-center">
          <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Match Not Found</h2>
          <Link href="/custom-matches" className="text-sm text-amber-400 hover:text-amber-300">← Back to Custom Matches</Link>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    upcoming: { label: "Upcoming", color: "text-blue-400", icon: Clock },
    live: { label: "LIVE", color: "text-red-400", icon: Play },
    completed: { label: "Completed", color: "text-green-400", icon: CheckCircle2 },
  };
  const sc = statusConfig[match.status] || statusConfig.upcoming;

  return (
    <div className="min-h-screen bg-[#050510]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">

        {/* Back */}
        <Link href="/custom-matches" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Custom Matches
        </Link>

        {/* Match Header Card */}
        <div className={`glass-card rounded-2xl border ${match.status === "live" ? "border-red-500/30" : "border-white/5"} overflow-hidden mb-6`}>
          {/* Title Bar */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white">{match.match_name}</h1>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
                {match.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.venue}</span>}
                <span className="uppercase">{match.sport}</span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              match.status === "live" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
              match.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
              "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${match.status === "live" ? "bg-red-400 animate-pulse" : match.status === "completed" ? "bg-green-400" : "bg-blue-400"}`} />
              {sc.label}
            </span>
          </div>

          {/* Scoreboard */}
          <div className="p-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center flex-1">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-black text-amber-400">{match.team_a.charAt(0)}</span>
                </div>
                <p className="text-lg font-black text-white">{match.team_a}</p>
                <p className="text-2xl font-mono font-black text-amber-400 mt-1">{match.score_a || "—"}</p>
                {match.overs_a && <p className="text-xs text-zinc-500">({match.overs_a} ov)</p>}
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-zinc-700 mb-1">VS</p>
                {match.toss_winner && (
                  <p className="text-[9px] text-zinc-600">Toss: {match.toss_winner}<br />{match.toss_decision}</p>
                )}
              </div>
              <div className="text-center flex-1">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-black text-cyan-400">{match.team_b.charAt(0)}</span>
                </div>
                <p className="text-lg font-black text-white">{match.team_b}</p>
                <p className="text-2xl font-mono font-black text-cyan-400 mt-1">{match.score_b || "—"}</p>
                {match.overs_b && <p className="text-xs text-zinc-500">({match.overs_b} ov)</p>}
              </div>
            </div>
            {match.result && (
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-green-400 bg-green-500/5 border border-green-500/15 rounded-xl py-2 px-4 inline-block">
                  🏆 {match.result}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Owner Controls ── */}
        {isOwner && (
          <div className="glass-card rounded-2xl border border-amber-500/15 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Match Controls
              </h3>
              {saved && <span className="text-xs text-green-400 font-bold">✓ Saved!</span>}
            </div>

            {/* Quick Status */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Match Status</label>
              <div className="flex gap-2">
                {(["upcoming", "live", "completed"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      status === s
                        ? s === "live" ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : s === "completed" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-white/5 text-zinc-500 border border-white/5 hover:border-white/10"
                    }`}
                  >
                    {s === "live" ? "🔴 Live" : s === "completed" ? "✅ Completed" : "📅 Upcoming"}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Update */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">{match.team_a} Score</label>
                <div className="flex gap-2">
                  <input value={scoreA} onChange={e => setScoreA(e.target.value)} placeholder="e.g. 185/6"
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50" />
                  <input value={oversA} onChange={e => setOversA(e.target.value)} placeholder="Overs"
                    className="w-20 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">{match.team_b} Score</label>
                <div className="flex gap-2">
                  <input value={scoreB} onChange={e => setScoreB(e.target.value)} placeholder="e.g. 172/8"
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50" />
                  <input value={oversB} onChange={e => setOversB(e.target.value)} placeholder="Overs"
                    className="w-20 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
            </div>

            {/* Toss */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Toss Winner</label>
                <select value={tossWinner} onChange={e => setTossWinner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none">
                  <option value="" className="bg-zinc-900">—</option>
                  <option value={match.team_a} className="bg-zinc-900">{match.team_a}</option>
                  <option value={match.team_b} className="bg-zinc-900">{match.team_b}</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Elected to</label>
                <select value={tossDecision} onChange={e => setTossDecision(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none">
                  <option value="" className="bg-zinc-900">—</option>
                  <option value="bat" className="bg-zinc-900">Bat First</option>
                  <option value="bowl" className="bg-zinc-900">Bowl First</option>
                </select>
              </div>
            </div>

            {/* Result */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Result</label>
              <input value={result} onChange={e => setResult(e.target.value)} placeholder="e.g. Thunder XI won by 25 runs"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50" />
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        )}

        {/* ── Players ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { team: match.team_a, players: playersA, color: "amber", setPlayers: setPlayersA },
            { team: match.team_b, players: playersB, color: "cyan", setPlayers: setPlayersB }
          ].map(({ team, players, color, setPlayers }) => (
            <div key={team} className="glass-card rounded-2xl border border-white/5 p-5">
              <h4 className={`text-sm font-bold ${color === "amber" ? "text-amber-400" : "text-cyan-400"} flex items-center gap-2 mb-3`}>
                <Users className="w-4 h-4" /> {team}
                <span className="text-[10px] text-zinc-600 font-normal ml-auto">{players?.length || 0} players</span>
              </h4>
              {players && players.length > 0 ? (
                <div className="space-y-1.5">
                  {players.map((p: CustomPlayer, i: number) => (
                    <div key={i} className="flex flex-col gap-2 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full ${color === "amber" ? "bg-amber-500/10 text-amber-400" : "bg-cyan-500/10 text-cyan-400"} flex items-center justify-center text-[9px] font-bold shrink-0`}>{i + 1}</span>
                        <span className="font-bold text-white">{p.name}</span>
                      </div>
                      
                      {isOwner ? (
                        <div className="grid grid-cols-5 gap-1.5 ml-7">
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase block mb-0.5">Runs</span>
                            <input
                              value={p.runs || ""}
                              onChange={(e) => { const newPlayers = [...players]; newPlayers[i] = { ...p, runs: e.target.value }; setPlayers(newPlayers); }}
                              placeholder="0"
                              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-2 py-1.5 text-center text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase block mb-0.5">Balls</span>
                            <input
                              value={p.balls || ""}
                              onChange={(e) => { const newPlayers = [...players]; newPlayers[i] = { ...p, balls: e.target.value }; setPlayers(newPlayers); }}
                              placeholder="0"
                              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-2 py-1.5 text-center text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase block mb-0.5">4s</span>
                            <input
                              value={p.fours || ""}
                              onChange={(e) => { const newPlayers = [...players]; newPlayers[i] = { ...p, fours: e.target.value }; setPlayers(newPlayers); }}
                              placeholder="0"
                              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-2 py-1.5 text-center text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase block mb-0.5">6s</span>
                            <input
                              value={p.sixes || ""}
                              onChange={(e) => { const newPlayers = [...players]; newPlayers[i] = { ...p, sixes: e.target.value }; setPlayers(newPlayers); }}
                              placeholder="0"
                              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-2 py-1.5 text-center text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase block mb-0.5">Status</span>
                            <select
                              value={p.status || "Yet to bat"}
                              onChange={(e) => { const newPlayers = [...players]; newPlayers[i] = { ...p, status: e.target.value }; setPlayers(newPlayers); }}
                              className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-lg px-1 py-1.5 text-center text-white text-[10px] focus:outline-none appearance-none"
                            >
                              <option value="Not Out" className="bg-zinc-900">Not Out</option>
                              <option value="Out" className="bg-zinc-900">Out</option>
                              <option value="Yet to bat" className="bg-zinc-900">Yet to bat</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        (p.runs || p.balls) && (
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 pl-7 mt-0.5">
                            <div className="flex gap-3">
                              <span><strong className="text-white text-sm">{p.runs || 0}</strong> ({p.balls || 0})</span>
                              <span className="mt-0.5">4s: {p.fours || 0}</span>
                              <span className="mt-0.5">6s: {p.sixes || 0}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full border ${p.status === 'Out' ? 'bg-red-500/10 text-red-400 border-red-500/20' : p.status === 'Yet to bat' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                              {p.status || "Yet to bat"}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600 text-center py-4">No players added</p>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

