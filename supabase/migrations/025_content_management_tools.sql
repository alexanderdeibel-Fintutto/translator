-- ============================================================================
-- 025: Content Management Tools
-- New tables for workflow automation, content timeline, and curator permissions
-- Supports Phase 1-3 admin components
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Content Timeline — tracks all changes to content items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fw_content_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES fw_content_items(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL CHECK (event_type IN (
    'status_change', 'content_edit', 'ai_enrich', 'ai_translate',
    'media_upload', 'audio_generate', 'created', 'note'
  )),

  from_value TEXT,                -- previous value (e.g. old status)
  to_value TEXT,                  -- new value (e.g. new status)
  field_name TEXT,                -- which field was changed
  details TEXT,                   -- human-readable description

  actor_type TEXT NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'ai')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,                -- display name or 'Workflow', 'Claude Sonnet', etc.

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_content ON fw_content_timeline(content_id, created_at DESC);
CREATE INDEX idx_timeline_type ON fw_content_timeline(event_type);

-- RLS
ALTER TABLE fw_content_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timeline readable by authenticated users"
  ON fw_content_timeline FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Timeline insertable by authenticated users"
  ON fw_content_timeline FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ---------------------------------------------------------------------------
-- 2. Workflow Rules — automation rules defined by curators
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fw_workflow_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  description TEXT,

  -- Trigger: what starts this rule
  trigger JSONB NOT NULL DEFAULT '{}',
  -- { type: 'status_change'|'content_created'|'ai_complete'|'schedule'|'completeness_reached',
  --   params: { to?: string, threshold?: string } }

  -- Conditions: filter which items are affected
  conditions JSONB NOT NULL DEFAULT '[]',
  -- [{ field: string, operator: 'equals'|'not_equals'|'contains'|'greater_than'|'less_than', value: string }]

  -- Actions: what to do when triggered
  actions JSONB NOT NULL DEFAULT '[]',
  -- [{ type: 'change_status'|'send_notification'|'ai_enrich'|'ai_translate'|'add_tag'|'set_highlight',
  --    params: { to?: string, languages?: string, tag?: string, value?: string, message?: string } }]

  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Ownership
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  museum_id UUID REFERENCES ag_museums(id) ON DELETE CASCADE,

  -- Stats
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_active ON fw_workflow_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_workflow_museum ON fw_workflow_rules(museum_id);

-- RLS
ALTER TABLE fw_workflow_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workflow rules readable by authenticated users"
  ON fw_workflow_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Workflow rules manageable by authenticated users"
  ON fw_workflow_rules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---------------------------------------------------------------------------
-- 3. Curator Permissions — role-based access for content management
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fw_curator_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  museum_id UUID REFERENCES ag_museums(id) ON DELETE CASCADE,
  -- NULL museum_id = global role (platform admin)

  role TEXT NOT NULL CHECK (role IN (
    'viewer',           -- can view content, no edits
    'editor',           -- can create/edit content, cannot publish
    'publisher',        -- can edit + publish/unpublish content
    'manager',          -- can edit + publish + manage workflow rules
    'admin'             -- full access including user management
  )),

  -- Granular permissions (override role defaults)
  can_create BOOLEAN NOT NULL DEFAULT true,
  can_edit BOOLEAN NOT NULL DEFAULT true,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  can_publish BOOLEAN NOT NULL DEFAULT false,
  can_manage_workflow BOOLEAN NOT NULL DEFAULT false,
  can_manage_users BOOLEAN NOT NULL DEFAULT false,
  can_import BOOLEAN NOT NULL DEFAULT false,
  can_export BOOLEAN NOT NULL DEFAULT false,
  can_use_ai BOOLEAN NOT NULL DEFAULT true,

  -- Scope restrictions
  allowed_domains TEXT[] DEFAULT NULL,  -- NULL = all domains
  allowed_content_types TEXT[] DEFAULT NULL,  -- NULL = all types

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, museum_id)
);

CREATE INDEX idx_curator_user ON fw_curator_roles(user_id);
CREATE INDEX idx_curator_museum ON fw_curator_roles(museum_id);

-- RLS
ALTER TABLE fw_curator_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curator roles visible to authenticated users"
  ON fw_curator_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Curator roles manageable by admins"
  ON fw_curator_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fw_curator_roles cr
      WHERE cr.user_id = auth.uid()
      AND (cr.museum_id = fw_curator_roles.museum_id OR cr.museum_id IS NULL)
      AND cr.role IN ('admin', 'manager')
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND internal_role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM fw_curator_roles cr
      WHERE cr.user_id = auth.uid()
      AND (cr.museum_id = fw_curator_roles.museum_id OR cr.museum_id IS NULL)
      AND cr.role IN ('admin', 'manager')
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND internal_role IN ('admin', 'super_admin')
    )
  );


