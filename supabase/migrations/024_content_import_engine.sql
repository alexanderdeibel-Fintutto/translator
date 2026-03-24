-- ============================================================================
-- 024: Content Import Engine
-- Zero-friction content pipeline for bulk onboarding of museums, cities,
-- conferences, fairs, and regions.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Import Jobs — tracks each bulk import session
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ag_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID REFERENCES ag_museums(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Source
  source_type TEXT NOT NULL CHECK (source_type IN (
    'csv', 'excel', 'pdf', 'url', 'api', 'google_places', 'osm', 'manual'
  )),
  source_url TEXT,
  source_files JSONB DEFAULT '[]'::jsonb,
  -- [{name, storage_path, size_bytes, mime_type, uploaded_at}]

  -- Target
  target_type TEXT NOT NULL CHECK (target_type IN (
    'artworks', 'pois', 'partners', 'tours', 'sessions', 'exhibitors', 'speakers'
  )),
  import_mode TEXT NOT NULL DEFAULT 'museum' CHECK (import_mode IN (
    'museum', 'city', 'conference', 'fair', 'region'
  )),

  -- Status
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN (
    'uploaded', 'analyzing', 'mapping', 'enriching', 'review', 'importing', 'completed', 'failed', 'cancelled'
  )),

  -- AI analysis results
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  -- {detected_items, detected_type, confidence, detected_columns, sample_rows, suggestions}

  -- Field mapping (source column → target field)
  field_mapping JSONB DEFAULT '{}'::jsonb,

  -- Enrichment configuration
  enrichment_config JSONB DEFAULT '{
    "generate_descriptions": true,
    "description_levels": ["brief", "standard", "detailed", "children", "youth"],
    "languages": ["de", "en"],
    "generate_audio": false,
    "generate_fun_facts": true,
    "generate_historical_context": true,
    "auto_categorize": true,
    "fetch_external_data": true
  }'::jsonb,

  -- Progress
  items_total INTEGER DEFAULT 0,
  items_analyzed INTEGER DEFAULT 0,
  items_enriched INTEGER DEFAULT 0,
  items_approved INTEGER DEFAULT 0,
  items_imported INTEGER DEFAULT 0,
  items_rejected INTEGER DEFAULT 0,

  -- Error tracking
  error_log JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMPTZ,
  enriched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- At least one parent must be set
  CONSTRAINT import_job_has_parent CHECK (museum_id IS NOT NULL OR city_id IS NOT NULL)
);

-- ---------------------------------------------------------------------------
-- 2. Import Items — individual records within a job
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ag_import_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES ag_import_jobs(id) ON DELETE CASCADE,
  row_number INTEGER,

  -- Data lifecycle
  source_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  mapped_data JSONB DEFAULT '{}'::jsonb,
  enriched_data JSONB DEFAULT '{}'::jsonb,

  -- AI-generated content per field
  ai_generated JSONB DEFAULT '{}'::jsonb,
  -- {description_brief: {de: "...", en: "..."}, description_standard: {...}, ...}

  -- After import: reference to created entity
  target_entity_type TEXT,
  target_entity_id UUID,

  -- Review
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'analyzed', 'enriched', 'approved', 'rejected', 'imported', 'error'
  )),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  -- Quality score from AI
  quality_score NUMERIC(3,2),
  quality_issues JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. AI Content Queue — async processing of generation tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ag_ai_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What to process
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'artwork', 'poi', 'partner', 'tour', 'session', 'exhibitor', 'speaker', 'import_item'
  )),
  entity_id UUID NOT NULL,
  job_id UUID REFERENCES ag_import_jobs(id) ON DELETE CASCADE,

  -- Action
  action TEXT NOT NULL CHECK (action IN (
    'generate_descriptions', 'translate', 'generate_audio',
    'categorize', 'extract_metadata', 'enrich_external',
    'generate_tour', 'generate_fun_facts'
  )),
  config JSONB DEFAULT '{}'::jsonb,

  -- Scheduling
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'processing', 'completed', 'failed', 'cancelled'
  )),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,

  -- Results
  result JSONB,
  error TEXT,
  tokens_used INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- 4. Import Templates — reusable field mappings per source format
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ag_import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID REFERENCES ag_museums(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  import_mode TEXT NOT NULL CHECK (import_mode IN (
    'museum', 'city', 'conference', 'fair', 'region'
  )),
  target_type TEXT NOT NULL,
  field_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  enrichment_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_system_template BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 5. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_import_jobs_museum ON ag_import_jobs(museum_id) WHERE museum_id IS NOT NULL;
CREATE INDEX idx_import_jobs_city ON ag_import_jobs(city_id) WHERE city_id IS NOT NULL;
CREATE INDEX idx_import_jobs_status ON ag_import_jobs(status);
CREATE INDEX idx_import_jobs_created ON ag_import_jobs(created_at DESC);

CREATE INDEX idx_import_items_job ON ag_import_items(job_id);
CREATE INDEX idx_import_items_status ON ag_import_items(status);
CREATE INDEX idx_import_items_job_status ON ag_import_items(job_id, status);

CREATE INDEX idx_ai_queue_status ON ag_ai_queue(status, priority DESC, created_at);
CREATE INDEX idx_ai_queue_job ON ag_ai_queue(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_ai_queue_entity ON ag_ai_queue(entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE ag_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_import_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_ai_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_import_templates ENABLE ROW LEVEL SECURITY;

-- Museum staff can manage their museum's imports
CREATE POLICY "Museum staff can manage imports" ON ag_import_jobs
  FOR ALL USING (
    museum_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM ag_museum_users mu
      WHERE mu.museum_id = ag_import_jobs.museum_id
        AND mu.user_id = auth.uid()
        AND mu.is_active = true
    )
  );

-- System admins have full access
CREATE POLICY "System admins full access on import_jobs" ON ag_import_jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their job items" ON ag_import_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ag_import_jobs j
      JOIN ag_museum_users mu ON mu.museum_id = j.museum_id
      WHERE j.id = ag_import_items.job_id
        AND mu.user_id = auth.uid()
        AND mu.is_active = true
    )
  );

