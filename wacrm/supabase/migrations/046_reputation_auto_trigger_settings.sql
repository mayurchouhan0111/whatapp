-- Migration 046: Reputation Auto Trigger Settings
ALTER TABLE reputation_settings
  ADD COLUMN IF NOT EXISTS auto_send_review_on_create BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS manager_phone TEXT;
