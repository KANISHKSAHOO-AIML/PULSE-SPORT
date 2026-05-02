"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Clock, Bookmark, Share2, Loader2, Tag, Zap, RefreshCw } from "lucide-react";

interface MatchReportProps {
  matchId: string | number;
  sport: string;
  teamA: string;
  teamB: string;
}

interface Report {
  headline: string;
  subheadline: string;
  report: string;
  keyMoments?: { time: string; event: string; description: string }[];
  manOfTheMatch?: { name: string; performance: string };
  fanVerdict?: string;
  tags?: string[];
  generatedAt?: string;
  fallback?: boolean;
}

export default function MatchReport({ matchId, sport, teamA, teamB }: MatchReportProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/match-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchReport();
  }, [matchId]);

  if (loading) {
    return (
      <div className="glass-depth-2 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span className="text-sm font-bold">Generating AI Match Report...</span>
        </div>
        <p className="text-xs text-zinc-600 mt-2">Powered by Gemini AI</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="glass-depth-2 rounded-2xl p-6 text-center">
        <Brain className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-400 mb-3">Unable to generate match report</p>
        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  const isCricket = sport === "cricket";
  const accentColor = isCricket ? "text-cyan-400" : "text-green-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-depth-2 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Match Report</h3>
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">Powered by Gemini</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {report.generatedAt && (
            <span className="text-[9px] text-zinc-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(report.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Headline */}
        <h2 className="text-xl font-black text-white leading-tight mb-2">
          {report.headline}
        </h2>
        <p className="text-sm text-zinc-400 mb-5">{report.subheadline}</p>

        {/* Report body */}
        <div className="text-sm text-zinc-300 leading-relaxed mb-6 space-y-3">
          {report.report.split("\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Key Moments */}
        {report.keyMoments && report.keyMoments.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Key Moments
            </h4>
            <div className="space-y-2">
              {report.keyMoments.map((moment, i) => (
                <div key={i} className="flex gap-3 p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded h-fit shrink-0">
                    {moment.time}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{moment.event}</p>
                    <p className="text-[11px] text-zinc-500">{moment.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Man of the Match */}
        {report.manOfTheMatch && (
          <div className="mb-6 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏆</span>
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Player of the Match</span>
            </div>
            <p className="text-sm font-bold text-white">{report.manOfTheMatch.name}</p>
            <p className="text-xs text-zinc-400">{report.manOfTheMatch.performance}</p>
          </div>
        )}

        {/* Fan Verdict */}
        {report.fanVerdict && (
          <div className="mb-5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <p className="text-xs font-bold text-blue-400 mb-1">💬 Fan Debate</p>
            <p className="text-sm text-white font-medium">{report.fanVerdict}</p>
          </div>
        )}

        {/* Tags */}
        {report.tags && report.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {report.tags.map((tag, i) => (
              <span key={i} className="text-[10px] bg-white/5 text-zinc-500 px-2 py-1 rounded-full border border-white/5 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
