-- ══════════════════════════════════════════════════════════════
-- match_predictions table — Stores user Playing 11 predictions
-- Run this in Supabase SQL Editor: Dashboard → SQL → New Query
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_predictions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id text NOT NULL,
  team text NOT NULL,
  predicted_players jsonb NOT NULL DEFAULT '[]',
  score integer DEFAULT 0,
  badge text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, match_id, team)
);

-- Row Level Security
ALTER TABLE match_predictions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own predictions
CREATE POLICY "Users can insert own predictions" ON match_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own predictions
CREATE POLICY "Users can update own predictions" ON match_predictions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own predictions
CREATE POLICY "Users can read own predictions" ON match_predictions
  FOR SELECT USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_match_predictions_user_match 
  ON match_predictions(user_id, match_id);
