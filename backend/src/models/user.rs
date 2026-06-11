use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub password_hash: String,
    pub password_changed_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at,
        }
    }
}

#[derive(Deserialize, Debug)]
pub struct RegisterRequest {
    pub email: String,
    pub name: String,
    pub password: String,
}

#[derive(Deserialize, Debug)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_response_from_user() {
        let user = User {
            id: Uuid::new_v4(),
            email: "test@example.com".to_string(),
            name: "Test User".to_string(),
            password_hash: "hashed_pw".to_string(),
            password_changed_at: Utc::now(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let resp: UserResponse = user.into();
        assert_eq!(resp.email, "test@example.com");
        assert_eq!(resp.name, "Test User");
    }

    #[test]
    fn test_user_response_excludes_password_hash() {
        let resp = UserResponse {
            id: Uuid::new_v4(),
            email: "a@b.com".to_string(),
            name: "A".to_string(),
            created_at: Utc::now(),
        };
        let json = serde_json::to_string(&resp).unwrap();
        assert!(!json.contains("password_hash"));
    }

    #[test]
    fn test_register_request_deserialize() {
        let json = r#"{"email":"a@b.com","name":"Test","password":"secret"}"#;
        let req: RegisterRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "a@b.com");
        assert_eq!(req.name, "Test");
        assert_eq!(req.password, "secret");
    }

    #[test]
    fn test_login_request_deserialize() {
        let json = r#"{"email":"a@b.com","password":"secret"}"#;
        let req: LoginRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "a@b.com");
        assert_eq!(req.password, "secret");
    }

    #[test]
    fn test_auth_response_serialize() {
        let resp = AuthResponse {
            token: "jwt.token.here".to_string(),
            user: UserResponse {
                id: Uuid::new_v4(),
                email: "a@b.com".to_string(),
                name: "Test".to_string(),
                created_at: Utc::now(),
            },
        };
        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("jwt.token.here"));
        assert!(json.contains("a@b.com"));
    }

}
