use axum::{extract::State, Json};

use crate::{
    error::AppError,
    middleware::auth::AuthUser,
    models::{AuthResponse, LoginRequest, RegisterRequest, UserResponse},
    repository::users,
    services::auth,
    state::AppState,
};

pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    Ok(Json(auth::register(&state, req).await?))
}

pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    Ok(Json(auth::login(&state, req).await?))
}

pub async fn me(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<UserResponse>, AppError> {
    let user = users::find_by_id(&state.pool, auth_user.user_id)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(user.into()))
}
