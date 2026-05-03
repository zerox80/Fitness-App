use axum::{extract::State, Json};

use crate::{
    dto::{ChangePasswordRequest, UserProfileDto},
    error::AppError,
    middleware::auth::AuthUser,
    models::UpdateUserRequest,
    repository::{activity, users},
    services::auth,
    state::AppState,
    utils::password::verify_password,
};

pub async fn get_profile(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<UserProfileDto>, AppError> {
    let user = users::find_by_id(&state.pool, auth_user.user_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let stats = activity::get_stats(&state.pool, auth_user.user_id).await.ok();

    Ok(Json(UserProfileDto {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        stats: stats.map(|s| crate::dto::UserStatsDto {
            total_workouts: s.total_workouts,
            total_minutes: s.total_minutes,
            current_streak: s.current_streak,
        }),
    }))
}

pub async fn change_password(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Json(req): Json<ChangePasswordRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user = users::find_by_id(&state.pool, auth_user.user_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let valid = verify_password(&req.current_password, &user.password_hash)?;
    if !valid {
        return Err(AppError::Auth("Current password is incorrect".to_string()));
    }

    crate::validators::user::validate_password(&req.new_password)?;

    let new_hash = crate::utils::password::hash_password(&req.new_password)?;

    sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
        .bind(&new_hash)
        .bind(auth_user.user_id)
        .execute(&state.pool)
        .await
        .map_err(AppError::Database)?;

    Ok(Json(serde_json::json!({ "updated": true })))
}
