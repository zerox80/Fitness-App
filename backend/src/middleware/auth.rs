use axum::{
    extract::{Request, State},
    http::{header, HeaderMap, Method, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    #[serde(default)]
    pub iat: usize,
}

#[derive(Clone)]
pub struct AuthUser {
    pub user_id: uuid::Uuid,
}

pub async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let token_source = match bearer_token(req.headers()) {
        Some(token) => TokenSource::Bearer(token),
        None => match session_cookie(req.headers(), &state.config.session_cookie_name) {
            Some(token) => TokenSource::Cookie(token),
            None => return Err(StatusCode::UNAUTHORIZED),
        },
    };

    if matches!(token_source, TokenSource::Cookie(_))
        && is_unsafe_method(req.method())
        && !origin_is_allowed(req.headers(), &state.config)
    {
        return Err(StatusCode::FORBIDDEN);
    }

    let token = match token_source {
        TokenSource::Bearer(token) | TokenSource::Cookie(token) => token,
    };

    let user_id = decode_user_id(token, &state.config.jwt_secret)?;

    req.extensions_mut().insert(AuthUser { user_id });

    Ok(next.run(req).await)
}

enum TokenSource<'a> {
    Bearer(&'a str),
    Cookie(&'a str),
}

fn bearer_token(headers: &HeaderMap) -> Option<&str> {
    headers
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
}

fn session_cookie<'a>(headers: &'a HeaderMap, cookie_name: &str) -> Option<&'a str> {
    headers
        .get(header::COOKIE)?
        .to_str()
        .ok()?
        .split(';')
        .find_map(|part| {
            let (name, value) = part.trim().split_once('=')?;
            (name == cookie_name).then_some(value.trim())
        })
}

fn decode_user_id(token: &str, secret: &str) -> Result<uuid::Uuid, StatusCode> {
    let validation = Validation::new(Algorithm::HS256);
    let decoding_key = DecodingKey::from_secret(secret.as_bytes());

    let token_data = decode::<Claims>(token, &decoding_key, &validation)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    uuid::Uuid::parse_str(&token_data.claims.sub).map_err(|_| StatusCode::UNAUTHORIZED)
}

fn is_unsafe_method(method: &Method) -> bool {
    matches!(
        *method,
        Method::POST | Method::PUT | Method::PATCH | Method::DELETE
    )
}

fn origin_is_allowed(headers: &HeaderMap, config: &crate::config::Config) -> bool {
    let Some(allowed_origins) = config.allowed_cors_origins() else {
        return false;
    };

    let Some(origin) = headers
        .get(header::ORIGIN)
        .and_then(|value| value.to_str().ok())
    else {
        return false;
    };

    allowed_origins.iter().any(|allowed| allowed == origin)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request, routing::get, Router};
    use jsonwebtoken::{encode, EncodingKey, Header};
    use tower::ServiceExt;

    const TEST_SECRET: &str = "test-secret-key-for-jwt";

    fn create_test_state() -> AppState {
        AppState {
            pool: sqlx::PgPool::connect_lazy("postgres://localhost/test").unwrap(),
            config: crate::config::Config {
                database_url: "postgres://localhost/test".to_string(),
                app_port: 3000,
                jwt_secret: TEST_SECRET.to_string(),
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

    fn create_token(secret: &str, sub: &str, exp: usize) -> String {
        let claims = Claims {
            sub: sub.to_string(),
            exp,
            iat: 0,
        };
        encode(
            &Header::new(Algorithm::HS256),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
        .unwrap()
    }

    fn create_app() -> Router {
        let state = create_test_state();
        Router::new()
            .route("/protected", get(|| async { "ok" }).post(|| async { "ok" }))
            .layer(axum::middleware::from_fn_with_state(state, auth_middleware))
    }

    #[tokio::test]
    async fn rejects_request_without_auth_header() {
        let app = create_app();
        let req = Request::builder()
            .uri("/protected")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn rejects_request_with_malformed_bearer_prefix() {
        let app = create_app();
        let req = Request::builder()
            .uri("/protected")
            .header("authorization", "Basic sometoken")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn rejects_expired_token() {
        let app = create_app();
        let token = create_token(TEST_SECRET, "550e8400-e29b-41d4-a716-446655440000", 0);

        let req = Request::builder()
            .uri("/protected")
            .header("authorization", format!("Bearer {}", token))
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn rejects_token_signed_with_wrong_secret() {
        let app = create_app();
        let future_exp = (chrono::Utc::now().timestamp() as usize) + 3600;
        let token = create_token(
            "wrong-secret",
            "550e8400-e29b-41d4-a716-446655440000",
            future_exp,
        );

        let req = Request::builder()
            .uri("/protected")
            .header("authorization", format!("Bearer {}", token))
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn accepts_valid_token() {
        let app = create_app();
        let future_exp = (chrono::Utc::now().timestamp() as usize) + 3600;
        let token = create_token(
            TEST_SECRET,
            "550e8400-e29b-41d4-a716-446655440000",
            future_exp,
        );

        let req = Request::builder()
            .uri("/protected")
            .header("authorization", format!("Bearer {}", token))
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn accepts_valid_session_cookie_for_safe_request() {
        let app = create_app();
        let future_exp = (chrono::Utc::now().timestamp() as usize) + 3600;
        let token = create_token(
            TEST_SECRET,
            "550e8400-e29b-41d4-a716-446655440000",
            future_exp,
        );

        let req = Request::builder()
            .uri("/protected")
            .header("cookie", format!("fitpulse_session={}", token))
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn rejects_cookie_auth_for_unsafe_request_without_allowed_origin() {
        let app = create_app();
        let future_exp = (chrono::Utc::now().timestamp() as usize) + 3600;
        let token = create_token(
            TEST_SECRET,
            "550e8400-e29b-41d4-a716-446655440000",
            future_exp,
        );

        let req = Request::builder()
            .method("POST")
            .uri("/protected")
            .header("cookie", format!("fitpulse_session={}", token))
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::FORBIDDEN);
    }

    #[tokio::test]
    async fn accepts_cookie_auth_for_unsafe_request_with_allowed_origin() {
        let mut state = create_test_state();
        state.config.cors_origin = "https://app.example.com".to_string();
        let app = Router::new()
            .route("/protected", axum::routing::post(|| async { "ok" }))
            .layer(axum::middleware::from_fn_with_state(state, auth_middleware));
        let future_exp = (chrono::Utc::now().timestamp() as usize) + 3600;
        let token = create_token(
            TEST_SECRET,
            "550e8400-e29b-41d4-a716-446655440000",
            future_exp,
        );

        let req = Request::builder()
            .method("POST")
            .uri("/protected")
            .header("origin", "https://app.example.com")
            .header("cookie", format!("fitpulse_session={}", token))
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn bearer_auth_does_not_require_origin_for_unsafe_request() {
        let app = create_app();
        let future_exp = (chrono::Utc::now().timestamp() as usize) + 3600;
        let token = create_token(
            TEST_SECRET,
            "550e8400-e29b-41d4-a716-446655440000",
            future_exp,
        );

        let req = Request::builder()
            .method("POST")
            .uri("/protected")
            .header("authorization", format!("Bearer {}", token))
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn rejects_token_with_invalid_uuid_in_sub() {
        let app = create_app();
        let future_exp = (chrono::Utc::now().timestamp() as usize) + 3600;
        let token = create_token(TEST_SECRET, "not-a-valid-uuid", future_exp);

        let req = Request::builder()
            .uri("/protected")
            .header("authorization", format!("Bearer {}", token))
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }
}
