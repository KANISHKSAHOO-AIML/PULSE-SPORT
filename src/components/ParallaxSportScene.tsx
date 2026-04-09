"use client";

import { useRef, useEffect, useState } from "react";

interface ParallaxSportSceneProps {
  sport: "cricket" | "football";
  scrollProgress: number;
}

export default function ParallaxSportScene({ sport, scrollProgress }: ParallaxSportSceneProps) {
  const isCricket = sport === "cricket";

  // Clamp scroll to 0-1
  const p = Math.max(0, Math.min(1, scrollProgress));

  // Player animation phases
  const playerX = isCricket
    ? // Cricket batsman swings from right
      `${55 + p * -15}%`
    : // Football striker runs from right
      `${70 - p * 30}%`;

  const playerScale = 0.85 + p * 0.35; // Grows as animation progresses
  const playerRotate = isCricket
    ? p * -15 // Batsman rotation during swing
    : p > 0.3 ? (p - 0.3) * -20 : 0; // Striker leans into kick

  // Ball animation
  const ballProgress = isCricket
    ? Math.max(0, (p - 0.3) / 0.7) // Ball appears after 30%
    : Math.max(0, (p - 0.35) / 0.65);

  const ballX = isCricket
    ? `${50 - ballProgress * 80}%` // Ball flies left (cover drive)
    : `${50 - ballProgress * 20}%`; // Ball flies toward goal
  const ballY = isCricket
    ? `${50 - Math.sin(ballProgress * Math.PI) * 30}%` // Arc up then down
    : `${55 - Math.sin(ballProgress * Math.PI) * 40}%`; // Higher parabolic arc
  const ballScale = 0.3 + ballProgress * 0.8;
  const ballRotate = ballProgress * 720; // Spinning ball

  // Background parallax
  const bgY = p * -20; // Subtle upward shift
  const bgScale = 1 + p * 0.08;

  // Particle/energy opacity
  const energyOpacity = Math.max(0, (p - 0.2) / 0.8);

  const accentColor = isCricket ? "0, 255, 255" : "57, 255, 20";
  const accentHex = isCricket ? "#00ffff" : "#39ff14";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Stadium Background */}
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{
          transform: `translateY(${bgY}px) scale(${bgScale})`,
        }}
      >
        <img
          src={isCricket ? "/assets/cricket-stadium.png" : "/assets/football-stadium.png"}
          alt=""
          className="w-full h-full object-cover"
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

      {/* Layer 3: Energy streaks / speed lines */}
      <div
        className="absolute inset-0"
        style={{ opacity: energyOpacity * 0.6 }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: `${60 + p * 120}px`,
              height: "1px",
              background: `linear-gradient(90deg, transparent, rgba(${accentColor}, ${0.3 + Math.sin(i) * 0.2}), transparent)`,
              transform: `rotate(${-10 + i * 3}deg) translateX(${p * (50 + i * 20)}px)`,
              transition: "transform 0.15s ease-out",
            }}
          />
        ))}
      </div>

      {/* Layer 4: Player */}
      <div
        className="absolute transition-all duration-150 ease-out"
        style={{
          right: isCricket ? undefined : undefined,
          left: playerX,
          bottom: "5%",
          width: "clamp(250px, 35vw, 500px)",
          height: "auto",
          transform: `scale(${playerScale}) rotate(${playerRotate}deg)`,
          transformOrigin: "bottom center",
          filter: `drop-shadow(0 0 30px rgba(${accentColor}, ${0.3 + energyOpacity * 0.4}))`,
          zIndex: 2,
        }}
      >
        <img
          src={isCricket ? "/assets/cricket-batsman.png" : "/assets/football-striker.png"}
          alt={isCricket ? "Cricket batsman" : "Football striker"}
          className="w-full h-auto"
          style={{
            filter: `brightness(${0.8 + energyOpacity * 0.4}) contrast(1.1)`,
          }}
        />
      </div>

      {/* Layer 5: Ball */}
      <div
        className="absolute transition-all duration-100 ease-out"
        style={{
          left: ballX,
          top: ballY,
          width: "clamp(40px, 6vw, 90px)",
          height: "auto",
          transform: `scale(${ballScale}) rotate(${ballRotate}deg)`,
          opacity: ballProgress > 0 ? 1 : 0,
          filter: `drop-shadow(0 0 20px rgba(${accentColor}, 0.8)) brightness(1.2)`,
          zIndex: 3,
        }}
      >
        <img
          src={isCricket ? "/assets/cricket-ball.png" : "/assets/football-ball.png"}
          alt=""
          className="w-full h-auto"
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

      {/* Layer 7: Floating particles */}
      <div className="absolute inset-0" style={{ opacity: 0.5 + energyOpacity * 0.5 }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const baseX = (i * 37 + 13) % 100;
          const baseY = (i * 47 + 7) % 100;
          const size = 2 + (i % 4) * 1.5;
          const speed = 0.5 + (i % 3) * 0.5;
          return (
            <div
              key={`p-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${baseX}%`,
                top: `${baseY - p * 15 * speed}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: `rgba(${accentColor}, ${0.2 + (i % 5) * 0.1})`,
                boxShadow: `0 0 ${size * 3}px rgba(${accentColor}, 0.3)`,
                transition: "top 0.2s ease-out",
              }}
            />
          );
        })}
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
