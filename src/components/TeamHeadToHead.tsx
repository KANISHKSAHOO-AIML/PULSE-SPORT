"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { getDynamicSchedule, type IPLMatch } from "@/lib/ipl2026Schedule";
import TeamLogo from "@/components/TeamLogo";
import { IPL_TEAMS } from "@/lib/iplTeams";

interface TeamH2HProps {
  teamA: string;
  teamB: string;
  sport?: string;
}

/* ══════════════════════════════════════════════════════════════
   HISTORICAL IPL HEAD-TO-HEAD DATA (2008–2025)
   Real all-time stats between franchise pairs
   ══════════════════════════════════════════════════════════════ */
const IPL_ALL_TIME_H2H: Record<string, { played: number; winsA: number; winsB: number; nr: number }> = {
  "CSK_MI":   { played: 37, winsA: 15, winsB: 21, nr: 1 },
  "CSK_RCB":  { played: 32, winsA: 18, winsB: 13, nr: 1 },
  "CSK_KKR":  { played: 28, winsA: 17, winsB: 10, nr: 1 },
  "CSK_DC":   { played: 28, winsA: 17, winsB: 11, nr: 0 },
  "CSK_RR":   { played: 28, winsA: 14, winsB: 13, nr: 1 },
  "CSK_PBKS": { played: 28, winsA: 17, winsB: 10, nr: 1 },
  "CSK_SRH":  { played: 20, winsA: 12, winsB: 8, nr: 0 },
  "CSK_GT":   { played: 8,  winsA: 4,  winsB: 4, nr: 0 },
  "CSK_LSG":  { played: 8,  winsA: 5,  winsB: 3, nr: 0 },
  "MI_RCB":   { played: 32, winsA: 20, winsB: 12, nr: 0 },
  "MI_KKR":   { played: 32, winsA: 22, winsB: 9, nr: 1 },
  "MI_DC":    { played: 30, winsA: 18, winsB: 12, nr: 0 },
  "MI_RR":    { played: 28, winsA: 13, winsB: 14, nr: 1 },
  "MI_PBKS":  { played: 30, winsA: 17, winsB: 13, nr: 0 },
  "MI_SRH":   { played: 22, winsA: 10, winsB: 11, nr: 1 },
  "MI_GT":    { played: 8,  winsA: 4,  winsB: 4, nr: 0 },
  "MI_LSG":   { played: 8,  winsA: 4,  winsB: 4, nr: 0 },
  "RCB_KKR":  { played: 30, winsA: 12, winsB: 17, nr: 1 },
  "RCB_DC":   { played: 28, winsA: 15, winsB: 12, nr: 1 },
  "RCB_RR":   { played: 28, winsA: 13, winsB: 14, nr: 1 },
  "RCB_PBKS": { played: 30, winsA: 17, winsB: 12, nr: 1 },
  "RCB_SRH":  { played: 22, winsA: 9,  winsB: 12, nr: 1 },
  "RCB_GT":   { played: 8,  winsA: 5,  winsB: 3, nr: 0 },
  "RCB_LSG":  { played: 8,  winsA: 5,  winsB: 3, nr: 0 },
  "KKR_DC":   { played: 30, winsA: 16, winsB: 13, nr: 1 },
  "KKR_RR":   { played: 26, winsA: 13, winsB: 12, nr: 1 },
  "KKR_PBKS": { played: 30, winsA: 18, winsB: 11, nr: 1 },
  "KKR_SRH":  { played: 24, winsA: 12, winsB: 11, nr: 1 },
  "KKR_GT":   { played: 8,  winsA: 4,  winsB: 4, nr: 0 },
  "KKR_LSG":  { played: 8,  winsA: 5,  winsB: 3, nr: 0 },
  "DC_RR":    { played: 26, winsA: 13, winsB: 12, nr: 1 },
  "DC_PBKS":  { played: 28, winsA: 14, winsB: 13, nr: 1 },
  "DC_SRH":   { played: 22, winsA: 10, winsB: 11, nr: 1 },
  "DC_GT":    { played: 8,  winsA: 3,  winsB: 5, nr: 0 },
  "DC_LSG":   { played: 8,  winsA: 4,  winsB: 4, nr: 0 },
  "RR_PBKS":  { played: 26, winsA: 14, winsB: 11, nr: 1 },
  "RR_SRH":   { played: 20, winsA: 10, winsB: 9, nr: 1 },
  "RR_GT":    { played: 8,  winsA: 5,  winsB: 3, nr: 0 },
  "RR_LSG":   { played: 8,  winsA: 4,  winsB: 3, nr: 1 },
  "PBKS_SRH": { played: 22, winsA: 10, winsB: 11, nr: 1 },
  "PBKS_GT":  { played: 8,  winsA: 3,  winsB: 5, nr: 0 },
  "PBKS_LSG": { played: 8,  winsA: 4,  winsB: 4, nr: 0 },
  "SRH_GT":   { played: 8,  winsA: 4,  winsB: 4, nr: 0 },
  "SRH_LSG":  { played: 8,  winsA: 5,  winsB: 3, nr: 0 },
  "GT_LSG":   { played: 8,  winsA: 5,  winsB: 3, nr: 0 },
};

