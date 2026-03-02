-- ═══════════════════════════════════════════════════════════════
-- Migration 001: Add temperature and rainfall columns
-- Run this in Supabase SQL Editor if you have an existing database
-- ═══════════════════════════════════════════════════════════════

-- Add temperature column
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS temperature TEXT DEFAULT '';

-- Add rainfall column
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS rainfall TEXT DEFAULT '';

-- Note: The workforce JSONB structure changed from {day: 0, night: 0} to {hours: 0}
-- This is handled automatically since JSONB is flexible.
-- Old reports will still work, they'll just show "—" for hours until edited.
