import { createClient } from "@/utils/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  
  const [
    { count: matchesCount },
    { count: newsCount },
    { count: highlightsCount }
  ] = await Promise.all([
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("highlights").select("*", { count: "exact", head: true })
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <p className="text-zinc-400 mb-8">Welcome to the PulseSports admin panel. Manage your content here.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl">
          <h3 className="text-zinc-400 font-medium mb-1">Total Matches</h3>
          <p className="text-4xl font-bold text-white">{matchesCount || 0}</p>
        </div>
        <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl">
          <h3 className="text-zinc-400 font-medium mb-1">News Articles</h3>
          <p className="text-4xl font-bold text-white">{newsCount || 0}</p>
        </div>
        <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl">
          <h3 className="text-zinc-400 font-medium mb-1">Video Highlights</h3>
          <p className="text-4xl font-bold text-white">{highlightsCount || 0}</p>
        </div>
      </div>
    </div>
  );
}
