UPDATE activity_logs
SET
    steps = LEAST(GREATEST(steps, 0), 200000),
    calories = LEAST(GREATEST(calories, 0), 20000),
    active_minutes = LEAST(GREATEST(active_minutes, 0), 1440),
    move_progress = LEAST(GREATEST(move_progress, 0.0), 10.0),
    exercise_progress = LEAST(GREATEST(exercise_progress, 0.0), 10.0),
    stand_progress = LEAST(GREATEST(stand_progress, 0.0), 10.0)
WHERE
    steps < 0 OR steps > 200000
    OR calories < 0 OR calories > 20000
    OR active_minutes < 0 OR active_minutes > 1440
    OR move_progress < 0.0 OR move_progress > 10.0 OR move_progress <> move_progress
    OR exercise_progress < 0.0 OR exercise_progress > 10.0 OR exercise_progress <> exercise_progress
    OR stand_progress < 0.0 OR stand_progress > 10.0 OR stand_progress <> stand_progress;

ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_steps_range;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_steps_range
CHECK (steps BETWEEN 0 AND 200000);

ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_calories_range;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_calories_range
CHECK (calories BETWEEN 0 AND 20000);

ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_active_minutes_range;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_active_minutes_range
CHECK (active_minutes BETWEEN 0 AND 1440);

ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_move_progress_range;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_move_progress_range
CHECK (move_progress >= 0.0 AND move_progress <= 10.0);

ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_exercise_progress_range;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_exercise_progress_range
CHECK (exercise_progress >= 0.0 AND exercise_progress <= 10.0);

ALTER TABLE activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_stand_progress_range;

ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_stand_progress_range
CHECK (stand_progress >= 0.0 AND stand_progress <= 10.0);
