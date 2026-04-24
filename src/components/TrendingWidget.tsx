"use client";

import { motion } from "framer-motion";
import { TrendingUp, Flame, Eye, Clock } from "lucide-react";
import Link from "next/link";

const TRENDING_ITEMS = [
  {
    id: "mock-news-2",
    type: "news" as const,
    sport: "cricket",
    title: "India's Captain Smashes Unbeaten Century",
    engagement: "12.5K",
    hot: true,
  },
  {
    id: "mock-high-1",
    type: "highlight" as const,
    sport: "football",
    title: "90th Minute Bicycle Kick — UCL Final",
    engagement: "8.2K",
    hot: true,
  },
  {
    id: "mock-news-3",
    type: "news" as const,
    sport: "football",
    title: "Arsenal vs Liverpool: Title Race Heats Up",
    engagement: "6.1K",
    hot: false,
  },
  {
    id: "mock-high-6",
    type: "highlight" as const,
    sport: "cricket",
    title: "Last Ball Six Wins the World Cup!",
    engagement: "5.4K",
    hot: true,
  },
  {
    id: "mock-news-5",
    type: "news" as const,
    sport: "football",
    title: "Record €220M Transfer Completed",
    engagement: "4.9K",
    hot: false,
  },
];

export default function TrendingWidget() {
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
        <Flame className="w-3.5 h-3.5 text-orange-500 ml-auto animate-pulse" />
      </div>

      {/* Items */}
      <div className="divide-y divide-zinc-800/50">
        {TRENDING_ITEMS.map((item, i) => {
          const href = item.type === "news" ? `/news/${item.id}` : `/highlights/${item.id}`;
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
        })}
      </div>
    </motion.div>
  );
}
