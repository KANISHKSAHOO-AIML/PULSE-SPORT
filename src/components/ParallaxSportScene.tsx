"use client";

import { useMemo, memo } from "react";

interface ParallaxSportSceneProps {
  sport: "cricket" | "football";
  scrollProgress: number;
}

// Pre-computed particle data (never recalculated)
const PARTICLE_DATA = Array.from({ length: 12 }, (_, i) => ({
  baseX: (i * 37 + 13) % 100,
  baseY: (i * 47 + 7) % 100,
  size: 2 + (i % 4) * 1.5,
  speed: 0.5 + (i % 3) * 0.5,
  opacity: 0.2 + (i % 5) * 0.1,
}));

// Pre-computed energy streak data
const STREAK_DATA = Array.from({ length: 6 }, (_, i) => ({
  left: 10 + i * 15,
  top: 20 + (i % 3) * 25,
  angle: -10 + i * 3,
  sinVal: Math.sin(i),
}));

function ParallaxSportScene({ sport, scrollProgress }: ParallaxSportSceneProps) {
  const isCricket = sport === "cricket";

  // Clamp scroll to 0-1
  const p = Math.max(0, Math.min(1, scrollProgress));

  // Player animation phases
  const playerX = isCricket ? `${55 + p * -15}%` : `${70 - p * 30}%`;
  const playerScale = 0.85 + p * 0.35;
  const playerRotate = isCricket
    ? p * -15
    : p > 0.3 ? (p - 0.3) * -20 : 0;

  // Ball animation
  const ballProgress = isCricket
    ? Math.max(0, (p - 0.3) / 0.7)
    : Math.max(0, (p - 0.35) / 0.65);

  const ballX = isCricket ? `${50 - ballProgress * 80}%` : `${50 - ballProgress * 20}%`;
  const ballY = isCricket
    ? `${50 - Math.sin(ballProgress * Math.PI) * 30}%`
    : `${55 - Math.sin(ballProgress * Math.PI) * 40}%`;
  const ballScale = 0.3 + ballProgress * 0.8;
  const ballRotate = ballProgress * 720;

  // Background parallax
  const bgY = p * -20;
  const bgScale = 1 + p * 0.08;

  // Particle/energy opacity
  const energyOpacity = Math.max(0, (p - 0.2) / 0.8);

  const accentColor = isCricket ? "0, 255, 255" : "57, 255, 20";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Stadium Background */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${bgY}px) scale(${bgScale})`,
          willChange: "transform",
        }}
      >
        <img
          src={isCricket ? "/assets/cricket-stadium.png" : "/assets/football-stadium.png"}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          style={{
            filter: `brightness(0.3) saturate(1.2)`,
            opacity: 0.7,
          }}
        />
      </div>

      {/* Layer 2: Ambient glow that intensifies with scroll */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 60% 50%, rgba(${accentColor}, ${0.05 + energyOpacity * 0.12}) 0%, transparent 70%)`,
        }}
      />

      {/* Layer 3: Energy streaks / speed lines (reduced count) */}
      <div
        className="absolute inset-0"
        style={{ opacity: energyOpacity * 0.6 }}
      >
        {STREAK_DATA.map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${60 + p * 120}px`,
              height: "1px",
              background: `linear-gradient(90deg, transparent, rgba(${accentColor}, ${0.3 + s.sinVal * 0.2}), transparent)`,
              transform: `rotate(${s.angle}deg) translateX(${p * (50 + i * 20)}px)`,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* Layer 4: Player */}
      <div
        className="absolute"
        style={{
          left: playerX,
          bottom: "5%",
          width: "clamp(250px, 35vw, 500px)",
          height: "auto",
          transform: `scale(${playerScale}) rotate(${playerRotate}deg)`,
          transformOrigin: "bottom center",
          filter: `drop-shadow(0 0 30px rgba(${accentColor}, ${0.3 + energyOpacity * 0.4}))`,
          zIndex: 2,
          willChange: "transform",
        }}
      >
        <img
          src={isCricket ? "/assets/cricket-batsman.png" : "/assets/football-striker.png"}
          alt={isCricket ? "Cricket batsman" : "Football striker"}
          className="w-full h-auto"
          loading="lazy"
          decoding="async"
          style={{
            filter: `brightness(${0.8 + energyOpacity * 0.4}) contrast(1.1)`,
          }}
        />
      </div>

      {/* Layer 5: Ball */}
      <div
        className="absolute"
        style={{
          left: ballX,
          top: ballY,
          width: "clamp(40px, 6vw, 90px)",
          height: "auto",
          transform: `scale(${ballScale}) rotate(${ballRotate}deg)`,
          opacity: ballProgress > 0 ? 1 : 0,
          filter: `drop-shadow(0 0 20px rgba(${accentColor}, 0.8)) brightness(1.2)`,
          zIndex: 3,
          willChange: "transform, opacity",
        }}
      >
        <img
          src={isCricket ? "/assets/cricket-ball.png" : "/assets/football-ball.png"}
          alt=""
          className="w-full h-auto"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Layer 6: Impact flash */}
      {p > 0.25 && p < 0.5 && isCricket && (
        <div
          className="absolute"
          style={{
            left: "52%",
            top: "45%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${accentColor}, ${(0.5 - p) * 3}) 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            zIndex: 4,
          }}
        />
      )}

      {/* Layer 6b: Goal flash for football */}
      {!isCricket && p > 0.75 && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(${accentColor}, ${(p - 0.75) * 0.6}) 0%, transparent 50%)`,
            zIndex: 4,
          }}
        />
      )}

      {/* Layer 7: Floating particles (reduced from 20 to 12) */}
      <div className="absolute inset-0" style={{ opacity: 0.5 + energyOpacity * 0.5 }}>
        {PARTICLE_DATA.map((particle, i) => (
          <div
            key={`p-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${particle.baseX}%`,
              top: `${particle.baseY - p * 15 * particle.speed}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `rgba(${accentColor}, ${particle.opacity})`,
              boxShadow: `0 0 ${particle.size * 3}px rgba(${accentColor}, 0.3)`,
              willChange: "top",
            }}
          />
        ))}
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          zIndex: 5,
        }}
      />

      {/* Bottom gradient for card readability */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: "linear-gradient(to top, rgba(10,10,10,0.95), transparent)",
          zIndex: 6,
        }}
      />

      {/* Top gradient for header blend */}
      <div
        className="absolute top-0 left-0 right-0 h-24"
        style={{
          background: "linear-gradient(to bottom, rgba(10,10,10,0.8), transparent)",
          zIndex: 6,
        }}
      />
    </div>
  );
}

export default memo(ParallaxSportScene);

