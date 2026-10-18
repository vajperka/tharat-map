import {sql} from '@/lib/db';

// Safe to call from multiple serverless instances; avoids a manual SQL setup step.
export async function ensureVisitorAnalyticsTable() {
  const db = sql();
  await db`CREATE TABLE IF NOT EXISTS visitor_pageviews (
    id BIGSERIAL PRIMARY KEY,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_hash CHAR(64) NOT NULL,
    page_path TEXT NOT NULL DEFAULT '/'
  )`;
  return db;
}
