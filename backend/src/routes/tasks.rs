use axum::{
    extract::{Query, State},
    Json,
};
use chrono::{NaiveDate, Utc};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::AuthUser,
    models::task::*,
    services::task,
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct TaskDateParams {
    date: Option<NaiveDate>,
}

fn requested_task_date(params: &TaskDateParams) -> NaiveDate {
    params.date.unwrap_or_else(|| Utc::now().date_naive())
}

pub async fn list_tasks(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<Vec<Task>>, AppError> {
    let tasks = task::get_user_tasks(&state, auth_user.user_id).await?;
    Ok(Json(tasks))
}

pub async fn get_task(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(task_id): axum::extract::Path<Uuid>,
) -> Result<Json<Task>, AppError> {
    let t = task::get_task_by_id(&state, task_id, auth_user.user_id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(t))
}

pub async fn create_task(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Json(req): Json<CreateTaskRequest>,
) -> Result<Json<Task>, AppError> {
    let t = task::create_task(&state, auth_user.user_id, req).await?;
    Ok(Json(t))
}

pub async fn update_task(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(task_id): axum::extract::Path<Uuid>,
    Json(req): Json<UpdateTaskRequest>,
) -> Result<Json<Task>, AppError> {
    let t = task::update_task(&state, task_id, auth_user.user_id, req)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(t))
}

pub async fn delete_task(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(task_id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let rows = task::delete_task(&state, task_id, auth_user.user_id).await?;
    if rows == 0 {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({ "deleted": true })))
}

pub async fn toggle_completion(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(task_id): axum::extract::Path<Uuid>,
    Query(params): Query<TaskDateParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    let today = requested_task_date(&params);
    let completed = task::toggle_task_completion(&state, task_id, auth_user.user_id, today).await?;
    Ok(Json(serde_json::json!({ "completed": completed })))
}

pub async fn increment_set(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(task_id): axum::extract::Path<Uuid>,
    Query(params): Query<TaskDateParams>,
) -> Result<Json<serde_json::Value>, AppError> {
    let today = requested_task_date(&params);
    let new_sets = task::increment_task_set(&state, task_id, auth_user.user_id, today).await?;
    Ok(Json(serde_json::json!({ "completed_sets": new_sets })))
}

pub async fn get_today_tasks(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Query(params): Query<TaskDateParams>,
) -> Result<Json<Vec<TaskWithCompletionStatus>>, AppError> {
    let today = requested_task_date(&params);
    let tasks = task::get_tasks_with_completion(&state, auth_user.user_id, today).await?;
    Ok(Json(tasks))
}

pub async fn get_task_completions(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(task_id): axum::extract::Path<Uuid>,
) -> Result<Json<Vec<NaiveDate>>, AppError> {
    let dates = task::get_completion_dates(&state, task_id, auth_user.user_id).await?;
    Ok(Json(dates))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn requested_task_date_uses_query_date_when_present() {
        let date = NaiveDate::from_ymd_opt(2026, 5, 7).unwrap();
        let params = TaskDateParams { date: Some(date) };

        assert_eq!(requested_task_date(&params), date);
    }

    #[test]
    fn requested_task_date_falls_back_to_current_utc_date() {
        let params = TaskDateParams { date: None };
        let before = Utc::now().date_naive();
        let result = requested_task_date(&params);
        let after = Utc::now().date_naive();

        assert!(result >= before);
        assert!(result <= after);
    }
}