CREATE POLICY "System admins full access on import_items" ON ag_import_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their ai queue" ON ag_ai_queue
  FOR ALL USING (
    job_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM ag_import_jobs j
      JOIN ag_museum_users mu ON mu.museum_id = j.museum_id
      WHERE j.id = ag_ai_queue.job_id
        AND mu.user_id = auth.uid()
        AND mu.is_active = true
    )
  );

CREATE POLICY "System admins full access on ai_queue" ON ag_ai_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can manage their templates" ON ag_import_templates
  FOR SELECT USING (
    is_system_template = true
    OR (museum_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM ag_museum_users mu
      WHERE mu.museum_id = ag_import_templates.museum_id
        AND mu.user_id = auth.uid()
        AND mu.is_active = true
    ))
  );

CREATE POLICY "System admins full access on templates" ON ag_import_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- 7. Helper function: get import job progress
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ag_import_job_progress(p_job_id UUID)
RETURNS JSONB
LANGUAGE sql STABLE
AS $$
  SELECT jsonb_build_object(
    'total', j.items_total,
    'analyzed', j.items_analyzed,
    'enriched', j.items_enriched,
    'approved', j.items_approved,
    'imported', j.items_imported,
    'rejected', j.items_rejected,
    'pending', j.items_total - j.items_approved - j.items_rejected,
    'percent_complete', CASE WHEN j.items_total > 0
      THEN round((j.items_imported::numeric / j.items_total) * 100, 1)
      ELSE 0 END,
    'status', j.status
  )
  FROM ag_import_jobs j
  WHERE j.id = p_job_id;
$$;

-- ---------------------------------------------------------------------------
-- 8. Trigger: auto-update updated_at on import_items
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ag_update_import_item_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_import_items_updated
  BEFORE UPDATE ON ag_import_items
  FOR EACH ROW
  EXECUTE FUNCTION ag_update_import_item_timestamp();

-- ---------------------------------------------------------------------------
-- 9. Insert system templates for common import formats
-- ---------------------------------------------------------------------------
INSERT INTO ag_import_templates (name, description, import_mode, target_type, field_mapping, enrichment_config, is_system_template)
VALUES
  (
    'Museum Werksliste (Standard CSV)',
    'Standard-Import fuer Kunstwerke aus CSV/Excel mit Inventarnummer, Titel, Kuenstler',
    'museum', 'artworks',
    '{"inventory_number": "inventarnummer", "title": "titel", "artist_name": "kuenstler", "year_created": "jahr", "medium": "technik", "dimensions": "masse", "room": "raum", "style": "stil", "epoch": "epoche"}'::jsonb,
    '{"generate_descriptions": true, "description_levels": ["brief", "standard", "detailed", "children", "youth"], "languages": ["de", "en"], "generate_fun_facts": true, "generate_historical_context": true, "auto_categorize": true}'::jsonb,
    true
  ),
  (
    'Stadt POIs (Google Places)',
    'Automatischer Import von Points of Interest aus Google Places API',
    'city', 'pois',
    '{"name": "name", "address": "formatted_address", "lat": "geometry.location.lat", "lng": "geometry.location.lng", "category": "types[0]", "rating": "rating", "phone": "formatted_phone_number", "website": "website", "opening_hours": "opening_hours.weekday_text"}'::jsonb,
    '{"generate_descriptions": true, "description_levels": ["brief", "standard"], "languages": ["de", "en", "fr", "it"], "auto_categorize": true, "fetch_external_data": true}'::jsonb,
    true
  ),
  (
    'Konferenz Programm (Standard)',
    'Import von Sessions, Speakern und Raeumen aus Konferenz-Programm',
    'conference', 'sessions',
    '{"title": "titel", "speaker": "referent", "room": "raum", "date": "datum", "start_time": "beginn", "end_time": "ende", "track": "track", "description": "beschreibung", "level": "niveau"}'::jsonb,
    '{"generate_descriptions": true, "description_levels": ["brief", "standard"], "languages": ["de", "en"], "generate_audio": false}'::jsonb,
    true
  ),
  (
    'Messe Ausstellerverzeichnis',
    'Import von Ausstellern mit Standnummer, Halle, Produktkategorien',
    'fair', 'exhibitors',
    '{"company_name": "firma", "booth_number": "standnummer", "hall": "halle", "category": "branche", "products": "produkte", "website": "website", "contact_name": "ansprechpartner", "email": "email", "phone": "telefon"}'::jsonb,
    '{"generate_descriptions": true, "description_levels": ["brief", "standard"], "languages": ["de", "en"], "auto_categorize": true}'::jsonb,
    true
  );
