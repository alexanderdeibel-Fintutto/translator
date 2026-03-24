-- Fix: Ensure admin@guidetranslator.com has admin role.
-- The role may have been reset to 'user' if the profile was re-created
-- after the initial seed migration (007) ran.

UPDATE gt_users
SET role = 'admin', updated_at = now()
WHERE LOWER(email) = LOWER('admin@guidetranslator.com')
  AND role != 'admin';

-- Also handle the case where the gt_users row was created from auth.users
-- but the seed migration didn't match (e.g. different casing or timing).
INSERT INTO gt_users (id, email, display_name, tier_id, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email),
  'free',
  'admin'
FROM auth.users au
WHERE LOWER(au.email) = LOWER('admin@guidetranslator.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
