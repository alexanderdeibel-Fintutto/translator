-- Fintutto Art Guide: Visitor Personalization, Preferences & Analytics
-- Core concept: Every visitor gets a personalized experience based on their profile

-- ============================================================================
-- 1. VISITOR PROFILES (personalization is king)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- null = anonymous visitor
  museum_id UUID REFERENCES ag_museums(id) ON DELETE SET NULL, -- null = global profile

  -- Identity & Demographics (all optional, for personalization)
  display_name TEXT,
  preferred_salutation TEXT,                        -- "Du", "Sie", "Hey", custom...
  age_group TEXT DEFAULT 'adult',                   -- child (6-12), youth (13-17), young_adult (18-25), adult (26-59), senior (60+)
  gender TEXT,                                      -- male, female, diverse, prefer_not_to_say
  birth_year INTEGER,                              -- for precise age calculation

  -- Knowledge & Interest Profile
  knowledge_level TEXT DEFAULT 'casual',            -- beginner, casual, enthusiast, expert, professional
  interests TEXT[] DEFAULT '{}',                    -- ["impressionism", "sculpture", "modern_art", ...]
  favorite_epochs TEXT[] DEFAULT '{}',              -- ["renaissance", "baroque", ...]
  favorite_artists TEXT[] DEFAULT '{}',
  visited_museums TEXT[] DEFAULT '{}',              -- museum slugs they've been to
  accessibility_needs TEXT[] DEFAULT '{}',          -- ["wheelchair", "visual_impairment", "hearing_impairment", ...]

  -- Visit Preferences
  typical_visit_duration_minutes INTEGER,           -- how long they usually spend
  preferred_tour_depth TEXT DEFAULT 'standard',     -- quick (highlights only), standard, deep_dive
  preferred_content_style TEXT DEFAULT 'narrative', -- factual, narrative, storytelling, academic
  language TEXT DEFAULT 'de',
  secondary_languages TEXT[] DEFAULT '{}',

  -- Voice & Audio Preferences
  preferred_voice_gender TEXT DEFAULT 'female',     -- male, female, neutral
  preferred_voice_age TEXT DEFAULT 'middle',        -- child, young, middle, mature
  preferred_voice_preset TEXT,                      -- preset ID like "museumsfuehrerin", "kunstprofessor"
  audio_speed NUMERIC DEFAULT 1.0,                 -- 0.75 - 1.5 playback speed
  auto_play_audio BOOLEAN DEFAULT true,            -- auto-play when near artwork

  -- AI Personalization
  ai_personality_tone TEXT DEFAULT 'warm',          -- formal, warm, casual, enthusiastic, academic
  ai_detail_level TEXT DEFAULT 'standard',          -- minimal, standard, detailed, exhaustive
  ai_include_anecdotes BOOLEAN DEFAULT true,
  ai_include_comparisons BOOLEAN DEFAULT true,      -- compare with other artworks
  ai_include_technique BOOLEAN DEFAULT false,       -- technical art details
  ai_child_mode BOOLEAN DEFAULT false,              -- simplified language, fun facts focus

  -- Session state
  current_museum_id UUID REFERENCES ag_museums(id),
  current_venue_id UUID REFERENCES ag_venues(id),
  current_room_id UUID REFERENCES ag_rooms(id),
  active_tour_id UUID REFERENCES ag_tours(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_visitors_user ON ag_visitors(user_id);
CREATE INDEX idx_ag_visitors_museum ON ag_visitors(museum_id);

-- ============================================================================
-- 2. VISITS (museum visit sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES ag_visitors(id) ON DELETE CASCADE,
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES ag_venues(id),

  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes NUMERIC,

  -- Visit summary (computed on end)
  artworks_viewed INTEGER DEFAULT 0,
  audio_plays INTEGER DEFAULT 0,
  tour_id UUID REFERENCES ag_tours(id),            -- if following a tour
  tour_completed BOOLEAN DEFAULT false,
  rooms_visited UUID[] DEFAULT '{}',
  entry_method TEXT DEFAULT 'app',                  -- app, qr, nfc, web, kiosk

  -- Feedback
  overall_rating INTEGER,                          -- 1-5 stars
  feedback_text TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_visits_visitor ON ag_visits(visitor_id);
CREATE INDEX idx_ag_visits_museum ON ag_visits(museum_id);
CREATE INDEX idx_ag_visits_time ON ag_visits(started_at);

-- ============================================================================
-- 3. ARTWORK VIEWS (which artworks were viewed, how long)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_artwork_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES ag_visits(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES ag_visitors(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES ag_artworks(id) ON DELETE CASCADE,

  viewed_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INTEGER,                        -- time spent looking
  detection_method TEXT DEFAULT 'manual',           -- manual, qr, nfc, ble, gps, wifi

  -- Interaction
  audio_played BOOLEAN DEFAULT false,
  audio_duration_seconds INTEGER,
  audio_voice_preset TEXT,
  audio_language TEXT,
  ai_chat_started BOOLEAN DEFAULT false,
  ai_messages_count INTEGER DEFAULT 0,
  favorited BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  photo_taken BOOLEAN DEFAULT false,

  -- Rating per artwork
  rating INTEGER,                                  -- 1-5

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_views_visit ON ag_artwork_views(visit_id);
CREATE INDEX idx_ag_views_visitor ON ag_artwork_views(visitor_id);
CREATE INDEX idx_ag_views_artwork ON ag_artwork_views(artwork_id);
CREATE INDEX idx_ag_views_time ON ag_artwork_views(viewed_at);

-- ============================================================================
-- 4. AI CHAT HISTORY (conversations about artworks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES ag_visitors(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES ag_artworks(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES ag_visits(id) ON DELETE SET NULL,

  messages JSONB NOT NULL DEFAULT '[]',            -- [{ role: "user"|"assistant", content: "...", ts: "..." }]
  personalization_context JSONB DEFAULT '{}',       -- snapshot of visitor preferences used

  total_messages INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_chats_visitor ON ag_ai_chats(visitor_id);
CREATE INDEX idx_ag_chats_artwork ON ag_ai_chats(artwork_id);

-- ============================================================================
-- 5. VISITOR FAVORITES (saved artworks & tours)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES ag_visitors(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,                       -- 'artwork', 'tour', 'museum'
  entity_id UUID NOT NULL,
  notes TEXT,                                      -- personal note
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(visitor_id, entity_type, entity_id)
);

CREATE INDEX idx_ag_favorites_visitor ON ag_favorites(visitor_id);

-- ============================================================================
-- 6. MUSEUM ANALYTICS AGGREGATES (precomputed for dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Visitor metrics
  total_visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_visit_duration_minutes NUMERIC,
  return_visitors INTEGER DEFAULT 0,

  -- Content engagement
  total_artwork_views INTEGER DEFAULT 0,
  total_audio_plays INTEGER DEFAULT 0,
  total_ai_chats INTEGER DEFAULT 0,
  total_ai_messages INTEGER DEFAULT 0,

  -- Tour metrics
  tours_started INTEGER DEFAULT 0,
  tours_completed INTEGER DEFAULT 0,
  avg_tour_completion_pct NUMERIC,

  -- Top content
  top_artworks JSONB DEFAULT '[]',                 -- [{ id, views, avg_duration }]
  top_rooms JSONB DEFAULT '[]',
  top_tours JSONB DEFAULT '[]',

  -- Demographics
  age_distribution JSONB DEFAULT '{}',             -- { child: 5, youth: 12, adult: 45, ... }
  language_distribution JSONB DEFAULT '{}',        -- { de: 60, en: 25, fr: 10, ... }
  entry_methods JSONB DEFAULT '{}',                -- { app: 50, qr: 30, web: 20 }

  -- Satisfaction
  avg_rating NUMERIC,
  feedback_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(museum_id, date)
);

CREATE INDEX idx_ag_analytics_museum_date ON ag_analytics_daily(museum_id, date);

-- ============================================================================
-- 7. AI TOUR SUGGESTIONS (AI-generated tour proposals for museums)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_ai_tour_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,

  title JSONB NOT NULL DEFAULT '{}',
  description JSONB DEFAULT '{}',
  target_audience TEXT DEFAULT 'general',
  estimated_duration_minutes INTEGER,
  suggested_stops JSONB NOT NULL DEFAULT '[]',     -- [{ artwork_id, reason, narration_hint }]
  theme TEXT,                                      -- "Farbe und Licht", "Frauen in der Kunst", ...
  reasoning TEXT,                                  -- why AI suggests this tour

  status TEXT DEFAULT 'suggested',                 -- suggested, accepted, rejected, converted
  converted_tour_id UUID REFERENCES ag_tours(id),
  requested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_tour_suggestions_museum ON ag_ai_tour_suggestions(museum_id);

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

ALTER TABLE ag_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_artwork_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_ai_tour_suggestions ENABLE ROW LEVEL SECURITY;

-- Visitors manage their own data
CREATE POLICY "Visitors read own profile" ON ag_visitors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Visitors update own profile" ON ag_visitors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Visitors insert own profile" ON ag_visitors
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Anonymous visitors (no auth) can create profiles
CREATE POLICY "Anonymous visitor insert" ON ag_visitors
  FOR INSERT WITH CHECK (user_id IS NULL);

CREATE POLICY "Visitors read own visits" ON ag_visits
  FOR SELECT USING (
    visitor_id IN (SELECT id FROM ag_visitors WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors insert visits" ON ag_visits
  FOR INSERT WITH CHECK (
    visitor_id IN (SELECT id FROM ag_visitors WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors update own visits" ON ag_visits
  FOR UPDATE USING (
    visitor_id IN (SELECT id FROM ag_visitors WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors manage own views" ON ag_artwork_views
  FOR ALL USING (
    visitor_id IN (SELECT id FROM ag_visitors WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors manage own chats" ON ag_ai_chats
  FOR ALL USING (
    visitor_id IN (SELECT id FROM ag_visitors WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors manage own favorites" ON ag_favorites
  FOR ALL USING (
    visitor_id IN (SELECT id FROM ag_visitors WHERE user_id = auth.uid())
  );

-- Museum staff read analytics
CREATE POLICY "Museum staff read analytics" ON ag_analytics_daily
  FOR SELECT USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

-- Museum staff read visitor data (anonymized - no user_id exposed)
CREATE POLICY "Museum staff read visits" ON ag_visits
  FOR SELECT USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

CREATE POLICY "Museum staff read artwork views" ON ag_artwork_views
  FOR SELECT USING (
    artwork_id IN (
      SELECT a.id FROM ag_artworks a
      WHERE a.museum_id IN (
        SELECT mu.museum_id FROM ag_museum_users mu
        WHERE mu.user_id = auth.uid() AND mu.is_active = true
      )
    )
  );

-- AI tour suggestions: museum staff
CREATE POLICY "Museum staff manage tour suggestions" ON ag_ai_tour_suggestions
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

-- System admin full access on all visitor tables
CREATE POLICY "Admin full access visitors" ON ag_visitors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access visits" ON ag_visits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access views" ON ag_artwork_views
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access chats" ON ag_ai_chats
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access favorites" ON ag_favorites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access analytics" ON ag_analytics_daily
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access tour suggestions" ON ag_ai_tour_suggestions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

CREATE TRIGGER ag_visitors_updated_at
  BEFORE UPDATE ON ag_visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 10. HELPER: Build AI personalization context from visitor profile
-- ============================================================================

CREATE OR REPLACE FUNCTION ag_get_personalization_context(p_visitor_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_visitor ag_visitors;
  v_context JSONB;
BEGIN
  SELECT * INTO v_visitor FROM ag_visitors WHERE id = p_visitor_id;

  IF v_visitor IS NULL THEN
    RETURN '{}'::JSONB;
  END IF;

  v_context := jsonb_build_object(
    'age_group', v_visitor.age_group,
    'knowledge_level', v_visitor.knowledge_level,
    'interests', v_visitor.interests,
    'preferred_salutation', v_visitor.preferred_salutation,
    'content_style', v_visitor.preferred_content_style,
    'tour_depth', v_visitor.preferred_tour_depth,
    'language', v_visitor.language,
    'ai_tone', v_visitor.ai_personality_tone,
    'ai_detail_level', v_visitor.ai_detail_level,
    'include_anecdotes', v_visitor.ai_include_anecdotes,
    'include_comparisons', v_visitor.ai_include_comparisons,
    'include_technique', v_visitor.ai_include_technique,
    'child_mode', v_visitor.ai_child_mode,
    'accessibility_needs', v_visitor.accessibility_needs,
    'voice_gender', v_visitor.preferred_voice_gender,
    'voice_age', v_visitor.preferred_voice_age,
    'voice_preset', v_visitor.preferred_voice_preset,
    'audio_speed', v_visitor.audio_speed
  );

  RETURN v_context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
