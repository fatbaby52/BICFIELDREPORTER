-- ═══════════════════════════════════════════════════════════════
-- 4J Field Reporter — Supabase Schema
-- Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  job_number TEXT,
  job_name TEXT NOT NULL,
  client TEXT DEFAULT '',
  prepared_by TEXT DEFAULT '',
  project_type TEXT DEFAULT 'GC',  -- 'GC' (General Contractor) or 'CM' (Construction Management)
  logo_url TEXT DEFAULT NULL,
  milestones JSONB DEFAULT '[]'::jsonb,
  equipment_owned JSONB DEFAULT '[]'::jsonb,
  equipment_rented JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: Add logo_url to existing projects table
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;

-- Migration: Add project_type to existing projects table
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'GC';

-- Migration: Add CM-specific columns to weekly_reports and custom_reports
-- ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS meeting_outcomes JSONB DEFAULT '[]'::jsonb;
-- ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS outstanding_items JSONB DEFAULT '[]'::jsonb;
-- ALTER TABLE custom_reports  ADD COLUMN IF NOT EXISTS meeting_outcomes JSONB DEFAULT '[]'::jsonb;
-- ALTER TABLE custom_reports  ADD COLUMN IF NOT EXISTS outstanding_items JSONB DEFAULT '[]'::jsonb;

