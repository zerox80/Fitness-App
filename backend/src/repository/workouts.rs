use crate::{
    error::AppError,
    models::{Workout, WorkoutExercise},
};
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
struct WorkoutRow {
    id: Uuid,
    user_id: Uuid,
    title: String,
    description: Option<String>,
    duration_minutes: i32,
    intensity: String,
    category: String,
    exercises: sqlx::types::Json<Vec<WorkoutExercise>>,
    completed_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

fn select_workout_columns() -> &'static str {
    r#"
    id,
    user_id,
    title,
    description,
    duration_minutes,
    intensity,
    category,
    COALESCE(exercises, '[]'::jsonb) AS exercises,
    completed_at,
    created_at,
    updated_at
    "#
}

fn workout_from_row(row: WorkoutRow) -> Result<Workout, AppError> {
    Ok(Workout {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        duration_minutes: row.duration_minutes,
        intensity: row.intensity,
        category: row.category,
        exercises: row.exercises.0,
        completed_at: row.completed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub async fn list_filtered(
    pool: &PgPool,
    user_id: Uuid,
    category: Option<&str>,
    completed: Option<bool>,
    limit: i64,
    offset: i64,
) -> Result<Vec<Workout>, AppError> {
    let query = format!(
        r#"
        SELECT {} FROM workouts
        WHERE user_id = $1
          AND ($2::text IS NULL OR category = $2)
          AND ($3::bool IS NULL OR ($3 = true AND completed_at IS NOT NULL) OR ($3 = false AND completed_at IS NULL))
        ORDER BY created_at DESC
        LIMIT $4 OFFSET $5
        "#,
        select_workout_columns()
    );
    let rows = sqlx::query_as::<_, WorkoutRow>(&query)
        .bind(user_id)
        .bind(category)
        .bind(completed)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
        .map_err(AppError::Database)?;

    rows.into_iter().map(workout_from_row).collect()
}

pub async fn find_by_id(
    pool: &PgPool,
    id: Uuid,
    user_id: Uuid,
) -> Result<Option<Workout>, AppError> {
    let query = format!(
        "SELECT {} FROM workouts WHERE id = $1 AND user_id = $2",
        select_workout_columns()
    );
    let row = sqlx::query_as::<_, WorkoutRow>(&query)
        .bind(id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(AppError::Database)?;

    row.map(workout_from_row).transpose()
}

#[allow(clippy::too_many_arguments)]
pub async fn create(
    pool: &PgPool,
    user_id: Uuid,
    title: &str,
    description: Option<&str>,
    duration_minutes: i32,
    intensity: &str,
    category: &str,
    exercises: &[WorkoutExercise],
) -> Result<Workout, AppError> {
    let query = format!(
        r#"
        INSERT INTO workouts (user_id, title, description, duration_minutes, intensity, category, exercises)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING {}
        "#,
        select_workout_columns()
    );

    let row = sqlx::query_as::<_, WorkoutRow>(&query)
        .bind(user_id)
        .bind(title)
        .bind(description)
        .bind(duration_minutes)
        .bind(intensity)
        .bind(category)
        .bind(sqlx::types::Json(exercises))
        .fetch_one(pool)
        .await
        .map_err(AppError::Database)?;

    workout_from_row(row)
}

#[allow(clippy::too_many_arguments)]
pub async fn update(
    pool: &PgPool,
    id: Uuid,
    user_id: Uuid,
    title: Option<&str>,
    description: Option<Option<&str>>,
    duration_minutes: Option<i32>,
    intensity: Option<&str>,
    category: Option<&str>,
    exercises: Option<&[WorkoutExercise]>,
) -> Result<Option<Workout>, AppError> {
    let description_is_set = description.is_some();
    let description_value = description.flatten();
    let query = format!(
        r#"
        UPDATE workouts
        SET
            title = COALESCE($3, title),
            description = CASE WHEN $4 THEN $5 ELSE description END,
            duration_minutes = COALESCE($6, duration_minutes),
            intensity = COALESCE($7, intensity),
            category = COALESCE($8, category),
            exercises = COALESCE($9, exercises),
            updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING {}
        "#,
        select_workout_columns()
    );

    let row = sqlx::query_as::<_, WorkoutRow>(&query)
        .bind(id)
        .bind(user_id)
        .bind(title)
        .bind(description_is_set)
        .bind(description_value)
        .bind(duration_minutes)
        .bind(intensity)
        .bind(category)
        .bind(exercises.map(sqlx::types::Json))
        .fetch_optional(pool)
        .await
        .map_err(AppError::Database)?;

    row.map(workout_from_row).transpose()
}

pub async fn complete(
    pool: &PgPool,
    workout_id: Uuid,
    user_id: Uuid,
) -> Result<Option<Workout>, AppError> {
    // Idempotent: completing an already-completed workout keeps the original
    // completion time and returns the workout instead of a 404.
    let query = format!(
        "UPDATE workouts SET completed_at = COALESCE(completed_at, $1) WHERE id = $2 AND user_id = $3 RETURNING {}",
        select_workout_columns()
    );
    let row = sqlx::query_as::<_, WorkoutRow>(&query)
        .bind(Utc::now())
        .bind(workout_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(AppError::Database)?;

    row.map(workout_from_row).transpose()
}

pub async fn delete(pool: &PgPool, workout_id: Uuid, user_id: Uuid) -> Result<u64, AppError> {
    let result = sqlx::query("DELETE FROM workouts WHERE id = $1 AND user_id = $2")
        .bind(workout_id)
        .bind(user_id)
        .execute(pool)
        .await
        .map_err(AppError::Database)?;

    Ok(result.rows_affected())
}

pub async fn delete_all_for_user(pool: &PgPool, user_id: Uuid) -> Result<u64, AppError> {
    let result = sqlx::query("DELETE FROM workouts WHERE user_id = $1")
        .bind(user_id)
        .execute(pool)
        .await
        .map_err(AppError::Database)?;

    Ok(result.rows_affected())
}
