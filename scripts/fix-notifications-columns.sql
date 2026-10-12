-- THARAT: fix NeonDbError 42703 (missing notification_key / data_json)
-- Run in Neon Console -> SQL Editor on the database used by Vercel DATABASE_URL.
-- Safe to run repeatedly. Existing notifications are preserved.
BEGIN;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS notification_key text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data_json jsonb DEFAULT '{}'::jsonb;
UPDATE public.notifications SET data_json='{}'::jsonb WHERE data_json IS NULL;
COMMIT;
