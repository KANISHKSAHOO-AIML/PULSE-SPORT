"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Activity } from "lucide-react";

export default function LiveTicker() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchLive = async () => {
      const { data } = await supabase
        .from("matches")
        .select("id, sport, team_a, team_b, score_a, score_b, status, live")
        .eq("live", true)
        .limit(10);
      if (data && data.length > 0) setMatches(data);
    };
    fetchLive();

    // Refresh every 30s
    const interval = setInterval(fetchLive, 30000);

    // Real-time updates
    const channel = supabase
      .channel("ticker-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches" }, (payload) => {
        setMatches((prev) =>
          prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
        );
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (matches.length === 0) return null;

  // Double the items for seamless infinite scroll
  const items = [...matches, ...matches];

  return (
    <div className="w-full bg-[#0d0d0d] border-b border-zinc-900 overflow-hidden relative z-40">
      <div className="flex items-center">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-red-500/15 border-r border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live</span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-track flex gap-8 whitespace-nowrap py-1.5 px-4">
            {items.map((m, i) => (
              <a
                key={`${m.id}-${i}`}
                href={`/matches/${m.id}`}
                className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors shrink-0"
              >
                <span className={`w-1 h-1 rounded-full ${m.sport === "cricket" ? "bg-cricket" : "bg-football"}`} />
                <span className="font-semibold text-zinc-300">{m.team_a}</span>
                <span className="text-white font-bold">{m.score_a}</span>
                <span className="text-zinc-600">vs</span>
                <span className="text-white font-bold">{m.score_b}</span>
                <span className="font-semibold text-zinc-300">{m.team_b}</span>
                <span className="text-zinc-600 text-[10px]">•</span>
                <span className="text-zinc-500 text-[10px]">{m.status}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
