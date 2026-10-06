-- THARAT Map V5.13
-- Run statements one by one in Neon if your query editor rejects multiple commands.
ALTER TABLE markers ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE marker_comments ADD COLUMN IF NOT EXISTS parent_id bigint NULL REFERENCES marker_comments(id) ON DELETE CASCADE;
ALTER TABLE marker_comments ADD COLUMN IF NOT EXISTS updated_at timestamptz NULL;
CREATE INDEX IF NOT EXISTS marker_comments_parent_idx ON marker_comments(parent_id);
CREATE INDEX IF NOT EXISTS markers_featured_idx ON markers(featured) WHERE featured = true;
