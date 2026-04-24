-- ══════════════════════════════════════════════════════════════
-- Migration: Add video_url to highlights + news source_url
-- Run this in your Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Add video_url to highlights (for YouTube embeds)
ALTER TABLE highlights
  ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';

-- 2. Add source_url to news (for ESPN article links)
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS source_url TEXT DEFAULT '';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('highlights', 'news')
  AND column_name IN ('video_url', 'source_url');
