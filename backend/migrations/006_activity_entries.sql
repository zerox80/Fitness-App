CREATE TABLE IF NOT EXISTS activity_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    name VARCHAR(200) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    intensity VARCHAR(50) NOT NULL DEFAULT 'unbekannt',
    calories INTEGER NOT NULL DEFAULT 0,
    source VARCHAR(50) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT activity_entries_duration_range CHECK (duration_minutes >= 0 AND duration_minutes <= 1440),
    CONSTRAINT activity_entries_calories_range CHECK (calories >= 0 AND calories <= 10000)
);

CREATE INDEX IF NOT EXISTS idx_activity_entries_user_id_date
ON activity_entries(user_id, activity_date);
