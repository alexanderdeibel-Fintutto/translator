-- Partners, Offers, Bookings & Mass-Invite CRM
-- Partners are businesses (restaurants, shops, services) that participate on the platform
-- They become POIs, can create offers, and are bookable through the app
-- Prefix: cg_ (City Guide)

-- ============================================================================
-- 1. PARTNERS (Gewerbetreibende — Restaurants, Hotels, Shops, Dienstleister)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,
  region_id UUID REFERENCES cg_regions(id) ON DELETE CASCADE,
  -- Business info
  business_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'restaurant',
  -- Types: restaurant, hotel, shop, service, cafe, bar, nightclub, wellness, sport, tour_operator, transport, other
  description JSONB DEFAULT '{}',                  -- multilingual
  short_description JSONB DEFAULT '{}',
  logo_url TEXT,
  cover_image_url TEXT,
  gallery JSONB DEFAULT '[]',
  -- Contact & location
  address JSONB DEFAULT '{}',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  email TEXT,
  website TEXT,
  social_media JSONB DEFAULT '{}',                 -- { instagram, facebook, tiktok, ... }
  opening_hours JSONB DEFAULT '{}',
  -- Platform participation
  membership_tier TEXT DEFAULT 'basic',            -- basic (free listing), premium, featured
  membership_fee NUMERIC(10,2) DEFAULT 0,         -- what they pay to be on platform
  membership_paid_until TIMESTAMPTZ,
  -- We do NOT take commission — partners pay a flat fee or promote the app
  commission_rate NUMERIC(5,4) DEFAULT 0,         -- 0 = no commission (our model)
  -- Verification & status
  status TEXT NOT NULL DEFAULT 'invited',          -- invited, pending, active, suspended, archived
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  -- Contact person at the business
  contact_person_name TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  -- Invite tracking
  invite_token TEXT UNIQUE,
  invite_sent_at TIMESTAMPTZ,
  invite_accepted_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),      -- sales agent who invited them
  -- Settings
  accepts_bookings BOOLEAN DEFAULT false,
  accepts_offers BOOLEAN DEFAULT false,
  supported_languages TEXT[] DEFAULT '{de,en}',
  tags TEXT[] DEFAULT '{}',
  rating_avg NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cg_partners_scope CHECK (city_id IS NOT NULL OR region_id IS NOT NULL)
);

CREATE INDEX idx_cg_partners_city ON cg_partners(city_id);
CREATE INDEX idx_cg_partners_region ON cg_partners(region_id);
CREATE INDEX idx_cg_partners_type ON cg_partners(business_type);
CREATE INDEX idx_cg_partners_status ON cg_partners(status);
CREATE INDEX idx_cg_partners_slug ON cg_partners(slug);
CREATE INDEX idx_cg_partners_invite ON cg_partners(invite_token);
CREATE INDEX idx_cg_partners_location ON cg_partners(lat, lng);

-- Add FK from cg_pois to cg_partners (deferred from migration 017)
ALTER TABLE cg_pois ADD CONSTRAINT fk_cg_pois_partner
  FOREIGN KEY (partner_id) REFERENCES cg_partners(id) ON DELETE SET NULL;

-- Partner staff (login accounts for partner businesses)
CREATE TABLE IF NOT EXISTS cg_partner_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES cg_partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',              -- owner, manager, staff
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

CREATE INDEX idx_cg_partner_users_partner ON cg_partner_users(partner_id);
CREATE INDEX idx_cg_partner_users_user ON cg_partner_users(user_id);

