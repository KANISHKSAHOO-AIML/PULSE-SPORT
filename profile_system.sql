-- ═══════════════════════════════════════════════════════════════════
-- PULSESPORTS — Profile, Predictions, Notifications & Badges System
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1. Enhance profiles table (add bio, avatar, favorite team, points)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS favorite_team TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS favorite_sport VARCHAR(20) DEFAULT 'cricket',
  ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prediction_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Predictions table (replace localStorage approach)
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_id TEXT NOT NULL,
  predicted_winner TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT NULL,  -- NULL = pending, true/false = resolved
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, match_id)
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all predictions" ON predictions;
CREATE POLICY "Users can view all predictions" ON predictions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;
CREATE POLICY "Users can insert own predictions" ON predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own predictions" ON predictions;
CREATE POLICY "Users can update own predictions" ON predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT DEFAULT '🔔',
  href TEXT DEFAULT '/',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 4. User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view badges" ON user_badges;
CREATE POLICY "Anyone can view badges" ON user_badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert badges" ON user_badges;
CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. User follows (teams & players)
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  follow_type VARCHAR(20) NOT NULL,
  follow_target TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, follow_type, follow_target)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own follows" ON user_follows;
CREATE POLICY "Users can view own follows" ON user_follows
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own follows" ON user_follows;
CREATE POLICY "Users can manage own follows" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own follows" ON user_follows;
CREATE POLICY "Users can delete own follows" ON user_follows
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Function to calculate user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_predictions', (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id),
    'correct_predictions', (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id AND is_correct = true),
    'pending_predictions', (SELECT COUNT(*) FROM predictions WHERE user_id = p_user_id AND is_correct IS NULL),
    'total_comments', (SELECT COUNT(*) FROM comments WHERE user_id = p_user_id),
    'total_match_thoughts', (SELECT COUNT(*) FROM match_thoughts WHERE user_id = p_user_id),
    'total_points', (SELECT COALESCE(total_points, 0) FROM profiles WHERE id = p_user_id),
    'prediction_streak', (SELECT COALESCE(prediction_streak, 0) FROM profiles WHERE id = p_user_id),
    'longest_streak', (SELECT COALESCE(longest_streak, 0) FROM profiles WHERE id = p_user_id),
    'badges_count', (SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id),
    'following_count', (SELECT COUNT(*) FROM user_follows WHERE user_id = p_user_id)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Index for performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);
