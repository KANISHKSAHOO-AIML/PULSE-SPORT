"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import CommentSection from "@/components/CommentSection";
import ShareButtons from "@/components/ShareButtons";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function NewsDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
      if (error || !data) {
        // Fallback for demo simplicity
        setArticle({
          id,
          sport: id === 'mock-news-2' ? 'cricket' : 'football',
          title: id === 'mock-news-2' ? 'Century Under Pressure Secures Victory' : 'Breaking: Massive Transfer Deal Completed',
          summary: id === 'mock-news-2' ? 'In a stunning display of skill and nerves, the captain hit an unbeaten century to chase down a mammoth total in the final over.' : 'The biggest transfer of the summer has finally been agreed upon, stunning fans worldwide as the star striker switches rival clubs.',
          image_url: id === 'mock-news-2' 
             ? 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2938&auto=format&fit=crop'
             : 'https://images.unsplash.com/photo-1518605368461-1ee7c588b4db?q=80&w=2938&auto=format&fit=crop',
          time_ago: 'Just now'
        });
      } else {
        setArticle(data);
      }
      setLoading(false);
    };
    fetchArticle();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
        <div className="h-4 w-24 bg-zinc-800 rounded mb-8" />
        <div className="h-6 w-32 bg-zinc-800 rounded-full mb-6" />
        <div className="h-12 w-full max-w-2xl bg-zinc-800 rounded mb-8" />
        <div className="h-[400px] sm:h-[500px] w-full bg-zinc-800 rounded-2xl mb-8" />
      </div>
    </div>
  );
  if (!article) return <div className="min-h-screen bg-dark-bg text-white"><Header /><div className="p-8 text-center text-zinc-500">Story not found. It may have been removed.</div></div>;

  const accentColor = article.sport === "cricket" ? "text-cricket" : "text-football";
  const badgeColor = article.sport === "cricket" ? "bg-cricket/10 text-cricket" : "bg-football/10 text-football";

  return (
    <div className="min-h-screen bg-dark-bg text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/news" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>

        {/* Article Header */}
        <article className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 text-sm">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
                {article.sport}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                <Clock className="w-4 h-4" /> {article.time_ago}
              </span>
            </div>
            <ShareButtons title={article.title} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white">
            {article.title}
          </h1>

          <div className="relative w-full h-[400px] sm:h-[500px] mb-8 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
             <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
             <p className="text-xl text-zinc-300 leading-relaxed font-medium mb-6">
               {article.summary}
             </p>
             {/* Note: Normally you'd have article.content here. For the demo, summary represents the content */}
             <div className="h-px w-full bg-zinc-800 my-8" />
          </div>
        </article>

        {/* Comments Engine */}
        <CommentSection entityType="news" entityId={id} />
        
      </main>
    </div>
  );
}
