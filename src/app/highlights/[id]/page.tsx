"use client";

import { useState, useEffect, use, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import CommentSection from "@/components/CommentSection";
import ShareButtons from "@/components/ShareButtons";
import FloatingVideoPlayer from "@/components/FloatingVideoPlayer";
import { ArrowLeft, PlayCircle, Eye } from "lucide-react";
import Link from "next/link";

export default function HighlightDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [highlight, setHighlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHighlight = async () => {
      const { data, error } = await supabase.from("highlights").select("*").eq("id", id).single();
      if (error || !data) {
        setHighlight({
          id,
          title: id === 'mock-high-1' ? 'Unbelievable 90th Minute Winner!' : 'Insane Hat-Trick Highlights',
          sport: id === 'mock-high-1' ? 'football' : 'cricket',
          thumbnail: id === 'mock-high-1' 
            ? 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2938&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2940&auto=format&fit=crop',
          duration: id === 'mock-high-1' ? '04:15' : '06:30',
          views: id === 'mock-high-1' ? '1.2M' : '850K'
        });
      } else {
        setHighlight(data);
      }
      setLoading(false);
    };
    fetchHighlight();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-5xl animate-pulse">
        <div className="h-4 w-32 bg-zinc-800 rounded mb-6" />
        <div className="aspect-video bg-zinc-800 rounded-2xl mb-6" />
        <div className="h-8 w-3/4 bg-zinc-800 rounded mb-3" />
        <div className="h-4 w-40 bg-zinc-800 rounded" />
      </div>
    </div>
  );
  if (!highlight) return <div className="min-h-screen bg-dark-bg text-white"><Header /><div className="p-8 text-center text-zinc-500">Video not found.</div></div>;

  const accentColor = highlight.sport === "cricket" ? "text-cricket" : "text-football";

  return (
    <div className="min-h-screen bg-dark-bg text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/highlights" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Highlights
        </Link>

        {/* Cinematic Video Player Interface */}
        <div ref={videoContainerRef} className="mb-10 p-2 sm:p-4 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group cursor-pointer flex items-center justify-center">
             <img src={highlight.thumbnail} alt={highlight.title} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
             
             {/* Play UI */}
             <div className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all">
                <PlayCircle className={`w-12 h-12 ml-1 ${accentColor}`} strokeWidth={1.5} />
             </div>
             
             <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-red-500/80 text-white text-xs font-bold rounded flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span> LIVE VOD
                </span>
             </div>
             <div className="absolute right-4 bottom-4 px-3 py-1.5 bg-black/80 text-white font-mono text-sm font-bold tracking-widest rounded-md backdrop-blur-md">
                {highlight.duration || "03:45"}
             </div>
          </div>
        </div>

        {/* Video Info + Share */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-zinc-800 pb-8">
           <div>
             <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight tracking-tight text-white">
               {highlight.title}
             </h1>
             <div className="flex items-center gap-3 text-zinc-400 font-medium">
               <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-zinc-800 border border-zinc-700 ${accentColor}`}>
                 {highlight.sport}
               </span>
               <span className="flex flex-row items-center gap-1"><Eye className="w-4 h-4" /> {highlight.views} Views</span>
             </div>
           </div>
           <ShareButtons title={highlight.title} />
        </div>

        {/* Comments Engine */}
        <div className="max-w-4xl mx-auto">
           <CommentSection entityType="highlight" entityId={id} />
        </div>
      </main>

      {/* Floating PiP when scrolling past video */}
      <FloatingVideoPlayer
        title={highlight.title}
        thumbnail={highlight.thumbnail}
        duration={highlight.duration || "03:45"}
        sport={highlight.sport}
        videoRef={videoContainerRef}
      />
    </div>
  );
}
