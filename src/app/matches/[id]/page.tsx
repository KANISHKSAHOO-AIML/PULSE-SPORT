"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import MatchCard from "@/components/MatchCard";
import WinProbability from "@/components/WinProbability";
import PlayerComparison from "@/components/PlayerComparison";
import PulsePredictor from "@/components/PulsePredictor";
import LiveTimeline from "@/components/LiveTimeline";
import { Send, Users, Lock, MessageCircle, X, BarChart3, Trophy, MessageSquare, Activity } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"fanspace" | "timeline" | "analytics" | "predict">("fanspace");
  
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
      const { data } = await supabase.from("matches").select("*").eq("id", id).single();
      if (data) setMatch(data);
      setLoading(false);
    };
    fetchMatch();

    const channel = supabase
      .channel(`match-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${id}` }, (payload) => {
        setMatch((prev: any) => ({ ...prev, ...payload.new }));
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
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
      <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
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
    { key: "fanspace" as const, label: match.live ? "Fan Space" : "Debate", icon: MessageSquare },
    { key: "timeline" as const, label: match.sport === "cricket" ? "Ball-by-Ball" : "Timeline", icon: Activity },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { key: "predict" as const, label: "Predict", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl flex flex-col gap-6">
        
        {/* Match Header Context */}
        <section>
           <MatchCard sport={match.sport as any} match={{
              id: match.id, title: match.title, teamA: match.team_a, teamB: match.team_b,
              scoreA: match.score_a, scoreB: match.score_b, status: match.status, live: match.live
            }} />
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
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

        {/* Tab Content */}
        <AnimatePresence mode="wait">
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
              <PlayerComparison sport={match.sport} teamA={match.team_a} teamB={match.team_b} />
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
        </AnimatePresence>

      </main>
    </div>
  );
}
