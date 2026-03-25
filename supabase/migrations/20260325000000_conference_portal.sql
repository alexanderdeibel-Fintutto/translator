-- ============================================================================
-- Migration: Conference Portal Schema
-- Description: Creates tables for organizations, conferences, sessions, speakers, attendees
-- ============================================================================

-- 1. Organizations (Congress Centers, Event Agencies)
CREATE TABLE IF NOT EXISTS public.cp_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description JSONB DEFAULT '{}'::jsonb,
    logo_url TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    tier_id TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Conferences / Events
CREATE TABLE IF NOT EXISTS public.cp_conferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.cp_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description JSONB DEFAULT '{}'::jsonb,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    venue_name TEXT,
    cover_image_url TEXT,
    languages TEXT[] DEFAULT '{"de", "en"}'::text[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Speakers
CREATE TABLE IF NOT EXISTS public.cp_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.cp_organizations(id) ON DELETE CASCADE,
    conference_id UUID NOT NULL REFERENCES public.cp_conferences(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    organization TEXT,
    bio JSONB DEFAULT '{}'::jsonb,
    photo_url TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Sessions (Talks, Workshops)
CREATE TABLE IF NOT EXISTS public.cp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.cp_organizations(id) ON DELETE CASCADE,
    conference_id UUID NOT NULL REFERENCES public.cp_conferences(id) ON DELETE CASCADE,
    title JSONB NOT NULL DEFAULT '{}'::jsonb,
    description JSONB DEFAULT '{}'::jsonb,
    speaker_ids UUID[] DEFAULT '{}'::uuid[],
    room TEXT,
    track TEXT,
    start_time TIME,
    end_time TIME,
    date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'live', 'done', 'cancelled')),
    languages TEXT[] DEFAULT '{"de", "en"}'::text[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Attendees
CREATE TABLE IF NOT EXISTS public.cp_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.cp_organizations(id) ON DELETE CASCADE,
    conference_id UUID NOT NULL REFERENCES public.cp_conferences(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT,
    preferred_language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'cancelled')),
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Translation Sessions (Live Tracking)
CREATE TABLE IF NOT EXISTS public.cp_translation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.cp_organizations(id) ON DELETE CASCADE,
    conference_id UUID NOT NULL REFERENCES public.cp_conferences(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.cp_sessions(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_languages TEXT[] NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    join_code TEXT UNIQUE NOT NULL,
    minutes_used INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ
);

-- 7. Import Jobs (PDF/Excel Uploads)
CREATE TABLE IF NOT EXISTS public.cp_import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.cp_organizations(id) ON DELETE CASCADE,
    conference_id UUID REFERENCES public.cp_conferences(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'url', 'excel', 'manual')),
    source_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
    progress INTEGER DEFAULT 0,
    result_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.cp_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cp_conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cp_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cp_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cp_translation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cp_import_jobs ENABLE ROW LEVEL SECURITY;

-- Basic RLS: Owners can see and edit their own data
CREATE POLICY "Owners can manage their organizations" ON public.cp_organizations FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Owners can manage their conferences" ON public.cp_conferences FOR ALL USING (organization_id IN (SELECT id FROM public.cp_organizations WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can manage their speakers" ON public.cp_speakers FOR ALL USING (organization_id IN (SELECT id FROM public.cp_organizations WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can manage their sessions" ON public.cp_sessions FOR ALL USING (organization_id IN (SELECT id FROM public.cp_organizations WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can manage their attendees" ON public.cp_attendees FOR ALL USING (organization_id IN (SELECT id FROM public.cp_organizations WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can manage their translation sessions" ON public.cp_translation_sessions FOR ALL USING (organization_id IN (SELECT id FROM public.cp_organizations WHERE owner_id = auth.uid()));
CREATE POLICY "Owners can manage their import jobs" ON public.cp_import_jobs FOR ALL USING (organization_id IN (SELECT id FROM public.cp_organizations WHERE owner_id = auth.uid()));
