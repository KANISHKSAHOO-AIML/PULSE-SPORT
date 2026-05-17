-- ═══════════════════════════════════════════════════════════════
-- CUSTOM MATCHES TABLE — For user-hosted local matches
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS custom_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_name TEXT NOT NULL,
  sport TEXT DEFAULT 'cricket',
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  players_a JSONB DEFAULT '[]'::jsonb,
  players_b JSONB DEFAULT '[]'::jsonb,
  score_a TEXT DEFAULT '—',
  score_b TEXT DEFAULT '—',
  overs_a TEXT DEFAULT '',
  overs_b TEXT DEFAULT '',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  toss_winner TEXT DEFAULT '',
  toss_decision TEXT DEFAULT '',
  result TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  votes_a INT DEFAULT 0,
  votes_b INT DEFAULT 0,
  match_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE custom_matches ENABLE ROW LEVEL SECURITY;

-- Anyone can VIEW custom matches
DROP POLICY IF EXISTS "Anyone can view custom matches" ON custom_matches;
CREATE POLICY "Anyone can view custom matches"
  ON custom_matches FOR SELECT USING (true);

-- Only the creator can INSERT
DROP POLICY IF EXISTS "Users can create custom matches" ON custom_matches;
CREATE POLICY "Users can create custom matches"
  ON custom_matches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only the creator can UPDATE
DROP POLICY IF EXISTS "Users can update own custom matches" ON custom_matches;
CREATE POLICY "Users can update own custom matches"
  ON custom_matches FOR UPDATE USING (auth.uid() = user_id);

-- Only the creator can DELETE
DROP POLICY IF EXISTS "Users can delete own custom matches" ON custom_matches;
CREATE POLICY "Users can delete own custom matches"
  ON custom_matches FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_matches_user ON custom_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_matches_status ON custom_matches(status);

-- Fan War RPC Function
CREATE OR REPLACE FUNCTION increment_custom_vote(match_id UUID, team TEXT)
RETURNS void AS $$
BEGIN
  IF team = 'a' THEN
    UPDATE custom_matches SET votes_a = COALESCE(votes_a, 0) + 1 WHERE id = match_id;
  ELSIF team = 'b' THEN
    UPDATE custom_matches SET votes_b = COALESCE(votes_b, 0) + 1 WHERE id = match_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- If you ran this file earlier, the table already exists.
-- Run these lines to safely add the new columns:
ALTER TABLE custom_matches ADD COLUMN IF NOT EXISTS votes_a INT DEFAULT 0;
ALTER TABLE custom_matches ADD COLUMN IF NOT EXISTS votes_b INT DEFAULT 0;

