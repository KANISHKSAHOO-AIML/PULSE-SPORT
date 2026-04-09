import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { LayoutDashboard, Trophy, FileText, Video } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-dark-bg text-foreground flex flex-col">
      <Header />
      <div className="flex flex-1 container mx-auto px-4 py-8 max-w-6xl gap-8 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white">
              <LayoutDashboard className="w-5 h-5" />
              Overview
            </Link>
            <Link href="/admin/matches" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white">
              <Trophy className="w-5 h-5" />
              Live Matches
            </Link>
            <Link href="/admin/news" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white">
              <FileText className="w-5 h-5" />
              News
            </Link>
            <Link href="/admin/highlights" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white">
              <Video className="w-5 h-5" />
              Highlights
            </Link>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
