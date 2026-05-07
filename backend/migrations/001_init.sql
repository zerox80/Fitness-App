CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    intensity VARCHAR(50) NOT NULL DEFAULT 'moderate',
    category VARCHAR(50) NOT NULL DEFAULT 'strength',
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    steps INTEGER NOT NULL DEFAULT 0,
    calories INTEGER NOT NULL DEFAULT 0,
    active_minutes INTEGER NOT NULL DEFAULT 0,
    move_progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    exercise_progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    stand_progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, activity_date)
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_activity_logs_user_id_date ON activity_logs(user_id, activity_date);

CREATE TYPE muscle_group AS ENUM (
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'abs', 'legs',
    'glutes', 'calves', 'forearms', 'traps', 'lats', 'hamstrings', 'quadriceps'
);

CREATE TYPE equipment_type AS ENUM (
    'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable',
    'bodyweight', 'resistance_band', 'medicine_ball',
    'bench', 'squat_rack', 'pull_up_bar', 'dip_station', 'treadmill', 'none'
);

CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    muscle_groups muscle_group[] NOT NULL DEFAULT '{}',
    equipment equipment_type[] NOT NULL DEFAULT '{}',
    difficulty difficulty_level NOT NULL DEFAULT 'beginner',
    instructions TEXT[],
    image_url TEXT,
    video_url TEXT,
    is_custom BOOLEAN NOT NULL DEFAULT false,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN (muscle_groups);
CREATE INDEX idx_exercises_equipment ON exercises USING GIN (equipment);
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
