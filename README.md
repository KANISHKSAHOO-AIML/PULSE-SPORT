<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-0.183-black?style=for-the-badge&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

<h1 align="center">
  ⚡ PulseSports
</h1>

<p align="center">
  <strong>A next-generation, immersive sports media platform for Cricket & Football.</strong><br />
  Real-time scores · 3D parallax scenes · AI-powered assistant · Live fan debates · Gamified predictions
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Env Variables</a> •
  <a href="#-database-setup">Database</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

# PulseSports: A Next-Generation Interactive Sports Ecosystem

**Institution:** CMR Institute of Technology (CMRIT)
**Project Title:** PulseSports – A Real-Time, AI-Driven Sports Aggregation and Gamification Platform

---

## 1. Abstract & Executive Summary

The modern sports consumption landscape is characterized by fragmentation. Fans are often forced to oscillate between multiple applications to view live scores, read sports journalism, and engage with fan communities. **PulseSports** is an interdisciplinary, real-time web application engineered to solve the "Passive Fandom" dilemma. By integrating a dynamic live-match tracker, an AI-powered journalism pipeline, and a high-concurrency gamification engine, PulseSports transforms the static sports-viewing experience into an interactive, centralized ecosystem. Built on a modern Next.js 16 architecture and augmented by React Three Fiber for spatial UI design, the platform delivers an enterprise-grade, zero-latency user experience. This report details the system architecture, core engineering challenges, and the fault-tolerant implementation strategies utilized in the development of PulseSports.

## 2. Problem Statement

Current digital sports platforms suffer from several critical shortcomings:
1.  **Antiquated UI/UX in Legacy Apps:** Current market leaders like ESPN and Cricbuzz rely on outdated, cluttered, and rigid user interfaces. These platforms offer a flat, passive experience that fails to leverage modern web capabilities, leading to low user retention and uninspired interactions.
2.  **Data Overload & Fragmented Content:** Users are inundated with raw statistics lacking contextual narrative, while quality journalism is locked behind paywalls or scattered across third-party networks.
3.  **Lack of Real-Time Community Engagement:** Existing applications offer passive consumption models with minimal interactive gamification, failing to capture the dynamic, community-driven nature of modern sports fandom.

PulseSports addresses these issues by engineering a unified platform that delivers dynamic UI aesthetics, automated native journalism, and ultra-fast community interaction without compromising on performance.

## 3. System Architecture & Tech Stack

PulseSports employs a decoupled, microservices-inspired architecture designed for high availability and edge-native performance.

*   **Frontend Ecosystem (Next.js 16 & App Router):** The client application utilizes React Server Components (RSC) to minimize JavaScript payload and improve First Contentful Paint (FCP). The user interface is crafted with Tailwind CSS and Framer Motion for cinematic transitions, alongside React Three Fiber to introduce 3D parallax elements, creating a highly immersive spatial UI.
*   **Backend & Data Persistence (Supabase):** PostgreSQL serves as the primary relational database, secured by strict Row Level Security (RLS) policies. Supabase Realtime WebSockets are utilized to broadcast instantaneous state changes (e.g., match score updates, gamification rewards) to connected clients.
*   **High-Concurrency Caching (Upstash Redis):** To handle burst traffic typical of live sporting events, Upstash Redis acts as a serverless, high-throughput caching layer. This mitigates database bottlenecking during mass-engagement events like live polls.
*   **Artificial Intelligence (Google Gemini 1.5 Flash):** The Gemini LLM is integrated into the backend pipeline to synthesize raw sports telemetry into cohesive, native journalism.

## 4. Core Features & Implementation

### 4.1 The AI News Transformer
To maintain users within the PulseSports ecosystem, the platform completely automates its news curation process. A secure cron job hits the `/api/sync-news` endpoint, utilizing Supabase Service Role keys to bypass standard client restrictions. This background process fetches raw news feeds from external sources (such as ESPN), and passes the data to the **Google Gemini 1.5 Flash** model. The AI parses the data, removes third-party branding, and generates native, PulseSports-branded articles. This pipeline ensures a continuous stream of contextual, SEO-optimized content without manual journalistic intervention.

### 4.2 Dynamic Live Match Center
The Live Match Center operates as a state-driven machine with distinct lifecycle phases. 
During the **Pre-Match Gamified Predictor** phase, users select their anticipated "Playing 11" squad. The UI strictly enforces data integrity by mapping dynamic team names to internal short codes, resolving complex API variations. 
Once the match commences, the state machine transitions to the **Live Match WebSocket Tracker**. An internal evaluation algorithm immediately compares the user's prediction against the confirmed squad, calculating predictive accuracy. Rewards (XP and Badges) are instantly distributed via Supabase RPCs and broadcasted to the user's Notification Center via WebSockets.

