"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Trophy, Target, TrendingUp, Flame, Star, Shield,
  BarChart3, MessageSquare, Heart, Calendar, Edit3, Check,
  X, ChevronRight, Award, Zap, Crown, Medal
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   FAN LEVEL DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const FAN_LEVELS: Record<number, { name: string; icon: string; color: string; gradient: string; minXP: number }> = {
  1: { name: "Rookie", icon: "🌱", color: "text-zinc-400", gradient: "from-zinc-600 to-zinc-400", minXP: 0 },
  2: { name: "Rising Star", icon: "⭐", color: "text-blue-400", gradient: "from-blue-600 to-blue-400", minXP: 100 },
  3: { name: "Match Regular", icon: "🏟️", color: "text-green-400", gradient: "from-green-600 to-green-400", minXP: 300 },
  4: { name: "Super Fan", icon: "🔥", color: "text-orange-400", gradient: "from-orange-600 to-orange-400", minXP: 700 },
  5: { name: "Legend", icon: "👑", color: "text-purple-400", gradient: "from-purple-600 to-purple-400", minXP: 1500 },
  6: { name: "Hall of Famer", icon: "🏆", color: "text-yellow-400", gradient: "from-yellow-500 to-amber-400", minXP: 3000 },
};

function getNextLevelXP(level: number): number {
  const next = FAN_LEVELS[level + 1];
  return next ? next.minXP : FAN_LEVELS[6].minXP;
}

