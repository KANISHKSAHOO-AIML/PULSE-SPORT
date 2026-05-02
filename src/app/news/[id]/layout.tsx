import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: article } = await supabase.from("news").select("title, summary, sport, image_url").eq("id", id).single();

    if (article) {
      return {
        title: `${article.title} | PulseSports ${article.sport === "cricket" ? "Cricket" : "Football"} News`,
        description: article.summary?.substring(0, 160) || `Read the latest ${article.sport} news on PulseSports.`,
        openGraph: {
          title: article.title,
          description: article.summary?.substring(0, 160),
          images: article.image_url ? [article.image_url] : [],
          type: "article",
          siteName: "PulseSports",
        },
        twitter: {
          card: "summary_large_image",
          title: article.title,
          description: article.summary?.substring(0, 160),
          images: article.image_url ? [article.image_url] : [],
        },
      };
    }
  } catch (error) {
    // Gracefully fall back
  }

  return {
    title: "News Article | PulseSports",
    description: "Read the latest sports news on PulseSports.",
  };
}

export default function NewsArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
