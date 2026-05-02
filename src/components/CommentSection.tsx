"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { MessageSquare, Heart, Medal, Lock, Smile } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface CommentSectionProps {
  entityType: "news" | "highlight";
  entityId: string | number;
}

export default function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(username), comment_likes(user_id)")
        .eq("entity_type", entityType)
        .eq("entity_id", String(entityId))
        .order("created_at", { ascending: false });

      if (data) setComments(data);
      setLoading(false);
    };

    fetchComments();

    // Soft realtime
    const channel = supabase
      .channel(`comments_${entityType}_${entityId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `entity_id=eq.${entityId}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [entityType, entityId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const commentText = newComment;
    setNewComment(""); // Clear input immediately

    const { data, error } = await supabase.from("comments").insert({
      entity_type: entityType,
      entity_id: String(entityId),
      user_id: user.id,
      content: commentText
    }).select("*, profiles(username), comment_likes(user_id)").single();

    if (data) {
      // Optimistic: prepend the new comment to the list immediately
      setComments(prev => [data, ...prev]);
    } else if (error) {
      console.error("Failed to post comment:", JSON.stringify(error, null, 2), error.message, error.details);
      alert(`Database error: ${error.message || JSON.stringify(error)}`);
      
      // Fallback: manually add a temporary comment so the user sees it
      setComments(prev => [{
        id: `temp-${Date.now()}`,
        entity_type: entityType,
        entity_id: String(entityId),
        user_id: user.id,
        content: commentText,
        created_at: new Date().toISOString(),
        likes_count: 0,
        profiles: { username: user.user_metadata?.username || user.email?.split('@')[0] || 'Fan' },
        comment_likes: []
      }, ...prev]);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      alert("You must be logged in to like comments!");
      return;
    }
    
    // Prevent liking temporary optimistic comments
    if (commentId.startsWith("temp-")) {
      alert("This comment is still being posted or failed to save. Please refresh.");
      return;
    }
    
    // Call the PostgreSQL generic function defined in Stage C DB script
    const { data, error } = await supabase.rpc("toggle_comment_like", {
      p_comment_id: commentId
    });

    if (error) {
      console.error("Failed to toggle like:", JSON.stringify(error, null, 2), error.message);
      alert(`Like error: ${error.message || JSON.stringify(error)}`);
      return;
    }

    // Optimistic re-fetch usually triggered by Postgres_changes 
    // but we can manually adjust state here to feel totally instant:
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const hasLiked = c.comment_likes?.some((l: any) => l.user_id === user.id);
        const updatedLikesArr = hasLiked 
          ? c.comment_likes.filter((l: any) => l.user_id !== user.id)
          : [...(c.comment_likes || []), { user_id: user.id }];
          
        return { 
          ...c, 
          likes_count: data as number, // Update the count directly from RPC result
          comment_likes: updatedLikesArr 
        };
      }
      return c;
    }));
  };

  if (loading) return <div className="text-zinc-500 py-8 text-center animate-pulse">Loading discussion...</div>;

  // Identify Top Comment
  const findTopCommentId = () => {
    if (comments.length === 0) return null;
    const maxLikes = Math.max(...comments.map(c => c.likes_count));
    if (maxLikes < 1) return null; // Needs at least 1 like to be crowned
    const topComment = comments.find(c => c.likes_count === maxLikes);
    return topComment?.id || null;
  };
  const topCommentId = findTopCommentId();

  return (
    <div className="mt-12 border-t border-zinc-800 pt-8 pb-12">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="text-blue-500 w-6 h-6" /> Discussion ({comments.length})
      </h3>

      {/* Input */}
      {user ? (
        <form onSubmit={handlePost} className="mb-10 flex gap-3 items-start bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center font-bold text-blue-400 shrink-0">
             {((user.user_metadata?.username || user.email) as string)?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex flex-col gap-3">
             <textarea 
               value={newComment}
               onChange={e => setNewComment(e.target.value)}
               placeholder="Add your analysis..."
               className="w-full bg-transparent border-b border-zinc-700 focus:border-blue-500 outline-none resize-none pt-2 pb-1 transition-colors min-h-[40px] text-sm"
               rows={2}
             />
             <div className="flex items-center justify-between mt-1 relative">
               <div className="flex items-center gap-2">
                 <button
                   type="button"
                   onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                   className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                   title="Add emoji"
                 >
                   <Smile className="w-5 h-5" />
                 </button>
                 
                 {showEmojiPicker && (
                   <div className="absolute top-10 left-0 z-50 shadow-2xl">
                     <EmojiPicker 
                       theme={"dark" as any} 
                       onEmojiClick={(emojiData: any) => {
                         setNewComment(prev => prev + emojiData.emoji);
                         setShowEmojiPicker(false);
                       }} 
                     />
                   </div>
                 )}
               </div>
               <button 
                 type="submit" 
                 disabled={!newComment.trim()}
                 className="bg-white text-black text-sm font-bold py-2 px-5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 shrink-0"
               >
                 Post
               </button>
             </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
          <Lock className="w-8 h-8 text-zinc-600 mb-3" />
          <h4 className="font-bold text-lg text-white mb-2">Join the Conversation</h4>
          <p className="text-sm text-zinc-400 mb-4">You must be logged in to leave a comment or like thoughts.</p>
          <Link href="/login" className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-zinc-300 transition-colors">
            Log In or Sign Up
          </Link>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-5">
        {comments.length === 0 ? (
           <div className="text-center text-zinc-500 py-6 border border-zinc-800/50 rounded-xl border-dashed">No comments yet. Be the first to analyze!</div>
        ) : (
           comments.map(comment => {
             const isLiked = user && comment.comment_likes?.some((l: any) => l.user_id === user.id);
             const isTop = comment.id === topCommentId;
             
             return (
               <div key={comment.id} className={`p-4 rounded-xl border transition-colors ${isTop ? 'bg-amber-500/5 border-amber-500/20' : 'bg-dark-card border-dark-border'}`}>
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-white text-sm">@{comment.profiles?.username || 'Fan'}</span>
                     <span className="text-xs text-zinc-500">• {new Date(comment.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                   </div>
                   
                   {isTop && (
                     <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                       <Medal className="w-3 h-3" /> Top Fan
                     </span>
                   )}
                 </div>
                 
                 <p className="text-sm text-zinc-300 mb-4 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                 
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleLike(comment.id)}
                     className={`flex items-center gap-1.5 text-xs font-bold transition-all px-2.5 py-1.5 rounded-md ${
                       isLiked ? 'text-rose-500 bg-rose-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                     }`}
                   >
                     <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                     {comment.likes_count > 0 && comment.likes_count}
                   </button>
                 </div>
               </div>
             )
           })
        )}
      </div>
    </div>
  );
}
