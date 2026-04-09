"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,255,255,0.05), transparent 60%), radial-gradient(ellipse at 60% 60%, rgba(57,255,20,0.04), transparent 50%)",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${(i * 29 + 11) % 100}%`,
              top: `${(i * 37 + 7) % 100}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: `rgba(${i % 2 === 0 ? "0,255,255" : "57,255,20"}, ${0.12 + (i % 4) * 0.04})`,
              boxShadow: `0 0 ${6 + (i % 3) * 3}px rgba(${i % 2 === 0 ? "0,255,255" : "57,255,20"}, 0.15)`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6">
        {/* Big 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <h1
            className="text-[120px] sm:text-[180px] font-black tracking-tighter leading-none mb-0"
            style={{
              background: "linear-gradient(135deg, #00FFFF, #39FF14)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(0,255,255,0.2))",
            }}
          >
            404
          </h1>
        </motion.div>

        {/* Ball emoji animation */}
        <motion.div
          className="text-5xl mb-6"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
        >
          <span className="inline-block animate-bounce">⚽</span>
          <span className="mx-2 text-zinc-600">💨</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: "0.2s" }}>
            🏏
          </span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Lost the Ball!</h2>
          <p className="text-zinc-500 text-sm sm:text-base max-w-md mx-auto mb-8">
            The page you&apos;re looking for has gone out of bounds.
            <br />
            Let&apos;s get you back to the pitch.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #00FFFF, #39FF14)" }}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>

        {/* Keyboard hint */}
        <motion.p
          className="mt-12 text-zinc-700 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono text-[10px]">
            H
          </kbd>{" "}
          to go home or{" "}
          <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono text-[10px]">
            /
          </kbd>{" "}
          to search
        </motion.p>
      </div>
    </div>
  );
}
