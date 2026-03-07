-- Fix: infinite recursion in gt_users RLS policies
-- The "Admin read all users" policy queries gt_users to check if the caller
-- is admin/sales_agent, which triggers the same policy again => infinite loop.
-- Solution: use a SECURITY DEFINER function that bypasses RLS for the role check.

-- Helper function to check if current user is admin or sales_agent
-- SECURITY DEFINER runs as the function owner (superuser), bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin_or_sales()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM gt_users
    WHERE id = auth.uid()
      AND role IN ('admin', 'sales_agent')
  );
$$;

-- Drop the recursive SELECT policy on gt_users
DROP POLICY IF EXISTS "Admin read all users" ON gt_users;

-- Recreate using the helper function (no more recursion)
CREATE POLICY "Admin read all users" ON gt_users
  FOR SELECT USING (
    auth.uid() = id
    OR public.is_admin_or_sales()
  );

-- Also fix UPDATE and INSERT policies on gt_users that have the same issue
DROP POLICY IF EXISTS "Admins update any user" ON gt_users;
CREATE POLICY "Admins update any user" ON gt_users
  FOR UPDATE USING (
    auth.uid() = id
    OR public.is_admin_or_sales()
  );

DROP POLICY IF EXISTS "Admins insert users" ON gt_users;
CREATE POLICY "Admins insert users" ON gt_users
  FOR INSERT WITH CHECK (
    public.is_admin_or_sales()
  );
