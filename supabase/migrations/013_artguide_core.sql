-- Fintutto Art Guide: Core Schema
-- Museums, Venues, Floors, Rooms, Artworks, Tours, Categories
-- Prefix: ag_ (Art Guide)

-- ============================================================================
-- 1. MUSEUMS (the organization/client)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_museums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,                      -- URL-friendly identifier
  description JSONB DEFAULT '{}',                 -- { "de": "...", "en": "...", ... }
  logo_url TEXT,
  cover_image_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',                     -- { street, city, zip, country, lat, lng }
  opening_hours JSONB DEFAULT '{}',               -- { mon: { open: "09:00", close: "18:00" }, ... }
  tier_id TEXT NOT NULL DEFAULT 'artguide_starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  default_language TEXT NOT NULL DEFAULT 'de',
  supported_languages TEXT[] DEFAULT '{de,en}',
  positioning_mode TEXT DEFAULT 'manual',          -- manual, qr, ble, wifi, gps
  branding JSONB DEFAULT '{}',                     -- { primaryColor, accentColor, fontFamily, ... }
  white_label_config JSONB,                        -- null = standard, else { appName, bundleId, ... }
  settings JSONB DEFAULT '{}',                     -- extensible settings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_museums_slug ON ag_museums(slug);

-- ============================================================================
-- 2. VENUES (physical locations - a museum can have multiple)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  name JSONB NOT NULL DEFAULT '{}',               -- multilingual
  description JSONB DEFAULT '{}',
  venue_type TEXT NOT NULL DEFAULT 'indoor',       -- indoor, outdoor, mixed
  address JSONB DEFAULT '{}',
  -- For outdoor venues: bounding box / center point
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  bounds JSONB,                                    -- GeoJSON polygon for outdoor area
  map_style_url TEXT,                              -- Mapbox style URL for custom maps
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_venues_museum ON ag_venues(museum_id);

-- ============================================================================
-- 3. FLOORS (for indoor venues)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES ag_venues(id) ON DELETE CASCADE,
  name JSONB NOT NULL DEFAULT '{}',               -- { "de": "Erdgeschoss", "en": "Ground Floor" }
  floor_number INTEGER DEFAULT 0,                 -- -1 = basement, 0 = ground, 1 = first, ...
  floorplan_url TEXT,                              -- uploaded floorplan image
  floorplan_width INTEGER,                         -- pixel dimensions for coordinate mapping
  floorplan_height INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_floors_venue ON ag_floors(venue_id);

