use crate::error::AppError;

pub const MIN_TARGET_SETS: i32 = 1;
pub const MAX_TARGET_SETS: i32 = 50;

pub fn validate_task_title(title: &str) -> Result<(), AppError> {
    if title.trim().is_empty() {
        return Err(AppError::Validation("Task title is required".to_string()));
    }
    if title.len() > 200 {
        return Err(AppError::Validation(
            "Task title must be at most 200 characters".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_custom_days(days: &[i32]) -> Result<(), AppError> {
    if days.is_empty() {
        return Err(AppError::Validation(
            "Custom days must not be empty for custom recurrence".to_string(),
        ));
    }
    for &day in days {
        if !(0..=6).contains(&day) {
            return Err(AppError::Validation(
                "Custom days must be between 0 (Monday) and 6 (Sunday)".to_string(),
            ));
        }
    }
    let mut sorted = days.to_vec();
    sorted.sort();
    sorted.dedup();
    if sorted.len() != days.len() {
        return Err(AppError::Validation(
            "Custom days must not contain duplicates".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_target_sets(target_sets: i32) -> Result<(), AppError> {
    if !(MIN_TARGET_SETS..=MAX_TARGET_SETS).contains(&target_sets) {
        return Err(AppError::Validation(format!(
            "Target sets must be between {} and {}",
            MIN_TARGET_SETS, MAX_TARGET_SETS
        )));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_task_title_valid() {
        assert!(validate_task_title("30 Minuten joggen").is_ok());
    }

    #[test]
    fn test_validate_task_title_empty() {
        assert!(validate_task_title("").is_err());
    }

    #[test]
    fn test_validate_task_title_whitespace_only() {
        assert!(validate_task_title("   ").is_err());
    }

    #[test]
    fn test_validate_task_title_max_length() {
        let title = "a".repeat(200);
        assert!(validate_task_title(&title).is_ok());
    }

    #[test]
    fn test_validate_task_title_too_long() {
        let title = "a".repeat(201);
        assert!(validate_task_title(&title).is_err());
    }

    #[test]
    fn test_validate_custom_days_valid() {
        assert!(validate_custom_days(&[1, 3, 5]).is_ok());
    }

    #[test]
    fn test_validate_custom_days_empty() {
        assert!(validate_custom_days(&[]).is_err());
    }

    #[test]
    fn test_validate_custom_days_out_of_range() {
        assert!(validate_custom_days(&[0, 7]).is_err());
    }

    #[test]
    fn test_validate_custom_days_negative() {
        assert!(validate_custom_days(&[-1]).is_err());
    }

    #[test]
    fn test_validate_custom_days_duplicates() {
        assert!(validate_custom_days(&[1, 1, 3]).is_err());
    }

    #[test]
    fn test_validate_custom_days_all_week() {
        assert!(validate_custom_days(&[0, 1, 2, 3, 4, 5, 6]).is_ok());
    }

    #[test]
    fn test_validate_target_sets_minimum() {
        assert!(validate_target_sets(1).is_ok());
    }

    #[test]
    fn test_validate_target_sets_maximum() {
        assert!(validate_target_sets(50).is_ok());
    }

    #[test]
    fn test_validate_target_sets_zero() {
        assert!(validate_target_sets(0).is_err());
    }

    #[test]
    fn test_validate_target_sets_negative() {
        assert!(validate_target_sets(-1).is_err());
    }

    #[test]
    fn test_validate_target_sets_too_high() {
        assert!(validate_target_sets(51).is_err());
    }
}
