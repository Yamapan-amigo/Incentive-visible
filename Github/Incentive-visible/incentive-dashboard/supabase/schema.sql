-- Incentive Dashboard Database Schema
-- Run this in Supabase SQL Editor

-- Incentive entries table
CREATE TABLE IF NOT EXISTS incentive_entries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sales TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  client TEXT NOT NULL,
  billing INTEGER NOT NULL,
  cost INTEGER NOT NULL,
  incentive_target INTEGER NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id BIGSERIAL PRIMARY KEY,
  billing INTEGER NOT NULL DEFAULT 5000000,
  profit INTEGER NOT NULL DEFAULT 800000,
  incentive INTEGER NOT NULL DEFAULT 350000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default goals if not exists
INSERT INTO goals (billing, profit, incentive)
SELECT 5000000, 800000, 350000
WHERE NOT EXISTS (SELECT 1 FROM goals LIMIT 1);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE incentive_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Allow public access (for now, without auth)
CREATE POLICY "Allow public read access on incentive_entries"
  ON incentive_entries FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access on incentive_entries"
  ON incentive_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access on incentive_entries"
  ON incentive_entries FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access on incentive_entries"
  ON incentive_entries FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on goals"
  ON goals FOR SELECT
  USING (true);

CREATE POLICY "Allow public update access on goals"
  ON goals FOR UPDATE
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_incentive_entries_updated_at
  BEFORE UPDATE ON incentive_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
