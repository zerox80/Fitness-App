use axum::{extract::State, http::header::SET_COOKIE, response::IntoResponse, Json};

use crate::{
    error::AppError,
    middleware::auth::AuthUser,
    models::{LoginRequest, RegisterRequest, UserResponse},
    repository::users,
    services::auth,
    state::AppState,
    utils::session_cookie::{expired_session_cookie, session_cookie},
};

pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<impl IntoResponse, AppError> {
    let response = auth::register(&state, req).await?;
    let cookie = session_cookie(&state.config, &response.token)?;
    Ok(([(SET_COOKIE, cookie)], Json(response)))
}

pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let response = auth::login(&state, req).await?;
    let cookie = session_cookie(&state.config, &response.token)?;
    Ok(([(SET_COOKIE, cookie)], Json(response)))
}

pub async fn logout(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    let cookie = expired_session_cookie(&state.config)?;
    Ok((
        [(SET_COOKIE, cookie)],
        Json(serde_json::json!({ "logged_out": true })),
    ))
}

pub async fn me(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<UserResponse>, AppError> {
    let user = users::find_by_id(&state.pool, auth_user.user_id)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(user.into()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::header::SET_COOKIE;

    fn test_config() -> crate::config::Config {
        crate::config::Config {
            database_url: "postgres://localhost/test".to_string(),
            app_port: 3000,
            jwt_secret: "test-secret".to_string(),
            cors_origin: "https://app.example.com".to_string(),
            session_cookie_name: "fitpulse_session".to_string(),
            cookie_secure: true,
            trust_proxy_headers: false,
            trusted_proxy_ips: vec![],
            ai_api_key: None,
            ai_api_base: "https://api.moonshot.ai/v1".to_string(),
            ai_model: "kimi-k2.6".to_string(),
        }
    }

    #[test]
    fn logout_cookie_clears_session() {
        let cookie = expired_session_cookie(&test_config()).unwrap();
        let cookie = cookie.to_str().unwrap();

        assert!(cookie.starts_with("fitpulse_session=;"));
        assert!(cookie.contains("Max-Age=0"));
        assert!(cookie.contains("HttpOnly"));
        assert!(cookie.contains("SameSite=Lax"));
        assert!(cookie.contains("Secure"));
    }

    #[test]
    fn session_cookie_sets_security_attributes() {
        let cookie = session_cookie(&test_config(), "jwt.token").unwrap();
        let cookie = cookie.to_str().unwrap();

        assert!(cookie.starts_with("fitpulse_session=jwt.token;"));
        assert!(cookie.contains("Max-Age=259200"));
        assert!(cookie.contains("HttpOnly"));
        assert!(cookie.contains("SameSite=Lax"));
        assert!(cookie.contains("Secure"));
    }

    #[test]
    fn set_cookie_header_name_is_available() {
        assert_eq!(SET_COOKIE.as_str(), "set-cookie");
    }
}
