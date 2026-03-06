-- Seed the initial admin account
-- This ensures admin@guidetranslator.com has the 'admin' role
UPDATE gt_users
SET role = 'admin'
WHERE email = 'admin@guidetranslator.com'
  AND role = 'user';
