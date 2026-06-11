ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill so tokens issued before this migration stay valid: a token is
-- rejected when it was issued before password_changed_at.
UPDATE users
SET password_changed_at = created_at;
