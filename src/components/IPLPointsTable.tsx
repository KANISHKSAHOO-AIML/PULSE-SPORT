"use client";
import { motion } from "framer-motion";
import { IPL_TEAMS } from "@/lib/iplTeams";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

interface TableEntry {
  team: string; p: number; w: number; l: number; nr: number; nrr: string; pts: number;
}

interface Props {
  data: TableEntry[];
  year: number;
  compact?: boolean;
}

function getTeamColor(short: string): string {
  return IPL_TEAMS[short]?.color || "#888";
}

function getTeamName(short: string): string {
  return IPL_TEAMS[short]?.name || short;
}

function getTeamEmoji(short: string): string {
  return IPL_TEAMS[short]?.emoji || "🏏";
}

export default function IPLPointsTable({ data, year, compact }: Props) {
  const sorted = [...data].sort((a, b) => b.pts - a.pts || parseFloat(b.nrr) - parseFloat(a.nrr));

  return (
    <div className="ipl-points-table rounded-2xl overflow-hidden border border-white/5 bg-[#0d0d1a]/80 backdrop-blur-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-black text-lg">
          <span className="ipl-gradient-text">IPL {year}</span> Points Table
        </h3>
        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-full">{sorted.length} Teams</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">L</th>
              {!compact && <th className="px-4 py-3 text-center">NR</th>}
              <th className="px-4 py-3 text-center">NRR</th>
              <th className="px-4 py-3 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const color = getTeamColor(row.team);
              const isPlayoff = i < 4;
              return (
                <motion.tr
                  key={row.team}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] ${isPlayoff ? "bg-white/[0.02]" : ""}`}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isPlayoff ? "bg-green-500/20 text-green-400" : "text-zinc-500"}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getTeamEmoji(row.team)}</span>
                      <div>
                        <span className="font-bold" style={{ color }}>{row.team}</span>
                        {!compact && <p className="text-[10px] text-zinc-600">{getTeamName(row.team)}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-400">{row.p}</td>
                  <td className="px-4 py-3 text-center font-semibold text-green-400">{row.w}</td>
                  <td className="px-4 py-3 text-center font-semibold text-red-400">{row.l}</td>
                  {!compact && <td className="px-4 py-3 text-center text-zinc-500">{row.nr}</td>}
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono text-xs ${parseFloat(row.nrr) > 0 ? "text-green-400" : parseFloat(row.nrr) < 0 ? "text-red-400" : "text-zinc-500"}`}>
                      {parseFloat(row.nrr) > 0 ? "+" : ""}{row.nrr}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-black text-white bg-white/5 px-2 py-1 rounded-lg">{row.pts}</span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4 text-[10px] text-zinc-600">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/40" /> Playoff Qualifier</span>
      </div>
    </div>
  );
}
