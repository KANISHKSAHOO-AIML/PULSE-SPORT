"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeroSkeleton, NewsCardSkeleton } from "@/components/Skeletons";

const ParallaxSportScene = dynamic(
  () => import("@/components/ParallaxSportScene"),
  { ssr: false }
);

const MOCK_NEWS = [
  {
    id: "mock-news-1", sport: "football",
    title: "Champions League Semi-Final: Real Madrid's Dramatic Comeback Stuns the World",
    summary: "In one of the greatest Champions League nights in history, Real Madrid came back from 3-0 down to beat Manchester City 4-3 on aggregate with a stoppage-time winner.",
    image_url: "https://images.unsplash.com/photo-1518605368461-1ee7c588b4db?q=80&w=2938&auto=format&fit=crop",
    time_ago: "2 hours ago", featured: true, created_at: new Date().toISOString(),
  },
  {
    id: "mock-news-2", sport: "cricket",
    title: "India's Captain Smashes Unbeaten Century to Chase Down 380-Run Target",
    summary: "In a stunning display of skill and composure, the captain hit an unbeaten 175 off 138 balls to lead India to victory in the World Cup semi-final against Australia.",
    image_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2938&auto=format&fit=crop",
    time_ago: "5 hours ago", featured: true, created_at: new Date().toISOString(),
  },
  {
    id: "mock-news-3", sport: "football",
    title: "Premier League Title Race: Arsenal and Liverpool Locked in a Thrilling Battle",
    summary: "With just 5 matches remaining, Arsenal lead Liverpool by a single point in what has been the most competitive Premier League season in decades.",
    image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2893&auto=format&fit=crop",
    time_ago: "8 hours ago", created_at: new Date().toISOString(),
  },
  {
    id: "mock-news-4", sport: "cricket",
    title: "T20 Revolution: Rising Star Takes 5 Wickets in 4 Overs to Win Tournament",
    summary: "The 19-year-old fast bowler delivered a match-winning spell of 5/12 in the IPL final, announcing his arrival on the world stage with devastating pace and swing.",
    image_url: "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2940&auto=format&fit=crop",
    time_ago: "12 hours ago", created_at: new Date().toISOString(),
  },
  {
    id: "mock-news-5", sport: "football",
    title: "Transfer Bombshell: Star Striker Completes Record-Breaking €220M Move",
    summary: "The 24-year-old Brazilian forward has completed his transfer from Paris to Madrid in the most expensive deal in football history, signing a 6-year contract.",
    image_url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2938&auto=format&fit=crop",
    time_ago: "1 day ago", created_at: new Date().toISOString(),
  },
  {
    id: "mock-news-6", sport: "cricket",
    title: "England Announces Bold Squad for Ashes Series with Three Uncapped Players",
    summary: "The ECB has taken a gamble by selecting three uncapped players for the upcoming Ashes tour, backing youth and aggression over experience.",
    image_url: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=2940&auto=format&fit=crop",
    time_ago: "1 day ago", created_at: new Date().toISOString(),
  },
  {
    id: "mock-news-7", sport: "football",
    title: "World Cup 2026 Venues Revealed: 16 Stadiums Across Three Countries",
    summary: "FIFA has officially confirmed the 16 stadiums that will host the 2026 World Cup matches across the United States, Mexico, and Canada.",
    image_url: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=2942&auto=format&fit=crop",
    time_ago: "2 days ago", created_at: new Date().toISOString(),
  },
  {
    id: "mock-news-8", sport: "cricket",
    title: "Women's Cricket Breaks Viewership Records with Thrilling World Cup Final",
    summary: "The Women's Cricket World Cup final between India and Australia attracted over 90 million viewers globally, setting a new record for women's cricket.",
    image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2905&auto=format&fit=crop",
    time_ago: "3 days ago", created_at: new Date().toISOString(),
  },
];

// Reusable article card
function ArticleCard({ article, index }: { article: any; index: number }) {
  const accent = article.sport === "cricket" ? "text-cricket" : "text-football";
  const badge = article.sport === "cricket" ? "bg-cricket/10 text-cricket border-cricket/30" : "bg-football/10 text-football border-football/30";
  const glow = article.sport === "cricket" ? "card-glow-cricket" : "card-glow-football";
  const readingTime = Math.max(1, Math.ceil((article.summary?.length || 100) / 200));

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`group rounded-2xl overflow-hidden glass-card border border-dark-border hover:border-zinc-600 transition-all flex flex-col h-full ${glow}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-3 left-3 flex gap-2">
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
        <Link href={`/news/${article.id}`} className={`inline-flex items-center font-semibold text-xs ${accent} hover:underline`}>
          Read Full Story <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </motion.article>
  );
}

// Hero featured card
function HeroArticle({ article, sport }: { article: any; sport: string }) {
  const accent = sport === "cricket" ? "text-cricket" : "text-football";
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-6">
      <Link href={`/news/${article.id}`} className="group block relative rounded-2xl overflow-hidden glass-card border border-dark-border hover:border-zinc-600 transition-all">
        <div className="relative h-[280px] md:h-[380px] overflow-hidden">
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="hero-card-overlay absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3 ${
              sport === "cricket" ? "bg-cricket/15 text-cricket border border-cricket/30" : "bg-football/15 text-football border border-football/30"
            }`}>{sport}</span>
            <h2 className="text-xl md:text-3xl font-black text-white leading-tight mb-2 max-w-2xl">{article.title}</h2>
            <p className="text-zinc-400 text-sm max-w-xl line-clamp-2 mb-2">{article.summary}</p>
            <div className="flex items-center gap-3 text-zinc-500 text-sm">
              <Clock className="w-4 h-4" /><span>{article.time_ago}</span>
              <span className={`${accent} font-semibold group-hover:underline ml-auto flex items-center gap-1`}>Read Story <ArrowRight className="w-4 h-4" /></span>
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
      // 1. Try Supabase admin-published articles first
      const { data: supaData } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      // 2. Try real ESPN news API
      let espnArticles: any[] = [];
      try {
        const res = await fetch("/api/sports-news");
        if (res.ok) {
          const json = await res.json();
          espnArticles = json.articles || [];
        }
      } catch (_) {}

      // 3. Merge: Supabase first, then ESPN, then fallback to mock
      const merged = [
        ...(supaData || []),
        ...espnArticles.filter(
          (e) => !(supaData || []).some((s: any) => s.title === e.title)
        ),
      ];

      setNewsArticles(merged.length > 0 ? merged : MOCK_NEWS);
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
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
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
