"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Check, ChevronRight } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

const TEAMS = {
  cricket: [
    { name: "CSK", full: "Chennai Super Kings", emoji: "🦁", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
    { name: "MI", full: "Mumbai Indians", emoji: "🏏", color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
    { name: "RCB", full: "Royal Challengers Bengaluru", emoji: "👑", color: "bg-red-500/10 border-red-500/30 text-red-400" },
    { name: "KKR", full: "Kolkata Knight Riders", emoji: "⚔️", color: "bg-purple-500/10 border-purple-500/30 text-purple-400" },
    { name: "SRH", full: "Sunrisers Hyderabad", emoji: "🌅", color: "bg-orange-500/10 border-orange-500/30 text-orange-400" },
    { name: "DC", full: "Delhi Capitals", emoji: "🦅", color: "bg-blue-500/10 border-blue-500/30 text-blue-300" },
    { name: "GT", full: "Gujarat Titans", emoji: "⚡", color: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" },
    { name: "LSG", full: "Lucknow Super Giants", emoji: "🐘", color: "bg-teal-500/10 border-teal-500/30 text-teal-400" },
    { name: "RR", full: "Rajasthan Royals", emoji: "💎", color: "bg-pink-500/10 border-pink-500/30 text-pink-400" },
    { name: "PBKS", full: "Punjab Kings", emoji: "🗡️", color: "bg-red-500/10 border-red-500/30 text-red-500" },
    { name: "India", full: "Team India", emoji: "🇮🇳", color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
    { name: "Australia", full: "Australia", emoji: "🇦🇺", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
    { name: "England", full: "England", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "bg-blue-500/10 border-blue-500/30 text-blue-300" },
  ],
  football: [
    { name: "Arsenal", full: "Arsenal FC", emoji: "🔴", color: "bg-red-500/10 border-red-500/30 text-red-400" },
    { name: "Man City", full: "Manchester City", emoji: "🔵", color: "bg-sky-500/10 border-sky-500/30 text-sky-400" },
    { name: "Liverpool", full: "Liverpool FC", emoji: "🔴", color: "bg-red-500/10 border-red-500/30 text-red-500" },
    { name: "Chelsea", full: "Chelsea FC", emoji: "🔵", color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
    { name: "Real Madrid", full: "Real Madrid CF", emoji: "⚪", color: "bg-white/5 border-white/20 text-white" },
    { name: "Barcelona", full: "FC Barcelona", emoji: "🔵🔴", color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
    { name: "Bayern", full: "Bayern Munich", emoji: "🔴", color: "bg-red-500/10 border-red-500/30 text-red-400" },
    { name: "PSG", full: "Paris Saint-Germain", emoji: "🔵", color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
    { name: "Juventus", full: "Juventus FC", emoji: "⚫⚪", color: "bg-zinc-500/10 border-zinc-500/30 text-zinc-300" },
    { name: "Man United", full: "Manchester United", emoji: "🔴", color: "bg-red-500/10 border-red-500/30 text-red-500" },
  ],
};

interface TeamPickerProps {
  onComplete: () => void;
}

export default function TeamPicker({ onComplete }: TeamPickerProps) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [favSport, setFavSport] = useState<"cricket" | "football">("cricket");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if user has already picked teams
    const checkTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("favorite_teams, favorite_sport")
        .eq("id", user.id)
        .single();

      // Show picker if user has no teams AND hasn't dismissed it
      if (!profile?.favorite_teams || (Array.isArray(profile.favorite_teams) && profile.favorite_teams.length === 0)) {
        const dismissed = localStorage.getItem("pulse-team-picker-dismissed");
        if (!dismissed) {
          setTimeout(() => setShow(true), 2000);
        }
      }
    };
    checkTeams();
  }, []);

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        favorite_teams: selectedTeams,
        favorite_sport: favSport,
      }).eq("id", user.id);
    }
    localStorage.setItem("pulse-favorite-teams", JSON.stringify(selectedTeams));
    localStorage.setItem("pulse-favorite-sport", favSport);
    setSaving(false);
    setShow(false);
    onComplete();
  };

  const handleDismiss = () => {
    localStorage.setItem("pulse-team-picker-dismissed", "true");
    setShow(false);
    onComplete();
  };

  const allTeams = step === 1 ? TEAMS.cricket : TEAMS.football;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            className="w-full max-w-lg bg-[#111] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Pick Your Teams</h2>
                    <p className="text-xs text-zinc-500">Personalize your PulseSports experience</p>
                  </div>
                </div>
                <button onClick={handleDismiss} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-2 mt-4">
                <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-cyan-500" : "bg-zinc-700"}`} />
                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-green-500" : "bg-zinc-700"}`} />
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <p className="text-sm font-bold text-zinc-400 mb-3">
                {step === 1 ? "🏏 Select Cricket Teams" : "⚽ Select Football Clubs"}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {allTeams.map((team) => {
                  const selected = selectedTeams.includes(team.name);
                  return (
                    <button
                      key={team.name}
                      onClick={() => toggleTeam(team.name)}
                      className={`relative flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                        selected
                          ? `${team.color} scale-[1.02]`
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/50"
                      }`}
                    >
                      <span className="text-lg">{team.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${selected ? "" : "text-zinc-300"}`}>{team.name}</p>
                        <p className="text-[9px] text-zinc-600 truncate">{team.full}</p>
                      </div>
                      {selected && (
                        <Check className="w-4 h-4 text-green-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30">
              <p className="text-xs text-zinc-500">{selectedTeams.length} teams selected</p>
              <div className="flex gap-2">
                {step === 1 ? (
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-400 border border-zinc-700 hover:text-white transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-green-500 text-black hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save & Go! 🚀"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
