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
  { matchNo: 36, date: "2026-04-25T19:30:00+05:30", team1: "RR",  team2: "SRH", venue: "Sawai Mansingh Stadium, Jaipur",    status: "live" },
  { matchNo: 37, date: "2026-04-26T15:30:00+05:30", team1: "CSK", team2: "GT",  venue: "MA Chidambaram Stadium, Chennai",   status: "upcoming" },
  { matchNo: 38, date: "2026-04-26T19:30:00+05:30", team1: "LSG", team2: "KKR", venue: "Ekana Cricket Stadium, Lucknow",    status: "upcoming" },
  { matchNo: 39, date: "2026-04-27T19:30:00+05:30", team1: "DC",  team2: "RCB", venue: "Arun Jaitley Stadium, Delhi",       status: "upcoming" },
  { matchNo: 40, date: "2026-04-28T19:30:00+05:30", team1: "PBKS", team2: "RR", venue: "Maharaja Yadavindra Singh Stadium, New Chandigarh", status: "upcoming" },
  { matchNo: 41, date: "2026-04-29T19:30:00+05:30", team1: "MI",  team2: "SRH", venue: "Wankhede Stadium, Mumbai",          status: "upcoming" },
  { matchNo: 42, date: "2026-04-30T19:30:00+05:30", team1: "GT",  team2: "RCB", venue: "Narendra Modi Stadium, Ahmedabad",  status: "upcoming" },
  { matchNo: 43, date: "2026-05-01T19:30:00+05:30", team1: "RR",  team2: "DC",  venue: "Sawai Mansingh Stadium, Jaipur",    status: "upcoming" },
  { matchNo: 44, date: "2026-05-02T19:30:00+05:30", team1: "CSK", team2: "MI",  venue: "MA Chidambaram Stadium, Chennai",   status: "upcoming" },
  { matchNo: 45, date: "2026-05-03T15:30:00+05:30", team1: "SRH", team2: "KKR", venue: "Rajiv Gandhi Intl Stadium, Hyderabad", status: "upcoming" },
  { matchNo: 46, date: "2026-05-03T19:30:00+05:30", team1: "GT",  team2: "PBKS", venue: "Narendra Modi Stadium, Ahmedabad", status: "upcoming" },
  { matchNo: 47, date: "2026-05-04T19:30:00+05:30", team1: "MI",  team2: "LSG", venue: "Wankhede Stadium, Mumbai",          status: "upcoming" },
];
