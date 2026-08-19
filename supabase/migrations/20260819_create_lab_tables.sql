-- ============================================================
-- LAB INFRASTRUCTURE TABLES
-- ============================================================

-- 1. Lab Tasks (Kanban board items)
CREATE TABLE lab_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Todo'
    CHECK (status IN ('Todo', 'Progress', 'Review', 'Verified')),
  commit_sha TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Lab Commits (Git commit records from webhooks)
CREATE TABLE lab_commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  message TEXT,
  author_handle TEXT,
  commit_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Lab Telemetry Logs (activity feed / audit pulse)
CREATE TABLE lab_telemetry_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  table_name TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Lab Config (per-project setup: repo URL, deployment URL, webhook status)
CREATE TABLE lab_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  repo_url TEXT,
  deployment_url TEXT,
  db_health_endpoint TEXT,
  webhook_secret TEXT,
  webhook_verified BOOLEAN DEFAULT false,
  showcase_audit BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES (for fast queries by project_id)
-- ============================================================
CREATE INDEX idx_lab_tasks_project ON lab_tasks(project_id);
CREATE INDEX idx_lab_commits_project ON lab_commits(project_id);
CREATE INDEX idx_lab_telemetry_project ON lab_telemetry_logs(project_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE lab_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to access lab data
CREATE POLICY "Authenticated users can manage lab_tasks"
  ON lab_tasks FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage lab_commits"
  ON lab_commits FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage lab_telemetry_logs"
  ON lab_telemetry_logs FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage lab_config"
  ON lab_config FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================
-- ENABLE REALTIME (for live Kanban + Telemetry updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE lab_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_telemetry_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_commits;