-- Migration: Add quick_notes table
-- CREATE TABLE IF NOT EXISTS quick_notes (
--   id TEXT PRIMARY KEY,
--   project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
--   text TEXT DEFAULT '',
--   tags JSONB DEFAULT '[]'::jsonb,
--   photo_url TEXT DEFAULT NULL,
--   photo_path TEXT DEFAULT NULL,
--   author TEXT DEFAULT '',
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- CREATE INDEX IF NOT EXISTS idx_quick_notes_project ON quick_notes(project_id);
-- CREATE INDEX IF NOT EXISTS idx_quick_notes_created ON quick_notes(created_at DESC);
-- ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public_quick_notes" ON quick_notes FOR ALL USING (true) WITH CHECK (true);

-- Migration: Add project_documents table
-- CREATE TABLE IF NOT EXISTS project_documents (
--   id TEXT PRIMARY KEY,
--   project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
--   title TEXT DEFAULT '',
--   file_url TEXT DEFAULT NULL,
--   file_path TEXT DEFAULT NULL,
--   file_name TEXT DEFAULT '',
--   file_type TEXT DEFAULT '',
--   file_size INT DEFAULT 0,
--   tags JSONB DEFAULT '[]'::jsonb,
--   notes TEXT DEFAULT '',
--   extracted_text TEXT DEFAULT '',
--   uploader TEXT DEFAULT '',
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
-- CREATE INDEX IF NOT EXISTS idx_project_documents_created ON project_documents(created_at DESC);
-- ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public_project_documents" ON project_documents FOR ALL USING (true) WITH CHECK (true);

-- Daily reports table
CREATE TABLE daily_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day TEXT DEFAULT '',
  weather TEXT DEFAULT '',
  temperature TEXT DEFAULT '',
  rainfall TEXT DEFAULT '',
  incidents TEXT DEFAULT 'N/A',
  shift JSONB DEFAULT '{"type":"Day","hours":"8hr"}'::jsonb,
  general_notes TEXT DEFAULT '',
  workforce JSONB DEFAULT '{}'::jsonb,
  equipment_present JSONB DEFAULT '[]'::jsonb,
  equipment_down JSONB DEFAULT '[]'::jsonb,
  third_party_utilities TEXT DEFAULT '',
  material_deliveries TEXT DEFAULT '',
  delays_problems TEXT DEFAULT '',
  extra_work TEXT DEFAULT '',
  milestone_hit JSONB,
  task_hours JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  prepared_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly reports table
CREATE TABLE weekly_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  week_ending DATE NOT NULL,
  ongoing_completed JSONB DEFAULT '[]'::jsonb,
  look_ahead JSONB DEFAULT '[]'::jsonb,
  outstanding_rfis TEXT DEFAULT '',
  hot_submittals TEXT DEFAULT '',
  safety TEXT DEFAULT 'No incidents',
  important_dates TEXT DEFAULT '',
  owner_delivery_dates TEXT DEFAULT '',
  outstanding_owner_items TEXT DEFAULT '',
  upcoming_inspections TEXT DEFAULT '',
  hindrances TEXT DEFAULT '',
  additional_delays TEXT DEFAULT '',
  next_oac_meeting TEXT DEFAULT '',
  meeting_outcomes JSONB DEFAULT '[]'::jsonb,    -- CM-only: list of meeting outcomes
  outstanding_items JSONB DEFAULT '[]'::jsonb,   -- CM-only: list of outstanding items
  selected_photos JSONB DEFAULT '[]'::jsonb,
  schedule_file_url TEXT DEFAULT NULL,
  schedule_file_type TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom reports table (user-defined date ranges with custom names)
CREATE TABLE custom_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  ongoing_completed JSONB DEFAULT '[]'::jsonb,
  look_ahead JSONB DEFAULT '[]'::jsonb,
  outstanding_rfis TEXT DEFAULT '',
  hot_submittals TEXT DEFAULT '',
  safety TEXT DEFAULT 'No incidents',
  important_dates TEXT DEFAULT '',
  owner_delivery_dates TEXT DEFAULT '',
  outstanding_owner_items TEXT DEFAULT '',
  upcoming_inspections TEXT DEFAULT '',
  hindrances TEXT DEFAULT '',
  additional_delays TEXT DEFAULT '',
  next_oac_meeting TEXT DEFAULT '',
  meeting_outcomes JSONB DEFAULT '[]'::jsonb,    -- CM-only: list of meeting outcomes
  outstanding_items JSONB DEFAULT '[]'::jsonb,   -- CM-only: list of outstanding items
  selected_photos JSONB DEFAULT '[]'::jsonb,
  schedule_file_url TEXT DEFAULT NULL,
  schedule_file_type TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick Notes table — freeform notes captured on the fly, separate from dailies
CREATE TABLE quick_notes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  photo_url TEXT DEFAULT NULL,
  photo_path TEXT DEFAULT NULL,
  author TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Documents table — change orders, RFIs, plans, etc. with extracted text for AI
CREATE TABLE project_documents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  file_url TEXT DEFAULT NULL,
  file_path TEXT DEFAULT NULL,
  file_name TEXT DEFAULT '',
  file_type TEXT DEFAULT '',
  file_size INT DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  extracted_text TEXT DEFAULT '',     -- PDF/text contents for AI brain
  uploader TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_project ON daily_reports(project_id);
CREATE INDEX idx_daily_date ON daily_reports(date DESC);
CREATE INDEX idx_weekly_project ON weekly_reports(project_id);
CREATE INDEX idx_weekly_week ON weekly_reports(week_ending DESC);
CREATE INDEX idx_custom_project ON custom_reports(project_id);
CREATE INDEX idx_custom_dates ON custom_reports(start_date DESC, end_date DESC);
CREATE INDEX idx_quick_notes_project ON quick_notes(project_id);
CREATE INDEX idx_quick_notes_created ON quick_notes(created_at DESC);
CREATE INDEX idx_project_documents_project ON project_documents(project_id);
CREATE INDEX idx_project_documents_created ON project_documents(created_at DESC);

-- Row Level Security — public access (no auth, internal tool)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_daily" ON daily_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_weekly" ON weekly_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_custom" ON custom_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_quick_notes" ON quick_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_project_documents" ON project_documents FOR ALL USING (true) WITH CHECK (true);

-- Photo storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);

CREATE POLICY "public_read_photos" ON storage.objects FOR SELECT USING (bucket_id = 'project-photos');
CREATE POLICY "public_upload_photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-photos');
CREATE POLICY "public_delete_photos" ON storage.objects FOR DELETE USING (bucket_id = 'project-photos');

-- ═══════════════════════════════════════════════════════════════
-- Migration: Add custom_reports table (for existing databases)
-- Run this if you already have the database set up:
-- ═══════════════════════════════════════════════════════════════
-- CREATE TABLE IF NOT EXISTS custom_reports (
--   id TEXT PRIMARY KEY,
--   project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
--   report_name TEXT NOT NULL,
--   start_date DATE NOT NULL,
--   end_date DATE NOT NULL,
--   ongoing_completed JSONB DEFAULT '[]'::jsonb,
--   look_ahead JSONB DEFAULT '[]'::jsonb,
--   outstanding_rfis TEXT DEFAULT '',
--   hot_submittals TEXT DEFAULT '',
--   safety TEXT DEFAULT 'No incidents',
--   important_dates TEXT DEFAULT '',
--   owner_delivery_dates TEXT DEFAULT '',
--   outstanding_owner_items TEXT DEFAULT '',
--   upcoming_inspections TEXT DEFAULT '',
--   hindrances TEXT DEFAULT '',
--   additional_delays TEXT DEFAULT '',
--   next_oac_meeting TEXT DEFAULT '',
--   selected_photos JSONB DEFAULT '[]'::jsonb,
--   schedule_file_url TEXT DEFAULT NULL,
--   schedule_file_type TEXT DEFAULT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- CREATE INDEX IF NOT EXISTS idx_custom_project ON custom_reports(project_id);
-- CREATE INDEX IF NOT EXISTS idx_custom_dates ON custom_reports(start_date DESC, end_date DESC);
-- ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public_custom" ON custom_reports FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- Migration: Add schedule file columns to existing tables
-- Run this if you already have the tables set up:
-- ═══════════════════════════════════════════════════════════════
-- ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS schedule_file_url TEXT DEFAULT NULL;
-- ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS schedule_file_type TEXT DEFAULT NULL;
-- ALTER TABLE custom_reports ADD COLUMN IF NOT EXISTS schedule_file_url TEXT DEFAULT NULL;
-- ALTER TABLE custom_reports ADD COLUMN IF NOT EXISTS schedule_file_type TEXT DEFAULT NULL;