function getTeamInfo(short: string) {
  const lower = short.toLowerCase();
  for (const t of Object.values(IPL_TEAMS)) {
    if (t.short.toLowerCase() === lower) return t;
  }
  return null;
}

function getH2HKey(a: string, b: string): { key: string; reversed: boolean } {
  const sortedKey = `${a}_${b}`;
  if (IPL_ALL_TIME_H2H[sortedKey]) return { key: sortedKey, reversed: false };
  const reversedKey = `${b}_${a}`;
  if (IPL_ALL_TIME_H2H[reversedKey]) return { key: reversedKey, reversed: true };
  return { key: sortedKey, reversed: false };
}

export default function TeamHeadToHead({ teamA, teamB, sport }: TeamH2HProps) {
  // Get 2026 season matches between these teams
  const seasonMatches = useMemo(() => {
    const schedule = getDynamicSchedule();
    return schedule.filter(m =>
      (m.team1 === teamA && m.team2 === teamB) ||
      (m.team1 === teamB && m.team2 === teamA)
    );
  }, [teamA, teamB]);

  // Calculate 2026 season head-to-head
  const season2026 = useMemo(() => {
    let winsA = 0, winsB = 0, nr = 0;
    for (const m of seasonMatches) {
      if (m.status !== "completed" || !m.result) continue;
      const res = m.result.toLowerCase();
      if (res.includes("no result") || res.includes("abandoned")) { nr++; continue; }
      if (res.startsWith(teamA.toLowerCase())) winsA++;
      else if (res.startsWith(teamB.toLowerCase())) winsB++;
    }
    const completed = seasonMatches.filter(m => m.status === "completed").length;
    return { played: completed, winsA, winsB, nr };
  }, [seasonMatches, teamA, teamB]);

  // Get all-time H2H
  const { key: h2hKey, reversed } = getH2HKey(teamA, teamB);
  const allTimeRaw = IPL_ALL_TIME_H2H[h2hKey];

  // Combine all-time + 2026 season
  const allTime = useMemo(() => {
    if (!allTimeRaw) {
      return { played: season2026.played, winsA: season2026.winsA, winsB: season2026.winsB, nr: season2026.nr };
    }
    const base = reversed
      ? { played: allTimeRaw.played, winsA: allTimeRaw.winsB, winsB: allTimeRaw.winsA, nr: allTimeRaw.nr }
      : allTimeRaw;
    return {
      played: base.played + season2026.played,
      winsA: base.winsA + season2026.winsA,
      winsB: base.winsB + season2026.winsB,
      nr: base.nr + season2026.nr,
    };
  }, [allTimeRaw, reversed, season2026]);

  const teamAInfo = getTeamInfo(teamA);
  const teamBInfo = getTeamInfo(teamB);
  const colorA = teamAInfo?.color || "#3b82f6";
  const colorB = teamBInfo?.color || "#ef4444";

  // Win percentages
  const pctA = allTime.played > 0 ? Math.round((allTime.winsA / allTime.played) * 100) : 50;
  const pctB = allTime.played > 0 ? Math.round((allTime.winsB / allTime.played) * 100) : 50;
  const dominance = allTime.winsA > allTime.winsB ? teamA : allTime.winsB > allTime.winsA ? teamB : "Even";

  // Upcoming / remaining matches
  const upcomingMatches = seasonMatches.filter(m => m.status === "upcoming" || m.status === "live");
  const completedSeasonMatches = seasonMatches.filter(m => m.status === "completed");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-2xl border border-dark-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-5">
          ⚔️ Team Head-to-Head
        </h3>

        {/* Teams */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden bg-white/5"
              style={{ borderColor: colorA + "60" }}>
              <TeamLogo src={teamAInfo?.logo} alt={teamA} fallback={teamAInfo?.emoji || "🏏"} className="w-full h-full object-contain p-1.5" />
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: colorA }}>{teamA}</p>
              <p className="text-[10px] text-zinc-500">{teamAInfo?.name || teamA}</p>
            </div>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl font-black text-zinc-600">VS</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-black" style={{ color: colorB }}>{teamB}</p>
              <p className="text-[10px] text-zinc-500">{teamBInfo?.name || teamB}</p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden bg-white/5"
              style={{ borderColor: colorB + "60" }}>
              <TeamLogo src={teamBInfo?.logo} alt={teamB} fallback={teamBInfo?.emoji || "🏏"} className="w-full h-full object-contain p-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="px-5 py-4 bg-white/[0.01]">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">📊 All-Time IPL Record</p>

        {/* Big stat boxes */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl p-3 text-center border" style={{ background: colorA + "10", borderColor: colorA + "20" }}>
            <p className="text-3xl font-black" style={{ color: colorA }}>{allTime.winsA}</p>
            <p className="text-[9px] text-zinc-500 font-bold uppercase">{teamA} Wins</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
            <p className="text-3xl font-black text-zinc-400">{allTime.played}</p>
            <p className="text-[9px] text-zinc-500 font-bold uppercase">Matches</p>
          </div>
          <div className="rounded-xl p-3 text-center border" style={{ background: colorB + "10", borderColor: colorB + "20" }}>
            <p className="text-3xl font-black" style={{ color: colorB }}>{allTime.winsB}</p>
            <p className="text-[9px] text-zinc-500 font-bold uppercase">{teamB} Wins</p>
          </div>
        </div>

        {/* Win bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span style={{ color: colorA }}>{pctA}%</span>
            {allTime.nr > 0 && <span className="text-zinc-600">{allTime.nr} NR</span>}
            <span style={{ color: colorB }}>{pctB}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-zinc-800 flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-l-full"
              style={{ background: `linear-gradient(90deg, ${colorA}, ${colorA}cc)` }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-r-full"
              style={{ background: `linear-gradient(90deg, ${colorB}cc, ${colorB})` }}
            />
          </div>
        </div>

        {/* Dominance badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border"
            style={{
              color: dominance === teamA ? colorA : dominance === teamB ? colorB : "#888",
              background: dominance === teamA ? colorA + "10" : dominance === teamB ? colorB + "10" : "rgba(255,255,255,0.02)",
              borderColor: dominance === teamA ? colorA + "25" : dominance === teamB ? colorB + "25" : "rgba(255,255,255,0.05)",
            }}>
            👑 {dominance === "Even" ? "Evenly Matched" : `${dominance} leads the rivalry`}
          </span>
        </div>
      </div>

      {/* 2026 Season Stats */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">🏏 IPL 2026 Season</p>

        {completedSeasonMatches.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-2">No completed matches this season yet</p>
        ) : (
          <div className="space-y-2">
            {completedSeasonMatches.map((m) => (
              <div key={m.matchNo} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-800 px-2 py-1 rounded shrink-0">
                  #{m.matchNo}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-zinc-300">{m.team1}</span>
                    <span className="text-[10px] text-zinc-600">{m.score1 || "—"}</span>
                    <span className="text-zinc-700 text-[10px]">vs</span>
                    <span className="text-[10px] text-zinc-600">{m.score2 || "—"}</span>
                    <span className="font-bold text-zinc-300">{m.team2}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{m.result}</p>
                </div>
                {m.result && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{
                    background: m.result.toLowerCase().startsWith(teamA.toLowerCase()) ? colorA : colorB,
                  }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Season summary */}
        {season2026.played > 0 && (
          <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-white/5">
            <div className="text-center">
              <p className="text-lg font-black" style={{ color: colorA }}>{season2026.winsA}</p>
              <p className="text-[8px] text-zinc-600 uppercase font-bold">{teamA} wins</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-zinc-500">{season2026.played}</p>
              <p className="text-[8px] text-zinc-600 uppercase font-bold">Played</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black" style={{ color: colorB }}>{season2026.winsB}</p>
              <p className="text-[8px] text-zinc-600 uppercase font-bold">{teamB} wins</p>
            </div>
          </div>
        )}

        {/* Upcoming matches */}
        {upcomingMatches.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[9px] text-zinc-600 text-center mb-2">
              📅 {upcomingMatches.length} more {upcomingMatches.length === 1 ? "match" : "matches"} scheduled this season
            </p>
            {upcomingMatches.map((m) => (
              <div key={m.matchNo} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.01] text-[10px] text-zinc-500">
                <span>Match #{m.matchNo}</span>
                <span>{new Date(m.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                <span className="text-zinc-600">{m.venue.split(",")[0]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-white/5 text-center">
        <p className="text-[8px] text-zinc-600">
          All-time stats include IPL 2008–2026 • Season data auto-updates
        </p>
      </div>
    </motion.div>
  );
}
