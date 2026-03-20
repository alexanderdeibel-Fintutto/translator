-- Fintutto Art Guide: CMS Roles, Workflow & Audit
-- Museum staff management with granular permissions

-- ============================================================================
-- 1. MUSEUM ROLES (predefined role templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_museum_roles (
  id TEXT PRIMARY KEY,                             -- 'admin', 'redakteur', 'rechercheur', 'fotograf', 'buchhaltung'
  name JSONB NOT NULL DEFAULT '{}',               -- { "de": "Redakteur", "en": "Editor" }
  description JSONB DEFAULT '{}',
  permissions JSONB NOT NULL DEFAULT '[]',         -- ["artworks.write", "media.write", ...]
  is_system BOOLEAN DEFAULT true,                  -- system roles can't be deleted
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default roles
INSERT INTO ag_museum_roles (id, name, description, permissions, is_system) VALUES
  ('museum_admin', '{"de": "Administrator", "en": "Administrator"}',
   '{"de": "Voller Zugriff auf alle Bereiche", "en": "Full access to all areas"}',
   '["*"]', true),

  ('redakteur', '{"de": "Redakteur", "en": "Editor"}',
   '{"de": "Inhalte erstellen, bearbeiten und freigeben", "en": "Create, edit and publish content"}',
   '["artworks.read", "artworks.write", "artworks.publish", "tours.read", "tours.write", "tours.publish", "media.read", "media.write", "categories.read", "categories.write", "ai.generate", "analytics.read"]',
   true),

  ('rechercheur', '{"de": "Rechercheur", "en": "Researcher"}',
   '{"de": "Inhalte recherchieren und zur Review einreichen", "en": "Research content and submit for review"}',
   '["artworks.read", "artworks.write", "tours.read", "media.read", "media.write", "categories.read", "ai.generate"]',
   true),

  ('fotograf', '{"de": "Fotograf", "en": "Photographer"}',
   '{"de": "Fotos und Medien verwalten", "en": "Manage photos and media"}',
   '["artworks.read", "media.read", "media.write", "media.delete"]',
   true),

  ('buchhaltung', '{"de": "Buchhaltung", "en": "Accounting"}',
   '{"de": "Abrechnung und Statistiken einsehen", "en": "View billing and statistics"}',
   '["billing.read", "billing.manage", "analytics.read", "analytics.export"]',
   true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. MUSEUM USERS (staff members linked to a museum)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_museum_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES ag_museum_roles(id) DEFAULT 'rechercheur',
  display_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(museum_id, user_id)
);

CREATE INDEX idx_ag_museum_users_museum ON ag_museum_users(museum_id);
CREATE INDEX idx_ag_museum_users_user ON ag_museum_users(user_id);

-- ============================================================================
-- 3. MUSEUM INVITES (pending invitations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_museum_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES ag_museum_roles(id) DEFAULT 'rechercheur',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_invites_token ON ag_museum_invites(token);
CREATE INDEX idx_ag_invites_email ON ag_museum_invites(email);

-- ============================================================================
-- 4. CONTENT WORKFLOW (editorial pipeline)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,                       -- 'artwork', 'tour'
  entity_id UUID NOT NULL,
  from_status TEXT,                                -- null = new
  to_status TEXT NOT NULL,                         -- 'draft', 'review', 'published', 'archived'
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT,                                    -- review note or rejection reason
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_workflow_entity ON ag_workflow_transitions(entity_type, entity_id);
CREATE INDEX idx_ag_workflow_status ON ag_workflow_transitions(to_status);

-- ============================================================================
-- 5. CONTENT VERSIONS (full version history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,                       -- 'artwork', 'tour', 'tour_stop'
  entity_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,                             -- full snapshot of the entity
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_versions_entity ON ag_content_versions(entity_type, entity_id);
CREATE UNIQUE INDEX idx_ag_versions_number ON ag_content_versions(entity_type, entity_id, version_number);

-- ============================================================================
-- 6. AUDIT LOG (comprehensive activity tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,                            -- 'create', 'update', 'delete', 'publish', 'login', ...
  entity_type TEXT,                                -- 'artwork', 'tour', 'media', 'user', ...
  entity_id UUID,
  details JSONB DEFAULT '{}',                      -- { field: "title", old: "...", new: "..." }
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_audit_museum ON ag_audit_log(museum_id);
CREATE INDEX idx_ag_audit_user ON ag_audit_log(user_id);
CREATE INDEX idx_ag_audit_action ON ag_audit_log(action);
CREATE INDEX idx_ag_audit_time ON ag_audit_log(created_at);

-- ============================================================================
-- 7. MEDIA LIBRARY (centralized media management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',        -- image, video, audio, document, floorplan
  mime_type TEXT,
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  duration_seconds NUMERIC,                        -- for audio/video
  alt_text JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  folder TEXT DEFAULT '/',                          -- virtual folder path
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ag_media_museum ON ag_media_library(museum_id);
CREATE INDEX idx_ag_media_type ON ag_media_library(media_type);
CREATE INDEX idx_ag_media_folder ON ag_media_library(museum_id, folder);
CREATE INDEX idx_ag_media_tags ON ag_media_library USING GIN(tags);

-- ============================================================================
-- 8. RLS POLICIES FOR MUSEUM STAFF
-- ============================================================================

ALTER TABLE ag_museum_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_museum_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_museum_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ag_media_library ENABLE ROW LEVEL SECURITY;

-- Everyone can read role definitions
CREATE POLICY "Public read roles" ON ag_museum_roles
  FOR SELECT USING (true);

-- Museum staff can see their own museum's users
CREATE POLICY "Museum staff read users" ON ag_museum_users
  FOR SELECT USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

-- Museum admins manage users
CREATE POLICY "Museum admin manage users" ON ag_museum_users
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.role_id = 'museum_admin' AND mu.is_active = true
    )
  );

-- Museum staff full CRUD on their museum's content
-- Artworks: museum staff can manage
CREATE POLICY "Museum staff manage artworks" ON ag_artworks
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

-- Venues: museum staff can manage
CREATE POLICY "Museum staff manage venues" ON ag_venues
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

-- Floors: museum staff can manage
CREATE POLICY "Museum staff manage floors" ON ag_floors
  FOR ALL USING (
    venue_id IN (
      SELECT v.id FROM ag_venues v
      WHERE v.museum_id IN (
        SELECT mu.museum_id FROM ag_museum_users mu
        WHERE mu.user_id = auth.uid() AND mu.is_active = true
      )
    )
  );

-- Rooms: museum staff can manage
CREATE POLICY "Museum staff manage rooms" ON ag_rooms
  FOR ALL USING (
    venue_id IN (
      SELECT v.id FROM ag_venues v
      WHERE v.museum_id IN (
        SELECT mu.museum_id FROM ag_museum_users mu
        WHERE mu.user_id = auth.uid() AND mu.is_active = true
      )
    )
  );

-- Media: museum staff can manage
CREATE POLICY "Museum staff manage artwork media" ON ag_artwork_media
  FOR ALL USING (
    artwork_id IN (
      SELECT a.id FROM ag_artworks a
      WHERE a.museum_id IN (
        SELECT mu.museum_id FROM ag_museum_users mu
        WHERE mu.user_id = auth.uid() AND mu.is_active = true
      )
    )
  );

-- Categories: museum staff can manage
CREATE POLICY "Museum staff manage categories" ON ag_categories
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

-- Tours: museum staff can manage
CREATE POLICY "Museum staff manage tours" ON ag_tours
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

-- Tour stops: via tour access
CREATE POLICY "Museum staff manage tour stops" ON ag_tour_stops
  FOR ALL USING (
    tour_id IN (
      SELECT t.id FROM ag_tours t
      WHERE t.museum_id IN (
        SELECT mu.museum_id FROM ag_museum_users mu
        WHERE mu.user_id = auth.uid() AND mu.is_active = true
      )
    )
  );

-- Workflow: museum staff can view transitions
CREATE POLICY "Museum staff read workflow" ON ag_workflow_transitions
  FOR SELECT USING (true);

CREATE POLICY "Museum staff insert workflow" ON ag_workflow_transitions
  FOR INSERT WITH CHECK (auth.uid() = changed_by);

-- Content versions: museum staff can view
CREATE POLICY "Museum staff read versions" ON ag_content_versions
  FOR SELECT USING (true);

CREATE POLICY "Museum staff insert versions" ON ag_content_versions
  FOR INSERT WITH CHECK (auth.uid() = changed_by);

-- Audit log: museum admins can read
CREATE POLICY "Museum admin read audit" ON ag_audit_log
  FOR SELECT USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid()
        AND mu.role_id IN ('museum_admin', 'redakteur')
        AND mu.is_active = true
    )
  );

CREATE POLICY "System insert audit" ON ag_audit_log
  FOR INSERT WITH CHECK (true);

-- Media library: museum staff
CREATE POLICY "Museum staff manage media library" ON ag_media_library
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
    )
  );

-- Invites: museum admins
CREATE POLICY "Museum admin manage invites" ON ag_museum_invites
  FOR ALL USING (
    museum_id IN (
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.role_id = 'museum_admin' AND mu.is_active = true
    )
  );

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

CREATE TRIGGER ag_museum_users_updated_at
  BEFORE UPDATE ON ag_museum_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 10. HELPER: Check museum permission
-- ============================================================================

CREATE OR REPLACE FUNCTION ag_check_permission(
  p_user_id UUID,
  p_museum_id UUID,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  SELECT r.permissions INTO v_permissions
  FROM ag_museum_users mu
  JOIN ag_museum_roles r ON r.id = mu.role_id
  WHERE mu.user_id = p_user_id
    AND mu.museum_id = p_museum_id
    AND mu.is_active = true;

  IF v_permissions IS NULL THEN RETURN false; END IF;
  IF v_permissions @> '["*"]' THEN RETURN true; END IF;
  RETURN v_permissions @> to_jsonb(ARRAY[p_permission]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
