-- GuideTranslator: Internal Roles & Tier Support
-- Adds 'session_manager' and 'tester' roles for internal accounts.
-- Internal tiers (internal_admin, internal_tester, internal_sales) are handled
-- client-side via UserContext role-to-tier mapping. The DB tier_id is TEXT
-- and accepts any value.

-- ============================================================================
-- 1. UPDATE ROLE CONSTRAINT to include new roles
-- ============================================================================

-- Drop old constraint and recreate with new values
ALTER TABLE gt_users DROP CONSTRAINT IF EXISTS gt_users_role_check;

ALTER TABLE gt_users
  ADD CONSTRAINT gt_users_role_check
  CHECK (role IN ('user', 'admin', 'sales_agent', 'session_manager', 'tester'));

-- ============================================================================
-- 2. ADMIN RLS: Allow admins to manage user roles and tiers
-- ============================================================================

-- Admin can update any user (for role/tier assignment)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins update any user' AND tablename = 'gt_users'
  ) THEN
    CREATE POLICY "Admins update any user" ON gt_users
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Admin can insert users (for creating test/sales accounts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins insert users' AND tablename = 'gt_users'
  ) THEN
    CREATE POLICY "Admins insert users" ON gt_users
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;
