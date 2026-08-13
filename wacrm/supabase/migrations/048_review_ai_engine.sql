-- Migration 048: Review AI Engine - humanized response columns
ALTER TABLE reputation_settings
  ADD COLUMN IF NOT EXISTS brand_voice JSONB DEFAULT '{"tone": "warm", "style": "", "customInstructions": ""}',
  ADD COLUMN IF NOT EXISTS ai_model_preference TEXT DEFAULT 'auto';

ALTER TABLE review_requests
  ADD COLUMN IF NOT EXISTS ai_confidence_score DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS ai_model_used TEXT,
  ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;
