-- City Guide & Region Guide: Core Schema
-- Extends the Art Guide model for tourism: Cities, Regions, POIs, Partners, Offers, Bookings
-- Prefix: cg_ (City Guide)

-- ============================================================================
-- 1. CITIES (the main entity — a city/town that buys the platform)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB DEFAULT '{}',                 -- multilingual { "de": "...", "en": "..." }
  logo_url TEXT,
  cover_image_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',                     -- { street, city, zip, country }
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  bounds JSONB,                                   -- GeoJSON bounding box
  population INTEGER,
  timezone TEXT DEFAULT 'Europe/Berlin',
  default_language TEXT NOT NULL DEFAULT 'de',
  supported_languages TEXT[] DEFAULT '{de,en}',
  -- Subscription & billing
  tier_id TEXT NOT NULL DEFAULT 'cityguide_starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  -- Branding / White-label
  branding JSONB DEFAULT '{}',                    -- { primaryColor, accentColor, fontFamily, logo }
  white_label_config JSONB,                       -- { appName, bundleId, splashScreen, ... }
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_cities_slug ON cg_cities(slug);

-- ============================================================================
-- 2. REGIONS (a region can group multiple cities)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB DEFAULT '{}',
  logo_url TEXT,
  cover_image_url TEXT,
  website TEXT,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  bounds JSONB,                                   -- GeoJSON polygon
  default_language TEXT NOT NULL DEFAULT 'de',
  supported_languages TEXT[] DEFAULT '{de,en}',
  tier_id TEXT NOT NULL DEFAULT 'regionguide_starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  branding JSONB DEFAULT '{}',
  white_label_config JSONB,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_regions_slug ON cg_regions(slug);