-- ---------------------------------------------------------------------------
-- 4. Helper function: check curator permission
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fw_check_permission(
  p_user_id UUID,
  p_museum_id UUID,
  p_permission TEXT  -- 'view', 'create', 'edit', 'delete', 'publish', 'manage_workflow', 'manage_users', 'import', 'export', 'use_ai'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role fw_curator_roles%ROWTYPE;
BEGIN
  -- Check platform admin first
  IF EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id AND internal_role IN ('admin', 'super_admin')
  ) THEN
    RETURN true;
  END IF;

  -- Check museum-specific role
  SELECT * INTO v_role
  FROM fw_curator_roles
  WHERE user_id = p_user_id
  AND (museum_id = p_museum_id OR museum_id IS NULL)
  ORDER BY museum_id NULLS LAST  -- prefer specific over global
  LIMIT 1;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- Admin role = everything
  IF v_role.role = 'admin' THEN
    RETURN true;
  END IF;

  -- Check specific permission
  CASE p_permission
    WHEN 'view' THEN RETURN true;  -- all roles can view
    WHEN 'create' THEN RETURN v_role.can_create;
    WHEN 'edit' THEN RETURN v_role.can_edit;
    WHEN 'delete' THEN RETURN v_role.can_delete;
    WHEN 'publish' THEN RETURN v_role.can_publish;
    WHEN 'manage_workflow' THEN RETURN v_role.can_manage_workflow;
    WHEN 'manage_users' THEN RETURN v_role.can_manage_users;
    WHEN 'import' THEN RETURN v_role.can_import;
    WHEN 'export' THEN RETURN v_role.can_export;
    WHEN 'use_ai' THEN RETURN v_role.can_use_ai;
    ELSE RETURN false;
  END CASE;
END;
$$;


-- ---------------------------------------------------------------------------
-- 5. Helper function: set role defaults
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fw_set_role_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  CASE NEW.role
    WHEN 'viewer' THEN
      NEW.can_create := false;
      NEW.can_edit := false;
      NEW.can_delete := false;
      NEW.can_publish := false;
      NEW.can_manage_workflow := false;
      NEW.can_manage_users := false;
      NEW.can_import := false;
      NEW.can_export := false;
      NEW.can_use_ai := false;
    WHEN 'editor' THEN
      NEW.can_create := true;
      NEW.can_edit := true;
      NEW.can_delete := false;
      NEW.can_publish := false;
      NEW.can_manage_workflow := false;
      NEW.can_manage_users := false;
      NEW.can_import := true;
      NEW.can_export := true;
      NEW.can_use_ai := true;
    WHEN 'publisher' THEN
      NEW.can_create := true;
      NEW.can_edit := true;
      NEW.can_delete := false;
      NEW.can_publish := true;
      NEW.can_manage_workflow := false;
      NEW.can_manage_users := false;
      NEW.can_import := true;
      NEW.can_export := true;
      NEW.can_use_ai := true;
    WHEN 'manager' THEN
      NEW.can_create := true;
      NEW.can_edit := true;
      NEW.can_delete := true;
      NEW.can_publish := true;
      NEW.can_manage_workflow := true;
      NEW.can_manage_users := false;
      NEW.can_import := true;
      NEW.can_export := true;
      NEW.can_use_ai := true;
    WHEN 'admin' THEN
      NEW.can_create := true;
      NEW.can_edit := true;
      NEW.can_delete := true;
      NEW.can_publish := true;
      NEW.can_manage_workflow := true;
      NEW.can_manage_users := true;
      NEW.can_import := true;
      NEW.can_export := true;
      NEW.can_use_ai := true;
    ELSE
      NULL;  -- keep custom permissions
  END CASE;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_curator_role_defaults
  BEFORE INSERT ON fw_curator_roles
  FOR EACH ROW
  EXECUTE FUNCTION fw_set_role_defaults();


-- ---------------------------------------------------------------------------
-- 6. Push subscriptions table (for web push notifications)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fw_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,  -- { p256dh, auth }
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_user ON fw_push_subscriptions(user_id);

ALTER TABLE fw_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON fw_push_subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 7. Add sort_order default trigger for fw_content_items
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fw_set_sort_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.sort_order IS NULL OR NEW.sort_order = 0 THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1
    INTO NEW.sort_order
    FROM fw_content_items
    WHERE parent_id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_sort_order
  BEFORE INSERT ON fw_content_items
  FOR EACH ROW
  EXECUTE FUNCTION fw_set_sort_order();


-- ---------------------------------------------------------------------------
-- 8. Updated_at auto-trigger for new tables
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_workflow_rules_updated
  BEFORE UPDATE ON fw_workflow_rules
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER trg_curator_roles_updated
  BEFORE UPDATE ON fw_curator_roles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
