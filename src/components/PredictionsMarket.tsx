"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, Zap, Clock, CheckCircle, Target } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface PredictionMarket {
  id: string;
  question: string;
  type: "yes_no" | "over_under";
  category: string;
  yesVotes: number;
  noVotes: number;
  threshold?: number;
  status: "open" | "resolved";
  result?: boolean;
}

interface PredictionsMarketProps {
  match: {
    id: string;
    team_a: string;
    team_b: string;
    sport: string;
    live: boolean;
    score_a: string;
    score_b: string;
  };
}

// Generate dynamic prediction questions based on match context
function generateQuestions(match: PredictionsMarketProps["match"]): PredictionMarket[] {
  const isCricket = match.sport === "cricket";

  if (isCricket) {
    return [
      {
        id: `${match.id}-century`,
        question: `Will any batsman score a century?`,
        type: "yes_no",
        category: "Batting",
        yesVotes: 0, noVotes: 0,
        status: "open",
      },
      {
        id: `${match.id}-total`,
        question: `Total match runs over 350?`,
        type: "over_under",
        category: "Scoring",
        yesVotes: 0, noVotes: 0,
        threshold: 350,
        status: "open",
      },
      {
        id: `${match.id}-wickets`,
        question: `Will there be a 5-wicket haul?`,
        type: "yes_no",
        category: "Bowling",
        yesVotes: 0, noVotes: 0,
        status: "open",
      },
      {
        id: `${match.id}-pp`,
        question: `${match.team_a} to score 50+ in powerplay?`,
        type: "yes_no",
        category: "Powerplay",
        yesVotes: 0, noVotes: 0,
        status: "open",
      },
      {
        id: `${match.id}-chase`,
        question: `Will the chasing team win?`,
        type: "yes_no",
        category: "Strategy",
        yesVotes: 0, noVotes: 0,
        status: "open",
      },
    ];
  }

  // Football questions
  return [
    {
      id: `${match.id}-goals`,
      question: `Over 2.5 total goals?`,
      type: "over_under",
      category: "Goals",
      yesVotes: 0, noVotes: 0,
      threshold: 2.5,
      status: "open",
    },
    {
      id: `${match.id}-btts`,
      question: `Both teams to score?`,
      type: "yes_no",
      category: "Scoring",
      yesVotes: 0, noVotes: 0,
      status: "open",
    },
    {
      id: `${match.id}-clean`,
      question: `Will there be a clean sheet?`,
      type: "yes_no",
      category: "Defense",
      yesVotes: 0, noVotes: 0,
      status: "open",
    },
    {
      id: `${match.id}-card`,
      question: `More than 3 cards in the match?`,
      type: "over_under",
      category: "Discipline",
      yesVotes: 0, noVotes: 0,
      threshold: 3,
      status: "open",
    },
    {
      id: `${match.id}-first`,
      question: `${match.team_a} to score first?`,
      type: "yes_no",
      category: "First Goal",
      yesVotes: 0, noVotes: 0,
      status: "open",
    },
  ];
}

export default function PredictionsMarket({ match }: PredictionsMarketProps) {
  const [questions, setQuestions] = useState<PredictionMarket[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, "yes" | "no">>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const generated = generateQuestions(match);

    // Load from localStorage
    const stored = localStorage.getItem(`pulse-market-${match.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged = generated.map(q => {
          const savedQ = parsed.questions?.find((sq: any) => sq.id === q.id);
          return savedQ ? { ...q, yesVotes: savedQ.yesVotes, noVotes: savedQ.noVotes } : q;
        });
        setQuestions(merged);
        setUserVotes(parsed.userVotes || {});
      } catch {
        setQuestions(generated);
      }
    } else {
      // Seed with random community votes for engagement
      const seeded = generated.map(q => ({
        ...q,
        yesVotes: Math.floor(Math.random() * 80) + 20,
        noVotes: Math.floor(Math.random() * 60) + 15,
      }));
      setQuestions(seeded);
    }
  }, [match.id]);

  const vote = (questionId: string, choice: "yes" | "no") => {
    if (userVotes[questionId]) return; // Already voted

    setUserVotes(prev => ({ ...prev, [questionId]: choice }));
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          yesVotes: choice === "yes" ? q.yesVotes + 1 : q.yesVotes,
          noVotes: choice === "no" ? q.noVotes + 1 : q.noVotes,
        };
      })
    );

    // Persist
    const updated = questions.map(q => {
      if (q.id !== questionId) return q;
      return {
        ...q,
        yesVotes: choice === "yes" ? q.yesVotes + 1 : q.yesVotes,
        noVotes: choice === "no" ? q.noVotes + 1 : q.noVotes,
      };
    });
    localStorage.setItem(`pulse-market-${match.id}`, JSON.stringify({
      questions: updated,
      userVotes: { ...userVotes, [questionId]: choice },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-depth-2 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          Predictions Market
        </h3>
        <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">
          {questions.filter(q => q.status === "open").length} open
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const total = q.yesVotes + q.noVotes;
          const yesPct = total > 0 ? Math.round((q.yesVotes / total) * 100) : 50;
          const noPct = 100 - yesPct;
          const voted = userVotes[q.id];
          const isExpanded = expandedId === q.id;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border transition-all ${
                voted
                  ? "border-zinc-700/50 bg-zinc-900/30"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full p-3 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[9px] bg-white/5 text-zinc-500 px-1.5 py-0.5 rounded font-bold uppercase">{q.category}</span>
                    <p className={`text-xs font-bold truncate ${voted ? "text-zinc-400" : "text-white"}`}>
                      {q.question}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[9px] text-zinc-600 font-mono">{total} votes</span>
                    {voted && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  </div>
                </div>

                {/* Progress bar always visible */}
                <div className="flex gap-0.5 mt-2 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500/60 rounded-l-full transition-all duration-500"
                    style={{ width: `${yesPct}%` }}
                  />
                  <div
                    className="bg-red-500/60 rounded-r-full transition-all duration-500"
                    style={{ width: `${noPct}%` }}
                  />
                </div>
              </button>

              {/* Expanded vote area */}
              <AnimatePresence>
                {isExpanded && !voted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); vote(q.id, "yes"); }}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center justify-center gap-1"
                      >
                        ✅ Yes ({yesPct}%)
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); vote(q.id, "no"); }}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1"
                      >
                        ❌ No ({noPct}%)
                      </button>
                    </div>
                  </motion.div>
                )}
                {isExpanded && voted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">
                        Your vote: <span className={`font-bold ${voted === "yes" ? "text-green-400" : "text-red-400"}`}>{voted === "yes" ? "Yes" : "No"}</span>
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                        <span className="text-green-400 font-bold">Yes {yesPct}%</span>
                        <span className="text-red-400 font-bold">No {noPct}%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[9px] text-zinc-600 text-center mt-3 flex items-center justify-center gap-1">
        <Users className="w-3 h-3" /> Community-driven predictions • For entertainment only
      </p>
    </motion.div>
  );
}
