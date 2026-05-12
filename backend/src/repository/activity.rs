use crate::{
    error::AppError,
    models::{ActivityEntry, CreateActivityEntry, DailyActivity, UserStats, WeeklyActivitySummary},
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
) -> Result<DailyActivity, AppError> {
    sqlx::query_as::<_, DailyActivity>(
        r#"
        WITH base AS (
            SELECT
                COALESCE(steps, 0) as steps,
                COALESCE(calories, 0) as base_calories,
                COALESCE(active_minutes, 0) as base_active_minutes,
                COALESCE(move_progress, 0.0) as move_progress,
                COALESCE(exercise_progress, 0.0) as exercise_progress,
                COALESCE(stand_progress, 0.0) as stand_progress
            FROM activity_logs
            WHERE user_id = $1 AND activity_date = $2
        ),
        additional AS (
            SELECT
                COALESCE(SUM(calories), 0)::int as additional_calories,
                COALESCE(SUM(duration_minutes), 0)::int as additional_active_minutes
            FROM activity_entries
            WHERE user_id = $1 AND activity_date = $2
        )
        SELECT 
            COALESCE(base.steps, 0) as steps,
            COALESCE(base.base_calories, 0) + additional.additional_calories as calories,
            COALESCE(base.base_active_minutes, 0) + additional.additional_active_minutes as active_minutes,
            COALESCE(base.move_progress, 0.0) as move_progress,
            COALESCE(base.exercise_progress, 0.0) as exercise_progress,
            COALESCE(base.stand_progress, 0.0) as stand_progress,
            COALESCE(base.base_calories, 0) as base_calories,
            COALESCE(base.base_active_minutes, 0) as base_active_minutes,
            additional.additional_calories,
            additional.additional_active_minutes
        FROM additional
        LEFT JOIN base ON true
        "#,
    )
    .bind(user_id)
    .bind(date)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}

#[allow(clippy::too_many_arguments)]
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
) -> Result<(), AppError> {
    sqlx::query(
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
    .execute(pool)
    .await
    .map(|_| ())
    .map_err(AppError::Database)
}

pub async fn get_weekly_summary(
    pool: &PgPool,
    user_id: Uuid,
    week_start: NaiveDate,
) -> Result<WeeklyActivitySummary, AppError> {
    sqlx::query_as::<_, WeeklyActivitySummary>(
        r#"
        WITH base AS (
            SELECT
                COALESCE(SUM(steps), 0)::bigint as total_steps,
                COALESCE(SUM(calories), 0)::bigint as total_base_calories,
                COALESCE(SUM(active_minutes), 0)::bigint as total_base_active_minutes
            FROM activity_logs
            WHERE user_id = $1 AND activity_date BETWEEN $2 AND $2 + INTERVAL '6 days'
        ),
        additional AS (
            SELECT
                COALESCE(SUM(calories), 0)::bigint as total_additional_calories,
                COALESCE(SUM(duration_minutes), 0)::bigint as total_additional_active_minutes
            FROM activity_entries
            WHERE user_id = $1 AND activity_date BETWEEN $2 AND $2 + INTERVAL '6 days'
        )
        SELECT 
            $2 as week_start,
            base.total_steps,
            base.total_base_calories + additional.total_additional_calories as total_calories,
            base.total_base_active_minutes + additional.total_additional_active_minutes as total_active_minutes,
            (SELECT COUNT(*) FROM workouts WHERE user_id = $1 AND created_at::date BETWEEN $2 AND $2 + INTERVAL '6 days') as workout_count
        FROM base
        CROSS JOIN additional
        "#,
    )
    .bind(user_id)
    .bind(week_start)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn list_entries(
    pool: &PgPool,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<Vec<ActivityEntry>, AppError> {
    sqlx::query_as::<_, ActivityEntry>(
        r#"
        SELECT
            id,
            user_id,
            activity_date,
            name,
            duration_minutes,
            intensity,
            calories,
            source,
            created_at,
            updated_at
        FROM activity_entries
        WHERE user_id = $1 AND activity_date = $2
        ORDER BY created_at DESC, id DESC
        "#,
    )
    .bind(user_id)
    .bind(date)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn create_entries(
    pool: &PgPool,
    user_id: Uuid,
    date: NaiveDate,
    entries: &[CreateActivityEntry],
) -> Result<Vec<ActivityEntry>, AppError> {
    let mut tx = pool.begin().await.map_err(AppError::Database)?;
    let mut created = Vec::with_capacity(entries.len());

    for entry in entries {
        let row = sqlx::query_as::<_, ActivityEntry>(
            r#"
            INSERT INTO activity_entries
                (user_id, activity_date, name, duration_minutes, intensity, calories, source)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id,
                user_id,
                activity_date,
                name,
                duration_minutes,
                intensity,
                calories,
                source,
                created_at,
                updated_at
            "#,
        )
        .bind(user_id)
        .bind(date)
        .bind(entry.name.trim())
        .bind(entry.duration_minutes)
        .bind(entry.intensity.trim())
        .bind(entry.calories)
        .bind(entry.source.as_deref().map(str::trim).unwrap_or("manual"))
        .fetch_one(&mut *tx)
        .await
        .map_err(AppError::Database)?;

        created.push(row);
    }

    tx.commit().await.map_err(AppError::Database)?;
    Ok(created)
}

pub async fn delete_entry(
    pool: &PgPool,
    entry_id: Uuid,
    user_id: Uuid,
) -> Result<Option<NaiveDate>, AppError> {
    let row = sqlx::query_scalar::<_, NaiveDate>(
        r#"
        DELETE FROM activity_entries
        WHERE id = $1 AND user_id = $2
        RETURNING activity_date
        "#,
    )
    .bind(entry_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(row)
}
