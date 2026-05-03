use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use std::sync::OnceLock;

use crate::error::AppError;

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|_| AppError::Internal("Password hashing failed".to_string()))
        .map(|h| h.to_string())
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    let parsed_hash = PasswordHash::new(hash).map_err(|_| AppError::Internal("Invalid password hash".to_string()))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

#[allow(dead_code)]
pub fn dummy_hash() -> &'static PasswordHash<'static> {
    static DUMMY: OnceLock<PasswordHash<'static>> = OnceLock::new();
    DUMMY.get_or_init(|| {
        PasswordHash::new(
            "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        )
        .expect("Valid dummy hash")
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_password_returns_non_empty() {
        let hash = hash_password("test1234").unwrap();
        assert!(!hash.is_empty());
        assert!(hash.starts_with("$argon2id$"));
    }

    #[test]
    fn test_hash_password_different_salts() {
        let hash1 = hash_password("same_password").unwrap();
        let hash2 = hash_password("same_password").unwrap();
        assert_ne!(hash1, hash2);
    }

    #[test]
    fn test_verify_password_correct() {
        let password = "my_secure_password";
        let hash = hash_password(password).unwrap();
        assert!(verify_password(password, &hash).unwrap());
    }

    #[test]
    fn test_verify_password_incorrect() {
        let hash = hash_password("correct_password").unwrap();
        assert!(!verify_password("wrong_password", &hash).unwrap());
    }

    #[test]
    fn test_verify_password_invalid_hash() {
        let result = verify_password("test", "not_a_valid_hash");
        assert!(result.is_err());
    }

    #[test]
    fn test_dummy_hash_is_valid() {
        let dummy = dummy_hash();
        let hash_str = dummy.to_string();
        assert!(verify_password("anything", &hash_str).is_ok());
    }

    #[test]
    fn test_hash_password_empty_string() {
        let hash = hash_password("").unwrap();
        assert!(!hash.is_empty());
    }

    #[test]
    fn test_hash_password_long() {
        let long_password = "a".repeat(200);
        let hash = hash_password(&long_password).unwrap();
        assert!(verify_password(&long_password, &hash).unwrap());
    }

    #[test]
    fn test_hash_password_unicode() {
        let password = "Pässwört_mit_Ümläuten_🔑";
        let hash = hash_password(password).unwrap();
        assert!(verify_password(password, &hash).unwrap());
    }
}
