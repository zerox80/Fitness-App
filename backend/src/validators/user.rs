use crate::error::AppError;

pub fn validate_email(email: &str) -> Result<(), AppError> {
    if email.is_empty() {
        return Err(AppError::Validation("Email is required".to_string()));
    }
    if !email.contains('@') {
        return Err(AppError::Validation("Invalid email format".to_string()));
    }
    if email.len() > 254 {
        return Err(AppError::Validation("Email is too long".to_string()));
    }
    Ok(())
}

pub fn validate_password(password: &str) -> Result<(), AppError> {
    if password.len() < 6 {
        return Err(AppError::Validation(
            "Password must be at least 6 characters".to_string(),
        ));
    }
    if password.len() > 128 {
        return Err(AppError::Validation(
            "Password must be at most 128 characters".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_name(name: &str) -> Result<(), AppError> {
    if name.is_empty() {
        return Err(AppError::Validation("Name is required".to_string()));
    }
    if name.len() < 2 {
        return Err(AppError::Validation(
            "Name must be at least 2 characters".to_string(),
        ));
    }
    if name.len() > 100 {
        return Err(AppError::Validation(
            "Name must be at most 100 characters".to_string(),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // --- Email tests ---
    #[test]
    fn test_validate_email_valid() {
        assert!(validate_email("user@example.com").is_ok());
    }

    #[test]
    fn test_validate_email_empty() {
        assert!(validate_email("").is_err());
    }

    #[test]
    fn test_validate_email_no_at() {
        assert!(validate_email("userexample.com").is_err());
    }

    #[test]
    fn test_validate_email_with_at() {
        assert!(validate_email("a@b").is_ok());
    }

    #[test]
    fn test_validate_email_too_long() {
        let email = format!("{}@example.com", "a".repeat(250));
        assert!(validate_email(&email).is_err());
    }

    #[test]
    fn test_validate_email_at_boundary() {
        // 254 chars total: "a"*243 + "@x.com" = 243 + 6 = 249
        // Need exactly 254: "a"*248 + "@x.com" = 248 + 6 = 254
        let local = "a".repeat(248);
        let email = format!("{}@x.com", local);
        assert_eq!(email.len(), 254);
        assert!(validate_email(&email).is_ok());
    }

    #[test]
    fn test_validate_email_just_at() {
        assert!(validate_email("@").is_ok());
    }

    // --- Password tests ---
    #[test]
    fn test_validate_password_valid() {
        assert!(validate_password("123456").is_ok());
    }

    #[test]
    fn test_validate_password_too_short() {
        assert!(validate_password("12345").is_err());
    }

    #[test]
    fn test_validate_password_empty() {
        assert!(validate_password("").is_err());
    }

    #[test]
    fn test_validate_password_exactly_min() {
        assert!(validate_password("abcdef").is_ok());
    }

    #[test]
    fn test_validate_password_max_length() {
        let password = "a".repeat(128);
        assert!(validate_password(&password).is_ok());
    }

    #[test]
    fn test_validate_password_too_long() {
        let password = "a".repeat(129);
        assert!(validate_password(&password).is_err());
    }

    // --- Name tests ---
    #[test]
    fn test_validate_name_valid() {
        assert!(validate_name("Max Mustermann").is_ok());
    }

    #[test]
    fn test_validate_name_empty() {
        assert!(validate_name("").is_err());
    }

    #[test]
    fn test_validate_name_single_char() {
        assert!(validate_name("A").is_err());
    }

    #[test]
    fn test_validate_name_two_chars() {
        assert!(validate_name("AB").is_ok());
    }

    #[test]
    fn test_validate_name_max_length() {
        let name = "a".repeat(100);
        assert!(validate_name(&name).is_ok());
    }

    #[test]
    fn test_validate_name_too_long() {
        let name = "a".repeat(101);
        assert!(validate_name(&name).is_err());
    }

    #[test]
    fn test_validate_name_whitespace_only() {
        assert!(validate_name(" ").is_err());
    }
}
