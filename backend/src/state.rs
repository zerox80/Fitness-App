use crate::config::Config;
use crate::middleware::rate_limit::RateLimiter;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: Config,
    pub rate_limiter: RateLimiter,
}
