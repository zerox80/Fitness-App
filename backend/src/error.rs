use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Authentication failed: {0}")]
    Auth(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found")]
    NotFound,

    #[error("Rate limited: {0}")]
    RateLimited(String),

    #[error("Internal server error: {0}")]
    Internal(String),
}

pub fn is_unique_violation(error: &sqlx::Error) -> bool {
    error
        .as_database_error()
        .is_some_and(|db_error| db_error.kind() == sqlx::error::ErrorKind::UniqueViolation)
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match self {
            AppError::Database(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            ),
            AppError::Auth(msg) => (StatusCode::UNAUTHORIZED, msg),
            AppError::Validation(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::NotFound => (StatusCode::NOT_FOUND, "Resource not found".to_string()),
            AppError::RateLimited(msg) => (StatusCode::TOO_MANY_REQUESTS, msg),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        let body = Json(json!({ "error": message }));
        (status, body).into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::to_bytes;
    use axum::response::IntoResponse;

    #[test]
    fn test_validation_error_message() {
        let err = AppError::Validation("Invalid input".to_string());
        assert!(err.to_string().contains("Invalid input"));
    }

    #[test]
    fn test_auth_error_message() {
        let err = AppError::Auth("Bad credentials".to_string());
        assert!(err.to_string().contains("Bad credentials"));
    }

    #[test]
    fn test_not_found_error_message() {
        let err = AppError::NotFound;
        assert!(err.to_string().contains("Not found"));
    }

    #[test]
    fn test_internal_error_message() {
        let err = AppError::Internal("something broke".to_string());
        assert!(err.to_string().contains("Internal server error"));
        assert!(err.to_string().contains("something broke"));
    }

    #[test]
    fn test_rate_limited_error_message() {
        let err = AppError::RateLimited("Too many requests".to_string());
        assert!(err.to_string().contains("Rate limited"));
        assert!(err.to_string().contains("Too many requests"));
    }

    #[tokio::test]
    async fn test_validation_into_response_status() {
        let err = AppError::Validation("Invalid input".to_string());
        let response = err.into_response();
        assert_eq!(response.status(), StatusCode::BAD_REQUEST);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["error"], "Invalid input");
    }

    #[tokio::test]
    async fn test_auth_into_response_status() {
        let err = AppError::Auth("Unauthorized".to_string());
        let response = err.into_response();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["error"], "Unauthorized");
    }

    #[tokio::test]
    async fn test_not_found_into_response_status() {
        let err = AppError::NotFound;
        let response = err.into_response();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["error"], "Resource not found");
    }

    #[tokio::test]
    async fn test_internal_into_response_status() {
        let err = AppError::Internal("failure".to_string());
        let response = err.into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["error"], "failure");
    }

    #[tokio::test]
    async fn test_rate_limited_into_response_status() {
        let err = AppError::RateLimited("Too many requests".to_string());
        let response = err.into_response();
        assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["error"], "Too many requests");
    }

    #[derive(Debug)]
    struct StubDatabaseError {
        unique_violation: bool,
    }

    impl std::fmt::Display for StubDatabaseError {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "stub database error")
        }
    }

    impl std::error::Error for StubDatabaseError {}

    impl sqlx::error::DatabaseError for StubDatabaseError {
        fn message(&self) -> &str {
            "stub database error"
        }

        fn as_error(&self) -> &(dyn std::error::Error + Send + Sync + 'static) {
            self
        }

        fn as_error_mut(&mut self) -> &mut (dyn std::error::Error + Send + Sync + 'static) {
            self
        }

        fn into_error(self: Box<Self>) -> Box<dyn std::error::Error + Send + Sync + 'static> {
            self
        }

        fn kind(&self) -> sqlx::error::ErrorKind {
            if self.unique_violation {
                sqlx::error::ErrorKind::UniqueViolation
            } else {
                sqlx::error::ErrorKind::ForeignKeyViolation
            }
        }
    }

    #[test]
    fn unique_violation_is_detected() {
        let error = sqlx::Error::Database(Box::new(StubDatabaseError {
            unique_violation: true,
        }));

        assert!(is_unique_violation(&error));
    }

    #[test]
    fn other_database_errors_are_not_unique_violations() {
        let error = sqlx::Error::Database(Box::new(StubDatabaseError {
            unique_violation: false,
        }));

        assert!(!is_unique_violation(&error));
    }

    #[test]
    fn non_database_errors_are_not_unique_violations() {
        assert!(!is_unique_violation(&sqlx::Error::RowNotFound));
    }

    #[tokio::test]
    async fn test_database_error_into_response_no_leak() {
        let db_err = sqlx::Error::RowNotFound;
        let err = AppError::Database(db_err);
        let response = err.into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);

        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["error"], "Internal server error");
        let body_str = String::from_utf8_lossy(&body);
        assert!(!body_str.contains("RowNotFound"));
    }
}
