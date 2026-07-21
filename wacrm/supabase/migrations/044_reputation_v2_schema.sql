-- ============================================================
-- REPUTATION V2: SMART CUSTOMER EXPERIENCE PLATFORM
-- ============================================================

-- Extend reputation_settings with V2 columns
ALTER TABLE reputation_settings
  ADD COLUMN IF NOT EXISTS owner_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS welcome_message TEXT,
  ADD COLUMN IF NOT EXISTS branding_color TEXT DEFAULT '#f59e0b',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS enable_spin_wheel BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_voice_review BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_ai_chips BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS rewards_config JSONB DEFAULT '[]'::jsonb;

-- Extend review_requests with V2 columns
ALTER TABLE review_requests
  ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS table_number TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'qr_web' CHECK (source_type IN ('qr_web', 'qr_whatsapp', 'direct_link')),
  ADD COLUMN IF NOT EXISTS ai_generated_text TEXT,
  ADD COLUMN IF NOT EXISTS voice_transcript TEXT,
  ADD COLUMN IF NOT EXISTS sentiment_score REAL CHECK (sentiment_score BETWEEN -1 AND 1),
  ADD COLUMN IF NOT EXISTS tags_selected TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recovery_action_requested TEXT CHECK (recovery_action_requested IN ('refund', 'replace', 'manager_call', 'coupon')),
  ADD COLUMN IF NOT EXISTS spin_reward_claimed TEXT,
  ADD COLUMN IF NOT EXISTS recovery_resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recovery_status TEXT DEFAULT 'pending' CHECK (recovery_status IN ('pending', 'manager_contacted', 'resolved'));

-- Create staff_members table
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Staff',
  qr_slug TEXT UNIQUE,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_members_account ON staff_members(account_id);

DROP TRIGGER IF EXISTS set_updated_at ON staff_members;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_members_select ON staff_members;
DROP POLICY IF EXISTS staff_members_insert ON staff_members;
DROP POLICY IF EXISTS staff_members_update ON staff_members;
DROP POLICY IF EXISTS staff_members_delete ON staff_members;

CREATE POLICY staff_members_select ON staff_members FOR SELECT USING (has_permission(account_id, 'contacts.view'));
CREATE POLICY staff_members_insert ON staff_members FOR INSERT WITH CHECK (has_permission(account_id, 'contacts.edit'));
CREATE POLICY staff_members_update ON staff_members FOR UPDATE USING (has_permission(account_id, 'contacts.edit'));
CREATE POLICY staff_members_delete ON staff_members FOR DELETE USING (has_permission(account_id, 'contacts.delete'));

-- Create customer_loyalty_passes table
CREATE TABLE IF NOT EXISTS customer_loyalty_passes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  total_visits INTEGER DEFAULT 1,
  stamps_count INTEGER DEFAULT 1,
  rewards_unlocked JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_passes_account ON customer_loyalty_passes(account_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_passes_contact ON customer_loyalty_passes(contact_id);

DROP TRIGGER IF EXISTS set_updated_at ON customer_loyalty_passes;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON customer_loyalty_passes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE customer_loyalty_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_loyalty_passes_select ON customer_loyalty_passes;
DROP POLICY IF EXISTS customer_loyalty_passes_insert ON customer_loyalty_passes;
DROP POLICY IF EXISTS customer_loyalty_passes_update ON customer_loyalty_passes;
DROP POLICY IF EXISTS customer_loyalty_passes_delete ON customer_loyalty_passes;

CREATE POLICY customer_loyalty_passes_select ON customer_loyalty_passes FOR SELECT USING (has_permission(account_id, 'contacts.view'));
CREATE POLICY customer_loyalty_passes_insert ON customer_loyalty_passes FOR INSERT WITH CHECK (has_permission(account_id, 'contacts.edit'));
CREATE POLICY customer_loyalty_passes_update ON customer_loyalty_passes FOR UPDATE USING (has_permission(account_id, 'contacts.edit'));
CREATE POLICY customer_loyalty_passes_delete ON customer_loyalty_passes FOR DELETE USING (has_permission(account_id, 'contacts.delete'));

-- Create review_heatmaps table for aggregated analytics
CREATE TABLE IF NOT EXISTS review_heatmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  hour_of_day SMALLINT NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  total_ratings INTEGER DEFAULT 0,
  avg_rating REAL DEFAULT 0,
  low_rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, day_of_week, hour_of_day)
);

CREATE INDEX IF NOT EXISTS idx_review_heatmaps_account ON review_heatmaps(account_id);

DROP TRIGGER IF EXISTS set_updated_at ON review_heatmaps;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON review_heatmaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE review_heatmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS review_heatmaps_select ON review_heatmaps;
DROP POLICY IF EXISTS review_heatmaps_insert ON review_heatmaps;
DROP POLICY IF EXISTS review_heatmaps_update ON review_heatmaps;
DROP POLICY IF EXISTS review_heatmaps_delete ON review_heatmaps;

CREATE POLICY review_heatmaps_select ON review_heatmaps FOR SELECT USING (has_permission(account_id, 'contacts.view'));
CREATE POLICY review_heatmaps_insert ON review_heatmaps FOR INSERT WITH CHECK (has_permission(account_id, 'contacts.edit'));
CREATE POLICY review_heatmaps_update ON review_heatmaps FOR UPDATE USING (has_permission(account_id, 'contacts.edit'));
CREATE POLICY review_heatmaps_delete ON review_heatmaps FOR DELETE USING (has_permission(account_id, 'contacts.delete'));

-- Public RLS for review_requests new columns (anonymous customers)
DROP POLICY IF EXISTS review_requests_public_select ON review_requests;
CREATE POLICY review_requests_public_select ON review_requests
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS review_requests_public_update ON review_requests;
CREATE POLICY review_requests_public_update ON review_requests
  FOR UPDATE TO anon USING (true);
