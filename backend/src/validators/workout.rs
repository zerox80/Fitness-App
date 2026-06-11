use crate::error::AppError;
use crate::models::WorkoutExercise;

pub fn validate_workout_title(title: &str) -> Result<(), AppError> {
    if title.trim().is_empty() {
        return Err(AppError::Validation(
            "Workout title is required".to_string(),
        ));
    }
    if title.chars().count() > 200 {
        return Err(AppError::Validation(
            "Workout title must be at most 200 characters".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_workout_exercises(exercises: &[WorkoutExercise]) -> Result<(), AppError> {
    if exercises.len() > 100 {
        return Err(AppError::Validation(
            "Workout must include at most 100 exercises".to_string(),
        ));
    }

    for (index, exercise) in exercises.iter().enumerate() {
        if exercise.name.trim().is_empty() {
            return Err(AppError::Validation(format!(
                "exercises[{}].name must not be empty",
                index
            )));
        }
        if exercise.reps.trim().is_empty() {
            return Err(AppError::Validation(format!(
                "exercises[{}].reps must not be empty",
                index
            )));
        }
        if !(1..=50).contains(&exercise.sets) {
            return Err(AppError::Validation(format!(
                "exercises[{}].sets must be between 1 and 50",
                index
            )));
        }
        if !(0..=3600).contains(&exercise.rest_seconds) {
            return Err(AppError::Validation(format!(
                "exercises[{}].rest_seconds must be between 0 and 3600",
                index
            )));
        }
    }

    Ok(())
}

pub fn validate_workout_duration(minutes: i32) -> Result<(), AppError> {
    if minutes < 1 {
        return Err(AppError::Validation(
            "Duration must be at least 1 minute".to_string(),
        ));
    }
    if minutes > 1440 {
        return Err(AppError::Validation(
            "Duration must be at most 24 hours".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_intensity(intensity: &str) -> Result<(), AppError> {
    const VALID: &[&str] = &["low", "medium", "high"];
    if !VALID.contains(&intensity) {
        return Err(AppError::Validation(
            "Intensity must be one of: low, medium, high".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_category(category: &str) -> Result<(), AppError> {
    // Union of the categories the app produces (quick-start generator,
    // category filter chips, and the WorkoutType union on the frontend).
    const VALID: &[&str] = &[
        "strength",
        "cardio",
        "hiit",
        "flexibility",
        "sport",
        "recovery",
        "custom",
    ];
    if !VALID.contains(&category) {
        return Err(AppError::Validation(format!(
            "Category must be one of: {}",
            VALID.join(", ")
        )));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_workout_title_valid() {
        assert!(validate_workout_title("Push Day").is_ok());
    }

    #[test]
    fn test_validate_workout_title_empty() {
        let result = validate_workout_title("");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_workout_title_whitespace_only() {
        let result = validate_workout_title("   ");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_workout_title_max_length() {
        let title = "a".repeat(200);
        assert!(validate_workout_title(&title).is_ok());
    }

    #[test]
    fn test_validate_workout_title_too_long() {
        let title = "a".repeat(201);
        assert!(validate_workout_title(&title).is_err());
    }

    #[test]
    fn test_validate_workout_title_counts_chars_not_bytes() {
        let title = "ö".repeat(200);
        assert!(validate_workout_title(&title).is_ok());
        assert!(validate_workout_title(&"ö".repeat(201)).is_err());
    }

    #[test]
    fn test_validate_workout_title_single_char() {
        assert!(validate_workout_title("A").is_ok());
    }

    #[test]
    fn test_validate_workout_duration_valid() {
        assert!(validate_workout_duration(30).is_ok());
    }

    #[test]
    fn test_validate_workout_duration_zero() {
        assert!(validate_workout_duration(0).is_err());
    }

    #[test]
    fn test_validate_workout_duration_negative() {
        assert!(validate_workout_duration(-5).is_err());
    }

    #[test]
    fn test_validate_workout_duration_minimum() {
        assert!(validate_workout_duration(1).is_ok());
    }

    #[test]
    fn test_validate_workout_duration_maximum() {
        assert!(validate_workout_duration(1440).is_ok());
    }

    #[test]
    fn test_validate_workout_duration_over_max() {
        assert!(validate_workout_duration(1441).is_err());
    }

    #[test]
    fn test_validate_intensity_low() {
        assert!(validate_intensity("low").is_ok());
    }

    #[test]
    fn test_validate_intensity_medium() {
        assert!(validate_intensity("medium").is_ok());
    }

    #[test]
    fn test_validate_intensity_high() {
        assert!(validate_intensity("high").is_ok());
    }

    #[test]
    fn test_validate_intensity_invalid() {
        assert!(validate_intensity("extreme").is_err());
    }

    #[test]
    fn test_validate_intensity_empty() {
        assert!(validate_intensity("").is_err());
    }

    #[test]
    fn test_validate_intensity_case_sensitive() {
        assert!(validate_intensity("Low").is_err());
        assert!(validate_intensity("HIGH").is_err());
    }

    #[test]
    fn test_validate_intensity_numeric() {
        assert!(validate_intensity("1").is_err());
    }

    #[test]
    fn test_validate_category_accepts_known_categories() {
        for category in [
            "strength",
            "cardio",
            "hiit",
            "flexibility",
            "sport",
            "recovery",
            "custom",
        ] {
            assert!(validate_category(category).is_ok(), "{category}");
        }
    }

    #[test]
    fn test_validate_category_rejects_unknown_values() {
        assert!(validate_category("yoga-blast").is_err());
        assert!(validate_category("").is_err());
        assert!(validate_category("Strength").is_err());
    }

    #[test]
    fn test_validate_workout_exercises_valid() {
        let exercises = vec![WorkoutExercise {
            name: "Squat".to_string(),
            sets: 3,
            reps: "10".to_string(),
            rest_seconds: 90,
        }];

        assert!(validate_workout_exercises(&exercises).is_ok());
    }

    #[test]
    fn test_validate_workout_exercises_rejects_blank_name() {
        let exercises = vec![WorkoutExercise {
            name: " ".to_string(),
            sets: 3,
            reps: "10".to_string(),
            rest_seconds: 90,
        }];

        assert!(validate_workout_exercises(&exercises).is_err());
    }

    #[test]
    fn test_validate_workout_exercises_rejects_invalid_sets() {
        let exercises = vec![WorkoutExercise {
            name: "Squat".to_string(),
            sets: 0,
            reps: "10".to_string(),
            rest_seconds: 90,
        }];

        assert!(validate_workout_exercises(&exercises).is_err());
    }
}
