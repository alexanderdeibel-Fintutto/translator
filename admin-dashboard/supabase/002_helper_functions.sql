-- Helper function: Count unique sessions in a time range
-- Used by the /api/metrics endpoint
CREATE OR REPLACE FUNCTION count_unique_sessions(since_date TEXT)
RETURNS TABLE(count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(DISTINCT session_id) FROM analytics_events
  WHERE created_at >= since_date::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql;
