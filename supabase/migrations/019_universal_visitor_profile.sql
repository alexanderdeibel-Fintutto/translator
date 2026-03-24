-- Fintutto World: Universal Visitor Profile & Cross-Platform Identity
-- One profile that works everywhere: Museums, Cities, Regions, Cruise Ships, Events
-- Prefix: fw_ (Fintutto World)
--
-- KEY PRINCIPLE: The visitor profile is GLOBAL. It carries preferences, history,
-- and context across ALL domains. Whether in a museum, walking through a city,
-- on a cruise ship, or at a festival — same identity, same preferences.

-- ============================================================================
-- 1. UNIVERSAL VISITOR PROFILE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_visitor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- null = anonymous

  -- ── IDENTITY ──────────────────────────────────────────────────────────
  display_name TEXT,
  preferred_salutation TEXT,                       -- "Du", "Sie", "Hey", custom
  avatar_url TEXT,

  -- ── DEMOGRAPHICS ──────────────────────────────────────────────────────
  age_group TEXT DEFAULT 'adult',                  -- child, youth, young_adult, adult, senior
  birth_year INTEGER,
  gender TEXT,                                     -- male, female, diverse, prefer_not_to_say
  country_of_origin TEXT,                          -- ISO 3166-1 alpha-2
  country_of_residence TEXT,

  -- ── LANGUAGE ──────────────────────────────────────────────────────────
  primary_language TEXT NOT NULL DEFAULT 'de',
  secondary_languages TEXT[] DEFAULT '{}',
  ui_language TEXT DEFAULT 'de',                   -- app interface language

  -- ── KNOWLEDGE & INTERESTS ─────────────────────────────────────────────
  knowledge_level TEXT DEFAULT 'casual',           -- beginner, casual, enthusiast, expert, professional
  interests TEXT[] DEFAULT '{}',                   -- free-form tags: ["art", "history", "food", "nature", ...]
  favorite_categories TEXT[] DEFAULT '{}',         -- POI categories they like
  favorite_epochs TEXT[] DEFAULT '{}',             -- historical periods
  favorite_artists TEXT[] DEFAULT '{}',
  dietary_preferences TEXT[] DEFAULT '{}',         -- vegan, vegetarian, halal, kosher, gluten_free, ...
  budget_level TEXT DEFAULT 'medium',              -- budget, medium, premium, luxury
  mobility_level TEXT DEFAULT 'full',              -- full, limited, wheelchair, stroller
  accessibility_needs TEXT[] DEFAULT '{}',         -- visual_impairment, hearing_impairment, cognitive, ...

  -- ── VISIT STYLE ───────────────────────────────────────────────────────
  preferred_tour_depth TEXT DEFAULT 'standard',    -- quick (highlights), standard, deep_dive
  preferred_content_style TEXT DEFAULT 'narrative', -- factual, narrative, storytelling, academic
  preferred_group_size TEXT DEFAULT 'solo',        -- solo, couple, small_group, family, large_group
  typical_visit_duration_minutes INTEGER,
  prefers_indoor BOOLEAN DEFAULT true,
  prefers_outdoor BOOLEAN DEFAULT true,

  -- ── VOICE & AUDIO ─────────────────────────────────────────────────────
  preferred_voice_gender TEXT DEFAULT 'female',
  preferred_voice_age TEXT DEFAULT 'middle',       -- child, young, middle, mature
  preferred_voice_preset TEXT,                     -- named preset: "museumsfuehrerin", "professor"
  audio_speed NUMERIC DEFAULT 1.0,
  auto_play_audio BOOLEAN DEFAULT true,

  -- ── AI PERSONALITY ────────────────────────────────────────────────────
  ai_personality_tone TEXT DEFAULT 'warm',         -- formal, warm, casual, enthusiastic, academic
  ai_detail_level TEXT DEFAULT 'standard',         -- minimal, standard, detailed, exhaustive
  ai_include_anecdotes BOOLEAN DEFAULT true,
  ai_include_comparisons BOOLEAN DEFAULT true,
  ai_include_technique BOOLEAN DEFAULT false,
  ai_child_mode BOOLEAN DEFAULT false,
  ai_proactive_suggestions BOOLEAN DEFAULT true,   -- should AI proactively suggest things?
  ai_question_frequency TEXT DEFAULT 'moderate',   -- never, rare, moderate, frequent

  -- ── NOTIFICATION PREFERENCES ──────────────────────────────────────────
  notifications_enabled BOOLEAN DEFAULT true,
  notify_nearby_pois BOOLEAN DEFAULT true,
  notify_nearby_offers BOOLEAN DEFAULT true,
  notify_time_warnings BOOLEAN DEFAULT true,       -- "Museum schliesst in 30 Min"
  notify_recommendations BOOLEAN DEFAULT true,
  notification_radius_meters INTEGER DEFAULT 100,
  notification_cooldown_minutes INTEGER DEFAULT 5, -- min time between notifications
  quiet_hours_start TIME,                          -- e.g. 22:00
  quiet_hours_end TIME,                            -- e.g. 08:00

  -- ── CURRENT CONTEXT (ephemeral, updated in real-time) ─────────────────
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  current_location_updated_at TIMESTAMPTZ,
  current_context_type TEXT,                       -- museum, city, region, cruise, event, nature
  current_context_id UUID,                         -- ID of the museum/city/region/etc.
  current_venue_id UUID,
  current_room_id UUID,
  active_tour_id UUID,
  active_dialog_id UUID,                           -- current AI conversation

  -- ── TRAVEL CONTEXT ────────────────────────────────────────────────────
  travel_mode TEXT,                                -- resident, day_trip, weekend, vacation, long_stay
  travel_start_date DATE,
  travel_end_date DATE,
  travel_party_size INTEGER DEFAULT 1,
  travel_with_children BOOLEAN DEFAULT false,
  travel_children_ages INTEGER[] DEFAULT '{}',

  -- ── META ──────────────────────────────────────────────────────────────
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_pois_viewed INTEGER DEFAULT 0,
  total_ai_conversations INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fw_profiles_user ON fw_visitor_profiles(user_id);
