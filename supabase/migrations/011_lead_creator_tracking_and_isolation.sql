-- Migration 011: Lead Creator Tracking & Sales Agent Isolation
--
-- Fixes critical issues for multi-salesperson deployment:
-- 1. Adds created_by to gt_leads (permanent creator link for commissions)
-- 2. Replaces blanket sales_agent access with per-creator isolation
-- 3. Admins retain full access to all leads
-- 4. Isolates lead_notes and calculations to the lead's creator

-- ============================================================================
-- 1. ADD created_by COLUMN TO gt_leads
-- ============================================================================

ALTER TABLE gt_leads
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Backfill: assign existing leads to admin if assigned_to is set, otherwise leave NULL
UPDATE gt_leads
SET created_by = COALESCE(assigned_to, (
  SELECT id FROM gt_users WHERE role = 'admin' LIMIT 1
))
WHERE created_by IS NULL;

-- Index for fast lookups by creator
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON gt_leads(created_by);

-- ============================================================================
-- 2. HELPER FUNCTION: Check if current user is admin only (not sales_agent)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM gt_users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ============================================================================
-- 3. REPLACE RLS POLICIES ON gt_leads
-- ============================================================================

-- Drop old blanket policy
DROP POLICY IF EXISTS "Admin full access on gt_leads" ON gt_leads;

-- Admin: full access to ALL leads
CREATE POLICY "Admin full access on gt_leads" ON gt_leads
  FOR ALL USING (public.is_admin());

-- Sales agent: can only see leads they created or are assigned to
CREATE POLICY "Sales agent own leads" ON gt_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_users
      WHERE id = auth.uid() AND role = 'sales_agent'
    )
    AND (
      created_by = auth.uid()
      OR assigned_to = auth.uid()
    )
  );

-- ============================================================================
-- 4. REPLACE RLS POLICIES ON gt_lead_notes
-- ============================================================================

DROP POLICY IF EXISTS "Admin full access on gt_lead_notes" ON gt_lead_notes;

-- Admin: full access to all notes
CREATE POLICY "Admin full access on gt_lead_notes" ON gt_lead_notes
  FOR ALL USING (public.is_admin());

-- Sales agent: notes only for leads they own
CREATE POLICY "Sales agent own lead notes" ON gt_lead_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_leads
      WHERE gt_leads.id = gt_lead_notes.lead_id
        AND (gt_leads.created_by = auth.uid() OR gt_leads.assigned_to = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM gt_users
      WHERE id = auth.uid() AND role = 'sales_agent'
    )
  );

-- ============================================================================
-- 5. REPLACE RLS POLICIES ON gt_calculations
-- ============================================================================

DROP POLICY IF EXISTS "Admin full access on gt_calculations" ON gt_calculations;

-- Admin: full access
CREATE POLICY "Admin full access on gt_calculations" ON gt_calculations
  FOR ALL USING (public.is_admin());

-- Sales agent: calculations only for their own leads
CREATE POLICY "Sales agent own calculations" ON gt_calculations
  FOR ALL USING (
    (
      lead_id IS NULL  -- standalone calculations (no lead) are accessible
      OR EXISTS (
        SELECT 1 FROM gt_leads
        WHERE gt_leads.id = gt_calculations.lead_id
          AND (gt_leads.created_by = auth.uid() OR gt_leads.assigned_to = auth.uid())
      )
    )
    AND EXISTS (
      SELECT 1 FROM gt_users
      WHERE id = auth.uid() AND role = 'sales_agent'
    )
  );

-- ============================================================================
-- 6. CONTACT REQUESTS: Keep existing policy (admin + sales_agent see all)
-- Contact requests come from public forms, not created by salespeople.
-- ============================================================================

-- No change needed for gt_contact_requests

-- ============================================================================
-- 7. RPC: Admin function to get per-user activity stats
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_get_user_activity(
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  total_sessions BIGINT,
  total_duration_minutes NUMERIC,
  total_translations BIGINT,
  last_session_at TIMESTAMPTZ,
  current_month_minutes NUMERIC,
  current_month_translations BIGINT,
  lead_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.email,
    u.display_name,
    u.role,
    COALESCE(s.total_sessions, 0) AS total_sessions,
    COALESCE(s.total_duration, 0) AS total_duration_minutes,
    COALESCE(s.total_translations, 0) AS total_translations,
    s.last_session_at,
    COALESCE(cu.session_minutes_used, 0) AS current_month_minutes,
    COALESCE(cu.translations_count, 0)::BIGINT AS current_month_translations,
    COALESCE(lc.lead_count, 0) AS lead_count,
    u.created_at
  FROM gt_users u
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS total_sessions,
      COALESCE(SUM(duration_minutes), 0) AS total_duration,
      COALESCE(SUM(translation_count), 0) AS total_translations,
      MAX(created_at) AS last_session_at
    FROM gt_sessions
    WHERE gt_sessions.user_id = u.id
  ) s ON true
  LEFT JOIN LATERAL (
    SELECT
      session_minutes_used,
      translations_count
    FROM gt_usage
    WHERE gt_usage.user_id = u.id
      AND gt_usage.period_start <= CURRENT_DATE
      AND gt_usage.period_end >= CURRENT_DATE
    LIMIT 1
  ) cu ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS lead_count
    FROM gt_leads
    WHERE gt_leads.created_by = u.id
  ) lc ON true
  WHERE
    -- Only admins can call this
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
    -- Optional filter by specific user
    AND (p_user_id IS NULL OR u.id = p_user_id)
  ORDER BY s.last_session_at DESC NULLS LAST, u.created_at DESC;
$$;
