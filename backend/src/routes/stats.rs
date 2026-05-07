use axum::{
    extract::{Query, State},
    Json,
};
use chrono::{NaiveDate, Utc};
use serde::Deserialize;

use crate::{
    error::AppError,
    middleware::auth::AuthUser,
    models::{DailyActivity, UpdateActivityRequest, UserStats, WeeklyActivitySummary},
    services::stats,
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct ActivityDateParams {
    date: Option<NaiveDate>,
}

fn requested_activity_date(params: &ActivityDateParams) -> NaiveDate {
    params.date.unwrap_or_else(|| Utc::now().date_naive())
}

pub async fn get_stats(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<UserStats>, AppError> {
    Ok(Json(
        stats::get_user_stats(&state, auth_user.user_id).await?,
    ))
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
    Query(params): Query<ActivityDateParams>,
) -> Result<Json<DailyActivity>, AppError> {
    Ok(Json(
        stats::get_activity_for_date(&state, auth_user.user_id, requested_activity_date(&params))
            .await?,
    ))
}

pub async fn update_activity(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Query(params): Query<ActivityDateParams>,
    Json(req): Json<UpdateActivityRequest>,
) -> Result<Json<DailyActivity>, AppError> {
    let activity_date = requested_activity_date(&params);

    let activity = crate::repository::activity::upsert_today(
        &state.pool,
        auth_user.user_id,
        activity_date,
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
