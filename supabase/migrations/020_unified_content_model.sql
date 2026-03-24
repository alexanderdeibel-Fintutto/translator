-- Fintutto World: Unified Content Model
-- One content layer that works across ALL domains
-- Instead of separate ag_artworks, cg_pois, etc. — one universal POI table
-- with domain-specific extension columns via JSONB
-- Prefix: fw_ (Fintutto World)
--
-- DESIGN PRINCIPLE: "Write once, serve everywhere"
-- A museum artwork and a city landmark share 90% of the same structure.
-- Domain-specific fields go into JSONB `domain_data`.

-- ============================================================================
-- 1. UNIVERSAL CONTENT ITEMS (any POI, artwork, restaurant, attraction)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── CLASSIFICATION ────────────────────────────────────────────────────
  content_type TEXT NOT NULL,                      -- artwork, landmark, restaurant, hotel, shop,
                                                   -- cafe, bar, museum, church, park, monument,
                                                   -- viewpoint, beach, trail, ship_area, event_venue,
                                                   -- tour_stop, service, transport, nature, other
  domain TEXT NOT NULL,                            -- artguide, cityguide, regionguide, cruiseguide,
                                                   -- eventguide, natureguide
  category_id UUID REFERENCES cg_poi_categories(id) ON DELETE SET NULL,

  -- ── OWNERSHIP ─────────────────────────────────────────────────────────
  -- Exactly one parent: a museum, city, region, or other entity
  parent_type TEXT NOT NULL,                       -- museum, city, region, cruise, event
  parent_id UUID NOT NULL,
  parent_name TEXT,                                -- denormalized for display

  -- Optional: link to a partner/business
  partner_id UUID REFERENCES cg_partners(id) ON DELETE SET NULL,

  -- ── IDENTITY ──────────────────────────────────────────────────────────
  name JSONB NOT NULL DEFAULT '{}',               -- multilingual
  slug TEXT NOT NULL,
  description JSONB DEFAULT '{}',                 -- multilingual rich text
  short_description JSONB DEFAULT '{}',           -- multilingual, max 200 chars

  -- ── LOCATION ──────────────────────────────────────────────────────────
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address JSONB DEFAULT '{}',                     -- { street, city, zip, country }
  indoor_position JSONB,                          -- { venue_id, floor_id, room_id, x, y }

  -- ── MEDIA ─────────────────────────────────────────────────────────────
  cover_image_url TEXT,
  gallery JSONB DEFAULT '[]',                     -- array of { url, caption, alt_text }
  audio_url JSONB DEFAULT '{}',                   -- multilingual { "de": "url", "en": "url" }
  audio_duration_seconds INTEGER,
  video_url TEXT,
  model_3d_url TEXT,

  -- ── CONTENT LAYERS (personalization selects the right one) ────────────
  content_brief JSONB DEFAULT '{}',               -- multilingual 1-2 sentences
  content_standard JSONB DEFAULT '{}',            -- multilingual 4-6 sentences
  content_detailed JSONB DEFAULT '{}',            -- multilingual 8-15 sentences
  content_children JSONB DEFAULT '{}',            -- multilingual, ages 6-12
  content_youth JSONB DEFAULT '{}',               -- multilingual, ages 13-17
  content_fun_facts JSONB DEFAULT '{}',           -- multilingual
  content_historical JSONB DEFAULT '{}',          -- multilingual
  content_technique JSONB DEFAULT '{}',           -- multilingual

  -- ── AI ────────────────────────────────────────────────────────────────
  ai_narration JSONB DEFAULT '{}',                -- AI-generated descriptions per language
  ai_base_knowledge JSONB,                        -- structured facts for AI grounding
  ai_generated_at TIMESTAMPTZ,
  ai_auto_translate_status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed

  -- ── IDENTIFICATION ────────────────────────────────────────────────────
  qr_code TEXT,
  nfc_tag_id TEXT,
  beacon_uuid TEXT,

  -- ── DOMAIN-SPECIFIC DATA ──────────────────────────────────────────────
  -- Instead of many optional columns, domain-specific fields go here
  domain_data JSONB DEFAULT '{}',
  -- Examples:
  --   artwork: { artist_name, birth_year, death_year, year_created, medium, dimensions, style, epoch, origin, inventory_number }
  --   restaurant: { cuisine_type, price_range, michelin_stars, dietary_options, reservation_url }
  --   hotel: { star_rating, room_count, amenities, checkin_time, checkout_time, booking_url }
  --   landmark: { year_built, architect, height_meters, significance }
  --   trail: { distance_km, elevation_gain, difficulty, trail_type, surface }
  --   ship_area: { deck_number, area_type, capacity }
  --   event_venue: { capacity, event_types, sound_system, stage_size }

  -- ── CONTACT & HOURS ───────────────────────────────────────────────────
  opening_hours JSONB DEFAULT '{}',               -- { mon: { open, close }, ... }
  contact JSONB DEFAULT '{}',                     -- { phone, email, website }
  social_media JSONB DEFAULT '{}',

  -- ── PRICING ───────────────────────────────────────────────────────────
  is_free BOOLEAN DEFAULT true,
  admission_price JSONB DEFAULT '{}',             -- { adult: 12.00, child: 6.00, ... }
  currency TEXT DEFAULT 'EUR',

  -- ── TAGS & SEARCH ─────────────────────────────────────────────────────
  tags TEXT[] DEFAULT '{}',
  search_keywords TEXT[] DEFAULT '{}',            -- additional search terms (all languages)

  -- ── STATUS ────────────────────────────────────────────────────────────
  status TEXT NOT NULL DEFAULT 'draft',            -- draft, review, published, archived
  is_featured BOOLEAN DEFAULT false,
  is_highlight BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- ── GEOFENCE ──────────────────────────────────────────────────────────
  geofence_radius_meters INTEGER DEFAULT 50,
  geofence_trigger_action TEXT DEFAULT 'notify',  -- notify, auto_play, show_info, none
  geofence_notification JSONB DEFAULT '{}',       -- multilingual notification text

  -- ── META ──────────────────────────────────────────────────────────────
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_fw_content_type ON fw_content_items(content_type);
CREATE INDEX idx_fw_content_domain ON fw_content_items(domain);
CREATE INDEX idx_fw_content_parent ON fw_content_items(parent_type, parent_id);
CREATE INDEX idx_fw_content_partner ON fw_content_items(partner_id);
CREATE INDEX idx_fw_content_location ON fw_content_items(lat, lng) WHERE lat IS NOT NULL;
CREATE INDEX idx_fw_content_status ON fw_content_items(status);
CREATE INDEX idx_fw_content_slug ON fw_content_items(slug);
CREATE INDEX idx_fw_content_tags ON fw_content_items USING GIN(tags);
CREATE INDEX idx_fw_content_search ON fw_content_items USING GIN(search_keywords);
CREATE INDEX idx_fw_content_featured ON fw_content_items(parent_type, parent_id, is_featured)
  WHERE is_featured = true AND status = 'published';

