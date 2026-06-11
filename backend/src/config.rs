use std::{env, net::IpAddr};

pub const DEFAULT_CORS_ORIGIN: &str =
    "http://localhost:4001,http://127.0.0.1:4001,http://localhost:8081,http://127.0.0.1:8081";

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub app_port: u16,
    pub jwt_secret: String,
    pub cors_origin: String,
    pub session_cookie_name: String,
    pub cookie_secure: bool,
    pub trust_proxy_headers: bool,
    pub trusted_proxy_ips: Vec<IpAddr>,
    pub ai_api_key: Option<String>,
    pub ai_api_base: String,
    pub ai_model: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            app_port: env::var("APP_PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()
                .expect("APP_PORT must be a valid u16"),
            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
            cors_origin: env::var("CORS_ORIGIN")
                .ok()
                .filter(|value| !value.trim().is_empty())
                .unwrap_or_else(|| DEFAULT_CORS_ORIGIN.to_string()),
            session_cookie_name: env::var("SESSION_COOKIE_NAME")
                .unwrap_or_else(|_| "fitpulse_session".to_string()),
            cookie_secure: parse_bool_env("COOKIE_SECURE", false),
            trust_proxy_headers: parse_bool_env("TRUST_PROXY_HEADERS", false),
            trusted_proxy_ips: parse_trusted_proxy_ips(
                &env::var("TRUSTED_PROXY_IPS").unwrap_or_else(|_| "127.0.0.1,::1".to_string()),
            ),
            ai_api_key: env::var("MOONSHOT_API_KEY").ok(),
            ai_api_base: normalize_api_base(
                &env::var("MOONSHOT_API_BASE")
                    .unwrap_or_else(|_| "https://api.moonshot.ai/v1".to_string()),
            ),
            ai_model: env::var("MOONSHOT_MODEL").unwrap_or_else(|_| "kimi-k2.6".to_string()),
        }
    }

    pub fn allowed_cors_origins(&self) -> Option<Vec<String>> {
        parse_cors_origins(&self.cors_origin)
    }
}

fn parse_bool_env(key: &str, default: bool) -> bool {
    env::var(key)
        .map(|value| {
            matches!(
                value.to_ascii_lowercase().as_str(),
                "1" | "true" | "yes" | "on"
            )
        })
        .unwrap_or(default)
}

fn parse_trusted_proxy_ips(raw: &str) -> Vec<IpAddr> {
    raw.split(',')
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(|value| {
            value
                .parse()
                .unwrap_or_else(|_| panic!("TRUSTED_PROXY_IPS contains invalid IP: {}", value))
        })
        .collect()
}

// The AI service appends "/chat/completions"; a trailing slash in the env
// var would produce a double slash in the request URL.
fn normalize_api_base(raw: &str) -> String {
    raw.trim().trim_end_matches('/').to_string()
}

pub fn parse_cors_origins(raw: &str) -> Option<Vec<String>> {
    let trimmed = raw.trim();
    if trimmed == "*" {
        return None;
    }

    let origins: Vec<String> = trimmed
        .split(',')
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
        .collect();

    if origins.is_empty() {
        None
    } else {
        Some(origins)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_cors_origin_uses_local_web_origins() {
        assert_eq!(
            parse_cors_origins(DEFAULT_CORS_ORIGIN),
            Some(vec![
                "http://localhost:4001".to_string(),
                "http://127.0.0.1:4001".to_string(),
                "http://localhost:8081".to_string(),
                "http://127.0.0.1:8081".to_string(),
            ])
        );
    }

    #[test]
    fn wildcard_cors_origin_is_explicitly_permissive() {
        assert_eq!(parse_cors_origins("*"), None);
    }

    #[test]
    fn normalize_api_base_strips_trailing_slashes_and_whitespace() {
        assert_eq!(
            normalize_api_base(" https://api.moonshot.ai/v1/ "),
            "https://api.moonshot.ai/v1"
        );
        assert_eq!(
            normalize_api_base("https://api.moonshot.ai/v1"),
            "https://api.moonshot.ai/v1"
        );
    }

    #[test]
    fn parses_comma_separated_cors_origins() {
        assert_eq!(
            parse_cors_origins(" https://app.example.com, https://admin.example.com "),
            Some(vec![
                "https://app.example.com".to_string(),
                "https://admin.example.com".to_string(),
            ])
        );
    }
}
