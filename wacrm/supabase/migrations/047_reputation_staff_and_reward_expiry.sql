-- Migration 047: Reputation Staff Collection and Reward Expiry Settings
ALTER TABLE reputation_settings
  ADD COLUMN IF NOT EXISTS reward_valid_days INTEGER DEFAULT 15;

ALTER TABLE review_requests
  ADD COLUMN IF NOT EXISTS reward_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discount_code TEXT;
