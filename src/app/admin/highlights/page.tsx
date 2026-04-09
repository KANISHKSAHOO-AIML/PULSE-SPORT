"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

export default function AdminHighlightsPage() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [sport, setSport] = useState("football");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [duration, setDuration] = useState("0:00");
  const [views, setViews] = useState("0 views");

  const fetchHighlights = async () => {
    setLoading(true);
    const { data } = await supabase.from("highlights").select("*").order("created_at", { ascending: false });
    if (data) setHighlights(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const handleAddHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("highlights").insert([{
      sport, title, thumbnail, duration, views
    }]);

    if (error) {
      alert("Error adding highlight: " + error.message);
    } else {
      alert("Video highlight published successfully!");
      setTitle(""); setThumbnail(""); setDuration("0:00"); setViews("0 views");
      fetchHighlights();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this highlight?")) return;
    await supabase.from("highlights").delete().eq("id", id);
    fetchHighlights();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Highlights</h1>

      {/* Add Highlight Form */}
      <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-xl mb-8">
        <h2 className="text-xl font-bold mb-4">Add Video Highlight</h2>
        <form onSubmit={handleAddHighlight} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Sport</label>
            <select value={sport} onChange={e => setSport(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required>
              <option value="cricket">Cricket</option>
              <option value="football">Football</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Video Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-1">Thumbnail URL</label>
            <input type="url" value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://unsplash.com/..." className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Duration (e.g. 5:23)</label>
            <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Initial Views text</label>
            <input type="text" value={views} onChange={e => setViews(e.target.value)} placeholder="e.g. 1.2M views" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors">
              Publish Highlight
            </button>
          </div>
        </form>
      </div>

      {/* Highlights List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : highlights.map(highlight => (
          <div key={highlight.id} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden group">
            <div className="relative h-40">
              <img src={highlight.thumbnail} alt={highlight.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono font-bold">
                {highlight.duration}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-white mb-1 truncate">{highlight.title}</h3>
              <div className="flex justify-between items-center text-sm text-zinc-400">
                <span className="capitalize">{highlight.sport}</span>
                <span>{highlight.views}</span>
              </div>
              <button onClick={() => handleDelete(highlight.id)} className="mt-4 w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-semibold transition-colors">
                Delete Highlight
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
