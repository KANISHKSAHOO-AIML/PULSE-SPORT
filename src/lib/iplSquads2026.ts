/**
 * IPL 2026 Real Squad Data — All 10 Teams
 * Source: Official IPL website, auction results (Dec 2025 mini-auction)
 */

export interface SquadMember {
  name: string;
  role: "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";
  isCapped: boolean;   // International caps
  isOverseas: boolean;
}

export const IPL_2026_SQUADS: Record<string, SquadMember[]> = {
  // ─── Chennai Super Kings ─────────────────────────────────────────
  CSK: [
    { name: "Ruturaj Gaikwad", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "MS Dhoni", role: "Wicket-Keeper", isCapped: true, isOverseas: false },
    { name: "Sanju Samson", role: "Wicket-Keeper", isCapped: true, isOverseas: false },
    { name: "Shivam Dube", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Dewald Brevis", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Ayush Mhatre", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Urvil Patel", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Sarfaraz Khan", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Matthew Short", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Kartik Sharma", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Prashant Veer", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Jamie Overton", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Noor Ahmad", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Khaleel Ahmed", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Anshul Kamboj", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Gurjapneet Singh", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Shreyas Gopal", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Mukesh Choudhary", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Nathan Ellis", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Akeal Hosein", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Matt Henry", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Aman Khan", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Rahul Chahar", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Ramakrishna Ghosh", role: "Wicket-Keeper", isCapped: false, isOverseas: false },
    { name: "Zakary Foulkes", role: "Bowler", isCapped: false, isOverseas: true },
  ],

  // ─── Mumbai Indians ──────────────────────────────────────────────
  MI: [
    { name: "Hardik Pandya", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Rohit Sharma", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Suryakumar Yadav", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Tilak Varma", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Jasprit Bumrah", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Trent Boult", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Quinton de Kock", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Naman Dhir", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Deepak Chahar", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Shardul Thakur", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Will Jacks", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Mitchell Santner", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Sherfane Rutherford", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Ryan Rickelton", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Robin Minz", role: "Wicket-Keeper", isCapped: false, isOverseas: false },
    { name: "Raj Angad Bawa", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Corbin Bosch", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Allah Ghazanfar", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Keshav Maharaj", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Mayank Markande", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Atharva Ankolekar", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Ashwani Kumar", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Danish Malewar", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Raghu Sharma", role: "Bowler", isCapped: false, isOverseas: false },
  ],

  // ─── Royal Challengers Bengaluru ─────────────────────────────────
  RCB: [
    { name: "Rajat Patidar", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Virat Kohli", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Devdutt Padikkal", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Phil Salt", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Jitesh Sharma", role: "Wicket-Keeper", isCapped: true, isOverseas: false },
    { name: "Krunal Pandya", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Tim David", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Romario Shepherd", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Jacob Bethell", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Josh Hazlewood", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Yash Dayal", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Bhuvneshwar Kumar", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Nuwan Thushara", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Rasikh Salam", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Swapnil Singh", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Suyash Sharma", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Abhinandan Singh", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Venkatesh Iyer", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Mangesh Yadav", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Jacob Duffy", role: "Bowler", isCapped: true, isOverseas: true },
  ],

  // ─── Kolkata Knight Riders ───────────────────────────────────────
  KKR: [
    { name: "Ajinkya Rahane", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Rinku Singh", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Sunil Narine", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Varun Chakaravarthy", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Harshit Rana", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Cameron Green", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Matheesha Pathirana", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Rachin Ravindra", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Rovman Powell", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Angkrish Raghuvanshi", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Manish Pandey", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Ramandeep Singh", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Anukul Roy", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Vaibhav Arora", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Umran Malik", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Finn Allen", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Rahul Tripathi", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Akash Deep", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Kartik Tyagi", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Blessing Muzarabani", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Tim Seifert", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Prashant Solanki", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Sarthak Ranjan", role: "All-Rounder", isCapped: false, isOverseas: false },
  ],

  // ─── Delhi Capitals ──────────────────────────────────────────────
  DC: [
    { name: "Axar Patel", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "KL Rahul", role: "Wicket-Keeper", isCapped: true, isOverseas: false },
    { name: "Kuldeep Yadav", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Mitchell Starc", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "T. Natarajan", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Tristan Stubbs", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Mukesh Kumar", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Abishek Porel", role: "Wicket-Keeper", isCapped: false, isOverseas: false },
    { name: "Ashutosh Sharma", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Sameer Rizvi", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Karun Nair", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Nitish Rana", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Prithvi Shaw", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "David Miller", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Ben Duckett", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Pathum Nissanka", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Lungi Ngidi", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Kyle Jamieson", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Dushmantha Chameera", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Madhav Tiwari", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Tripurana Vijay", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Vipraj Nigam", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Sahil Parakh", role: "Bowler", isCapped: false, isOverseas: false },
  ],

  // ─── Punjab Kings ────────────────────────────────────────────────
  PBKS: [
    { name: "Shreyas Iyer", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Marcus Stoinis", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Arshdeep Singh", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Yuzvendra Chahal", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Lockie Ferguson", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Marco Jansen", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Nehal Wadhera", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Prabhsimran Singh", role: "Wicket-Keeper", isCapped: false, isOverseas: false },
    { name: "Harpreet Brar", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Shashank Singh", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Azmatullah Omarzai", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Musheer Khan", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Priyansh Arya", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Vyshak Vijaykumar", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Yash Thakur", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Xavier Bartlett", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Vishnu Vinod", role: "Wicket-Keeper", isCapped: false, isOverseas: false },
    { name: "Harnoor Pannu", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Suryansh Shedge", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Mitch Owen", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Cooper Connolly", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Ben Dwarshuis", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Pravin Dubey", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Pyla Avinash", role: "Batsman", isCapped: false, isOverseas: false },
  ],

  // ─── Rajasthan Royals ────────────────────────────────────────────
  RR: [
    { name: "Riyan Parag", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Yashasvi Jaiswal", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Dhruv Jurel", role: "Wicket-Keeper", isCapped: true, isOverseas: false },
    { name: "Shimron Hetmyer", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Ravindra Jadeja", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Jofra Archer", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Sandeep Sharma", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Tushar Deshpande", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Donovan Ferreira", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Kwena Maphaka", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Dasun Shanaka", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Nandre Burger", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Kuldeep Sen", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Shubham Dubey", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Vaibhav Sooryavanshi", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Adam Milne", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Ravi Bishnoi", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Lhuan-dre Pretorius", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Yudhvir Singh Charak", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Sushant Mishra", role: "Bowler", isCapped: false, isOverseas: false },
  ],

  // ─── Sunrisers Hyderabad ─────────────────────────────────────────
  SRH: [
    { name: "Pat Cummins", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Heinrich Klaasen", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Travis Head", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Abhishek Sharma", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Ishan Kishan", role: "Wicket-Keeper", isCapped: true, isOverseas: false },
    { name: "Liam Livingstone", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Harshal Patel", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Nitish Kumar Reddy", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Kamindu Mendis", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Brydon Carse", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Jaydev Unadkat", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Shivam Mavi", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Jack Edwards", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Zeeshan Ansari", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Aniket Verma", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Eshan Malinga", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Sakib Hussain", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Salil Arora", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Smaran Ravichandran", role: "Batsman", isCapped: false, isOverseas: false },
  ],

  // ─── Gujarat Titans ──────────────────────────────────────────────
  GT: [
    { name: "Shubman Gill", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Jos Buttler", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Rashid Khan", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Sai Sudharsan", role: "Batsman", isCapped: true, isOverseas: false },
    { name: "Kagiso Rabada", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Mohammed Siraj", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Prasidh Krishna", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Rahul Tewatia", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Shahrukh Khan", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Washington Sundar", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Jason Holder", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Tom Banton", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Anuj Rawat", role: "Wicket-Keeper", isCapped: false, isOverseas: false },
    { name: "Kumar Kushagra", role: "Wicket-Keeper", isCapped: false, isOverseas: false },
    { name: "Ishant Sharma", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Sai Kishore", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Jayant Yadav", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Nishant Sindhu", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Manav Suthar", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Luke Wood", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Gurnoor Singh Brar", role: "All-Rounder", isCapped: false, isOverseas: false },
  ],

  // ─── Lucknow Super Giants ───────────────────────────────────────
  LSG: [
    { name: "Rishabh Pant", role: "Wicket-Keeper", isCapped: true, isOverseas: false },
    { name: "Nicholas Pooran", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Aiden Markram", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Mitchell Marsh", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Mohammad Shami", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Anrich Nortje", role: "Bowler", isCapped: true, isOverseas: true },
    { name: "Mayank Yadav", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Mohsin Khan", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Avesh Khan", role: "Bowler", isCapped: true, isOverseas: false },
    { name: "Wanindu Hasaranga", role: "All-Rounder", isCapped: true, isOverseas: true },
    { name: "Josh Inglis", role: "Wicket-Keeper", isCapped: true, isOverseas: true },
    { name: "Ayush Badoni", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Abdul Samad", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Shahbaz Ahamad", role: "All-Rounder", isCapped: true, isOverseas: false },
    { name: "Arjun Tendulkar", role: "All-Rounder", isCapped: false, isOverseas: false },
    { name: "Himmat Singh", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Matthew Breetzke", role: "Batsman", isCapped: true, isOverseas: true },
    { name: "Manimaran Siddharth", role: "Bowler", isCapped: false, isOverseas: false },
    { name: "Akshat Raghuwanshi", role: "Batsman", isCapped: false, isOverseas: false },
    { name: "Digvesh Singh", role: "Bowler", isCapped: false, isOverseas: false },
  ],
};

const TEAM_NAME_MAPPING: Record<string, string> = {
  "CHENNAI SUPER KINGS": "CSK",
  "MUMBAI INDIANS": "MI",
  "ROYAL CHALLENGERS BENGALURU": "RCB",
  "KOLKATA KNIGHT RIDERS": "KKR",
  "DELHI CAPITALS": "DC",
  "PUNJAB KINGS": "PBKS",
  "RAJASTHAN ROYALS": "RR",
  "SUNRISERS HYDERABAD": "SRH",
  "GUJARAT TITANS": "GT",
  "LUCKNOW SUPER GIANTS": "LSG"
};

/** Get squad for a team by short code or full name */
export function getTeamSquad(teamNameOrCode: string): SquadMember[] {
  const normalized = teamNameOrCode.toUpperCase().trim();
  
  // If it's already a short code, use it directly
  if (IPL_2026_SQUADS[normalized]) {
    return IPL_2026_SQUADS[normalized];
  }
  
  // Check if it's a full name that needs mapping
  for (const [fullName, shortCode] of Object.entries(TEAM_NAME_MAPPING)) {
    if (fullName.includes(normalized) || normalized.includes(fullName)) {
      return IPL_2026_SQUADS[shortCode] || [];
    }
  }

  // Fallback for partial matches (e.g. "Delhi")
  if (normalized.includes("DELHI")) return IPL_2026_SQUADS["DC"];
  if (normalized.includes("PUNJAB")) return IPL_2026_SQUADS["PBKS"];
  if (normalized.includes("RAJASTHAN")) return IPL_2026_SQUADS["RR"];
  if (normalized.includes("MUMBAI")) return IPL_2026_SQUADS["MI"];
  if (normalized.includes("CHENNAI")) return IPL_2026_SQUADS["CSK"];
  if (normalized.includes("KOLKATA")) return IPL_2026_SQUADS["KKR"];
  if (normalized.includes("BENGALURU") || normalized.includes("BANGALORE")) return IPL_2026_SQUADS["RCB"];
  if (normalized.includes("HYDERABAD")) return IPL_2026_SQUADS["SRH"];
  if (normalized.includes("GUJARAT")) return IPL_2026_SQUADS["GT"];
  if (normalized.includes("LUCKNOW")) return IPL_2026_SQUADS["LSG"];

  return [];
}
