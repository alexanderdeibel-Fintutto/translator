-- Migration: Add SECURITY DEFINER function for profile loading.
-- This bypasses RLS to avoid the self-referencing policy issue where the
-- "Admin read all users" policy on gt_users causes query failures.

CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT row_to_json(t) FROM (
    SELECT tier_id, organization_id, stripe_customer_id, display_name, role
    FROM gt_users
    WHERE id = auth.uid()
  ) t
$$;

-- Grant execute to authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_profile() TO anon;
