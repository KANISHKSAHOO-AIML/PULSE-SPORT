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
    const { data: match } = await supabase
      .from("matches")
      .select("team_a, team_b, score_a, score_b, status, sport, live, title")
      .eq("id", id)
      .single();

    if (match) {
      const sportLabel = match.sport === "cricket" ? "Cricket" : "Football";
      const liveLabel = match.live ? "LIVE " : "";
      const title = `${liveLabel}${match.team_a} vs ${match.team_b} | ${sportLabel} Score | PulseSports`;
      const description = `${liveLabel}${sportLabel} score: ${match.team_a} ${match.score_a || ""} vs ${match.team_b} ${match.score_b || ""}. ${match.status}. Live updates, AI analysis, win probability & fan reactions on PulseSports.`;

      return {
        title,
        description,
        openGraph: {
          title: `${match.team_a} vs ${match.team_b} — ${sportLabel} Match Center`,
          description,
          type: "website",
          siteName: "PulseSports",
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
        },
        other: {
          // Structured Data for SportsEvent
          "script:ld+json": JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": `${match.team_a} vs ${match.team_b}`,
            "description": match.title || `${match.team_a} vs ${match.team_b}`,
            "eventStatus": match.live ? "https://schema.org/EventScheduled" : "https://schema.org/EventCompleted",
            "sport": sportLabel,
            "competitor": [
              {
                "@type": "SportsTeam",
                "name": match.team_a,
              },
              {
                "@type": "SportsTeam",
                "name": match.team_b,
              },
            ],
          }),
        },
      };
    }
  } catch (error) {
    // Gracefully fall back
  }

  return {
    title: "Match Center | PulseSports",
    description: "Live match scores, AI analytics, fan predictions — PulseSports Match Center.",
  };
}

export default function MatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
