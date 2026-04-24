"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { X, Trophy, Target, Star, TrendingUp, Award, BarChart3 } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   PLAYER DATA — Cricket & Football legends with career stats
   ═══════════════════════════════════════════════════════════════════ */

interface CricketStats {
  format: string;
  matches: number;
  runs: number;
  average: number;
  strikeRate: number;
  hundreds: number;
  fifties: number;
  highScore: string;
}

interface FootballStats {
  competition: string;
  appearances: number;
  goals: number;
  assists: number;
  trophies: number;
}

interface Player {
  id: string;
  name: string;
  country: string;
  role: string;
  emoji: string;
  initials: string;
  sport: "cricket" | "football";
  image?: string;
  videoSrc?: string;
  bio: string;
  cricketStats?: CricketStats[];
  footballStats?: FootballStats[];
}

const CRICKET_PLAYERS: Player[] = [
  {
    id: "virat-kohli",
    name: "Virat Kohli",
    country: "🇮🇳 India",
    role: "Right-Handed Batsman",
    emoji: "👑",
    initials: "VK",
    sport: "cricket",
    videoSrc: "/assets/players/virat-kohli.mp4",
    bio: "The King of modern cricket. Run-machine with an insatiable hunger for centuries.",
    cricketStats: [
      { format: "Test", matches: 113, runs: 8848, average: 49.15, strikeRate: 55.42, hundreds: 29, fifties: 30, highScore: "254*" },
      { format: "ODI", matches: 292, runs: 13906, average: 58.18, strikeRate: 93.62, hundreds: 50, fifties: 72, highScore: "183" },
      { format: "T20I", matches: 125, runs: 4188, average: 52.65, strikeRate: 137.96, hundreds: 1, fifties: 38, highScore: "122*" },
      { format: "IPL", matches: 252, runs: 8004, average: 37.25, strikeRate: 130.41, hundreds: 8, fifties: 55, highScore: "113" },
    ],
  },
  {
    id: "ms-dhoni",
    name: "MS Dhoni",
    country: "🇮🇳 India",
    role: "Wicket-keeper Batsman",
    emoji: "🚁",
    initials: "MSD",
    sport: "cricket",
    videoSrc: "/assets/players/ms-dhoni.mp4",
    bio: "Captain Cool. The greatest finisher cricket has ever seen. Helicopter shot maestro.",
    cricketStats: [
      { format: "Test", matches: 90, runs: 4876, average: 38.09, strikeRate: 59.08, hundreds: 6, fifties: 33, highScore: "224" },
      { format: "ODI", matches: 350, runs: 10773, average: 50.57, strikeRate: 87.56, hundreds: 10, fifties: 73, highScore: "183*" },
      { format: "T20I", matches: 98, runs: 1617, average: 37.60, strikeRate: 126.13, hundreds: 0, fifties: 2, highScore: "56" },
      { format: "IPL", matches: 264, runs: 5243, average: 38.55, strikeRate: 135.92, hundreds: 0, fifties: 24, highScore: "84*" },
    ],
  },
  {
    id: "rohit-sharma",
    name: "Rohit Sharma",
    country: "🇮🇳 India",
    role: "Right-Handed Batsman",
    emoji: "🎯",
    initials: "RS",
    sport: "cricket",
    videoSrc: "/assets/players/rohit-sharma.mp4",
    bio: "Hitman. The only player with 3 ODI double centuries. Purest timer of the cricket ball.",
    cricketStats: [
      { format: "Test", matches: 63, runs: 4301, average: 42.16, strikeRate: 57.80, hundreds: 12, fifties: 17, highScore: "212" },
      { format: "ODI", matches: 264, runs: 10709, average: 49.12, strikeRate: 90.28, hundreds: 31, fifties: 48, highScore: "264" },
      { format: "T20I", matches: 159, runs: 4231, average: 32.05, strikeRate: 140.89, hundreds: 4, fifties: 32, highScore: "121*" },
      { format: "IPL", matches: 257, runs: 6628, average: 29.34, strikeRate: 130.34, hundreds: 2, fifties: 43, highScore: "109*" },
    ],
  },
  {
    id: "jasprit-bumrah",
    name: "Jasprit Bumrah",
    country: "🇮🇳 India",
    role: "Right-Arm Fast",
    emoji: "🔥",
    initials: "JB",
    sport: "cricket",
    videoSrc: "/assets/players/jasprit-bumrah.mp4",
    bio: "The yorker king. Unorthodox action, lethal execution. World's best fast bowler.",
    cricketStats: [
      { format: "Test", matches: 40, runs: 152, average: 6.95, strikeRate: 35.68, hundreds: 0, fifties: 0, highScore: "27" },
      { format: "ODI", matches: 83, runs: 51, average: 8.50, strikeRate: 46.79, hundreds: 0, fifties: 0, highScore: "10*" },
      { format: "T20I", matches: 68, runs: 4, average: 2.00, strikeRate: 33.33, hundreds: 0, fifties: 0, highScore: "2*" },
      { format: "IPL", matches: 133, runs: 30, average: 5.00, strikeRate: 50.00, hundreds: 0, fifties: 0, highScore: "7" },
    ],
  },
  {
    id: "ab-de-villiers",
    name: "AB de Villiers",
    country: "🇿🇦 South Africa",
    role: "Right-Handed Batsman",
    emoji: "🦸",
    initials: "AB",
    sport: "cricket",
    videoSrc: "/assets/players/ab-de-villiers.mp4",
    bio: "Mr. 360. Could hit any ball anywhere. The most innovative batsman in cricket history.",
    cricketStats: [
      { format: "Test", matches: 114, runs: 8765, average: 50.66, strikeRate: 54.18, hundreds: 22, fifties: 46, highScore: "278*" },
      { format: "ODI", matches: 228, runs: 9577, average: 53.50, strikeRate: 101.09, hundreds: 25, fifties: 53, highScore: "176" },
      { format: "T20I", matches: 78, runs: 1672, average: 26.12, strikeRate: 135.16, hundreds: 0, fifties: 10, highScore: "79*" },
      { format: "IPL", matches: 184, runs: 5162, average: 39.70, strikeRate: 151.68, hundreds: 3, fifties: 40, highScore: "133*" },
    ],
  },
  {
    id: "ben-stokes",
    name: "Ben Stokes",
    country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England",
    role: "All-Rounder",
    emoji: "⚡",
    initials: "BS",
    sport: "cricket",
    videoSrc: "/assets/players/ben-stokes.mp4",
    bio: "The hero of Headingley. The World Cup final savior. Cricket's ultimate warrior.",
    cricketStats: [
      { format: "Test", matches: 104, runs: 6270, average: 34.06, strikeRate: 57.65, hundreds: 13, fifties: 27, highScore: "258" },
      { format: "ODI", matches: 105, runs: 2924, average: 39.24, strikeRate: 95.15, hundreds: 3, fifties: 21, highScore: "102*" },
      { format: "T20I", matches: 44, runs: 397, average: 14.18, strikeRate: 134.57, hundreds: 0, fifties: 0, highScore: "47*" },
      { format: "IPL", matches: 59, runs: 958, average: 23.95, strikeRate: 133.52, hundreds: 0, fifties: 3, highScore: "107*" },
    ],
  },
];

