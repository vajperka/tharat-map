-- Run once in Neon SQL Editor before deploying visitor analytics.
CREATE TABLE IF NOT EXISTS visitor_pageviews (
  id BIGSERIAL PRIMARY KEY,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_hash CHAR(64) NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/'
);
CREATE INDEX IF NOT EXISTS visitor_pageviews_visited_at_idx ON visitor_pageviews (visited_at DESC);
CREATE INDEX IF NOT EXISTS visitor_pageviews_session_hash_idx ON visitor_pageviews (session_hash);
-- Privacy: no IP addresses, names, cookies, or user agents are stored.
