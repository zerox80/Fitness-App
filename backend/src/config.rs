use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub app_port: u16,
    pub jwt_secret: String,
    pub cors_origin: String,
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
            ai_api_key: env::var("MOONSHOT_API_KEY").ok(),
            ai_api_base: env::var("MOONSHOT_API_BASE").unwrap_or_else(|_| "https://api.moonshot.cn/v1".to_string()),
            ai_model: env::var("MOONSHOT_MODEL").unwrap_or_else(|_| "moonshot-v1-8k".to_string()),
        }
    }
}
