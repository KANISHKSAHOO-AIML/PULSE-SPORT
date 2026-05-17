"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus, Trophy, Users, MapPin, Calendar, Clock, Play, CheckCircle2,
  Trash2, Edit3, ChevronRight, Swords, X, Loader2, Shield
} from "lucide-react";

interface CustomMatch {
  id: string;
  user_id: string;
  match_name: string;
  sport: string;
  team_a: string;
  team_b: string;
  players_a: string[];
  players_b: string[];
  score_a: string;
  score_b: string;
  overs_a: string;
  overs_b: string;
  status: "upcoming" | "live" | "completed";
  toss_winner: string;
  toss_decision: string;
  result: string;
  venue: string;
  votes_a: number;
  votes_b: number;
  match_date: string;
  created_at: string;
}

export default function CustomMatchesPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [matches, setMatches] = useState<CustomMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [votedMatches, setVotedMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pulse_custom_votes");
      if (stored) setVotedMatches(JSON.parse(stored));
    } catch (e) {}
  }, []);

  // Form state
  const [form, setForm] = useState({
    match_name: "",
    team_a: "",
    team_b: "",
    venue: "",
    sport: "cricket",
    players_a: "",
    players_b: "",
  });

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch matches
  useEffect(() => {
    fetchMatches();
    const channel = supabase
      .channel("custom-matches-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "custom_matches" }, () => {
        fetchMatches();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("custom_matches")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMatches(data as CustomMatch[]);
    setLoading(false);
  };

  // Create match
  const handleCreate = async () => {
    if (!user) return;
    if (!form.match_name.trim() || !form.team_a.trim() || !form.team_b.trim()) return;

    setCreating(true);
    const playersA = form.players_a.split(",").map(p => p.trim()).filter(Boolean).map(name => ({
      name, runs: "", balls: "", fours: "", sixes: "", status: "Yet to bat"
    }));
    const playersB = form.players_b.split(",").map(p => p.trim()).filter(Boolean).map(name => ({
      name, runs: "", balls: "", fours: "", sixes: "", status: "Yet to bat"
    }));

    const { error } = await supabase.from("custom_matches").insert({
      user_id: user.id,
      match_name: form.match_name.trim(),
      team_a: form.team_a.trim(),
      team_b: form.team_b.trim(),
      venue: form.venue.trim(),
      sport: form.sport,
      players_a: playersA,
      players_b: playersB,
    });

    if (!error) {
      setShowCreate(false);
      setForm({ match_name: "", team_a: "", team_b: "", venue: "", sport: "cricket", players_a: "", players_b: "" });
      fetchMatches();
    }
    setCreating(false);
  };

  // Delete match
  const handleDelete = async (id: string) => {
    await supabase.from("custom_matches").delete().eq("id", id);
    setDeleteId(null);
    fetchMatches();
  };

  const filteredMatches = activeTab === "mine" ? matches.filter(m => m.user_id === user?.id) : matches;

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    upcoming: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
    live: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
    completed: { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400" },
  };

  return (
    <div className="min-h-screen bg-[#050510]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Swords className="w-5 h-5 text-white" />
              </div>
              Custom Matches
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Host & score your own local matches</p>
          </div>
          {user && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow"
            >
              <Plus className="w-4 h-4" /> Create Match
            </motion.button>
          )}
        </div>

        {/* ── Login Prompt ── */}
        {!authLoading && !user && (
          <div className="glass-card rounded-2xl border border-amber-500/20 p-8 text-center mb-8">
            <Shield className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Sign in to create matches</h3>
            <p className="text-sm text-zinc-400 mb-4">You can view existing matches, but need to sign in to create and manage your own.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 font-bold text-sm border border-amber-500/20 hover:bg-amber-500/20 transition-all">
              Sign In <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6">
          {(["all", "mine"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              {tab === "all" ? "All Matches" : "My Matches"}
            </button>
          ))}
        </div>

        {/* ── Matches List ── */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-zinc-500">Loading matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="glass-card rounded-2xl border border-white/5 p-12 text-center">
            <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-400 mb-1">No matches yet</h3>
            <p className="text-sm text-zinc-600">
              {activeTab === "mine" ? "You haven't created any matches yet." : "No custom matches have been created yet."}
            </p>
            {user && (
              <button onClick={() => setShowCreate(true)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">
                <Plus className="w-4 h-4" /> Create your first match
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMatches.map((match, i) => {
              const sc = statusColors[match.status] || statusColors.upcoming;
              const isOwner = user?.id === match.user_id;
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={`group glass-card rounded-2xl border ${match.status === "live" ? "border-red-500/30" : "border-white/5"} p-5 hover:border-white/10 hover:bg-white/[0.02] transition-all`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{match.match_name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
                          {match.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{match.venue}</span>}
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(match.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                          <span className="uppercase text-zinc-600">{match.sport}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text} border border-current/20`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${match.status === "live" ? "animate-pulse" : ""}`} />
                          {match.status}
                        </span>
                        {activeTab === "mine" && isOwner && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteId(match.id); }}
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="flex items-center justify-center gap-6 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-center min-w-[100px]">
                        <p className="text-sm font-black text-white">{match.team_a}</p>
                        <p className="text-lg font-mono font-bold text-amber-400 mt-0.5">
                          {match.score_a}{match.overs_a ? <span className="text-xs text-zinc-500 ml-1">({match.overs_a})</span> : null}
                        </p>
                      </div>
                      <span className="text-xs font-black text-zinc-700">VS</span>
                      <div className="text-center min-w-[100px]">
                        <p className="text-sm font-black text-white">{match.team_b}</p>
                        <p className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
                          {match.score_b}{match.overs_b ? <span className="text-xs text-zinc-500 ml-1">({match.overs_b})</span> : null}
                        </p>
                      </div>
                    </div>

                    {match.result && (
                      <p className="text-xs text-center text-green-400 font-bold mt-2">{match.result}</p>
                    )}

                    {/* Footer Actions */}
                    {activeTab === "all" ? (
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mx-auto">Fan War: Who will win?</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            disabled={!!votedMatches[match.id]}
                            onClick={async (e) => {
                              e.preventDefault(); e.stopPropagation();
                              if (votedMatches[match.id]) return;
                              const newVoted = { ...votedMatches, [match.id]: 'a' };
                              setVotedMatches(newVoted);
                              localStorage.setItem("pulse_custom_votes", JSON.stringify(newVoted));
                              setMatches(matches.map(m => m.id === match.id ? { ...m, votes_a: (m.votes_a || 0) + 1 } : m));
                              await supabase.rpc('increment_custom_vote', { match_id: match.id, team: 'a' });
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                              votedMatches[match.id] === 'a' ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400' 
                              : votedMatches[match.id] ? 'bg-white/5 border border-white/5 text-zinc-600 cursor-not-allowed'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 active:scale-95'
                            }`}
                          >
                            <span className="flex items-center gap-1">🔥 {match.team_a} {votedMatches[match.id] === 'a' && '✓'}</span>
                            <span className="text-[10px] opacity-70 font-mono">{match.votes_a || 0} votes</span>
                          </button>
                          <button 
                            disabled={!!votedMatches[match.id]}
                            onClick={async (e) => {
                              e.preventDefault(); e.stopPropagation();
                              if (votedMatches[match.id]) return;
                              const newVoted = { ...votedMatches, [match.id]: 'b' };
                              setVotedMatches(newVoted);
                              localStorage.setItem("pulse_custom_votes", JSON.stringify(newVoted));
                              setMatches(matches.map(m => m.id === match.id ? { ...m, votes_b: (m.votes_b || 0) + 1 } : m));
                              await supabase.rpc('increment_custom_vote', { match_id: match.id, team: 'b' });
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                              votedMatches[match.id] === 'b' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' 
                              : votedMatches[match.id] ? 'bg-white/5 border border-white/5 text-zinc-600 cursor-not-allowed'
                              : 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 active:scale-95'
                            }`}
                          >
                            <span className="flex items-center gap-1">⚡ {match.team_b} {votedMatches[match.id] === 'b' && '✓'}</span>
                            <span className="text-[10px] opacity-70 font-mono">{match.votes_b || 0} votes</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[10px] text-zinc-600">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(match.players_a?.length || 0) + (match.players_b?.length || 0)} players</span>
                        <Link href={`/custom-matches/${match.id}`} className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors">
                          <Edit3 className="w-3 h-3" /> Edit Match
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Delete Confirmation ── */}
        <AnimatePresence>
          {deleteId && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setDeleteId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card rounded-2xl border border-red-500/20 p-6 max-w-sm w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-white mb-2">Delete Match?</h3>
                <p className="text-sm text-zinc-400 mb-5">This action cannot be undone. All match data will be permanently removed.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl text-sm font-bold text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Cancel</button>
                  <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Create Match Modal ── */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-card rounded-2xl border border-amber-500/20 p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-amber-400" /> Create Custom Match
                  </h3>
                  <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Match Name */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Match Name *</label>
                    <input
                      value={form.match_name}
                      onChange={e => setForm({ ...form, match_name: e.target.value })}
                      placeholder="e.g. Sunday League Final"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  {/* Sport */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Sport</label>
                    <div className="flex gap-2">
                      {["cricket", "football", "other"].map(s => (
                        <button
                          key={s}
                          onClick={() => setForm({ ...form, sport: s })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${form.sport === s ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-zinc-500 border border-white/5 hover:border-white/10"}`}
                        >
                          {s === "cricket" ? "🏏" : s === "football" ? "⚽" : "🏆"} {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Team A *</label>
                      <input
                        value={form.team_a}
                        onChange={e => setForm({ ...form, team_a: e.target.value })}
                        placeholder="e.g. Thunder XI"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Team B *</label>
                      <input
                        value={form.team_b}
                        onChange={e => setForm({ ...form, team_b: e.target.value })}
                        placeholder="e.g. Storm Warriors"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Venue</label>
                    <input
                      value={form.venue}
                      onChange={e => setForm({ ...form, venue: e.target.value })}
                      placeholder="e.g. City Park Ground"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  {/* Players */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">{form.team_a || "Team A"} Players <span className="text-zinc-600">(comma separated)</span></label>
                    <textarea
                      value={form.players_a}
                      onChange={e => setForm({ ...form, players_a: e.target.value })}
                      placeholder="Player 1, Player 2, Player 3..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">{form.team_b || "Team B"} Players <span className="text-zinc-600">(comma separated)</span></label>
                    <textarea
                      value={form.players_b}
                      onChange={e => setForm({ ...form, players_b: e.target.value })}
                      placeholder="Player 1, Player 2, Player 3..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleCreate}
                    disabled={creating || !form.match_name.trim() || !form.team_a.trim() || !form.team_b.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Swords className="w-4 h-4" /> Create Match</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
