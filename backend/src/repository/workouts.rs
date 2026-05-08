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
    exercises: String,
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
    COALESCE(exercises, '[]'::jsonb)::text AS exercises,
    completed_at,
    created_at,
    updated_at
    "#
}

fn workout_from_row(row: WorkoutRow) -> Result<Workout, AppError> {
    let exercises = serde_json::from_str::<Vec<WorkoutExercise>>(&row.exercises)
        .map_err(|err| AppError::Internal(format!("Failed to parse workout exercises: {}", err)))?;

    Ok(Workout {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        duration_minutes: row.duration_minutes,
        intensity: row.intensity,
        category: row.category,
        exercises,
        completed_at: row.completed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

#[allow(dead_code)]
pub async fn list_by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Workout>, AppError> {
    let query = format!(
        "SELECT {} FROM workouts WHERE user_id = $1 ORDER BY created_at DESC",
        select_workout_columns()
    );
    let rows = sqlx::query_as::<_, WorkoutRow>(&query)
        .bind(user_id)
        .fetch_all(pool)
        .await
        .map_err(AppError::Database)?;

    rows.into_iter().map(workout_from_row).collect()
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
    let exercises_json = serde_json::to_string(exercises).map_err(|err| {
        AppError::Internal(format!("Failed to serialize workout exercises: {}", err))
    })?;
    let query = format!(
        r#"
        INSERT INTO workouts (user_id, title, description, duration_minutes, intensity, category, exercises)
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
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
        .bind(exercises_json)
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
    description: Option<&str>,
    duration_minutes: Option<i32>,
    intensity: Option<&str>,
    category: Option<&str>,
    exercises: Option<&[WorkoutExercise]>,
) -> Result<Option<Workout>, AppError> {
    let exercises_json = exercises
        .map(serde_json::to_string)
        .transpose()
        .map_err(|err| {
            AppError::Internal(format!("Failed to serialize workout exercises: {}", err))
        })?;
    let query = format!(
        r#"
        UPDATE workouts
        SET
            title = COALESCE($3, title),
            description = COALESCE($4, description),
            duration_minutes = COALESCE($5, duration_minutes),
            intensity = COALESCE($6, intensity),
            category = COALESCE($7, category),
            exercises = COALESCE($8::jsonb, exercises),
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
        .bind(description)
        .bind(duration_minutes)
        .bind(intensity)
        .bind(category)
        .bind(exercises_json)
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
    let query = format!(
        "UPDATE workouts SET completed_at = $1 WHERE id = $2 AND user_id = $3 AND completed_at IS NULL RETURNING {}",
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
