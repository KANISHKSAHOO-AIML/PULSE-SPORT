"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeroSkeleton, NewsCardSkeleton } from "@/components/Skeletons";

const ParallaxSportScene = dynamic(
  () => import("@/components/ParallaxSportScene"),
  { ssr: false }
);

// Fallback image component with graceful error handling
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
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        {/* Accent glow */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${accentLine}`} />
        <div className="text-center relative z-10">
          <span className="text-5xl block mb-1 drop-shadow-lg" style={{ filter: "saturate(1.3)" }}>{emoji}</span>
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{isCricket ? "Cricket" : "Football"}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={`${className} ${gradientBg} animate-pulse flex items-center justify-center absolute inset-0`}>
          <span className="text-3xl">{emoji}</span>
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


// Reusable article card
function ArticleCard({ article, index }: { article: any; index: number }) {
  const isCricket = article.sport === "cricket";
  const badge = isCricket
    ? "bg-cricket/15 text-cricket border-cricket/30"
    : "bg-football/15 text-football border-football/30";
  const glow = isCricket ? "hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]" : "hover:shadow-[0_0_20px_rgba(57,255,20,0.15)]";
  const accent = isCricket ? "text-cricket" : "text-football";
  const readingTime = Math.max(1, Math.ceil((article.summary?.length || 100) / 200));

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`group rounded-2xl overflow-hidden glass-card border border-dark-border hover:border-zinc-600 transition-all flex flex-col h-full ${glow}`}
    >
      <Link href={`/news/${article.id}`} className="flex flex-col h-full">
        <div className="relative h-48 overflow-hidden">
          <NewsImage
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sport={article.sport}
          />
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${badge}`}>
              {article.sport}
            </span>
            {article.featured && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-red-500/20 text-red-400 border border-red-500/30">
                Featured
              </span>
            )}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.time_ago}</span>
            <span className="text-zinc-700">•</span>
            <span>{readingTime} min read</span>
          </div>
          <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-snug group-hover:text-white transition-colors">
            {article.title}
          </h3>
          <p className="text-zinc-500 text-sm mb-4 line-clamp-2 flex-grow">{article.summary}</p>
          <span className={`inline-flex items-center font-semibold text-xs ${accent} group-hover:underline mt-auto`}>
            Read Full Story <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function HeroArticle({ article, sport }: { article: any; sport: string }) {
  const accent = sport === "cricket" ? "text-cricket" : "text-football";

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-6">
      <Link href={`/news/${article.id}`} className="group block relative rounded-2xl overflow-hidden glass-card border border-dark-border hover:border-zinc-600 transition-all cursor-pointer">
        <div className="relative h-[280px] md:h-[380px] overflow-hidden">
          <NewsImage
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            sport={sport}
          />
          <div className="hero-card-overlay absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                sport === "cricket" ? "bg-cricket/15 text-cricket border border-cricket/30" : "bg-football/15 text-football border border-football/30"
              }`}>{sport}</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-white leading-tight mb-2 max-w-2xl">{article.title}</h2>
            <p className="text-zinc-400 text-sm max-w-xl line-clamp-2 mb-2">{article.summary}</p>
            <div className="flex items-center gap-3 text-zinc-500 text-sm">
              <Clock className="w-4 h-4" /><span>{article.time_ago}</span>
              <span className={`${accent} font-semibold group-hover:underline ml-auto flex items-center gap-1`}>
                Read Story <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Section component for each sport
function SportNewsSection({ sport, articles, parallaxSport }: { sport: "cricket" | "football"; articles: any[]; parallaxSport: "cricket" | "football" }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const h = ref.current.offsetHeight;
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (h + vh)));
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featured = articles.find((a: any) => a.featured) || articles[0];
  const rest = articles.filter((a) => a !== featured);

  const isCricket = sport === "cricket";
  const accentColor = isCricket ? "text-cricket" : "text-football";
  const glowStyle = isCricket
    ? { textShadow: "0 0 30px rgba(0,255,255,0.3)" }
    : { textShadow: "0 0 30px rgba(57,255,20,0.3)" };

  return (
    <section id={`news-${sport}`} ref={ref} className="relative min-h-[60vh] overflow-hidden">
      <ParallaxSportScene sport={parallaxSport} scrollProgress={scrollProgress} />
      <div className="relative z-10 py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Section Title */}
          <motion.div className="mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{isCricket ? "🏏" : "⚽"}</span>
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  {isCricket ? "Cricket" : "Football"}{" "}
                  <span className={accentColor} style={glowStyle}>News</span>
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  {isCricket ? "Latest stories from the world of cricket" : "Breaking headlines from the beautiful game"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Featured + Grid */}
          {articles.length > 0 ? (
            <>
              {featured && <HeroArticle article={featured} sport={sport} />}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-zinc-500 text-center py-8 glass-card rounded-2xl p-6">
              No {sport} news right now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"cricket" | "football">("cricket");

  useEffect(() => {
    const fetchNews = async () => {
      // 1. Fetch AI-rewritten PulseSports articles from Supabase
      let dbArticles: any[] = [];
      try {
        const { supabase } = await import("@/utils/supabase/client");
        const { data } = await supabase
          .from("news")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);
        if (data) dbArticles = data;
      } catch (_) {}

      // 2. Fetch live ESPN articles
      let espnArticles: any[] = [];
      try {
        const res = await fetch("/api/sports-news");
        if (res.ok) {
          const json = await res.json();
          espnArticles = json.articles || [];
        }
      } catch (_) {}

      // 3. Merge: AI-rewritten first (PulseSports originals), then ESPN live
      //    Deduplicate by normalized title to prevent showing both versions
      const seen = new Set<string>();
      const merged: any[] = [];

      for (const article of dbArticles) {
        const key = article.title?.toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          merged.push({ ...article, source: "pulsesports" });
        }
      }

      for (const article of espnArticles) {
        const key = article.title?.toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          merged.push(article);
        }
      }

      setNewsArticles(merged);
      setLoading(false);
    };
    fetchNews();
  }, []);

  // Track active section for quick nav
  useEffect(() => {
    const handleScroll = () => {
      const fb = document.getElementById("news-football");
      if (fb) {
        const r = fb.getBoundingClientRect();
        setActiveSection(r.top < window.innerHeight * 0.5 ? "football" : "cricket");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cricketNews = newsArticles.filter((a) => a.sport === "cricket");
  const footballNews = newsArticles.filter((a) => a.sport === "football");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 md:pb-0">
      <Header />

      {/* Quick Nav — same style as home */}
      <div className="quick-nav">
        <button
          onClick={() => document.getElementById("news-cricket")?.scrollIntoView({ behavior: "smooth" })}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === "cricket" ? "bg-cricket/15 text-cricket" : "text-zinc-500 hover:text-white"
          }`}
        >
          🏏 Cricket
        </button>
        <button
          onClick={() => document.getElementById("news-football")?.scrollIntoView({ behavior: "smooth" })}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === "football" ? "bg-football/15 text-football" : "text-zinc-500 hover:text-white"
          }`}
        >
          ⚽ Football
        </button>
      </div>

      {/* Page Title */}
      <div className="relative z-10 pt-10 pb-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-cricket" />
              <span className="text-cricket text-xs font-bold uppercase tracking-widest">Breaking Stories</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Sports News</h1>
            <p className="text-zinc-500 text-sm mt-2">Real-time coverage powered by ESPN</p>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className="container mx-auto px-4 max-w-6xl py-10 md:py-16">
          <HeroSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        </div>
      ) : (
        <>
          {/* Cricket News Section */}
          <SportNewsSection sport="cricket" articles={cricketNews} parallaxSport="cricket" />

          {/* Divider */}
          <div className="relative z-10 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          {/* Football News Section */}
          <SportNewsSection sport="football" articles={footballNews} parallaxSport="football" />
        </>
      )}
    </div>
  );
}
