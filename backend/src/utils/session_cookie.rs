use axum::http::HeaderValue;

use crate::{config::Config, error::AppError};

const SESSION_MAX_AGE_SECONDS: i64 = 72 * 60 * 60;

pub fn session_cookie(config: &Config, token: &str) -> Result<HeaderValue, AppError> {
    cookie_header(config, token, SESSION_MAX_AGE_SECONDS)
}

pub fn expired_session_cookie(config: &Config) -> Result<HeaderValue, AppError> {
    cookie_header(config, "", 0)
}

fn cookie_header(config: &Config, value: &str, max_age: i64) -> Result<HeaderValue, AppError> {
    let secure = if config.cookie_secure { "; Secure" } else { "" };
    let cookie = format!(
        "{}={}; Path=/; Max-Age={}; HttpOnly; SameSite=Lax{}",
        config.session_cookie_name, value, max_age, secure
    );

    HeaderValue::from_str(&cookie)
        .map_err(|_| AppError::Internal("Failed to build session cookie".to_string()))
}
