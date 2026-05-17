"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════════════════════
// CINEMATIC WELCOME OVERLAY — "Enter PulseSports" experience gate
// ═══════════════════════════════════════════════════════════════════════════
// • Dark, mysterious entry screen with aurora + particle effects
// • Magnetic "Enter PulseSports" button with glow
// • On click: plays spoken welcome line via Web Speech API (TTS)
// • Overlay shatters into glass shards via Framer Motion
// • Persists dismissal in sessionStorage so it only shows once per session
// ═══════════════════════════════════════════════════════════════════════════

// Greeting text — commas create natural dramatic pauses in speech synthesis
const TAGLINE = "Welcome, to PulseSports. Your arena, your data, your pulse. The future of sports, is now.";

// ─── Seeded PRNG (mulberry32) — deterministic across server & client ────
// Eliminates hydration mismatch caused by Math.random() differing per environment
function createSeededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate glass shard fragments for the shatter effect
function generateShards(count: number) {
  const rand = createSeededRandom(42);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rand() * 100,                 // % position
    y: rand() * 100,
    width: 8 + rand() * 18,          // vw size
    height: 8 + rand() * 18,
    rotation: rand() * 360,
    exitX: (rand() - 0.5) * 2500,
    exitY: (rand() - 0.5) * 2500,
    exitRotation: (rand() - 0.5) * 720,
    delay: rand() * 0.3,
    transitionExtra: rand() * 0.4,    // pre-computed to avoid inline Math.random()
  }));
}

const SHARDS = generateShards(18);

// Floating particles for the ambient background
function generateParticles(count: number) {
  const rand = createSeededRandom(137);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rand() * 100,
    y: rand() * 100,
    size: 1 + rand() * 3,
    duration: 4 + rand() * 8,
    delay: rand() * 5,
    opacity: 0.1 + rand() * 0.4,
  }));
}

const PARTICLES = generateParticles(30);

