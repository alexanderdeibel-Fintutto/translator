-- ============================================================================
-- 026: RLS Hotfix & Architecture Improvements
-- Fixes all broken RLS policies from migrations 021, 024, 025.
-- Adds polymorphic parent refs, universal categories, soft delete,
-- DSGVO export, audit trail, compound indexes, and updated_at trigger.
-- ============================================================================

-- ============================================================================
-- 1. UNIFIED ADMIN CHECK FUNCTION
-- Replaces all inconsistent admin checks across the codebase.
-- SECURITY DEFINER so it can read gt_users regardless of RLS.
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM gt_users
    WHERE gt_users.id = auth.uid()
      AND (gt_users.tier_id = 'internal_admin' OR gt_users.role = 'admin')
  );
END;
$$;


-- ============================================================================
-- 2. FIX MIGRATION 021 BROKEN RLS
-- The original policies reference non-existent tables: fw_museums, fw_cities,
-- fw_regions, fw_partners. Fix to use: ag_museums (via ag_museum_users),
-- cg_cities (via cg_staff), cg_regions (via cg_staff), cg_partners (via
-- cg_partner_users).
-- ============================================================================

-- ----- 2a. fw_subscriptions -----

DROP POLICY IF EXISTS "Entity owners read own subscriptions" ON fw_subscriptions;
DROP POLICY IF EXISTS "Admins full access on subscriptions" ON fw_subscriptions;

-- Entity owners can read their own subscriptions via real ownership tables
CREATE POLICY "Entity owners read own subscriptions" ON fw_subscriptions
  FOR SELECT USING (
    entity_id IN (
      -- Museum: user is a museum team member
      SELECT mu.museum_id FROM ag_museum_users mu
      WHERE mu.user_id = auth.uid() AND mu.is_active = true
      UNION ALL
      -- City: user is city staff (admin role)
      SELECT s.city_id FROM cg_staff s
      WHERE s.user_id = auth.uid() AND s.is_active = true
        AND s.city_id IS NOT NULL AND s.role = 'admin'
      UNION ALL
      -- Region: user is region staff (admin role)
      SELECT s.region_id FROM cg_staff s
      WHERE s.user_id = auth.uid() AND s.is_active = true
        AND s.region_id IS NOT NULL AND s.role = 'admin'
      UNION ALL
      -- Partner: user is partner member
      SELECT pu.partner_id FROM cg_partner_users pu
      WHERE pu.user_id = auth.uid() AND pu.is_active = true
    )
  );

-- Admins full access using unified function
CREATE POLICY "Admins full access on subscriptions" ON fw_subscriptions
  FOR ALL USING (fw_is_admin());

-- ----- 2b. fw_invoices -----

DROP POLICY IF EXISTS "Entity owners read own invoices" ON fw_invoices;
DROP POLICY IF EXISTS "Admins full access on invoices" ON fw_invoices;

CREATE POLICY "Entity owners read own invoices" ON fw_invoices
  FOR SELECT USING (
    subscription_id IN (
      SELECT s.id FROM fw_subscriptions s
      WHERE s.entity_id IN (
        SELECT mu.museum_id FROM ag_museum_users mu
        WHERE mu.user_id = auth.uid() AND mu.is_active = true
        UNION ALL
        SELECT st.city_id FROM cg_staff st
        WHERE st.user_id = auth.uid() AND st.is_active = true
          AND st.city_id IS NOT NULL AND st.role = 'admin'
        UNION ALL
        SELECT st.region_id FROM cg_staff st
        WHERE st.user_id = auth.uid() AND st.is_active = true
          AND st.region_id IS NOT NULL AND st.role = 'admin'
        UNION ALL
        SELECT pu.partner_id FROM cg_partner_users pu
        WHERE pu.user_id = auth.uid() AND pu.is_active = true
      )
    )
  );

CREATE POLICY "Admins full access on invoices" ON fw_invoices
  FOR ALL USING (fw_is_admin());

-- ----- 2c. fw_usage_records -----

