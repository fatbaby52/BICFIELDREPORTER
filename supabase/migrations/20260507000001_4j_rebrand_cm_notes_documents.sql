-- ═══════════════════════════════════════════════════════════════
-- 4J Field Reporter — Additive migration for project_type, CM weekly fields,
-- quick_notes, and project_documents.
--
-- Strictly ADDITIVE: every statement uses IF NOT EXISTS guards so re-running
-- is safe and no existing data, columns, tables, indexes, or policies are
-- dropped or altered destructively.
-- ═══════════════════════════════════════════════════════════════

-- Checkpoint 1 — Project type ('GC' | 'CM') on projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'GC';

-- Checkpoint 2 — CM-specific weekly fields (also on custom_reports for parity)
ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS meeting_outcomes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS outstanding_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE custom_reports  ADD COLUMN IF NOT EXISTS meeting_outcomes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE custom_reports  ADD COLUMN IF NOT EXISTS outstanding_items JSONB DEFAULT '[]'::jsonb;

-- Checkpoint 3 — Quick Notes table
CREATE TABLE IF NOT EXISTS quick_notes (
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
CREATE INDEX IF NOT EXISTS idx_quick_notes_project ON quick_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_created ON quick_notes(created_at DESC);
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quick_notes' AND policyname = 'public_quick_notes'
  ) THEN
    CREATE POLICY "public_quick_notes" ON quick_notes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Checkpoint 4 — Project Documents table (PDFs, change orders, RFIs, with extracted text for AI)
CREATE TABLE IF NOT EXISTS project_documents (
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
  extracted_text TEXT DEFAULT '',
  uploader TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_created ON project_documents(created_at DESC);
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'project_documents' AND policyname = 'public_project_documents'
  ) THEN
    CREATE POLICY "public_project_documents" ON project_documents FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
