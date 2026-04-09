"use client";

import { motion } from "framer-motion";

interface SportToggleProps {
  sport?: "cricket" | "football";
  onChange?: (sport: "cricket" | "football") => void;
  mode?: "toggle" | "quicknav";
}

export default function SportToggle({
  sport,
  onChange,
  mode = "toggle",
}: SportToggleProps) {
  const handleClick = (s: "cricket" | "football") => {
    if (mode === "quicknav") {
      // Smooth scroll to that section
      const el = document.getElementById(`section-${s}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    if (onChange) onChange(s as "cricket" | "football");
  };

  if (mode === "quicknav") {
    return (
      <div className="quick-nav">
        {(["cricket", "football"] as const).map((s) => {
          const isActive = sport === s;
          return (
            <button
              id={`quicknav-${s}`}
              key={s}
              onClick={() => handleClick(s)}
              className={`relative px-5 py-2 text-xs font-bold rounded-xl capitalize tracking-wider transition-colors ${
                isActive ? "text-dark-bg" : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-quicknav"
                  className={`absolute inset-0 rounded-xl ${
                    s === "cricket" ? "bg-cricket" : "bg-football"
                  }`}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {s === "cricket" ? "🏏" : "⚽"}
                {s}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Original toggle mode
  return (
    <div className="flex p-1 space-x-1 bg-dark-card rounded-xl border border-dark-border">
      {(["cricket", "football"] as const).map((s) => {
        const isActive = sport === s;
        return (
          <button
            key={s}
            onClick={() => handleClick(s)}
            className={`relative px-6 py-2.5 text-sm font-semibold rounded-lg capitalize transition-colors ${
              isActive ? "text-dark-bg" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-sport"
                className={`absolute inset-0 rounded-lg ${
                  s === "cricket" ? "bg-cricket" : "bg-football"
                }`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{s}</span>
          </button>
        );
      })}
    </div>
  );
}
