mod config;
mod cors;
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

use std::net::SocketAddr;

use tower_http::{compression::CompressionLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::{
    config::Config, cors::build_cors_layer, db::create_pool, middleware::rate_limit::RateLimiter,
    routes::create_router, state::AppState,
};

#[tokio::main]
async fn main() {
    // Immediate stdout output to debug Docker startup issues
    println!("FitPulse backend starting up...");

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "fitpulse_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Logger initialized.");

    let config = Config::from_env();
    
    let mut pool = None;
    for attempt in 1..=5 {
        tracing::info!("Connecting to database (attempt {}/5)...", attempt);
        match create_pool(&config.database_url).await {
            Ok(p) => {
                pool = Some(p);
                break;
            }
            Err(e) => {
                if attempt == 5 {
                    eprintln!("CRITICAL ERROR: Could not connect to database after 5 attempts: {}", e);
                    std::process::exit(1);
                }
                tracing::warn!("Database connection failed, retrying in 2 seconds...");
                tokio::time::sleep(std::time::Duration::from_secs(2)).await;
            }
        }
    }
    let pool = pool.unwrap();

    tracing::info!("Database connection established. Running migrations...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .unwrap_or_else(|e| {
            eprintln!("CRITICAL ERROR: Migration failed: {}", e);
            std::process::exit(1);
        });

    tracing::info!("Migrations completed successfully.");

    tracing::info!("Database migrations completed");

    let state = AppState {
        pool: pool.clone(),
        config: config.clone(),
        rate_limiter: RateLimiter::new(),
    };

    let cors = build_cors_layer(&config);

    let app = create_router(state.clone())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new());

    let port = state.config.app_port;
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port))
        .await
        .expect("Failed to bind to port");

    tracing::info!("FitPulse backend running on http://0.0.0.0:{}", port);

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .expect("Server error");
}
