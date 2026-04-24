"use client";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Circle } from "lucide-react";
import { IPL_TEAMS } from "@/lib/iplTeams";
import { IPL_2026_SCHEDULE, IPLMatch } from "@/lib/ipl2026Schedule";
import TeamLogo from "@/components/TeamLogo";

function getTeamLogo(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (lower.includes(t.short.toLowerCase()) || lower.includes(t.city.toLowerCase()) || lower.includes(t.name.toLowerCase())) return t.logo;
  }
  return undefined;
}

function getTeamColor(name: string): string {
  const lower = name.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (lower.includes(t.short.toLowerCase()) || lower.includes(t.city.toLowerCase()) || lower.includes(t.name.toLowerCase())) return t.color;
  }
  return "#888";
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", weekday: "short" });
}

function formatTime(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function IPLSchedule() {
  return (
    <div className="grid gap-4 max-w-4xl mx-auto">
      {IPL_2026_SCHEDULE.map((match, i) => {
        const isLive = match.status === "live";
        const isCompleted = match.status === "completed";
        const logo1 = getTeamLogo(match.team1);
        const logo2 = getTeamLogo(match.team2);
        const color1 = getTeamColor(match.team1);
        const color2 = getTeamColor(match.team2);

        return (
          <motion.div
            key={match.matchNo}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`flex flex-col md:flex-row items-center justify-between p-4 md:p-5 rounded-2xl border ${isLive ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-[#0d0d1a]/80 backdrop-blur-xl'} hover:border-white/10 transition-colors`}
          >
            {/* Match Info */}
            <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
              <div className="w-12 text-center shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Match</span>
                <p className="text-xl font-black text-white">{match.matchNo}</p>
              </div>
              <div className="w-px h-10 bg-white/10 hidden md:block" />
              <div>
                <p className="text-sm font-semibold text-zinc-300">
                  {formatDate(match.date)} • <span className="text-amber-400">{formatTime(match.date)}</span>
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{match.venue}</p>
              </div>
            </div>

            {/* Teams & Score */}
            <div className="flex items-center justify-center gap-4 w-full md:w-auto flex-1 max-w-sm">
              <div className="flex flex-col items-center w-24">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 mb-1" style={{ borderColor: color1 + '50' }}>
                  <TeamLogo src={logo1} alt={match.team1} fallback={<span className="text-xs">{match.team1}</span>} className="w-full h-full object-contain p-1" />
                </div>
                <span className="font-bold text-sm">{match.team1}</span>
                {match.score1 && <span className="text-xs text-zinc-400 font-mono mt-0.5">{match.score1}</span>}
              </div>

              <div className="text-xs font-black text-zinc-600 ipl-vs-glow px-2">VS</div>

              <div className="flex flex-col items-center w-24">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 mb-1" style={{ borderColor: color2 + '50' }}>
                  <TeamLogo src={logo2} alt={match.team2} fallback={<span className="text-xs">{match.team2}</span>} className="w-full h-full object-contain p-1" />
                </div>
                <span className="font-bold text-sm">{match.team2}</span>
                {match.score2 && <span className="text-xs text-zinc-400 font-mono mt-0.5">{match.score2}</span>}
              </div>
            </div>

            {/* Status / Result */}
            <div className="w-full md:w-48 text-center md:text-right mt-4 md:mt-0 shrink-0">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  <Circle className="w-2.5 h-2.5 fill-current animate-pulse" /> LIVE
                </span>
              ) : isCompleted ? (
                <div className="flex flex-col items-center md:items-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 mb-1">
                    <CheckCircle2 className="w-3 h-3" /> COMPLETED
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">{match.result}</span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                  <Clock className="w-3 h-3" /> UPCOMING
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
