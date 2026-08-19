-- Imported hackathon events (read-only archive)
CREATE TABLE imported_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- Owner on your site
  source_event_id TEXT,           -- Original event UUID from Hack-Flow
  event_name TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  problem_statement TEXT,
  judging_rubric JSONB,
  imported_at TIMESTAMPTZ DEFAULT now()
);

-- Imported team data
CREATE TABLE imported_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_event_id UUID REFERENCES imported_events(id) ON DELETE CASCADE,
  source_team_id TEXT,
  team_name TEXT NOT NULL,
  readable_id TEXT,
  repo_url TEXT,
  deployment_url TEXT,
  ai_progress_score INT,
  ai_status_summary TEXT,
  created_at TIMESTAMPTZ
);

-- Team members
CREATE TABLE imported_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_team_id UUID REFERENCES imported_teams(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT,               -- "LEAD" | "MEMBER"
  registration_no TEXT,
  email TEXT,
  created_at TIMESTAMPTZ
);

-- Kanban tasks
CREATE TABLE imported_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_team_id UUID REFERENCES imported_teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,             -- "Todo" | "Progress" | "Review" | "Verified" | "Bugs"
  commit_sha TEXT,
  created_at TIMESTAMPTZ
);

-- Git commits
CREATE TABLE imported_commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_team_id UUID REFERENCES imported_teams(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  message TEXT,
  author_handle TEXT,
  commit_url TEXT,
  created_at TIMESTAMPTZ
);

-- AI Project DNA milestones
CREATE TABLE imported_dna_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_team_id UUID REFERENCES imported_teams(id) ON DELETE CASCADE,
  milestone_title TEXT NOT NULL,
  milestone_description TEXT,
  verification_criteria TEXT,
  weight INT,
  status TEXT,             -- "pending" | "in_progress" | "complete"
  created_at TIMESTAMPTZ
);

-- AI Judging scores
CREATE TABLE imported_judging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_team_id UUID REFERENCES imported_teams(id) ON DELETE CASCADE,
  alignment_score INT,
  execution_score INT,
  innovation_score INT,
  technical_score INT,
  total_score INT,
  ai_justification TEXT,
  created_at TIMESTAMPTZ
);

-- Activity timeline / telemetry
CREATE TABLE imported_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_team_id UUID REFERENCES imported_teams(id) ON DELETE CASCADE,
  action_type TEXT,
  table_name TEXT,
  details TEXT,
  created_at TIMESTAMPTZ
);

-- AI Chat history
CREATE TABLE imported_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_team_id UUID REFERENCES imported_teams(id) ON DELETE CASCADE,
  role TEXT,               -- "user" | "model"
  parts TEXT,              -- Message content
  user_role TEXT,          -- "LEAD" | "MEMBER"
  created_at TIMESTAMPTZ
);

-- Imported file references
CREATE TABLE imported_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_team_id UUID REFERENCES imported_teams(id) ON DELETE CASCADE,
  original_path TEXT,
  storage_path TEXT,       -- Path in YOUR Supabase storage bucket
  filename TEXT,
  sha256 TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE imported_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_dna_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_judging ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own imported data
CREATE POLICY "Users see own events" ON imported_events FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own teams" ON imported_teams FOR ALL USING (
  imported_event_id IN (SELECT id FROM imported_events WHERE user_id = auth.uid())
);

CREATE POLICY "Users see own members" ON imported_members FOR ALL USING (
  imported_team_id IN (SELECT id FROM imported_teams WHERE imported_event_id IN (
    SELECT id FROM imported_events WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users see own tasks" ON imported_tasks FOR ALL USING (
  imported_team_id IN (SELECT id FROM imported_teams WHERE imported_event_id IN (
    SELECT id FROM imported_events WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users see own commits" ON imported_commits FOR ALL USING (
  imported_team_id IN (SELECT id FROM imported_teams WHERE imported_event_id IN (
    SELECT id FROM imported_events WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users see own dna_milestones" ON imported_dna_milestones FOR ALL USING (
  imported_team_id IN (SELECT id FROM imported_teams WHERE imported_event_id IN (
    SELECT id FROM imported_events WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users see own judging" ON imported_judging FOR ALL USING (
  imported_team_id IN (SELECT id FROM imported_teams WHERE imported_event_id IN (
    SELECT id FROM imported_events WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users see own telemetry" ON imported_telemetry FOR ALL USING (
  imported_team_id IN (SELECT id FROM imported_teams WHERE imported_event_id IN (
    SELECT id FROM imported_events WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users see own chat_history" ON imported_chat_history FOR ALL USING (
  imported_team_id IN (SELECT id FROM imported_teams WHERE imported_event_id IN (
    SELECT id FROM imported_events WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users see own files" ON imported_files FOR ALL USING (
  imported_team_id IN (SELECT id FROM imported_teams WHERE imported_event_id IN (
    SELECT id FROM imported_events WHERE user_id = auth.uid()
  ))
);