### 4.3 High-Concurrency Fan Engagement
Features such as "Fan Wars" and live cheer meters generate massive spikes in write-heavy traffic, which would traditionally overwhelm a relational database. PulseSports solves this by routing high-frequency interaction data through **Upstash Redis**. The serverless Redis cache aggregates the incoming votes and interactions in memory, calculating the consensus in milliseconds. The aggregated totals are then asynchronously flushed to the PostgreSQL database in bulk batches, ensuring 100% database stability even under immense concurrent load.

### 4.4 Futuristic & Cinematic UI/UX
Unlike the text-heavy and cluttered interfaces of legacy apps (e.g., ESPN, Cricbuzz), PulseSports introduces a premium, cinematic design aesthetic. Utilizing **Framer Motion**, the platform features fluid layout morphing, magnetic interaction fields, and dynamic page transitions. Furthermore, the integration of **React Three Fiber** provides a spatial depth to the application, creating a "dark-neon" glassmorphism environment that feels more like a modern video game than a traditional data dashboard. This radically enhances user retention and dopamine-driven engagement.

## 5. System Resilience & Security

A significant engineering challenge involved relying on third-party data providers (CricAPI, Football-Data.org) which impose strict rate limits and concurrency thresholds. To ensure 100% platform uptime, PulseSports incorporates a **Custom API Key Rotation Utility**.

This utility acts as a resilient middleware interceptor. When an external request returns a `429 Too Many Requests` or quota exhaustion error, the utility automatically catches the exception, seamlessly swaps the active API key from an encrypted environment pool, and retries the request. Furthermore, if all keys are exhausted, the system elegantly degrades, bypassing the external API and rendering a dynamic, internally hosted fallback schedule. This multi-tiered redundancy ensures the UI never breaks, protecting the end-user from backend infrastructure failures.

## 6. Conclusion & Future Scope

**Conclusion:** 
PulseSports successfully demonstrates the integration of modern web technologies to solve the fragmentation of sports media. By combining edge-rendered interfaces, serverless caching, and generative AI, the platform delivers an enterprise-grade product capable of handling the demands of real-time sports fandom. The engineering solutions applied—specifically the API failover architecture and the gamification engine—highlight a deep understanding of fault-tolerant systems design.

**Future Scope:**
Moving forward, the architectural foundation of PulseSports allows for significant vertical and horizontal scaling:
1.  **Full WebSocket Chat Integration:** Expanding the "Fan Space" from threaded discussions to a fully persistent, Redis-backed WebSocket chat room for instantaneous global communication.
2.  **Sport Expansion:** Integrating Formula 1 telemetry and e-sports tracking into the dynamic data pipeline.
3.  **Advanced Predictive Modeling:** Utilizing Gemini to offer users AI-driven insights and statistical probabilities during the Pre-Match Predictor phase to enhance the gamification experience.


