use uuid::Uuid;

use crate::{
    error::AppError,
    models::{CreateExerciseRequest, DifficultyLevel, EquipmentType, Exercise, MuscleGroup},
    repository::exercises,
    state::AppState,
};

pub async fn list_exercises(
    state: &AppState,
    muscle_group: Option<MuscleGroup>,
    equipment: Option<EquipmentType>,
    difficulty: Option<DifficultyLevel>,
    search: Option<&str>,
    limit: i64,
    offset: i64,
) -> Result<Vec<Exercise>, AppError> {
    exercises::list_filtered(
        &state.pool,
        muscle_group,
        equipment,
        difficulty,
        search,
        limit,
        offset,
    )
    .await
}

pub async fn get_exercise_by_id(
    state: &AppState,
    exercise_id: Uuid,
) -> Result<Option<Exercise>, AppError> {
    exercises::find_by_id(&state.pool, exercise_id).await
}

pub async fn create_exercise(
    state: &AppState,
    user_id: Option<Uuid>,
    req: CreateExerciseRequest,
) -> Result<Exercise, AppError> {
    if req.name.is_empty() || req.name.len() > 200 {
        return Err(AppError::Validation(
            "Exercise name must be between 1 and 200 characters".to_string(),
        ));
    }
    if req.muscle_groups.is_empty() {
        return Err(AppError::Validation(
            "At least one muscle group is required".to_string(),
        ));
    }

    exercises::create(
        &state.pool,
        &req.name,
        req.description.as_deref(),
        &req.muscle_groups,
        &req.equipment,
        req.difficulty,
        req.instructions,
        user_id,
    )
    .await
}

pub async fn update_exercise(
    state: &AppState,
    exercise_id: Uuid,
    user_id: Uuid,
    req: crate::models::UpdateExerciseRequest,
) -> Result<Option<Exercise>, AppError> {
    exercises::update(
        &state.pool,
        exercise_id,
        user_id,
        req.name.as_deref(),
        req.description.as_deref(),
        req.muscle_groups.as_ref(),
        req.equipment.as_ref(),
        req.difficulty,
        req.instructions,
    )
    .await
}

pub async fn delete_exercise(
    state: &AppState,
    exercise_id: Uuid,
    user_id: Uuid,
) -> Result<u64, AppError> {
    exercises::delete(&state.pool, exercise_id, user_id).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{DifficultyLevel, EquipmentType, MuscleGroup};

    fn create_test_state() -> AppState {
        AppState {
            pool: sqlx::PgPool::connect_lazy("postgres://localhost/test").unwrap(),
            config: crate::config::Config {
                database_url: "postgres://localhost/test".to_string(),
                app_port: 3000,
                jwt_secret: "test-secret".to_string(),
                cors_origin: "*".to_string(),
                trust_proxy_headers: false,
                trusted_proxy_ips: vec![],
                ai_api_key: None,
                ai_api_base: "https://api.moonshot.ai/v1".to_string(),
                ai_model: "moonshot-v1-8k".to_string(),
            },
            rate_limiter: crate::middleware::rate_limit::RateLimiter::default(),
        }
    }

    #[tokio::test]
    async fn rejects_empty_name() {
        let state = create_test_state();
        let req = CreateExerciseRequest {
            name: "".to_string(),
            description: None,
            muscle_groups: vec![MuscleGroup::Chest],
            equipment: vec![EquipmentType::Barbell],
            difficulty: DifficultyLevel::Beginner,
            instructions: None,
        };

        let result = create_exercise(&state, None, req).await;
        assert!(result.is_err());
        match result.unwrap_err() {
            AppError::Validation(msg) => assert!(msg.contains("name")),
            other => panic!("Expected Validation error, got: {:?}", other),
        }
    }

    #[tokio::test]
    async fn rejects_name_over_200_chars() {
        let state = create_test_state();
        let req = CreateExerciseRequest {
            name: "A".repeat(201),
            description: None,
            muscle_groups: vec![MuscleGroup::Chest],
            equipment: vec![EquipmentType::Barbell],
            difficulty: DifficultyLevel::Beginner,
            instructions: None,
        };

        let result = create_exercise(&state, None, req).await;
        assert!(result.is_err());
        match result.unwrap_err() {
            AppError::Validation(msg) => assert!(msg.contains("name")),
            other => panic!("Expected Validation error, got: {:?}", other),
        }
    }

    #[tokio::test]
    async fn rejects_empty_muscle_groups() {
        let state = create_test_state();
        let req = CreateExerciseRequest {
            name: "Valid Exercise".to_string(),
            description: None,
            muscle_groups: vec![],
            equipment: vec![EquipmentType::Barbell],
            difficulty: DifficultyLevel::Beginner,
            instructions: None,
        };

        let result = create_exercise(&state, None, req).await;
        assert!(result.is_err());
        match result.unwrap_err() {
            AppError::Validation(msg) => assert!(msg.contains("muscle group")),
            other => panic!("Expected Validation error, got: {:?}", other),
        }
    }

    #[tokio::test]
    async fn accepts_name_at_200_chars() {
        let state = create_test_state();
        let req = CreateExerciseRequest {
            name: "A".repeat(200),
            description: None,
            muscle_groups: vec![MuscleGroup::Chest],
            equipment: vec![EquipmentType::Barbell],
            difficulty: DifficultyLevel::Beginner,
            instructions: None,
        };

        // Validation passes (DB call will fail since no real DB, but that's a different error)
        let result = create_exercise(&state, None, req).await;
        assert!(result.is_err());
        if let AppError::Validation(_) = result.unwrap_err() {
            panic!("Validation should pass for 200 chars");
        }
    }
}
