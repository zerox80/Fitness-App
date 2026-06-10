pub mod auth;
pub mod exercises;
pub mod stats;
pub mod tasks;
pub mod users;
pub mod workouts;

use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};

use crate::{
    middleware::auth::auth_middleware, middleware::rate_limit::rate_limit_middleware,
    state::AppState,
};

pub fn create_router(state: AppState) -> Router {
    let public_routes = Router::new()
        .route("/api/auth/register", post(auth::register))
        .route("/api/auth/login", post(auth::login))
        .route("/api/auth/logout", post(auth::logout));

    let protected_routes = Router::new()
        .route("/api/auth/me", get(auth::me))
        .route("/api/users/me", get(users::get_profile))
        .route("/api/users/me/password", put(users::change_password))
        .route(
            "/api/workouts",
            get(workouts::list_workouts)
                .post(workouts::create_workout)
                .delete(workouts::delete_all_workouts),
        )
        .route("/api/workouts/generate", post(workouts::generate_workout))
        .route(
            "/api/workouts/{id}",
            get(workouts::get_workout)
                .put(workouts::update_workout)
                .delete(workouts::delete_workout),
        )
        .route(
            "/api/workouts/{id}/complete",
            put(workouts::complete_workout),
        )
        .route("/api/stats", get(stats::get_stats))
        .route("/api/stats/weekly", get(stats::get_weekly))
        .route(
            "/api/activity/today",
            get(stats::get_today_activity).put(stats::update_activity),
        )
        .route(
            "/api/activity/entries",
            get(stats::list_activity_entries).post(stats::create_activity_entries),
        )
        .route(
            "/api/activity/entries/{id}",
            delete(stats::delete_activity_entry),
        )
        .route(
            "/api/activity/calorie-chat",
            post(stats::activity_calorie_chat),
        )
        .route(
            "/api/exercises",
            get(exercises::list_exercises).post(exercises::create_exercise),
        )
        .route(
            "/api/exercises/{id}",
            get(exercises::get_exercise)
                .put(exercises::update_exercise)
                .delete(exercises::delete_exercise),
        )
        .route(
            "/api/tasks",
            get(tasks::list_tasks).post(tasks::create_task),
        )
        .route("/api/tasks/today", get(tasks::get_today_tasks))
        .route(
            "/api/tasks/{id}",
            get(tasks::get_task)
                .put(tasks::update_task)
                .delete(tasks::delete_task),
        )
        .route("/api/tasks/{id}/toggle", put(tasks::toggle_completion))
        .route("/api/tasks/{id}/increment-set", post(tasks::increment_set))
        .route(
            "/api/tasks/{id}/completions",
            get(tasks::get_task_completions),
        )
        .layer(middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(middleware::from_fn_with_state(
            state.clone(),
            rate_limit_middleware,
        ))
        .with_state(state)
}

#[cfg(test)]
mod tests {
    use std::net::SocketAddr;

    use axum::{
        body::Body,
        extract::ConnectInfo,
        http::{Request, StatusCode},
    };
    use tower::ServiceExt;

    use super::*;

    fn test_state() -> AppState {
        AppState {
            pool: sqlx::PgPool::connect_lazy("postgres://localhost/test").unwrap(),
            config: crate::config::Config {
                database_url: "postgres://localhost/test".to_string(),
                app_port: 3000,
                jwt_secret: "test-secret".to_string(),
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

    fn request(method: &str, uri: &str) -> Request<Body> {
        Request::builder()
            .method(method)
            .uri(uri)
            // rate_limit_middleware extracts ConnectInfo, which the test
            // harness must provide since there is no real TCP connection.
            .extension(ConnectInfo(SocketAddr::from(([127, 0, 0, 1], 9999))))
            .body(Body::empty())
            .unwrap()
    }

    // Regression test: building the router panics if a route uses the
    // pre-axum-0.8 `/:param` syntax instead of `/{param}`.
    #[tokio::test]
    async fn router_builds_and_parameterized_routes_are_registered() {
        let app = create_router(test_state());

        let response = app
            .oneshot(request(
                "GET",
                "/api/workouts/550e8400-e29b-41d4-a716-446655440000",
            ))
            .await
            .unwrap();

        // 401 (not 404) proves the parameterized route matched and the
        // auth middleware rejected the unauthenticated request.
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn nested_parameterized_routes_are_registered() {
        let app = create_router(test_state());

        let response = app
            .oneshot(request(
                "PUT",
                "/api/tasks/550e8400-e29b-41d4-a716-446655440000/toggle",
            ))
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }
}
