"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Eye, Inbox } from "lucide-react";
import Link from "next/link";

interface TrendingItem {
  id: string;
  type: "news" | "highlight";
  sport: string;
  title: string;
  engagement: string;
  hot: boolean;
}

export default function TrendingWidget() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Fetch real trending news from the ESPN-powered API
        const res = await fetch("/api/sports-news");
        if (res.ok) {
          const json = await res.json();
          const articles = json.articles || [];
          if (articles.length > 0) {
            const mapped: TrendingItem[] = articles.slice(0, 5).map((a: any, i: number) => ({
              id: a.id || `trending-${i}`,
              type: "news" as const,
              sport: a.sport || "cricket",
              title: a.title,
              engagement: a.time_ago || "recent",
              hot: i < 2,
            }));
            setItems(mapped);
          }
        }
      } catch {
        // No data available
      }
      setLoading(false);
    };
    fetchTrending();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 60px -15px rgba(0,0,0,0.5), 0 0 30px rgba(249,115,22,0.05)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="glass-depth-2 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trending Now</h3>
        {items.length > 0 && (
          <Flame className="w-3.5 h-3.5 text-orange-500 ml-auto animate-pulse" />
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-zinc-800/50">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
              <div className="w-4 h-4 bg-zinc-800 rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-zinc-800 rounded w-3/4" />
                <div className="h-2 bg-zinc-800 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <Inbox className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-600 font-medium">No trending stories right now</p>
            <p className="text-[10px] text-zinc-700 mt-1">Check back soon for the latest buzz</p>
          </div>
        ) : (
          items.map((item, i) => {
            const href = `/news/${item.id}`;
            const sportIcon = item.sport === "cricket" ? "🏏" : "⚽";
            const typeColor = item.type === "news" ? "text-cricket" : "text-football";

            return (
              <Link key={item.id} href={href}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Rank number */}
                  <span className={`text-sm font-black shrink-0 mt-0.5 ${i < 3 ? "text-orange-500" : "text-zinc-600"}`}>
                    {i + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                      <span>{sportIcon}</span>
                      <span className={`uppercase font-bold tracking-wider ${typeColor}`}>
                        {item.type}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" /> {item.engagement}
                      </span>
                    </div>
                  </div>

                  {item.hot && (
                    <span className="shrink-0 text-[9px] bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded-full font-bold mt-0.5">
                      🔥 HOT
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