-- ============================================================================
-- 4. ROOMS (subdivisions of a floor)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID REFERENCES ag_floors(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES ag_venues(id) ON DELETE CASCADE,
  name JSONB NOT NULL DEFAULT '{}',
  description JSONB DEFAULT '{}',
  -- Position on floorplan (percentage-based for responsiveness)
  floorplan_x NUMERIC,                            -- 0-100 percentage
  floorplan_y NUMERIC,
  floorplan_polygon JSONB,                         -- outline on floorplan [{x,y}, ...]
  -- For outdoor: GPS polygon
  gps_polygon JSONB,                               -- GeoJSON polygon
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_rooms_floor ON ag_rooms(floor_id);
CREATE INDEX idx_ag_rooms_venue ON ag_rooms(venue_id);

-- ============================================================================
-- 5. ARTWORKS (the core content)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  room_id UUID REFERENCES ag_rooms(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES ag_venues(id) ON DELETE SET NULL,

  -- Identification
  inventory_number TEXT,                           -- museum's internal ID
  title JSONB NOT NULL DEFAULT '{}',              -- multilingual
  artist_name TEXT,
  artist_birth_year INTEGER,
  artist_death_year INTEGER,
  year_created TEXT,                               -- "1889" or "ca. 1500" or "15. Jh."
  medium TEXT,                                     -- "Oel auf Leinwand", "Bronze", ...
  dimensions TEXT,                                 -- "73.7 cm x 92.1 cm"
  style TEXT,                                      -- "Impressionismus", "Barock", ...
  epoch TEXT,                                      -- "Renaissance", "Moderne", ...
  origin TEXT,                                     -- "Frankreich", "Japan", ...

  -- Position
  position_on_floorplan JSONB,                     -- { x: 45.2, y: 67.8 } percentage on floorplan
  position_gps JSONB,                              -- { lat, lng } for outdoor
  position_description JSONB DEFAULT '{}',         -- { "de": "Wand links, 2. von rechts" }

  -- Content (multilingual, structured by depth level)
  description_brief JSONB DEFAULT '{}',            -- 1-2 sentences, all ages
  description_standard JSONB DEFAULT '{}',         -- standard museum text
  description_detailed JSONB DEFAULT '{}',         -- deep dive for experts
  description_children JSONB DEFAULT '{}',         -- age 6-12
  description_youth JSONB DEFAULT '{}',            -- age 13-17
  fun_facts JSONB DEFAULT '{}',                    -- interesting tidbits
  historical_context JSONB DEFAULT '{}',           -- era/historical background
  technique_details JSONB DEFAULT '{}',            -- technique/materials deep dive

  -- AI generation
  ai_generated_at TIMESTAMPTZ,                     -- when AI texts were last generated
  ai_base_knowledge JSONB,                         -- museum-provided facts for AI grounding

  -- QR / NFC
  qr_code TEXT UNIQUE,                             -- unique QR identifier
  nfc_tag_id TEXT UNIQUE,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft',            -- draft, review, published, archived
  is_highlight BOOLEAN DEFAULT false,              -- featured artwork
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  categories UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_artworks_museum ON ag_artworks(museum_id);
CREATE INDEX idx_ag_artworks_room ON ag_artworks(room_id);
CREATE INDEX idx_ag_artworks_status ON ag_artworks(status);
CREATE INDEX idx_ag_artworks_qr ON ag_artworks(qr_code);
CREATE INDEX idx_ag_artworks_tags ON ag_artworks USING GIN(tags);

-- ============================================================================
-- 6. ARTWORK MEDIA (images, videos, 3D models)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_artwork_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES ag_artworks(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image',        -- image, video, audio, model_3d
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption JSONB DEFAULT '{}',                      -- multilingual
  alt_text JSONB DEFAULT '{}',                     -- accessibility, multilingual
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_media_artwork ON ag_artwork_media(artwork_id);

-- ============================================================================
-- 7. CATEGORIES / TAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES ag_categories(id) ON DELETE SET NULL,
  name JSONB NOT NULL DEFAULT '{}',               -- multilingual
  slug TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_categories_museum ON ag_categories(museum_id);
CREATE UNIQUE INDEX idx_ag_categories_slug ON ag_categories(museum_id, slug);

-- ============================================================================
-- 8. TOURS (curated paths through the museum)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  title JSONB NOT NULL DEFAULT '{}',              -- multilingual
  description JSONB DEFAULT '{}',
  cover_image_url TEXT,
  tour_type TEXT NOT NULL DEFAULT 'curated',       -- curated, ai_generated, thematic
  target_audience TEXT DEFAULT 'general',           -- general, children, youth, expert, accessibility
  estimated_duration_minutes INTEGER DEFAULT 60,
  difficulty_level TEXT DEFAULT 'standard',         -- quick, standard, deep_dive
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_tours_museum ON ag_tours(museum_id);

-- ============================================================================
-- 9. TOUR STOPS (ordered artworks in a tour)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_tour_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES ag_tours(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES ag_artworks(id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL,
  transition_text JSONB DEFAULT '{}',              -- "Gehen Sie nun zum naechsten Raum..."
  custom_narration JSONB DEFAULT '{}',             -- override default artwork text for this tour
  duration_seconds INTEGER DEFAULT 120,            -- suggested time at this stop
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_tour_stops_tour ON ag_tour_stops(tour_id);
CREATE UNIQUE INDEX idx_ag_tour_stops_order ON ag_tour_stops(tour_id, stop_number);

-- ============================================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ag_museums ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_artwork_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_tour_stops ENABLE ROW LEVEL SECURITY;

-- Public read access for published content (visitors can browse)
CREATE POLICY "Public read published artworks" ON ag_artworks
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read active museums" ON ag_museums
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active venues" ON ag_venues
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active floors" ON ag_floors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active rooms" ON ag_rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read artwork media" ON ag_artwork_media
  FOR SELECT USING (
    artwork_id IN (SELECT id FROM ag_artworks WHERE status = 'published')
  );

CREATE POLICY "Public read categories" ON ag_categories
  FOR SELECT USING (true);

CREATE POLICY "Public read published tours" ON ag_tours
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read tour stops" ON ag_tour_stops
  FOR SELECT USING (
    tour_id IN (SELECT id FROM ag_tours WHERE status = 'published')
  );

-- Museum staff full access (managed via ag_museum_users in migration 014)
-- For now: system admins get full access
CREATE POLICY "Admin full access ag_museums" ON ag_museums
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access ag_artworks" ON ag_artworks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access ag_venues" ON ag_venues
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access ag_floors" ON ag_floors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access ag_rooms" ON ag_rooms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access ag_artwork_media" ON ag_artwork_media
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access ag_categories" ON ag_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access ag_tours" ON ag_tours
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access ag_tour_stops" ON ag_tour_stops
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 11. TRIGGERS
-- ============================================================================

CREATE TRIGGER ag_museums_updated_at
  BEFORE UPDATE ON ag_museums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ag_venues_updated_at
  BEFORE UPDATE ON ag_venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ag_artworks_updated_at
  BEFORE UPDATE ON ag_artworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ag_tours_updated_at
  BEFORE UPDATE ON ag_tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