-- ============================================================================
-- 2. OFFERS (Angebote von Partnern — Specials, Deals, Packages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES cg_partners(id) ON DELETE CASCADE,
  title JSONB NOT NULL DEFAULT '{}',               -- multilingual
  description JSONB DEFAULT '{}',
  short_description JSONB DEFAULT '{}',
  cover_image_url TEXT,
  gallery JSONB DEFAULT '[]',
  -- Pricing
  offer_type TEXT NOT NULL DEFAULT 'deal',         -- deal, package, experience, ticket, voucher
  original_price NUMERIC(10,2),
  offer_price NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  -- Availability
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  available_days JSONB DEFAULT '{}',               -- { mon: true, tue: true, ... }
  available_times JSONB DEFAULT '{}',              -- { from: "10:00", to: "18:00" }
  max_capacity INTEGER,                            -- per time slot
  total_quantity INTEGER,                          -- total available
  booked_count INTEGER DEFAULT 0,
  -- Booking settings
  is_bookable BOOLEAN DEFAULT true,
  requires_confirmation BOOLEAN DEFAULT false,     -- partner must confirm booking
  cancellation_policy TEXT DEFAULT 'flexible',     -- flexible, moderate, strict
  cancellation_hours INTEGER DEFAULT 24,
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',            -- draft, active, paused, expired, archived
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_offers_partner ON cg_offers(partner_id);
CREATE INDEX idx_cg_offers_status ON cg_offers(status);
CREATE INDEX idx_cg_offers_type ON cg_offers(offer_type);

-- ============================================================================
-- 3. BOOKINGS (Buchungen durch Besucher)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,             -- human-readable: CG-2024-XXXXX
  offer_id UUID NOT NULL REFERENCES cg_offers(id) ON DELETE RESTRICT,
  partner_id UUID NOT NULL REFERENCES cg_partners(id) ON DELETE RESTRICT,
  -- Visitor info (can be anonymous or logged in)
  visitor_user_id UUID REFERENCES auth.users(id),
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_phone TEXT,
  -- Booking details
  booking_date DATE NOT NULL,
  booking_time TIME,
  party_size INTEGER DEFAULT 1,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  -- No commission — we don't take a cut
  platform_fee NUMERIC(10,2) DEFAULT 0,
  -- Status flow: pending -> confirmed -> completed / cancelled / no_show
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ,
  -- Notes
  visitor_notes TEXT,
  partner_notes TEXT,
  -- QR code for check-in
  checkin_code TEXT UNIQUE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_bookings_offer ON cg_bookings(offer_id);
CREATE INDEX idx_cg_bookings_partner ON cg_bookings(partner_id);
CREATE INDEX idx_cg_bookings_visitor ON cg_bookings(visitor_user_id);
CREATE INDEX idx_cg_bookings_date ON cg_bookings(booking_date);
CREATE INDEX idx_cg_bookings_status ON cg_bookings(status);
CREATE INDEX idx_cg_bookings_number ON cg_bookings(booking_number);

-- ============================================================================
-- 4. MASS INVITE / CRM for partner acquisition
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_partner_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,
  region_id UUID REFERENCES cg_regions(id) ON DELETE CASCADE,
  -- Business data (imported via CSV, scraped, or manual)
  business_name TEXT NOT NULL,
  business_type TEXT DEFAULT 'restaurant',
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  -- CRM pipeline
  pipeline_stage TEXT NOT NULL DEFAULT 'new',
  -- Stages: new, contacted, interested, negotiating, onboarded, declined, lost
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  -- Invite tracking
  invite_token TEXT UNIQUE,
  invite_sent_at TIMESTAMPTZ,
  invite_opened_at TIMESTAMPTZ,
  invite_clicked_at TIMESTAMPTZ,
  invite_accepted_at TIMESTAMPTZ,
  invite_method TEXT,                              -- email, sms, whatsapp, in_person
  -- Conversion
  converted_partner_id UUID REFERENCES cg_partners(id),
  converted_at TIMESTAMPTZ,
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),      -- sales agent
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  -- Source tracking
  source TEXT DEFAULT 'manual',                    -- manual, csv_import, google_places, web_scrape
  source_data JSONB DEFAULT '{}',                  -- raw imported data
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_partner_leads_city ON cg_partner_leads(city_id);
CREATE INDEX idx_cg_partner_leads_region ON cg_partner_leads(region_id);
CREATE INDEX idx_cg_partner_leads_stage ON cg_partner_leads(pipeline_stage);
CREATE INDEX idx_cg_partner_leads_assigned ON cg_partner_leads(assigned_to);
CREATE INDEX idx_cg_partner_leads_email ON cg_partner_leads(email);
CREATE INDEX idx_cg_partner_leads_invite ON cg_partner_leads(invite_token);

-- Lead notes / activity log
CREATE TABLE IF NOT EXISTS cg_partner_lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES cg_partner_leads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'note',               -- note, call, email, meeting, status_change
  content TEXT NOT NULL,
  follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_partner_lead_notes_lead ON cg_partner_lead_notes(lead_id);

-- Bulk invite campaigns
CREATE TABLE IF NOT EXISTS cg_invite_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cg_cities(id) ON DELETE CASCADE,
  region_id UUID REFERENCES cg_regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_subject TEXT,
  template_body TEXT,                              -- email template with {business_name}, {invite_link} etc.
  channel TEXT NOT NULL DEFAULT 'email',           -- email, sms, whatsapp
  status TEXT NOT NULL DEFAULT 'draft',            -- draft, scheduled, sending, completed
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_invite_campaigns_city ON cg_invite_campaigns(city_id);

