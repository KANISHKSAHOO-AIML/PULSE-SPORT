"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [sport, setSport] = useState("cricket");
  const [title, setTitle] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [scoreA, setScoreA] = useState("0/0 (0)");
  const [scoreB, setScoreB] = useState("0/0 (0)");
  const [status, setStatus] = useState("1st Innings");
  const [live, setLive] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("matches").select("*").order("updated_at", { ascending: false });
    if (error) console.error("Error fetching matches:", error);
    if (data) setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("matches").insert([{
      sport, title, team_a: teamA, team_b: teamB, score_a: scoreA, score_b: scoreB, status, live
    }]);

    if (error) {
      alert("Error adding match: " + error.message);
    } else {
      alert("Match added successfully!");
      // Reset form
      setTeamA(""); setTeamB(""); setTitle("");
      fetchMatches();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    await supabase.from("matches").delete().eq("id", id);
    fetchMatches();
  };

  const toggleLive = async (id: number, currentLive: boolean) => {
    await supabase.from("matches").update({ live: !currentLive }).eq("id", id);
    fetchMatches();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Matches</h1>

      {/* Add Match Form */}
      <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-xl mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Match</h2>
        <form onSubmit={handleAddMatch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Sport</label>
            <select value={sport} onChange={e => setSport(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required>
              <option value="cricket">Cricket</option>
              <option value="football">Football</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Title / Event</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. T20 World Cup Final" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Team A Name</label>
            <input type="text" value={teamA} onChange={e => setTeamA(e.target.value)} placeholder="India" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Team B Name</label>
            <input type="text" value={teamB} onChange={e => setTeamB(e.target.value)} placeholder="Australia" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Team A Score</label>
            <input type="text" value={scoreA} onChange={e => setScoreA(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Team B Score</label>
            <input type="text" value={scoreB} onChange={e => setScoreB(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Match Status</label>
            <input type="text" value={status} onChange={e => setStatus(e.target.value)} placeholder="e.g. 1st Innings, Full Time" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-white text-sm" required />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="liveToggle" checked={live} onChange={e => setLive(e.target.checked)} className="w-4 h-4 bg-zinc-900 border-zinc-700 rounded" />
            <label htmlFor="liveToggle" className="text-sm font-bold text-red-500">Currently Live?</label>
          </div>
          
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors">
              Create Match
            </button>
          </div>
        </form>
      </div>

      {/* Matches List */}
      <div className="bg-zinc-800/20 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs text-zinc-300 uppercase">
              <tr>
                <th className="px-6 py-3">Sport</th>
                <th className="px-6 py-3">Match</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Scores</th>
                <th className="px-6 py-3">Live</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
              ) : matches.map(match => (
                <tr key={match.id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                  <td className="px-6 py-4 uppercase font-bold text-xs">{match.sport}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white mb-1">{match.title}</div>
                    <div className="text-xs">{match.team_a} vs {match.team_b}</div>
                  </td>
                  <td className="px-6 py-4">{match.status}</td>
                  <td className="px-6 py-4 font-mono text-xs text-white">
                    {match.score_a} - {match.score_b}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleLive(match.id, match.live)} className={`px-2 py-1 rounded text-xs font-bold ${match.live ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                      {match.live ? 'LIVE' : 'OFF'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(match.id)} className="text-red-500 hover:underline text-xs font-semibold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && !loading && (
                <tr><td colSpan={6} className="text-center py-4">No matches found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
