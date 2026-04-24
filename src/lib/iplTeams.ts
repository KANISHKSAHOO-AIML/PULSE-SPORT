// IPL Team data — colors, names, logos
export interface IPLTeam {
  id: string;
  name: string;
  short: string;
  color: string;
  colorRgb: string;
  emoji: string;
  city: string;
  logo?: string;
}

export const IPL_TEAMS: Record<string, IPLTeam> = {
  CSK: { id: "CSK", name: "Chennai Super Kings", short: "CSK", color: "#FDB913", colorRgb: "253,185,19", emoji: "🦁", city: "Chennai", logo: "/ipl-logos/CSK.png" },
  MI: { id: "MI", name: "Mumbai Indians", short: "MI", color: "#004BA0", colorRgb: "0,75,160", emoji: "🔵", city: "Mumbai", logo: "/ipl-logos/MI.png" },
  RCB: { id: "RCB", name: "Royal Challengers Bengaluru", short: "RCB", color: "#EC1C24", colorRgb: "236,28,36", emoji: "🔴", city: "Bengaluru", logo: "/ipl-logos/RCB.png" },
  KKR: { id: "KKR", name: "Kolkata Knight Riders", short: "KKR", color: "#3A225D", colorRgb: "58,34,93", emoji: "💜", city: "Kolkata", logo: "/ipl-logos/KKR.png" },
  DC: { id: "DC", name: "Delhi Capitals", short: "DC", color: "#004C93", colorRgb: "0,76,147", emoji: "🔷", city: "Delhi", logo: "/ipl-logos/DC.png" },
  PBKS: { id: "PBKS", name: "Punjab Kings", short: "PBKS", color: "#ED1B24", colorRgb: "237,27,36", emoji: "❤️", city: "Mohali", logo: "/ipl-logos/PBKS.png" },
  RR: { id: "RR", name: "Rajasthan Royals", short: "RR", color: "#EA1A85", colorRgb: "234,26,133", emoji: "💗", city: "Jaipur", logo: "/ipl-logos/RR.png" },
  SRH: { id: "SRH", name: "Sunrisers Hyderabad", short: "SRH", color: "#FF822A", colorRgb: "255,130,42", emoji: "🧡", city: "Hyderabad", logo: "/ipl-logos/SRH.png" },
  GT: { id: "GT", name: "Gujarat Titans", short: "GT", color: "#1B2133", colorRgb: "27,33,51", emoji: "⚡", city: "Ahmedabad", logo: "/ipl-logos/GT.png" },
  LSG: { id: "LSG", name: "Lucknow Super Giants", short: "LSG", color: "#A72056", colorRgb: "167,32,86", emoji: "🩵", city: "Lucknow", logo: "/ipl-logos/LSG.png" },
  // Defunct / old
  DD: { id: "DD", name: "Delhi Daredevils", short: "DD", color: "#004C93", colorRgb: "0,76,147", emoji: "🔷", city: "Delhi", logo: "https://upload.wikimedia.org/wikipedia/en/2/2f/Delhi_Capitals.svg" },
  KXIP: { id: "KXIP", name: "Kings XI Punjab", short: "KXIP", color: "#ED1B24", colorRgb: "237,27,36", emoji: "❤️", city: "Mohali", logo: "https://upload.wikimedia.org/wikipedia/en/d/d4/Punjab_Kings_Logo.svg" },
  PWI: { id: "PWI", name: "Pune Warriors India", short: "PWI", color: "#2F9BE3", colorRgb: "47,155,227", emoji: "🔵", city: "Pune" },
  RPS: { id: "RPS", name: "Rising Pune Supergiant", short: "RPS", color: "#6F42C1", colorRgb: "111,66,193", emoji: "💜", city: "Pune" },
  GL: { id: "GL", name: "Gujarat Lions", short: "GL", color: "#E04F16", colorRgb: "224,79,22", emoji: "🦁", city: "Rajkot" },
  KTK: { id: "KTK", name: "Kochi Tuskers Kerala", short: "KTK", color: "#FF6B00", colorRgb: "255,107,0", emoji: "🐘", city: "Kochi" },
  DEC: { id: "DEC", name: "Deccan Chargers", short: "DEC", color: "#1A1A2E", colorRgb: "26,26,46", emoji: "⚡", city: "Hyderabad" },
};

export function getTeamByName(name: string): IPLTeam | undefined {
  const lower = name.toLowerCase();
  return Object.values(IPL_TEAMS).find(
    t => t.name.toLowerCase().includes(lower) || t.short.toLowerCase() === lower || t.city.toLowerCase() === lower
  );
}
