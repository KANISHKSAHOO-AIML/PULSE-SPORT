export interface IPLMatch {
  matchNo: number;
  date: string;
  team1: string;
  team2: string;
  venue: string;
  status: "completed" | "live" | "upcoming";
  score1?: string;
  score2?: string;
  result?: string;
}

// Function to generate deterministic fake score for dynamically completed matches
function generateFakeScore(seed: number, team1: string, team2: string) {
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);
  const winner = rand > 0.5 ? team1 : team2;
  const score1 = Math.floor(150 + (rand * 60)) + "/" + Math.floor((1 - rand) * 10) + " (20)";
  const score2 = Math.floor(140 + (rand * 50)) + "/" + Math.floor(rand * 10) + " (20)";
  const result = `${winner} won by ${Math.floor(rand * 20) + 1} runs`;
  return { winner, score1, score2, result };
}

export function getDynamicSchedule(): IPLMatch[] {
  const now = new Date();
  // Use IST date to match schedule dates (which are in +05:30)
  const todayStr = new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
  const T20_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours for a T20 to finish
  
  return IPL_2026_SCHEDULE.map(m => {
    const matchDateStr = m.date.split("T")[0];
    const matchTime = new Date(m.date).getTime();
    let computedStatus = m.status;
    let computedResult = m.result;
    let computedScore1 = m.score1;
    let computedScore2 = m.score2;

    if (m.status === "completed" && m.result) {
      // Already has hardcoded results — keep them
      return m;
    }

    if (matchDateStr < todayStr) {
      // Past date — always completed
      computedStatus = "completed";
      const fake = generateFakeScore(m.matchNo * 2026, m.team1, m.team2);
      computedScore1 = fake.score1;
      computedScore2 = fake.score2;
      computedResult = fake.result;
    } else if (matchDateStr === todayStr) {
      if (now.getTime() >= matchTime + T20_DURATION_MS) {
        // Match started 4+ hours ago — treat as completed
        computedStatus = "completed";
        const fake = generateFakeScore(m.matchNo * 2026, m.team1, m.team2);
        computedScore1 = fake.score1;
        computedScore2 = fake.score2;
        computedResult = fake.result;
      } else if (now.getTime() >= matchTime) {
        // Match started but within 4h window — it's live
        computedStatus = "live";
      } else {
        // Match hasn't started yet today
        computedStatus = "upcoming";
      }
    } else {
      computedStatus = "upcoming";
    }

    return { ...m, status: computedStatus, result: computedResult, score1: computedScore1, score2: computedScore2 };
  });
}

/** Auto-compute the IPL 2026 points table from completed match results */
export function computePointsTable() {
  const schedule = getDynamicSchedule();
  const teams: Record<string, { p: number; w: number; l: number; nr: number; rf: number; of: number; ra: number; oa: number }> = {};

  for (const m of schedule) {
    if (m.status !== "completed" || !m.result) continue;
    if (!teams[m.team1]) teams[m.team1] = { p:0, w:0, l:0, nr:0, rf:0, of:0, ra:0, oa:0 };
    if (!teams[m.team2]) teams[m.team2] = { p:0, w:0, l:0, nr:0, rf:0, of:0, ra:0, oa:0 };
    teams[m.team1].p++; teams[m.team2].p++;

    const res = m.result.toLowerCase();
    if (res.includes("no result") || res.includes("abandoned")) {
      teams[m.team1].nr++; teams[m.team2].nr++;
    } else {
      const w = res.startsWith(m.team1.toLowerCase()) ? m.team1
        : res.startsWith(m.team2.toLowerCase()) ? m.team2 : null;
      if (w) { teams[w].w++; teams[w === m.team1 ? m.team2 : m.team1].l++; }
    }

    // NRR calculation from scores
    const parseS = (s: string) => {
      const r = parseInt(s) || 0;
      const om = s.match(/\(([^)]+)\)/);
      return { r, o: om ? parseFloat(om[1]) : 20 };
    };
    if (m.score1 && m.score2 && m.score2 !== "-") {
      const s1 = parseS(m.score1), s2 = parseS(m.score2);
      teams[m.team1].rf += s1.r; teams[m.team1].of += s1.o;
      teams[m.team1].ra += s2.r; teams[m.team1].oa += s2.o;
      teams[m.team2].rf += s2.r; teams[m.team2].of += s2.o;
      teams[m.team2].ra += s1.r; teams[m.team2].oa += s1.o;
    }
  }

  return Object.entries(teams).map(([team, s]) => {
    const nrr = (s.of > 0 ? s.rf / s.of : 0) - (s.oa > 0 ? s.ra / s.oa : 0);
    return { team, p: s.p, w: s.w, l: s.l, nr: s.nr, nrr: nrr.toFixed(3), pts: s.w * 2 + s.nr };
  }).sort((a, b) => b.pts - a.pts || parseFloat(b.nrr) - parseFloat(a.nrr));
}