-- ============================================================================
-- 2. CONTENT TRANSLATIONS (auto-translated content cache)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES fw_content_items(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,                        -- which field was translated
  source_language TEXT NOT NULL,                   -- original language
  target_language TEXT NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  translation_provider TEXT NOT NULL,              -- azure, google, deepl, mymemory, ai
  quality_score NUMERIC(3,2),                      -- 0.0 - 1.0
  is_human_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, field_name, target_language)
);

CREATE INDEX idx_fw_translations_content ON fw_content_translations(content_id);
CREATE INDEX idx_fw_translations_lang ON fw_content_translations(target_language);

-- ============================================================================
-- 3. CONTENT IMPORT BATCHES (for CSV/API bulk imports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_content_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type TEXT NOT NULL,
  parent_id UUID NOT NULL,
  -- Import info
  source TEXT NOT NULL,                            -- csv, api, google_places, openstreetmap, wikidata, manual
  source_file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',          -- pending, processing, completed, failed, partial
  -- Stats
  total_items INTEGER DEFAULT 0,
  imported_items INTEGER DEFAULT 0,
  skipped_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  -- Auto-translate
  auto_translate BOOLEAN DEFAULT true,
  target_languages TEXT[] DEFAULT '{de,en}',
  translation_status TEXT DEFAULT 'pending',       -- pending, in_progress, completed
  -- Meta
  created_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fw_imports_parent ON fw_content_imports(parent_type, parent_id);
CREATE INDEX idx_fw_imports_status ON fw_content_imports(status);

-- ============================================================================
-- 4. AUTO-TRANSLATION QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_translation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES fw_content_items(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  source_text TEXT NOT NULL,
  -- Processing
  status TEXT NOT NULL DEFAULT 'queued',           -- queued, processing, completed, failed
  priority INTEGER DEFAULT 5,                      -- 1 = highest, 10 = lowest
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  -- Provider routing
  preferred_provider TEXT,                         -- azure, google, deepl — or null for auto
  -- Result
  translated_text TEXT,
  provider_used TEXT,
  quality_score NUMERIC(3,2),
  processing_time_ms INTEGER,
  -- Meta
  queued_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_fw_queue_status ON fw_translation_queue(status, priority)
  WHERE status = 'queued';
CREATE INDEX idx_fw_queue_content ON fw_translation_queue(content_id);

-- ============================================================================
-- 5. PROVIDER COST TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_translation_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  provider TEXT NOT NULL,                          -- azure, google, deepl, mymemory
  -- Usage
  chars_translated BIGINT DEFAULT 0,
  requests_made INTEGER DEFAULT 0,
  -- Cost
  estimated_cost_eur NUMERIC(10,4) DEFAULT 0,
  -- Context
  parent_type TEXT,
  parent_id UUID,
  language_pair TEXT,                              -- "de->en", "en->ja", etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, provider, parent_type, parent_id, language_pair)
);

