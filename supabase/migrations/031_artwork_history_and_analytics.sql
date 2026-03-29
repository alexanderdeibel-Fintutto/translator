-- ============================================================================
-- Migration 031: Artwork History + Analytics Daily Table
-- ============================================================================

-- 1. ARTWORK HISTORY TABLE
-- Tracks every change to artwork text fields for version control
-- ============================================================================
CREATE TABLE IF NOT EXISTS ag_artwork_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id      UUID NOT NULL REFERENCES ag_artworks(id) ON DELETE CASCADE,
  museum_id       UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  field           TEXT NOT NULL,          -- e.g. 'description_standard'
  lang            TEXT NOT NULL DEFAULT 'de',  -- e.g. 'de', 'en'
  old_value       TEXT,
  new_value       TEXT,
  changed_by      UUID REFERENCES auth.users(id),
  user_email      TEXT,                   -- denormalized for display
  change_source   TEXT DEFAULT 'manual',  -- 'manual' | 'ai' | 'import' | 'restore'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artwork_history_artwork_id ON ag_artwork_history(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_history_museum_id ON ag_artwork_history(museum_id);
CREATE INDEX IF NOT EXISTS idx_artwork_history_created_at ON ag_artwork_history(created_at DESC);

-- RLS for artwork history
ALTER TABLE ag_artwork_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Museum members can view history" ON ag_artwork_history
  FOR SELECT USING (
    museum_id IN (
      SELECT museum_id FROM ag_cms_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Museum members can insert history" ON ag_artwork_history
  FOR INSERT WITH CHECK (
    museum_id IN (
      SELECT museum_id FROM ag_cms_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- 2. ANALYTICS DAILY TABLE
-- Stores aggregated daily visitor stats per museum
-- ============================================================================
CREATE TABLE IF NOT EXISTS ag_analytics_daily (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id             UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  visitors_total        INTEGER NOT NULL DEFAULT 0,
  visitors_app          INTEGER NOT NULL DEFAULT 0,
  visitors_qr           INTEGER NOT NULL DEFAULT 0,
  visitors_web          INTEGER NOT NULL DEFAULT 0,
  audio_plays           INTEGER NOT NULL DEFAULT 0,
  avg_session_minutes   NUMERIC(5,1) NOT NULL DEFAULT 0,
  artworks_viewed       INTEGER NOT NULL DEFAULT 0,
  tours_started         INTEGER NOT NULL DEFAULT 0,
  tours_completed       INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(museum_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_museum_date ON ag_analytics_daily(museum_id, date DESC);

-- RLS for analytics
ALTER TABLE ag_analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Museum members can view analytics" ON ag_analytics_daily
  FOR SELECT USING (
    museum_id IN (
      SELECT museum_id FROM ag_cms_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- 3. ANALYTICS EVENTS TABLE (raw events for real-time tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ag_analytics_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id     UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  artwork_id    UUID REFERENCES ag_artworks(id) ON DELETE SET NULL,
  tour_id       UUID REFERENCES ag_tours(id) ON DELETE SET NULL,
  event_type    TEXT NOT NULL,  -- 'qr_scan' | 'audio_play' | 'tour_start' | 'tour_complete' | 'artwork_view'
  source        TEXT,           -- 'app' | 'qr' | 'web'
  session_id    TEXT,
  duration_sec  INTEGER,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_museum_id ON ag_analytics_events(museum_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON ag_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_artwork_id ON ag_analytics_events(artwork_id);

-- RLS: Events are public-insert (visitors scan QR codes without auth)
ALTER TABLE ag_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events" ON ag_analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Museum members can view their events" ON ag_analytics_events
  FOR SELECT USING (
    museum_id IN (
      SELECT museum_id FROM ag_cms_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- 4. TRIGGER: Auto-write artwork history on text field changes
-- ============================================================================
CREATE OR REPLACE FUNCTION ag_track_artwork_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_field TEXT;
  v_lang TEXT;
  v_old_val TEXT;
  v_new_val TEXT;
  v_fields TEXT[] := ARRAY[
    'description_brief', 'description_standard', 'description_detailed',
    'description_children', 'description_youth', 'fun_facts',
    'historical_context', 'technique_details'
  ];
BEGIN
  FOREACH v_field IN ARRAY v_fields LOOP
    -- For each JSONB content field, check each language
    IF (OLD.*)::JSONB->v_field IS DISTINCT FROM (NEW.*)::JSONB->v_field THEN
      -- Extract changed languages
      DECLARE
        v_langs TEXT[] := ARRAY['de','en','fr','es','it','zh','ja','ar','nl','pl','ru','ko'];
      BEGIN
        FOREACH v_lang IN ARRAY v_langs LOOP
          v_old_val := (OLD.*)::JSONB->v_field->>v_lang;
          v_new_val := (NEW.*)::JSONB->v_field->>v_lang;
          IF v_old_val IS DISTINCT FROM v_new_val THEN
            INSERT INTO ag_artwork_history(
              artwork_id, museum_id, field, lang, old_value, new_value,
              changed_by, change_source
            ) VALUES (
              NEW.id, NEW.museum_id, v_field, v_lang,
              v_old_val, v_new_val,
              auth.uid(), 'manual'
            );
          END IF;
        END LOOP;
      END;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_artwork_history ON ag_artworks;
CREATE TRIGGER trg_artwork_history
  AFTER UPDATE ON ag_artworks
  FOR EACH ROW EXECUTE FUNCTION ag_track_artwork_changes();

-- ============================================================================
-- 5. FUNCTION: Aggregate events into daily analytics (called by cron or webhook)
-- ============================================================================
CREATE OR REPLACE FUNCTION ag_aggregate_analytics(p_museum_id UUID, p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ag_analytics_daily (
    museum_id, date,
    visitors_total, visitors_app, visitors_qr, visitors_web,
    audio_plays, avg_session_minutes, artworks_viewed,
    tours_started, tours_completed
  )
  SELECT
    p_museum_id,
    p_date,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type IN ('qr_scan','artwork_view','tour_start')),
    COUNT(DISTINCT session_id) FILTER (WHERE source = 'app'),
    COUNT(DISTINCT session_id) FILTER (WHERE source = 'qr'),
    COUNT(DISTINCT session_id) FILTER (WHERE source = 'web'),
    COUNT(*) FILTER (WHERE event_type = 'audio_play'),
    COALESCE(AVG(duration_sec) FILTER (WHERE event_type = 'tour_complete') / 60.0, 0),
    COUNT(*) FILTER (WHERE event_type = 'artwork_view'),
    COUNT(*) FILTER (WHERE event_type = 'tour_start'),
    COUNT(*) FILTER (WHERE event_type = 'tour_complete')
  FROM ag_analytics_events
  WHERE museum_id = p_museum_id
    AND DATE(created_at) = p_date
  ON CONFLICT (museum_id, date) DO UPDATE SET
    visitors_total      = EXCLUDED.visitors_total,
    visitors_app        = EXCLUDED.visitors_app,
    visitors_qr         = EXCLUDED.visitors_qr,
    visitors_web        = EXCLUDED.visitors_web,
    audio_plays         = EXCLUDED.audio_plays,
    avg_session_minutes = EXCLUDED.avg_session_minutes,
    artworks_viewed     = EXCLUDED.artworks_viewed,
    tours_started       = EXCLUDED.tours_started,
    tours_completed     = EXCLUDED.tours_completed,
    updated_at          = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
