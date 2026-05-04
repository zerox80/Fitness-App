use crate::{error::AppError, models::task::*};
use chrono::NaiveDate;
use sqlx::PgPool;
use uuid::Uuid;

pub struct CreateTaskParams<'a> {
    pub user_id: Uuid,
    pub title: &'a str,
    pub description: Option<&'a str>,
    pub recurrence: &'a TaskRecurrence,
    pub custom_days: &'a [i32],
    pub category: &'a TaskCategory,
    pub target_sets: i32,
}

pub struct UpdateTaskParams<'a> {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: Option<&'a str>,
    pub description: Option<&'a str>,
    pub recurrence: Option<&'a TaskRecurrence>,
    pub custom_days: Option<&'a [i32]>,
    pub category: Option<&'a TaskCategory>,
    pub is_active: Option<bool>,
    pub target_sets: Option<i32>,
}

pub async fn list_by_user(pool: &PgPool, user_id: Uuid) -> Result<Vec<Task>, AppError> {
    sqlx::query_as::<_, Task>(
        "SELECT * FROM tasks WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn find_by_id(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<Option<Task>, AppError> {
    sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(AppError::Database)
}

pub async fn create(pool: &PgPool, params: CreateTaskParams<'_>) -> Result<Task, AppError> {
    sqlx::query_as::<_, Task>(
        r#"
        INSERT INTO tasks (user_id, title, description, recurrence, custom_days, category, target_sets)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        "#,
    )
    .bind(params.user_id)
    .bind(params.title)
    .bind(params.description)
    .bind(params.recurrence)
    .bind(params.custom_days)
    .bind(params.category)
    .bind(params.target_sets)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn update(pool: &PgPool, params: UpdateTaskParams<'_>) -> Result<Option<Task>, AppError> {
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
            target_sets = COALESCE($9, target_sets),
            updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
        "#,
    )
    .bind(params.id)
    .bind(params.user_id)
    .bind(params.title)
    .bind(params.description)
    .bind(params.recurrence)
    .bind(params.custom_days)
    .bind(params.category)
    .bind(params.is_active)
    .bind(params.target_sets)
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
    completed_sets: i32,
) -> Result<TaskCompletion, AppError> {
    sqlx::query_as::<_, TaskCompletion>(
        r#"
        INSERT INTO task_completions (task_id, user_id, completed_date, completed_sets)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (task_id, completed_date) DO UPDATE
        SET completed_sets = EXCLUDED.completed_sets
        RETURNING *
        "#,
    )
    .bind(task_id)
    .bind(user_id)
    .bind(date)
    .bind(completed_sets)
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
) -> Result<Vec<(Uuid, i32)>, AppError> {
    let rows: Vec<(Uuid, i32)> = sqlx::query_as(
        "SELECT task_id, completed_sets FROM task_completions WHERE user_id = $1 AND completed_date = $2",
    )
    .bind(user_id)
    .bind(date)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;
    Ok(rows)
}

pub async fn get_completion_dates(
    pool: &PgPool,
    task_id: Uuid,
    user_id: Uuid,
) -> Result<Vec<NaiveDate>, AppError> {
    let rows: Vec<(NaiveDate,)> = sqlx::query_as(
        r#"
        SELECT tc.completed_date
        FROM task_completions tc
        JOIN tasks t ON t.id = tc.task_id
        WHERE tc.task_id = $1
          AND tc.user_id = $2
          AND tc.completed_sets >= t.target_sets
        ORDER BY tc.completed_date DESC
        "#,
    )
    .bind(task_id)
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;
    Ok(rows.into_iter().map(|(d,)| d).collect())
}