CREATE INDEX idx_fw_costs_date ON fw_translation_costs(date);
CREATE INDEX idx_fw_costs_provider ON fw_translation_costs(provider);
CREATE INDEX idx_fw_costs_parent ON fw_translation_costs(parent_type, parent_id);

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE fw_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_content_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_translation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_translation_costs ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "Public read published content" ON fw_content_items
  FOR SELECT USING (status = 'published');

-- Public read translations
CREATE POLICY "Public read translations" ON fw_content_translations
  FOR SELECT USING (true);

-- Staff manage content
CREATE POLICY "Staff manage content" ON fw_content_items
  FOR ALL USING (
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
    OR
    -- Partner users manage their own content
    (partner_id IS NOT NULL AND partner_id IN (
      SELECT pu.partner_id FROM cg_partner_users pu WHERE pu.user_id = auth.uid()
    ))
    OR
    -- System admin
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Staff manage translations
CREATE POLICY "Staff manage translations" ON fw_content_translations
  FOR ALL USING (
    content_id IN (
      SELECT id FROM fw_content_items WHERE
        (parent_type = 'museum' AND parent_id IN (SELECT mu.museum_id FROM ag_museum_users mu WHERE mu.user_id = auth.uid()))
        OR (parent_type = 'city' AND parent_id IN (SELECT s.city_id FROM cg_staff s WHERE s.user_id = auth.uid()))
        OR (parent_type = 'region' AND parent_id IN (SELECT s.region_id FROM cg_staff s WHERE s.user_id = auth.uid()))
    )
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Staff manage imports
CREATE POLICY "Staff manage imports" ON fw_content_imports
  FOR ALL USING (
    (parent_type = 'museum' AND parent_id IN (SELECT mu.museum_id FROM ag_museum_users mu WHERE mu.user_id = auth.uid()))
    OR (parent_type = 'city' AND parent_id IN (SELECT s.city_id FROM cg_staff s WHERE s.user_id = auth.uid() AND s.role = 'admin'))
    OR (parent_type = 'region' AND parent_id IN (SELECT s.region_id FROM cg_staff s WHERE s.user_id = auth.uid() AND s.role = 'admin'))
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin-only for queue and costs
CREATE POLICY "Admin manage queue" ON fw_translation_queue
  FOR ALL USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin read costs" ON fw_translation_costs
  FOR SELECT USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent')));

CREATE POLICY "Admin manage costs" ON fw_translation_costs
  FOR ALL USING (EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

CREATE TRIGGER fw_content_items_updated_at
  BEFORE UPDATE ON fw_content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 8. HELPER: Queue auto-translation for a content item
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_queue_translations(
  p_content_id UUID,
  p_target_languages TEXT[],
  p_priority INTEGER DEFAULT 5
)
RETURNS INTEGER AS $$
DECLARE
  v_item fw_content_items;
  v_field TEXT;
  v_source_lang TEXT;
  v_target_lang TEXT;
  v_source_text TEXT;
  v_queued INTEGER := 0;
  v_fields TEXT[] := ARRAY[
    'content_brief', 'content_standard', 'content_detailed',
    'content_children', 'content_youth', 'content_fun_facts',
    'content_historical', 'content_technique',
    'name', 'description', 'short_description'
  ];
BEGIN
  SELECT * INTO v_item FROM fw_content_items WHERE id = p_content_id;
  IF v_item IS NULL THEN RETURN 0; END IF;

  -- Determine source language (first key in name JSONB)
  v_source_lang := (SELECT key FROM jsonb_each_text(v_item.name) LIMIT 1);
  IF v_source_lang IS NULL THEN v_source_lang := 'de'; END IF;

  FOREACH v_field IN ARRAY v_fields LOOP
    -- Get source text from the JSONB field
    v_source_text := v_item.name ->> v_source_lang;  -- simplified; real impl checks each field

    CASE v_field
      WHEN 'name' THEN v_source_text := v_item.name ->> v_source_lang;
      WHEN 'description' THEN v_source_text := v_item.description ->> v_source_lang;
      WHEN 'short_description' THEN v_source_text := v_item.short_description ->> v_source_lang;
      WHEN 'content_brief' THEN v_source_text := v_item.content_brief ->> v_source_lang;
      WHEN 'content_standard' THEN v_source_text := v_item.content_standard ->> v_source_lang;
      WHEN 'content_detailed' THEN v_source_text := v_item.content_detailed ->> v_source_lang;
      WHEN 'content_children' THEN v_source_text := v_item.content_children ->> v_source_lang;
      WHEN 'content_youth' THEN v_source_text := v_item.content_youth ->> v_source_lang;
      WHEN 'content_fun_facts' THEN v_source_text := v_item.content_fun_facts ->> v_source_lang;
      WHEN 'content_historical' THEN v_source_text := v_item.content_historical ->> v_source_lang;
      WHEN 'content_technique' THEN v_source_text := v_item.content_technique ->> v_source_lang;
      ELSE v_source_text := NULL;
    END CASE;

    IF v_source_text IS NULL OR v_source_text = '' THEN CONTINUE; END IF;

    FOREACH v_target_lang IN ARRAY p_target_languages LOOP
      IF v_target_lang = v_source_lang THEN CONTINUE; END IF;

      -- Skip if already translated
      IF EXISTS (
        SELECT 1 FROM fw_content_translations
        WHERE content_id = p_content_id AND field_name = v_field AND target_language = v_target_lang
      ) THEN CONTINUE; END IF;

      -- Skip if already queued
      IF EXISTS (
        SELECT 1 FROM fw_translation_queue
        WHERE content_id = p_content_id AND field_name = v_field AND target_language = v_target_lang
        AND status IN ('queued', 'processing')
      ) THEN CONTINUE; END IF;

      INSERT INTO fw_translation_queue (content_id, field_name, source_language, target_language, source_text, priority)
      VALUES (p_content_id, v_field, v_source_lang, v_target_lang, v_source_text, p_priority);

      v_queued := v_queued + 1;
    END LOOP;
  END LOOP;

  RETURN v_queued;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. HELPER: Batch-translate all published content for a parent
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_queue_all_translations(
  p_parent_type TEXT,
  p_parent_id UUID,
  p_target_languages TEXT[],
  p_priority INTEGER DEFAULT 7
)
RETURNS INTEGER AS $$
DECLARE
  v_content_id UUID;
  v_total INTEGER := 0;
  v_queued INTEGER;
BEGIN
  FOR v_content_id IN
    SELECT id FROM fw_content_items
    WHERE parent_type = p_parent_type AND parent_id = p_parent_id
    AND status = 'published'
  LOOP
    v_queued := fw_queue_translations(v_content_id, p_target_languages, p_priority);
    v_total := v_total + v_queued;
  END LOOP;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