DROP POLICY IF EXISTS "Entity owners read own usage" ON fw_usage_records;
DROP POLICY IF EXISTS "Admins full access on usage_records" ON fw_usage_records;

CREATE POLICY "Entity owners read own usage" ON fw_usage_records
  FOR SELECT USING (
    subscription_id IN (
      SELECT s.id FROM fw_subscriptions s
      WHERE s.entity_id IN (
        SELECT mu.museum_id FROM ag_museum_users mu
        WHERE mu.user_id = auth.uid() AND mu.is_active = true
        UNION ALL
        SELECT st.city_id FROM cg_staff st
        WHERE st.user_id = auth.uid() AND st.is_active = true
          AND st.city_id IS NOT NULL AND st.role = 'admin'
        UNION ALL
        SELECT st.region_id FROM cg_staff st
        WHERE st.user_id = auth.uid() AND st.is_active = true
          AND st.region_id IS NOT NULL AND st.role = 'admin'
        UNION ALL
        SELECT pu.partner_id FROM cg_partner_users pu
        WHERE pu.user_id = auth.uid() AND pu.is_active = true
      )
    )
  );

CREATE POLICY "Admins full access on usage_records" ON fw_usage_records
  FOR ALL USING (fw_is_admin());

-- ----- 2d. fw_payment_events -----

DROP POLICY IF EXISTS "Admins full access on payment_events" ON fw_payment_events;

CREATE POLICY "Admins full access on payment_events" ON fw_payment_events
  FOR ALL USING (fw_is_admin());


-- ============================================================================
-- 3. FIX MIGRATION 024 BROKEN RLS
-- The 4 "System admins full access" policies reference non-existent
-- user_roles table. Replace with fw_is_admin().
-- ============================================================================

DROP POLICY IF EXISTS "System admins full access on import_jobs" ON ag_import_jobs;
DROP POLICY IF EXISTS "System admins full access on import_items" ON ag_import_items;
DROP POLICY IF EXISTS "System admins full access on ai_queue" ON ag_ai_queue;
DROP POLICY IF EXISTS "System admins full access on templates" ON ag_import_templates;

CREATE POLICY "System admins full access on import_jobs" ON ag_import_jobs
  FOR ALL USING (fw_is_admin());

CREATE POLICY "System admins full access on import_items" ON ag_import_items
  FOR ALL USING (fw_is_admin());

CREATE POLICY "System admins full access on ai_queue" ON ag_ai_queue
  FOR ALL USING (fw_is_admin());

CREATE POLICY "System admins full access on templates" ON ag_import_templates
  FOR ALL USING (fw_is_admin());


-- ============================================================================
-- 4. FIX MIGRATION 025 BROKEN RLS
-- "Curator roles manageable by admins" references non-existent
-- user_profiles table. Replace with gt_users.
-- ============================================================================

DROP POLICY IF EXISTS "Curator roles manageable by admins" ON fw_curator_roles;

CREATE POLICY "Curator roles manageable by admins" ON fw_curator_roles
  FOR ALL
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
      SELECT 1 FROM gt_users
      WHERE gt_users.id = auth.uid()
        AND (gt_users.tier_id = 'internal_admin' OR gt_users.role = 'admin')
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
      SELECT 1 FROM gt_users
      WHERE gt_users.id = auth.uid()
        AND (gt_users.tier_id = 'internal_admin' OR gt_users.role = 'admin')
    )
  );

