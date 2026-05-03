use crate::{error::AppError, models::task::*};
use chrono::{NaiveDate, Utc};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn list_by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Task>, AppError> {
    sqlx::query_as::<_, Task>(
        "SELECT * FROM tasks WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn find_by_id(
    pool: &PgPool,
    id: Uuid,
    user_id: Uuid,
) -> Result<Option<Task>, AppError> {
    sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE id = $1 AND user_id = $2")
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
    recurrence: &TaskRecurrence,
    custom_days: &[i32],
    category: &TaskCategory,
) -> Result<Task, AppError> {
    sqlx::query_as::<_, Task>(
        r#"
        INSERT INTO tasks (user_id, title, description, recurrence, custom_days, category)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(title)
    .bind(description)
    .bind(recurrence)
    .bind(custom_days)
    .bind(category)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn update(
    pool: &PgPool,
    id: Uuid,
    user_id: Uuid,
    title: Option<&str>,
    description: Option<&str>,
    recurrence: Option<&TaskRecurrence>,
    custom_days: Option<&[i32]>,
    category: Option<&TaskCategory>,
    is_active: Option<bool>,
) -> Result<Option<Task>, AppError> {
    sqlx::query_as::<_, Task>(
        r#"
        UPDATE tasks
        SET
            title = COALESCE($3, title),
            description = COALESCE($4, description),
            recurrence = COALESCE($5, recurrence),
            custom_days = COALESCE($6, custom_days),
            category = COALESCE($7, category),
            is_active = COALESCE($8, is_active),
            updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(user_id)
    .bind(title)
    .bind(description)
    .bind(recurrence)
    .bind(custom_days)
    .bind(category)
    .bind(is_active)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn delete(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<u64, AppError> {
    let result = sqlx::query("DELETE FROM tasks WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(user_id)
        .execute(pool)
        .await
        .map_err(AppError::Database)?;
    Ok(result.rows_affected())
}

pub async fn complete_task(
    pool: &PgPool,
    task_id: Uuid,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<TaskCompletion, AppError> {
    sqlx::query_as::<_, TaskCompletion>(
        r#"
        INSERT INTO task_completions (task_id, user_id, completed_date)
        VALUES ($1, $2, $3)
        ON CONFLICT (task_id, completed_date) DO NOTHING
        RETURNING *
        "#,
    )
    .bind(task_id)
    .bind(user_id)
    .bind(date)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn uncomplete_task(
    pool: &PgPool,
    task_id: Uuid,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<u64, AppError> {
    let result = sqlx::query(
        "DELETE FROM task_completions WHERE task_id = $1 AND user_id = $2 AND completed_date = $3",
    )
    .bind(task_id)
    .bind(user_id)
    .bind(date)
    .execute(pool)
    .await
    .map_err(AppError::Database)?;
    Ok(result.rows_affected())
}

pub async fn get_completions_for_date(
    pool: &PgPool,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<Vec<Uuid>, AppError> {
    let rows: Vec<(Uuid,)> = sqlx::query_as(
        "SELECT task_id FROM task_completions WHERE user_id = $1 AND completed_date = $2",
    )
    .bind(user_id)
    .bind(date)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;
    Ok(rows.into_iter().map(|(id,)| id).collect())
}

pub async fn get_completion_dates(
    pool: &PgPool,
    task_id: Uuid,
    user_id: Uuid,
) -> Result<Vec<NaiveDate>, AppError> {
    let rows: Vec<(NaiveDate,)> = sqlx::query_as(
        "SELECT completed_date FROM task_completions WHERE task_id = $1 AND user_id = $2 ORDER BY completed_date DESC",
    )
    .bind(task_id)
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;
    Ok(rows.into_iter().map(|(d,)| d).collect())
}
