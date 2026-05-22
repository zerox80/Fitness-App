use axum::{extract::State, Json};
use uuid::Uuid;

use crate::{
    dto::{GenerateWorkoutRequest, WorkoutFilterParams},
    error::AppError,
    middleware::auth::AuthUser,
    models::{CreateWorkoutRequest, UpdateWorkoutRequest, Workout},
    services::{ai::AiService, workout},
    state::AppState,
};

const WORKOUT_GENERATION_UNAVAILABLE_MESSAGE: &str =
    "Trainingsplanung ist gerade nicht verfuegbar.";

pub async fn generate_workout(
    State(state): State<AppState>,
    axum::Extension(_auth_user): axum::Extension<AuthUser>,
    Json(req): Json<GenerateWorkoutRequest>,
) -> Result<Json<crate::dto::GeneratedWorkout>, AppError> {
    req.validate().map_err(AppError::Validation)?;
    let ai_service = AiService::new(&state.config).map_err(workout_generation_error)?;
    let workout = ai_service
        .generate_workout(&req)
        .await
        .map_err(workout_generation_error)?;
    Ok(Json(workout))
}

fn workout_generation_error(error: anyhow::Error) -> AppError {
    tracing::error!(%error, "workout generation failed");
    AppError::Internal(WORKOUT_GENERATION_UNAVAILABLE_MESSAGE.to_string())
}

pub async fn list_workouts(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Query(filters): axum::extract::Query<WorkoutFilterParams>,
) -> Result<Json<Vec<Workout>>, AppError> {
    let workouts = workout::get_user_workouts(
        &state,
        auth_user.user_id,
        filters.category.as_deref(),
        filters.completed,
        filters.limit(),
        filters.offset(),
    )
    .await?;
    Ok(Json(workouts))
}

pub async fn get_workout(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(workout_id): axum::extract::Path<Uuid>,
) -> Result<Json<Workout>, AppError> {
    let workout = workout::get_workout_by_id(&state, workout_id, auth_user.user_id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(workout))
}

pub async fn create_workout(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Json(req): Json<CreateWorkoutRequest>,
) -> Result<Json<Workout>, AppError> {
    let workout = workout::create_workout(&state, auth_user.user_id, req).await?;
    Ok(Json(workout))
}

pub async fn update_workout(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(workout_id): axum::extract::Path<Uuid>,
    Json(req): Json<UpdateWorkoutRequest>,
) -> Result<Json<Workout>, AppError> {
    let workout = workout::update_workout(&state, workout_id, auth_user.user_id, req)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(workout))
}

pub async fn complete_workout(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(workout_id): axum::extract::Path<Uuid>,
) -> Result<Json<Workout>, AppError> {
    let workout = workout::complete_workout(&state, workout_id, auth_user.user_id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(workout))
}

pub async fn delete_workout(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(workout_id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let rows = workout::delete_workout(&state, workout_id, auth_user.user_id).await?;

    if rows == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

pub async fn delete_all_workouts(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<serde_json::Value>, AppError> {
    let rows = workout::delete_all_workouts(&state, auth_user.user_id).await?;

    Ok(Json(serde_json::json!({ "deleted": true, "count": rows })))
}
