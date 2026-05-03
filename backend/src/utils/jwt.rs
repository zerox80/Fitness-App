use chrono::Utc;
use jsonwebtoken::{encode, EncodingKey, Header};
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::auth::Claims;

#[allow(dead_code)]
pub fn generate_token(user_id: &Uuid, secret: &str, expiry_hours: i64) -> Result<String, AppError> {
    let now = Utc::now();
    let claims = Claims {
        sub: user_id.to_string(),
        iat: now.timestamp() as usize,
        exp: (now + chrono::Duration::hours(expiry_hours)).timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| AppError::Internal)
}

#[allow(dead_code)]
pub fn generate_refresh_token(user_id: &Uuid, secret: &str) -> Result<String, AppError> {
    generate_token(user_id, secret, 24 * 7) // 7 days
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_token_returns_jwt() {
        let user_id = Uuid::new_v4();
        let token = generate_token(&user_id, "test_secret", 24).unwrap();
        let parts: Vec<&str> = token.split('.').collect();
        assert_eq!(parts.len(), 3);
    }

    #[test]
    fn test_generate_token_contains_user_id() {
        let user_id = Uuid::new_v4();
        let token = generate_token(&user_id, "test_secret", 24).unwrap();
        let parts: Vec<&str> = token.split('.').collect();
        let payload = base64_decode(parts[1]);
        let claims: serde_json::Value = serde_json::from_str(&payload).unwrap();
        assert_eq!(claims["sub"], user_id.to_string());
    }

    #[test]
    fn test_generate_token_expiry_is_future() {
        let user_id = Uuid::new_v4();
        let token = generate_token(&user_id, "test_secret", 24).unwrap();
        let parts: Vec<&str> = token.split('.').collect();
        let payload = base64_decode(parts[1]);
        let claims: serde_json::Value = serde_json::from_str(&payload).unwrap();
        let exp = claims["exp"].as_u64().unwrap();
        let now = Utc::now().timestamp() as u64;
        assert!(exp > now);
    }

    #[test]
    fn test_generate_refresh_token_has_7_day_expiry() {
        let user_id = Uuid::new_v4();
        let token = generate_refresh_token(&user_id, "test_secret").unwrap();
        let parts: Vec<&str> = token.split('.').collect();
        let payload = base64_decode(parts[1]);
        let claims: serde_json::Value = serde_json::from_str(&payload).unwrap();
        let exp = claims["exp"].as_u64().unwrap();
        let iat = claims["iat"].as_u64().unwrap();
        let diff_hours = (exp - iat) / 3600;
        assert_eq!(diff_hours, 24 * 7);
    }

    #[test]
    fn test_generate_token_different_users_different_tokens() {
        let user1 = Uuid::new_v4();
        let user2 = Uuid::new_v4();
        let token1 = generate_token(&user1, "secret", 24).unwrap();
        let token2 = generate_token(&user2, "secret", 24).unwrap();
        assert_ne!(token1, token2);
    }

    #[test]
    fn test_generate_token_different_secrets() {
        let user_id = Uuid::new_v4();
        let token1 = generate_token(&user_id, "secret1", 24).unwrap();
        let token2 = generate_token(&user_id, "secret2", 24).unwrap();
        assert_ne!(token1, token2);
    }

    fn base64_decode(s: &str) -> String {
        use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
        let bytes = URL_SAFE_NO_PAD.decode(s).unwrap_or_default();
        String::from_utf8(bytes).unwrap_or_default()
    }
}
