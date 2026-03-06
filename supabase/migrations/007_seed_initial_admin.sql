-- 1. Fix: Allow users to insert their own gt_users profile row.
--    The DB trigger (handle_new_user) runs as SECURITY DEFINER and normally
--    handles this, but if it didn't fire the client-side fallback in
--    UserContext needs INSERT permission to auto-create the profile.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users insert own profile' AND tablename = 'gt_users'
  ) THEN
    CREATE POLICY "Users insert own profile" ON gt_users
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Seed the initial admin account from auth.users
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
