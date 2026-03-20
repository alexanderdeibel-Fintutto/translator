-- Fintutto Art Guide: Positioning & Indoor Navigation
-- BLE Beacons, WiFi Fingerprinting, GPS Geofencing

-- ============================================================================
-- 1. BLE BEACONS (iBeacon / Eddystone)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES ag_venues(id) ON DELETE CASCADE,
  room_id UUID REFERENCES ag_rooms(id) ON DELETE SET NULL,

  -- iBeacon identifiers
  beacon_uuid TEXT NOT NULL,                       -- proximity UUID
  major INTEGER NOT NULL,                          -- major value (typically = venue)
  minor INTEGER NOT NULL,                          -- minor value (typically = room/zone)

  -- Eddystone (optional, for web-based detection)
  eddystone_namespace TEXT,
  eddystone_instance TEXT,

  -- Physical placement
  label TEXT,                                      -- human-readable name "Raum 3 - Eingang"
  position_x NUMERIC,                             -- position on floorplan (percentage)
  position_y NUMERIC,
  position_lat DOUBLE PRECISION,                   -- GPS fallback for outdoor beacons
  position_lng DOUBLE PRECISION,
  floor_id UUID REFERENCES ag_floors(id) ON DELETE SET NULL,

  -- Calibration
  tx_power INTEGER DEFAULT -59,                    -- measured power at 1m (dBm)
  signal_threshold INTEGER DEFAULT -80,            -- RSSI threshold for "nearby"

  -- Status
  battery_level INTEGER,                           -- 0-100, updated via maintenance
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  hardware_model TEXT,                             -- "Kontakt.io Smart Beacon", "Estimote Proximity", ...
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(museum_id, beacon_uuid, major, minor)
);

CREATE INDEX idx_ag_beacons_museum ON ag_beacons(museum_id);
CREATE INDEX idx_ag_beacons_venue ON ag_beacons(venue_id);
CREATE INDEX idx_ag_beacons_room ON ag_beacons(room_id);
CREATE INDEX idx_ag_beacons_uuid ON ag_beacons(beacon_uuid, major, minor);

-- ============================================================================
-- 2. WIFI FINGERPRINTS (for indoor positioning without beacons)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_wifi_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES ag_venues(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES ag_rooms(id) ON DELETE CASCADE,
  floor_id UUID REFERENCES ag_floors(id) ON DELETE SET NULL,

  -- Fingerprint data: array of { bssid, ssid, rssi } readings
  -- Multiple samples per room for better accuracy
  fingerprint JSONB NOT NULL,                      -- [{ bssid: "AA:BB:CC:...", rssi: -45 }, ...]
  sample_point JSONB,                              -- { x, y } on floorplan where sample was taken

  -- Calibration metadata
  collected_by UUID REFERENCES auth.users(id),
  collected_at TIMESTAMPTZ DEFAULT now(),
  device_info TEXT,                                -- "iPhone 15 Pro", "Pixel 8", ...

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_wifi_museum ON ag_wifi_fingerprints(museum_id);
CREATE INDEX idx_ag_wifi_room ON ag_wifi_fingerprints(room_id);

-- ============================================================================
-- 3. GPS ZONES (for outdoor venues / nature parks / open-air museums)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_gps_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES ag_venues(id) ON DELETE CASCADE,
  room_id UUID REFERENCES ag_rooms(id) ON DELETE SET NULL,

  -- Zone definition
  name JSONB NOT NULL DEFAULT '{}',               -- multilingual
  zone_type TEXT NOT NULL DEFAULT 'area',           -- area, point, path
  -- GeoJSON geometry (Polygon for areas, Point for POIs, LineString for paths)
  geometry JSONB NOT NULL,
  -- Simplified trigger: radius around center point (meters)
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  trigger_radius_meters INTEGER DEFAULT 20,        -- geofence trigger distance

  -- What happens when visitor enters this zone
  trigger_artwork_id UUID REFERENCES ag_artworks(id) ON DELETE SET NULL,
  trigger_action TEXT DEFAULT 'notify',             -- notify, auto_play, show_info
  notification_text JSONB DEFAULT '{}',            -- multilingual notification

  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_gps_zones_museum ON ag_gps_zones(museum_id);
CREATE INDEX idx_ag_gps_zones_venue ON ag_gps_zones(venue_id);

-- ============================================================================
-- 4. POSITIONING CONFIG (per venue settings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_positioning_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES ag_venues(id) ON DELETE CASCADE UNIQUE,

  -- Which positioning methods are enabled
  methods_enabled TEXT[] DEFAULT '{manual}',        -- manual, qr, ble, wifi, gps
  primary_method TEXT DEFAULT 'manual',

  -- BLE settings
  ble_scan_interval_ms INTEGER DEFAULT 2000,       -- how often to scan
  ble_smoothing_window INTEGER DEFAULT 5,          -- RSSI averaging window
  ble_min_beacons_for_triangulation INTEGER DEFAULT 3,

  -- WiFi settings
  wifi_scan_interval_ms INTEGER DEFAULT 5000,
  wifi_min_fingerprint_match NUMERIC DEFAULT 0.7,  -- minimum similarity score

  -- GPS settings
  gps_accuracy_threshold_meters INTEGER DEFAULT 15,
  gps_update_interval_ms INTEGER DEFAULT 3000,

  -- General
  auto_trigger_enabled BOOLEAN DEFAULT true,       -- auto-play audio when near artwork
  proximity_threshold_meters NUMERIC DEFAULT 3.0,  -- how close = "at artwork"

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE ag_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_wifi_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_gps_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_positioning_config ENABLE ROW LEVEL SECURITY;

-- Public read for positioning data (visitors need this for navigation)
CREATE POLICY "Public read active beacons" ON ag_beacons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read gps zones" ON ag_gps_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read positioning config" ON ag_positioning_config
  FOR SELECT USING (true);

-- WiFi fingerprints are read by the app for matching (no sensitive data)
CREATE POLICY "Public read wifi fingerprints" ON ag_wifi_fingerprints
  FOR SELECT USING (true);

-- Museum staff manage positioning
CREATE POLICY "Museum staff manage beacons" ON ag_beacons
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

CREATE POLICY "Museum staff manage wifi" ON ag_wifi_fingerprints
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

CREATE POLICY "Museum staff manage gps zones" ON ag_gps_zones
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

CREATE POLICY "Museum staff manage positioning config" ON ag_positioning_config
  FOR ALL USING (
    venue_id IN (
      SELECT v.id FROM ag_venues v
      WHERE v.museum_id IN (
        SELECT mu.museum_id FROM ag_museum_users mu
        WHERE mu.user_id = auth.uid() AND mu.is_active = true
      )
    )
  );

-- System admin full access
CREATE POLICY "Admin full access beacons" ON ag_beacons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access wifi" ON ag_wifi_fingerprints
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access gps zones" ON ag_gps_zones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access positioning config" ON ag_positioning_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

CREATE TRIGGER ag_beacons_updated_at
  BEFORE UPDATE ON ag_beacons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ag_gps_zones_updated_at
  BEFORE UPDATE ON ag_gps_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ag_positioning_config_updated_at
  BEFORE UPDATE ON ag_positioning_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
