use crate::{error::AppError, models::Workout};
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

#[allow(dead_code)]
pub async fn list_by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Workout>, AppError> {
    sqlx::query_as::<_, Workout>(
        "SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn list_filtered(
    pool: &PgPool,
    user_id: Uuid,
    category: Option<&str>,
    completed: Option<bool>,
    limit: i64,
    offset: i64,
) -> Result<Vec<Workout>, AppError> {
    sqlx::query_as::<_, Workout>(
        r#"
        SELECT * FROM workouts
        WHERE user_id = $1
          AND ($2::text IS NULL OR category = $2)
          AND ($3::bool IS NULL OR ($3 = true AND completed_at IS NOT NULL) OR ($3 = false AND completed_at IS NULL))
        ORDER BY created_at DESC
        LIMIT $4 OFFSET $5
        "#,
    )
    .bind(user_id)
    .bind(category)
    .bind(completed)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn find_by_id(
    pool: &PgPool,
    id: Uuid,
    user_id: Uuid,
) -> Result<Option<Workout>, AppError> {
    sqlx::query_as::<_, Workout>("SELECT * FROM workouts WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(AppError::Database)
}

pub async fn create(
    pool: &PgPool,
    user_id: Uuid,
    title: &str,
    description: Option<&str>,
    duration_minutes: i32,
    intensity: &str,
    category: &str,
) -> Result<Workout, AppError> {
    sqlx::query_as::<_, Workout>(
        "INSERT INTO workouts (user_id, title, description, duration_minutes, intensity, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    )
    .bind(user_id)
    .bind(title)
    .bind(description)
    .bind(duration_minutes)
    .bind(intensity)
    .bind(category)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
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
) -> Result<Option<Workout>, AppError> {
    sqlx::query_as::<_, Workout>(
        r#"
        UPDATE workouts
        SET
            title = COALESCE($3, title),
            description = COALESCE($4, description),
            duration_minutes = COALESCE($5, duration_minutes),
            intensity = COALESCE($6, intensity),
            category = COALESCE($7, category),
            updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(user_id)
    .bind(title)
    .bind(description)
    .bind(duration_minutes)
    .bind(intensity)
    .bind(category)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn complete(
    pool: &PgPool,
    workout_id: Uuid,
    user_id: Uuid,
) -> Result<Option<Workout>, AppError> {
    sqlx::query_as::<_, Workout>(
        "UPDATE workouts SET completed_at = $1 WHERE id = $2 AND user_id = $3 AND completed_at IS NULL RETURNING *",
    )
    .bind(Utc::now())
    .bind(workout_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)
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
