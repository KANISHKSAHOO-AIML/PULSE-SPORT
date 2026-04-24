"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, X, Trophy, MessageCircle, Zap, Info } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  icon: string;
  href: string;
  read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { color: string; fallbackIcon: React.ReactNode }> = {
  prediction_result: { color: "text-green-400", fallbackIcon: <Trophy className="w-4 h-4" /> },
  match_live: { color: "text-red-400", fallbackIcon: <Zap className="w-4 h-4" /> },
  reply: { color: "text-blue-400", fallbackIcon: <MessageCircle className="w-4 h-4" /> },
  badge_earned: { color: "text-yellow-400", fallbackIcon: <Trophy className="w-4 h-4" /> },
  system: { color: "text-zinc-400", fallbackIcon: <Info className="w-4 h-4" /> },
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    };

    fetchNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const newNotif = payload.new as Notification;
        setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 max-h-[70vh] overflow-hidden bg-[#111] border border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                🔔 Notifications
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n) => {
                  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                  return (
                    <Link
                      key={n.id}
                      href={n.href || "/"}
                      onClick={() => { markOneRead(n.id); setOpen(false); }}
                      className={`block px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                        !n.read ? "bg-zinc-900/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 text-lg shrink-0`}>
                          {n.icon || "🔔"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-bold ${!n.read ? "text-white" : "text-zinc-400"} truncate`}>
                              {n.title}
                            </p>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[9px] text-zinc-600 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="px-4 py-12 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                  <p className="text-sm text-zinc-500">No notifications yet</p>
                  <p className="text-[10px] text-zinc-600 mt-1">We'll notify you about match results & predictions</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