const FOOTBALL_PLAYERS: Player[] = [
  {
    id: "cristiano-ronaldo",
    name: "Cristiano Ronaldo",
    country: "🇵🇹 Portugal",
    role: "Forward",
    emoji: "🐐",
    initials: "CR7",
    sport: "football",
    videoSrc: "/assets/players/cristiano-ronaldo.mp4",
    bio: "The GOAT debate. 900+ career goals. Pure determination and athleticism personified.",
    footballStats: [
      { competition: "La Liga", appearances: 292, goals: 311, assists: 96, trophies: 2 },
      { competition: "Premier League", appearances: 346, goals: 145, assists: 64, trophies: 3 },
      { competition: "Serie A", appearances: 98, goals: 81, assists: 17, trophies: 2 },
      { competition: "Champions League", appearances: 183, goals: 140, assists: 48, trophies: 5 },
      { competition: "International", appearances: 214, goals: 133, assists: 45, trophies: 2 },
    ],
  },
  {
    id: "lionel-messi",
    name: "Lionel Messi",
    country: "🇦🇷 Argentina",
    role: "Forward",
    emoji: "🪄",
    initials: "LM",
    sport: "football",
    videoSrc: "/assets/players/lionel-messi.mp4",
    bio: "La Pulga. 8 Ballon d'Ors. The most naturally gifted footballer to ever live.",
    footballStats: [
      { competition: "La Liga", appearances: 520, goals: 474, assists: 192, trophies: 10 },
      { competition: "Ligue 1", appearances: 75, goals: 32, assists: 26, trophies: 2 },
      { competition: "MLS", appearances: 45, goals: 30, assists: 20, trophies: 1 },
      { competition: "Champions League", appearances: 163, goals: 129, assists: 40, trophies: 4 },
      { competition: "International", appearances: 187, goals: 109, assists: 58, trophies: 3 },
    ],
  },
  {
    id: "erling-haaland",
    name: "Erling Haaland",
    country: "🇳🇴 Norway",
    role: "Striker",
    emoji: "🤖",
    initials: "EH",
    sport: "football",
    videoSrc: "/assets/players/erling-haaland.mp4",
    bio: "The Viking Terminator. Breaking goal records like they're warm-up drills.",
    footballStats: [
      { competition: "Premier League", appearances: 105, goals: 102, assists: 14, trophies: 2 },
      { competition: "Bundesliga", appearances: 89, goals: 86, assists: 23, trophies: 0 },
      { competition: "Champions League", appearances: 44, goals: 41, assists: 8, trophies: 1 },
      { competition: "International", appearances: 36, goals: 32, assists: 4, trophies: 0 },
    ],
  },
  {
    id: "kylian-mbappe",
    name: "Kylian Mbappé",
    country: "🇫🇷 France",
    role: "Forward",
    emoji: "⚡",
    initials: "KM",
    sport: "football",
    videoSrc: "/assets/players/kylian-mbappe.mp4",
    bio: "Speed demon. World Cup winner at 19. The future and present of football.",
    footballStats: [
      { competition: "Ligue 1", appearances: 248, goals: 188, assists: 86, trophies: 6 },
      { competition: "La Liga", appearances: 52, goals: 38, assists: 12, trophies: 0 },
      { competition: "Champions League", appearances: 80, goals: 49, assists: 22, trophies: 0 },
      { competition: "International", appearances: 86, goals: 48, assists: 28, trophies: 1 },
    ],
  },
  {
    id: "neymar-jr",
    name: "Neymar Jr",
    country: "🇧🇷 Brazil",
    role: "Forward",
    emoji: "🎭",
    initials: "NJ",
    sport: "football",
    videoSrc: "/assets/players/neymar-jr.mp4",
    bio: "Samba magic. Flair, skill, and showmanship. Brazil's golden boy.",
    footballStats: [
      { competition: "La Liga", appearances: 186, goals: 105, assists: 76, trophies: 1 },
      { competition: "Ligue 1", appearances: 119, goals: 83, assists: 44, trophies: 4 },
      { competition: "Champions League", appearances: 82, goals: 42, assists: 28, trophies: 1 },
      { competition: "International", appearances: 128, goals: 79, assists: 52, trophies: 0 },
    ],
  },
  {
    id: "lamine-yamal",
    name: "Lamine Yamal",
    country: "🇪🇸 Spain",
    role: "Winger",
    emoji: "🌟",
    initials: "LY",
    sport: "football",
    videoSrc: "/assets/players/lamine-yamal.mp4",
    bio: "The wonderkid. Euro champion at 17. Football's most exciting teenage talent.",
    footballStats: [
      { competition: "La Liga", appearances: 68, goals: 12, assists: 18, trophies: 1 },
      { competition: "Champions League", appearances: 18, goals: 3, assists: 5, trophies: 0 },
      { competition: "International", appearances: 22, goals: 4, assists: 10, trophies: 1 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   PLAYER STATS MODAL
   ═══════════════════════════════════════════════════════════════════ */

function PlayerModal({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  const [showStats, setShowStats] = useState(false);
  const isCricket = player.sport === "cricket";
  const accent = isCricket ? "cricket" : "football";
  const accentHex = isCricket ? "#00ffff" : "#39ff14";

  useEffect(() => {
    const t = setTimeout(() => setShowStats(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="player-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111] rounded-2xl border border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-5">
            <div className={`player-avatar avatar-${accent}`}>
              {player.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{player.emoji}</span>
                <h2 className={`text-2xl md:text-3xl font-black gradient-text-${accent}`}>
                  {player.name}
                </h2>
              </div>
              <p className="text-zinc-400 text-sm">{player.country} • {player.role}</p>
              <p className="text-zinc-500 text-xs mt-1 max-w-md">{player.bio}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Stats + Career Highlights */}
          <div>
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{color: accentHex}} />
              Career Statistics
            </h3>

            {isCricket && player.cricketStats && (
              <div className="space-y-4">
                {player.cricketStats.map((s, i) => (
                  <motion.div
                    key={s.format}
                    initial={{ opacity: 0, x: -20 }}
                    animate={showStats ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-xl p-4 border border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider text-${accent}`}>
                        {s.format}
                      </span>
                      <span className="text-[10px] text-zinc-600">{s.matches} matches</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-black text-white">{s.runs.toLocaleString()}</p>
                        <p className="text-[9px] text-zinc-600 uppercase">Runs</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-white">{s.average}</p>
                        <p className="text-[9px] text-zinc-600 uppercase">Average</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-white">{s.strikeRate}</p>
                        <p className="text-[9px] text-zinc-600 uppercase">SR</p>
                      </div>
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-zinc-500">
                      <span>💯 {s.hundreds} centuries</span>
                      <span>5️⃣ {s.fifties} fifties</span>
                      <span>🏏 HS: {s.highScore}</span>
                    </div>
                    <div className="stat-bar mt-2">
                      <div
                        className={`stat-bar-fill fill-${accent}`}
                        style={{ width: showStats ? `${Math.min(100, (s.runs / 14000) * 100)}%` : "0%" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!isCricket && player.footballStats && (
              <div className="space-y-4">
                {player.footballStats.map((s, i) => (
                  <motion.div
                    key={s.competition}
                    initial={{ opacity: 0, x: -20 }}
                    animate={showStats ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-xl p-4 border border-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider text-${accent}`}>
                        {s.competition}
                      </span>
                      <span className="text-[10px] text-zinc-600">{s.appearances} apps</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-black text-white">{s.goals}</p>
                        <p className="text-[9px] text-zinc-600 uppercase">Goals</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-white">{s.assists}</p>
                        <p className="text-[9px] text-zinc-600 uppercase">Assists</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-white">{s.trophies}</p>
                        <p className="text-[9px] text-zinc-600 uppercase">Trophies</p>
                      </div>
                    </div>
                    <div className="stat-bar mt-2">
                      <div
                        className={`stat-bar-fill fill-${accent}`}
                        style={{ width: showStats ? `${Math.min(100, (s.goals / 500) * 100)}%` : "0%" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Career Highlights — below stats */}
            <div className="glass-card rounded-xl p-4 border border-zinc-800 mt-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Career Highlights</h4>
              <div className="space-y-2">
                {isCricket && player.cricketStats && (
                  <>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs text-zinc-300">
                        Total Runs: <span className="text-white font-bold">
                          {player.cricketStats.reduce((sum, s) => sum + s.runs, 0).toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-zinc-300">
                        Total Centuries: <span className="text-white font-bold">
                          {player.cricketStats.reduce((sum, s) => sum + s.hundreds, 0)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs text-zinc-300">
                        Best Average: <span className="text-white font-bold">
                          {Math.max(...player.cricketStats.map(s => s.average))}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-zinc-300">
                        Total Matches: <span className="text-white font-bold">
                          {player.cricketStats.reduce((sum, s) => sum + s.matches, 0)}
                        </span>
                      </span>
                    </div>
                  </>
                )}
                {!isCricket && player.footballStats && (
                  <>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs text-zinc-300">
                        Total Goals: <span className="text-white font-bold">
                          {player.footballStats.reduce((sum, s) => sum + s.goals, 0)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-zinc-300">
                        Total Assists: <span className="text-white font-bold">
                          {player.footballStats.reduce((sum, s) => sum + s.assists, 0)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs text-zinc-300">
                        Trophies Won: <span className="text-white font-bold">
                          {player.footballStats.reduce((sum, s) => sum + s.trophies, 0)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-zinc-300">
                        Total Apps: <span className="text-white font-bold">
                          {player.footballStats.reduce((sum, s) => sum + s.appearances, 0)}
                        </span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Video playing continuously */}
          <div className="flex flex-col">
            {player.videoSrc && (
              <div className="aura-video-container sticky top-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={player.videoSrc}
                >
                  <source src={player.videoSrc} type="video/mp4" />
                </video>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PLAYER STATS PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function PlayersPage() {
  const [activeSport, setActiveSport] = useState<"cricket" | "football">("cricket");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [liveScorers, setLiveScorers] = useState<any[]>([]);
  const [liveScorersLoading, setLiveScorersLoading] = useState(true);

  // Fetch real-time top scorers from Football-Data.org
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const res = await fetch("/api/players?sport=football");
        if (res.ok) {
          const json = await res.json();
          if (json.players && json.players.length > 0) {
            setLiveScorers(json.players);
          }
        }
      } catch {}
      setLiveScorersLoading(false);
    };
    fetchLiveData();
  }, []);

  const players = activeSport === "cricket" ? CRICKET_PLAYERS : FOOTBALL_PLAYERS;
  const accent = activeSport === "cricket" ? "cricket" : "football";
  const accentHex = activeSport === "cricket" ? "#00ffff" : "#39ff14";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Aurora bg */}
        <div className="hero-aurora">
          <div className="hero-aurora-extra" />
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
          >
            <span className="animated-gradient-text">Player Stats</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mb-8"
          >
            Explore career statistics of legendary cricketers and footballers.
            Click a player to see their full career stats.
          </motion.p>

          {/* Sport Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800"
          >
            <button
              onClick={() => setActiveSport("cricket")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeSport === "cricket"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              🏏 Cricket
            </button>
            <button
              onClick={() => setActiveSport("football")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeSport === "football"
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              ⚽ Football
            </button>
          </motion.div>
        </div>
      </section>

      {/* Energy divider */}
      <div className="energy-divider mx-auto max-w-5xl">
        <div className="energy-divider-line" />
        <div className="energy-divider-glow" />
      </div>

      {/* Player Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSport}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className={`player-card sport-${accent} p-5`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`player-avatar avatar-${accent}`}>
                      {player.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{player.emoji}</span>
                        <h3 className="text-base font-bold text-white truncate">{player.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{player.country}</p>
                      <p className="text-[10px] text-zinc-600">{player.role}</p>
                    </div>
                  </div>

                  {/* Quick stats preview */}
                  {activeSport === "cricket" && player.cricketStats && (
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800">
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">
                          {player.cricketStats.reduce((s, c) => s + c.runs, 0).toLocaleString()}
                        </p>
                        <p className="text-[9px] text-zinc-600 uppercase">Total Runs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">
                          {player.cricketStats.reduce((s, c) => s + c.hundreds, 0)}
                        </p>
                        <p className="text-[9px] text-zinc-600 uppercase">Centuries</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">
                          {player.cricketStats.reduce((s, c) => s + c.matches, 0)}
                        </p>
                        <p className="text-[9px] text-zinc-600 uppercase">Matches</p>
                      </div>
                    </div>
                  )}

                  {activeSport === "football" && player.footballStats && (
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800">
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">
                          {player.footballStats.reduce((s, c) => s + c.goals, 0)}
                        </p>
                        <p className="text-[9px] text-zinc-600 uppercase">Goals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">
                          {player.footballStats.reduce((s, c) => s + c.assists, 0)}
                        </p>
                        <p className="text-[9px] text-zinc-600 uppercase">Assists</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">
                          {player.footballStats.reduce((s, c) => s + c.trophies, 0)}
                        </p>
                        <p className="text-[9px] text-zinc-600 uppercase">Trophies</p>
                      </div>
                    </div>
                  )}

                  {/* Click hint */}
                  <p className="text-[10px] text-zinc-700 text-center mt-3 font-medium">
                    Click to view full stats →
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Live Top Scorers — from Football-Data.org API */}
      {activeSport === "football" && liveScorers.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📊</span>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    Premier League{" "}
                    <span className="text-football" style={{ textShadow: "0 0 20px rgba(57,255,20,0.3)" }}>
                      Top Scorers
                    </span>
                  </h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Live data from Football-Data.org API</p>
                </div>
                <span className="ml-auto text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold border border-green-500/20 uppercase tracking-wider">
                  Live API
                </span>
              </div>

              <div className="glass-card rounded-2xl border border-dark-border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <span className="col-span-1">#</span>
                  <span className="col-span-5">Player</span>
                  <span className="col-span-2 text-center">Team</span>
                  <span className="col-span-1 text-center">Apps</span>
                  <span className="col-span-1 text-center">⚽</span>
                  <span className="col-span-1 text-center">🅰️</span>
                  <span className="col-span-1 text-center">Pen</span>
                </div>

                {/* Player Rows */}
                {liveScorers.slice(0, 15).map((scorer: any, i: number) => (
                  <motion.div
                    key={scorer.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className={`grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors ${
                      i < 3 ? "border-l-2 border-l-football" : "border-l-2 border-l-transparent"
                    } ${i < liveScorers.length - 1 ? "border-b border-zinc-800/50" : ""}`}
                  >
                    <span className={`col-span-1 text-sm font-bold ${
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-600"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      {scorer.teamCrest && (
                        <img src={scorer.teamCrest} alt="" className="w-5 h-5 object-contain shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{scorer.name}</p>
                        <p className="text-[9px] text-zinc-600">{scorer.nationality} • {scorer.position}</p>
                      </div>
                    </div>
                    <span className="col-span-2 text-center text-[10px] text-zinc-400 font-medium">{scorer.team}</span>
                    <span className="col-span-1 text-center text-xs text-zinc-400">{scorer.playedMatches}</span>
                    <span className="col-span-1 text-center text-sm font-black text-white">{scorer.goals}</span>
                    <span className="col-span-1 text-center text-xs text-zinc-400">{scorer.assists}</span>
                    <span className="col-span-1 text-center text-xs text-zinc-500">{scorer.penalties}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Player Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