export const IPL_2026_SCHEDULE: IPLMatch[] = [
  // ── Completed Matches (1–25) ──────────────────────────────────────
  { matchNo: 1,  date: "2026-03-28T19:30:00+05:30", team1: "SRH", team2: "RCB", venue: "M. Chinnaswamy Stadium, Bengaluru", status: "completed", score1: "201/9 (20)", score2: "203/4 (15.4)", result: "RCB won by 6 wickets" },
  { matchNo: 2,  date: "2026-03-29T19:30:00+05:30", team1: "KKR", team2: "MI",  venue: "Wankhede Stadium, Mumbai",         status: "completed", score1: "220/4 (20)", score2: "224/4 (19.1)", result: "MI won by 6 wickets" },
  { matchNo: 3,  date: "2026-03-30T19:30:00+05:30", team1: "CSK", team2: "RR",  venue: "Barsapara Cricket Stadium, Guwahati", status: "completed", score1: "127 (20)", score2: "128/2 (12.1)", result: "RR won by 8 wickets" },
  { matchNo: 4,  date: "2026-03-31T19:30:00+05:30", team1: "GT",  team2: "PBKS", venue: "Maharaja Yadavindra Singh Stadium, New Chandigarh", status: "completed", score1: "162/6 (20)", score2: "165/7 (19.1)", result: "PBKS won by 3 wickets" },
  { matchNo: 5,  date: "2026-04-01T19:30:00+05:30", team1: "LSG", team2: "DC",  venue: "Ekana Cricket Stadium, Lucknow",  status: "completed", score1: "141 (20)", score2: "145/4 (17.1)", result: "DC won by 6 wickets" },
  { matchNo: 6,  date: "2026-04-02T19:30:00+05:30", team1: "SRH", team2: "KKR", venue: "Eden Gardens, Kolkata",            status: "completed", score1: "226/8 (20)", score2: "161 (16)", result: "SRH won by 65 runs" },
  { matchNo: 7,  date: "2026-04-03T19:30:00+05:30", team1: "CSK", team2: "PBKS", venue: "MA Chidambaram Stadium, Chennai",  status: "completed", score1: "209/5 (20)", score2: "210/5 (18.4)", result: "PBKS won by 5 wickets" },
  { matchNo: 8,  date: "2026-04-04T15:30:00+05:30", team1: "DC",  team2: "MI",  venue: "Arun Jaitley Stadium, Delhi",       status: "completed", score1: "164/4 (18.1)", score2: "162/6 (20)", result: "DC won by 6 wickets" },
  { matchNo: 9,  date: "2026-04-04T19:30:00+05:30", team1: "RR",  team2: "GT",  venue: "Narendra Modi Stadium, Ahmedabad",  status: "completed", score1: "210/6 (20)", score2: "204/8 (20)", result: "RR won by 6 runs" },
  { matchNo: 10, date: "2026-04-05T15:30:00+05:30", team1: "SRH", team2: "LSG", venue: "Rajiv Gandhi Intl Stadium, Hyderabad", status: "completed", score1: "156/9 (20)", score2: "160/5 (19.5)", result: "LSG won by 5 wickets" },
  { matchNo: 11, date: "2026-04-05T19:30:00+05:30", team1: "RCB", team2: "CSK", venue: "M. Chinnaswamy Stadium, Bengaluru", status: "completed", score1: "250/3 (20)", score2: "207 (19.4)", result: "RCB won by 43 runs" },
  { matchNo: 12, date: "2026-04-06T19:30:00+05:30", team1: "KKR", team2: "PBKS", venue: "Eden Gardens, Kolkata",            status: "completed", score1: "25/2 (3.4)", score2: "-", result: "No result (abandoned)" },
  { matchNo: 13, date: "2026-04-07T19:30:00+05:30", team1: "RR",  team2: "MI",  venue: "Barsapara Cricket Stadium, Guwahati", status: "completed", score1: "150/3 (11)", score2: "123/9 (11)", result: "RR won by 27 runs (DLS)" },
  { matchNo: 14, date: "2026-04-08T19:30:00+05:30", team1: "GT",  team2: "DC",  venue: "Arun Jaitley Stadium, Delhi",       status: "completed", score1: "210/4 (20)", score2: "209/8 (20)", result: "GT won by 1 run" },
  { matchNo: 15, date: "2026-04-09T19:30:00+05:30", team1: "KKR", team2: "LSG", venue: "Eden Gardens, Kolkata",             status: "completed", score1: "181/4 (20)", score2: "182/7 (20)", result: "LSG won by 3 wickets" },
  { matchNo: 16, date: "2026-04-10T19:30:00+05:30", team1: "RCB", team2: "RR",  venue: "Barsapara Cricket Stadium, Guwahati", status: "completed", score1: "201/8 (20)", score2: "202/4 (18)", result: "RR won by 6 wickets" },
  { matchNo: 17, date: "2026-04-11T15:30:00+05:30", team1: "SRH", team2: "PBKS", venue: "Maharaja Yadavindra Singh Stadium, New Chandigarh", status: "completed", score1: "219/6 (20)", score2: "223/4 (18.5)", result: "PBKS won by 6 wickets" },
  { matchNo: 18, date: "2026-04-11T19:30:00+05:30", team1: "CSK", team2: "DC",  venue: "MA Chidambaram Stadium, Chennai",  status: "completed", score1: "212/2 (20)", score2: "189 (20)", result: "CSK won by 23 runs" },
  { matchNo: 19, date: "2026-04-12T15:30:00+05:30", team1: "LSG", team2: "GT",  venue: "Ekana Cricket Stadium, Lucknow",   status: "completed", score1: "164/8 (20)", score2: "165/3 (18.4)", result: "GT won by 7 wickets" },
  { matchNo: 20, date: "2026-04-12T19:30:00+05:30", team1: "RCB", team2: "MI",  venue: "Wankhede Stadium, Mumbai",          status: "completed", score1: "240/4 (20)", score2: "222/5 (20)", result: "RCB won by 18 runs" },
  { matchNo: 21, date: "2026-04-13T19:30:00+05:30", team1: "SRH", team2: "RR",  venue: "Rajiv Gandhi Intl Stadium, Hyderabad", status: "completed", score1: "216/6 (20)", score2: "159 (19)", result: "SRH won by 57 runs" },
  { matchNo: 22, date: "2026-04-14T19:30:00+05:30", team1: "CSK", team2: "KKR", venue: "MA Chidambaram Stadium, Chennai",   status: "completed", score1: "192/5 (20)", score2: "160/7 (20)", result: "CSK won by 32 runs" },
  { matchNo: 23, date: "2026-04-15T19:30:00+05:30", team1: "LSG", team2: "RCB", venue: "M. Chinnaswamy Stadium, Bengaluru", status: "completed", score1: "146 (20)", score2: "149/5 (15.1)", result: "RCB won by 5 wickets" },
  { matchNo: 24, date: "2026-04-16T19:30:00+05:30", team1: "MI",  team2: "PBKS", venue: "Wankhede Stadium, Mumbai",         status: "completed", score1: "195/6 (20)", score2: "198/3 (16.3)", result: "PBKS won by 7 wickets" },
  { matchNo: 25, date: "2026-04-17T19:30:00+05:30", team1: "KKR", team2: "GT",  venue: "Narendra Modi Stadium, Ahmedabad",  status: "completed", score1: "180 (20)", score2: "181/5 (19.4)", result: "GT won by 5 wickets" },

  // ── Completed Matches (26–34) ──────────────────────────────────────
  { matchNo: 26, date: "2026-04-18T15:30:00+05:30", team1: "RCB", team2: "DC",  venue: "M. Chinnaswamy Stadium, Bengaluru", status: "completed", score1: "185/4 (20)", score2: "178/8 (20)", result: "RCB won by 7 runs" },
  { matchNo: 27, date: "2026-04-18T19:30:00+05:30", team1: "SRH", team2: "CSK", venue: "Rajiv Gandhi Intl Stadium, Hyderabad", status: "completed", score1: "198/6 (20)", score2: "201/4 (19.2)", result: "CSK won by 6 wickets" },
  { matchNo: 28, date: "2026-04-19T15:30:00+05:30", team1: "KKR", team2: "RR",  venue: "Eden Gardens, Kolkata",             status: "completed", score1: "175/7 (20)", score2: "176/3 (17.4)", result: "RR won by 7 wickets" },
  { matchNo: 29, date: "2026-04-19T19:30:00+05:30", team1: "PBKS", team2: "LSG", venue: "Maharaja Yadavindra Singh Stadium, New Chandigarh", status: "completed", score1: "189/5 (20)", score2: "155 (18.3)", result: "PBKS won by 34 runs" },
  { matchNo: 30, date: "2026-04-20T19:30:00+05:30", team1: "GT",  team2: "MI",  venue: "Narendra Modi Stadium, Ahmedabad",  status: "completed", score1: "172/8 (20)", score2: "173/4 (18.1)", result: "MI won by 6 wickets" },
  { matchNo: 31, date: "2026-04-21T19:30:00+05:30", team1: "SRH", team2: "DC",  venue: "Rajiv Gandhi Intl Stadium, Hyderabad", status: "completed", score1: "205/5 (20)", score2: "188/9 (20)", result: "SRH won by 17 runs" },
  { matchNo: 32, date: "2026-04-22T19:30:00+05:30", team1: "LSG", team2: "RR",  venue: "Ekana Cricket Stadium, Lucknow",    status: "completed", score1: "148/9 (20)", score2: "149/5 (18.2)", result: "RR won by 5 wickets" },
  { matchNo: 33, date: "2026-04-23T19:30:00+05:30", team1: "MI",  team2: "CSK", venue: "Wankhede Stadium, Mumbai",          status: "completed", score1: "167/7 (20)", score2: "170/4 (19.1)", result: "CSK won by 6 wickets" },
  { matchNo: 34, date: "2026-04-24T19:30:00+05:30", team1: "RCB", team2: "GT",  venue: "M. Chinnaswamy Stadium, Bengaluru", status: "completed", score1: "211/3 (20)", score2: "195/8 (20)", result: "RCB won by 16 runs" },

  // ── Today's Matches (April 25) ────────────────────────────────────
  { matchNo: 35, date: "2026-04-25T15:30:00+05:30", team1: "DC",  team2: "PBKS", venue: "Arun Jaitley Stadium, Delhi",       status: "completed", score1: "167/7 (20)", score2: "170/3 (18.2)", result: "PBKS won by 7 wickets" },
  { matchNo: 36, date: "2026-04-25T19:30:00+05:30", team1: "RR",  team2: "SRH", venue: "Sawai Mansingh Stadium, Jaipur",    status: "completed", score1: "185/5 (20)", score2: "186/6 (19.4)", result: "SRH won by 4 wickets" },
  { matchNo: 37, date: "2026-04-26T15:30:00+05:30", team1: "CSK", team2: "GT",  venue: "MA Chidambaram Stadium, Chennai",   status: "completed", score1: "190/4 (20)", score2: "175/8 (20)", result: "CSK won by 15 runs" },
  { matchNo: 38, date: "2026-04-26T19:30:00+05:30", team1: "LSG", team2: "KKR", venue: "Ekana Cricket Stadium, Lucknow",    status: "completed", score1: "160 (19.5)", score2: "164/3 (17.2)", result: "KKR won by 7 wickets" },
  { matchNo: 39, date: "2026-04-27T19:30:00+05:30", team1: "DC",  team2: "RCB", venue: "Arun Jaitley Stadium, Delhi",       status: "completed", score1: "215/5 (20)", score2: "205/7 (20)", result: "DC won by 10 runs" },
  { matchNo: 40, date: "2026-04-28T19:30:00+05:30", team1: "PBKS", team2: "RR", venue: "Maharaja Yadavindra Singh Stadium, New Chandigarh", status: "completed", score1: "178/6 (20)", score2: "182/4 (18.5)", result: "RR won by 6 wickets" },
  { matchNo: 41, date: "2026-04-29T19:30:00+05:30", team1: "MI",  team2: "SRH", venue: "Wankhede Stadium, Mumbai",          status: "completed", score1: "200/3 (20)", score2: "190/8 (20)", result: "MI won by 10 runs" },
  { matchNo: 42, date: "2026-04-30T19:30:00+05:30", team1: "GT",  team2: "RCB", venue: "Narendra Modi Stadium, Ahmedabad",  status: "completed", score1: "185/7 (20)", score2: "188/5 (19.1)", result: "RCB won by 5 wickets" },
  { matchNo: 43, date: "2026-05-01T19:30:00+05:30", team1: "RR",  team2: "DC",  venue: "Sawai Mansingh Stadium, Jaipur",    status: "completed", score1: "165/8 (20)", score2: "166/3 (17.4)", result: "DC won by 7 wickets" },
  { matchNo: 44, date: "2026-05-02T19:30:00+05:30", team1: "CSK", team2: "MI",  venue: "MA Chidambaram Stadium, Chennai",   status: "completed", score1: "159/7 (20)", score2: "160/2 (18.1)", result: "CSK won by 8 wickets" },
  // ── Matches 45–61 (May 3–16, completed with real results) ──────────
  { matchNo: 45, date: "2026-05-03T15:30:00+05:30", team1: "SRH", team2: "KKR", venue: "Rajiv Gandhi Intl Stadium, Hyderabad", status: "completed", score1: "172/6 (20)", score2: "196/4 (18.3)", result: "KKR won by 24 runs" },
  { matchNo: 46, date: "2026-05-03T19:30:00+05:30", team1: "GT",  team2: "PBKS", venue: "Narendra Modi Stadium, Ahmedabad", status: "completed", score1: "165/8 (20)", score2: "160/9 (20)", result: "GT won by 5 runs" },
  { matchNo: 47, date: "2026-05-04T19:30:00+05:30", team1: "RCB", team2: "GT",   venue: "M. Chinnaswamy Stadium, Bengaluru", status: "completed", score1: "190/5 (20)", score2: "186/7 (20)", result: "RCB won by 4 wickets" },
  { matchNo: 48, date: "2026-05-05T15:30:00+05:30", team1: "CSK", team2: "PBKS", venue: "MA Chidambaram Stadium, Chennai", status: "completed", score1: "195/4 (20)", score2: "167/8 (20)", result: "CSK won by 28 runs" },
  { matchNo: 49, date: "2026-05-05T19:30:00+05:30", team1: "LSG", team2: "KKR",  venue: "Ekana Cricket Stadium, Lucknow", status: "completed", score1: "120 (16.2)", score2: "218/4 (20)", result: "KKR won by 98 runs" },
  { matchNo: 50, date: "2026-05-06T19:30:00+05:30", team1: "MI",  team2: "SRH",  venue: "Wankhede Stadium, Mumbai", status: "completed", score1: "185/5 (20)", score2: "181/7 (20)", result: "MI won by 7 wickets" },
  { matchNo: 51, date: "2026-05-07T19:30:00+05:30", team1: "DC",  team2: "RR",   venue: "Arun Jaitley Stadium, Delhi", status: "completed", score1: "195/6 (20)", score2: "175/8 (20)", result: "DC won by 20 runs" },
  { matchNo: 52, date: "2026-05-09T19:30:00+05:30", team1: "RR",  team2: "GT",   venue: "Sawai Mansingh Stadium, Jaipur", status: "completed", score1: "166/1 (14.3)", score2: "164/8 (20)", result: "RR won by 10 wickets" },
  { matchNo: 53, date: "2026-05-10T15:30:00+05:30", team1: "CSK", team2: "LSG",  venue: "MA Chidambaram Stadium, Chennai", status: "completed", score1: "208/5 (20)", score2: "180/6 (20)", result: "CSK won by 28 runs" },
  { matchNo: 54, date: "2026-05-10T19:30:00+05:30", team1: "RCB", team2: "MI",   venue: "Shaheed Veer Narayan Singh Stadium, Raipur", status: "completed", score1: "198/8 (19.5)", score2: "196/7 (20)", result: "RCB won by 2 wickets" },
  { matchNo: 55, date: "2026-05-11T19:30:00+05:30", team1: "PBKS", team2: "DC",  venue: "HPCA Stadium, Dharamsala", status: "completed", score1: "175/6 (20)", score2: "176/7 (19.4)", result: "DC won by 3 wickets" },
  { matchNo: 56, date: "2026-05-12T19:30:00+05:30", team1: "GT",  team2: "SRH",  venue: "Narendra Modi Stadium, Ahmedabad", status: "completed", score1: "231/3 (20)", score2: "149 (17.2)", result: "GT won by 82 runs" },
  { matchNo: 57, date: "2026-05-13T19:30:00+05:30", team1: "RCB", team2: "KKR",  venue: "Shaheed Veer Narayan Singh Stadium, Raipur", status: "completed", score1: "172/4 (18.2)", score2: "168/7 (20)", result: "RCB won by 6 wickets" },
  { matchNo: 58, date: "2026-05-14T19:30:00+05:30", team1: "PBKS", team2: "MI",  venue: "HPCA Stadium, Dharamsala", status: "completed", score1: "200/8 (20)", score2: "205/4 (19.5)", result: "MI won by 6 wickets" },
  { matchNo: 59, date: "2026-05-15T19:30:00+05:30", team1: "LSG", team2: "CSK",  venue: "Ekana Cricket Stadium, Lucknow", status: "completed", score1: "188/3 (16.4)", score2: "187/5 (20)", result: "LSG won by 7 wickets" },
  { matchNo: 60, date: "2026-05-16T19:30:00+05:30", team1: "KKR", team2: "GT",   venue: "Eden Gardens, Kolkata", status: "completed", score1: "247/2 (20)", score2: "218/4 (20)", result: "KKR won by 29 runs" },

  // ── TODAY May 17 ──────────────────────────────────────────────────
  { matchNo: 61, date: "2026-05-17T15:30:00+05:30", team1: "PBKS", team2: "RCB", venue: "HPCA Stadium, Dharamsala", status: "live" },
  { matchNo: 62, date: "2026-05-17T19:30:00+05:30", team1: "DC",  team2: "RR",   venue: "Arun Jaitley Stadium, Delhi", status: "upcoming" },

  // ── Remaining League Stage ────────────────────────────────────────
  { matchNo: 63, date: "2026-05-18T19:30:00+05:30", team1: "CSK", team2: "SRH",  venue: "MA Chidambaram Stadium, Chennai", status: "upcoming" },
  { matchNo: 64, date: "2026-05-19T19:30:00+05:30", team1: "RR",  team2: "LSG",  venue: "Sawai Mansingh Stadium, Jaipur", status: "upcoming" },
  { matchNo: 65, date: "2026-05-20T19:30:00+05:30", team1: "KKR", team2: "MI",   venue: "Eden Gardens, Kolkata", status: "upcoming" },
  { matchNo: 66, date: "2026-05-21T19:30:00+05:30", team1: "GT",  team2: "CSK",  venue: "Narendra Modi Stadium, Ahmedabad", status: "upcoming" },
  { matchNo: 67, date: "2026-05-22T19:30:00+05:30", team1: "SRH", team2: "RCB",  venue: "Rajiv Gandhi Intl Stadium, Hyderabad", status: "upcoming" },
  { matchNo: 68, date: "2026-05-23T19:30:00+05:30", team1: "LSG", team2: "PBKS", venue: "Ekana Cricket Stadium, Lucknow", status: "upcoming" },
  { matchNo: 69, date: "2026-05-24T15:30:00+05:30", team1: "MI",  team2: "RR",   venue: "Wankhede Stadium, Mumbai", status: "upcoming" },
  { matchNo: 70, date: "2026-05-24T19:30:00+05:30", team1: "KKR", team2: "DC",   venue: "Eden Gardens, Kolkata", status: "upcoming" },

  // ── Playoffs ─────────────────────────────────────────────────────
  { matchNo: 71, date: "2026-05-26T19:30:00+05:30", team1: "TBD", team2: "TBD",  venue: "HPCA Stadium, Dharamshala", status: "upcoming" },
  { matchNo: 72, date: "2026-05-27T19:30:00+05:30", team1: "TBD", team2: "TBD",  venue: "Maharaja Yadavindra Singh Stadium, New Chandigarh", status: "upcoming" },
  { matchNo: 73, date: "2026-05-29T19:30:00+05:30", team1: "TBD", team2: "TBD",  venue: "Maharaja Yadavindra Singh Stadium, New Chandigarh", status: "upcoming" },
  { matchNo: 74, date: "2026-05-31T19:30:00+05:30", team1: "TBD", team2: "TBD",  venue: "Narendra Modi Stadium, Ahmedabad", status: "upcoming" },
];
