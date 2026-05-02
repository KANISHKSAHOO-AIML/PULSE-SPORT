"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase/client";
import Header from "@/components/Header";
import CommentSection from "@/components/CommentSection";
import ShareButtons from "@/components/ShareButtons";
import { ArrowLeft, Clock, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

// Image component with graceful error handling
function NewsImage({ src, alt, className, sport }: { src?: string; alt: string; className?: string; sport?: string }) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isCricket = sport === "cricket";
  const gradientBg = isCricket
    ? "bg-gradient-to-br from-cyan-950 via-cyan-900/60 to-zinc-900"
    : "bg-gradient-to-br from-green-950 via-green-900/60 to-zinc-900";
  const emoji = isCricket ? "🏏" : "⚽";
  const accentLine = isCricket ? "bg-cyan-500/30" : "bg-green-500/30";

  if (!src || imgError) {
    return (
      <div className={`${className} ${gradientBg} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${accentLine}`} />
        <div className="text-center relative z-10">
          <span className="text-6xl block mb-1 drop-shadow-lg" style={{ filter: "saturate(1.3)" }}>{emoji}</span>
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{isCricket ? "Cricket" : "Football"}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={`${className} ${gradientBg} animate-pulse flex items-center justify-center absolute inset-0 z-10`}>
          <span className="text-5xl">{emoji}</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
        onError={() => setImgError(true)}
        onLoad={() => setLoaded(true)}
        referrerPolicy="no-referrer"
      />
    </>
  );
}

export default function NewsDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [isEspnArticle, setIsEspnArticle] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      // Check if this is an ESPN article ID
      if (id.startsWith("espn-")) {
        // Fetch from ESPN API
        try {
          const res = await fetch("/api/sports-news");
          if (res.ok) {
            const json = await res.json();
            const articles = json.articles || [];
            const found = articles.find((a: any) => a.id === id);
            if (found) {
              setArticle(found);
              setIsEspnArticle(true);
              // Get related articles from same sport
              const related = articles
                .filter((a: any) => a.sport === found.sport && a.id !== id)
                .slice(0, 3);
              setRelatedArticles(related);
            }
          }
        } catch {}
      } else {
        // Try Supabase for admin-published articles
        const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
        if (!error && data) {
          setArticle(data);
          
          // Fetch related articles from same sport
          const { data: related } = await supabase
            .from("news")
            .select("id, title, sport, image_url, time_ago, created_at")
            .eq("sport", data.sport)
            .neq("id", id)
            .order("created_at", { ascending: false })
            .limit(3);
          if (related) setRelatedArticles(related);
        }
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

  if (!article) return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header />
      <div className="p-8 text-center">
        <span className="text-6xl block mb-4">📰</span>
        <p className="text-zinc-300 text-lg font-bold mb-2">Story not found</p>
        <p className="text-zinc-500 text-sm mb-6">This article may have been removed or is no longer available.</p>
        <Link href="/news" className="inline-flex items-center gap-2 text-cricket font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Browse all news
        </Link>
      </div>
    </div>
  );

  const accentColor = article.sport === "cricket" ? "text-cricket" : "text-football";
  const badgeColor = article.sport === "cricket" ? "bg-cricket/10 text-cricket" : "bg-football/10 text-football";
  const readingTime = Math.max(1, Math.ceil((article.summary?.length || 100) / 200));

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
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
                {article.sport}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                <Clock className="w-4 h-4" /> {article.time_ago}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                <BookOpen className="w-4 h-4" /> {readingTime} min read
              </span>
            </div>
            <ShareButtons title={article.title} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white">
            {article.title}
          </h1>

          <div className="relative w-full h-[400px] sm:h-[500px] mb-8 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <NewsImage
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
              sport={article.sport}
            />
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
             <p className="text-xl text-zinc-300 leading-relaxed font-medium mb-6">
               {article.summary}
             </p>

             <div className="h-px w-full bg-zinc-800 my-8" />
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mb-12">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📰 Related Stories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((ra: any) => {
                const href = `/news/${ra.id}`;

                const card = (
                  <div className="group glass-card rounded-xl border border-dark-border overflow-hidden hover:border-zinc-600 transition-all h-full">
                    <div className="h-32 overflow-hidden relative">
                      <NewsImage
                        src={ra.image_url}
                        alt={ra.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        sport={ra.sport}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-zinc-300 line-clamp-2 group-hover:text-white transition-colors">{ra.title}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">{ra.time_ago || new Date(ra.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                );

                return (
                  <Link key={ra.id} href={href}>
                    {card}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Comments Engine */}
        <CommentSection entityType="news" entityId={id} />
        
      </main>
    </div>
  );
}
