use uuid::Uuid;

use crate::{
    error::AppError,
    models::{CreateExerciseRequest, DifficultyLevel, EquipmentType, Exercise, MuscleGroup},
    repository::exercises::{self, ExerciseListFilters},
    state::AppState,
};

pub struct ListExercisesParams<'a> {
    pub user_id: Option<Uuid>,
    pub muscle_group: Option<MuscleGroup>,
    pub equipment: Option<EquipmentType>,
    pub difficulty: Option<DifficultyLevel>,
    pub search: Option<&'a str>,
    pub limit: i64,
    pub offset: i64,
}

pub async fn list_exercises(
    state: &AppState,
    params: ListExercisesParams<'_>,
) -> Result<Vec<Exercise>, AppError> {
    exercises::list_filtered(
        &state.pool,
        ExerciseListFilters {
            user_id: params.user_id,
            muscle_group: params.muscle_group,
            equipment: params.equipment,
            difficulty: params.difficulty,
            search: params.search,
            limit: params.limit,
            offset: params.offset,
        },
    )
    .await
}

pub async fn get_exercise_by_id(
    state: &AppState,
    exercise_id: Uuid,
    user_id: Option<Uuid>,
) -> Result<Option<Exercise>, AppError> {
    let ex = exercises::find_by_id(&state.pool, exercise_id).await?;
    if let Some(ref exercise) = ex {
        if exercise.is_custom && exercise.user_id != user_id {
            return Ok(None);
        }
    }
    Ok(ex)
}

pub async fn create_exercise(
    state: &AppState,
    user_id: Option<Uuid>,
    req: CreateExerciseRequest,
) -> Result<Exercise, AppError> {
    validate_exercise_name(&req.name)?;
    validate_muscle_groups(&req.muscle_groups)?;

    exercises::create(
        &state.pool,
        req.name.trim(),
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
    if let Some(name) = &req.name {
        validate_exercise_name(name)?;
    }
    if let Some(muscle_groups) = &req.muscle_groups {
        validate_muscle_groups(muscle_groups)?;
    }

    exercises::update(
        &state.pool,
        exercise_id,
        user_id,
        req.name.as_deref().map(str::trim),
        req.description
            .as_ref()
            .map(|description| description.as_deref()),
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

fn validate_exercise_name(name: &str) -> Result<(), AppError> {
    if name.trim().is_empty() || name.len() > 200 {
        return Err(AppError::Validation(
            "Exercise name must be between 1 and 200 characters".to_string(),
        ));
    }
    Ok(())
}

fn validate_muscle_groups(muscle_groups: &[MuscleGroup]) -> Result<(), AppError> {
    if muscle_groups.is_empty() {
        return Err(AppError::Validation(
            "At least one muscle group is required".to_string(),
        ));
    }
    Ok(())
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
                session_cookie_name: "fitpulse_session".to_string(),
                cookie_secure: false,
                trust_proxy_headers: false,
                trusted_proxy_ips: vec![],
                ai_api_key: None,
                ai_api_base: "https://api.moonshot.ai/v1".to_string(),
                ai_model: "kimi-k2.6".to_string(),
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

    #[tokio::test]
    async fn rejects_whitespace_only_name() {
        let state = create_test_state();
        let req = CreateExerciseRequest {
            name: "   ".to_string(),
            description: None,
            muscle_groups: vec![MuscleGroup::Chest],
            equipment: vec![EquipmentType::Barbell],
            difficulty: DifficultyLevel::Beginner,
            instructions: None,
        };

        let result = create_exercise(&state, None, req).await;
        assert!(matches!(result, Err(AppError::Validation(_))));
    }

    #[tokio::test]
    async fn update_rejects_blank_name_before_db_call() {
        let state = create_test_state();
        let req = crate::models::UpdateExerciseRequest {
            name: Some("   ".to_string()),
            description: None,
            muscle_groups: None,
            equipment: None,
            difficulty: None,
            instructions: None,
        };

        let result = update_exercise(&state, Uuid::new_v4(), Uuid::new_v4(), req).await;

        assert!(matches!(result, Err(AppError::Validation(_))));
    }

    #[tokio::test]
    async fn update_rejects_empty_muscle_groups_before_db_call() {
        let state = create_test_state();
        let req = crate::models::UpdateExerciseRequest {
            name: None,
            description: None,
            muscle_groups: Some(vec![]),
            equipment: None,
            difficulty: None,
            instructions: None,
        };

        let result = update_exercise(&state, Uuid::new_v4(), Uuid::new_v4(), req).await;

        assert!(matches!(result, Err(AppError::Validation(_))));
    }
}
