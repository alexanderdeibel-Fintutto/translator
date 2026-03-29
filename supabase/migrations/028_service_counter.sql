-- ============================================================================
-- Migration 028: Service Counter Schema
-- Description: Tables for service-staff (hotel reception, retail, trade fair)
--              and service-guest (walk-in customer translation receiver)
-- Prefix: sc_ (Service Counter)
-- ============================================================================

-- 1. Counter Locations (z.B. "Rezeption EG", "Kasse 3", "Messestand B12")
CREATE TABLE IF NOT EXISTS public.sc_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.gt_organizations(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    counter_type TEXT DEFAULT 'reception' CHECK (counter_type IN (
        'reception', 'retail', 'trade_fair', 'medical', 'authority', 'other'
    )),
    default_staff_language TEXT DEFAULT 'de',
    active_languages TEXT[] DEFAULT '{"de","en","fr","es","ar","tr","uk","ru"}'::text[],
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Counter Staff Assignments (Wer ist an welchem Counter)
CREATE TABLE IF NOT EXISTS public.sc_staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counter_id UUID NOT NULL REFERENCES public.sc_counters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
    shift_start TIME,
    shift_end TIME,
    active_days TEXT[] DEFAULT '{"mon","tue","wed","thu","fri"}'::text[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(counter_id, user_id)
);

-- 3. Quick Phrase Sets (Vordefinierte Sätze pro Counter-Typ)
CREATE TABLE IF NOT EXISTS public.sc_phrase_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.gt_organizations(id) ON DELETE CASCADE,
    counter_id UUID REFERENCES public.sc_counters(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    counter_type TEXT DEFAULT 'reception',
    language TEXT DEFAULT 'de',
    is_global BOOLEAN DEFAULT false,  -- true = für alle Counters dieses Typs
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Quick Phrases (Einzelne Sätze in einem Set)
CREATE TABLE IF NOT EXISTS public.sc_phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phrase_set_id UUID NOT NULL REFERENCES public.sc_phrase_sets(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN (
        'greeting', 'checkout', 'directions', 'help', 'waiting', 'documents', 'general'
    )),
    sort_order INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Counter Sessions (Einzelne Übersetzungs-Gespräche am Counter)
CREATE TABLE IF NOT EXISTS public.sc_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counter_id UUID REFERENCES public.sc_counters(id) ON DELETE SET NULL,
    staff_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_type TEXT DEFAULT 'conversation' CHECK (session_type IN (
        'conversation',   -- 1:1 Gespräch (ConversationPage)
        'live_broadcast', -- 1:many (LiveSessionPage)
        'text_translate'  -- Nur Text (TranslatorPage)
    )),
    guest_language TEXT,
    staff_language TEXT DEFAULT 'de',
    session_code TEXT,  -- Verknüpfung mit gt_event_sessions wenn live_broadcast
    message_count INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Counter Usage Stats (Tagesstatistiken pro Counter)
CREATE TABLE IF NOT EXISTS public.sc_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counter_id UUID NOT NULL REFERENCES public.sc_counters(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.gt_organizations(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sessions_count INTEGER DEFAULT 0,
    conversations_count INTEGER DEFAULT 0,
    broadcasts_count INTEGER DEFAULT 0,
    translations_count INTEGER DEFAULT 0,
    unique_languages INTEGER DEFAULT 0,
    top_languages TEXT[] DEFAULT '{}'::text[],
    total_duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(counter_id, stat_date)
);

-- 7. Guest Feedback (Optional — Gäste können kurzes Feedback geben)
CREATE TABLE IF NOT EXISTS public.sc_guest_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sc_sessions(id) ON DELETE SET NULL,
    counter_id UUID REFERENCES public.sc_counters(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sc_counters_org ON public.sc_counters(organization_id);
CREATE INDEX IF NOT EXISTS idx_sc_counters_owner ON public.sc_counters(owner_id);
CREATE INDEX IF NOT EXISTS idx_sc_staff_counter ON public.sc_staff_assignments(counter_id);
CREATE INDEX IF NOT EXISTS idx_sc_staff_user ON public.sc_staff_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_sc_sessions_counter ON public.sc_sessions(counter_id);
CREATE INDEX IF NOT EXISTS idx_sc_sessions_staff ON public.sc_sessions(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_sc_sessions_started ON public.sc_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sc_usage_date ON public.sc_usage_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_sc_phrases_set ON public.sc_phrases(phrase_set_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.sc_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sc_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sc_phrase_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sc_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sc_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sc_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sc_guest_feedback ENABLE ROW LEVEL SECURITY;

-- sc_counters: Owner und zugewiesene Staff können lesen
CREATE POLICY "sc_counters_owner_all" ON public.sc_counters
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "sc_counters_staff_select" ON public.sc_counters
    FOR SELECT USING (
        id IN (
            SELECT counter_id FROM public.sc_staff_assignments
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- sc_staff_assignments: Owner des Counters kann verwalten
CREATE POLICY "sc_staff_owner_all" ON public.sc_staff_assignments
    FOR ALL USING (
        counter_id IN (
            SELECT id FROM public.sc_counters WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "sc_staff_self_select" ON public.sc_staff_assignments
    FOR SELECT USING (user_id = auth.uid());

-- sc_phrase_sets: Org-Mitglieder und Counter-Owner
CREATE POLICY "sc_phrase_sets_owner" ON public.sc_phrase_sets
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "sc_phrase_sets_global_select" ON public.sc_phrase_sets
    FOR SELECT USING (is_global = true);

-- sc_phrases: Über phrase_set_id
CREATE POLICY "sc_phrases_via_set" ON public.sc_phrases
    FOR ALL USING (
        phrase_set_id IN (
            SELECT id FROM public.sc_phrase_sets WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "sc_phrases_global_select" ON public.sc_phrases
    FOR SELECT USING (
        phrase_set_id IN (
            SELECT id FROM public.sc_phrase_sets WHERE is_global = true
        )
    );

-- sc_sessions: Staff kann eigene Sessions sehen und erstellen
CREATE POLICY "sc_sessions_staff_all" ON public.sc_sessions
    FOR ALL USING (staff_user_id = auth.uid());

CREATE POLICY "sc_sessions_counter_owner" ON public.sc_sessions
    FOR SELECT USING (
        counter_id IN (
            SELECT id FROM public.sc_counters WHERE owner_id = auth.uid()
        )
    );

-- sc_usage_stats: Counter-Owner kann lesen
CREATE POLICY "sc_usage_owner_select" ON public.sc_usage_stats
    FOR SELECT USING (
        counter_id IN (
            SELECT id FROM public.sc_counters WHERE owner_id = auth.uid()
        )
    );

-- sc_guest_feedback: Anonym einfügen erlaubt, lesen nur für Counter-Owner
CREATE POLICY "sc_feedback_insert_anon" ON public.sc_guest_feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "sc_feedback_owner_select" ON public.sc_guest_feedback
    FOR SELECT USING (
        counter_id IN (
            SELECT id FROM public.sc_counters WHERE owner_id = auth.uid()
        )
    );

-- ============================================================================
-- Trigger: updated_at automatisch setzen
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sc_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sc_counters_updated_at
    BEFORE UPDATE ON public.sc_counters
    FOR EACH ROW EXECUTE FUNCTION public.sc_set_updated_at();

CREATE TRIGGER sc_phrase_sets_updated_at
    BEFORE UPDATE ON public.sc_phrase_sets
    FOR EACH ROW EXECUTE FUNCTION public.sc_set_updated_at();

CREATE TRIGGER sc_usage_stats_updated_at
    BEFORE UPDATE ON public.sc_usage_stats
    FOR EACH ROW EXECUTE FUNCTION public.sc_set_updated_at();

-- ============================================================================
-- Function: Session beenden und Stats aktualisieren
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sc_end_session(
    p_session_id UUID,
    p_message_count INTEGER DEFAULT 0
)
RETURNS void AS $$
DECLARE
    v_session public.sc_sessions%ROWTYPE;
    v_duration INTEGER;
BEGIN
    SELECT * INTO v_session FROM public.sc_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN RETURN; END IF;

    v_duration := EXTRACT(EPOCH FROM (now() - v_session.started_at))::INTEGER;

    UPDATE public.sc_sessions
    SET ended_at = now(),
        duration_seconds = v_duration,
        message_count = p_message_count
    WHERE id = p_session_id;

    -- Usage Stats aktualisieren
    IF v_session.counter_id IS NOT NULL THEN
        INSERT INTO public.sc_usage_stats (counter_id, stat_date, sessions_count, total_duration_seconds)
        VALUES (v_session.counter_id, CURRENT_DATE, 1, v_duration)
        ON CONFLICT (counter_id, stat_date) DO UPDATE SET
            sessions_count = sc_usage_stats.sessions_count + 1,
            total_duration_seconds = sc_usage_stats.total_duration_seconds + v_duration,
            updated_at = now();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Seed: Globale Standard-Phrasen für Reception/Hotel
-- ============================================================================
INSERT INTO public.sc_phrase_sets (name, counter_type, language, is_global, created_by)
VALUES
    ('Hotel Rezeption — Deutsch', 'reception', 'de', true, NULL),
    ('Retail Counter — Deutsch', 'retail', 'de', true, NULL),
    ('Messe/Trade Fair — Deutsch', 'trade_fair', 'de', true, NULL)
ON CONFLICT DO NOTHING;

-- Phrasen für Hotel Rezeption
WITH ps AS (SELECT id FROM public.sc_phrase_sets WHERE name = 'Hotel Rezeption — Deutsch' LIMIT 1)
INSERT INTO public.sc_phrases (phrase_set_id, text, category, sort_order)
SELECT ps.id, phrase, cat, ord FROM ps, (VALUES
    ('Willkommen! Wie kann ich Ihnen helfen?', 'greeting', 1),
    ('Guten Morgen! Haben Sie eine Reservierung?', 'greeting', 2),
    ('Bitte zeigen Sie mir Ihren Ausweis.', 'documents', 3),
    ('Ihr Zimmer ist bereit.', 'general', 4),
    ('Der Aufzug ist rechts.', 'directions', 5),
    ('Das Frühstück ist von 7 bis 10 Uhr.', 'general', 6),
    ('Bitte warten Sie einen Moment.', 'waiting', 7),
    ('Ich rufe einen Kollegen.', 'help', 8),
    ('Auf Wiedersehen! Gute Reise!', 'greeting', 9),
    ('Wie war Ihr Aufenthalt?', 'general', 10)
) AS t(phrase, cat, ord)
ON CONFLICT DO NOTHING;
