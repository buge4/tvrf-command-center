-- TVRF Command Center Database Schema
-- Run this in Supabase SQL Editor

-- Conversations table for storing chat history
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table for tracking AI projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project sessions table for storing project execution data
CREATE TABLE IF NOT EXISTS project_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  session_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Team sessions for multi-agent coordination
CREATE TABLE IF NOT EXISTS team_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  session_type TEXT DEFAULT 'development', -- development, monitoring, emergency, planning
  status TEXT DEFAULT 'active', -- active, completed, cancelled
  consensus_threshold DECIMAL(3,2) DEFAULT 0.60,
  participants TEXT[] DEFAULT '{}', -- Array of agent IDs
  coordinator_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

-- Agent contributions for tracking individual agent outputs
CREATE TABLE IF NOT EXISTS agent_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_session_id UUID REFERENCES team_sessions(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  agent_type TEXT NOT NULL, -- SystemAnalyst, Development, Monitoring, Strategy, Security
  contribution_type TEXT NOT NULL, -- recommendation, analysis, implementation, review
  content JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT FALSE,
  approval_votes INTEGER DEFAULT 0,
  rejection_votes INTEGER DEFAULT 0
);

-- Team consensus records for decision tracking
CREATE TABLE IF NOT EXISTS team_consensus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_session_id UUID REFERENCES team_sessions(id) ON DELETE CASCADE,
  decision_topic TEXT NOT NULL,
  decision_category TEXT NOT NULL, -- CRITICAL, MAJOR, MINOR
  consensus_reached BOOLEAN DEFAULT FALSE,
  required_votes INTEGER NOT NULL,
  actual_votes INTEGER DEFAULT 0,
  final_decision JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  consensus_time_ms INTEGER,
  conflicting_opinions JSONB,
  resolution_method TEXT
);

-- Agent performance metrics
CREATE TABLE IF NOT EXISTS agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  team_session_id UUID REFERENCES team_sessions(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- response_time, accuracy, collaboration, consensus_support
  metric_value DECIMAL(10,4) NOT NULL,
  measurement_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team communication logs
CREATE TABLE IF NOT EXISTS team_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_session_id UUID REFERENCES team_sessions(id) ON DELETE CASCADE,
  sender_agent TEXT NOT NULL,
  receiver_agent TEXT, -- NULL for broadcast messages
  message_type TEXT NOT NULL, -- BROADCAST, DIRECT, FEEDBACK, ALERT
  priority TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
  content JSONB NOT NULL,
  requires_response BOOLEAN DEFAULT FALSE,
  response_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_content JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_sessions_project_id ON project_sessions(project_id);

-- Team coordination indexes
CREATE INDEX IF NOT EXISTS idx_team_sessions_type ON team_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_team_sessions_status ON team_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_contributions_session ON agent_contributions(team_session_id);
CREATE INDEX IF NOT EXISTS idx_agent_contributions_agent ON agent_contributions(agent_type);
CREATE INDEX IF NOT EXISTS idx_team_consensus_session ON team_consensus(team_session_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent ON agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_team_communications_session ON team_communications(team_session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_consensus ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_communications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON conversations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON projects FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON projects FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON project_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON project_sessions FOR INSERT WITH CHECK (true);

-- Team coordination policies
CREATE POLICY "Enable read access for all users" ON team_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON team_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON team_sessions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON agent_contributions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON agent_contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON agent_contributions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON team_consensus FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON team_consensus FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON agent_performance FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON agent_performance FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON team_communications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON team_communications FOR INSERT WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE agent_contributions ADD CONSTRAINT fk_agent_contributions_session 
  FOREIGN KEY (team_session_id) REFERENCES team_sessions(id) ON DELETE CASCADE;

ALTER TABLE team_consensus ADD CONSTRAINT fk_team_consensus_session 
  FOREIGN KEY (team_session_id) REFERENCES team_sessions(id) ON DELETE CASCADE;

ALTER TABLE agent_performance ADD CONSTRAINT fk_agent_performance_session 
  FOREIGN KEY (team_session_id) REFERENCES team_sessions(id) ON DELETE CASCADE;

ALTER TABLE team_communications ADD CONSTRAINT fk_team_communications_session 
  FOREIGN KEY (team_session_id) REFERENCES team_sessions(id) ON DELETE CASCADE;
