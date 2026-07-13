-- ============================================================
-- REPUTATION ENGINE & GOOGLE REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS reputation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  google_review_url TEXT NOT NULL,
  gate_reviews BOOLEAN DEFAULT TRUE,
  review_threshold INTEGER DEFAULT 4 CHECK (review_threshold BETWEEN 1 AND 5),
  sms_template TEXT DEFAULT 'Hi {{contact_name}}, thank you for choosing {{business_name}}! We would appreciate it if you could take 30 seconds to review your experience: {{review_link}}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id)
);

CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'rated', 'clicked', 'failed')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_reputation_settings_account ON reputation_settings(account_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_account ON review_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_contact ON review_requests(contact_id);

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at ON reputation_settings;
DROP TRIGGER IF EXISTS set_updated_at ON review_requests;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reputation_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON review_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE reputation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES FOR REPUTATION SETTINGS
-- ============================================================

DROP POLICY IF EXISTS reputation_settings_select ON reputation_settings;
DROP POLICY IF EXISTS reputation_settings_insert ON reputation_settings;
DROP POLICY IF EXISTS reputation_settings_update ON reputation_settings;
DROP POLICY IF EXISTS reputation_settings_delete ON reputation_settings;

CREATE POLICY reputation_settings_select ON reputation_settings
  FOR SELECT USING (has_permission(account_id, 'contacts.view'));

CREATE POLICY reputation_settings_insert ON reputation_settings
  FOR INSERT WITH CHECK (has_permission(account_id, 'contacts.edit'));

CREATE POLICY reputation_settings_update ON reputation_settings
  FOR UPDATE USING (has_permission(account_id, 'contacts.edit'));

CREATE POLICY reputation_settings_delete ON reputation_settings
  FOR DELETE USING (has_permission(account_id, 'contacts.delete'));

-- ============================================================
-- RLS POLICIES FOR REVIEW REQUESTS (AUTHENTICATED MERCHANTS)
-- ============================================================

DROP POLICY IF EXISTS review_requests_select ON review_requests;
DROP POLICY IF EXISTS review_requests_insert ON review_requests;
DROP POLICY IF EXISTS review_requests_update ON review_requests;
DROP POLICY IF EXISTS review_requests_delete ON review_requests;

CREATE POLICY review_requests_select ON review_requests
  FOR SELECT USING (has_permission(account_id, 'contacts.view'));

CREATE POLICY review_requests_insert ON review_requests
  FOR INSERT WITH CHECK (has_permission(account_id, 'contacts.create'));

CREATE POLICY review_requests_update ON review_requests
  FOR UPDATE USING (has_permission(account_id, 'contacts.edit'));

CREATE POLICY review_requests_delete ON review_requests
  FOR DELETE USING (has_permission(account_id, 'contacts.delete'));

-- ============================================================
-- RLS POLICIES FOR REVIEW REQUESTS (ANONYMOUS CUSTOMERS BY UUID)
-- ============================================================

DROP POLICY IF EXISTS review_requests_public_select ON review_requests;
DROP POLICY IF EXISTS review_requests_public_update ON review_requests;

CREATE POLICY review_requests_public_select ON review_requests
  FOR SELECT TO anon USING (true);

CREATE POLICY review_requests_public_update ON review_requests
  FOR UPDATE TO anon USING (true);