-- Also fix fw_check_permission which references user_profiles
CREATE OR REPLACE FUNCTION fw_check_permission(
  p_user_id UUID,
  p_museum_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role fw_curator_roles%ROWTYPE;
BEGIN
  -- Check platform admin first (using gt_users instead of user_profiles)
  IF EXISTS (
    SELECT 1 FROM gt_users
    WHERE id = p_user_id
      AND (tier_id = 'internal_admin' OR role = 'admin')
  ) THEN
    RETURN true;
  END IF;

  -- Check museum-specific role
  SELECT * INTO v_role
  FROM fw_curator_roles
  WHERE user_id = p_user_id
  AND (museum_id = p_museum_id OR museum_id IS NULL)
  ORDER BY museum_id NULLS LAST
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
    WHEN 'view' THEN RETURN true;
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


-- ============================================================================
-- 5. POLYMORPHIC PARENT REFS FOR fw_curator_roles AND fw_workflow_rules
-- Allows these tables to reference any parent entity (museum, city, region,
-- etc.) instead of only museum_id.
-- ============================================================================

-- ----- 5a. fw_curator_roles -----

ALTER TABLE fw_curator_roles
  ADD COLUMN IF NOT EXISTS parent_type TEXT,
  ADD COLUMN IF NOT EXISTS parent_id UUID;

-- Migrate existing museum_id data
UPDATE fw_curator_roles
SET parent_type = 'museum', parent_id = museum_id
WHERE museum_id IS NOT NULL
  AND parent_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_fw_curator_roles_parent
  ON fw_curator_roles(parent_type, parent_id);

-- ----- 5b. fw_workflow_rules -----

ALTER TABLE fw_workflow_rules
  ADD COLUMN IF NOT EXISTS parent_type TEXT,
  ADD COLUMN IF NOT EXISTS parent_id UUID;

-- Migrate existing museum_id data
UPDATE fw_workflow_rules
SET parent_type = 'museum', parent_id = museum_id
WHERE museum_id IS NOT NULL
  AND parent_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_fw_workflow_rules_parent
  ON fw_workflow_rules(parent_type, parent_id);


-- ============================================================================
-- 6. UNIVERSAL CATEGORY TABLE
-- Domain-aware, multilingual, hierarchical category system.
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,                             -- artguide, cityguide, regionguide, etc.
  parent_category_id UUID REFERENCES fw_categories(id) ON DELETE SET NULL,
  name JSONB NOT NULL DEFAULT '{}',                 -- multilingual: { "de": "...", "en": "..." }
  slug TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fw_categories_domain_active
  ON fw_categories(domain, is_active);

-- RLS
ALTER TABLE fw_categories ENABLE ROW LEVEL SECURITY;

-- Public read for active categories
CREATE POLICY "Public read active categories" ON fw_categories
  FOR SELECT
  USING (is_active = true);

-- Admin manage all categories
CREATE POLICY "Admins manage categories" ON fw_categories
  FOR ALL USING (fw_is_admin());


-- ============================================================================
-- 7. SOFT DELETE SUPPORT FOR fw_content_items
-- ============================================================================

ALTER TABLE fw_content_items
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE fw_content_items
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Partial index: quickly find active (non-deleted) items
CREATE INDEX IF NOT EXISTS idx_fw_content_items_active
  ON fw_content_items(deleted_at) WHERE deleted_at IS NULL;

-- Restore function: un-deletes a soft-deleted content item
CREATE OR REPLACE FUNCTION fw_restore_content(p_content_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins or the original deleter can restore
  IF NOT fw_is_admin() AND NOT EXISTS (
    SELECT 1 FROM fw_content_items
    WHERE id = p_content_id AND deleted_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to restore this content item';
  END IF;

  UPDATE fw_content_items
  SET deleted_at = NULL,
      deleted_by = NULL,
      updated_at = now()
  WHERE id = p_content_id
    AND deleted_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Content item not found or not deleted: %', p_content_id;
  END IF;
END;
$$;


-- ============================================================================
-- 8. DSGVO DATA EXPORT FUNCTION
-- Exports all data for a given visitor as a single JSONB blob.
-- Required for GDPR/DSGVO Art. 15 (right of access / Auskunftsrecht).
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_export_visitor_data(p_visitor_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_profile JSONB;
  v_visits JSONB;
  v_interactions JSONB;
  v_dialogs JSONB;
  v_favorites JSONB;
  v_notifications JSONB;
BEGIN
  -- Verify the caller is the visitor themselves or an admin
  IF NOT fw_is_admin() AND NOT EXISTS (
    SELECT 1 FROM fw_visitor_profiles
    WHERE id = p_visitor_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to export data for this visitor';
  END IF;

  -- 1. Visitor profile
  SELECT to_jsonb(vp) INTO v_profile
  FROM fw_visitor_profiles vp
  WHERE vp.id = p_visitor_id;

  -- 2. Visit history
  SELECT COALESCE(jsonb_agg(to_jsonb(vh) ORDER BY vh.started_at DESC), '[]'::jsonb)
  INTO v_visits
  FROM fw_visit_history vh
  WHERE vh.visitor_id = p_visitor_id;

  -- 3. POI interactions
  SELECT COALESCE(jsonb_agg(to_jsonb(pi) ORDER BY pi.viewed_at DESC), '[]'::jsonb)
  INTO v_interactions
  FROM fw_poi_interactions pi
  WHERE pi.visitor_id = p_visitor_id;

  -- 4. AI dialogs
  SELECT COALESCE(jsonb_agg(to_jsonb(ad) ORDER BY ad.started_at DESC), '[]'::jsonb)
  INTO v_dialogs
  FROM fw_ai_dialogs ad
  WHERE ad.visitor_id = p_visitor_id;

  -- 5. Favorites
  SELECT COALESCE(jsonb_agg(to_jsonb(f) ORDER BY f.created_at DESC), '[]'::jsonb)
  INTO v_favorites
  FROM fw_favorites f
  WHERE f.visitor_id = p_visitor_id;

  -- 6. Notifications
  SELECT COALESCE(jsonb_agg(to_jsonb(n) ORDER BY n.created_at DESC), '[]'::jsonb)
  INTO v_notifications
  FROM fw_notifications n
  WHERE n.visitor_id = p_visitor_id;

  -- Assemble result
  v_result := jsonb_build_object(
    'export_date', now(),
    'visitor_id', p_visitor_id,
    'profile', COALESCE(v_profile, '{}'::jsonb),
    'visit_history', v_visits,
    'poi_interactions', v_interactions,
    'ai_dialogs', v_dialogs,
    'favorites', v_favorites,
    'notifications', v_notifications
  );

  RETURN v_result;
END;
$$;


-- ============================================================================
-- 9. AUDIT TRAIL FUNCTION
-- Generic trigger function that logs admin actions to ag_audit_log.
-- Captures table_name, record_id, action, old_data, new_data, actor_id.
-- ============================================================================

-- Ensure ag_audit_log has the columns we need (it was originally museum-scoped;
-- we add generic columns if missing)
ALTER TABLE ag_audit_log
  ADD COLUMN IF NOT EXISTS table_name TEXT,
  ADD COLUMN IF NOT EXISTS record_id UUID,
  ADD COLUMN IF NOT EXISTS old_data JSONB,
  ADD COLUMN IF NOT EXISTS new_data JSONB;

CREATE OR REPLACE FUNCTION fw_log_admin_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action TEXT;
  v_record_id UUID;
  v_old_data JSONB;
  v_new_data JSONB;
  v_museum_id UUID;
BEGIN
  -- Determine action
  v_action := TG_OP;  -- INSERT, UPDATE, DELETE

  -- Determine record ID
  IF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id;
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_record_id := NEW.id;
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    v_record_id := NEW.id;
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
  END IF;

  -- Try to extract museum_id if it exists on the record
  -- (ag_audit_log requires museum_id NOT NULL, so we try to find it)
  IF TG_OP = 'DELETE' THEN
    v_museum_id := OLD.museum_id;
  ELSE
    v_museum_id := NEW.museum_id;
  END IF;

  -- Fall back: use parent_id if parent_type = 'museum'
  IF v_museum_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      BEGIN
        IF OLD.parent_type = 'museum' THEN
          v_museum_id := OLD.parent_id;
        END IF;
      EXCEPTION WHEN undefined_column THEN
        NULL;
      END;
    ELSE
      BEGIN
        IF NEW.parent_type = 'museum' THEN
          v_museum_id := NEW.parent_id;
        END IF;
      EXCEPTION WHEN undefined_column THEN
        NULL;
      END;
    END IF;
  END IF;

  -- If we still have no museum_id, use a sentinel UUID (required by NOT NULL constraint)
  IF v_museum_id IS NULL THEN
    v_museum_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;

  INSERT INTO ag_audit_log (
    museum_id,
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    v_museum_id,
    auth.uid(),
    lower(v_action),
    TG_TABLE_NAME,
    v_record_id,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', v_action,
      'timestamp', now()
    ),
    TG_TABLE_NAME,
    v_record_id,
    v_old_data,
    v_new_data
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Attach audit trigger to fw_content_items
DROP TRIGGER IF EXISTS trg_audit_fw_content_items ON fw_content_items;
CREATE TRIGGER trg_audit_fw_content_items
  AFTER INSERT OR UPDATE OR DELETE ON fw_content_items
  FOR EACH ROW
  EXECUTE FUNCTION fw_log_admin_action();

-- Attach audit trigger to fw_workflow_rules
DROP TRIGGER IF EXISTS trg_audit_fw_workflow_rules ON fw_workflow_rules;
CREATE TRIGGER trg_audit_fw_workflow_rules
  AFTER INSERT OR UPDATE OR DELETE ON fw_workflow_rules
  FOR EACH ROW
  EXECUTE FUNCTION fw_log_admin_action();

-- Attach audit trigger to fw_curator_roles
DROP TRIGGER IF EXISTS trg_audit_fw_curator_roles ON fw_curator_roles;
CREATE TRIGGER trg_audit_fw_curator_roles
  AFTER INSERT OR UPDATE OR DELETE ON fw_curator_roles
  FOR EACH ROW
  EXECUTE FUNCTION fw_log_admin_action();


-- ============================================================================
-- 10. MISSING COMPOUND INDEXES
-- Optimizes common query patterns across the platform.
-- ============================================================================

-- fw_content_items: published items per parent
CREATE INDEX IF NOT EXISTS idx_fw_content_parent_status_published
  ON fw_content_items(parent_type, parent_id, status)
  WHERE status = 'published';

-- fw_content_items: featured items per domain
CREATE INDEX IF NOT EXISTS idx_fw_content_domain_featured
  ON fw_content_items(domain, status, is_featured)
  WHERE is_featured = true;

-- fw_crm_leads: assigned leads by status
CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_assigned_status
  ON fw_crm_leads(assigned_to, status);

-- fw_crm_leads: segment scoring
CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_segment_score
  ON fw_crm_leads(segment_id, score DESC);

-- fw_crm_tasks: task queue per assignee
CREATE INDEX IF NOT EXISTS idx_fw_crm_tasks_assigned_status_due
  ON fw_crm_tasks(assigned_to, status, due_at);

-- ag_artworks: artworks per museum by status
CREATE INDEX IF NOT EXISTS idx_ag_artworks_museum_status
  ON ag_artworks(museum_id, status);

-- cg_pois: published featured POIs per city
CREATE INDEX IF NOT EXISTS idx_cg_pois_city_published_featured
  ON cg_pois(city_id, status, is_featured)
  WHERE status = 'published';

-- fw_subscriptions: entity lookup by status
CREATE INDEX IF NOT EXISTS idx_fw_subscriptions_entity_status
  ON fw_subscriptions(entity_type, entity_id, status);


-- ============================================================================
-- 11. UNIFIED updated_at TRIGGER
-- One universal trigger function, plus a helper to quickly attach it.
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Helper function to attach the trigger to any table.
-- Usage: SELECT fw_attach_updated_at_trigger('my_table_name');
CREATE OR REPLACE FUNCTION fw_attach_updated_at_trigger(p_table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_trigger_name TEXT;
BEGIN
  v_trigger_name := 'trg_' || p_table_name || '_touch_updated_at';

  -- Drop existing trigger if present
  EXECUTE format(
    'DROP TRIGGER IF EXISTS %I ON %I',
    v_trigger_name, p_table_name
  );

  -- Create the trigger
  EXECUTE format(
    'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION fw_touch_updated_at()',
    v_trigger_name, p_table_name
  );
END;
$$;

-- Attach to fw_categories (new table from this migration)
SELECT fw_attach_updated_at_trigger('fw_categories');
