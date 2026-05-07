use std::{env, net::IpAddr};

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub app_port: u16,
    pub jwt_secret: String,
    pub cors_origin: String,
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
            cors_origin: env::var("CORS_ORIGIN").unwrap_or_else(|_| "*".to_string()),
            trust_proxy_headers: parse_bool_env("TRUST_PROXY_HEADERS", false),
            trusted_proxy_ips: parse_trusted_proxy_ips(
                &env::var("TRUSTED_PROXY_IPS").unwrap_or_else(|_| "127.0.0.1,::1".to_string()),
            ),
            ai_api_key: env::var("MOONSHOT_API_KEY").ok(),
            ai_api_base: env::var("MOONSHOT_API_BASE").unwrap_or_else(|_| "https://api.moonshot.ai/v1".to_string()),
            ai_model: env::var("MOONSHOT_MODEL").unwrap_or_else(|_| "kimi-k2.6".to_string()),
        }
    }
}

fn parse_bool_env(key: &str, default: bool) -> bool {
    env::var(key)
        .map(|value| matches!(value.to_ascii_lowercase().as_str(), "1" | "true" | "yes" | "on"))
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
