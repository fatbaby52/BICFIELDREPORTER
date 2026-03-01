-- ═══════════════════════════════════════════════════════════════
-- BIC Field Reporter — Supabase Schema
-- Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  job_number TEXT,
  job_name TEXT NOT NULL,
  client TEXT DEFAULT '',
  prepared_by TEXT DEFAULT '',
  milestones JSONB DEFAULT '[]'::jsonb,
  equipment_owned JSONB DEFAULT '[]'::jsonb,
  equipment_rented JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily reports table
CREATE TABLE daily_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day TEXT DEFAULT '',
  weather TEXT DEFAULT '',
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
  selected_photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_project ON daily_reports(project_id);
CREATE INDEX idx_daily_date ON daily_reports(date DESC);
CREATE INDEX idx_weekly_project ON weekly_reports(project_id);
CREATE INDEX idx_weekly_week ON weekly_reports(week_ending DESC);

-- Row Level Security — public access (no auth, internal tool)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_daily" ON daily_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_weekly" ON weekly_reports FOR ALL USING (true) WITH CHECK (true);

-- Photo storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);

CREATE POLICY "public_read_photos" ON storage.objects FOR SELECT USING (bucket_id = 'project-photos');
CREATE POLICY "public_upload_photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-photos');
CREATE POLICY "public_delete_photos" ON storage.objects FOR DELETE USING (bucket_id = 'project-photos');
