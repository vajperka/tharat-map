ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_key text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data_json jsonb DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS marker_reports_created_idx ON marker_reports(created_at DESC);
