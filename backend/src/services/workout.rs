// use chrono::Utc;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{CreateWorkoutRequest, UpdateWorkoutRequest, Workout},
    repository::workouts,
    state::AppState,
    validators::workout::{validate_intensity, validate_workout_duration, validate_workout_title},
};

pub async fn create_workout(
    state: &AppState,
    user_id: Uuid,
    req: CreateWorkoutRequest,
) -> Result<Workout, AppError> {
    validate_workout_title(&req.title)?;
    validate_workout_duration(req.duration_minutes)?;
    validate_intensity(&req.intensity)?;

    workouts::create(
        &state.pool,
        user_id,
        &req.title,
        req.description.as_deref(),
        req.duration_minutes,
        &req.intensity,
        &req.category,
        &req.exercises,
    )
    .await
}

pub async fn update_workout(
    state: &AppState,
    workout_id: Uuid,
    user_id: Uuid,
    req: UpdateWorkoutRequest,
) -> Result<Option<Workout>, AppError> {
    if let Some(ref title) = req.title {
        validate_workout_title(title)?;
    }
    if let Some(duration) = req.duration_minutes {
        validate_workout_duration(duration)?;
    }
    if let Some(ref intensity) = req.intensity {
        validate_intensity(intensity)?;
    }

    workouts::update(
        &state.pool,
        workout_id,
        user_id,
        req.title.as_deref(),
        req.description.as_deref(),
        req.duration_minutes,
        req.intensity.as_deref(),
        req.category.as_deref(),
        req.exercises.as_deref(),
    )
    .await
}

pub async fn get_user_workouts(
    state: &AppState,
    user_id: Uuid,
    category: Option<&str>,
    completed: Option<bool>,
    limit: i64,
    offset: i64,
) -> Result<Vec<Workout>, AppError> {
    workouts::list_filtered(&state.pool, user_id, category, completed, limit, offset).await
}

pub async fn get_workout_by_id(
    state: &AppState,
    workout_id: Uuid,
    user_id: Uuid,
) -> Result<Option<Workout>, AppError> {
    workouts::find_by_id(&state.pool, workout_id, user_id).await
}

pub async fn complete_workout(
    state: &AppState,
    workout_id: Uuid,
    user_id: Uuid,
) -> Result<Option<Workout>, AppError> {
    workouts::complete(&state.pool, workout_id, user_id).await
}

pub async fn delete_workout(
    state: &AppState,
    workout_id: Uuid,
    user_id: Uuid,
) -> Result<u64, AppError> {
    workouts::delete(&state.pool, workout_id, user_id).await
}
