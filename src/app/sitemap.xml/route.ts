import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = "https://pulsesports.live";

  // Fetch dynamic pages
  const [matchesRes, newsRes] = await Promise.all([
    supabase.from("matches").select("id, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("news").select("id, created_at").order("created_at", { ascending: false }).limit(200),
  ]);

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "always" },
    { url: "/news", priority: "0.9", changefreq: "hourly" },
    { url: "/ipl", priority: "0.9", changefreq: "hourly" },
    { url: "/highlights", priority: "0.8", changefreq: "daily" },
    { url: "/players", priority: "0.7", changefreq: "daily" },
    { url: "/login", priority: "0.3", changefreq: "monthly" },
  ];

  const matchPages = (matchesRes.data || []).map((m: any) => ({
    url: `/matches/${m.id}`,
    priority: "0.8",
    changefreq: "always",
    lastmod: m.created_at,
  }));

  const newsPages = (newsRes.data || []).map((n: any) => ({
    url: `/news/${n.id}`,
    priority: "0.7",
    changefreq: "daily",
    lastmod: n.created_at,
  }));

  const allPages = [...staticPages, ...matchPages, ...newsPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
    .map(
      (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.lastmod ? `\n    <lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ""}
  </url>`
    )
    .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
