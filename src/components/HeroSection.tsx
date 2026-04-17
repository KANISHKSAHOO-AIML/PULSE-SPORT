"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Zap, Users, Trophy, Radio } from "lucide-react";

const HERO_WORDS = ["THE PULSE", "OF SPORTS"];
const FLOATING_EMOJIS = [
  { emoji: "🏏", x: "12%", y: "20%", delay: 0, duration: 7 },
  { emoji: "⚽", x: "82%", y: "25%", delay: 1.2, duration: 8 },
  { emoji: "🏆", x: "68%", y: "65%", delay: 2.4, duration: 6 },
  { emoji: "🔥", x: "20%", y: "70%", delay: 0.8, duration: 9 },
  { emoji: "⭐", x: "90%", y: "55%", delay: 1.8, duration: 7.5 },
  { emoji: "🥇", x: "45%", y: "15%", delay: 3, duration: 8.5 },
  { emoji: "💪", x: "8%", y: "50%", delay: 2, duration: 6.5 },
  { emoji: "🎯", x: "75%", y: "80%", delay: 0.5, duration: 7.8 },
];

const STATS = [
  { icon: Radio, label: "Live Sports", value: "2", suffix: "" },
  { icon: Users, label: "Active Fans", value: "12K", suffix: "+" },
  { icon: Zap, label: "Real-time", value: "24/7", suffix: "" },
  { icon: Trophy, label: "Matches Tracked", value: "500", suffix: "+" },
];

function useTypewriter(words: string[], speed = 80, pauseMs = 1200) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fullText = words.join(" ");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setDone(true), pauseMs);
      }
    }, speed);
    return () => clearInterval(interval);
  }, []);

  return { displayed, done };
}

export default function HeroSection() {
  const { displayed, done } = useTypewriter(HERO_WORDS, 90, 800);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (done) {
      setShowSubtitle(true);
      setTimeout(() => setShowStats(true), 400);
    }
  }, [done]);

  const scrollToContent = () => {
    const el = document.getElementById("section-cricket");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Aurora mesh background */}
      <div className="hero-aurora">
        <div className="hero-aurora-extra" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating sport emojis */}
      {FLOATING_EMOJIS.map((item, i) => (
        <div
          key={i}
          className="absolute z-[2] select-none pointer-events-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: "clamp(24px, 3vw, 40px)",
            opacity: 0.12,
            animation: `floatEmoji ${item.duration}s ease-in-out ${item.delay}s infinite`,
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Hero content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main headline - typewriter */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6"
        >
          <span className={`animated-gradient-text ${done ? "" : "typewriter-cursor"}`}>
            {displayed}
          </span>
        </motion.h1>

        {/* Subtitle */}
        {showSubtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-zinc-400 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10"
          >
            Live Scores{" "}
            <span className="text-cricket" style={{ textShadow: "0 0 20px rgba(0,255,255,0.3)" }}>
              •
            </span>{" "}
            Breaking News{" "}
            <span className="text-football" style={{ textShadow: "0 0 20px rgba(57,255,20,0.3)" }}>
              •
            </span>{" "}
            Fan Debates{" "}
            <span className="animated-gradient-text font-bold">•</span>{" "}
            Player Stats
          </motion.p>
        )}

        {/* Stats pills */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="hero-stat-pill flex items-center gap-2"
              >
                <stat.icon className="w-4 h-4 text-zinc-500" />
                <span className="text-white font-bold text-sm">
                  {stat.value}
                  <span className="text-zinc-500">{stat.suffix}</span>
                </span>
                <span className="text-zinc-600 text-xs hidden sm:inline">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA buttons */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={scrollToContent}
              className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
            >
              View Live Scores
            </button>
            <a
              href="/players"
              className="px-6 py-3 rounded-xl border border-zinc-700 text-white font-bold text-sm hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
            >
              Player Stats ⚡
            </a>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-zinc-500 hover:text-white transition-colors scroll-chevron"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

      {/* Bottom fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 z-[5]"
        style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }}
      />
    </section>
  );
}
