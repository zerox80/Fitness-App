use crate::error::AppError;

pub fn validate_workout_title(title: &str) -> Result<(), AppError> {
    if title.is_empty() {
        return Err(AppError::Validation(
            "Workout title is required".to_string(),
        ));
    }
    if title.len() > 200 {
        return Err(AppError::Validation(
            "Workout title must be at most 200 characters".to_string(),
        ));
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
}
