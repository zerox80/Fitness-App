use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub app_port: u16,
    pub jwt_secret: String,
    pub cors_origin: String,
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
        }
    }
}
