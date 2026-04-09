"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [sport, setSport] = useState("cricket");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [timeAgo, setTimeAgo] = useState("Just now");

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("news").insert([{
      sport, title, summary, image_url: imageUrl, time_ago: timeAgo
    }]);

    if (error) {
      alert("Error adding news: " + error.message);
    } else {
      alert("News article published successfully!");
      setTitle(""); setSummary(""); setImageUrl(""); setTimeAgo("Just now");
      fetchNews();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    await supabase.from("news").delete().eq("id", id);
    fetchNews();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage News</h1>

      {/* Add News Form */}
      <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-xl mb-8">
        <h2 className="text-xl font-bold mb-4">Publish New Article</h2>
        <form onSubmit={handleAddNews} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required>
                <option value="cricket">Cricket</option>
                <option value="football">Football</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Headline / Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Summary</label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm h-24 resize-none" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Image URL</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://unsplash.com/..." className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Time Ago text</label>
              <input type="text" value={timeAgo} onChange={e => setTimeAgo(e.target.value)} placeholder="e.g. 2 hours ago" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
            </div>
          </div>
          
          <div className="mt-4">
            <button type="submit" className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors">
              Publish Article
            </button>
          </div>
        </form>
      </div>

      {/* News List */}
      <div className="bg-zinc-800/20 border border-zinc-700 rounded-xl overflow-hidden">
        <ul className="divide-y divide-zinc-800">
          {loading ? (
            <li className="p-6 text-center text-zinc-500">Loading...</li>
          ) : news.map(article => (
            <li key={article.id} className="p-6 flex items-start gap-4 hover:bg-zinc-800/30 transition-colors">
              <img src={article.image_url} alt={article.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase text-zinc-500">{article.sport}</span>
                  <span className="text-xs text-zinc-500">• {article.time_ago}</span>
                </div>
                <h3 className="text-white font-bold truncate">{article.title}</h3>
                <p className="text-sm text-zinc-400 truncate mt-1">{article.summary}</p>
              </div>
              <button onClick={() => handleDelete(article.id)} className="text-red-500 hover:text-red-400 text-sm font-semibold p-2">
                Delete
              </button>
            </li>
          ))}
          {news.length === 0 && !loading && (
            <li className="p-6 text-center text-zinc-500">No news articles found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
