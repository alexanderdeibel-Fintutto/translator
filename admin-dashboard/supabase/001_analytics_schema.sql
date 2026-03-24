-- Supabase Migration: Analytics Events Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Events table — stores all incoming events from the translator
CREATE TABLE IF NOT EXISTS analytics_events (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source        TEXT NOT NULL DEFAULT 'translator',
  event         TEXT NOT NULL,
  params        JSONB NOT NULL DEFAULT '{}',
  session_id    TEXT NOT NULL,
  url           TEXT,
  user_agent    TEXT,
  country       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_events_event ON analytics_events (event);
CREATE INDEX idx_events_created_at ON analytics_events (created_at DESC);
CREATE INDEX idx_events_session ON analytics_events (session_id);
CREATE INDEX idx_events_source ON analytics_events (source);
CREATE INDEX idx_events_event_created ON analytics_events (event, created_at DESC);

-- 2. Daily aggregations — materialized for fast dashboard queries
CREATE TABLE IF NOT EXISTS analytics_daily (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date          DATE NOT NULL,
  event         TEXT NOT NULL,
  count         INTEGER NOT NULL DEFAULT 0,
  unique_sessions INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms NUMERIC,
  p95_latency_ms NUMERIC,
  metadata      JSONB DEFAULT '{}',
  UNIQUE(date, event)
);

CREATE INDEX idx_daily_date ON analytics_daily (date DESC);

-- 3. Error log — separate table for quick error overview
CREATE TABLE IF NOT EXISTS analytics_errors (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  error_type    TEXT NOT NULL,
  message       TEXT NOT NULL,
  stack         TEXT,
  source        TEXT,
  session_id    TEXT,
  url           TEXT,
  user_agent    TEXT,
  count         INTEGER NOT NULL DEFAULT 1,
  first_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_errors_type ON analytics_errors (error_type);
CREATE INDEX idx_errors_last_seen ON analytics_errors (last_seen DESC);

-- 4. Web Vitals — performance metrics history
CREATE TABLE IF NOT EXISTS analytics_web_vitals (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  metric        TEXT NOT NULL,  -- LCP, CLS, INP, FCP, TTFB
  value         NUMERIC NOT NULL,
  rating        TEXT NOT NULL,  -- good, needs-improvement, poor
  session_id    TEXT,
  url           TEXT,
  navigation_type TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vitals_metric ON analytics_web_vitals (metric, created_at DESC);

-- 5. API keys table for authentication (analytics_api_keys to avoid conflict with Supabase internal api_keys)
CREATE TABLE IF NOT EXISTS analytics_api_keys (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key_hash      TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  source        TEXT NOT NULL DEFAULT 'translator',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ
);

-- 6. Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_api_keys ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (for API routes)
CREATE POLICY "Service role full access" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON analytics_daily
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON analytics_errors
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON analytics_web_vitals
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON analytics_api_keys
  FOR ALL USING (auth.role() = 'service_role');

-- 7. Function: Aggregate daily stats (call via cron or manually)
CREATE OR REPLACE FUNCTION aggregate_daily_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO analytics_daily (date, event, count, unique_sessions, avg_latency_ms, p95_latency_ms)
  SELECT
    target_date,
    event,
    COUNT(*)::INTEGER,
    COUNT(DISTINCT session_id)::INTEGER,
    AVG((params->>'latency_ms')::NUMERIC) FILTER (WHERE params->>'latency_ms' IS NOT NULL),
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (params->>'latency_ms')::NUMERIC)
      FILTER (WHERE params->>'latency_ms' IS NOT NULL)
  FROM analytics_events
  WHERE created_at::DATE = target_date
  GROUP BY event
  ON CONFLICT (date, event)
  DO UPDATE SET
    count = EXCLUDED.count,
    unique_sessions = EXCLUDED.unique_sessions,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms;
END;
$$ LANGUAGE plpgsql;

-- 8. Scheduled aggregation (Supabase pg_cron extension)
-- Uncomment after enabling pg_cron in your Supabase project:
-- SELECT cron.schedule('aggregate-daily', '5 0 * * *', $$ SELECT aggregate_daily_stats(CURRENT_DATE - INTERVAL '1 day') $$);

-- 9. Auto-cleanup: delete raw events older than 90 days
-- SELECT cron.schedule('cleanup-old-events', '0 3 * * 0', $$ DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days' $$);
