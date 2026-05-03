use axum::{extract::State, Json};
use uuid::Uuid;

use crate::{
    dto::ExerciseFilterParams,
    error::AppError,
    middleware::auth::AuthUser,
    models::{CreateExerciseRequest, Exercise, UpdateExerciseRequest},
    services::exercise,
    state::AppState,
};

pub async fn list_exercises(
    State(state): State<AppState>,
    axum::extract::Query(filters): axum::extract::Query<ExerciseFilterParams>,
) -> Result<Json<Vec<Exercise>>, AppError> {
    let limit = filters.limit();
    let offset = filters.offset();
    let exercises = exercise::list_exercises(
        &state,
        filters.muscle_group,
        filters.equipment,
        filters.difficulty,
        filters.search.as_deref(),
        limit,
        offset,
    )
    .await?;
    Ok(Json(exercises))
}

pub async fn get_exercise(
    State(state): State<AppState>,
    axum::extract::Path(exercise_id): axum::extract::Path<Uuid>,
) -> Result<Json<Exercise>, AppError> {
    let ex = exercise::get_exercise_by_id(&state, exercise_id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(ex))
}

pub async fn create_exercise(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Json(req): Json<CreateExerciseRequest>,
) -> Result<Json<Exercise>, AppError> {
    let ex = exercise::create_exercise(&state, Some(auth_user.user_id), req).await?;
    Ok(Json(ex))
}

pub async fn update_exercise(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(exercise_id): axum::extract::Path<Uuid>,
    Json(req): Json<UpdateExerciseRequest>,
) -> Result<Json<Exercise>, AppError> {
    let ex = exercise::update_exercise(&state, exercise_id, auth_user.user_id, req)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(ex))
}

pub async fn delete_exercise(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    axum::extract::Path(exercise_id): axum::extract::Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let rows = exercise::delete_exercise(&state, exercise_id, auth_user.user_id).await?;
    if rows == 0 {
        return Err(AppError::NotFound);
    }
    Ok(Json(serde_json::json!({ "deleted": true })))
}