-- Link cities to regions (many-to-many)
CREATE TABLE IF NOT EXISTS cg_region_cities (
  region_id UUID NOT NULL REFERENCES cg_regions(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cg_cities(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (region_id, city_id)
);

-- ============================================================================
-- 3. POI CATEGORIES (Sehenswuerdigkeiten, Restaurants, Shops, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_poi_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,
  region_id UUID REFERENCES cg_regions(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES cg_poi_categories(id) ON DELETE SET NULL,
  name JSONB NOT NULL DEFAULT '{}',               -- multilingual
  slug TEXT NOT NULL,
  icon TEXT,                                      -- lucide icon name or emoji
  color TEXT,
  category_type TEXT NOT NULL DEFAULT 'attraction',
  -- Types: attraction, restaurant, hotel, shop, service, nightlife, culture, sport, nature, transport
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_poi_categories_city ON cg_poi_categories(city_id);
CREATE INDEX idx_cg_poi_categories_region ON cg_poi_categories(region_id);

-- ============================================================================
-- 4. POINTS OF INTEREST (POIs) — Sights, Landmarks, any place worth visiting
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,
  region_id UUID REFERENCES cg_regions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES cg_poi_categories(id) ON DELETE SET NULL,
  partner_id UUID,                                -- links to cg_partners(id), FK added in migration 018
  name JSONB NOT NULL DEFAULT '{}',               -- multilingual
  slug TEXT NOT NULL,
  description JSONB DEFAULT '{}',                 -- multilingual, rich text
  short_description JSONB DEFAULT '{}',           -- multilingual, max 200 chars
  address JSONB DEFAULT '{}',                     -- { street, city, zip, country }
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  cover_image_url TEXT,
  gallery JSONB DEFAULT '[]',                     -- array of image URLs
  opening_hours JSONB DEFAULT '{}',               -- { mon: { open, close }, ... }
  contact JSONB DEFAULT '{}',                     -- { phone, email, website }
  tags TEXT[] DEFAULT '{}',
  -- Audio guide support (like Art Guide)
  audio_url JSONB DEFAULT '{}',                   -- multilingual { "de": "url", "en": "url" }
  audio_duration_seconds INTEGER,
  -- AI content
  ai_narration JSONB DEFAULT '{}',                -- AI-generated descriptions per language
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',           -- draft, review, published, archived
  is_featured BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT true,
  admission_price JSONB DEFAULT '{}',             -- { adult: 12.00, child: 6.00, ... }
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_pois_city ON cg_pois(city_id);
CREATE INDEX idx_cg_pois_region ON cg_pois(region_id);
CREATE INDEX idx_cg_pois_category ON cg_pois(category_id);
CREATE INDEX idx_cg_pois_partner ON cg_pois(partner_id);
CREATE INDEX idx_cg_pois_location ON cg_pois(lat, lng);
CREATE INDEX idx_cg_pois_tags ON cg_pois USING GIN(tags);

-- ============================================================================
-- 5. TOURS (curated city/region tours)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,
  region_id UUID REFERENCES cg_regions(id) ON DELETE CASCADE,
  title JSONB NOT NULL DEFAULT '{}',
  description JSONB DEFAULT '{}',
  cover_image_url TEXT,
  tour_type TEXT NOT NULL DEFAULT 'curated',       -- curated, ai_generated, thematic, partner_sponsored
  target_audience TEXT DEFAULT 'general',
  estimated_duration_minutes INTEGER DEFAULT 120,
  distance_km NUMERIC,
  difficulty_level TEXT DEFAULT 'standard',         -- easy, standard, challenging
  transport_mode TEXT DEFAULT 'walking',            -- walking, cycling, driving, public_transit
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_tours_city ON cg_tours(city_id);
CREATE INDEX idx_cg_tours_region ON cg_tours(region_id);

-- Tour stops reference POIs
CREATE TABLE IF NOT EXISTS cg_tour_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES cg_tours(id) ON DELETE CASCADE,
  poi_id UUID NOT NULL REFERENCES cg_pois(id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL,
  transition_text JSONB DEFAULT '{}',
  custom_narration JSONB DEFAULT '{}',
  duration_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_tour_stops_tour ON cg_tour_stops(tour_id);

-- ============================================================================
-- 6. CITY/REGION CMS USERS (staff who manage content)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,
  region_id UUID REFERENCES cg_regions(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor',             -- admin, editor, viewer, partner_manager
  display_name TEXT,
  invited_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cg_staff_scope CHECK (city_id IS NOT NULL OR region_id IS NOT NULL)
);

CREATE INDEX idx_cg_staff_user ON cg_staff(user_id);
CREATE INDEX idx_cg_staff_city ON cg_staff(city_id);
CREATE INDEX idx_cg_staff_region ON cg_staff(region_id);

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE cg_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_region_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_poi_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_tour_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_staff ENABLE ROW LEVEL SECURITY;

-- Public read for active/published content
CREATE POLICY "Public read active cities" ON cg_cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active regions" ON cg_regions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read region cities" ON cg_region_cities
  FOR SELECT USING (true);

CREATE POLICY "Public read active poi categories" ON cg_poi_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read published pois" ON cg_pois
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read published tours" ON cg_tours
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read tour stops" ON cg_tour_stops
  FOR SELECT USING (
    tour_id IN (SELECT id FROM cg_tours WHERE status = 'published')
  );

-- Staff access: CMS users can manage their city/region content
CREATE POLICY "Staff manage cities" ON cg_cities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cg_staff WHERE user_id = auth.uid() AND city_id = cg_cities.id AND role IN ('admin'))
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff manage regions" ON cg_regions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cg_staff WHERE user_id = auth.uid() AND region_id = cg_regions.id AND role IN ('admin'))
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff manage pois" ON cg_pois
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cg_staff WHERE user_id = auth.uid() AND (city_id = cg_pois.city_id OR region_id = cg_pois.region_id) AND role IN ('admin', 'editor'))
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff manage tours" ON cg_tours
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cg_staff WHERE user_id = auth.uid() AND (city_id = cg_tours.city_id OR region_id = cg_tours.region_id) AND role IN ('admin', 'editor'))
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff manage poi categories" ON cg_poi_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cg_staff WHERE user_id = auth.uid() AND (city_id = cg_poi_categories.city_id OR region_id = cg_poi_categories.region_id) AND role IN ('admin', 'editor'))
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff manage tour stops" ON cg_tour_stops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cg_tours t
      JOIN cg_staff s ON s.user_id = auth.uid() AND (s.city_id = t.city_id OR s.region_id = t.region_id) AND s.role IN ('admin', 'editor')
      WHERE t.id = cg_tour_stops.tour_id
    )
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Staff read own staff records" ON cg_staff
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin full access
CREATE POLICY "Admin full access cg_staff" ON cg_staff
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access cg_region_cities" ON cg_region_cities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

CREATE TRIGGER cg_cities_updated_at
  BEFORE UPDATE ON cg_cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cg_regions_updated_at
  BEFORE UPDATE ON cg_regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cg_pois_updated_at
  BEFORE UPDATE ON cg_pois
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cg_tours_updated_at
  BEFORE UPDATE ON cg_tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
