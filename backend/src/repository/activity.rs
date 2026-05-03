use crate::{
    error::AppError,
    models::{DailyActivity, UserStats, WeeklyActivitySummary},
};
use chrono::NaiveDate;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn get_stats(pool: &PgPool, user_id: Uuid) -> Result<UserStats, AppError> {
    sqlx::query_as::<_, UserStats>(
        r#"
        SELECT 
            COUNT(*) as total_workouts,
            COALESCE(SUM(duration_minutes), 0) as total_minutes,
            COALESCE((
                WITH workout_dates AS (
                    SELECT DISTINCT created_at::date AS d
                    FROM workouts
                    WHERE user_id = $1
                    ORDER BY d DESC
                ),
                streak AS (
                    SELECT d, d - ROW_NUMBER() OVER (ORDER BY d DESC)::int AS grp
                    FROM workout_dates
                )
                SELECT COUNT(*) FROM streak
                WHERE grp = (SELECT grp FROM streak LIMIT 1)
            ), 0) as current_streak
        FROM workouts 
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn get_today(
    pool: &PgPool,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<Option<DailyActivity>, AppError> {
    sqlx::query_as::<_, DailyActivity>(
        r#"
        SELECT 
            COALESCE(steps, 0) as steps,
            COALESCE(calories, 0) as calories,
            COALESCE(active_minutes, 0) as active_minutes,
            COALESCE(move_progress, 0.0) as move_progress,
            COALESCE(exercise_progress, 0.0) as exercise_progress,
            COALESCE(stand_progress, 0.0) as stand_progress
        FROM activity_logs 
        WHERE user_id = $1 AND activity_date = $2
        "#,
    )
    .bind(user_id)
    .bind(date)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn upsert_today(
    pool: &PgPool,
    user_id: Uuid,
    date: NaiveDate,
    steps: i32,
    calories: i32,
    active_minutes: i32,
    move_progress: f64,
    exercise_progress: f64,
    stand_progress: f64,
) -> Result<DailyActivity, AppError> {
    sqlx::query_as::<_, DailyActivity>(
        r#"
        INSERT INTO activity_logs 
            (user_id, activity_date, steps, calories, active_minutes, move_progress, exercise_progress, stand_progress)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id, activity_date) 
        DO UPDATE SET
            steps = EXCLUDED.steps,
            calories = EXCLUDED.calories,
            active_minutes = EXCLUDED.active_minutes,
            move_progress = EXCLUDED.move_progress,
            exercise_progress = EXCLUDED.exercise_progress,
            stand_progress = EXCLUDED.stand_progress,
            updated_at = NOW()
        RETURNING steps, calories, active_minutes, move_progress, exercise_progress, stand_progress
        "#,
    )
    .bind(user_id)
    .bind(date)
    .bind(steps)
    .bind(calories)
    .bind(active_minutes)
    .bind(move_progress)
    .bind(exercise_progress)
    .bind(stand_progress)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn get_weekly_summary(
    pool: &PgPool,
    user_id: Uuid,
    week_start: NaiveDate,
) -> Result<WeeklyActivitySummary, AppError> {
    sqlx::query_as::<_, WeeklyActivitySummary>(
        r#"
        SELECT 
            $2 as week_start,
            COALESCE(SUM(steps), 0) as total_steps,
            COALESCE(SUM(calories), 0) as total_calories,
            COALESCE(SUM(active_minutes), 0) as total_active_minutes,
            (SELECT COUNT(*) FROM workouts WHERE user_id = $1 AND created_at::date BETWEEN $2 AND $2 + INTERVAL '6 days') as workout_count
        FROM activity_logs 
        WHERE user_id = $1 AND activity_date BETWEEN $2 AND $2 + INTERVAL '6 days'
        "#,
    )
    .bind(user_id)
    .bind(week_start)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}