/* ═══════════════════════════════════════════════════════════════
   BADGE DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const BADGE_DEFS: Record<string, { name: string; icon: string; desc: string; color: string }> = {
  first_prediction: { name: "Oracle", icon: "🔮", desc: "Made your first prediction", color: "text-purple-400" },
  streak_3: { name: "Hot Streak", icon: "🔥", desc: "3 correct predictions in a row", color: "text-orange-400" },
  streak_5: { name: "On Fire", icon: "💥", desc: "5 correct predictions in a row", color: "text-red-400" },
  streak_10: { name: "Unstoppable", icon: "⚡", desc: "10 correct predictions in a row", color: "text-yellow-400" },
  predictions_10: { name: "Analyst", icon: "📊", desc: "Made 10 predictions", color: "text-blue-400" },
  predictions_50: { name: "Expert", icon: "🧠", desc: "Made 50 predictions", color: "text-cyan-400" },
  first_comment: { name: "Voice", icon: "💬", desc: "Posted your first comment", color: "text-green-400" },
  comments_25: { name: "Debater", icon: "🗣️", desc: "Posted 25 comments", color: "text-emerald-400" },
  accuracy_80: { name: "Sharp Eye", icon: "🎯", desc: "80%+ prediction accuracy", color: "text-pink-400" },
  early_adopter: { name: "Pioneer", icon: "🚀", desc: "Joined PulseSports early", color: "text-indigo-400" },
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "predictions" | "activity" | "badges">("overview");

  // Editable fields
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editFavTeam, setEditFavTeam] = useState("");
  const [editFavSport, setEditFavSport] = useState("cricket");

  // Data
  const [stats, setStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [xpLog, setXpLog] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      // Fetch profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile(prof);
        setEditBio(prof.bio || "");
        setEditFavTeam(prof.favorite_team || "");
        setEditFavSport(prof.favorite_sport || "cricket");
      }

      // Fetch stats via RPC (falls back gracefully)
      try {
        const { data: s } = await supabase.rpc("get_user_stats", { p_user_id: user.id });
        if (s) setStats(s);
      } catch {
        // Function may not exist yet — use fallback
        setStats({ total_predictions: 0, correct_predictions: 0, pending_predictions: 0, total_comments: 0, total_match_thoughts: 0, total_points: 0, prediction_streak: 0, longest_streak: 0, badges_count: 0, following_count: 0 });
      }

      // Fetch predictions
      const { data: preds } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (preds) setPredictions(preds);

      // Fetch badges
      const { data: bdg } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id);
      if (bdg) setBadges(bdg);

      // Fetch recent comments
      const { data: cmts } = await supabase
        .from("comments")
        .select("id, content, entity_type, entity_id, created_at, likes_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (cmts) setRecentComments(cmts);

      // Fetch XP log
      try {
        const { data: xpData } = await supabase
          .from("xp_log")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(15);
        if (xpData) setXpLog(xpData);
      } catch {
        // xp_log table may not exist yet
      }

      setLoading(false);
    };
    load();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      bio: editBio,
      favorite_team: editFavTeam,
      favorite_sport: editFavSport,
    }).eq("id", user.id);
    setProfile((p: any) => ({ ...p, bio: editBio, favorite_team: editFavTeam, favorite_sport: editFavSport }));
    setEditing(false);
  };

  const accuracy = stats?.total_predictions > 0
    ? Math.round((stats.correct_predictions / (stats.total_predictions - (stats.pending_predictions || 0))) * 100) || 0
    : 0;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-zinc-800 rounded-2xl" />
          <div className="h-8 w-48 bg-zinc-800 rounded" />
          <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-zinc-800 rounded-xl" />)}</div>
        </div>
      </div>
    </div>
  );

  const TABS = [
    { key: "overview" as const, label: "Overview", icon: BarChart3 },
    { key: "predictions" as const, label: "Predictions", icon: Target },
    { key: "activity" as const, label: "Activity", icon: MessageSquare },
    { key: "badges" as const, label: "Badges", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <Header />

      {/* Profile Header */}
      <section className="relative overflow-hidden">
        <div className="hero-aurora"><div className="hero-aurora-extra" /></div>
        <div className="relative z-10 container mx-auto px-4 max-w-4xl py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-green-500/20 border-2 border-cyan-500/30 flex items-center justify-center text-4xl font-black text-cyan-400 shrink-0">
              {(profile?.username || user?.email?.charAt(0) || "?").charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-white">@{profile?.username || user?.email?.split("@")[0]}</h1>
                {stats?.total_points > 0 && (
                  <span className="text-xs bg-yellow-500/15 text-yellow-400 px-2 py-1 rounded-full font-bold border border-yellow-500/20">
                    {stats.total_points} pts
                  </span>
                )}
              </div>
              {!editing ? (
                <>
                  <p className="text-zinc-400 text-sm mb-2">{profile?.bio || "No bio yet. Tell the fans about yourself!"}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    {profile?.favorite_team && (
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />{profile.favorite_team}</span>
                    )}
                    {profile?.favorite_sport && (
                      <span>{profile.favorite_sport === "cricket" ? "🏏" : "⚽"} {profile.favorite_sport}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {new Date(profile?.joined_at || user?.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                  </div>
                </>
              ) : (
                <div className="space-y-3 mt-2">
                  <input value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Your bio..." className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-500" maxLength={160} />
                  <div className="flex gap-3">
                    <input value={editFavTeam} onChange={e => setEditFavTeam(e.target.value)} placeholder="Favorite team" className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-500" />
                    <select value={editFavSport} onChange={e => setEditFavSport(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none">
                      <option value="cricket">🏏 Cricket</option>
                      <option value="football">⚽ Football</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <div className="shrink-0">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all">
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={() => setEditing(false)} className="p-2 rounded-xl text-zinc-500 hover:text-white border border-zinc-700 transition-all">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 z-[5]" style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }} />
      </section>

      {/* ═══ FAN LEVEL XP CARD ═══ */}
      {(() => {
        const currentXP = profile?.xp || 0;
        const currentLevel = profile?.fan_level || 1;
        const levelInfo = FAN_LEVELS[currentLevel] || FAN_LEVELS[1];
        const nextLevelXP = getNextLevelXP(currentLevel);
        const currentLevelXP = levelInfo.minXP;
        const progressInLevel = nextLevelXP > currentLevelXP ? ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 100;
        const isMaxLevel = currentLevel >= 6;

        return (
          <section className="container mx-auto px-4 max-w-4xl -mt-2 relative z-10 mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-dark-border p-5 relative overflow-hidden"
            >
              {/* Level glow background */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20 bg-gradient-to-br ${levelInfo.gradient}`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${levelInfo.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                      {levelInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-black ${levelInfo.color}`}>{levelInfo.name}</h3>
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-zinc-400 font-bold">Lvl {currentLevel}</span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium">{currentXP} XP earned total</p>
                    </div>
                  </div>
                  {!isMaxLevel && (
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Next Level</p>
                      <p className="text-sm font-bold text-white">{FAN_LEVELS[currentLevel + 1]?.name}</p>
                      <p className="text-[10px] text-zinc-600">{nextLevelXP - currentXP} XP to go</p>
                    </div>
                  )}
                </div>
                
                {/* XP Progress Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                    <span>{currentLevelXP} XP</span>
                    <span>{isMaxLevel ? "MAX LEVEL" : `${nextLevelXP} XP`}</span>
                  </div>
                  <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${levelInfo.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, progressInLevel)}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Level progression preview */}
                <div className="flex items-center justify-between mt-4 gap-1">
                  {Object.entries(FAN_LEVELS).map(([lvl, info]) => {
                    const level = parseInt(lvl);
                    const isActive = level === currentLevel;
                    const isCompleted = level < currentLevel;
                    return (
                      <div key={lvl} className="flex flex-col items-center flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm border transition-all ${
                          isActive ? `bg-gradient-to-br ${info.gradient} border-transparent shadow-lg` :
                          isCompleted ? `bg-white/5 border-white/10` : `bg-zinc-900 border-zinc-800 opacity-40`
                        }`}>
                          {isCompleted ? "✓" : info.icon}
                        </div>
                        <span className={`text-[8px] mt-1 font-bold tracking-wider ${
                          isActive ? info.color : isCompleted ? "text-zinc-500" : "text-zinc-700"
                        }`}>{info.name.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </section>
        );
      })()}

      {/* Stats Cards */}
      <section className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Predictions", value: stats?.total_predictions || 0, icon: Target, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Accuracy", value: `${accuracy}%`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Streak", value: `🔥 ${stats?.prediction_streak || 0}`, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Badges", value: badges.length, icon: Award, color: "text-purple-400", bg: "bg-purple-500/10" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl border border-dark-border p-4 text-center"
            >
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="container mx-auto px-4 max-w-4xl mt-8">
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 mb-6">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.key ? "bg-white/10 text-white border border-white/10" : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Overview Tab ─── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-16">
              {/* Performance summary */}
              <div className="glass-card rounded-2xl border border-dark-border p-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" /> Performance Summary
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Prediction Accuracy</span>
                      <span className="font-bold text-white">{accuracy}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-500" initial={{ width: 0 }} animate={{ width: `${accuracy}%` }} transition={{ duration: 1 }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-lg font-black text-green-400">{stats?.correct_predictions || 0}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Correct</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-yellow-400">{stats?.pending_predictions || 0}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-red-400">{(stats?.total_predictions || 0) - (stats?.correct_predictions || 0) - (stats?.pending_predictions || 0)}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Wrong</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent badges */}
              <div className="glass-card rounded-2xl border border-dark-border p-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" /> Recent Badges
                </h3>
                {badges.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {badges.slice(0, 6).map(b => {
                      const def = BADGE_DEFS[b.badge_id] || { name: b.badge_id, icon: "🏅", desc: "", color: "text-zinc-400" };
                      return (
                        <div key={b.id} className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2">
                          <span className="text-xl">{def.icon}</span>
                          <div>
                            <p className={`text-xs font-bold ${def.color}`}>{def.name}</p>
                            <p className="text-[9px] text-zinc-600">{def.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-600 text-sm">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                    No badges yet. Start predicting to earn your first!
                  </div>
                )}
              </div>

              {/* XP Activity Log */}
              <div className="glass-card rounded-2xl border border-dark-border p-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" /> XP History
                </h3>
                {xpLog.length > 0 ? (
                  <div className="space-y-2">
                    {xpLog.slice(0, 8).map((entry: any) => {
                      const actionLabels: Record<string, string> = {
                        prediction: "Made a prediction",
                        correct_prediction: "Correct prediction!",
                        comment: "Posted a comment",
                        debate: "Started a debate",
                        debate_reply: "Got a reply",
                        cheer: "Cheered for a team",
                        login_streak_7: "7-day login streak",
                      };
                      return (
                        <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/30">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-sm">
                            {entry.action === "correct_prediction" ? "🎯" : entry.action === "cheer" ? "📣" : entry.action === "comment" ? "💬" : "⚡"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-zinc-300 truncate">{actionLabels[entry.action] || entry.action}</p>
                            <p className="text-[9px] text-zinc-600">{new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                          </div>
                          <span className="text-xs font-bold text-green-400">+{entry.xp_earned} XP</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-600 text-sm">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                    No XP earned yet. Predict, comment, and cheer to earn XP!
                  </div>
                )}
              </div>

              {/* Quick activity */}
              <div className="glass-card rounded-2xl border border-dark-border p-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" /> Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-bold text-white">{stats?.total_comments || 0}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Comments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-sm font-bold text-white">{stats?.longest_streak || 0}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Best Streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-sm font-bold text-white">{stats?.total_points || 0}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Total XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl">
                    <Heart className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-sm font-bold text-white">{stats?.following_count || 0}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Following</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Predictions Tab ─── */}
          {activeTab === "predictions" && (
            <motion.div key="predictions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 pb-16">
              {predictions.length > 0 ? predictions.map(p => (
                <div key={p.id} className={`glass-card rounded-xl border p-4 flex items-center gap-4 ${
                  p.is_correct === true ? "border-green-500/30" : p.is_correct === false ? "border-red-500/30" : "border-dark-border"
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    p.is_correct === true ? "bg-green-500/15 text-green-400" : p.is_correct === false ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"
                  }`}>
                    {p.is_correct === true ? "✅" : p.is_correct === false ? "❌" : "⏳"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">Picked: {p.predicted_winner}</p>
                    <p className="text-[10px] text-zinc-600">Match #{p.match_id} • {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  {p.points_earned > 0 && (
                    <span className="text-xs bg-green-500/15 text-green-400 px-2 py-1 rounded-full font-bold">+{p.points_earned} pts</span>
                  )}
                </div>
              )) : (
                <div className="text-center py-12 text-zinc-600">
                  <Target className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                  <p className="font-bold text-white mb-1">No predictions yet</p>
                  <p className="text-sm">Head to a live match and make your first prediction!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Activity Tab ─── */}
          {activeTab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 pb-16">
              {recentComments.length > 0 ? recentComments.map(c => (
                <div key={c.id} className="glass-card rounded-xl border border-dark-border p-4">
                  <p className="text-sm text-zinc-300 mb-2 line-clamp-2">{c.content}</p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                    <span>on {c.entity_type} #{c.entity_id}</span>
                    <span>•</span>
                    <span>{new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    {c.likes_count > 0 && <span className="flex items-center gap-1 text-rose-400"><Heart className="w-3 h-3" />{c.likes_count}</span>}
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-zinc-600">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                  <p className="font-bold text-white mb-1">No activity yet</p>
                  <p className="text-sm">Comment on news or highlights to see your activity here.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Badges Tab ─── */}
          {activeTab === "badges" && (
            <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pb-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(BADGE_DEFS).map(([id, def]) => {
                  const earned = badges.some(b => b.badge_id === id);
                  return (
                    <div key={id} className={`glass-card rounded-xl border p-4 flex items-center gap-4 transition-all ${
                      earned ? "border-yellow-500/30 bg-yellow-500/[0.03]" : "border-dark-border opacity-40"
                    }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${earned ? "bg-yellow-500/10" : "bg-zinc-800"}`}>
                        {def.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${earned ? def.color : "text-zinc-600"}`}>{def.name}</p>
                        <p className="text-[10px] text-zinc-600">{def.desc}</p>
                      </div>
                      {earned && <Check className="w-4 h-4 text-green-400" />}
                      {!earned && <Shield className="w-4 h-4 text-zinc-700" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
