"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Zap, Smartphone } from "lucide-react";

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem("pulse-pwa-dismissed");
    if (dismissed) return;

    // Track visits
    const visits = parseInt(localStorage.getItem("pulse-visits") || "0") + 1;
    localStorage.setItem("pulse-visits", visits.toString());

    // Show after 3 visits
    if (visits < 3) return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Small delay for better UX
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Fallback: show the banner anyway on mobile for manual install instructions
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && visits >= 3) {
      setTimeout(() => setShow(true), 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pulse-pwa-dismissed", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className="pwa-install-banner"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white">Install PulseSports</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Get instant access to live scores, notifications, and offline mode.</p>
            </div>
            <button onClick={handleDismiss} className="p-1 text-zinc-500 hover:text-white transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-green-500 text-black hover:opacity-90 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-zinc-700 hover:text-white transition-all"
            >
              Not now
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-[9px] text-zinc-500">Works offline • Instant push notifications • Zero storage</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
