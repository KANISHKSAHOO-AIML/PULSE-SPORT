-- ═══════════════════════════════════════════════════════════════════
-- FAN LEVEL XP SYSTEM — PulseSports Elite Audit
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Add XP and fan level columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fan_level INTEGER DEFAULT 1;

-- XP Action Log — tracks every XP-earning action
CREATE TABLE IF NOT EXISTS xp_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,           -- 'prediction', 'cheer', 'comment', 'debate', 'correct_prediction', 'login_streak'
  xp_earned INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',    -- Additional context (match_id, etc.)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_log_user ON xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_action ON xp_log(action);

-- ═══════════════════════════════════════════════════════════════════
-- FAN LEVEL CALCULATION FUNCTION
-- Levels: 1=Rookie(0), 2=Rising Star(100), 3=Match Regular(300),
--         4=Super Fan(700), 5=Legend(1500), 6=Hall of Famer(3000)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_fan_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF p_xp >= 3000 THEN RETURN 6;
  ELSIF p_xp >= 1500 THEN RETURN 5;
  ELSIF p_xp >= 700 THEN RETURN 4;
  ELSIF p_xp >= 300 THEN RETURN 3;
  ELSIF p_xp >= 100 THEN RETURN 2;
  ELSE RETURN 1;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ═══════════════════════════════════════════════════════════════════
-- AWARD XP FUNCTION
-- Call: SELECT award_xp('user-uuid', 'prediction', 10);
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_action TEXT,
  p_xp INTEGER,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, level_up BOOLEAN) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current level
  SELECT fan_level INTO v_old_level FROM profiles WHERE id = p_user_id;
  IF v_old_level IS NULL THEN v_old_level := 1; END IF;

  -- Log the XP action
  INSERT INTO xp_log (user_id, action, xp_earned, metadata)
  VALUES (p_user_id, p_action, p_xp, p_metadata);

  -- Update profile XP and recalculate level
  UPDATE profiles
  SET xp = COALESCE(xp, 0) + p_xp,
      fan_level = calculate_fan_level(COALESCE(xp, 0) + p_xp)
  WHERE id = p_user_id
  RETURNING xp, fan_level INTO v_new_xp, v_new_level;

  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════
-- XP REWARD REFERENCE TABLE (for documentation / frontend use)
-- ═══════════════════════════════════════════════════════════════════
-- | Action              | XP  | Notes                        |
-- |---------------------|-----|------------------------------|
-- | prediction          | 10  | Once per match               |
-- | correct_prediction  | 50  | Awarded when match completes |
-- | comment             | 5   | Max 50 XP per match          |
-- | debate              | 15  | Match Thought post           |
-- | debate_reply        | 8   | Received a reply             |
-- | cheer               | 1   | Max 20 XP per match          |
-- | login_streak_7      | 100 | 7-day streak                 |

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own XP log
CREATE POLICY "Users can read own xp_log" ON xp_log
  FOR SELECT USING (auth.uid() = user_id);

-- Only server (service role) can insert XP — prevents cheating
-- If you want client-side inserts during development, uncomment below:
-- CREATE POLICY "Users can insert own xp_log" ON xp_log
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE xp_log IS 'Tracks all XP-earning actions for the Fan Level gamification system';
COMMENT ON COLUMN profiles.xp IS 'Total accumulated XP points for fan level progression';
COMMENT ON COLUMN profiles.fan_level IS 'Current fan level (1-6) based on XP thresholds';
