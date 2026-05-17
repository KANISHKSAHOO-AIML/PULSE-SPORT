const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const env = fs.readFileSync(".env.local", "utf8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const url = urlMatch ? urlMatch[1].trim() : null;
const key = keyMatch ? keyMatch[1].trim() : null;

const supabase = createClient(url, key);

async function fixDb() {
  const { data, error } = await supabase.from("matches").select("*");
  if (error) {
    console.error(error);
    return;
  }
  
  for (const m of data) {
    let changed = false;
    let scoreA = m.score_a;
    let scoreB = m.score_b;
    
    if (m.sport === "football") {
      if (parseInt(scoreA) > 50) { scoreA = "1"; changed = true; }
      if (parseInt(scoreB) > 50) { scoreB = "2"; changed = true; }
    } else if (m.sport === "cricket") {
      const fixRuns = (s) => {
        if (!s) return s;
        const match = s.match(/^(\d+)/);
        if (match && parseInt(match[1]) > 999) {
          return "120/2 (15)"; // default realistic score
        }
        return s;
      };
      
      const newScoreA = fixRuns(scoreA);
      const newScoreB = fixRuns(scoreB);
      if (newScoreA !== scoreA) { scoreA = newScoreA; changed = true; }
      if (newScoreB !== scoreB) { scoreB = newScoreB; changed = true; }
    }
    
    if (changed) {
      console.log(`Fixing match ${m.id} (${m.sport}): ${m.score_a} -> ${scoreA}, ${m.score_b} -> ${scoreB}`);
      await supabase.from("matches").update({ score_a: scoreA, score_b: scoreB }).eq("id", m.id);
    }
  }
  console.log("Done fixing DB.");
}

fixDb();
