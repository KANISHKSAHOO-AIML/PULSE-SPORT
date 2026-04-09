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

## 🌟 Features

### 🏏⚽ Real-Time Live Scores
- **Supabase Realtime** subscriptions for instant score updates — no manual refresh needed
- Dedicated sections for **Cricket** and **Football** with sport-specific UIs
- Live match status indicators with pulsing animations

### 🎮 Immersive 3D Parallax Scenes
- **React Three Fiber** + **Three.js** powered scroll-reactive 3D backgrounds
- Cricket batsman & football striker animations tied to scroll progress
- Glassmorphism UI layered on top of dynamic 3D canvases

### 🤖 Pulse AI — Gemini-Powered Assistant
- Floating chatbot powered by **Google Gemini** via the AI SDK
- Ask about live matches, player stats, platform navigation, or sports history
- Streaming responses with real-time token rendering
- Fullscreen & minimized modes

### 🏆 Pulse Predictor — Gamified Match Predictions
- Pick a winner before or during a match
- Community vote distribution visualized with animated progress bars
- Confetti celebration on prediction submission
- Persistent predictions via localStorage + optional Supabase sync

### 📊 Live Analytics Dashboard
- **Win Probability Graph** — Dynamic SVG chart showing probability swings throughout a match
- **Player Head-to-Head Radar Chart** — Compare star players across 5 key stats
- Animated data visualization with Framer Motion

### 💬 Dual-Mode Fan Engagement
| Mode | When | Backend | Features |
|---|---|---|---|
| **Live Fan Space** | Match is live | Upstash Redis | Ultra-fast ephemeral chat, 2s polling, team allegiance badges |
| **Match Thoughts** | Post-match | Supabase Postgres | Persistent threaded debates, reply chains, real-time inserts |

### 📰 News & Highlights
- Dedicated news articles with full-page layouts
- Video highlights with **Picture-in-Picture** floating player
- **Comment sections** with likes, "Top Fan" badges, and real-time updates
- Social share buttons (Twitter, WhatsApp, Copy Link)

### 🔐 Authentication
- **Supabase Auth** with email/password and OAuth support
- Protected routes for commenting, predictions, and fan spaces
- User profiles with usernames

### 🎨 Premium UI/UX
- Dark-mode-first design with glassmorphism cards
- **Framer Motion** animations — page transitions, scroll reveals, micro-interactions
- Custom loading skeletons, 3D sport-themed loaders
- Keyboard shortcuts panel, back-to-top button
- Live scrolling ticker bar with breaking news
- Fully responsive across all devices

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR, routing, API routes |
| **Language** | TypeScript 5 | Type safety |
| **UI Library** | React 19 | Component architecture |
| **3D Engine** | Three.js + React Three Fiber + Drei | Immersive 3D scenes |
| **Animation** | Framer Motion | Page transitions & micro-animations |
| **Styling** | TailwindCSS 4 | Utility-first CSS |
| **Database** | Supabase (PostgreSQL) | Matches, news, comments, profiles |
| **Realtime** | Supabase Realtime | Live score push updates |
| **Cache/Chat** | Upstash Redis | Live match fan chat (ephemeral) |
| **AI** | Google Gemini (via AI SDK) | Conversational sports assistant |
| **Icons** | Lucide React | Consistent iconography |
| **Auth** | Supabase Auth | User authentication |
| **Fonts** | Geist Sans & Geist Mono | Modern typography |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐ │
│  │ 3D Scene │  │ Match UI │  │ AI Chat   │  │ Predictor  │ │
│  │ (R3F)    │  │ (Cards)  │  │ (Gemini)  │  │ (Gamified) │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └─────┬──────┘ │
│       │              │              │              │         │
│  ┌────▼──────────────▼──────────────▼──────────────▼──────┐  │
│  │              Next.js App Router (API Routes)           │  │
│  └────┬──────────────┬──────────────┬──────────────┬──────┘  │
└───────┼──────────────┼──────────────┼──────────────┼─────────┘
        │              │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
   │Supabase │   │ Supabase  │  │ Google  │  │  Upstash  │
   │Postgres │   │ Realtime  │  │ Gemini  │  │  Redis    │
   │(Data)   │   │ (WS Push) │  │ (AI)    │  │ (Chat)    │
   └─────────┘   └───────────┘  └─────────┘  └───────────┘
```

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
│   ├── assets/          # Sport images (cricket, football)
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
│   │   ├── globals.css  # Global styles & design tokens
│   │   ├── layout.tsx   # Root layout (Header, Footer, AI, Ticker)
│   │   ├── page.tsx     # Homepage
│   │   └── not-found.tsx# Custom 404 page
│   ├── components/
│   │   ├── AIAssistant.tsx        # Floating AI chatbot
│   │   ├── BackToTop.tsx          # Scroll-to-top button
│   │   ├── CommentSection.tsx     # Article comment system
│   │   ├── CricketScene.tsx       # 3D cricket scene
│   │   ├── FloatingVideoPlayer.tsx# PiP video player
│   │   ├── FootballScene.tsx      # 3D football scene
│   │   ├── Footer.tsx             # Site footer
│   │   ├── Header.tsx             # Navigation header
│   │   ├── KeyboardShortcuts.tsx  # Shortcut overlay
│   │   ├── Leaderboard.tsx        # Community leaderboard
│   │   ├── LiveTicker.tsx         # Breaking news ticker
│   │   ├── Loader3D.tsx           # 3D loading spinner
│   │   ├── MatchCard.tsx          # Match score card
│   │   ├── ParallaxSportScene.tsx # Scroll-linked 3D wrapper
│   │   ├── PlayerComparison.tsx   # Radar chart comparison
│   │   ├── PulsePredictor.tsx     # Match prediction game
│   │   ├── ScrollAnimationSection.tsx # Scroll-trigger animations
│   │   ├── SearchOverlay.tsx      # Global search
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
- Player comparison data is currently hardcoded (mock data)
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

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ and ⚡ by <a href="https://github.com/KANISHKSAHOO-AIML">Kanishk Sahoo</a></strong><br />
  <sub>If you found this project interesting, consider giving it a ⭐!</sub>
</p>