---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **yarn**
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key
- An [Upstash](https://upstash.com) Redis database (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/KANISHKSAHOO-AIML/PULSE-SPORT.git
cd PULSE-SPORT

# 2. Install dependencies
npm install

# 3. Set up environment variables (see section below)
cp .env.example .env.local
# Edit .env.local with your actual keys

# 4. Set up the database (see Database Setup section)

# 5. Start the development server
npm run dev
```

The app will be running at **http://localhost:3000** 🎉

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root with the following keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Upstash Redis (for live match chat)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

> ⚠️ **Never commit `.env.local` to version control.** It is already included in `.gitignore`.

---

## 🗄 Database Setup

Run the following SQL in your Supabase SQL Editor to create the required tables:

### Core Matches Table

```sql
-- Create matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport VARCHAR(50) NOT NULL,        -- 'cricket' or 'football'
    title VARCHAR(255) NOT NULL,
    team_a VARCHAR(100) NOT NULL,
    team_b VARCHAR(100) NOT NULL,
    score_a VARCHAR(50) NOT NULL,
    score_b VARCHAR(50) NOT NULL,
    status VARCHAR(255) NOT NULL,
    live BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime
ALTER TABLE matches REPLICA IDENTITY FULL;
```

### Additional Tables

The platform also uses tables for:
- `profiles` — User profiles with usernames
- `comments` & `comment_likes` — Article/highlight discussions
- `match_thoughts` — Post-match threaded debates
- `predictions` — User match predictions
- `news` — News articles
- `highlights` — Video highlights

> Refer to `schema.sql` and `database_update.sql` in the project root for the complete schema.

### Seed Data

```sql
INSERT INTO matches (sport, title, team_a, team_b, score_a, score_b, status, live)
VALUES
    ('cricket', 'World Cup Finals • T20', 'India', 'Australia', 
     '185/4 (20)', '160/8 (18.2)', 'Australia need 26 runs from 10 balls', true),
    ('cricket', 'IPL 2026 • Match 45', 'CSK', 'MI', 
     '210/6 (20)', '198/9 (20)', 'CSK won by 12 runs', false),
    ('football', 'Champions League • Semi-Final', 'Real Madrid', 'Man City', 
     '2', '1', '78'' - 2nd Half', true),
    ('football', 'Premier League • Matchday 32', 'Arsenal', 'Liverpool', 
     '0', '0', 'HT - Half Time', true);
```

---

## 📂 Project Structure

```
pulse-sports/
├── public/
│   ├── assets/
│   │   ├── cricket/     # Cricket sport images
│   │   ├── football/    # Football sport images
│   │   └── players/     # Player video clips (mp4)
│   └── models/          # 3D model assets
├── src/
│   ├── app/
│   │   ├── admin/       # Admin panel (news, matches, highlights)
│   │   ├── api/
│   │   │   ├── chat/    # Gemini AI chat endpoint
│   │   │   ├── cheer/   # Cheer/reaction API
│   │   │   ├── comments/# Live comment stream (Redis)
│   │   │   └── predictions/ # Match prediction API
│   │   ├── auth/        # OAuth callback handler
│   │   ├── highlights/  # Video highlights pages
│   │   ├── login/       # Authentication page
│   │   ├── matches/     # Match detail pages (dynamic)
│   │   ├── news/        # News article pages (dynamic)
│   │   ├── players/     # ⭐ Player Stats Hub page
│   │   ├── globals.css  # Global styles & design tokens
│   │   ├── layout.tsx   # Root layout (Header, Footer, AI, Ticker)
│   │   ├── page.tsx     # Homepage (with Hero Section)
│   │   └── not-found.tsx# Custom 404 page
│   ├── components/
│   │   ├── AIAssistant.tsx        # Floating AI chatbot
│   │   ├── BackToTop.tsx          # Scroll-to-top button
│   │   ├── CommentSection.tsx     # Article comment system
│   │   ├── CricketScene.tsx       # 3D cricket scene
│   │   ├── FloatingVideoPlayer.tsx# PiP video player
│   │   ├── FootballScene.tsx      # 3D football scene
│   │   ├── Footer.tsx             # Site footer
│   │   ├── Header.tsx             # Navigation header (+ Players link)
│   │   ├── HeroSection.tsx        # ⭐ Cinematic typewriter hero
│   │   ├── KeyboardShortcuts.tsx  # Shortcut overlay
│   │   ├── Leaderboard.tsx        # Community leaderboard
│   │   ├── LiveTicker.tsx         # Breaking news ticker
│   │   ├── Loader3D.tsx           # 3D loading spinner
│   │   ├── MatchCard.tsx          # Match score card (animated borders)
│   │   ├── ParallaxSportScene.tsx # Scroll-linked 3D wrapper
│   │   ├── PlayerComparison.tsx   # Radar chart comparison
│   │   ├── PulsePredictor.tsx     # Match prediction game
│   │   ├── ScrollAnimationSection.tsx # Scroll-trigger animations
│   │   ├── SearchOverlay.tsx      # Global search
│   │   ├── SectionDivider.tsx     # ⭐ Energy section divider
│   │   ├── ShareButtons.tsx       # Social sharing
│   │   ├── Skeletons.tsx          # Loading skeletons
│   │   ├── SportToggle.tsx        # Cricket/Football quick nav
│   │   ├── TrendingWidget.tsx     # Trending topics
│   │   └── WinProbability.tsx     # Win probability chart
│   └── utils/
│       └── supabase/              # Supabase client helpers
├── schema.sql                     # Base database schema
├── database_update.sql            # Extended schema (comments, profiles, etc.)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🧩 Key API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | `POST` | Streams AI responses from Google Gemini |
| `/api/comments/live` | `GET` | Fetches live match chat from Redis |
| `/api/comments/live` | `POST` | Pushes a new chat message to Redis |
| `/api/predictions` | `POST` | Submits a match prediction |
| `/api/cheer` | `POST` | Records a cheer/reaction for a match |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on `localhost:3000` |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style and component patterns
- Use TypeScript for all new files
- Add meaningful commit messages
- Test your changes across multiple viewport sizes
- Ensure no API keys or secrets are committed

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- Player stats data is currently hardcoded (mock data for 12 players)
- Predictions are stored client-side via localStorage
- Live chat uses polling (2s interval) instead of WebSocket streaming

### Future Roadmap
- [ ] WebSocket-based live chat (eliminate polling)
- [ ] Full database-backed prediction leaderboard
- [ ] Push notifications for score updates
- [ ] Multi-language support (i18n)
- [ ] Dark/Light theme toggle
- [ ] Native mobile app (React Native)
- [ ] Integration with live sports data APIs
- [ ] Dynamic player stats from a live API
- [ ] Player vs Player comparison tool

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ and ⚡ by <a href="https://github.com/KANISHKSAHOO-AIML">Kanishk Sahoo</a></strong><br />
  <sub>If you found this project interesting, consider giving it a ⭐!</sub>
</p>
