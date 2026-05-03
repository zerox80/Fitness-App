pub mod auth;
pub mod exercises;
pub mod stats;
pub mod tasks;
pub mod users;
pub mod workouts;

use axum::{
    middleware,
    routing::{get, post, put},
    Router,
};

use crate::{middleware::auth::auth_middleware, middleware::rate_limit::rate_limit_middleware, state::AppState};

pub fn create_router(state: AppState) -> Router {
    let public_routes = Router::new()
        .route("/api/auth/register", post(auth::register))
        .route("/api/auth/login", post(auth::login));

    let protected_routes = Router::new()
        .route("/api/auth/me", get(auth::me))
        .route("/api/users/me", get(users::get_profile))
        .route("/api/users/me/password", put(users::change_password))
        .route(
            "/api/workouts",
            get(workouts::list_workouts).post(workouts::create_workout),
        )
        .route(
            "/api/workouts/{id}",
            get(workouts::get_workout)
                .put(workouts::update_workout)
                .delete(workouts::delete_workout),
        )
        .route("/api/workouts/{id}/complete", put(workouts::complete_workout))
        .route("/api/stats", get(stats::get_stats))
        .route("/api/stats/weekly", get(stats::get_weekly))
        .route(
            "/api/activity/today",
            get(stats::get_today_activity).put(stats::update_activity),
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
        .route(
            "/api/tasks/today",
            get(tasks::get_today_tasks),
        )
        .route(
            "/api/tasks/{id}",
            get(tasks::get_task)
                .put(tasks::update_task)
                .delete(tasks::delete_task),
        )
        .route(
            "/api/tasks/{id}/toggle",
            put(tasks::toggle_completion),
        )
        .route(
            "/api/tasks/{id}/completions",
            get(tasks::get_task_completions),
        )
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(middleware::from_fn_with_state(state.clone(), rate_limit_middleware))
        .with_state(state)
}
