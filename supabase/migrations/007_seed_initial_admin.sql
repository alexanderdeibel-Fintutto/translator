-- Seed the initial admin account
-- This ensures admin@guidetranslator.com has the 'admin' role
-- Uses ILIKE for case-insensitive match and no role condition

-- First try to update existing gt_users row
UPDATE gt_users
SET role = 'admin'
WHERE LOWER(email) = LOWER('admin@guidetranslator.com');

-- If no gt_users row exists yet, create one from auth.users
INSERT INTO gt_users (id, email, display_name, tier_id, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email),
  'free',
  'admin'
FROM auth.users au
WHERE LOWER(au.email) = LOWER('admin@guidetranslator.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
