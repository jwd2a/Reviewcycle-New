import { query } from './connection.js';

const SCHEMA_SQL = `
-- Enable UUID extension if needed (for future use)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  url TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,

  -- Element context
  element_selector TEXT,
  element_xpath TEXT,
  element_text TEXT,

  -- Position and styling
  bounding_rect JSONB,
  dom_context JSONB,
  computed_styles JSONB,

  -- Threading
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,

  -- Status
  resolved BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance (excluding user_id for now)
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_url ON comments(url);
CREATE INDEX IF NOT EXISTS idx_comments_thread_id ON comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_project_url ON comments(project_id, url);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;

-- Apply triggers to tables
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample project for development
INSERT INTO projects (id, name, metadata) VALUES
  ('rc_proj_demo123', 'Demo Project', '{"description": "Demo project for testing"}')
ON CONFLICT (id) DO NOTHING;
`;

const ALTER_MIGRATIONS = `
-- Add user_id column to comments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add element_id column to comments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'element_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN element_id TEXT;
  END IF;
END $$;

-- Add click_offset column to comments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'click_offset'
  ) THEN
    ALTER TABLE comments ADD COLUMN click_offset JSONB;
  END IF;
END $$;

-- Create index on user_id after the column is added
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
`;

export async function runMigrations() {
  console.log('Running database migrations...');

  try {
    // Execute the base schema
    await query(SCHEMA_SQL);

    // Execute alter migrations
    await query(ALTER_MIGRATIONS);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }
}