-- ============================================================================
-- 5. VISITOR REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cg_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poi_id UUID REFERENCES cg_pois(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES cg_partners(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES cg_offers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES cg_bookings(id) ON DELETE SET NULL,
  visitor_user_id UUID REFERENCES auth.users(id),
  visitor_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  language TEXT DEFAULT 'de',
  status TEXT DEFAULT 'published',                 -- published, flagged, removed
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cg_reviews_poi ON cg_reviews(poi_id);
CREATE INDEX idx_cg_reviews_partner ON cg_reviews(partner_id);

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE cg_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_partner_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_partner_lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_invite_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cg_reviews ENABLE ROW LEVEL SECURITY;

-- Public read for active partners and offers
CREATE POLICY "Public read active partners" ON cg_partners
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public read active offers" ON cg_offers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public read published reviews" ON cg_reviews
  FOR SELECT USING (status = 'published');

-- Visitors can insert reviews and bookings
CREATE POLICY "Visitors can create bookings" ON cg_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Visitors read own bookings" ON cg_bookings
  FOR SELECT USING (
    visitor_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM cg_partner_users pu WHERE pu.user_id = auth.uid() AND pu.partner_id = cg_bookings.partner_id)
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Visitors can create reviews" ON cg_reviews
  FOR INSERT WITH CHECK (true);

-- Partner users manage their own business data
CREATE POLICY "Partner users manage own partner" ON cg_partners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cg_partner_users pu WHERE pu.user_id = auth.uid() AND pu.partner_id = cg_partners.id)
    OR EXISTS (SELECT 1 FROM cg_staff s WHERE s.user_id = auth.uid() AND (s.city_id = cg_partners.city_id OR s.region_id = cg_partners.region_id) AND s.role IN ('admin', 'partner_manager'))
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Partner users manage own offers" ON cg_offers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cg_partner_users pu WHERE pu.user_id = auth.uid() AND pu.partner_id = cg_offers.partner_id)
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Partner users manage bookings" ON cg_bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cg_partner_users pu WHERE pu.user_id = auth.uid() AND pu.partner_id = cg_bookings.partner_id)
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Partner users read own records" ON cg_partner_users
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- CRM access for sales/admin
CREATE POLICY "Sales manage partner leads" ON cg_partner_leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
    OR EXISTS (SELECT 1 FROM cg_staff s WHERE s.user_id = auth.uid() AND (s.city_id = cg_partner_leads.city_id OR s.region_id = cg_partner_leads.region_id) AND s.role IN ('admin', 'partner_manager'))
  );

CREATE POLICY "Sales manage lead notes" ON cg_partner_lead_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Sales manage invite campaigns" ON cg_invite_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

-- Admin full access on partner_users
CREATE POLICY "Admin full access cg_partner_users" ON cg_partner_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

CREATE TRIGGER cg_partners_updated_at
  BEFORE UPDATE ON cg_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cg_offers_updated_at
  BEFORE UPDATE ON cg_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cg_bookings_updated_at
  BEFORE UPDATE ON cg_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cg_partner_leads_updated_at
  BEFORE UPDATE ON cg_partner_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cg_invite_campaigns_updated_at
  BEFORE UPDATE ON cg_invite_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 8. HELPER: Generate booking number
-- ============================================================================

CREATE OR REPLACE FUNCTION cg_generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_number := 'CG-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 99999 + 1)::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cg_bookings_generate_number
  BEFORE INSERT ON cg_bookings
  FOR EACH ROW
  WHEN (NEW.booking_number IS NULL)
  EXECUTE FUNCTION cg_generate_booking_number();

-- ============================================================================
-- 9. HELPER: Generate invite token
-- ============================================================================

CREATE OR REPLACE FUNCTION cg_generate_invite_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_token IS NULL THEN
    NEW.invite_token := encode(gen_random_bytes(24), 'base64');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cg_partners_generate_invite
  BEFORE INSERT ON cg_partners
  FOR EACH ROW EXECUTE FUNCTION cg_generate_invite_token();

CREATE TRIGGER cg_partner_leads_generate_invite
  BEFORE INSERT ON cg_partner_leads
  FOR EACH ROW EXECUTE FUNCTION cg_generate_invite_token();
