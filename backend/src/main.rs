mod config;
mod db;
mod dto;
mod error;
mod middleware;
mod models;
mod repository;
mod routes;
mod services;
mod state;
mod utils;
mod validators;

use axum::http::HeaderValue;
use tower_http::{compression::CompressionLayer, cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::{
    config::Config,
    db::create_pool,
    middleware::rate_limit::RateLimiter,
    routes::create_router,
    state::AppState,
};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "fitpulse_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    let pool = create_pool(&config.database_url)
        .await
        .expect("Failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    tracing::info!("Database migrations completed");

    let state = AppState {
        pool: pool.clone(),
        config: config.clone(),
        rate_limiter: RateLimiter::new(),
    };

    let cors = if config.cors_origin == "*" {
        CorsLayer::permissive()
    } else {
        let origin = config
            .cors_origin
            .parse::<HeaderValue>()
            .expect("Invalid CORS origin");
        CorsLayer::new()
            .allow_origin([origin])
            .allow_methods(tower_http::cors::Any)
            .allow_headers(tower_http::cors::Any)
    };

    let app = create_router(state.clone())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new());

    let port = state.config.app_port;
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .expect("Failed to bind to port");

    tracing::info!("FitPulse backend running on http://0.0.0.0:{}", port);

    axum::serve(listener, app)
        .await
        .expect("Server error");
}
