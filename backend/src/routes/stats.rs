use axum::{extract::State, Json};

use crate::{
    error::AppError,
    middleware::auth::AuthUser,
    models::{DailyActivity, UpdateActivityRequest, UserStats, WeeklyActivitySummary},
    services::stats,
    state::AppState,
};

pub async fn get_stats(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<UserStats>, AppError> {
    Ok(Json(stats::get_user_stats(&state, auth_user.user_id).await?))
}

pub async fn get_weekly(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<WeeklyActivitySummary>, AppError> {
    Ok(Json(
        stats::get_weekly_summary(&state, auth_user.user_id).await?,
    ))
}

pub async fn get_today_activity(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<DailyActivity>, AppError> {
    Ok(Json(
        stats::get_today_activity(&state, auth_user.user_id).await?,
    ))
}

pub async fn update_activity(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Json(req): Json<UpdateActivityRequest>,
) -> Result<Json<DailyActivity>, AppError> {
    use chrono::Utc;
    let today = Utc::now().date_naive();

    let activity = crate::repository::activity::upsert_today(
        &state.pool,
        auth_user.user_id,
        today,
        req.steps,
        req.calories,
        req.active_minutes,
        req.move_progress,
        req.exercise_progress,
        req.stand_progress,
    )
    .await?;

    Ok(Json(activity))
}
