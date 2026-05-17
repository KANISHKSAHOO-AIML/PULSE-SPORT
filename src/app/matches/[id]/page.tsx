"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import MatchCard from "@/components/MatchCard";
import WinProbability from "@/components/WinProbability";
import TeamHeadToHead from "@/components/TeamHeadToHead";
import PulsePredictor from "@/components/PulsePredictor";
import PredictionsMarket from "@/components/PredictionsMarket";
import LiveTimeline from "@/components/LiveTimeline";
import MatchReport from "@/components/MatchReport";
import PulseCommentary from "@/components/PulseCommentary";
import LiveMatchCenter from "@/components/LiveMatchCenter";
import MyPredictions from "@/components/MyPredictions";
import { Send, Users, Lock, MessageCircle, X, BarChart3, Trophy, MessageSquare, Activity, Brain, Target, Newspaper, ChevronLeft, Mic, Shield } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"fanspace" | "timeline" | "analytics" | "predict" | "market" | "report" | "commentary" | "squad11">("analytics");
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Chat/Debate state
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [username, setUsername] = useState("Anonymous Fan");
  const [supportedTeam, setSupportedTeam] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string, username: string } | null>(null);

  // Check Auth
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setUsername(user.user_metadata?.username || user.email?.split('@')[0]);
      }
      setAuthLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch match details
  useEffect(() => {
    const fetchMatch = async () => {
      // 1. Try Supabase first (for admin-managed matches)
      const { data } = await supabase.from("matches").select("*").eq("id", id).single();
      if (data) {
        setMatch(data);
        setLoading(false);
        return;
      }

      // 2. Fallback: Fetch from the unified API (for external API matches like CricAPI/Football-Data)
      try {
        const res = await fetch("/api/live-matches");
        if (res.ok) {
          const json = await res.json();
          const found = json.matches?.find((m: any) => String(m.id) === String(id));
          if (found) {
            setMatch({
              id: found.id,
              sport: found.sport,
              title: found.title,
              team_a: found.teamA,
              team_b: found.teamB,
              score_a: found.scoreA,
              score_b: found.scoreB,
              status: found.status,
              live: found.live,
              source: found.source || "api",
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 3. Fallback: Direct IPL schedule lookup (works for ALL IPL matches — past, today, future)
      try {
        const { getDynamicSchedule } = await import("@/lib/ipl2026Schedule");
        const schedule = getDynamicSchedule();
        const iplMatch = schedule.find(m => String(m.matchNo) === String(id));
        if (iplMatch) {
          setMatch({
            id: String(iplMatch.matchNo),
            sport: "cricket",
            title: `${iplMatch.team1} vs ${iplMatch.team2}, IPL 2026 Match ${iplMatch.matchNo}`,
            team_a: iplMatch.team1,
            team_b: iplMatch.team2,
            score_a: iplMatch.score1 || "—",
            score_b: iplMatch.score2 || "—",
            status: iplMatch.result || (iplMatch.status === "live" ? "In Progress" : iplMatch.status === "completed" ? "Completed" : "Match not started"),
            live: iplMatch.status === "live",
            date: iplMatch.date,
            venue: iplMatch.venue,
            matchNo: iplMatch.matchNo,
            source: "ipl-schedule",
          });
          setLoading(false);
          return;
        }
      } catch {}

      // 4. Fallback: Check IPL API (for live score updates from CricAPI)
      try {
        const res = await fetch("/api/ipl");
        if (res.ok) {
          const json = await res.json();
          const found = json.matches?.find((m: any) => String(m.id) === String(id) || String(m.matchNo) === String(id));
          if (found) {
            const teams = found.teams || [];
            const scores = found.score || [];
            setMatch({
              id: found.id || id,
              sport: "cricket",
              title: found.name || `${teams[0]} vs ${teams[1]}`,
              team_a: teams[0] || found.team1 || "TBA",
              team_b: teams[1] || found.team2 || "TBA",
              score_a: scores[0] ? `${scores[0].r}/${scores[0].w} (${scores[0].o})` : "—",
              score_b: scores[1] ? `${scores[1].r}/${scores[1].w} (${scores[1].o})` : "—",
              status: found.status || "Upcoming",
              live: found.matchStarted && !found.matchEnded,
              date: found.date || found.dateTimeGMT,
              source: "ipl",
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 5. Neither source has the match
      setLoading(false);
    };
    fetchMatch();

    // Real-time updates for Supabase-sourced matches
    const channel = supabase
      .channel(`match-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${id}` }, (payload) => {
        setMatch((prev: any) => ({ ...prev, ...payload.new }));
      }).subscribe();

    // Also poll the API every 30s for external matches
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/live-matches");
        if (res.ok) {
          const json = await res.json();
          const found = json.matches?.find((m: any) => String(m.id) === String(id));
          if (found) {
            setMatch((prev: any) => ({
              ...prev,
              score_a: found.scoreA,
              score_b: found.scoreB,
              status: found.status,
              live: found.live,
            }));
          }
        }
      } catch {}
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [id]);

  // Handle Live Chat vs Post-Match Debates
  useEffect(() => {
    if (!match) return;

    if (match.live) {
      const fetchLiveComments = async () => {
        try {
          const res = await fetch(`/api/comments/live?matchId=${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.messages) {
              const parsed = data.messages.map((m: string) => JSON.parse(m));
              setComments(parsed);
            }
          }
        } catch (err) { }
      };

      fetchLiveComments();
      const interval = setInterval(fetchLiveComments, 2000); 
      return () => clearInterval(interval);
    } else {
      const fetchMatchThoughts = async () => {
        const { data } = await supabase
          .from("match_thoughts")
          .select("*, profiles(username)")
          .eq("match_id", id)
          .order("created_at", { ascending: true });
        
        if (data) {
          const parsed = data.map(c => ({
            id: c.id,
            parent_id: c.parent_id,
            username: c.profiles?.username || "Unknown Fan",
            team: c.team,
            text: c.content,
            timestamp: c.created_at
          }));
          setComments(parsed);
        }
      };
      
      fetchMatchThoughts();

      const channel = supabase
        .channel(`match_thoughts_${id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "match_thoughts", filter: `match_id=eq.${id}` }, () => {
          fetchMatchThoughts();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [match, id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !supportedTeam || !user) return;

    if (match.live) {
      fetch('/api/comments/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: id, username, text: newComment, team: supportedTeam })
      });
      setComments(prev => [{
        id: Date.now().toString(),
        username: username,
        team: supportedTeam,
        text: newComment,
        timestamp: new Date().toISOString()
      }, ...prev].slice(0, 50)); 
      
      setNewComment("");
    } else {
      const parent_id = replyingTo?.id || null;
      setReplyingTo(null);
      
      const { data, error } = await supabase.from('match_thoughts').insert({
        match_id: id,
        user_id: user.id,
        parent_id,
        content: newComment,
        team: supportedTeam
      }).select("*, profiles(username)").single();

      if (data) {
        setComments(prev => [...prev, {
            id: data.id,
            parent_id: data.parent_id,
            username: data.profiles?.username || username,
            team: data.team,
            text: data.content,
            timestamp: data.created_at
        }]);
      } else if (error) {
        console.error("Match Thought Error Object:", error);
        alert(`Failed to post thought.\nReason: ${error.message}\nDetails: ${error.details || "N/A"}`);
      }
      setNewComment("");
    }
  };

  const renderComment = (comment: any, isReply: boolean = false) => {
    const isTeamA = comment.team === match.team_a;
    const isTeamB = comment.team === match.team_b;
    const badgeColor = isTeamA ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : 
                       isTeamB ? "bg-red-500/20 text-red-400 border-red-500/30" : 
                       "bg-zinc-800 text-zinc-400 border-zinc-700";

    return (
      <div key={comment.id} className={`bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50 ${isReply ? 'ml-8 mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-white">@{comment.username}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {comment.team}
          </span>
          <span className="text-xs text-zinc-500 ml-auto">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          
          {!match.live && !isReply && (
            <button 
              onClick={() => setReplyingTo({ id: comment.id, username: comment.username })}
              className="ml-2 text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
              title="Reply"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{comment.text}</p>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-5xl animate-pulse">
        <div className="h-40 bg-zinc-800 rounded-2xl mb-6" />
        <div className="h-8 w-64 bg-zinc-800 rounded mb-4" />
        <div className="h-[400px] bg-zinc-800 rounded-2xl" />
      </div>
    </div>
  );
  if (!match) return <div className="min-h-screen bg-dark-bg text-white"><Header /><div className="p-8 text-center text-zinc-500">Match not found.</div></div>;

  const parentComments = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);

  const TABS = [
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { key: "commentary" as const, label: "Commentary", icon: Mic },
    { key: "timeline" as const, label: match.sport === "cricket" ? "Ball-by-Ball" : "Timeline", icon: Activity },
    { key: "report" as const, label: "AI Report", icon: Brain },
    { key: "predict" as const, label: "Predict", icon: Trophy },
    { key: "squad11" as const, label: "Squad 11", icon: Shield },
    { key: "market" as const, label: "Market", icon: Target },
    { key: "fanspace" as const, label: match.live ? "Fan Space" : "Debate", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-foreground pb-20 md:pb-0">
      <Header />

      {/* ═══ STICKY SCOREBAR ═══ */}
      <div className="sticky top-14 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors shrink-0">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </Link>
            
            <div className="flex items-center gap-4 flex-1 justify-center">
              {/* Team A */}
              <div className="text-right flex-1 max-w-[140px]">
                <p className="text-sm font-bold text-white truncate">{match.team_a}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-white tabular-nums">{match.score_a}</span>
                <div className="flex flex-col items-center">
                  {match.live && (
                    <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mb-1 animate-pulse">LIVE</span>
                  )}
                  <span className="text-[10px] text-zinc-600 font-bold">vs</span>
                </div>
                <span className="text-xl font-black text-white tabular-nums">{match.score_b}</span>
              </div>
              {/* Team B */}
              <div className="text-left flex-1 max-w-[140px]">
                <p className="text-sm font-bold text-white truncate">{match.team_b}</p>
              </div>
            </div>

            <div className="shrink-0 w-10" /> {/* Spacer for alignment */}
          </div>
          <p className="text-[10px] text-zinc-500 text-center pb-2 -mt-1">{match.status}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-5xl flex flex-col gap-6">
        
        {/* Match Header Context */}
        <section>
           <MatchCard sport={match.sport as any} match={{
              id: match.id, title: match.title, teamA: match.team_a, teamB: match.team_b,
              scoreA: match.score_a, scoreB: match.score_b, status: match.status, live: match.live
            }} />
        </section>

        {/* Tab Navigation — Scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* ─── Analytics Tab ─── */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <WinProbability match={match} />
              <TeamHeadToHead teamA={match.team_a} teamB={match.team_b} sport={match.sport} />
            </motion.div>
          )}

          {/* ─── Commentary Tab ─── */}
          {activeTab === "commentary" && (
            <motion.div
              key="commentary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PulseCommentary matchId={match.id} sport={match.sport} teamA={match.team_a} teamB={match.team_b} isLive={match.live} />
            </motion.div>
          )}

          {/* ─── Timeline Tab ─── */}
          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LiveTimeline
                matchId={match.id}
                sport={match.sport}
                teamA={match.team_a}
                teamB={match.team_b}
                isLive={match.live}
              />
            </motion.div>
          )}

          {/* ─── AI Report Tab ─── */}
          {activeTab === "report" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MatchReport matchId={match.id} sport={match.sport} teamA={match.team_a} teamB={match.team_b} />
            </motion.div>
          )}

          {/* ─── Predict Tab ─── */}
          {activeTab === "predict" && (
            <motion.div
              key="predict"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PulsePredictor match={match} />
            </motion.div>
          )}

          {/* ─── Squad 11 Predictor Tab ─── */}
          {activeTab === "squad11" && (
            <motion.div
              key="squad11"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <LiveMatchCenter
                key={`lmc-${match.id}`}
                matchId={match.id}
                teamA={match.team_a}
                teamB={match.team_b}
                matchTime={new Date(match.date || Date.now())}
                isLive={match.live}
                isCompleted={!match.live && match.status?.toLowerCase().includes("ended")}
              />
              <MyPredictions />
            </motion.div>
          )}

          {/* ─── Predictions Market Tab ─── */}
          {activeTab === "market" && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PredictionsMarket match={match} />
            </motion.div>
          )}

          {/* ─── Fan Space Tab ─── */}
          {activeTab === "fanspace" && (
            <motion.section
              key="fanspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col h-[600px] shadow-xl"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  {match.live ? "Fan Space" : "Let's Debate"}
                  {match.live && <span className="text-xs bg-red-500/20 text-red-500 px-2.5 py-1 rounded font-bold uppercase tracking-wider animate-pulse">Live Feed</span>}
                  {!match.live && <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded font-bold uppercase tracking-wider">Match Thoughts</span>}
                </h2>
                <p className="text-sm text-zinc-400">
                  {match.live ? "High-speed live conversation. Powered by Redis." : "The match has concluded. Persistent threaded discussions."}
                </p>
              </div>

              {authLoading ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500">Loading Fan Space...</div>
              ) : !user ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-8">
                  <Lock className="w-12 h-12 text-zinc-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{match.live ? "Join the Fan Space" : "Join the Debate"}</h3>
                  <p className="text-zinc-400 mb-8 max-w-sm">Log in or sign up to experience {match.live ? "high-speed live fan chat" : "the Match Thoughts debates"}.</p>
                  <div className="flex gap-4">
                    <Link href="/login" className="bg-white text-black font-bold py-2.5 px-6 rounded-xl hover:bg-zinc-200 transition-colors">
                      Log In / Sign Up
                    </Link>
                  </div>
                </div>
              ) : !supportedTeam ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-8">
                  <Users className="w-12 h-12 text-zinc-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Who are you supporting?</h3>
                  <p className="text-zinc-400 mb-8 max-w-sm">Choose your allegiance to enter the {match.live ? "Fan Space" : "Debate"}.</p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button onClick={() => setSupportedTeam(match.team_a)} className="flex-1 sm:flex-none uppercase tracking-wider bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold py-3 px-6 rounded-xl transition-all">
                      {match.team_a}
                    </button>
                    <button onClick={() => setSupportedTeam(match.team_b)} className="flex-1 sm:flex-none uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-3 px-6 rounded-xl transition-all">
                      {match.team_b}
                    </button>
                    <button onClick={() => setSupportedTeam("Neutral")} className="flex-1 sm:flex-none uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 px-6 rounded-xl transition-all">
                      Neutral
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Messages */}
                  <div className={`flex-1 overflow-y-auto ${match.live ? 'flex flex-col-reverse gap-4' : 'flex flex-col gap-0'} mb-4 pr-2 custom-scrollbar`}>
                    {match.live ? (
                       comments.map(comment => renderComment(comment))
                    ) : (
                       parentComments.map(comment => (
                         <div key={comment.id}>
                           {renderComment(comment)}
                           {replies.filter(r => r.parent_id === comment.id).map(reply => renderComment(reply, true))}
                         </div>
                       ))
                    )}

                    {comments.length === 0 && (
                      <div className="text-center text-zinc-500 my-auto bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50">
                        No thoughts yet. Drop a message to start the debate!
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="mt-auto pt-4 border-t border-zinc-800">
                    {replyingTo && (
                      <div className="flex items-center justify-between bg-zinc-800/50 px-4 py-2 rounded-t-xl border-x border-t border-zinc-700/50 text-sm text-zinc-300">
                        <span className="flex items-center gap-2">
                           <MessageCircle className="w-3.5 h-3.5" /> Replying to <span className="font-bold text-white">@{replyingTo.username}</span>
                        </span>
                        <button onClick={() => setReplyingTo(null)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                    
                    <form onSubmit={handlePostComment} className="flex gap-2">
                      <input 
                        type="text" 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)} 
                        placeholder={replyingTo ? `Type your reply...` : `Chatting as @${username}...`} 
                        className={`flex-1 bg-zinc-900 border border-zinc-700 ${replyingTo ? 'rounded-b-xl rounded-t-none border-t-0' : 'rounded-xl'} px-4 py-3 outline-none focus:border-white text-sm placeholder:text-zinc-600`} 
                      />
                      <button 
                        type="submit" 
                        disabled={!newComment.trim()}
                        className={`bg-white text-black px-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${replyingTo ? 'rounded-tl-none mt-0' : ''}`}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.section>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