export default function CinematicOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [isShattering, setIsShattering] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Check sessionStorage — only show once per session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("pulse-overlay-dismissed");
      if (dismissed === "true") {
        setIsVisible(false);
      }
    }
  }, []);

  // Lock body scroll while overlay is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isVisible]);

  // Track mouse for cursor-light effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // Magnetic button effect
  const handleButtonMouseMove = useCallback((e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.25;
    const deltaY = (e.clientY - centerY) * 0.25;
    buttonRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
  }, []);

  const handleButtonMouseLeave = useCallback(() => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = "translate(0, 0) scale(1)";
    }
    setButtonHovered(false);
  }, []);

  // ─── ENTER: cinematic voice + bass drone + shatter overlay ────────
  const handleEnter = useCallback(() => {
    // ─── 1. Cinematic bass drone (Web Audio API) ───────────────────
    // Layered low-frequency oscillators create a heavyweight atmosphere
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Master gain — controls overall drone volume + fade out
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.8); // fade in
      masterGain.connect(audioCtx.destination);

      // Layer 1: Sub-bass fundamental (55Hz — A1 note)
      const osc1 = audioCtx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, audioCtx.currentTime);
      const gain1 = audioCtx.createGain();
      gain1.gain.setValueAtTime(0.6, audioCtx.currentTime);
      osc1.connect(gain1).connect(masterGain);

      // Layer 2: Harmonic body (82Hz — slightly detuned for richness)
      const osc2 = audioCtx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(82, audioCtx.currentTime);
      const gain2 = audioCtx.createGain();
      gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc2.connect(gain2).connect(masterGain);

      // Layer 3: Ultra-low presence (36Hz — felt more than heard)
      const osc3 = audioCtx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(36, audioCtx.currentTime);
      const gain3 = audioCtx.createGain();
      gain3.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc3.connect(gain3).connect(masterGain);

      // Start all oscillators
      osc1.start();
      osc2.start();
      osc3.start();

      // Fade out drone after 5 seconds (tail-off after speech ends)
      masterGain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 4);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 6);

      // Clean up oscillators
      osc1.stop(audioCtx.currentTime + 6.5);
      osc2.stop(audioCtx.currentTime + 6.5);
      osc3.stop(audioCtx.currentTime + 6.5);
      setTimeout(() => audioCtx.close().catch(() => {}), 7000);
    } catch {
      // Web Audio not available — continue without drone
    }

    // ─── 2. Deep voice greeting (SpeechSynthesis API) ──────────────
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(TAGLINE);
      utterance.rate = 0.78;    // Slow, deliberate pacing
      utterance.pitch = 0.6;    // Deep, heavy tone
      utterance.volume = 1;

      // Priority list: deepest male voices across browsers
      // Chrome: "Google UK English Male", Edge: "Microsoft David", 
      // macOS: "Daniel" / "Alex", Firefox: "Reed"
      const voices = window.speechSynthesis.getVoices();
      const voicePriority = [
        "Google UK English Male",
        "Microsoft David",
        "Microsoft Mark",
        "Daniel",
        "Alex",
        "Reed",
        "Google US English",
        "Rishi",
      ];

      let selectedVoice = null;
      for (const name of voicePriority) {
        selectedVoice = voices.find((v) => v.name.includes(name));
        if (selectedVoice) break;
      }
      // Fallback: any English male voice, then any English voice
      if (!selectedVoice) {
        selectedVoice =
          voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("male")) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.speak(utterance);
    }

    // 2. Trigger shatter animation
    setIsShattering(true);

    // 3. After shatter animation completes, hide overlay
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("pulse-overlay-dismissed", "true");
    }, 1200);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={overlayRef}
          className="cinematic-overlay"
          onMouseMove={handleMouseMove}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            // Cursor-tracking radial light
            ["--cursor-glow-x" as string]: `${mousePos.x}px`,
            ["--cursor-glow-y" as string]: `${mousePos.y}px`,
          }}
        >
          {/* ── Shatter Shards Layer ──────────────────────────────────── */}
          {isShattering && (
            <div className="cinematic-shatter-layer">
              {SHARDS.map((shard) => (
                <motion.div
                  key={shard.id}
                  className="cinematic-shard"
                  style={{
                    left: `${shard.x}%`,
                    top: `${shard.y}%`,
                    width: `${shard.width}vw`,
                    height: `${shard.height}vh`,
                    rotate: shard.rotation,
                  }}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{
                    x: shard.exitX,
                    y: shard.exitY,
                    rotate: shard.exitRotation,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{
                    duration: 0.8 + shard.transitionExtra,
                    delay: shard.delay,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Aurora Background ─────────────────────────────────────── */}
          {!isShattering && (
            <>
              <div className="cinematic-aurora" />

              {/* ── Floating Particles ──────────────────────────────────── */}
              <div className="cinematic-particles">
                {PARTICLES.map((p) => (
                  <div
                    key={p.id}
                    className="cinematic-particle"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      opacity: p.opacity,
                      animationDuration: `${p.duration}s`,
                      animationDelay: `${p.delay}s`,
                    }}
                  />
                ))}
              </div>

              {/* ── Cursor Light Gradient ─────────────────────────────── */}
              <div className="cinematic-cursor-light" />

              {/* ── Grid Overlay ──────────────────────────────────────── */}
              <div className="cinematic-grid" />

              {/* ── Center Content ────────────────────────────────────── */}
              <div className="cinematic-content">
                {/* Logo Mark */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="cinematic-logo-mark"
                >
                  <div className="cinematic-logo-ring" />
                  <span className="cinematic-logo-text">P</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  className="cinematic-title"
                >
                  <span className="cinematic-title-pulse">PULSE</span>
                  <span className="cinematic-title-sports">SPORTS</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                  className="cinematic-subtitle"
                >
                  The Future of Sports is Live
                </motion.p>

                {/* Decorative line */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  className="cinematic-divider"
                />

                {/* Enter Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <button
                    ref={buttonRef}
                    id="enter-pulsesports-btn"
                    className="cinematic-enter-btn"
                    onClick={handleEnter}
                    onMouseMove={handleButtonMouseMove}
                    onMouseEnter={() => setButtonHovered(true)}
                    onMouseLeave={handleButtonMouseLeave}
                    aria-label="Enter PulseSports Experience"
                  >
                    {/* Button glow ring */}
                    <span className={`cinematic-btn-glow ${buttonHovered ? "cinematic-btn-glow-active" : ""}`} />
                    
                    {/* Button content */}
                    <span className="cinematic-btn-content">
                      <span className="cinematic-btn-icon">
                        {/* Play icon */}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M4 2.5L13 8L4 13.5V2.5Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      <span className="cinematic-btn-label">
                        Enter PulseSports
                      </span>
                    </span>
                  </button>
                </motion.div>

                {/* Audio hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="cinematic-audio-hint"
                >
                  🔊 Turn up your volume for the full experience
                </motion.p>
              </div>

              {/* ── Bottom Scanline Effect ────────────────────────────── */}
              <div className="cinematic-scanlines" />

              {/* ── Corner Accents ────────────────────────────────────── */}
              <div className="cinematic-corner cinematic-corner-tl" />
              <div className="cinematic-corner cinematic-corner-tr" />
              <div className="cinematic-corner cinematic-corner-bl" />
              <div className="cinematic-corner cinematic-corner-br" />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
