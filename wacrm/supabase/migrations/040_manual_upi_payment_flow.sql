-- ============================================================
-- 040_manual_upi_payment_flow.sql
--
-- MVP manual UPI payment system (temporary until Razorpay).
--
-- 1. upi_payment_settings  – singleton row managed by Super Admin
-- 2. pending_payments      – each manual UPI payment submission
-- 3. payment-scans bucket  – customer screenshot uploads
-- ============================================================

-- 1. UPI payment settings (singleton)
CREATE TABLE IF NOT EXISTS upi_payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id TEXT NOT NULL DEFAULT '',
  account_name TEXT NOT NULL DEFAULT '',
  qr_image_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

INSERT INTO upi_payment_settings (upi_id, account_name)
VALUES ('', '')
ON CONFLICT DO NOTHING;

-- 2. Pending payment verification requests
CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  plan_tier TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  utr_number TEXT NOT NULL,
  screenshot_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'info_requested')),
  admin_notes TEXT DEFAULT '',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-scans', 'payment-scans', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads (users may not have a workspace yet)
CREATE POLICY "Anyone can upload payment scans"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-scans');

CREATE POLICY "Anyone can read payment scans"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-scans');

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);
