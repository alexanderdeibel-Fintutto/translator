-- ============================================================================
-- Museum Functions: create_museum_for_user + update_museum_settings
-- Separate deployment because policies already exist
-- ============================================================================

-- ============================================================================
-- FUNCTION: create_museum_for_user
-- Creates a museum + owner record + cms_member in one transaction
-- ============================================================================
CREATE OR REPLACE FUNCTION create_museum_for_user(
  p_name        TEXT,
  p_slug        TEXT,
  p_description TEXT DEFAULT '',
  p_email       TEXT DEFAULT NULL,
  p_website     TEXT DEFAULT NULL,
  p_phone       TEXT DEFAULT NULL,
  p_address     JSONB DEFAULT '{}'::JSONB,
  p_branding    JSONB DEFAULT '{}'::JSONB,
  p_default_language TEXT DEFAULT 'de',
  p_supported_languages TEXT[] DEFAULT ARRAY['de','en']
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_museum_id UUID;
  v_user_id   UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create museum
  INSERT INTO ag_museums (
    name, slug, description, email, website, phone,
    address, branding, default_language, supported_languages,
    tier_id, subscription_status, is_active
  ) VALUES (
    p_name,
    p_slug,
    jsonb_build_object(p_default_language, p_description),
    p_email,
    p_website,
    p_phone,
    p_address,
    p_branding,
    p_default_language,
    p_supported_languages,
    'artguide_starter',
    'trialing',
    true
  )
  RETURNING id INTO v_museum_id;

  -- Register ownership
  INSERT INTO ag_museum_owners (museum_id, user_id)
  VALUES (v_museum_id, v_user_id)
  ON CONFLICT (museum_id) DO NOTHING;

  -- Add as museum_admin in ag_museum_users
  INSERT INTO ag_museum_users (museum_id, user_id, role_id, is_active)
  VALUES (v_museum_id, v_user_id, 'museum_admin', true)
  ON CONFLICT (museum_id, user_id) DO UPDATE SET role_id = 'museum_admin', is_active = true;

  RETURN v_museum_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_museum_for_user TO authenticated;

-- ============================================================================
-- FUNCTION: update_museum_settings
-- Updates museum settings (name, description, branding, etc.)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_museum_settings(
  p_museum_id   UUID,
  p_name        TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_email       TEXT DEFAULT NULL,
  p_website     TEXT DEFAULT NULL,
  p_phone       TEXT DEFAULT NULL,
  p_address     JSONB DEFAULT NULL,
  p_branding    JSONB DEFAULT NULL,
  p_default_language TEXT DEFAULT NULL,
  p_supported_languages TEXT[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check permission: owner or museum_admin
  SELECT EXISTS (
    SELECT 1 FROM ag_museum_owners WHERE museum_id = p_museum_id AND user_id = v_user_id
    UNION ALL
    SELECT 1 FROM ag_museum_users WHERE museum_id = p_museum_id AND user_id = v_user_id AND role_id = 'museum_admin' AND is_active = true
    UNION ALL
    SELECT 1 FROM gt_users WHERE id = v_user_id AND role = 'admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE ag_museums SET
    name               = COALESCE(p_name, name),
    description        = CASE WHEN p_description IS NOT NULL THEN
                           description || jsonb_build_object(default_language, p_description)
                         ELSE description END,
    email              = COALESCE(p_email, email),
    website            = COALESCE(p_website, website),
    phone              = COALESCE(p_phone, phone),
    address            = COALESCE(p_address, address),
    branding           = COALESCE(p_branding, branding),
    default_language   = COALESCE(p_default_language, default_language),
    supported_languages = COALESCE(p_supported_languages, supported_languages),
    updated_at         = now()
  WHERE id = p_museum_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_museum_settings TO authenticated;