CREATE INDEX idx_fw_profiles_location ON fw_visitor_profiles(current_lat, current_lng)
  WHERE current_lat IS NOT NULL;
CREATE INDEX idx_fw_profiles_context ON fw_visitor_profiles(current_context_type, current_context_id)
  WHERE current_context_type IS NOT NULL;
CREATE INDEX idx_fw_profiles_active ON fw_visitor_profiles(last_active_at);

-- ============================================================================
-- 2. VISIT HISTORY (cross-platform: every visit to any venue/city/region)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES fw_visitor_profiles(id) ON DELETE CASCADE,

  -- What was visited
  context_type TEXT NOT NULL,                      -- museum, city_poi, region_poi, cruise_poi, event, partner
  context_id UUID NOT NULL,                        -- ID of the entity visited
  context_name TEXT,                               -- denormalized name for quick display

  -- Parent reference (which city/region/museum does this belong to)
  parent_type TEXT,                                -- city, region, museum, cruise
  parent_id UUID,
  parent_name TEXT,

  -- Visit data
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes NUMERIC,

  -- Engagement
  items_viewed INTEGER DEFAULT 0,                  -- artworks, POIs, etc.
  audio_plays INTEGER DEFAULT 0,
  ai_conversations INTEGER DEFAULT 0,
  photos_taken INTEGER DEFAULT 0,

  -- Tour
  tour_id UUID,
  tour_completed BOOLEAN DEFAULT false,

  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  would_recommend BOOLEAN,

  -- Detection
  entry_method TEXT DEFAULT 'app',                 -- app, qr, nfc, web, kiosk, geofence

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fw_visits_visitor ON fw_visit_history(visitor_id);
CREATE INDEX idx_fw_visits_context ON fw_visit_history(context_type, context_id);
CREATE INDEX idx_fw_visits_parent ON fw_visit_history(parent_type, parent_id);
CREATE INDEX idx_fw_visits_time ON fw_visit_history(started_at);

