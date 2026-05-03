use axum::{extract::State, Json};
use chrono::{NaiveDate, Utc};
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::AuthUser,
    models::task::*,
    services::task,
    state::AppState,
};

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
) -> Result<Json<serde_json::Value>, AppError> {
    let today = Utc::now().date_naive();
    let completed = task::toggle_task_completion(&state, task_id, auth_user.user_id, today).await?;
    Ok(Json(serde_json::json!({ "completed": completed })))
}

pub async fn get_today_tasks(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<Vec<TaskWithCompletionStatus>>, AppError> {
    let today = Utc::now().date_naive();
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
