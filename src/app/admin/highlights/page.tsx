"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Trash2, ExternalLink, Eye } from "lucide-react";

// Inline YouTube icon (lucide-react version doesn't include it)
function YtIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
    </svg>
  );
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

function getYoutubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export default function AdminHighlightsPage() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [sport, setSport] = useState("football");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [duration, setDuration] = useState("");
  const [views, setViews] = useState("0");

  // Auto-fill thumbnail from YouTube URL
  useEffect(() => {
    const ytThumb = getYoutubeThumbnail(videoUrl);
    if (ytThumb) setThumbnail(ytThumb);
  }, [videoUrl]);

  const fetchHighlights = async () => {
    setLoading(true);
    const { data } = await supabase.from("highlights").select("*").order("created_at", { ascending: false });
    if (data) setHighlights(data);
    setLoading(false);
  };

  useEffect(() => { fetchHighlights(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload: any = { sport, title, duration, views };
    // Thumbnail: auto from YouTube, or manual entry
    payload.thumbnail = thumbnail || getYoutubeThumbnail(videoUrl) || "";
    if (videoUrl) payload.video_url = videoUrl;

    const { error } = await supabase.from("highlights").insert([payload]);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setTitle(""); setVideoUrl(""); setThumbnail(""); setDuration(""); setViews("0");
      fetchHighlights();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this highlight?")) return;
    await supabase.from("highlights").delete().eq("id", id);
    fetchHighlights();
  };

  const ytPreviewId = getYouTubeId(videoUrl);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <YtIcon className="w-7 h-7 text-red-500" />
        <h1 className="text-3xl font-bold">Manage Highlights</h1>
      </div>

      {/* ── How-To Banner ─────────────────────────────────────────── */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 text-sm text-blue-300 space-y-2">
        <p className="font-bold text-blue-200 flex items-center gap-2">
          <YtIcon className="w-4 h-4 text-red-400" /> How to add a YouTube highlight
        </p>
        <ol className="list-decimal list-inside space-y-1 text-blue-300/80">
          <li>Find the highlight clip on YouTube (any cricket/football channel).</li>
          <li>Copy the video URL — e.g. <code className="bg-blue-900/40 px-1.5 py-0.5 rounded text-xs">https://youtu.be/xXxXxX</code></li>
          <li>Paste it in the "YouTube URL" field below — thumbnail fills automatically.</li>
          <li>Fill in Title, Sport, Duration, and hit Publish.</li>
          <li>The video will be playable directly on the Highlights page!</li>
        </ol>
      </div>

      {/* ── Add Form ──────────────────────────────────────────────── */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Add New Highlight
        </h2>
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Sport */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-white" required>
                <option value="cricket">🏏 Cricket</option>
                <option value="football">⚽ Football</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Duration (e.g. 4:32)</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="3:45" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-white" required />
            </div>

            {/* Title — full width */}
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Highlight Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Virat Kohli's Match-Winning Century — IPL 2026" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-white" required />
            </div>

            {/* YouTube URL — full width */}
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1 flex items-center gap-2">
                <YtIcon className="w-4 h-4 text-red-500" /> YouTube URL
                <span className="text-zinc-600 text-xs">(thumbnail auto-fills from this)</span>
              </label>
              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-red-500/50 font-mono" />
            </div>

            {/* YouTube Preview */}
            {ytPreviewId && (
              <div className="md:col-span-2">
                <p className="text-xs text-zinc-500 mb-2">✅ YouTube video detected — preview:</p>
                <div className="relative aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-zinc-700">
                  <img src={`https://img.youtube.com/vi/${ytPreviewId}/hqdefault.jpg`} alt="preview"
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thumbnail override */}
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">
                Thumbnail URL <span className="text-zinc-600 text-xs">(optional — auto-filled from YouTube)</span>
              </label>
              <input type="url" value={thumbnail} onChange={e => setThumbnail(e.target.value)}
                placeholder="https://... (leave blank to use YouTube thumbnail)"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-white font-mono" />
            </div>

            {/* Views */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Initial View Count</label>
              <input type="text" value={views} onChange={e => setViews(e.target.value)}
                placeholder="e.g. 1.2M or 45K" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-white" />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 bg-white text-black font-bold px-7 py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50">
            {submitting ? "Publishing…" : "🎬 Publish Highlight"}
          </button>
        </form>
      </div>

      {/* ── Existing Highlights ────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-zinc-300">Published Highlights ({highlights.length})</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-52 bg-zinc-800/50 rounded-xl animate-pulse" />)}
          </div>
        ) : highlights.length === 0 ? (
          <div className="text-zinc-500 text-center py-10 bg-zinc-800/20 rounded-xl border border-zinc-700">
            No highlights published yet. Add one above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlights.map(h => {
              const ytId = getYouTubeId(h.video_url || "");
              return (
                <div key={h.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-600 transition-all">
                  <div className="relative aspect-video">
                    <img src={h.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "")}
                      alt={h.title} className="w-full h-full object-cover opacity-80" />
                    {ytId && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-mono font-bold px-2 py-0.5 rounded">
                      {h.duration}
                    </div>
                    {ytId && (
                      <div className="absolute top-2 left-2">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600/90 text-white text-xs font-bold rounded">
                          <YtIcon className="w-3 h-3" /> YouTube
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 leading-snug">{h.title}</h3>
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                      <span className="capitalize flex items-center gap-1">
                        {h.sport === "cricket" ? "🏏" : "⚽"} {h.sport}
                      </span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {h.views}</span>
                    </div>
                    <div className="flex gap-2">
                      {h.video_url && (
                        <a href={h.video_url} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Open
                        </a>
                      )}
                      <button onClick={() => handleDelete(h.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-xs font-semibold transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