-- ============================================================================
-- 3. POI INTERACTION LOG (every interaction with any content item)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_poi_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES fw_visitor_profiles(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES fw_visit_history(id) ON DELETE SET NULL,

  -- What was interacted with
  poi_type TEXT NOT NULL,                          -- artwork, poi, partner, offer, tour_stop, ship_area
  poi_id UUID NOT NULL,
  poi_name TEXT,                                   -- denormalized

  -- Interaction
  interaction_type TEXT NOT NULL DEFAULT 'view',   -- view, audio_play, ai_chat, favorite, share, book, rate, photo

  -- Details
  viewed_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INTEGER,
  detection_method TEXT DEFAULT 'manual',          -- manual, qr, nfc, ble, gps, wifi, geofence
  language_used TEXT,

  -- Audio
  audio_played BOOLEAN DEFAULT false,
  audio_duration_seconds INTEGER,
  audio_voice_preset TEXT,

  -- AI
  ai_chat_started BOOLEAN DEFAULT false,
  ai_messages_count INTEGER DEFAULT 0,

  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  favorited BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fw_interactions_visitor ON fw_poi_interactions(visitor_id);
CREATE INDEX idx_fw_interactions_poi ON fw_poi_interactions(poi_type, poi_id);
CREATE INDEX idx_fw_interactions_visit ON fw_poi_interactions(visit_id);
CREATE INDEX idx_fw_interactions_time ON fw_poi_interactions(viewed_at);

-- ============================================================================
-- 4. AI DIALOG SESSIONS (cross-platform conversations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_ai_dialogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES fw_visitor_profiles(id) ON DELETE CASCADE,

  -- Context: what is the conversation about?
  context_type TEXT NOT NULL,                      -- artwork, poi, city, region, tour, general, onboarding
  context_id UUID,                                 -- specific entity being discussed
  context_name TEXT,

  -- Parent
  parent_type TEXT,                                -- museum, city, region, cruise
  parent_id UUID,

  -- Conversation
  messages JSONB NOT NULL DEFAULT '[]',            -- [{ role, content, ts, metadata }]
  total_messages INTEGER DEFAULT 0,

  -- Personalization snapshot (frozen at dialog start)
  personalization_snapshot JSONB DEFAULT '{}',

  -- State
  status TEXT DEFAULT 'active',                    -- active, paused, completed, archived
  dialog_mode TEXT DEFAULT 'reactive',             -- reactive (user asks), proactive (AI initiates), guided (onboarding)

  -- Metrics
  started_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  total_tokens_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fw_dialogs_visitor ON fw_ai_dialogs(visitor_id);
CREATE INDEX idx_fw_dialogs_context ON fw_ai_dialogs(context_type, context_id);
CREATE INDEX idx_fw_dialogs_active ON fw_ai_dialogs(visitor_id, status) WHERE status = 'active';

-- ============================================================================
-- 5. NOTIFICATION LOG (what notifications were sent/shown)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES fw_visitor_profiles(id) ON DELETE CASCADE,

  -- Notification content
  notification_type TEXT NOT NULL,                 -- nearby_poi, nearby_offer, time_warning, recommendation,
                                                   -- tour_suggestion, closing_soon, weather_alert, event_start
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,                                       -- lucide icon name or emoji
  image_url TEXT,

  -- What triggered it
  trigger_type TEXT NOT NULL,                      -- geofence, time, ai_recommendation, system, schedule
  trigger_poi_type TEXT,
  trigger_poi_id UUID,
  trigger_lat DOUBLE PRECISION,
  trigger_lng DOUBLE PRECISION,
  trigger_radius_meters INTEGER,

  -- Action (what happens when tapped)
  action_type TEXT DEFAULT 'navigate',             -- navigate, open_dialog, open_tour, open_offer, dismiss
  action_target TEXT,                              -- route path or deep link
  action_data JSONB DEFAULT '{}',

  -- Delivery
  channel TEXT DEFAULT 'in_app',                   -- in_app, push, both
  priority TEXT DEFAULT 'normal',                  -- low, normal, high, urgent

  -- State
  status TEXT DEFAULT 'pending',                   -- pending, delivered, read, acted, dismissed, expired
  scheduled_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  acted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Dedup / rate limiting
  dedup_key TEXT,                                  -- prevent duplicate notifications

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fw_notifications_visitor ON fw_notifications(visitor_id);
CREATE INDEX idx_fw_notifications_status ON fw_notifications(visitor_id, status) WHERE status IN ('pending', 'delivered');
CREATE INDEX idx_fw_notifications_type ON fw_notifications(notification_type);
CREATE INDEX idx_fw_notifications_dedup ON fw_notifications(dedup_key) WHERE dedup_key IS NOT NULL;
CREATE UNIQUE INDEX idx_fw_notifications_dedup_unique ON fw_notifications(visitor_id, dedup_key)
  WHERE dedup_key IS NOT NULL AND status NOT IN ('dismissed', 'expired');

-- ============================================================================
-- 6. VISITOR FAVORITES (universal — works across all domains)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES fw_visitor_profiles(id) ON DELETE CASCADE,

  entity_type TEXT NOT NULL,                       -- artwork, poi, partner, tour, museum, city, region, offer
  entity_id UUID NOT NULL,
  entity_name TEXT,                                -- denormalized for quick display
  entity_image_url TEXT,

  -- Context
  parent_type TEXT,
  parent_id UUID,
  parent_name TEXT,

  -- User annotation
  personal_note TEXT,
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(visitor_id, entity_type, entity_id)
);

CREATE INDEX idx_fw_favorites_visitor ON fw_favorites(visitor_id);

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE fw_visitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_poi_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_ai_dialogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_favorites ENABLE ROW LEVEL SECURITY;

-- Visitors manage their own data
CREATE POLICY "Visitors read own profile" ON fw_visitor_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Visitors update own profile" ON fw_visitor_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Visitors insert own profile" ON fw_visitor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Visitors manage own visits" ON fw_visit_history
  FOR ALL USING (
    visitor_id IN (SELECT id FROM fw_visitor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors manage own interactions" ON fw_poi_interactions
  FOR ALL USING (
    visitor_id IN (SELECT id FROM fw_visitor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors manage own dialogs" ON fw_ai_dialogs
  FOR ALL USING (
    visitor_id IN (SELECT id FROM fw_visitor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors read own notifications" ON fw_notifications
  FOR SELECT USING (
    visitor_id IN (SELECT id FROM fw_visitor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Visitors update own notifications" ON fw_notifications
  FOR UPDATE USING (
    visitor_id IN (SELECT id FROM fw_visitor_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "System insert notifications" ON fw_notifications
  FOR INSERT WITH CHECK (true);  -- edge functions insert via service role

CREATE POLICY "Visitors manage own favorites" ON fw_favorites
  FOR ALL USING (
    visitor_id IN (SELECT id FROM fw_visitor_profiles WHERE user_id = auth.uid())
  );

-- Admin full access
CREATE POLICY "Admin full access fw_profiles" ON fw_visitor_profiles
  FOR ALL USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access fw_visits" ON fw_visit_history
  FOR ALL USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access fw_interactions" ON fw_poi_interactions
  FOR ALL USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access fw_dialogs" ON fw_ai_dialogs
  FOR ALL USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access fw_notifications" ON fw_notifications
  FOR ALL USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access fw_favorites" ON fw_favorites
  FOR ALL USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'));

-- Content providers (museum/city staff) can read anonymized visitor data for analytics
CREATE POLICY "Staff read visit history for analytics" ON fw_visit_history
  FOR SELECT USING (
    -- Museum staff
    (parent_type = 'museum' AND parent_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu WHERE mu.user_id = auth.uid() AND mu.is_active = true
    ))
    OR
    -- City staff
    (parent_type = 'city' AND parent_id IN (
      SELECT s.city_id FROM cg_staff s WHERE s.user_id = auth.uid() AND s.role IN ('admin', 'editor')
    ))
    OR
    -- Region staff
    (parent_type = 'region' AND parent_id IN (
      SELECT s.region_id FROM cg_staff s WHERE s.user_id = auth.uid() AND s.role IN ('admin', 'editor')
    ))
  );

CREATE POLICY "Staff read interactions for analytics" ON fw_poi_interactions
  FOR SELECT USING (
    visit_id IN (
      SELECT id FROM fw_visit_history WHERE
        (parent_type = 'museum' AND parent_id IN (
          SELECT mu.museum_id FROM ag_museum_users mu WHERE mu.user_id = auth.uid() AND mu.is_active = true
        ))
        OR (parent_type = 'city' AND parent_id IN (
          SELECT s.city_id FROM cg_staff s WHERE s.user_id = auth.uid() AND s.role IN ('admin', 'editor')
        ))
        OR (parent_type = 'region' AND parent_id IN (
          SELECT s.region_id FROM cg_staff s WHERE s.user_id = auth.uid() AND s.role IN ('admin', 'editor')
        ))
    )
  );

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

CREATE TRIGGER fw_profiles_updated_at
  BEFORE UPDATE ON fw_visitor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 9. RPC: Get or create visitor profile for current user
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_get_or_create_profile()
RETURNS fw_visitor_profiles AS $$
DECLARE
  v_profile fw_visitor_profiles;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Try to find existing profile
  SELECT * INTO v_profile FROM fw_visitor_profiles WHERE user_id = v_user_id LIMIT 1;

  IF v_profile IS NOT NULL THEN
    -- Update last_active
    UPDATE fw_visitor_profiles SET last_active_at = now() WHERE id = v_profile.id;
    RETURN v_profile;
  END IF;

  -- Create new profile with defaults from gt_users if available
  INSERT INTO fw_visitor_profiles (user_id, display_name, primary_language)
  SELECT v_user_id,
         COALESCE(u.display_name, u.email),
         'de'
  FROM gt_users u WHERE u.id = v_user_id
  RETURNING * INTO v_profile;

  -- If no gt_users row, create minimal profile
  IF v_profile IS NULL THEN
    INSERT INTO fw_visitor_profiles (user_id)
    VALUES (v_user_id)
    RETURNING * INTO v_profile;
  END IF;

  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. RPC: Build personalization context from profile
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_get_personalization_context(p_visitor_id UUID)
RETURNS JSONB AS $$
DECLARE
  v RECORD;
BEGIN
  SELECT * INTO v FROM fw_visitor_profiles WHERE id = p_visitor_id;

  IF v IS NULL THEN
    RETURN '{}'::JSONB;
  END IF;

  RETURN jsonb_build_object(
    'age_group', v.age_group,
    'knowledge_level', v.knowledge_level,
    'interests', v.interests,
    'preferred_salutation', v.preferred_salutation,
    'content_style', v.preferred_content_style,
    'tour_depth', v.preferred_tour_depth,
    'language', v.primary_language,
    'secondary_languages', v.secondary_languages,
    'ai_tone', v.ai_personality_tone,
    'ai_detail_level', v.ai_detail_level,
    'include_anecdotes', v.ai_include_anecdotes,
    'include_comparisons', v.ai_include_comparisons,
    'include_technique', v.ai_include_technique,
    'child_mode', v.ai_child_mode,
    'proactive_suggestions', v.ai_proactive_suggestions,
    'question_frequency', v.ai_question_frequency,
    'accessibility_needs', v.accessibility_needs,
    'voice_gender', v.preferred_voice_gender,
    'voice_age', v.preferred_voice_age,
    'voice_preset', v.preferred_voice_preset,
    'audio_speed', v.audio_speed,
    'dietary_preferences', v.dietary_preferences,
    'budget_level', v.budget_level,
    'mobility_level', v.mobility_level,
    'group_size', v.preferred_group_size,
    'travel_mode', v.travel_mode,
    'travel_party_size', v.travel_party_size,
    'travel_with_children', v.travel_with_children,
    'prefers_indoor', v.prefers_indoor,
    'prefers_outdoor', v.prefers_outdoor,
    'notifications_enabled', v.notifications_enabled,
    'notification_radius_meters', v.notification_radius_meters
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
